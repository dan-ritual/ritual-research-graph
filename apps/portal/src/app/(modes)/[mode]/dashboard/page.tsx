import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { MicrositeCard } from "@/components/features/microsite-card";
import Link from "next/link";
import { MODE_CONFIGS, type ModeId } from "@ritual-research/core";
import { notFound } from "next/navigation";

interface DashboardPageProps {
  params: Promise<{ mode: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { mode } = await params;
  
  // Validate mode
  if (!MODE_CONFIGS[mode as ModeId]) {
    notFound();
  }
  
  const modeId = mode as ModeId;
  const config = MODE_CONFIGS[modeId];
  
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .schema("shared")
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch stats
  const [
    { count: micrositeCount },
    { count: entityCount },
    { count: inProgressCount },
    { count: opportunityCount },
  ] = await Promise.all([
    supabase.schema(modeId).from("microsites").select("*", { count: "exact", head: true }).is("deleted_at", null),
    supabase.schema(modeId).from("entities").select("*", { count: "exact", head: true }).is("deleted_at", null),
    supabase
      .schema(modeId)
      .from("generation_jobs")
      .select("*", { count: "exact", head: true })
      .not("status", "in", '("completed","failed")'),
    supabase
      .schema(modeId)
      .from("opportunities")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  // Fetch recent jobs
  const { data: recentJobs } = await supabase
    .schema(modeId)
    .from("generation_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch recent microsites (excluding soft-deleted)
  const { data: recentMicrosites } = await supabase
    .schema(modeId)
    .from("microsites")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(4);

  let topicCount: number | null = null;
  let featureCount: number | null = null;
  let decisionCount: number | null = null;
  let componentCount: number | null = null;
  let recentDecisions: Array<{ id: string; slug: string; canonical_name: string; metadata?: Record<string, unknown> | null }> = [];
  let recentFeatures: Array<{ id: string; slug: string; canonical_name: string; metadata?: Record<string, unknown> | null }> = [];

  if (modeId === "engineering") {
    const [
      { count: topics },
      { count: features },
      { count: decisions },
      { count: components },
    ] = await Promise.all([
      supabase.schema(modeId).from("entities").select("*", { count: "exact", head: true }).eq("type", "topic"),
      supabase.schema(modeId).from("entities").select("*", { count: "exact", head: true }).eq("type", "feature"),
      supabase.schema(modeId).from("entities").select("*", { count: "exact", head: true }).eq("type", "decision"),
      supabase.schema(modeId).from("entities").select("*", { count: "exact", head: true }).eq("type", "component"),
    ]);

    topicCount = topics ?? 0;
    featureCount = features ?? 0;
    decisionCount = decisions ?? 0;
    componentCount = components ?? 0;

    const { data: decisionsList } = await supabase
      .schema(modeId)
      .from("entities")
      .select("id, slug, canonical_name, metadata")
      .eq("type", "decision")
      .order("updated_at", { ascending: false })
      .limit(5);

    const { data: featuresList } = await supabase
      .schema(modeId)
      .from("entities")
      .select("id, slug, canonical_name, metadata")
      .eq("type", "feature")
      .order("updated_at", { ascending: false })
      .limit(5);

    recentDecisions = decisionsList || [];
    recentFeatures = featuresList || [];
  }

  const userInfo = {
    email: user.email || "",
    name: profile?.name || user.user_metadata?.full_name,
    avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
  };

  const firstName = userInfo.name?.split(" ")[0] || "there";

  if (modeId === "engineering") {
    return (
      <div className="min-h-screen bg-[#FBFBFB]">
        <Header user={userInfo} />
        <main className="p-6 max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-10">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
              Welcome back, {firstName}
            </h1>
            <p className="font-serif text-lg text-[rgba(0,0,0,0.45)] mt-1">
              {config.description}
            </p>
          </div>

          {/* Stats */}
          <div className="bg-grid p-6 -mx-6 mb-10">
            <div className="max-w-7xl mx-auto grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="font-mono text-xs uppercase tracking-[0.08em]">
                    Topics
                  </CardDescription>
                  <CardTitle className="font-display text-5xl font-bold text-[var(--mode-accent)]">
                    {topicCount ?? 0}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="font-mono text-xs uppercase tracking-[0.08em]">
                    Features
                  </CardDescription>
                  <CardTitle className="font-display text-5xl font-bold text-[var(--mode-accent)]">
                    {featureCount ?? 0}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="font-mono text-xs uppercase tracking-[0.08em]">
                    Decisions
                  </CardDescription>
                  <CardTitle className="font-display text-5xl font-bold text-[var(--mode-accent)]">
                    {decisionCount ?? 0}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="font-mono text-xs uppercase tracking-[0.08em]">
                    Components
                  </CardDescription>
                  <CardTitle className="font-display text-5xl font-bold text-[var(--mode-accent)]">
                    {componentCount ?? 0}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* New Meeting CTA */}
          <Card className="mb-10">
            <CardContent className="py-8 text-center">
              <p className="font-serif text-lg text-[rgba(0,0,0,0.65)] mb-4 italic">
                Start a new meeting extraction from a Gemini transcript
              </p>
              <Link href={`/${modeId}/new`}>
                <Button size="lg" className="px-8">
                  + New Meeting
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Meetings */}
          <div className="mb-10">
            <SectionHeader>Recent Meetings</SectionHeader>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-[rgba(0,0,0,0.05)]">
                  {recentJobs && recentJobs.length > 0 ? (
                    recentJobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-mono text-sm font-medium">
                              {job.config?.title || "Untitled Meeting"}
                            </p>
                            <p className="font-mono text-xs text-[rgba(0,0,0,0.45)]">
                              {new Date(job.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <StatusBadge status={job.status} />
                          <Link href={`/${modeId}/jobs/${job.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="font-mono text-sm text-[rgba(0,0,0,0.45)] uppercase tracking-[0.05em]">
                        No meetings processed yet.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-mono text-sm uppercase tracking-[0.05em]">
                  Recent Decisions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentDecisions.length > 0 ? (
                  recentDecisions.map((decision) => (
                    <div key={decision.id} className="flex items-center justify-between">
                      <span className="font-mono text-sm">{decision.canonical_name}</span>
                      <Link href={`/${modeId}/entities/${decision.slug}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="font-mono text-xs text-[rgba(0,0,0,0.45)] uppercase tracking-[0.05em]">
                    No decisions yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-mono text-sm uppercase tracking-[0.05em]">
                  Feature Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentFeatures.length > 0 ? (
                  recentFeatures.map((feature) => {
                    const status = feature.metadata?.status;
                    return (
                      <div key={feature.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-mono text-sm">{feature.canonical_name}</div>
                          {typeof status === "string" && (
                            <div className="font-mono text-[10px] uppercase text-[rgba(0,0,0,0.45)]">
                              {status.replace(/_/g, " ")}
                            </div>
                          )}
                        </div>
                        <Link href={`/${modeId}/entities/${feature.slug}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    );
                  })
                ) : (
                  <p className="font-mono text-xs text-[rgba(0,0,0,0.45)] uppercase tracking-[0.05em]">
                    No features yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      <Header user={userInfo} />
      <main className="p-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            Welcome back, {firstName}
          </h1>
          <p className="font-serif text-lg text-[rgba(0,0,0,0.45)] mt-1">
            {config.description}
          </p>
        </div>

        {/* Stats Cards with Grid Background */}
        <div className="bg-grid p-6 -mx-6 mb-10">
          <div className="max-w-7xl mx-auto grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="font-mono text-xs uppercase tracking-[0.08em]">
                  Microsites
                </CardDescription>
                <CardTitle className="font-display text-5xl font-bold text-[var(--mode-accent)]">
                  {micrositeCount ?? 0}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="font-mono text-xs uppercase tracking-[0.08em]">
                  Entities
                </CardDescription>
                <CardTitle className="font-display text-5xl font-bold text-[var(--mode-accent)]">
                  {entityCount ?? 0}
                </CardTitle>
              </CardHeader>
            </Card>
            <Link href={`/${modeId}/pipeline`} className="block">
              <Card className="h-full hover:border-[var(--mode-accent)]/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardDescription className="font-mono text-xs uppercase tracking-[0.08em]">
                    Opportunities
                  </CardDescription>
                  <CardTitle className="font-display text-5xl font-bold text-[var(--mode-accent)]">
                    {opportunityCount ?? 0}
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="font-mono text-xs uppercase tracking-[0.08em]">
                  In Progress
                </CardDescription>
                <CardTitle className="font-display text-5xl font-bold text-[var(--mode-accent)]">
                  {inProgressCount ?? 0}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* New Research CTA */}
        <Card className="mb-10">
          <CardContent className="py-8 text-center">
            <p className="font-serif text-lg text-[rgba(0,0,0,0.65)] mb-4 italic">
              Start a new research session from your meeting transcripts
            </p>
            <Link href={`/${modeId}/new`}>
              <Button size="lg" className="px-8">
                + New Research
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <div className="mb-10">
          <SectionHeader>Recent Jobs</SectionHeader>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-[rgba(0,0,0,0.05)]">
                {recentJobs && recentJobs.length > 0 ? (
                  recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-mono text-sm font-medium">
                            {job.config?.title || "Untitled Research"}
                          </p>
                          <p className="font-mono text-xs text-[rgba(0,0,0,0.45)]">
                            {new Date(job.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <StatusBadge status={job.status} />
                        <Link href={`/${modeId}/jobs/${job.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="font-mono text-sm text-[rgba(0,0,0,0.45)] uppercase tracking-[0.05em]">
                      No jobs yet. Start by creating new research.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Microsites */}
        <div>
          <SectionHeader>Recent Microsites</SectionHeader>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {recentMicrosites && recentMicrosites.length > 0 ? (
              recentMicrosites.map((site) => (
                <MicrositeCard
                  key={site.id}
                  microsite={site}
                  variant="compact"
                  modePrefix={`/${modeId}`}
                />
              ))
            ) : (
              <Card className="md:col-span-2 lg:col-span-4">
                <CardContent className="p-8 text-center">
                  <p className="font-mono text-sm text-[rgba(0,0,0,0.45)] uppercase tracking-[0.05em]">
                    No microsites yet. Generate your first research.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
