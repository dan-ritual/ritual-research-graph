"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const next = searchParams.get("next") || "/";

    // Listen for auth state changes - this catches when Supabase finishes processing the URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push(next);
      }
    });

    // Also check if session already exists (e.g., on page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push(next);
      }
    });

    // Timeout fallback - if no session after 5 seconds, show error
    const timeout = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          setError("Authentication timed out. Please try again.");
        }
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFB]">
        <div className="text-center">
          <h1 className="font-mono text-sm uppercase tracking-[0.12em] text-destructive mb-2">AUTHENTICATION ERROR</h1>
          <p className="font-mono text-xs text-[rgba(0,0,0,0.45)] mb-4">{error}</p>
          <a href="/login" className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--mode-accent)] border-b border-dotted border-[var(--mode-accent)]/50 hover:border-solid">
            Return to login
          </a>
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
