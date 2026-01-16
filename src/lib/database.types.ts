/**
 * Ritual Research Graph - Supabase Database Types
 * Auto-generated from schema migration 001_initial_schema.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enum Types
export type JobStatus =
  | 'pending'
  | 'generating_artifacts'
  | 'extracting_entities'
  | 'awaiting_entity_review'
  | 'generating_site_config'
  | 'building'
  | 'deploying'
  | 'completed'
  | 'failed';

export type ArtifactType =
  | 'cleaned_transcript'
  | 'intelligence_brief'
  | 'strategic_questions'
  | 'narrative_research'
  | 'entity_extraction'
  | 'site_config';

export type EntityType =
  | 'company'
  | 'protocol'
  | 'person'
  | 'concept'
  | 'opportunity';

export type VisibilityType = 'internal' | 'public';

export type SectionType =
  | 'thesis'
  | 'key_findings'
  | 'recommendations'
  | 'deep_dives';

export type SentimentType = 'positive' | 'neutral' | 'negative';

export type UserRole = 'contributor' | 'editor' | 'admin';

// Table Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      opportunities: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          parent_id: string | null;
          entity_count: number;
          microsite_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          parent_id?: string | null;
          entity_count?: number;
          microsite_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          parent_id?: string | null;
          entity_count?: number;
          microsite_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      entities: {
        Row: {
          id: string;
          slug: string;
          canonical_name: string;
          aliases: string[];
          type: EntityType;
          metadata: Json;
          appearance_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          canonical_name: string;
          aliases?: string[];
          type: EntityType;
          metadata?: Json;
          appearance_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          canonical_name?: string;
          aliases?: string[];
          type?: EntityType;
          metadata?: Json;
          appearance_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      generation_jobs: {
        Row: {
          id: string;
          user_id: string;
          workflow_type: string;
          status: JobStatus;
          transcript_path: string;
          config: Json;
          current_stage: number;
          stage_progress: number;
          error_message: string | null;
          created_at: string;
          started_at: string | null;
          completed_at: string | null;
          microsite_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          workflow_type?: string;
          status?: JobStatus;
          transcript_path: string;
          config?: Json;
          current_stage?: number;
          stage_progress?: number;
          error_message?: string | null;
          created_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          microsite_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          workflow_type?: string;
          status?: JobStatus;
          transcript_path?: string;
          config?: Json;
          current_stage?: number;
          stage_progress?: number;
          error_message?: string | null;
          created_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          microsite_id?: string | null;
        };
      };
      artifacts: {
        Row: {
          id: string;
          job_id: string;
          type: ArtifactType;
          content: string | null;
          file_path: string | null;
          file_size: number | null;
          token_count: number | null;
          generation_time_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          type: ArtifactType;
          content?: string | null;
          file_path?: string | null;
          file_size?: number | null;
          token_count?: number | null;
          generation_time_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          type?: ArtifactType;
          content?: string | null;
          file_path?: string | null;
          file_size?: number | null;
          token_count?: number | null;
          generation_time_ms?: number | null;
          created_at?: string;
        };
      };
      microsites: {
        Row: {
          id: string;
          job_id: string | null;
          user_id: string;
          slug: string;
          title: string;
          subtitle: string | null;
          thesis: string | null;
          config: Json;
          visibility: VisibilityType;
          url: string | null;
          blob_path: string | null;
          entity_count: number;
          view_count: number;
          created_at: string;
          updated_at: string;
          deployed_at: string | null;
        };
        Insert: {
          id?: string;
          job_id?: string | null;
          user_id: string;
          slug: string;
          title: string;
          subtitle?: string | null;
          thesis?: string | null;
          config?: Json;
          visibility?: VisibilityType;
          url?: string | null;
          blob_path?: string | null;
          entity_count?: number;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
          deployed_at?: string | null;
        };
        Update: {
          id?: string;
          job_id?: string | null;
          user_id?: string;
          slug?: string;
          title?: string;
          subtitle?: string | null;
          thesis?: string | null;
          config?: Json;
          visibility?: VisibilityType;
          url?: string | null;
          blob_path?: string | null;
          entity_count?: number;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
          deployed_at?: string | null;
        };
      };
      entity_appearances: {
        Row: {
          id: string;
          entity_id: string;
          microsite_id: string;
          section: SectionType;
          context: string | null;
          sentiment: SentimentType;
          created_at: string;
        };
        Insert: {
          id?: string;
          entity_id: string;
          microsite_id: string;
          section: SectionType;
          context?: string | null;
          sentiment?: SentimentType;
          created_at?: string;
        };
        Update: {
          id?: string;
          entity_id?: string;
          microsite_id?: string;
          section?: SectionType;
          context?: string | null;
          sentiment?: SentimentType;
          created_at?: string;
        };
      };
      entity_relations: {
        Row: {
          entity_a_id: string;
          entity_b_id: string;
          co_occurrence_count: number;
          updated_at: string;
        };
        Insert: {
          entity_a_id: string;
          entity_b_id: string;
          co_occurrence_count?: number;
          updated_at?: string;
        };
        Update: {
          entity_a_id?: string;
          entity_b_id?: string;
          co_occurrence_count?: number;
          updated_at?: string;
        };
      };
      entity_opportunities: {
        Row: {
          entity_id: string;
          opportunity_id: string;
        };
        Insert: {
          entity_id: string;
          opportunity_id: string;
        };
        Update: {
          entity_id?: string;
          opportunity_id?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      job_status: JobStatus;
      artifact_type: ArtifactType;
      entity_type: EntityType;
      visibility_type: VisibilityType;
      section_type: SectionType;
      sentiment_type: SentimentType;
    };
  };
}

// Convenience type aliases
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Row type shortcuts
export type User = Tables<'users'>;
export type Opportunity = Tables<'opportunities'>;
export type Entity = Tables<'entities'>;
export type GenerationJob = Tables<'generation_jobs'>;
export type Artifact = Tables<'artifacts'>;
export type Microsite = Tables<'microsites'>;
export type EntityAppearance = Tables<'entity_appearances'>;
export type EntityRelation = Tables<'entity_relations'>;
export type EntityOpportunity = Tables<'entity_opportunities'>;
