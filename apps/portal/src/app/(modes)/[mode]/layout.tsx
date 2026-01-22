"use client";

import { ReactNode, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MODE_CONFIGS, type ModeId } from "@ritual-research/core";
import { useMode } from "@/components/providers/mode-provider";

const VALID_MODES = Object.keys(MODE_CONFIGS) as ModeId[];

interface ModeLayoutProps {
  children: ReactNode;
}

export default function ModeLayout({ children }: ModeLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const { setMode } = useMode();
  const modeParam = params.mode as string;

  useEffect(() => {
    // Validate mode param
    if (!VALID_MODES.includes(modeParam as ModeId)) {
      router.replace("/growth/dashboard");
      return;
    }

    // Sync mode with URL
    setMode(modeParam as ModeId);
  }, [modeParam, setMode, router]);

  // Don't render until mode is valid
  if (!VALID_MODES.includes(modeParam as ModeId)) {
    return null;
  }

  return <>{children}</>;
}
