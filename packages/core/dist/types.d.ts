export type EntityType = 'company' | 'person' | 'concept' | 'opportunity' | 'protocol';
export interface EntityAppearance {
    micrositeId: string;
    micrositeTitle: string;
    context: string;
    section: 'keyFindings' | 'recommendations' | 'deepDives' | 'thesis';
    sentiment?: 'positive' | 'neutral' | 'negative';
}
export interface EntityRelation {
    slug: string;
    coOccurrenceCount: number;
}
export interface Entity {
    slug: string;
    canonicalName: string;
    aliases: string[];
    type: EntityType;
    metadata: {
        url?: string;
        twitter?: string;
        tvSymbol?: string;
        category?: string;
        description?: string;
    };
    appearances: EntityAppearance[];
    relatedEntities: EntityRelation[];
    opportunities: string[];
    createdAt: string;
    updatedAt: string;
}
export interface EntityRegistry {
    entities: Record<string, Entity>;
    opportunityIndex: Record<string, string[]>;
    stats: {
        totalEntities: number;
        lastUpdated: string;
    };
}
export interface MicrositeBacklink {
    micrositeId: string;
    sharedEntities: string[];
    relevanceScore: number;
}
export interface Microsite {
    id: string;
    title: string;
    subtitle: string;
    date: string;
    thesis: string;
    sourceTranscript: string;
    artifacts: string[];
    entities: string[];
    opportunities: string[];
    keyFindingTitles: string[];
    recommendationTitles: string[];
    backlinks: MicrositeBacklink[];
    url: string;
    localPath: string;
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
export interface Opportunity {
    slug: string;
    name: string;
    description: string;
    parent?: string;
    children?: string[];
    relatedOpportunities: string[];
    entityCount: number;
    micrositeCount: number;
}
export interface OpportunityTaxonomy {
    opportunities: Record<string, Opportunity>;
}
export interface SiteBranding {
    title: string;
    subtitle: string;
    accentColor: string;
    footerText?: string;
}
export interface KeyFinding {
    title: string;
    content: string;
}
export interface Recommendation {
    title: string;
    content: string;
}
export interface EntityConfig {
    url: string;
    twitter?: string;
    providers?: {
        tradingview?: {
            symbol: string;
        };
        youtube?: {
            videoId: string;
        };
        custom?: {
            embedUrl: string;
            width?: number;
            height?: number;
        };
    };
}
export interface DeepDive {
    id: string;
    title: string;
    subtitle: string;
    file?: string;
    content?: string;
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
    relatedResearch?: boolean;
    entitySidebar?: boolean;
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
    _graph?: {
        micrositeId: string;
        relatedMicrosites: MicrositeBacklink[];
        entityBacklinks: Record<string, number>;
    };
}
