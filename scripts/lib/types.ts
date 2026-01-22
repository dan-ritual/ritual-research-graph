// Type definitions for the processing pipeline

import type { ModeId } from "@ritual-research/core";

export interface GenerationConfig {
  transcript: string;
  workflow: string;
  output: string;
  mode?: ModeId;
  title?: string;
  subtitle?: string;
  accent?: string;
  skipBuild?: boolean;
  dryRun?: boolean;
  asanaProjectId?: string;
}

export interface Artifact {
  id: string;
  name: string;
  filename: string;
  content: string;
  path?: string;
}

export interface GeneratedArtifacts {
  cleanedTranscript: Artifact;
  intelligenceBrief: Artifact;
  strategicQuestions: Artifact;
  narrativeResearch?: Artifact;
}

export type GrowthEntityType = 'company' | 'protocol' | 'person' | 'concept' | 'opportunity';
export type EngineeringEntityType = 'feature' | 'topic' | 'decision' | 'component';
export type ExtractedEntityType = GrowthEntityType | EngineeringEntityType;

export interface ExtractedEntity {
  canonicalName: string;
  aliases: string[];
  type: ExtractedEntityType;
  url?: string;
  twitter?: string;
  category?: string;
  description: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  mentions: Array<{
    context: string;
    section: string;
  }>;
}

export interface EntityExtractionResult {
  entities: ExtractedEntity[];
  opportunities?: ExtractedOpportunity[];
}

export interface ExtractedOpportunity {
  name: string;
  thesis: string;
  angle: string;
  confidence: number;
  linked_entities: string[]; // entity slugs
}

export interface MeetingTranscript {
  title: string;
  date: string | null;
  attendees: string[];
  summary?: string | null;
  transcript: string;
}

export interface EngineeringTopic {
  name: string;
  description: string;
  category: 'architecture' | 'infrastructure' | 'frontend' | 'backend' | 'devops' | 'process' | 'other';
  mentions: Array<{
    timestamp?: string | null;
    context: string;
  }>;
  related_features: string[];
  related_decisions: string[];
}

export interface EngineeringDecision {
  title: string;
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  context: string;
  decision: string;
  consequences: string;
  related_topics: string[];
  superseded_by?: string | null;
  decided_at?: string | null;
}

export interface EngineeringFeature {
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'review' | 'done' | 'blocked';
  owner: string | null;
  epic?: string | null;
  asana_task_id?: string | null;
  related_topics: string[];
  related_decisions: string[];
}

export interface EngineeringComponent {
  name: string;
  type: 'service' | 'library' | 'api' | 'ui' | 'database' | 'infrastructure';
  description: string;
  repository?: string | null;
  dependencies: string[];
  owned_by?: string | null;
  related_features: string[];
}

export interface EngineeringExtractionResult {
  topics: EngineeringTopic[];
  decisions: EngineeringDecision[];
  features: EngineeringFeature[];
  components: EngineeringComponent[];
}

export interface EngineeringWikiPage {
  topic: string;
  content: string;
}

export interface SiteConfig {
  branding: {
    title: string;
    subtitle: string;
    accentColor: string;
  };
  thesis: string;
  keyFindings: Array<{
    title: string;
    content: string;
  }>;
  recommendations: Array<{
    title: string;
    content: string;
  }>;
  entities: Record<string, {
    website?: string;
    twitter?: string;
    tvSymbol?: string;
  }>;
  deepDives: Array<{
    id: string;
    title: string;
    subtitle: string;
    isContent?: boolean;
    content?: string;
    file?: string;
    summary?: string;
  }>;
  sourceArtifacts: Array<{
    id: string;
    title: string;
    subtitle: string;
    file: string;
    description: string;
  }>;
}

export interface ResearchChainInput {
  topic: string;
  entities: string[];
  intelligenceBrief: string;
}

export interface GrokOutput {
  realTimeContext: string;
  recentEvents: Array<{
    event: string;
    date: string;
    source: string;
  }>;
  sentiment: {
    overall: 'positive' | 'neutral' | 'negative';
    breakdown: Record<string, string>;
  };
}

export interface PerplexityOutput {
  research: string;
  citations: Array<{
    url: string;
    title: string;
    snippet: string;
  }>;
  entityInsights: Record<string, {
    summary: string;
    metrics?: Record<string, string>;
  }>;
}

export interface BirdOutput {
  threads: Array<{
    id: string;
    author: string;
    content: string;
    engagement: {
      likes: number;
      retweets: number;
      replies: number;
    };
    timestamp: string;
  }>;
  accounts: Array<{
    handle: string;
    relevance: string;
    recentActivity: string;
  }>;
}

export interface ResearchChainOutput {
  grok: GrokOutput | { error: string };
  perplexity: PerplexityOutput | { error: string };
  bird: BirdOutput | { error: string };
  synthesis: string;
}
