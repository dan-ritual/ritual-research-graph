import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  const sort = searchParams.get("sort") || "appearance_count";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const offset = (page - 1) * limit;

  // Build query
  let dbQuery = supabase
    .from("entities")
    .select("*", { count: "exact" })
    .is("deleted_at", null);

  // Apply search filter
  if (query && query.length >= 2) {
    dbQuery = dbQuery.ilike("canonical_name", `%${query}%`);
  }

  // Apply type filter
  if (type && type !== "all") {
    dbQuery = dbQuery.eq("type", type);
  }

  // Apply sorting
  switch (sort) {
    case "name":
      dbQuery = dbQuery.order("canonical_name", { ascending: true });
      break;
    case "updated":
      dbQuery = dbQuery.order("updated_at", { ascending: false });
      break;
    case "appearance_count":
    default:
      dbQuery = dbQuery.order("appearance_count", { ascending: false });
      break;
  }

  // Apply pagination
  dbQuery = dbQuery.range(offset, offset + limit - 1);

  const { data: entities, error, count } = await dbQuery;

  if (error) {
    console.error("Entity list error:", error);
    return NextResponse.json({ error: "Failed to fetch entities" }, { status: 500 });
  }

  return NextResponse.json({
    entities: entities || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}
