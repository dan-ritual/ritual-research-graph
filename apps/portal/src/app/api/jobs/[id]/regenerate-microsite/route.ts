import { getSchemaTable } from "@/lib/db";
import { resolveMode } from "@/lib/db.server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Trigger microsite regeneration for a job.
 *
 * This sets the job status to 'pending_regeneration' which the worker
 * will detect and process. The regeneration flow:
 * 1. API sets status to 'pending_regeneration'
 * 2. Worker detects the status change
 * 3. Worker re-runs SITE_CONFIG (stage 4) and microsite build (stage 5)
 * 4. Worker uploads to blob storage and updates microsite record
 * 5. Worker sets status back to 'completed'
 *
 * The client should poll the job status to track progress.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Resolve mode from header or cookie
  const mode = await resolveMode();

  // Verify job exists and has a microsite
  const { data: job, error: jobError } = await supabase
    .from(getSchemaTable("generation_jobs", mode))
    .select(`
      id,
      title,
      status,
      config,
      microsites (
        id,
        slug,
        title
      )
    `)
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // Don't allow regeneration of jobs that aren't completed
  if (job.status !== "completed") {
    return NextResponse.json(
      { error: `Cannot regenerate job with status: ${job.status}. Job must be 'completed'.` },
      { status: 400 }
    );
  }

  type MicrositeInfo = {
    id: string;
    slug: string;
    title: string;
  };

  const micrositeData = job.microsites as MicrositeInfo | MicrositeInfo[] | null;
  const microsite = Array.isArray(micrositeData) ? micrositeData[0] : micrositeData;

  if (!microsite) {
    return NextResponse.json(
      { error: "No microsite associated with this job" },
      { status: 400 }
    );
  }

  // Get updated artifacts to verify they exist
  const { data: artifacts, error: artifactsError } = await supabase
    .from(getSchemaTable("artifacts", mode))
    .select("id, type, last_edited_at")
    .eq("job_id", jobId);

  if (artifactsError || !artifacts || artifacts.length === 0) {
    return NextResponse.json(
      { error: "No artifacts found for regeneration" },
      { status: 400 }
    );
  }

  // Check which artifacts have been edited
  const editedArtifacts = artifacts.filter((a) => a.last_edited_at);

  // Update job config to indicate regeneration mode
  const updatedConfig = {
    ...(job.config as Record<string, unknown>),
    regeneration: {
      triggeredAt: new Date().toISOString(),
      editedArtifacts: editedArtifacts.map((a) => a.type),
      micrositeId: microsite.id,
      micrositeSlug: microsite.slug,
    },
  };

  // Set job status to pending_regeneration
  // The worker will detect this and process the regeneration
  const { error: updateError } = await supabase
    .from(getSchemaTable("generation_jobs", mode))
    .update({
      status: "pending_regeneration",
      config: updatedConfig,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  if (updateError) {
    console.error("Failed to update job status:", updateError);
    return NextResponse.json(
      { error: "Failed to trigger regeneration" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Microsite regeneration triggered",
    jobId,
    status: "pending_regeneration",
    microsite: {
      id: microsite.id,
      slug: microsite.slug,
    },
    editedArtifacts: editedArtifacts.map((a) => ({
      id: a.id,
      type: a.type,
    })),
  });
}
