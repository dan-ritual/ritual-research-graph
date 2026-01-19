import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/users - Get all users (team members)
export async function GET() {
  // Middleware handles auth - use service client for fast DB access
  const supabase = createServiceClient();

  const { data: users, error } = await supabase
    .from("users")
    .select("id, name, email, avatar_url")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  return NextResponse.json({ users: users || [] });
}
