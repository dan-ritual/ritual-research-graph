-- ============================================================================
-- Migration 014: Mode Isolation via RLS
-- Phase: 2 (Schema Split - RLS Enhancement)
-- Created: 2026-01-22
-- Purpose: Add JWT/claims-based mode isolation and user-mode access control
-- ============================================================================

-- ============================================================================
-- 1. USER MODE ACCESS TABLE
-- Tracks which users can access which modes
-- ============================================================================

CREATE TABLE IF NOT EXISTS shared.user_mode_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('growth', 'engineering', 'skunkworks')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  UNIQUE(user_id, mode)
);

CREATE INDEX IF NOT EXISTS idx_user_mode_access_user ON shared.user_mode_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mode_access_mode ON shared.user_mode_access(mode);
CREATE INDEX IF NOT EXISTS idx_user_mode_access_active ON shared.user_mode_access(user_id, mode) WHERE revoked_at IS NULL;

COMMENT ON TABLE shared.user_mode_access IS 'Controls which users can access which backend modes';

-- ============================================================================
-- 2. MODE ACCESS HELPER FUNCTIONS
-- ============================================================================

-- Check if current user has access to a specific mode
CREATE OR REPLACE FUNCTION shared.user_has_mode_access(p_mode TEXT)
RETURNS boolean AS $$
BEGIN
  -- Admins have access to all modes
  IF shared.is_admin() THEN
    RETURN true;
  END IF;

  -- All authenticated users have access to growth by default
  IF p_mode = 'growth' THEN
    RETURN auth.uid() IS NOT NULL;
  END IF;

  -- Check explicit mode access for engineering/skunkworks
  RETURN EXISTS (
    SELECT 1 FROM shared.user_mode_access
    WHERE user_id = auth.uid()
      AND mode = p_mode
      AND revoked_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION shared.user_has_mode_access(TEXT) TO authenticated;

COMMENT ON FUNCTION shared.user_has_mode_access IS
  'Check if current user has access to specified mode. Growth is open to all authenticated users.';

-- Get all modes the current user can access
CREATE OR REPLACE FUNCTION shared.get_user_modes()
RETURNS TEXT[] AS $$
DECLARE
  v_modes TEXT[];
BEGIN
  -- Admins get all modes
  IF shared.is_admin() THEN
    RETURN ARRAY['growth', 'engineering', 'skunkworks'];
  END IF;

  -- Start with growth (default for all authenticated)
  v_modes := ARRAY['growth'];

  -- Add any explicitly granted modes
  SELECT array_agg(mode) INTO v_modes
  FROM (
    SELECT 'growth' AS mode
    UNION
    SELECT mode FROM shared.user_mode_access
    WHERE user_id = auth.uid()
      AND revoked_at IS NULL
  ) modes;

  RETURN v_modes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION shared.get_user_modes() TO authenticated;

-- Extract mode from JWT claims (for future use with custom claims)
CREATE OR REPLACE FUNCTION shared.get_jwt_mode()
RETURNS TEXT AS $$
DECLARE
  v_mode TEXT;
BEGIN
  -- Try to get mode from JWT app_metadata
  v_mode := current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'mode';

  -- Validate mode
  IF v_mode IS NOT NULL AND v_mode IN ('growth', 'engineering', 'skunkworks') THEN
    RETURN v_mode;
  END IF;

  -- Default to growth
  RETURN 'growth';
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION shared.get_jwt_mode() TO authenticated;

COMMENT ON FUNCTION shared.get_jwt_mode IS
  'Extract mode from JWT claims. Falls back to growth if not set.';

-- Validate mode from request header (set by Supabase proxy or API)
CREATE OR REPLACE FUNCTION shared.get_request_mode()
RETURNS TEXT AS $$
DECLARE
  v_mode TEXT;
BEGIN
  -- Try to get from request header (X-Ritual-Mode)
  v_mode := current_setting('request.headers', true)::jsonb->>'x-ritual-mode';

  IF v_mode IS NOT NULL AND v_mode IN ('growth', 'engineering', 'skunkworks') THEN
    RETURN v_mode;
  END IF;

  -- Fall back to JWT mode
  RETURN shared.get_jwt_mode();
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION shared.get_request_mode() TO authenticated;

-- ============================================================================
-- 3. RLS POLICIES FOR USER_MODE_ACCESS
-- ============================================================================

ALTER TABLE shared.user_mode_access ENABLE ROW LEVEL SECURITY;

-- Users can see their own mode access
CREATE POLICY "Users can read own mode access"
  ON shared.user_mode_access FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can see all mode access
CREATE POLICY "Admins can read all mode access"
  ON shared.user_mode_access FOR SELECT
  TO authenticated
  USING (shared.is_admin());

-- Only admins can grant mode access
CREATE POLICY "Admins can grant mode access"
  ON shared.user_mode_access FOR INSERT
  TO authenticated
  WITH CHECK (shared.is_admin() AND granted_by = auth.uid());

-- Only admins can revoke mode access
CREATE POLICY "Admins can revoke mode access"
  ON shared.user_mode_access FOR UPDATE
  TO authenticated
  USING (shared.is_admin())
  WITH CHECK (shared.is_admin());

-- ============================================================================
-- 4. ENHANCED RLS POLICIES FOR MODE SCHEMAS
-- These add mode access checks on top of existing policies
-- Note: These are additive - existing policies remain for service_role usage
-- ============================================================================

-- Growth schema: Add mode access check for non-admin users
-- (Growth is open to all authenticated, but this ensures consistency)

-- Engineering schema: Require explicit mode access
DROP POLICY IF EXISTS "Mode access required for jobs" ON engineering.generation_jobs;
CREATE POLICY "Mode access required for jobs"
  ON engineering.generation_jobs FOR SELECT
  TO authenticated
  USING (shared.user_has_mode_access('engineering'));

DROP POLICY IF EXISTS "Mode access required for microsites" ON engineering.microsites;
CREATE POLICY "Mode access required for microsites"
  ON engineering.microsites FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Mode access required for entities" ON engineering.entities;
CREATE POLICY "Mode access required for entities"
  ON engineering.entities FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Mode access required for opportunities" ON engineering.opportunities;
CREATE POLICY "Mode access required for opportunities"
  ON engineering.opportunities FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND status = 'active'
  );

-- Skunkworks schema: Require explicit mode access
DROP POLICY IF EXISTS "Mode access required for jobs" ON skunkworks.generation_jobs;
CREATE POLICY "Mode access required for jobs"
  ON skunkworks.generation_jobs FOR SELECT
  TO authenticated
  USING (shared.user_has_mode_access('skunkworks'));

DROP POLICY IF EXISTS "Mode access required for microsites" ON skunkworks.microsites;
CREATE POLICY "Mode access required for microsites"
  ON skunkworks.microsites FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Mode access required for entities" ON skunkworks.entities;
CREATE POLICY "Mode access required for entities"
  ON skunkworks.entities FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Mode access required for opportunities" ON skunkworks.opportunities;
CREATE POLICY "Mode access required for opportunities"
  ON skunkworks.opportunities FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND status = 'active'
  );

-- ============================================================================
-- 5. WRITE POLICIES WITH MODE ACCESS
-- Ensure users can only write to modes they have access to
-- ============================================================================

-- Engineering write policies
DROP POLICY IF EXISTS "Mode access for creating jobs" ON engineering.generation_jobs;
CREATE POLICY "Mode access for creating jobs"
  ON engineering.generation_jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    shared.user_has_mode_access('engineering')
    AND auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Mode access for creating microsites" ON engineering.microsites;
CREATE POLICY "Mode access for creating microsites"
  ON engineering.microsites FOR INSERT
  TO authenticated
  WITH CHECK (
    shared.user_has_mode_access('engineering')
    AND auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Mode access for creating entities" ON engineering.entities;
CREATE POLICY "Mode access for creating entities"
  ON engineering.entities FOR INSERT
  TO authenticated
  WITH CHECK (shared.user_has_mode_access('engineering'));

DROP POLICY IF EXISTS "Mode access for creating opportunities" ON engineering.opportunities;
CREATE POLICY "Mode access for creating opportunities"
  ON engineering.opportunities FOR INSERT
  TO authenticated
  WITH CHECK (shared.user_has_mode_access('engineering'));

-- Skunkworks write policies
DROP POLICY IF EXISTS "Mode access for creating jobs" ON skunkworks.generation_jobs;
CREATE POLICY "Mode access for creating jobs"
  ON skunkworks.generation_jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    shared.user_has_mode_access('skunkworks')
    AND auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Mode access for creating microsites" ON skunkworks.microsites;
CREATE POLICY "Mode access for creating microsites"
  ON skunkworks.microsites FOR INSERT
  TO authenticated
  WITH CHECK (
    shared.user_has_mode_access('skunkworks')
    AND auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Mode access for creating entities" ON skunkworks.entities;
CREATE POLICY "Mode access for creating entities"
  ON skunkworks.entities FOR INSERT
  TO authenticated
  WITH CHECK (shared.user_has_mode_access('skunkworks'));

DROP POLICY IF EXISTS "Mode access for creating opportunities" ON skunkworks.opportunities;
CREATE POLICY "Mode access for creating opportunities"
  ON skunkworks.opportunities FOR INSERT
  TO authenticated
  WITH CHECK (shared.user_has_mode_access('skunkworks'));

-- ============================================================================
-- 6. GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON shared.user_mode_access TO authenticated;
GRANT ALL PRIVILEGES ON shared.user_mode_access TO service_role;

-- ============================================================================
-- 7. SEED DEFAULT MODE ACCESS
-- Grant all modes to any existing admin users
-- ============================================================================

INSERT INTO shared.user_mode_access (user_id, mode, granted_by, granted_at)
SELECT
  u.id,
  m.mode,
  u.id,  -- self-granted for existing admins
  NOW()
FROM shared.users u
CROSS JOIN (VALUES ('engineering'), ('skunkworks')) AS m(mode)
WHERE u.role = 'admin'
ON CONFLICT (user_id, mode) DO NOTHING;
