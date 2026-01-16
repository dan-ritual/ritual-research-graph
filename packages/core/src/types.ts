// ═══════════════════════════════════════════════════════════════════════════
// RITUAL RESEARCH GRAPH - Core Type Definitions
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// ENTITY REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export type EntityType = 'company' | 'person' | 'concept' | 'opportunity' | 'protocol';

export interface EntityAppearance {
  micrositeId: string;
  micrositeTitle: string;
  context: string;           // Excerpt where entity appears
  section: 'keyFindings' | 'recommendations' | 'deepDives' | 'thesis';
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface EntityRelation {
  slug: string;
  coOccurrenceCount: number;  // Times mentioned together
}

export interface Entity {
  slug: string;
  canonicalName: string;
  aliases: string[];          // "Maple", "Maple Finance", "Maple Direct"
  type: EntityType;

  metadata: {
    url?: string;
    twitter?: string;
    tvSymbol?: string;        // TradingView symbol
    category?: string;        // e.g., "Private Credit", "Tokenized Treasuries"
    description?: string;
  };

  appearances: EntityAppearance[];
  relatedEntities: EntityRelation[];
  opportunities: string[];    // Opportunity area slugs

  createdAt: string;
  updatedAt: string;
}

export interface EntityRegistry {
  entities: Record<string, Entity>;

  // Reverse lookup: opportunity → entities
  opportunityIndex: Record<string, string[]>;

  stats: {
    totalEntities: number;
    lastUpdated: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MICROSITE INDEX
// ─────────────────────────────────────────────────────────────────────────────

export interface MicrositeBacklink {
  micrositeId: string;
  sharedEntities: string[];
  relevanceScore: number;     // Higher = more shared entities
}

export interface Microsite {
  id: string;                 // URL-safe slug
  title: string;
  subtitle: string;
  date: string;               // ISO date
  thesis: string;

  sourceTranscript: string;   // Original file path
  artifacts: string[];        // Generated artifact paths

  entities: string[];         // Entity slugs mentioned
  opportunities: string[];    // Opportunity tags

  keyFindingTitles: string[];
  recommendationTitles: string[];

  backlinks: MicrositeBacklink[];

  url: string;                // Deployed URL
  localPath: string;          // Path in outputs/microsites/

  createdAt: string;
  updatedAt: string;
}

export interface MicrositeIndex {
  microsites: Record<string, Microsite>;

  stats: {
    totalMicrosites: number;
    totalEntities: number;
    totalOpportunities: number;
    lastUpdated: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// OPPORTUNITY TAXONOMY
// ─────────────────────────────────────────────────────────────────────────────

export interface Opportunity {
  slug: string;
  name: string;
  description: string;
  parent?: string;            // Hierarchical taxonomy
  children?: string[];

  relatedOpportunities: string[];
  entityCount: number;
  micrositeCount: number;
}

export interface OpportunityTaxonomy {
  opportunities: Record<string, Opportunity>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SITE CONFIG (Making Software Microsite)
// ─────────────────────────────────────────────────────────────────────────────

export interface SiteBranding {
  title: string;
  subtitle: string;
  accentColor: string;
  footerText?: string;
}

export interface KeyFinding {
  title: string;
  content: string;            // Markdown with **bold** and entity names
}

export interface Recommendation {
  title: string;
  content: string;
}

export interface EntityConfig {
  url: string;
  twitter?: string;
  providers?: {
    tradingview?: { symbol: string };
    youtube?: { videoId: string };
    custom?: { embedUrl: string; width?: number; height?: number };
  };
}

export interface DeepDive {
  id: string;
  title: string;
  subtitle: string;
  file?: string;              // Path in /public/
  content?: string;           // Inline markdown
  summary?: string;
}

export interface SourceArtifact {
  id: string;
  title: string;
  subtitle: string;
  file: string;
  description: string;
}

export interface SiteFeatures {
  textSizeControls: boolean;
  agentExport: boolean;
  sourceArtifactsPanel: boolean;
  entityHover: boolean;
  relatedResearch?: boolean;   // NEW: Show related microsites panel
  entitySidebar?: boolean;     // NEW: Show entity sidebar
}

export interface SiteConfig {
  branding: SiteBranding;
  thesis: string;
  keyFindings: KeyFinding[];
  recommendations: Recommendation[];
  entities: Record<string, EntityConfig>;
  deepDives: DeepDive[];
  sourceArtifacts: SourceArtifact[];
  features: SiteFeatures;

  // Graph integration (populated by build process)
  _graph?: {
    micrositeId: string;
    relatedMicrosites: MicrositeBacklink[];
    entityBacklinks: Record<string, number>;  // entity slug → mention count across all sites
  };
}
