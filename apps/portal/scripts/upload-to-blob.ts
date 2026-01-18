import { put } from "@vercel/blob";
import * as fs from "fs";
import * as path from "path";

async function uploadToBlob(sourceDir: string, micrositeSlug: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Missing BLOB_READ_WRITE_TOKEN");
    process.exit(1);
  }

  const blobPath = `microsites/${micrositeSlug}`;
  const uploadedFiles: { path: string; url: string }[] = [];

  async function uploadDir(dir: string, prefix: string = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const blobName = `${blobPath}${prefix}/${entry.name}`;

      if (entry.isDirectory()) {
        await uploadDir(fullPath, `${prefix}/${entry.name}`);
      } else {
        const content = fs.readFileSync(fullPath);
        const contentType = getContentType(entry.name);

        console.log(`Uploading: ${blobName}`);
        const blob = await put(blobName, content, {
          access: "public",
          contentType,
          addRandomSuffix: false,
        });
        uploadedFiles.push({ path: blobName, url: blob.url });
      }
    }
  }

  await uploadDir(sourceDir);

  console.log(`\n✅ Success! Uploaded ${uploadedFiles.length} files to blob_path: ${blobPath}`);
  console.log("\nUploaded files:");
  uploadedFiles.forEach((f) => console.log(`  ${f.path} -> ${f.url}`));

  console.log(`\nBase URL: https://ifbfme6xsobutr4b.public.blob.vercel-storage.com/${blobPath}`);
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const types: Record<string, string> = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
  };
  return types[ext] || "application/octet-stream";
}

// Run
const sourceDir = process.argv[2];
const slug = process.argv[3];

if (!sourceDir || !slug) {
  console.log("Usage: npx tsx scripts/upload-to-blob.ts <source-dir> <microsite-slug>");
  process.exit(1);
}

uploadToBlob(sourceDir, slug);
