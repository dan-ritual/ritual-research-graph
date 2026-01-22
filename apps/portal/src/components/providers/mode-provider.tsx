"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  DEFAULT_MODE_ID,
  MODE_CONFIGS,
  MODE_ORDER,
  type ModeConfig,
  type ModeId,
} from "@ritual-research/core";

const STORAGE_KEY = "ritual:mode";
const COOKIE_NAME = "ritual-mode";

interface ModeContextValue {
  mode: ModeId;
  setMode: (mode: ModeId) => void;
  config: ModeConfig;
  configs: ModeConfig[];
}

const ModeContext = createContext<ModeContextValue | null>(null);

function resolveModeId(value: string | null): ModeId {
  if (value && value in MODE_CONFIGS) {
    return value as ModeId;
  }
  return DEFAULT_MODE_ID;
}

/**
 * Extract mode from URL path (e.g., /growth/dashboard -> "growth")
 */
function getModeFromPath(pathname: string): ModeId | null {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  if (firstSegment && firstSegment in MODE_CONFIGS) {
    return firstSegment as ModeId;
  }
  return null;
}

/**
 * Set a cookie for server-side mode access
 */
function setModeCookie(mode: ModeId) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${mode}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mode, setModeState] = useState<ModeId>(DEFAULT_MODE_ID);

  // Derive mode from path on initial load and path changes
  useEffect(() => {
    const pathMode = getModeFromPath(pathname);
    if (pathMode) {
      // Path takes precedence
      setModeState(pathMode);
      if (typeof document !== "undefined") {
        document.documentElement.dataset.mode = pathMode;
      }
      setModeCookie(pathMode);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, pathMode);
      }
    } else {
      // Fallback to stored value or default (for non-mode routes like /)
      const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      const resolved = resolveModeId(stored);
      setModeState(resolved);
      if (typeof document !== "undefined") {
        document.documentElement.dataset.mode = resolved;
      }
      setModeCookie(resolved);
    }
  }, [pathname]);

  const setMode = useCallback((nextMode: ModeId) => {
    setModeState(nextMode);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, nextMode);
    }
    if (typeof document !== "undefined") {
      document.documentElement.dataset.mode = nextMode;
    }
    setModeCookie(nextMode);
  }, []);

  const config = MODE_CONFIGS[mode];
  const configs = useMemo(
    () => MODE_ORDER.map((id) => MODE_CONFIGS[id]),
    []
  );

  return (
    <ModeContext.Provider value={{ mode, setMode, config, configs }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode(): ModeContextValue {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within ModeProvider");
  }
  return context;
}
