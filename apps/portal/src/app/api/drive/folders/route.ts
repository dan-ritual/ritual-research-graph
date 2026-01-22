import { createClient } from "@/lib/supabase/server";
import { listFolders } from "@/lib/google/drive-client";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/drive/folders?parentId=xxx
 * List folders in Drive
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

    const parentId = request.nextUrl.searchParams.get("parentId") || undefined;
    const folders = await listFolders(providerToken, parentId);

    return NextResponse.json({ folders });
  } catch (err) {
    console.error("[drive/folders] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
