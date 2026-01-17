"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  user: {
    email: string;
    name?: string;
    avatar_url?: string;
  };
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <header className="border-b border-[rgba(0,0,0,0.08)] bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-display font-semibold text-lg text-[#3B5FE6] tracking-tight"
          >
            Ritual Research Graph
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6] transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/microsites"
              className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6] transition-colors"
            >
              Microsites
            </Link>
            <Link
              href="/entities"
              className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6] transition-colors"
            >
              Entities
            </Link>
            <Link
              href="/pipeline"
              className="font-mono text-xs uppercase tracking-[0.08em] text-[rgba(0,0,0,0.45)] hover:text-[#3B5FE6] transition-colors"
            >
              Pipeline
            </Link>
          </nav>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 p-0">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || user.email}
                  className="h-8 w-8"
                />
              ) : (
                <div className="h-8 w-8 bg-[#F5F5F5] flex items-center justify-center font-mono text-xs font-medium">
                  {initials}
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                {user.name && (
                  <p className="font-mono text-sm font-medium leading-none">{user.name}</p>
                )}
                <p className="font-mono text-xs leading-none text-[rgba(0,0,0,0.45)]">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="font-mono text-xs uppercase tracking-[0.05em] cursor-pointer"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
