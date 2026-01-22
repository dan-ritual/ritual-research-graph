import { createClient } from "@/lib/supabase/server";
import { getFileContent } from "@/lib/google/drive-client";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/drive/import
 * Import file content from Drive
 * Body: { fileId: string, mimeType: string, fileName: string }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { fileId, mimeType, fileName } = body;

    if (!fileId || !mimeType) {
      return NextResponse.json(
        { error: "Missing fileId or mimeType" },
        { status: 400 }
      );
    }

    const content = await getFileContent(providerToken, fileId, mimeType);

    return NextResponse.json({
      content,
      fileName: fileName || "imported-transcript.md",
      fileId,
    });
  } catch (err) {
    console.error("[drive/import] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
