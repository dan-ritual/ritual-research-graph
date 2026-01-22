import { getSchemaTable, SHARED_SCHEMA } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MicrositeCard } from "@/components/features/microsite-card";
import Link from "next/link";
import { MODE_CONFIGS, type ModeId } from "@ritual-research/core";

interface MicrositesPageProps {
  params: Promise<{ mode: string }>;
}

export default async function MicrositesPage({ params }: MicrositesPageProps) {
  const { mode } = await params;
  
  // Validate mode
  if (!MODE_CONFIGS[mode as ModeId]) {
    notFound();
  }
  
  const modeId = mode as ModeId;
  
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from(getSchemaTable("users", modeId, SHARED_SCHEMA))
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch all microsites (excluding soft-deleted)
  const { data: microsites } = await supabase
    .from(getSchemaTable("microsites", modeId))
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const userInfo = {
    email: user.email || "",
    name: profile?.name || user.user_metadata?.full_name,
    avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      <Header user={userInfo} />
      <main className="p-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Microsites
            </h1>
            <p className="font-serif text-lg text-[rgba(0,0,0,0.45)] mt-1 italic">
              Browse all generated research microsites
            </p>
          </div>
          <Link href={`/${modeId}/new`}>
            <Button>+ New Research</Button>
          </Link>
        </div>

        {/* Microsites Grid with Grid Background */}
        <div className="bg-grid p-6 -mx-6">
          <div className="max-w-7xl mx-auto">
            {microsites && microsites.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {microsites.map((site) => (
                  <MicrositeCard 
                    key={site.id} 
                    microsite={site} 
                    modePrefix={`/${modeId}`}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="font-mono text-sm text-[rgba(0,0,0,0.45)] uppercase tracking-[0.05em] mb-4">
                    No microsites yet. Generate your first research to get started.
                  </p>
                  <Link href={`/${modeId}/new`}>
                    <Button>+ New Research</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
