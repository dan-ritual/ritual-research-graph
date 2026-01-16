// Type definitions for the processing pipeline

export interface GenerationConfig {
  transcript: string;
  workflow: string;
  output: string;
  title?: string;
  subtitle?: string;
  accent?: string;
  skipBuild?: boolean;
  dryRun?: boolean;
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

export interface ExtractedEntity {
  canonicalName: string;
  aliases: string[];
  type: 'company' | 'protocol' | 'person' | 'concept' | 'opportunity';
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
