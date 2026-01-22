import { getSchemaTable } from "@/lib/db";
import { resolveMode } from "@/lib/db.server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/microsites/[id]/restore - Restore a soft-deleted microsite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Resolve mode from header or cookie
  const mode = await resolveMode();

  // Check if microsite exists and is deleted
  // Admin policy allows viewing deleted records
  const { data: microsite, error: fetchError } = await supabase
    .from(getSchemaTable("microsites", mode))
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
    .from(getSchemaTable("microsites", mode))
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
