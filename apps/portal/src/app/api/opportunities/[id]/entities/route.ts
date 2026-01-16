import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/opportunities/[id]/entities - Get linked entities
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: linkedEntities, error } = await supabase
    .from("opportunity_entities")
    .select(`
      relationship,
      entity:entities(id, name, type, slug)
    `)
    .eq("opportunity_id", id);

  if (error) {
    console.error("Failed to fetch linked entities:", error);
    return NextResponse.json({ error: "Failed to fetch entities" }, { status: 500 });
  }

  return NextResponse.json({
    entities: linkedEntities?.map((e) => ({
      ...e.entity,
      relationship: e.relationship,
    })) || [],
  });
}

// POST /api/opportunities/[id]/entities - Link an entity
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { entity_id, relationship = "related" } = body;

  if (!entity_id) {
    return NextResponse.json({ error: "entity_id is required" }, { status: 400 });
  }

  // Check if opportunity exists
  const { data: opportunity } = await supabase
    .from("opportunities")
    .select("id")
    .eq("id", id)
    .single();

  if (!opportunity) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }

  // Check if entity exists
  const { data: entity } = await supabase
    .from("entities")
    .select("id, name")
    .eq("id", entity_id)
    .single();

  if (!entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  // Check if already linked
  const { data: existing } = await supabase
    .from("opportunity_entities")
    .select("opportunity_id")
    .eq("opportunity_id", id)
    .eq("entity_id", entity_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Entity already linked" }, { status: 409 });
  }

  // Create link
  const { error: insertError } = await supabase
    .from("opportunity_entities")
    .insert({
      opportunity_id: id,
      entity_id,
      relationship,
    });

  if (insertError) {
    console.error("Failed to link entity:", insertError);
    return NextResponse.json({ error: "Failed to link entity" }, { status: 500 });
  }

  // Log activity
  await supabase.from("opportunity_activity").insert({
    opportunity_id: id,
    user_id: user.id,
    action: "entity_linked",
    details: { entity_id, entity_name: entity.name, relationship },
  });

  return NextResponse.json({ success: true });
}
