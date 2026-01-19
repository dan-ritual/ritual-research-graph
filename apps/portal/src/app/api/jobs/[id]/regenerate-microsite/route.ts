import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Verify job exists and has a microsite
  const { data: job, error: jobError } = await supabase
    .from("generation_jobs")
    .select(`
      id,
      title,
      status,
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

  // Get updated artifacts
  const { data: artifacts, error: artifactsError } = await supabase
    .from("artifacts")
    .select("*")
    .eq("job_id", jobId);

  if (artifactsError || !artifacts || artifacts.length === 0) {
    return NextResponse.json(
      { error: "No artifacts found for regeneration" },
      { status: 400 }
    );
  }

  // Update job status to indicate regeneration
  await supabase
    .from("generation_jobs")
    .update({
      status: "generating_microsite",
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  // In a full implementation, this would:
  // 1. Re-run the SITE_CONFIG stage with updated artifacts
  // 2. Rebuild the microsite HTML/assets
  // 3. Deploy to blob storage
  // 4. Update microsite record with new paths
  //
  // For now, we mark the job as ready for manual regeneration
  // and return the artifact data needed

  // Update microsite updated_at
  await supabase
    .from("microsites")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", microsite.id);

  // Mark job as completed again
  await supabase
    .from("generation_jobs")
    .update({
      status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  return NextResponse.json({
    success: true,
    message: "Microsite marked for regeneration",
    microsite: {
      id: microsite.id,
      slug: microsite.slug,
    },
    artifacts: artifacts.map((a) => ({
      id: a.id,
      type: a.type,
      hasEdits: !!a.last_edited_at,
    })),
  });
}
