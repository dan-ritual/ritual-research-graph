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
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ entities: [] });
  }

  // Search entities by name (case-insensitive)
  const { data: entities, error } = await supabase
    .from("entities")
    .select("id, name, type, slug")
    .ilike("name", `%${query}%`)
    .limit(10);

  if (error) {
    console.error("Entity search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }

  return NextResponse.json({ entities: entities || [] });
}
