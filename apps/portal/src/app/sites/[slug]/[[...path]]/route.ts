import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// MIME type mapping for common static assets
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".md": "text/markdown",
};

function getMimeType(path: string): string {
  const ext = path.substring(path.lastIndexOf(".")).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

// Cache durations
const CACHE_IMMUTABLE = "public, max-age=31536000, immutable"; // 1 year for hashed assets
const CACHE_HTML = "public, max-age=0, must-revalidate"; // Always revalidate HTML
const CACHE_DEFAULT = "public, max-age=3600"; // 1 hour for other assets

function getCacheControl(path: string): string {
  // Hashed assets (Vite style: foo.abc123.js) can be cached forever
  if (/\.[a-f0-9]{8,}\.(js|css|woff2?|ttf|png|jpg|svg)$/i.test(path)) {
    return CACHE_IMMUTABLE;
  }

  // HTML files should always be revalidated
  if (path.endsWith(".html") || path === "" || !path.includes(".")) {
    return CACHE_HTML;
  }

  return CACHE_DEFAULT;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; path?: string[] }> }
) {
  const { slug, path } = await params;

  // Use service client for microsite lookup (bypasses RLS)
  // This is needed because we need to check visibility before knowing if auth is required
  const serviceClient = createServiceClient();

  // 1. Look up microsite first (with service client to bypass RLS)
  const { data: microsite, error: msError } = await serviceClient
    .from("microsites")
    .select("id, blob_path, visibility, slug, url")
    .eq("slug", slug)
    .single();

  if (msError || !microsite) {
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head><title>Not Found</title></head>
<body style="font-family: monospace; padding: 40px; text-align: center;">
  <h1>404 - Microsite Not Found</h1>
  <p>The requested microsite "${slug}" does not exist.</p>
  <a href="/">← Back to Dashboard</a>
</body>
</html>`,
      {
        status: 404,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  // 2. Check visibility/auth - only fetch user session if needed
  let user = null;
  if (microsite.visibility === "internal") {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  // 3. Redirect to login if internal and not authenticated
  if (microsite.visibility === "internal" && !user) {
    // Redirect to login with return URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Check if blob_path is configured - if not, redirect to external URL
  if (!microsite.blob_path) {
    // If microsite has an external URL, redirect to it
    if (microsite.url) {
      const externalPath = path && path.length > 0 ? `/${path.join("/")}` : "";
      return NextResponse.redirect(`${microsite.url}${externalPath}`);
    }

    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head><title>Not Deployed</title></head>
<body style="font-family: monospace; padding: 40px; text-align: center;">
  <h1>Microsite Not Yet Deployed</h1>
  <p>This microsite exists but hasn't been uploaded to storage yet.</p>
  <a href="/microsites/${microsite.slug}">← View Microsite Details</a>
</body>
</html>`,
      {
        status: 503,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  // 5. Build the blob URL
  const blobBaseUrl = process.env.BLOB_URL;
  if (!blobBaseUrl) {
    console.error("BLOB_URL environment variable not configured");
    return new NextResponse("Storage not configured", { status: 500 });
  }

  // Default to index.html if no path provided
  const filePath = path && path.length > 0 ? path.join("/") : "index.html";
  const blobUrl = `${blobBaseUrl}/${microsite.blob_path}/${filePath}`;

  // 6. Fetch from Vercel Blob
  try {
    const blobResponse = await fetch(blobUrl, {
      // Forward relevant headers
      headers: {
        Accept: request.headers.get("Accept") || "*/*",
        "Accept-Encoding": request.headers.get("Accept-Encoding") || "gzip",
      },
    });

    if (!blobResponse.ok) {
      // If specific file not found, try index.html for SPA routing
      if (blobResponse.status === 404 && !filePath.includes(".")) {
        const indexUrl = `${blobBaseUrl}/${microsite.blob_path}/index.html`;
        const indexResponse = await fetch(indexUrl);

        if (indexResponse.ok) {
          const indexBody = await indexResponse.arrayBuffer();
          return new NextResponse(indexBody, {
            status: 200,
            headers: {
              "Content-Type": "text/html",
              "Cache-Control": CACHE_HTML,
              "X-Microsite-Slug": microsite.slug,
            },
          });
        }
      }

      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head><title>File Not Found</title></head>
<body style="font-family: monospace; padding: 40px; text-align: center;">
  <h1>404 - File Not Found</h1>
  <p>The requested file "${filePath}" was not found in this microsite.</p>
  <a href="/sites/${slug}">← Back to Microsite</a>
</body>
</html>`,
        {
          status: 404,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // 7. Return proxied response with appropriate headers
    const contentType =
      blobResponse.headers.get("Content-Type") || getMimeType(filePath);
    const cacheControl = getCacheControl(filePath);

    // Buffer the response - streaming doesn't work reliably across edge/serverless
    const body = await blobResponse.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": cacheControl,
        "X-Microsite-Slug": microsite.slug,
        // Security headers
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch (error) {
    console.error("Failed to fetch from blob storage:", error);
    return new NextResponse("Failed to load microsite", { status: 502 });
  }
}

// Handle HEAD requests for preflight/caching
export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ slug: string; path?: string[] }> }
) {
  const response = await GET(request, context);
  return new NextResponse(null, {
    status: response.status,
    headers: response.headers,
  });
}
