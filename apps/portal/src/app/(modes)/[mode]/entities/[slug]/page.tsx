import { getSchemaTable, SHARED_SCHEMA } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { AppearanceList } from "@/components/entities/appearance-list";
import { CoOccurrenceChips } from "@/components/entities/co-occurrence-chips";
import { CrossLinksPanel } from "@/components/entities/cross-links-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { MODE_CONFIGS, type ModeId } from "@ritual-research/core";

interface EntityDetailPageProps {
  params: Promise<{ mode: string; slug: string }>;
}

export default async function EntityDetailPage({ params }: EntityDetailPageProps) {
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
    .select("email, name, avatar_url")
    .eq("id", user.id)
    .single();

  const userInfo = {
    email: user.email || "",
    name: profile?.name || user.user_metadata?.full_name,
    avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
  };

  const { data: userModes, error: userModesError } = await supabase
    .schema(SHARED_SCHEMA)
    .rpc("get_user_modes");

  const availableModes = Array.isArray(userModes)
    ? userModes.filter((value): value is ModeId => value in MODE_CONFIGS)
    : [];

  if (!availableModes.includes(modeId)) {
    availableModes.unshift(modeId);
  }

  const canCreateCrossLinks = !userModesError && Array.isArray(userModes);

  // Fetch entity
  const { data: entity, error: entityError } = await supabase
    .from(getSchemaTable("entities", modeId))
    .select("*")
    .eq("slug", slug)
    .single();

  if (entityError || !entity) {
    notFound();
  }

  // Fetch appearances with microsite context
  const { data: rawAppearances } = await supabase
    .from(getSchemaTable("entity_appearances", modeId))
    .select(`
      id,
      section,
      context,
      sentiment,
      created_at,
      microsites (
        id,
        slug,
        title,
        subtitle,
        created_at
      )
    `)
    .eq("entity_id", entity.id)
    .order("created_at", { ascending: false });

  type MicrositeData = {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    created_at: string;
  };

  // Transform appearances to handle Supabase array return type
  const appearances = rawAppearances?.map((app) => {
    const msData = app.microsites as MicrositeData | MicrositeData[] | null;
    const microsite = Array.isArray(msData) ? msData[0] : msData;
    return {
      id: app.id,
      section: app.section,
      context: app.context,
      sentiment: app.sentiment,
      created_at: app.created_at,
      microsites: microsite || null,
    };
  }) || [];

  // Fetch co-occurrences (bidirectional)
  const { data: relationsA } = await supabase
    .from(getSchemaTable("entity_relations", modeId))
    .select(`
      co_occurrence_count,
      entity_b:entities!entity_relations_entity_b_id_fkey (
        id,
        slug,
        canonical_name,
        type
      )
    `)
    .eq("entity_a_id", entity.id)
    .order("co_occurrence_count", { ascending: false })
    .limit(10);

  const { data: relationsB } = await supabase
    .from(getSchemaTable("entity_relations", modeId))
    .select(`
      co_occurrence_count,
      entity_a:entities!entity_relations_entity_a_id_fkey (
        id,
        slug,
        canonical_name,
        type
      )
    `)
    .eq("entity_b_id", entity.id)
    .order("co_occurrence_count", { ascending: false })
    .limit(10);

  // Combine and dedupe co-occurrences
  const coOccurrences: Array<{
    id: string;
    slug: string;
    canonical_name: string;
    type: string;
    co_occurrence_count: number;
  }> = [];

  const seen = new Set<string>();

  type EntityInfo = {
    id: string;
    slug: string;
    canonical_name: string;
    type: string;
  };

  relationsA?.forEach((r) => {
    const e = r.entity_b as EntityInfo | EntityInfo[] | null;
    const ent = Array.isArray(e) ? e[0] : e;
    if (ent && !seen.has(ent.id)) {
      seen.add(ent.id);
      coOccurrences.push({
        ...ent,
        co_occurrence_count: r.co_occurrence_count,
      });
    }
  });

  relationsB?.forEach((r) => {
    const e = r.entity_a as EntityInfo | EntityInfo[] | null;
    const ent = Array.isArray(e) ? e[0] : e;
    if (ent && !seen.has(ent.id)) {
      seen.add(ent.id);
      coOccurrences.push({
        ...ent,
        co_occurrence_count: r.co_occurrence_count,
      });
    }
  });

  // Sort by co-occurrence count
  coOccurrences.sort((a, b) => b.co_occurrence_count - a.co_occurrence_count);

  // Fetch linked opportunities
  const { data: opportunityLinks } = await supabase
    .from(getSchemaTable("opportunity_entities", modeId))
    .select(`
      relationship,
      opportunities (
        id,
        slug,
        name,
        thesis,
        confidence,
        pipeline_stages (
          name
        )
      )
    `)
    .eq("entity_id", entity.id);

  type OpportunityInfo = {
    id: string;
    slug: string;
    name: string;
    thesis: string | null;
    confidence: number | null;
    pipeline_stages: { name: string } | { name: string }[] | null;
  };

  const opportunities = opportunityLinks
    ?.map((link) => {
      const oppData = link.opportunities as OpportunityInfo | OpportunityInfo[] | null;
      const opp = Array.isArray(oppData) ? oppData[0] : oppData;
      if (!opp) return null;
      const stage = opp.pipeline_stages;
      const stageName = Array.isArray(stage) ? stage[0]?.name : stage?.name;
      return {
        id: opp.id,
        slug: opp.slug,
        name: opp.name,
        relationship: link.relationship,
        pipeline_stages: stageName ? { name: stageName } : null,
      };
    })
    .filter((o): o is NonNullable<typeof o> => o !== null) || [];

  const metadata = entity.metadata || {};
  const badgeClass =
    "bg-[color-mix(in_srgb,var(--mode-accent)_12%,transparent)] text-[var(--mode-accent)]";
  const wikiContent =
    typeof metadata.wiki_content === "string" ? metadata.wiki_content : null;
  const decisionContext =
    typeof metadata.context === "string" ? metadata.context : null;
  const decisionText =
    typeof metadata.decision === "string" ? metadata.decision : null;
  const decisionConsequences =
    typeof metadata.consequences === "string" ? metadata.consequences : null;

  const metadataFields = [
    { label: "Status", value: metadata.status },
    { label: "Owner", value: metadata.owner },
    { label: "Category", value: metadata.category },
    { label: "Type", value: metadata.type },
    { label: "Repository", value: metadata.repository },
    { label: "Asana Task", value: metadata.asana_task_id },
  ].filter((field) => field.value !== undefined && field.value !== null);

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      <Header user={userInfo} />
      <main className="p-6 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="font-mono text-xs text-[rgba(0,0,0,0.45)] mb-6">
          <Link href={`/${modeId}/entities`} className="hover:text-[var(--mode-accent)]">
            Entities
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[rgba(0,0,0,0.65)]">{entity.canonical_name}</span>
        </nav>

        {/* Header */}
        <div className="border-b border-dotted border-[color-mix(in_srgb,var(--mode-accent)_30%,transparent)] pb-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold text-[#171717]">
                {entity.canonical_name}
              </h1>
              {metadata.description && (
                <p className="font-serif text-sm italic text-[rgba(0,0,0,0.65)] mt-2 max-w-2xl">
                  {metadata.description}
                </p>
              )}
            </div>
            <Badge className={`${badgeClass} font-mono text-xs uppercase`}>
              {entity.type}
            </Badge>
          </div>

          {/* Metadata links */}
          {(metadata.url || metadata.twitter) && (
            <div className="flex items-center gap-4 mt-4">
              {metadata.url && (
                <a
                  href={metadata.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-[var(--mode-accent)] hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Website
                </a>
              )}
              {metadata.twitter && (
                <a
                  href={`https://twitter.com/${metadata.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-[var(--mode-accent)] hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />@{metadata.twitter.replace("@", "")}
                </a>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4 font-mono text-xs text-[rgba(0,0,0,0.45)]">
            <span className="uppercase tracking-[0.05em]">
              {appearances?.length || 0} appearances
            </span>
            <span className="uppercase tracking-[0.05em]">
              {coOccurrences.length} co-occurrences
            </span>
            {opportunities.length > 0 && (
              <span className="uppercase tracking-[0.05em]">
                {opportunities.length} opportunities
              </span>
            )}
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - Appearances */}
          <div className="lg:col-span-2 space-y-6">
            {wikiContent && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.65)]">
                    Wiki
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-serif text-sm whitespace-pre-wrap">
                    {wikiContent}
                  </div>
                </CardContent>
              </Card>
            )}

            {(decisionContext || decisionText || decisionConsequences) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.65)]">
                    Decision Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {decisionContext && (
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)]">
                        Context
                      </div>
                      <p className="font-serif text-sm whitespace-pre-wrap">{decisionContext}</p>
                    </div>
                  )}
                  {decisionText && (
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)]">
                        Decision
                      </div>
                      <p className="font-serif text-sm whitespace-pre-wrap">{decisionText}</p>
                    </div>
                  )}
                  {decisionConsequences && (
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)]">
                        Consequences
                      </div>
                      <p className="font-serif text-sm whitespace-pre-wrap">{decisionConsequences}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div>
              <h2 className="font-mono text-sm font-semibold uppercase tracking-[0.12em] text-[var(--mode-accent)] pb-3 mb-4 border-b border-dotted border-[color-mix(in_srgb,var(--mode-accent)_30%,transparent)]">
                Appears In
                <span className="ml-2 text-[rgba(0,0,0,0.35)] font-normal">
                  {appearances?.length || 0} sites
                </span>
              </h2>
              <AppearanceList appearances={appearances || []} modePrefix={`/${modeId}`} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Co-occurrences */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.65)]">
                  Co-occurs With
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CoOccurrenceChips coOccurrences={coOccurrences.slice(0, 10)} modePrefix={`/${modeId}`} />
              </CardContent>
            </Card>

            <CrossLinksPanel
              modeId={modeId}
              entityId={entity.id}
              entityType={entity.type}
              availableModes={availableModes}
              canCreate={canCreateCrossLinks}
            />

            {metadataFields.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.65)]">
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {metadataFields.map((field) => (
                    <div key={field.label} className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[rgba(0,0,0,0.45)] uppercase tracking-[0.05em]">
                        {field.label}
                      </span>
                      <span className="font-mono text-[rgba(0,0,0,0.65)]">
                        {Array.isArray(field.value) ? field.value.join(", ") : String(field.value)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Linked Opportunities */}
            {opportunities.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.65)]">
                    Linked Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {opportunities.map(
                      (opp: {
                        id: string;
                        slug: string;
                        name: string;
                        relationship: string;
                        pipeline_stages?: { name: string } | null;
                      }) => (
                        <Link
                          key={opp.id}
                          href={`/${modeId}/pipeline/${opp.id}`}
                          className="block p-2 -mx-2 hover:bg-[rgba(0,0,0,0.02)] transition-colors"
                        >
                          <div className="font-display text-sm font-medium">
                            {opp.name}
                          </div>
                          <div className="font-mono text-[10px] uppercase tracking-[0.05em] text-[rgba(0,0,0,0.45)] mt-1">
                            {opp.pipeline_stages?.name || "No stage"} · {opp.relationship}
                          </div>
                        </Link>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Aliases */}
            {entity.aliases && entity.aliases.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.65)]">
                    Also Known As
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {entity.aliases.map((alias: string, index: number) => (
                      <span
                        key={alias}
                        className="font-mono text-xs text-[rgba(0,0,0,0.5)]"
                      >
                        {alias}
                        {index < entity.aliases.length - 1 && ","}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
