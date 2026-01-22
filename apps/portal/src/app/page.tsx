import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { DEFAULT_MODE_ID, MODE_CONFIGS, type ModeId } from "@ritual-research/core";
import Link from "next/link";

const COOKIE_NAME = "ritual-mode";

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Check for stored mode preference
  const cookieStore = await cookies();
  const storedMode = cookieStore.get(COOKIE_NAME)?.value as ModeId | undefined;
  const defaultMode = storedMode && MODE_CONFIGS[storedMode] ? storedMode : DEFAULT_MODE_ID;

  // Redirect to default mode dashboard
  redirect(`/${defaultMode}/dashboard`);
}
