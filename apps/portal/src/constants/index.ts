/**
 * Portal Constants
 *
 * Centralized constants for the Ritual Research Graph portal.
 * Import from "@/constants" in components.
 */

// Badge variant type matches the Badge component's variant prop
type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "error"
  | "dotted";

// =============================================================================
// PIPELINE STAGES
// =============================================================================

export interface PipelineStage {
  name: string;
  description: string;
}

export const PIPELINE_STAGES: readonly PipelineStage[] = [
  { name: "Generate Artifacts", description: "Creating initial documents" },
  { name: "Multi-AI Research", description: "Gathering external data" },
  { name: "Extract Entities", description: "Identifying key entities" },
  { name: "Generate Site Config", description: "Building site structure" },
  { name: "Build Microsite", description: "Compiling static site" },
  { name: "Graph Integration", description: "Adding to knowledge graph" },
] as const;

// =============================================================================
// JOB STATUS
// =============================================================================

export type JobStatus =
  | "pending"
  | "pending_regeneration"
  | "generating_artifacts"
  | "researching"
  | "extracting_entities"
  | "awaiting_entity_review"
  | "generating_site_config"
  | "building"
  | "integrating_graph"
  | "deploying"
  | "regenerating_microsite"
  | "ingesting_transcript"
  | "generating_wiki"
  | "syncing_entities"
  | "importing_asana"
  | "completed"
  | "failed";

export interface StatusConfig {
  label: string;
  variant: BadgeVariant;
}

/**
 * Status configuration for job pipeline states.
 * Used in job detail pages and dashboard listings.
 */
export const STATUS_CONFIG: Record<JobStatus, StatusConfig> = {
  pending: { label: "Pending", variant: "secondary" },
  pending_regeneration: { label: "Pending Regeneration", variant: "secondary" },
  generating_artifacts: { label: "Stage 1", variant: "default" },
  researching: { label: "Stage 2", variant: "default" },
  extracting_entities: { label: "Stage 3", variant: "default" },
  awaiting_entity_review: { label: "Review Required", variant: "warning" },
  generating_site_config: { label: "Stage 4", variant: "default" },
  building: { label: "Stage 5", variant: "default" },
  integrating_graph: { label: "Stage 6", variant: "default" },
  deploying: { label: "Deploying", variant: "default" },
  regenerating_microsite: { label: "Regenerating", variant: "warning" },
  ingesting_transcript: { label: "Stage 1", variant: "default" },
  generating_wiki: { label: "Stage 3", variant: "default" },
  syncing_entities: { label: "Stage 4", variant: "default" },
  importing_asana: { label: "Stage 5", variant: "default" },
  completed: { label: "Completed", variant: "success" },
  failed: { label: "Failed", variant: "error" },
} as const;

/**
 * Get status configuration with fallback for unknown statuses.
 */
export function getStatusConfig(status: string): StatusConfig {
  return (
    STATUS_CONFIG[status as JobStatus] ?? {
      label: status,
      variant: "secondary" as const,
    }
  );
}

// =============================================================================
// WORKFLOWS
// =============================================================================

export type WorkflowType = "market-landscape" | "engineering-meeting";

export interface WorkflowConfig {
  name: string;
  description: string;
}

export const WORKFLOWS: Record<WorkflowType, WorkflowConfig> = {
  "market-landscape": {
    name: "Market Landscape",
    description: "Full pipeline with multi-AI research",
  },
  "engineering-meeting": {
    name: "Engineering Meeting",
    description: "Extract wiki, decisions, features, components",
  },
} as const;

// =============================================================================
// ACCENT COLORS
// =============================================================================

export interface AccentPreset {
  name: string;
  value: string;
}

import { COLORS } from "@/styles/tokens";

export const ACCENT_PRESETS: readonly AccentPreset[] = [
  { name: "Blue", value: COLORS.mode.growth.accent },
  { name: "Orange", value: "#E67E22" },
  { name: "Green", value: "#27AE60" },
  { name: "Purple", value: "#9B59B6" },
  { name: "Red", value: "#E74C3C" },
] as const;

export const DEFAULT_ACCENT_COLOR = COLORS.mode.growth.accent;

// =============================================================================
// UI CONSTANTS
// =============================================================================

export const TRANSCRIPT_MIN_LENGTH = 100;
export const PREVIEW_CHAR_LIMIT = 500;
export const RECENT_ITEMS_LIMIT = 5;
