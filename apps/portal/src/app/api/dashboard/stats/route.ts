import { getSchemaTable, resolveMode } from "@/lib/db";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();

  // Resolve mode from query param, header, or cookie
  const modeParam = request.nextUrl.searchParams.get("mode") || undefined;
  const mode = await resolveMode(modeParam);

  const [microsites, entities, opportunities, jobs] = await Promise.all([
    supabase.from(getSchemaTable("microsites", mode)).select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from(getSchemaTable("entities", mode)).select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from(getSchemaTable("opportunities", mode)).select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from(getSchemaTable("generation_jobs", mode)).select("id", { count: "exact", head: true })
  ]);

  return NextResponse.json({
    microsites: microsites.count || 0,
    entities: entities.count || 0,
    opportunities: opportunities.count || 0,
    jobs: jobs.count || 0
  });
}
