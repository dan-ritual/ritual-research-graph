import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/opportunities/[id]/owners/[userId] - Remove an owner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user name for activity log
  const { data: targetUser } = await supabase
    .from("users")
    .select("name")
    .eq("id", userId)
    .single();

  // Delete assignment
  const { error: deleteError } = await supabase
    .from("opportunity_owners")
    .delete()
    .eq("opportunity_id", id)
    .eq("user_id", userId);

  if (deleteError) {
    console.error("Failed to remove owner:", deleteError);
    return NextResponse.json({ error: "Failed to remove owner" }, { status: 500 });
  }

  // Log activity
  await supabase.from("opportunity_activity").insert({
    opportunity_id: id,
    user_id: user.id,
    action: "owner_removed",
    details: { removed_user_id: userId, removed_user_name: targetUser?.name || "Unknown" },
  });

  return NextResponse.json({ success: true });
}
