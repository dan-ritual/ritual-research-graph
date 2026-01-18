import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const searchParams = request.nextUrl.searchParams;

  const stage = searchParams.get("stage");
  const search = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  let query = supabase
    .from("opportunities")
    .select(`
      id, name, stage, priority, created_at, updated_at,
      opportunity_owners(user_id, users(email))
    `, { count: "exact" })
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (stage) {
    query = query.eq("stage", stage);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Opportunities list error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    opportunities: data || [],
    total: count || 0,
    page,
    limit
  });
}
