import { getSchemaTable, SHARED_SCHEMA } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EntitiesContent } from "../entities/entities-content";
import { MODE_CONFIGS, type ModeId } from "@ritual-research/core";

interface WikiPageProps {
  params: Promise<{ mode: string }>;
}

export default async function WikiPage({ params }: WikiPageProps) {
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
    .from(getSchemaTable("users", modeId, SHARED_SCHEMA))
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
          title="Wiki"
          description="Browse topics and generated wiki pages."
          defaultTypeFilter="topic"
          hideTypeFilter
          emptyStateTitle="No topics yet"
          emptyStateMessage="Process a meeting transcript to generate wiki topics."
          emptyActionLabel="+ New Meeting"
          emptyActionHref={`/${modeId}/new`}
        />
      </main>
    </div>
  );
}
