import { resolveMode } from "@/lib/db.server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface GenerationConfig {
  title: string;
  subtitle: string;
  workflow: "market-landscape" | "engineering-meeting";
  accentColor: string;
  skipBuild: boolean;
  skipResearch: boolean;
  asanaProjectId?: string;
}

interface GenerateRequest {
  transcript: string;
  config: GenerationConfig;
}

export async function POST(request: NextRequest) {
  // Get authenticated user from session
  const authClient = await createClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();

  // Validate both user object and user.id exist (SSR auth can fail silently)
  if (authError || !user?.id) {
    console.error("Auth failed:", { authError, hasUser: !!user, userId: user?.id });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use service client for DB operations (bypasses RLS for inserts)
  const supabase = createServiceClient();

  // Resolve mode from header or cookie
  const mode = await resolveMode();

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

  // Create job record with authenticated user
  const { data: job, error: jobError } = await supabase
    .schema(mode)
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
        asanaProjectId: config.asanaProjectId,
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

  // Upload transcript to Supabase Storage
  const transcriptPath = `jobs/${job.id}.md`;
  const { error: uploadError } = await supabase.storage
    .from("transcripts")
    .upload(transcriptPath, transcript, {
      contentType: "text/markdown",
      upsert: false,
    });

  if (uploadError) {
    console.error("Failed to upload transcript:", uploadError);
    // Clean up the job record
    await supabase.schema(mode).from("generation_jobs").delete().eq("id", job.id);
    return NextResponse.json(
      { error: "Failed to upload transcript" },
      { status: 500 }
    );
  }

  // Update job with transcript path (stays "pending" for worker to pick up)
  const { error: updateError } = await supabase
    .schema(mode)
    .from("generation_jobs")
    .update({
      transcript_path: transcriptPath,
    })
    .eq("id", job.id);

  if (updateError) {
    console.error("Failed to update job:", updateError);
  }

  // Job stays in "pending" status - GCP worker will pick it up via Supabase Realtime
  console.log(`Created job ${job.id} for user ${user.id}, waiting for worker`);

  return NextResponse.json({ jobId: job.id });
}
