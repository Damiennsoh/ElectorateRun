-- Migration: Add results_hash and is_results_published to elections
-- Run in Supabase SQL editor or apply via migrations tool.

ALTER TABLE elections
  ADD COLUMN IF NOT EXISTS results_hash VARCHAR(128),
  ADD COLUMN IF NOT EXISTS is_results_published BOOLEAN DEFAULT FALSE;

-- Optional: create an index for quick lookup
CREATE INDEX IF NOT EXISTS idx_elections_results_published ON elections(is_results_published);
