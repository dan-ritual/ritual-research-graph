export type ModeId = "growth" | "engineering" | "skunkworks";

export type ModeFieldType =
  | "string"
  | "text"
  | "url"
  | "enum"
  | "date"
  | "number"
  | "boolean";

export interface ModeEntityField {
  id: string;
  label: string;
  type: ModeFieldType;
  required: boolean;
  options?: string[];
}

export interface ModeEntityType {
  id: string;
  label: string;
  labelPlural: string;
  icon: string;
  fields: ModeEntityField[];
  searchableFields: string[];
}

export interface ModeNavigationItem {
  label: string;
  path: string;
  icon: string;
}

export interface ModeNavigationConfig {
  defaultPath: string;
  items: ModeNavigationItem[];
}

export interface ModePipelineStage {
  id: string;
  name: string;
  handler: string;
  provider: "claude" | "grok" | "perplexity" | "bird" | "internal";
  required: boolean;
  order: number;
  config?: Record<string, unknown>;
}

export interface ModeFeatureFlags {
  crossLinking: boolean;
  externalIntegrations: string[];
}

export interface ModeConfig {
  id: ModeId;
  name: string;
  shortName: string;
  description: string;
  accent: string;
  accentLight: string;
  entityTypes: ModeEntityType[];
  pipelineStages: ModePipelineStage[];
  navigation: ModeNavigationConfig;
  features: ModeFeatureFlags;
}
