import { getSchemaTable } from "@/lib/db";
import { resolveMode } from "@/lib/db.server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Resolve mode from query param, header, or cookie
  const modeParam = request.nextUrl.searchParams.get("mode") || undefined;
  const mode = await resolveMode(modeParam);

  // Verify job exists
  const { data: job, error: jobError } = await supabase
    .from(getSchemaTable("generation_jobs", mode))
    .select("id, config, status")
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // Extract title from config
  const jobWithTitle = {
    id: job.id,
    title: (job.config as { title?: string })?.title || "Untitled",
    status: job.status,
  };

  // Fetch all artifacts for this job
  const { data: artifacts, error: artifactsError } = await supabase
    .from(getSchemaTable("artifacts", mode))
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  if (artifactsError) {
    return NextResponse.json(
      { error: "Failed to fetch artifacts" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    job: jobWithTitle,
    artifacts: artifacts || [],
  });
}
