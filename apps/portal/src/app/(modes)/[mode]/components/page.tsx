import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EntitiesContent } from "../entities/entities-content";
import { MODE_CONFIGS, type ModeId } from "@ritual-research/core";

interface ComponentsPageProps {
  params: Promise<{ mode: string }>;
}

export default async function ComponentsPage({ params }: ComponentsPageProps) {
  const { mode } = await params;

  if (!MODE_CONFIGS[mode as ModeId]) {
    notFound();
  }

  const modeId = mode as ModeId;
  if (modeId !== "engineering") {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .schema("shared")
    .from("users")
    .select("email, name, avatar_url")
    .eq("id", user.id)
    .single();

  const userInfo = {
    email: user.email || "",
    name: profile?.name || user.user_metadata?.full_name,
    avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      <Header user={userInfo} />
      <main className="p-6 max-w-7xl mx-auto">
        <EntitiesContent
          mode={modeId}
          title="Components"
          description="Track components referenced in engineering meetings."
          defaultTypeFilter="component"
          hideTypeFilter
          emptyStateTitle="No components yet"
          emptyStateMessage="Process meeting transcripts to catalog components."
          emptyActionLabel="+ New Meeting"
          emptyActionHref={`/${modeId}/new`}
        />
      </main>
    </div>
  );
}
