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
    .schema(mode)
    .from("generation_jobs")
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

  // Fetch entities extracted by this job
  const { data: entities, error: entitiesError } = await supabase
    .schema(mode)
    .from("entities")
    .select(`
      id,
      slug,
      canonical_name,
      type,
      metadata,
      review_status,
      reviewed_at,
      merged_into_id,
      extraction_job_id,
      created_at
    `)
    .eq("extraction_job_id", jobId)
    .order("canonical_name", { ascending: true });

  if (entitiesError) {
    return NextResponse.json(
      { error: "Failed to fetch entities" },
      { status: 500 }
    );
  }

  // For each entity, find potential duplicates
  const entitiesWithDuplicates = await Promise.all(
    (entities || []).map(async (entity) => {
      // Use the find_potential_duplicates function
      const { data: duplicates } = await supabase
        .schema(mode)
        .rpc(
        "find_potential_duplicates",
        {
          p_name: entity.canonical_name,
          p_type: entity.type,
          p_threshold: 0.4,
        }
      );

      // Filter out self and already-merged entities
      const potentialDuplicates = (duplicates || [])
        .filter(
          (d: { entity_id: string }) =>
            d.entity_id !== entity.id && d.entity_id !== entity.merged_into_id
        )
        .slice(0, 3); // Limit to top 3

      return {
        ...entity,
        potential_duplicates: potentialDuplicates,
        has_duplicates: potentialDuplicates.length > 0,
      };
    })
  );

  // Count by review status
  const statusCounts = {
    pending: entitiesWithDuplicates.filter((e) => e.review_status === "pending")
      .length,
    approved: entitiesWithDuplicates.filter(
      (e) => e.review_status === "approved"
    ).length,
    rejected: entitiesWithDuplicates.filter(
      (e) => e.review_status === "rejected"
    ).length,
    merged: entitiesWithDuplicates.filter((e) => e.review_status === "merged")
      .length,
  };

  return NextResponse.json({
    job: jobWithTitle,
    entities: entitiesWithDuplicates,
    statusCounts,
    total: entitiesWithDuplicates.length,
  });
}
