import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface GenerationConfig {
  title: string;
  subtitle: string;
  workflow: "market-landscape";
  accentColor: string;
  skipBuild: boolean;
  skipResearch: boolean;
}

interface GenerateRequest {
  transcript: string;
  config: GenerationConfig;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // 1. Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { transcript, config } = body;

  // Validate required fields
  if (!transcript || !config?.title) {
    return NextResponse.json(
      { error: "Transcript and title are required" },
      { status: 400 }
    );
  }

  // 2. Create job record
  const { data: job, error: jobError } = await supabase
    .from("generation_jobs")
    .insert({
      user_id: user.id,
      workflow_type: config.workflow,
      status: "pending",
      config: {
        title: config.title,
        subtitle: config.subtitle,
        accentColor: config.accentColor,
        skipBuild: config.skipBuild,
        skipResearch: config.skipResearch,
      },
      transcript_path: "", // Will be updated after upload
      current_stage: 0,
    })
    .select()
    .single();

  if (jobError) {
    console.error("Failed to create job:", jobError);
    return NextResponse.json(
      { error: "Failed to create generation job" },
      { status: 500 }
    );
  }

  // 3. Upload transcript to Supabase Storage
  const transcriptPath = `${user.id}/${job.id}.md`;
  const { error: uploadError } = await supabase.storage
    .from("transcripts")
    .upload(transcriptPath, transcript, {
      contentType: "text/markdown",
      upsert: false,
    });

  if (uploadError) {
    console.error("Failed to upload transcript:", uploadError);
    // Clean up the job record
    await supabase.from("generation_jobs").delete().eq("id", job.id);
    return NextResponse.json(
      { error: "Failed to upload transcript" },
      { status: 500 }
    );
  }

  // 4. Update job with transcript path
  const { error: updateError } = await supabase
    .from("generation_jobs")
    .update({
      transcript_path: transcriptPath,
      status: "generating_artifacts", // Move to first processing stage
    })
    .eq("id", job.id);

  if (updateError) {
    console.error("Failed to update job:", updateError);
  }

  // 5. TODO: Spawn CLI process in background
  // For now, the CLI will need to be triggered separately or poll for pending jobs
  // In production, this would use a job queue (e.g., Inngest, Trigger.dev) or
  // spawn a background process:
  //
  // spawn('npm', ['run', 'generate', '--', '--job-id', job.id, ...], {
  //   cwd: process.env.PROJECT_ROOT,
  //   detached: true,
  //   stdio: 'ignore',
  // }).unref();

  return NextResponse.json({ jobId: job.id });
}
