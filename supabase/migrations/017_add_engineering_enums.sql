-- ============================================================================
-- Migration 017: Extend enums for multi-mode engineering/skunkworks
-- Phase: 3 (Engineering Mode)
-- Created: 2026-01-22
-- ============================================================================

-- Extend entity types for engineering + skunkworks
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'feature';
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'topic';
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'decision';
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'component';
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'idea';
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'prototype';
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'experiment';

-- Extend artifact types for engineering outputs
ALTER TYPE artifact_type ADD VALUE IF NOT EXISTS 'meeting_transcript';
ALTER TYPE artifact_type ADD VALUE IF NOT EXISTS 'engineering_entities';
ALTER TYPE artifact_type ADD VALUE IF NOT EXISTS 'engineering_wiki';
ALTER TYPE artifact_type ADD VALUE IF NOT EXISTS 'feature_tracking';
ALTER TYPE artifact_type ADD VALUE IF NOT EXISTS 'decision_log';

-- Extend job statuses to cover existing + engineering pipeline stages
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'pending_regeneration';
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'regenerating_microsite';
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'researching';
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'integrating_graph';
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'ingesting_transcript';
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'generating_wiki';
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'syncing_entities';
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'importing_asana';
