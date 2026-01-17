import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify job exists
  const { data: job, error: jobError } = await supabase
    .from("generation_jobs")
    .select("id, title, status")
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // Fetch all artifacts for this job
  const { data: artifacts, error: artifactsError } = await supabase
    .from("artifacts")
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
    job,
    artifacts: artifacts || [],
  });
}
