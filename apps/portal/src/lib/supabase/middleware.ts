import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // API routes handle their own auth via service client - let them through
  if (pathname.startsWith("/api/")) {
    return NextResponse.next({ request });
  }

  // Public routes that don't require auth (or handle their own auth)
  const publicPaths = ["/login", "/auth/callback", "/sites/"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Check for Supabase auth cookie (fast check, no API call)
  const hasAuthCookie = request.cookies.getAll().some((cookie) =>
    cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")
  );

  // Redirect to login if no auth cookie and not on public path
  if (!hasAuthCookie && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if has auth cookie and on login page
  if (hasAuthCookie && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
