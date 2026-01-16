import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/entities/[id]/restore - Restore a soft-deleted entity
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

  // Check if user is admin
  const { data: currentUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentUser?.role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can restore deleted entities" },
      { status: 403 }
    );
  }

  // Check if entity exists and is deleted
  const { data: entity, error: fetchError } = await supabase
    .from("entities")
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
    .from("entities")
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
