"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loading } from "@/components/ui/loading";
import { OpportunityChat } from "@/components/pipeline/opportunity-chat";

export default function PipelineChatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      setUser({
        email: authUser.email || "",
        name: profile?.name || authUser.user_metadata?.full_name,
      });

      setLoading(false);
    }

    checkAuth();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex flex-col">
      {/* Header */}
      <header className="border-b border-[rgba(0,0,0,0.08)] bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="font-display font-semibold text-lg text-[#3B5FE6] tracking-tight"
            >
              Ritual Research Graph
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6] transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/pipeline"
                className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6] transition-colors"
              >
                Pipeline
              </Link>
              <Link
                href="/pipeline/chat"
                className="font-mono text-xs uppercase tracking-[0.08em] text-[#3B5FE6] transition-colors"
              >
                Chat
              </Link>
            </nav>
          </div>
          {user && (
            <div className="h-8 w-8 bg-[#F5F5F5] flex items-center justify-center font-mono text-xs font-medium">
              {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Page Header */}
        <div className="p-6 pb-0">
          <Link
            href="/pipeline"
            className="font-mono text-xs uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6] mb-4 inline-block transition-colors"
          >
            ← Back to Pipeline
          </Link>
          <div className="border-t border-dotted border-[rgba(59,95,230,0.3)] pt-4">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Pipeline Chat
            </h1>
            <p className="font-serif text-sm text-[rgba(0,0,0,0.45)] mt-1 italic">
              Query your opportunities using natural language
            </p>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 p-6">
          <div className="border border-[rgba(0,0,0,0.08)] bg-[#FBFBFB] h-[calc(100vh-280px)] min-h-[400px]">
            <OpportunityChat />
          </div>
        </div>
      </main>
    </div>
  );
}
