import { getSchemaTable, resolveMode } from "@/lib/db";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/opportunities/[id]/entities/[entityId] - Unlink an entity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entityId: string }> }
) {
  const { id, entityId } = await params;
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Resolve mode from header or cookie
  const mode = await resolveMode();

  // Delete link
  const { error: deleteError } = await supabase
    .from(getSchemaTable("opportunity_entities", mode))
    .delete()
    .eq("opportunity_id", id)
    .eq("entity_id", entityId);

  if (deleteError) {
    console.error("Failed to unlink entity:", deleteError);
    return NextResponse.json({ error: "Failed to unlink entity" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
