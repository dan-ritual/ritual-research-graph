-- ============================================================================
-- Migration 016: Close Public Microsite Isolation Leak
-- Phase: 2 (Schema Split - RLS Tightening)
-- Created: 2026-01-22
-- Purpose: Require mode access for public microsites in engineering/skunkworks
-- ============================================================================

-- ============================================================================
-- ISSUE: Public microsites in engineering/skunkworks were readable without
-- mode access. The policies omitted shared.user_has_mode_access() and had
-- no TO authenticated clause, allowing anon users to read any public row.
--
-- FIX: Replace with mode-gated policies scoped to authenticated role.
-- ============================================================================

-- Drop the leaky policies
DROP POLICY IF EXISTS "engineering_microsites_select_public" ON engineering.microsites;
DROP POLICY IF EXISTS "skunkworks_microsites_select_public" ON skunkworks.microsites;

-- Recreate with mode access requirement
-- Engineering: public microsites require mode access
CREATE POLICY "engineering_microsites_select_public"
  ON engineering.microsites FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND visibility = 'public'
    AND deleted_at IS NULL
  );

-- Skunkworks: public microsites require mode access
CREATE POLICY "skunkworks_microsites_select_public"
  ON skunkworks.microsites FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND visibility = 'public'
    AND deleted_at IS NULL
  );

-- ============================================================================
-- NOTE: Growth public microsites remain globally visible (no mode check)
-- per existing policy from migration 013. This is intentional - growth is
-- the default open mode.
-- ============================================================================
