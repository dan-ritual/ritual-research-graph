-- ==========================================================================
-- Migration 018: Tighten cross_links RLS
-- Phase: 4 (Cross-Mode Linking)
-- Created: 2026-01-22
-- ==========================================================================

-- Ensure RLS is enabled
ALTER TABLE shared.cross_links ENABLE ROW LEVEL SECURITY;

-- Replace permissive policies with mode-gated checks
DROP POLICY IF EXISTS "Users can read cross_links" ON shared.cross_links;
DROP POLICY IF EXISTS "Users can create cross_links" ON shared.cross_links;

CREATE POLICY "Cross-links require access to both modes (read)"
  ON shared.cross_links FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access(source_mode)
    AND shared.user_has_mode_access(target_mode)
  );

CREATE POLICY "Cross-links require access to both modes (create)"
  ON shared.cross_links FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND shared.user_has_mode_access(source_mode)
    AND shared.user_has_mode_access(target_mode)
  );
