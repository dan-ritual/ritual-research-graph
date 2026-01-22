import { getSchemaTable, SHARED_SCHEMA } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { DeleteMicrositeButton } from "@/components/microsites/delete-button";
import { RelatedResearchPanel } from "@/components/microsites/related-research-panel";
import Link from "next/link";
import { MODE_CONFIGS, type ModeId } from "@ritual-research/core";

interface MicrositeDetailPageProps {
  params: Promise<{ mode: string; slug: string }>;
}

export default async function MicrositeDetailPage({ params }: MicrositeDetailPageProps) {
  const { mode, slug } = await params;
  
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

  // Fetch microsite by slug
  const { data: microsite, error } = await supabase
    .from(getSchemaTable("microsites", modeId))
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !microsite) {
    notFound();
  }

  // Fetch entities via entity_appearances junction table
  const { data: appearances } = await supabase
    .from(getSchemaTable("entity_appearances", modeId))
    .select(`
      entities (
        id,
        slug,
        canonical_name,
        type,
        aliases
      )
    `)
    .eq("microsite_id", microsite.id);

  // Extract unique entities from appearances
  type EntityData = {
    id: string;
    slug: string;
    canonical_name: string;
    type: string;
    aliases: string[] | null;
  };

  const entityMap = new Map<string, EntityData>();
  appearances?.forEach((app) => {
    const e = app.entities as EntityData | EntityData[] | null;
    const entity = Array.isArray(e) ? e[0] : e;
    if (entity && !entityMap.has(entity.id)) {
      entityMap.set(entity.id, entity);
    }
  });
  const entities = Array.from(entityMap.values()).sort((a, b) =>
    a.canonical_name.localeCompare(b.canonical_name)
  );

  // Fetch opportunities linked to entities in this microsite
  const entityIds = entities.map((e) => e.id);
  let linkedOpportunities: Array<{
    id: string;
    slug: string;
    name: string;
    stage: string;
    confidence: number | null;
  }> = [];

  if (entityIds.length > 0) {
    const { data: oppLinks } = await supabase
      .from(getSchemaTable("opportunity_entities", modeId))
      .select(`
        opportunities (
          id,
          slug,
          name,
          stage,
          confidence
        )
      `)
      .in("entity_id", entityIds);

    // Deduplicate opportunities
    const oppMap = new Map<string, typeof linkedOpportunities[0]>();
    oppLinks?.forEach((link) => {
      const opp = link.opportunities as typeof linkedOpportunities[0] | typeof linkedOpportunities[0][] | null;
      const opportunity = Array.isArray(opp) ? opp[0] : opp;
      if (opportunity && !oppMap.has(opportunity.id)) {
        oppMap.set(opportunity.id, opportunity);
      }
    });
    linkedOpportunities = Array.from(oppMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

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
          href={`/${modeId}/microsites`}
          className="font-mono text-xs uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)] hover:text-[var(--mode-accent)] mb-6 inline-block transition-colors"
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
              {(microsite.blob_path || microsite.url) && (
                <Link
                  href={microsite.blob_path ? `/sites/${microsite.slug}` : microsite.url}
                  target="_blank"
                >
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
                  <p className="font-display font-medium mt-1 text-[var(--mode-accent)]">
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
          <SectionHeader>Entities ({entities.length})</SectionHeader>
          <Card>
            <CardContent className="p-0">
              {entities.length > 0 ? (
                <div className="divide-y divide-[rgba(0,0,0,0.05)]">
                  {entities.map((entity) => (
                    <Link
                      key={entity.id}
                      href={`/${modeId}/entities/${entity.slug}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-[rgba(0,0,0,0.02)] transition-colors"
                    >
                      <div>
                        <p className="font-mono text-sm font-medium">{entity.canonical_name}</p>
                        <p className="font-serif text-sm text-[rgba(0,0,0,0.45)] italic">
                          {entity.type}
                          {entity.aliases && entity.aliases.length > 0 && (
                            <span className="ml-2">
                              • Also: {entity.aliases.slice(0, 3).join(", ")}
                            </span>
                          )}
                        </p>
                      </div>
                      <Badge variant="secondary">{entity.type}</Badge>
                    </Link>
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
          <RelatedResearchPanel micrositeSlug={slug} modePrefix={`/${modeId}`} />
        </div>

        {/* Linked Opportunities */}
        {linkedOpportunities.length > 0 && (
          <div className="mb-8">
            <SectionHeader>Opportunities ({linkedOpportunities.length})</SectionHeader>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-[rgba(0,0,0,0.05)]">
                  {linkedOpportunities.map((opp) => (
                    <Link
                      key={opp.id}
                      href={`/${modeId}/pipeline/${opp.slug}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-[rgba(0,0,0,0.02)] transition-colors"
                    >
                      <div>
                        <p className="font-mono text-sm font-medium">{opp.name}</p>
                        <p className="font-serif text-sm text-[rgba(0,0,0,0.45)] italic capitalize">
                          {opp.stage.replace("_", " ")}
                          {opp.confidence !== null && (
                            <span className="ml-2">
                              • {Math.round(opp.confidence * 100)}% confidence
                            </span>
                          )}
                        </p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {opp.stage.replace("_", " ")}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <DeleteMicrositeButton
            micrositeId={microsite.id}
            micrositeTitle={microsite.title}
          />
          {(microsite.blob_path || microsite.url) && (
            <Link
              href={microsite.blob_path ? `/sites/${microsite.slug}` : microsite.url}
              target="_blank"
            >
              <Button>Open Site</Button>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
