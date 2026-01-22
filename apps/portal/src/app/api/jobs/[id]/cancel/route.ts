import { resolveMode } from "@/lib/db.server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Statuses that can be cancelled (in-progress states)
const CANCELLABLE_STATUSES = [
  "pending",
  "generating_artifacts",
  "extracting_entities",
  "awaiting_entity_review",
  "generating_site_config",
  "building",
  "deploying",
];

// POST /api/jobs/[id]/cancel - Cancel a running job
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Resolve mode from header or cookie
  const mode = await resolveMode();

  // Fetch the job
  const { data: job, error: fetchError } = await supabase
    .schema(mode)
    .from("generation_jobs")
    .select("id, user_id, status")
    .eq("id", id)
    .single();

  if (fetchError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // Check if job can be cancelled
  if (!CANCELLABLE_STATUSES.includes(job.status)) {
    return NextResponse.json(
      { error: `Cannot cancel job with status: ${job.status}` },
      { status: 400 }
    );
  }

  // Cancel the job
  const { error: updateError } = await supabase
    .schema(mode)
    .from("generation_jobs")
    .update({
      status: "failed",
      error_message: "Cancelled by user",
      completed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    console.error("Failed to cancel job:", updateError);
    return NextResponse.json(
      { error: "Failed to cancel job" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, status: "cancelled" });
}
