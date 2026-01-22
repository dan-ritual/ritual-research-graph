"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { ModeSwitcher } from "@/components/mode/mode-switcher";
import { useMode } from "@/components/providers/mode-provider";

interface HeaderProps {
  user: {
    email: string;
    name?: string;
    avatar_url?: string;
  };
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { mode, config } = useMode();

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

  // Build full path with mode prefix
  const getNavHref = (relativePath: string) => `/${mode}${relativePath}`;

  // Check if current path matches nav item
  const isActiveNav = (relativePath: string) => {
    const fullPath = getNavHref(relativePath);
    // Exact match for dashboard, prefix match for others
    if (relativePath === "/dashboard") {
      return pathname === fullPath;
    }
    return pathname.startsWith(fullPath);
  };

  return (
    <header className="border-b border-[rgba(0,0,0,0.08)] bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link
            href={getNavHref(config.navigation.defaultPath)}
            className="font-display font-semibold text-lg text-[var(--mode-accent)] tracking-tight"
          >
            {config.name}
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {config.navigation.items.map((item) => (
              <Link
                key={item.path}
                href={getNavHref(item.path)}
                className={`font-mono text-xs uppercase tracking-[0.08em] transition-colors ${
                  isActiveNav(item.path)
                    ? "text-[var(--mode-accent)]"
                    : "text-[rgba(0,0,0,0.45)] hover:text-[var(--mode-accent)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ModeSwitcher className="hidden sm:flex" />
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
      </div>
    </header>
  );
}
