import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the job
  const { data: job, error: fetchError } = await supabase
    .from("generation_jobs")
    .select("id, user_id, status")
    .eq("id", id)
    .single();

  if (fetchError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // Check ownership
  if (job.user_id !== user.id) {
    // Check if admin
    const { data: currentUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }
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
