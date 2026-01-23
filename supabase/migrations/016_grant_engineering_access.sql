-- ============================================================================
-- Migration 016: Grant Engineering Mode Access
-- Phase: 2 (Schema Split - Access Fix)
-- Created: 2026-01-22
-- Purpose: Grant all @ritual.net users access to engineering mode
-- ============================================================================

-- Grant engineering mode access to all existing authenticated users
-- who don't already have it
INSERT INTO shared.user_mode_access (user_id, mode, granted_by, granted_at)
SELECT
  au.id,
  'engineering',
  au.id,  -- self-granted for migration
  NOW()
FROM auth.users au
WHERE au.email LIKE '%@ritual.net'
  AND NOT EXISTS (
    SELECT 1 FROM shared.user_mode_access uma
    WHERE uma.user_id = au.id AND uma.mode = 'engineering'
  )
ON CONFLICT (user_id, mode) DO NOTHING;

-- Also grant skunkworks access for completeness
INSERT INTO shared.user_mode_access (user_id, mode, granted_by, granted_at)
SELECT
  au.id,
  'skunkworks',
  au.id,
  NOW()
FROM auth.users au
WHERE au.email LIKE '%@ritual.net'
  AND NOT EXISTS (
    SELECT 1 FROM shared.user_mode_access uma
    WHERE uma.user_id = au.id AND uma.mode = 'skunkworks'
  )
ON CONFLICT (user_id, mode) DO NOTHING;

-- Log what was granted
DO $$
DECLARE
  eng_count INTEGER;
  skunk_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO eng_count FROM shared.user_mode_access WHERE mode = 'engineering';
  SELECT COUNT(*) INTO skunk_count FROM shared.user_mode_access WHERE mode = 'skunkworks';
  RAISE NOTICE 'Engineering mode grants: %', eng_count;
  RAISE NOTICE 'Skunkworks mode grants: %', skunk_count;
END $$;
