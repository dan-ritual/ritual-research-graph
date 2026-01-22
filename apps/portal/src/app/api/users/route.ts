import { SHARED_SCHEMA, getSchemaTable } from "@/lib/db";
import { resolveMode } from "@/lib/db.server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/users - Get all users (team members)
export async function GET(request: NextRequest) {
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  // Resolve mode from query param, header, or cookie
  const modeParam = request.nextUrl.searchParams.get("mode") || undefined;
  const mode = await resolveMode(modeParam);

  const { data: users, error } = await supabase
    .from(getSchemaTable("users", mode, SHARED_SCHEMA))
    .select("id, name, email, avatar_url")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  return NextResponse.json({ users: users || [] });
}
