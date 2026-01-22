import type { ModeConfig, ModeId } from "./types.js";
export * from "./types.js";
export declare const MODE_CONFIGS: Record<ModeId, ModeConfig>;
export declare const MODE_ORDER: ModeId[];
export declare const DEFAULT_MODE_ID: ModeId;
export declare function getModeConfig(mode: ModeId): ModeConfig;
