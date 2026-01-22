import { getSchemaTable } from "@/lib/db";
import { resolveMode } from "@/lib/db.server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const searchParams = request.nextUrl.searchParams;

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("q");

  // Resolve mode from query param, header, or cookie
  const modeParam = searchParams.get("mode") || undefined;
  const mode = await resolveMode(modeParam);

  let query = supabase
    .from(getSchemaTable("microsites", mode))
    .select("id, title, slug, visibility, created_at, generation_job_id", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Microsites list error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    microsites: data || [],
    total: count || 0,
    page,
    limit
  });
}
