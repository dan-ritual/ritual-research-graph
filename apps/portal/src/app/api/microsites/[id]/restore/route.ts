import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/microsites/[id]/restore - Restore a soft-deleted microsite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin (only admins can restore)
  const { data: currentUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentUser?.role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can restore deleted microsites" },
      { status: 403 }
    );
  }

  // Check if microsite exists and is deleted
  // Admin policy allows viewing deleted records
  const { data: microsite, error: fetchError } = await supabase
    .from("microsites")
    .select("id, deleted_at")
    .eq("id", id)
    .single();

  if (fetchError || !microsite) {
    return NextResponse.json({ error: "Microsite not found" }, { status: 404 });
  }

  if (!microsite.deleted_at) {
    return NextResponse.json(
      { error: "Microsite is not deleted" },
      { status: 400 }
    );
  }

  // Restore
  const { error: restoreError } = await supabase
    .from("microsites")
    .update({ deleted_at: null })
    .eq("id", id);

  if (restoreError) {
    console.error("Failed to restore microsite:", restoreError);
    return NextResponse.json(
      { error: "Failed to restore microsite" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, restored: true });
}
