import type { ModeConfig, ModeId } from "./types.js";
import { growthConfig } from "./growth.config.js";
import { engineeringConfig } from "./engineering.config.js";
import { skunkworksConfig } from "./skunkworks.config.js";

export * from "./types.js";

export const MODE_CONFIGS: Record<ModeId, ModeConfig> = {
  growth: growthConfig,
  engineering: engineeringConfig,
  skunkworks: skunkworksConfig,
};

export const MODE_ORDER: ModeId[] = ["growth", "engineering", "skunkworks"];
export const DEFAULT_MODE_ID: ModeId = "growth";

export function getModeConfig(mode: ModeId): ModeConfig {
  return MODE_CONFIGS[mode];
}
