import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /auth/callback
 * Server-side route handler for OAuth PKCE code exchange.
 * This MUST be a route handler (not a page) because:
 * 1. PKCE code verifier is stored in httpOnly cookies
 * 2. Client-side pages can't access httpOnly cookies
 * 3. Server-side route handlers can read/write cookies properly
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors from provider
  if (error) {
    const errorUrl = new URL("/auth/callback", origin);
    errorUrl.searchParams.set("auth_error", errorDescription || error);
    return NextResponse.redirect(errorUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      // Redirect to callback page with error (page.tsx will display it)
      const errorUrl = new URL("/auth/callback", origin);
      errorUrl.searchParams.set("auth_error", exchangeError.message);
      return NextResponse.redirect(errorUrl);
    }

    // Success - redirect to destination
    return NextResponse.redirect(new URL(next, origin));
  }

  // No code provided - redirect to login
  return NextResponse.redirect(new URL("/login", origin));
}
