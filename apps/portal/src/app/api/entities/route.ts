import { resolveMode } from "@/lib/db.server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log("[entities] Starting request");

  try {
    // Middleware already handles auth - use service client for fast DB access
    console.log("[entities] Creating service client...");
    const supabase = createServiceClient();
    console.log("[entities] Service client created:", Date.now() - startTime, "ms");

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "";
    const sort = searchParams.get("sort") || "appearance_count";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;
    
    // Resolve mode from query param, header, or cookie
    const modeParam = searchParams.get("mode") || undefined;
    const mode = await resolveMode(modeParam);

    // Build query using schema selector for proper PostgREST schema access
    let dbQuery = supabase
      .schema(mode)
      .from("entities")
      .select("*", { count: "exact" });

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

    console.log("[entities] Executing query...");
    const { data: entities, error, count } = await dbQuery;
    console.log("[entities] Query complete:", Date.now() - startTime, "ms");

    if (error) {
      console.error("[entities] Query error:", error);
      return NextResponse.json({ error: "Failed to fetch entities" }, { status: 500 });
    }

    console.log("[entities] Success, returning", entities?.length, "entities");
    return NextResponse.json({
      entities: entities || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err) {
    console.error("[entities] Caught exception:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
