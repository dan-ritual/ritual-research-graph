import { createClient } from "@/lib/supabase/server";
import { listTranscriptFiles } from "@/lib/google/drive-client";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/drive/files?folderId=xxx
 * List transcript files (Google Docs, .txt, .md) in a folder
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const providerToken = session.provider_token;
    if (!providerToken) {
      return NextResponse.json(
        { error: "No Drive access - please reconnect" },
        { status: 403 }
      );
    }

    const folderId = request.nextUrl.searchParams.get("folderId") || undefined;
    const files = await listTranscriptFiles(providerToken, folderId);

    return NextResponse.json({ files });
  } catch (err) {
    console.error("[drive/files] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
