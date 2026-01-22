"use client";

import { useRouter, usePathname } from "next/navigation";
import { useMode } from "@/components/providers/mode-provider";
import { cn } from "@/lib/utils";
import { MODE_CONFIGS, type ModeId } from "@ritual-research/core";

interface ModeSwitcherProps {
  className?: string;
}

/**
 * Get the current relative path within a mode (e.g., /growth/dashboard -> /dashboard)
 */
function getRelativePath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  
  // Check if first segment is a valid mode
  if (firstSegment && firstSegment in MODE_CONFIGS) {
    // Return path without mode prefix
    const relativePath = "/" + segments.slice(1).join("/");
    return relativePath || "/dashboard";
  }
  
  // Not in a mode route, return dashboard as default
  return "/dashboard";
}

export function ModeSwitcher({ className }: ModeSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { mode, configs } = useMode();

  const handleModeSwitch = (newMode: ModeId) => {
    if (newMode === mode) return;
    
    // Get the current relative path and navigate to same path in new mode
    const relativePath = getRelativePath(pathname);
    const targetConfig = MODE_CONFIGS[newMode];
    
    // Check if the relative path exists in the target mode's navigation
    const pathExists = targetConfig.navigation.items.some(item => item.path === relativePath);
    
    // Navigate to the same relative path if it exists, otherwise default
    const targetPath = pathExists ? relativePath : targetConfig.navigation.defaultPath;
    router.push(`/${newMode}${targetPath}`);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {configs.map((config) => {
        const isActive = config.id === mode;
        return (
          <button
            key={config.id}
            type="button"
            onClick={() => handleModeSwitch(config.id)}
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.12em] px-2 py-1 border transition-colors",
              isActive
                ? "text-[var(--mode-accent)] border-[var(--mode-accent)] bg-[color-mix(in_srgb,var(--mode-accent)_6%,transparent)]"
                : "text-[rgba(0,0,0,0.45)] border-[rgba(0,0,0,0.12)] hover:text-[var(--mode-accent)] hover:border-[var(--mode-accent)]"
            )}
            aria-pressed={isActive}
          >
            {config.shortName}
          </button>
        );
      })}
    </div>
  );
}
