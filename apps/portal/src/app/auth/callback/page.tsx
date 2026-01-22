"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * Auth callback page - displays errors or loading state.
 *
 * The actual PKCE code exchange happens in route.ts (server-side).
 * This page only renders when:
 * 1. There's an auth_error query param (error display)
 * 2. Fallback during redirect (brief loading state)
 */
function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("auth_error");

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFB]">
        <div className="text-center max-w-md px-4">
          <h1 className="font-mono text-sm uppercase tracking-[0.12em] text-destructive mb-2">AUTHENTICATION ERROR</h1>
          <p className="font-mono text-xs text-[rgba(0,0,0,0.45)] mb-4">{error}</p>
          <Link href="/login" className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--mode-accent)] border-b border-dotted border-[var(--mode-accent)]/50 hover:border-solid">
            Return to login
          </Link>
        </div>
      </div>
    );
  }

  // Brief loading state shown during redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBFB]">
      <div className="text-center">
        <div className="animate-spin h-6 w-6 border-2 border-[var(--mode-accent)] border-t-transparent mx-auto mb-4"></div>
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-[rgba(0,0,0,0.45)]">COMPLETING SIGN IN...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FBFBFB]">
          <div className="text-center">
            <div className="animate-spin h-6 w-6 border-2 border-[var(--mode-accent)] border-t-transparent mx-auto mb-4"></div>
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-[rgba(0,0,0,0.45)]">LOADING...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
