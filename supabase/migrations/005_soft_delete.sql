-- Migration: Add soft delete support
-- Adds deleted_at column to microsites and entities tables
-- Updates RLS policies to filter out deleted records

-- ============================================================================
-- 1. Add deleted_at columns
-- ============================================================================

ALTER TABLE public.microsites
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.entities
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN public.microsites.deleted_at IS 'Soft delete timestamp. NULL = active, timestamp = deleted';
COMMENT ON COLUMN public.entities.deleted_at IS 'Soft delete timestamp. NULL = active, timestamp = deleted';

-- ============================================================================
-- 2. Create indexes for efficient filtering
-- ============================================================================

CREATE INDEX idx_microsites_deleted_at ON public.microsites(deleted_at)
WHERE deleted_at IS NULL;

CREATE INDEX idx_entities_deleted_at ON public.entities(deleted_at)
WHERE deleted_at IS NULL;

-- ============================================================================
-- 3. Update RLS policies to exclude deleted records
-- ============================================================================

-- Drop existing microsite select policies
DROP POLICY IF EXISTS "Authenticated users can view internal microsites" ON public.microsites;
DROP POLICY IF EXISTS "Anyone can view public microsites" ON public.microsites;

-- Recreate with soft delete filter
CREATE POLICY "Authenticated users can view internal microsites"
  ON public.microsites FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND visibility = 'internal'
    AND deleted_at IS NULL
  );

CREATE POLICY "Anyone can view public microsites"
  ON public.microsites FOR SELECT
  USING (
    visibility = 'public'
    AND deleted_at IS NULL
  );

-- Drop existing entity select policy
DROP POLICY IF EXISTS "Authenticated users can view entities" ON public.entities;

-- Recreate with soft delete filter
CREATE POLICY "Authenticated users can view entities"
  ON public.entities FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND deleted_at IS NULL
  );

-- ============================================================================
-- 4. Create soft delete helper function
-- ============================================================================

CREATE OR REPLACE FUNCTION soft_delete_microsite(microsite_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.microsites
  SET deleted_at = NOW()
  WHERE id = microsite_id
  AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION soft_delete_entity(entity_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.entities
  SET deleted_at = NOW()
  WHERE id = entity_id
  AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. Create restore functions
-- ============================================================================

CREATE OR REPLACE FUNCTION restore_microsite(microsite_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.microsites
  SET deleted_at = NULL
  WHERE id = microsite_id
  AND deleted_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION restore_entity(entity_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.entities
  SET deleted_at = NULL
  WHERE id = entity_id
  AND deleted_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. Admin policy to view deleted records (for recovery)
-- ============================================================================

CREATE POLICY "Admins can view deleted microsites"
  ON public.microsites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view deleted entities"
  ON public.entities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
