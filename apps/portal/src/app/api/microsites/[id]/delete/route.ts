import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/microsites/[id]/delete - Soft delete a microsite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

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
