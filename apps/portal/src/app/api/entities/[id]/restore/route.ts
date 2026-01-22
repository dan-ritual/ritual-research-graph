import { getSchemaTable, resolveMode } from "@/lib/db";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/entities/[id]/restore - Restore a soft-deleted entity
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Resolve mode from header or cookie
  const mode = await resolveMode();

  // Check if entity exists and is deleted
  const { data: entity, error: fetchError } = await supabase
    .from(getSchemaTable("entities", mode))
    .select("id, deleted_at")
    .eq("id", id)
    .single();

  if (fetchError || !entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  if (!entity.deleted_at) {
    return NextResponse.json(
      { error: "Entity is not deleted" },
      { status: 400 }
    );
  }

  // Restore
  const { error: restoreError } = await supabase
    .from(getSchemaTable("entities", mode))
    .update({ deleted_at: null })
    .eq("id", id);

  if (restoreError) {
    console.error("Failed to restore entity:", restoreError);
    return NextResponse.json(
      { error: "Failed to restore entity" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, restored: true });
}
