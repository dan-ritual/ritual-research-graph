import { resolveMode } from "@/lib/db.server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();

  // Resolve mode from query param, header, or cookie
  const modeParam = request.nextUrl.searchParams.get("mode") || undefined;
  const mode = await resolveMode(modeParam);

  // Use .schema() for proper PostgREST schema selection
  const schemaClient = supabase.schema(mode);

  const [microsites, entities, opportunities, jobs] = await Promise.all([
    schemaClient.from("microsites").select("id", { count: "exact", head: true }).is("deleted_at", null),
    schemaClient.from("entities").select("id", { count: "exact", head: true }).is("deleted_at", null),
    schemaClient.from("opportunities").select("id", { count: "exact", head: true }).is("deleted_at", null),
    schemaClient.from("generation_jobs").select("id", { count: "exact", head: true })
  ]);

  return NextResponse.json({
    microsites: microsites.count || 0,
    entities: entities.count || 0,
    opportunities: opportunities.count || 0,
    jobs: jobs.count || 0
  });
}
