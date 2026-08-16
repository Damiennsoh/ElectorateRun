-- Add results_hash column to store the cryptographic fingerprint of the election
ALTER TABLE elections ADD COLUMN IF NOT EXISTS results_hash VARCHAR(255);
