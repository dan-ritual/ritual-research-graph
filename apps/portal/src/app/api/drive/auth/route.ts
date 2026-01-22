import { createClient } from "@/lib/supabase/server";
import { checkDriveAccess } from "@/lib/google/drive-client";
import { NextResponse } from "next/server";

/**
 * GET /api/drive/auth
 * Check if current session has Drive access
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json(
        { connected: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const providerToken = session.provider_token;
    if (!providerToken) {
      return NextResponse.json({
        connected: false,
        needsAuth: true,
        message: "No provider token - need to re-authenticate with Drive scope",
      });
    }

    // Check if token has Drive access
    const hasAccess = await checkDriveAccess(providerToken);

    if (!hasAccess) {
      return NextResponse.json({
        connected: false,
        needsAuth: true,
        message: "Token lacks Drive scope - need incremental authorization",
      });
    }

    return NextResponse.json({
      connected: true,
      email: session.user.email,
    });
  } catch (err) {
    console.error("[drive/auth] Error:", err);
    return NextResponse.json(
      { connected: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
