import { getSchemaTable } from "@/lib/db";
import { resolveMode } from "@/lib/db.server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/opportunities/[id]/entities - Get linked entities
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Resolve mode from query param, header, or cookie
  const modeParam = request.nextUrl.searchParams.get("mode") || undefined;
  const mode = await resolveMode(modeParam);

  const { data: linkedEntities, error } = await supabase
    .from(getSchemaTable("opportunity_entities", mode))
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
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Resolve mode from header or cookie
  const mode = await resolveMode();

  const body = await request.json();
  const { entity_id, relationship = "related" } = body;

  if (!entity_id) {
    return NextResponse.json({ error: "entity_id is required" }, { status: 400 });
  }

  // Check if opportunity exists
  const { data: opportunity } = await supabase
    .from(getSchemaTable("opportunities", mode))
    .select("id")
    .eq("id", id)
    .single();

  if (!opportunity) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }

  // Check if entity exists
  const { data: entity } = await supabase
    .from(getSchemaTable("entities", mode))
    .select("id, name")
    .eq("id", entity_id)
    .single();

  if (!entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  // Check if already linked
  const { data: existing } = await supabase
    .from(getSchemaTable("opportunity_entities", mode))
    .select("opportunity_id")
    .eq("opportunity_id", id)
    .eq("entity_id", entity_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Entity already linked" }, { status: 409 });
  }

  // Create link
  const { error: insertError } = await supabase
    .from(getSchemaTable("opportunity_entities", mode))
    .insert({
      opportunity_id: id,
      entity_id,
      relationship,
    });

  if (insertError) {
    console.error("Failed to link entity:", insertError);
    return NextResponse.json({ error: "Failed to link entity" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
