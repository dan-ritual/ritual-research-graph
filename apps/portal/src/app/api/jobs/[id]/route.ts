import { resolveMode } from "@/lib/db.server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/jobs/[id] - Get job status and details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Resolve mode from query param, header, or cookie
  const modeParam = request.nextUrl.searchParams.get("mode") || undefined;
  const mode = await resolveMode(modeParam);

  // Fetch the job with microsite info if completed
  const { data: job, error } = await supabase
    .schema(mode)
    .from("generation_jobs")
    .select(`
      id,
      user_id,
      workflow_type,
      status,
      config,
      transcript_path,
      current_stage,
      stage_progress,
      error_message,
      microsite_id,
      started_at,
      completed_at,
      created_at,
      updated_at,
      microsites (
        id,
        slug,
        title,
        subtitle,
        blob_path
      )
    `)
    .eq("id", id)
    .single();

  if (error || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ job });
}
