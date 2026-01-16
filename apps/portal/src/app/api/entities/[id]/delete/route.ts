import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/entities/[id]/delete - Soft delete an entity
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

  // Check if user is editor or admin
  const { data: currentUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const canEdit = currentUser?.role === "editor" || currentUser?.role === "admin";
  if (!canEdit) {
    return NextResponse.json(
      { error: "Only editors and admins can delete entities" },
      { status: 403 }
    );
  }

  // Check if entity exists
  const { data: entity, error: fetchError } = await supabase
    .from("entities")
    .select("id, deleted_at")
    .eq("id", id)
    .single();

  if (fetchError || !entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  if (entity.deleted_at) {
    return NextResponse.json(
      { error: "Entity already deleted" },
      { status: 400 }
    );
  }

  // Soft delete
  const { error: deleteError } = await supabase
    .from("entities")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (deleteError) {
    console.error("Failed to delete entity:", deleteError);
    return NextResponse.json(
      { error: "Failed to delete entity" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, deleted_at: new Date().toISOString() });
}
