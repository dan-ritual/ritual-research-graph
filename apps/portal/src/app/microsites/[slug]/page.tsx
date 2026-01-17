import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { DeleteMicrositeButton } from "@/components/microsites/delete-button";
import { RelatedResearchPanel } from "@/components/microsites/related-research-panel";
import Link from "next/link";

interface MicrositeDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function MicrositeDetailPage({ params }: MicrositeDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch microsite by slug
  const { data: microsite, error } = await supabase
    .from("microsites")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !microsite) {
    notFound();
  }

  // Fetch related entities
  const { data: entities } = await supabase
    .from("entities")
    .select("*")
    .eq("microsite_id", microsite.id)
    .order("name");

  const userInfo = {
    email: user.email || "",
    name: profile?.name || user.user_metadata?.full_name,
    avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      <Header user={userInfo} />
      <main className="p-6 max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/microsites"
          className="font-mono text-xs uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6] mb-6 inline-block transition-colors"
        >
          ← Back to Microsites
        </Link>

        {/* Microsite Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-2">
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {microsite.title}
            </h1>
            <div className="flex items-center gap-2">
              {microsite.visibility === "internal" && (
                <Badge variant="dotted">Internal</Badge>
              )}
              {microsite.blob_path && (
                <Link href={`/sites/${microsite.slug}`} target="_blank">
                  <Button>View Site</Button>
                </Link>
              )}
            </div>
          </div>
          {microsite.subtitle && (
            <p className="font-serif text-xl text-[rgba(0,0,0,0.65)] italic">
              {microsite.subtitle}
            </p>
          )}
        </div>

        {/* Thesis Block - Centered Italic Serif */}
        {microsite.thesis && (
          <div className="thesis-text mb-8">
            {microsite.thesis}
          </div>
        )}

        {/* Metadata */}
        <div className="mb-8">
          <SectionHeader>Details</SectionHeader>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)]">
                    Created
                  </span>
                  <p className="font-display font-medium mt-1">
                    {new Date(microsite.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)]">
                    Entities
                  </span>
                  <p className="font-display font-medium mt-1 text-[#3B5FE6]">
                    {microsite.entity_count || 0}
                  </p>
                </div>
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)]">
                    Slug
                  </span>
                  <p className="font-mono text-sm mt-1">{microsite.slug}</p>
                </div>
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)]">
                    Visibility
                  </span>
                  <p className="font-display font-medium mt-1 capitalize">
                    {microsite.visibility || "internal"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Entities */}
        <div className="mb-8">
          <SectionHeader>Entities ({entities?.length || 0})</SectionHeader>
          <Card>
            <CardContent className="p-0">
              {entities && entities.length > 0 ? (
                <div className="divide-y divide-[rgba(0,0,0,0.05)]">
                  {entities.map((entity) => (
                    <div
                      key={entity.id}
                      className="flex items-center justify-between px-6 py-4"
                    >
                      <div>
                        <p className="font-mono text-sm font-medium">{entity.name}</p>
                        <p className="font-serif text-sm text-[rgba(0,0,0,0.45)] italic">
                          {entity.type}
                          {entity.aliases?.length > 0 && (
                            <span className="ml-2">
                              • Also: {entity.aliases.slice(0, 3).join(", ")}
                            </span>
                          )}
                        </p>
                      </div>
                      <Badge variant="secondary">{entity.type}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="font-mono text-sm text-[rgba(0,0,0,0.45)] uppercase tracking-[0.05em]">
                    No entities extracted yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Related Research */}
        <div className="mb-8">
          <SectionHeader>Related Research</SectionHeader>
          <RelatedResearchPanel micrositeSlug={slug} />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <DeleteMicrositeButton
            micrositeId={microsite.id}
            micrositeTitle={microsite.title}
          />
          {microsite.blob_path && (
            <Link href={`/sites/${microsite.slug}`} target="_blank">
              <Button>Open Site</Button>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
