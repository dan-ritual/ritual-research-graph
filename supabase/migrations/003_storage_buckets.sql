-- ============================================================================
-- Ritual Research Graph - Storage Buckets Migration
-- Phase 1a: Storage Configuration
-- Created: 2026-01-16
-- ============================================================================

-- ============================================================================
-- 1. CREATE STORAGE BUCKETS
-- ============================================================================

-- Transcripts bucket (private - user uploads)
INSERT INTO storage.buckets (id, name, public)
VALUES ('transcripts', 'transcripts', false)
ON CONFLICT (id) DO NOTHING;

-- Artifacts bucket (private - system generated)
INSERT INTO storage.buckets (id, name, public)
VALUES ('artifacts', 'artifacts', false)
ON CONFLICT (id) DO NOTHING;

-- Microsites bucket (public - deployed sites)
INSERT INTO storage.buckets (id, name, public)
VALUES ('microsites', 'microsites', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. STORAGE POLICIES - TRANSCRIPTS
-- ============================================================================

-- Users can upload transcripts to their own folder
CREATE POLICY "Users can upload transcripts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'transcripts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can read their own transcripts
CREATE POLICY "Users can read own transcripts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'transcripts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own transcripts
CREATE POLICY "Users can delete own transcripts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'transcripts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- 3. STORAGE POLICIES - ARTIFACTS
-- ============================================================================

-- Users can read artifacts from their own jobs
CREATE POLICY "Users can read own job artifacts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'artifacts'
    AND EXISTS (
      SELECT 1 FROM public.generation_jobs j
      WHERE j.user_id = auth.uid()
      AND (storage.foldername(name))[1] = j.id::text
    )
  );

-- Admins can read all artifacts
CREATE POLICY "Admins can read all artifacts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'artifacts'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 4. STORAGE POLICIES - MICROSITES
-- ============================================================================

-- Public read access for microsites
CREATE POLICY "Public can read microsites"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'microsites');

-- Users can upload to their own microsite folders
CREATE POLICY "Users can upload own microsites"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'microsites'
    AND EXISTS (
      SELECT 1 FROM public.microsites m
      WHERE m.user_id = auth.uid()
      AND (storage.foldername(name))[1] = m.slug
    )
  );

-- Editors can upload to any microsite folder
CREATE POLICY "Editors can upload any microsite"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'microsites'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
