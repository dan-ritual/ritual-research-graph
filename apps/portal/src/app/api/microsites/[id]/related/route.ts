import { getSchemaTable, resolveMode } from "@/lib/db";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Middleware already handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Resolve mode from query param, header, or cookie
  const modeParam = request.nextUrl.searchParams.get("mode") || undefined;
  const mode = await resolveMode(modeParam);

  // Support both ID (UUID) and slug lookup
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Get the microsite
  const { data: microsite, error: micrositeError } = await supabase
    .from(getSchemaTable("microsites", mode))
    .select("id")
    .eq(isUUID ? "id" : "slug", id)
    .single();

  if (micrositeError || !microsite) {
    return NextResponse.json({ error: "Microsite not found" }, { status: 404 });
  }

  // Find related microsites by entity overlap
  // First get entities in current microsite
  const { data: currentEntities } = await supabase
    .from(getSchemaTable("entity_appearances", mode))
    .select("entity_id")
    .eq("microsite_id", microsite.id);

  if (!currentEntities || currentEntities.length === 0) {
    return NextResponse.json({ related: [] });
  }

  const entityIds = currentEntities.map((e) => e.entity_id);

  // Find other microsites that have these entities
  const { data: relatedAppearances } = await supabase
    .from(getSchemaTable("entity_appearances", mode))
    .select(`
      microsite_id,
      microsites (
        id,
        slug,
        title,
        subtitle,
        created_at
      )
    `)
    .in("entity_id", entityIds)
    .neq("microsite_id", microsite.id);

  if (!relatedAppearances || relatedAppearances.length === 0) {
    return NextResponse.json({ related: [] });
  }

  // Count shared entities per microsite
  const micrositeSharedCounts = new Map<
    string,
    {
      microsite: {
        id: string;
        slug: string;
        title: string;
        subtitle: string | null;
        created_at: string;
      };
      sharedCount: number;
    }
  >();

  type MicrositeInfo = {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    created_at: string;
  };

  relatedAppearances.forEach((app) => {
    const msData = app.microsites as MicrositeInfo | MicrositeInfo[] | null;
    const ms = Array.isArray(msData) ? msData[0] : msData;
    if (!ms) return;

    const existing = micrositeSharedCounts.get(ms.id);
    if (existing) {
      existing.sharedCount++;
    } else {
      micrositeSharedCounts.set(ms.id, {
        microsite: ms,
        sharedCount: 1,
      });
    }
  });

  // Sort by shared count and take top 5
  const related = Array.from(micrositeSharedCounts.values())
    .sort((a, b) => b.sharedCount - a.sharedCount)
    .slice(0, 5)
    .map((item) => ({
      ...item.microsite,
      shared_entity_count: item.sharedCount,
    }));

  return NextResponse.json({ related });
}
