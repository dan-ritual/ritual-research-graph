import { growthConfig } from "./growth.config.js";
import { engineeringConfig } from "./engineering.config.js";
import { skunkworksConfig } from "./skunkworks.config.js";
export * from "./types.js";
export const MODE_CONFIGS = {
    growth: growthConfig,
    engineering: engineeringConfig,
    skunkworks: skunkworksConfig,
};
export const MODE_ORDER = ["growth", "engineering", "skunkworks"];
export const DEFAULT_MODE_ID = "growth";
export function getModeConfig(mode) {
    return MODE_CONFIGS[mode];
}
