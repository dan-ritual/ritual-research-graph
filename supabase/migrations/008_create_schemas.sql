-- ============================================================================
-- Migration 008: Create Mode Schemas
-- Phase: 2 (Schema Split)
-- Created: 2026-01-22
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS growth;
CREATE SCHEMA IF NOT EXISTS engineering;
CREATE SCHEMA IF NOT EXISTS skunkworks;
CREATE SCHEMA IF NOT EXISTS shared;

GRANT USAGE ON SCHEMA growth TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA engineering TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA skunkworks TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA shared TO anon, authenticated, service_role;
