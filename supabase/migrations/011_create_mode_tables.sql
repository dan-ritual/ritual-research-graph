-- ============================================================================
-- Migration 011: Create Engineering + Skunkworks Tables (Structure Only)
-- Phase: 2 (Schema Split)
-- Created: 2026-01-22
-- ============================================================================

-- Engineering
CREATE TABLE IF NOT EXISTS engineering.opportunities (LIKE growth.opportunities INCLUDING ALL);
CREATE TABLE IF NOT EXISTS engineering.entities (LIKE growth.entities INCLUDING ALL);
CREATE TABLE IF NOT EXISTS engineering.microsites (LIKE growth.microsites INCLUDING ALL);
CREATE TABLE IF NOT EXISTS engineering.generation_jobs (LIKE growth.generation_jobs INCLUDING ALL);
CREATE TABLE IF NOT EXISTS engineering.artifacts (LIKE growth.artifacts INCLUDING ALL);
CREATE TABLE IF NOT EXISTS engineering.entity_appearances (LIKE growth.entity_appearances INCLUDING ALL);
CREATE TABLE IF NOT EXISTS engineering.entity_relations (LIKE growth.entity_relations INCLUDING ALL);
CREATE TABLE IF NOT EXISTS engineering.entity_opportunities (LIKE growth.entity_opportunities INCLUDING ALL);
CREATE TABLE IF NOT EXISTS engineering.pipeline_workflows (LIKE growth.pipeline_workflows INCLUDING ALL);
CREATE TABLE IF NOT EXISTS engineering.pipeline_stages (LIKE growth.pipeline_stages INCLUDING ALL);
CREATE TABLE IF NOT EXISTS engineering.opportunity_owners (LIKE growth.opportunity_owners INCLUDING ALL);
CREATE TABLE IF NOT EXISTS engineering.opportunity_entities (LIKE growth.opportunity_entities INCLUDING ALL);
CREATE TABLE IF NOT EXISTS engineering.opportunity_activity (LIKE growth.opportunity_activity INCLUDING ALL);
CREATE TABLE IF NOT EXISTS engineering.entity_aliases (LIKE growth.entity_aliases INCLUDING ALL);

-- Skunkworks
CREATE TABLE IF NOT EXISTS skunkworks.opportunities (LIKE growth.opportunities INCLUDING ALL);
CREATE TABLE IF NOT EXISTS skunkworks.entities (LIKE growth.entities INCLUDING ALL);
CREATE TABLE IF NOT EXISTS skunkworks.microsites (LIKE growth.microsites INCLUDING ALL);
CREATE TABLE IF NOT EXISTS skunkworks.generation_jobs (LIKE growth.generation_jobs INCLUDING ALL);
CREATE TABLE IF NOT EXISTS skunkworks.artifacts (LIKE growth.artifacts INCLUDING ALL);
CREATE TABLE IF NOT EXISTS skunkworks.entity_appearances (LIKE growth.entity_appearances INCLUDING ALL);
CREATE TABLE IF NOT EXISTS skunkworks.entity_relations (LIKE growth.entity_relations INCLUDING ALL);
CREATE TABLE IF NOT EXISTS skunkworks.entity_opportunities (LIKE growth.entity_opportunities INCLUDING ALL);
CREATE TABLE IF NOT EXISTS skunkworks.pipeline_workflows (LIKE growth.pipeline_workflows INCLUDING ALL);
CREATE TABLE IF NOT EXISTS skunkworks.pipeline_stages (LIKE growth.pipeline_stages INCLUDING ALL);
CREATE TABLE IF NOT EXISTS skunkworks.opportunity_owners (LIKE growth.opportunity_owners INCLUDING ALL);
CREATE TABLE IF NOT EXISTS skunkworks.opportunity_entities (LIKE growth.opportunity_entities INCLUDING ALL);
CREATE TABLE IF NOT EXISTS skunkworks.opportunity_activity (LIKE growth.opportunity_activity INCLUDING ALL);
CREATE TABLE IF NOT EXISTS skunkworks.entity_aliases (LIKE growth.entity_aliases INCLUDING ALL);
