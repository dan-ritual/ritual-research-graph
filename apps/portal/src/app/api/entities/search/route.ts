import { getSchemaTable, resolveMode } from "@/lib/db";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  // Resolve mode from query param, header, or cookie
  const modeParam = searchParams.get("mode") || undefined;
  const mode = await resolveMode(modeParam);

  if (!query || query.length < 2) {
    return NextResponse.json({ entities: [] });
  }

  // Search entities by canonical_name (case-insensitive)
  const { data: entities, error } = await supabase
    .from(getSchemaTable("entities", mode))
    .select("id, canonical_name, type, slug")
    .ilike("canonical_name", `%${query}%`)
    .limit(10);

  if (error) {
    console.error("Entity search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }

  return NextResponse.json({ entities: entities || [] });
}
