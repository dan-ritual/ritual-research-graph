import { NextResponse } from "next/server";

// Redirect to client-side handler that has access to PKCE verifier in localStorage/cookies
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    // Redirect to client-side page that will handle code exchange
    const redirectUrl = new URL("/auth/callback", origin);
    redirectUrl.searchParams.set("code", code);
    redirectUrl.searchParams.set("next", next);
    return NextResponse.redirect(redirectUrl.toString());
  }

  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
