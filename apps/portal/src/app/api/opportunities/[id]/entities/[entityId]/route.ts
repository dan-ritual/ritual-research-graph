import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/opportunities/[id]/entities/[entityId] - Unlink an entity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entityId: string }> }
) {
  const { id, entityId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get entity name for activity log
  const { data: entity } = await supabase
    .from("entities")
    .select("name")
    .eq("id", entityId)
    .single();

  // Delete link
  const { error: deleteError } = await supabase
    .from("opportunity_entities")
    .delete()
    .eq("opportunity_id", id)
    .eq("entity_id", entityId);

  if (deleteError) {
    console.error("Failed to unlink entity:", deleteError);
    return NextResponse.json({ error: "Failed to unlink entity" }, { status: 500 });
  }

  // Log activity
  await supabase.from("opportunity_activity").insert({
    opportunity_id: id,
    user_id: user.id,
    action: "entity_unlinked",
    details: { entity_id: entityId, entity_name: entity?.name || "Unknown" },
  });

  return NextResponse.json({ success: true });
}
