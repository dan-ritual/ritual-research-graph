import { getSchemaTable, resolveMode } from "@/lib/db";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/opportunities/[id]/owners/[userId] - Remove an owner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params;
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Resolve mode from header or cookie
  const mode = await resolveMode();

  // Delete assignment
  const { error: deleteError } = await supabase
    .from(getSchemaTable("opportunity_owners", mode))
    .delete()
    .eq("opportunity_id", id)
    .eq("user_id", userId);

  if (deleteError) {
    console.error("Failed to remove owner:", deleteError);
    return NextResponse.json({ error: "Failed to remove owner" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
