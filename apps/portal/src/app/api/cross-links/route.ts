import { getSharedTable } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import type { CrossLinkInsert, CrossLinkRecord, ModeId } from "@ritual-research/core";
import { NextRequest, NextResponse } from "next/server";

const VALID_MODES: ModeId[] = ["growth", "engineering", "skunkworks"];
const VALID_DIRECTIONS = ["source", "target", "both"] as const;
const MAX_LIMIT = 200;

function isModeId(value: string | null | undefined): value is ModeId {
  return !!value && VALID_MODES.includes(value as ModeId);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseConfidence(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  if (value < 0 || value > 1) {
    return null;
  }
  return value;
}

function parseMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function parseLimit(value: string | null): number {
  if (!value) return 50;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 50;
  return Math.min(Math.max(parsed, 1), MAX_LIMIT);
}

function buildSideQuery(
  supabase: Awaited<ReturnType<typeof createClient>>,
  mode: ModeId,
  side: "source" | "target",
  entityId: string,
  entityType?: string,
  linkType?: string,
  limit = 50
) {
  let query = supabase
    .from(getSharedTable("cross_links", mode))
    .select("*")
    .eq(`${side}_mode`, mode)
    .eq(`${side}_id`, entityId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (entityType) {
    query = query.eq(`${side}_type`, entityType);
  }

  if (linkType) {
    query = query.eq("link_type", linkType);
  }

  return query;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const modeParam = searchParams.get("mode");
  const entityId = searchParams.get("entityId");
  const entityType = searchParams.get("entityType") || undefined;
  const linkType = searchParams.get("linkType") || undefined;
  const direction = (searchParams.get("direction") || "both").toLowerCase();
  const limit = parseLimit(searchParams.get("limit"));

  if (!isModeId(modeParam)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  if (!entityId) {
    return NextResponse.json(
      { error: "entityId is required" },
      { status: 400 }
    );
  }

  if (!VALID_DIRECTIONS.includes(direction as (typeof VALID_DIRECTIONS)[number])) {
    return NextResponse.json(
      { error: "direction must be source, target, or both" },
      { status: 400 }
    );
  }

  try {
    if (direction === "both") {
      const [sourceResult, targetResult] = await Promise.all([
        buildSideQuery(
          supabase,
          modeParam,
          "source",
          entityId,
          entityType,
          linkType,
          limit
        ),
        buildSideQuery(
          supabase,
          modeParam,
          "target",
          entityId,
          entityType,
          linkType,
          limit
        ),
      ]);

      if (sourceResult.error || targetResult.error) {
        const error = sourceResult.error || targetResult.error;
        return NextResponse.json(
          { error: error?.message || "Failed to fetch cross-links" },
          { status: 500 }
        );
      }

      const combined = [...(sourceResult.data || []), ...(targetResult.data || [])];
      const uniqueLinks = new Map<string, CrossLinkRecord>();

      combined.forEach((link) => {
        uniqueLinks.set(link.id, link as CrossLinkRecord);
      });

      const links = Array.from(uniqueLinks.values())
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, limit);

      return NextResponse.json({ links });
    }

    const side = direction as "source" | "target";
    const { data: links, error } = await buildSideQuery(
      supabase,
      modeParam,
      side,
      entityId,
      entityType,
      linkType,
      limit
    );

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to fetch cross-links" },
        { status: 500 }
      );
    }

    return NextResponse.json({ links: links || [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Partial<CrossLinkInsert> & {
    created_by?: string;
    confidence?: number | null;
    metadata?: Record<string, unknown> | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    source_mode,
    source_type,
    source_id,
    target_mode,
    target_type,
    target_id,
    link_type,
  } = body;

  if (!isModeId(source_mode) || !isModeId(target_mode)) {
    return NextResponse.json({ error: "Invalid source/target mode" }, { status: 400 });
  }

  if (!isNonEmptyString(source_type) || !isNonEmptyString(target_type)) {
    return NextResponse.json({ error: "Invalid source/target type" }, { status: 400 });
  }

  if (!isNonEmptyString(source_id) || !isNonEmptyString(target_id)) {
    return NextResponse.json({ error: "Invalid source/target id" }, { status: 400 });
  }

  if (!isNonEmptyString(link_type)) {
    return NextResponse.json({ error: "Invalid link_type" }, { status: 400 });
  }

  const confidence = parseConfidence(body.confidence);
  if (body.confidence !== undefined && body.confidence !== null && confidence === null) {
    return NextResponse.json(
      { error: "confidence must be a number between 0 and 1" },
      { status: 400 }
    );
  }

  const metadata = parseMetadata(body.metadata);

  const insertPayload: CrossLinkInsert & { created_by: string } = {
    source_mode,
    source_type: source_type.trim(),
    source_id,
    target_mode,
    target_type: target_type.trim(),
    target_id,
    link_type: link_type.trim(),
    created_by: user.id,
    confidence,
    metadata,
  };

  try {
    const { data: link, error } = await supabase
      .from(getSharedTable("cross_links", source_mode))
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      const status = error.message?.includes("row-level security") ? 403 : 500;
      return NextResponse.json(
        { error: error.message || "Failed to create cross-link" },
        { status }
      );
    }

    return NextResponse.json({ link });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
