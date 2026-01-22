-- ============================================================================
-- Migration 009: Shared Tables
-- Phase: 2 (Schema Split)
-- Created: 2026-01-22
-- ============================================================================

-- 1. Users (shared across modes)
CREATE TABLE IF NOT EXISTS shared.users (LIKE public.users INCLUDING ALL);

INSERT INTO shared.users
SELECT * FROM public.users
ON CONFLICT (id) DO NOTHING;

-- 2. Cross-mode links
CREATE TABLE IF NOT EXISTS shared.cross_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source
  source_mode TEXT NOT NULL CHECK (source_mode IN ('growth', 'engineering', 'skunkworks')),
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,

  -- Target
  target_mode TEXT NOT NULL CHECK (target_mode IN ('growth', 'engineering', 'skunkworks')),
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,

  -- Metadata
  link_type TEXT NOT NULL,
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',

  UNIQUE(source_mode, source_id, target_mode, target_id, link_type)
);

CREATE INDEX IF NOT EXISTS idx_cross_links_source
  ON shared.cross_links(source_mode, source_id);

CREATE INDEX IF NOT EXISTS idx_cross_links_target
  ON shared.cross_links(target_mode, target_id);

-- 3. Mode configuration
CREATE TABLE IF NOT EXISTS shared.mode_config (
  mode TEXT PRIMARY KEY CHECK (mode IN ('growth', 'engineering', 'skunkworks')),
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
