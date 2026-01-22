import { getSchemaForMode, getSchemaTable, resolveMode } from "@/lib/db";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Resolve mode from header or cookie
  const mode = await resolveMode();

  const body = await request.json();
  const { sourceEntityId, targetEntityId, newCanonicalName } = body;

  if (!sourceEntityId || !targetEntityId) {
    return NextResponse.json(
      { error: "sourceEntityId and targetEntityId are required" },
      { status: 400 }
    );
  }

  // Verify source entity exists and belongs to this job
  const { data: sourceEntity, error: sourceError } = await supabase
    .from(getSchemaTable("entities", mode))
    .select("id, canonical_name, extraction_job_id")
    .eq("id", sourceEntityId)
    .single();

  if (sourceError || !sourceEntity) {
    return NextResponse.json(
      { error: "Source entity not found" },
      { status: 404 }
    );
  }

  // Verify target entity exists
  const { data: targetEntity, error: targetError } = await supabase
    .from(getSchemaTable("entities", mode))
    .select("id, canonical_name, type")
    .eq("id", targetEntityId)
    .single();

  if (targetError || !targetEntity) {
    return NextResponse.json(
      { error: "Target entity not found" },
      { status: 404 }
    );
  }

  // Call the merge_entities function
  const { data: mergeResult, error: mergeError } = await supabase
    .schema(getSchemaForMode(mode))
    .rpc("merge_entities", {
      p_source_id: sourceEntityId,
      p_target_id: targetEntityId,
      p_user_id: null,
    });

  if (mergeError) {
    console.error("Merge error:", mergeError);
    return NextResponse.json(
      { error: "Failed to merge entities" },
      { status: 500 }
    );
  }

  // Optionally update the canonical name if provided
  if (newCanonicalName && newCanonicalName !== targetEntity.canonical_name) {
    await supabase
      .from(getSchemaTable("entities", mode))
      .update({ canonical_name: newCanonicalName })
      .eq("id", targetEntityId);
  }

  // Fetch updated target entity
  const { data: mergedEntity } = await supabase
    .from(getSchemaTable("entities", mode))
    .select(`
      id,
      slug,
      canonical_name,
      type,
      metadata,
      review_status,
      entity_aliases (
        id,
        alias,
        source
      )
    `)
    .eq("id", targetEntityId)
    .single();

  return NextResponse.json({
    success: true,
    mergedEntity,
    sourceEntityId,
    targetEntityId,
  });
}
