import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createServiceClient();

  const [microsites, entities, opportunities, jobs] = await Promise.all([
    supabase.from("microsites").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("entities").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("opportunities").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("generation_jobs").select("id", { count: "exact", head: true })
  ]);

  return NextResponse.json({
    microsites: microsites.count || 0,
    entities: entities.count || 0,
    opportunities: opportunities.count || 0,
    jobs: jobs.count || 0
  });
}
