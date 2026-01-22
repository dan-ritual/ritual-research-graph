import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EntitiesContent } from "../entities/entities-content";
import { MODE_CONFIGS, type ModeId } from "@ritual-research/core";

interface DecisionsPageProps {
  params: Promise<{ mode: string }>;
}

export default async function DecisionsPage({ params }: DecisionsPageProps) {
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
          title="Decisions"
          description="Track decisions captured from engineering meetings."
          defaultTypeFilter="decision"
          hideTypeFilter
          emptyStateTitle="No decisions yet"
          emptyStateMessage="Process meeting transcripts to build your decision log."
          emptyActionLabel="+ New Meeting"
          emptyActionHref={`/${modeId}/new`}
        />
      </main>
    </div>
  );
}
