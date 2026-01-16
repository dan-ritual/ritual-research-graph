import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/jobs/[id]/retry - Retry a failed job
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
    .select("id, user_id, status, transcript_path, config")
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

  // Only failed jobs can be retried
  if (job.status !== "failed") {
    return NextResponse.json(
      { error: `Cannot retry job with status: ${job.status}` },
      { status: 400 }
    );
  }

  // Reset the job to pending
  const { error: updateError } = await supabase
    .from("generation_jobs")
    .update({
      status: "pending",
      error_message: null,
      current_stage: 0,
      stage_progress: 0,
      started_at: null,
      completed_at: null,
      microsite_id: null,
    })
    .eq("id", id);

  if (updateError) {
    console.error("Failed to retry job:", updateError);
    return NextResponse.json(
      { error: "Failed to retry job" },
      { status: 500 }
    );
  }

  // Delete any existing artifacts from the failed attempt
  await supabase.from("artifacts").delete().eq("job_id", id);

  return NextResponse.json({ success: true, status: "pending" });
}
