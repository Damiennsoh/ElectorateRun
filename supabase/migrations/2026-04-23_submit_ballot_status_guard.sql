-- Migration: enforce election status = 'active' in submit_ballot RPC
-- Run this in Supabase SQL editor to update the submit_ballot function so ballots
-- are rejected when the election is not active.

CREATE OR REPLACE FUNCTION submit_ballot(
  p_voter_id UUID,
  p_election_id UUID,
  p_votes JSONB,
  p_vote_hash VARCHAR
)
RETURNS VOID AS $$
DECLARE
  v_vote_id UUID;
  v_vote_item RECORD;
  v_has_voted BOOLEAN;
BEGIN
  -- 0. Ensure election is active
  IF NOT EXISTS (SELECT 1 FROM elections WHERE id = p_election_id AND status = 'active') THEN
    RAISE EXCEPTION 'Voting is closed for this election.';
  END IF;

  -- 1. Verify voter hasn't voted (lock row)
  SELECT has_voted INTO v_has_voted FROM voters WHERE id = p_voter_id FOR UPDATE;
  IF v_has_voted THEN
    RAISE EXCEPTION 'Voter has already cast a ballot';
  END IF;

  -- 2. Create the Vote record
  INSERT INTO votes (election_id, voter_id, vote_hash, submitted_at)
  VALUES (p_election_id, p_voter_id, p_vote_hash, NOW())
  RETURNING id INTO v_vote_id;

  -- 3. Insert vote choices
  FOR v_vote_item IN SELECT * FROM jsonb_to_recordset(p_votes) AS x(ballot_question_id UUID, candidate_option_id UUID, rank_order INTEGER) LOOP
    INSERT INTO vote_choices (vote_id, ballot_question_id, candidate_option_id, rank_order)
    VALUES (v_vote_id, v_vote_item.ballot_question_id, v_vote_item.candidate_option_id, v_vote_item.rank_order);
  END LOOP;

  -- 4. Mark voter as voted
  UPDATE voters SET has_voted = true, voted_at = NOW() WHERE id = p_voter_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: adjust column names if your schema uses a different timestamp column (e.g., `timestamp`).
-- Run this file in Supabase -> SQL editor. After running, test submission via your UI.
