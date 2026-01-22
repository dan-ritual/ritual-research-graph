import { SHARED_SCHEMA } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  /** Maximum width constraint. Defaults to "7xl" */
  maxWidth?: "3xl" | "4xl" | "7xl" | "full";
}

const maxWidthClasses = {
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

/**
 * Layout wrapper for authenticated pages.
 *
 * Handles:
 * - Auth check with redirect to /login
 * - User profile fetching
 * - Header with user info
 * - Consistent page structure
 *
 * @example
 * ```tsx
 * export default async function MyPage() {
 *   return (
 *     <AuthenticatedLayout>
 *       <h1>Page Content</h1>
 *     </AuthenticatedLayout>
 *   );
 * }
 * ```
 */
export async function AuthenticatedLayout({
  children,
  maxWidth = "7xl",
}: AuthenticatedLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from(`${SHARED_SCHEMA}.users`)
    .select("*")
    .eq("id", user.id)
    .single();

  const userInfo = {
    email: user.email || "",
    name: profile?.name || user.user_metadata?.full_name,
    avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      <Header user={userInfo} />
      <main className={`p-6 mx-auto ${maxWidthClasses[maxWidth]}`}>
        {children}
      </main>
    </div>
  );
}