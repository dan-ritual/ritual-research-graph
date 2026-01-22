"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const next = searchParams.get("next") || "/";
    const code = searchParams.get("code");

    async function handleAuthCallback() {
      // If we have a code, exchange it for a session (PKCE flow)
      if (code) {
        console.log("[auth/callback] Exchanging code for session...");
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("[auth/callback] Exchange error:", exchangeError.message);
          setError(exchangeError.message);
          return;
        }
        console.log("[auth/callback] Exchange successful, redirecting to:", next);
        router.push(next);
        return;
      }

      // Check if session exists (might be set via URL fragment)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("[auth/callback] Session found, redirecting to:", next);
        router.push(next);
        return;
      }

      // Listen for auth state changes as fallback (handles hash fragments)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log("[auth/callback] Auth state change:", event);
        if (session) {
          router.push(next);
        }
      });

      // Timeout fallback - if no session after 10 seconds, show error
      const timeout = setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError("Authentication timed out. Please try again.");
        }
      }, 10000);

      return () => {
        subscription.unsubscribe();
        clearTimeout(timeout);
      };
    }

    handleAuthCallback();
  }, [searchParams, router]);

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
