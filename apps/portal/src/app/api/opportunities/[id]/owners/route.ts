import { getSchemaTable, resolveMode } from "@/lib/db";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/opportunities/[id]/owners - Get assigned owners
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

  const { data: owners, error } = await supabase
    .from(getSchemaTable("opportunity_owners", mode))
    .select(`
      assigned_at,
      user:users(id, name, email, avatar_url)
    `)
    .eq("opportunity_id", id);

  if (error) {
    console.error("Failed to fetch owners:", error);
    return NextResponse.json({ error: "Failed to fetch owners" }, { status: 500 });
  }

  return NextResponse.json({
    owners: owners?.map((o) => ({
      ...o.user,
      assigned_at: o.assigned_at,
    })) || [],
  });
}

// POST /api/opportunities/[id]/owners - Add an owner
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
  const { user_id } = body;

  if (!user_id) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
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

  // Check if already assigned
  const { data: existing } = await supabase
    .from(getSchemaTable("opportunity_owners", mode))
    .select("opportunity_id")
    .eq("opportunity_id", id)
    .eq("user_id", user_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "User already assigned" }, { status: 409 });
  }

  // Create assignment
  const { error: insertError } = await supabase
    .from(getSchemaTable("opportunity_owners", mode))
    .insert({
      opportunity_id: id,
      user_id,
    });

  if (insertError) {
    console.error("Failed to assign owner:", insertError);
    return NextResponse.json({ error: "Failed to assign owner" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
