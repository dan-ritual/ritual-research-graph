import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/microsites/[id]/delete - Soft delete a microsite
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

  // Check if microsite exists and user has permission
  const { data: microsite, error: fetchError } = await supabase
    .from("microsites")
    .select("id, user_id, deleted_at")
    .eq("id", id)
    .single();

  if (fetchError || !microsite) {
    return NextResponse.json({ error: "Microsite not found" }, { status: 404 });
  }

  if (microsite.deleted_at) {
    return NextResponse.json(
      { error: "Microsite already deleted" },
      { status: 400 }
    );
  }

  // Check permission: owner or admin
  const { data: currentUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const isOwner = microsite.user_id === user.id;
  const isAdmin = currentUser?.role === "admin";

  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { error: "Permission denied" },
      { status: 403 }
    );
  }

  // Soft delete
  const { error: deleteError } = await supabase
    .from("microsites")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (deleteError) {
    console.error("Failed to delete microsite:", deleteError);
    return NextResponse.json(
      { error: "Failed to delete microsite" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, deleted_at: new Date().toISOString() });
}
