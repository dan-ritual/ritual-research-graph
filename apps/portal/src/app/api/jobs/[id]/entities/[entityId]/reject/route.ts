import { getSchemaTable, resolveMode } from "@/lib/db";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entityId: string }> }
) {
  const { id: jobId, entityId } = await params;
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Resolve mode from header or cookie
  const mode = await resolveMode();

  // Verify entity exists and belongs to this job
  const { data: entity, error: entityError } = await supabase
    .from(getSchemaTable("entities", mode))
    .select("id, canonical_name, extraction_job_id, review_status")
    .eq("id", entityId)
    .eq("extraction_job_id", jobId)
    .single();

  if (entityError || !entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  // Update review status to rejected
  const { data: updated, error: updateError } = await supabase
    .from(getSchemaTable("entities", mode))
    .update({
      review_status: "rejected",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", entityId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to reject entity" },
      { status: 500 }
    );
  }

  return NextResponse.json({ entity: updated });
}
