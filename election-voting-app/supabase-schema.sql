-- 1. Users Table (handled natively by Supabase Auth, but we can extend profiles if needed)
-- We will use auth.users as the primary foreign key for the 'admin' who creates elections.

-- 2. Elections Table
CREATE TABLE elections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    timezone VARCHAR(100) DEFAULT 'UTC',
    settings JSONB DEFAULT '{}', -- Store JSON configs (emails, weighted voting, etc)
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Ballot Questions Table
CREATE TABLE ballot_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'multiple_choice' CHECK (type IN ('multiple_choice', 'yes_no', 'ranked_choice')),
    min_selections INT DEFAULT 1,
    max_selections INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Candidate Options Table
CREATE TABLE candidate_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ballot_question_id UUID REFERENCES ballot_questions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    photo_url VARCHAR(1024),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Voters Table
CREATE TABLE voters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    email VARCHAR(255),
    name VARCHAR(255),
    voter_key VARCHAR(100) UNIQUE NOT NULL, -- Unique secure string for voter auth
    has_voted BOOLEAN DEFAULT false,
    weight DECIMAL DEFAULT 1.0,
    voted_at TIMESTAMPTZ,
    vote_hash VARCHAR(255), -- Stores the SHA-256 hash of the vote receipt
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Votes Table
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES voters(id) ON DELETE CASCADE,
    ballot_question_id UUID REFERENCES ballot_questions(id) ON DELETE CASCADE,
    candidate_option_id UUID REFERENCES candidate_options(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT now(),
    -- Prevent double voting by enforcing unique voter per question
    UNIQUE (voter_id, ballot_question_id) 
);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ballot_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Admins can manage their own elections
CREATE POLICY "Admins can select own elections" ON elections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can insert own elections" ON elections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update own elections" ON elections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete own elections" ON elections FOR DELETE USING (auth.uid() = user_id);

-- Admins can manage ballot questions for their elections
CREATE POLICY "Admins manage ballot questions" ON ballot_questions 
    FOR ALL USING (election_id IN (SELECT id FROM elections WHERE user_id = auth.uid()));

-- Admins can manage candidate options
CREATE POLICY "Admins manage candidates" ON candidate_options 
    FOR ALL USING (ballot_question_id IN (
        SELECT b.id FROM ballot_questions b JOIN elections e ON b.election_id = e.id WHERE e.user_id = auth.uid()
    ));

-- Admins can manage voters
CREATE POLICY "Admins manage voters" ON voters 
    FOR ALL USING (election_id IN (SELECT id FROM elections WHERE user_id = auth.uid()));

-- Admins can view votes
CREATE POLICY "Admins view votes" ON votes 
    FOR SELECT USING (election_id IN (SELECT id FROM elections WHERE user_id = auth.uid()));

-- 7. Database Functions and RPCs (Transactions & Results)

-- RPC to submit a ballot securely within a single database transaction
CREATE OR REPLACE FUNCTION submit_ballot(
  p_voter_id UUID,
  p_election_id UUID,
  p_votes JSONB, -- Array of { ballot_question_id, candidate_option_id }
  p_vote_hash VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_voted BOOLEAN;
  v_vote JSONB;
BEGIN
  -- 1. Check if voter already voted (Locks the row for update to prevent race conditions)
  SELECT has_voted INTO v_has_voted 
  FROM voters 
  WHERE id = p_voter_id AND election_id = p_election_id 
  FOR UPDATE;
  
  IF v_has_voted THEN
    RAISE EXCEPTION 'Voter has already voted.';
  END IF;

  -- 2. Insert all votes inside the transaction
  FOR v_vote IN SELECT * FROM jsonb_array_elements(p_votes)
  LOOP
    INSERT INTO votes (election_id, voter_id, ballot_question_id, candidate_option_id)
    VALUES (
      p_election_id, 
      p_voter_id, 
      (v_vote->>'ballot_question_id')::UUID, 
      (v_vote->>'candidate_option_id')::UUID
    );
  END LOOP;

  -- 3. Update voter record with vote hash and mark as voted
  UPDATE voters 
  SET has_voted = TRUE, voted_at = now(), vote_hash = p_vote_hash
  WHERE id = p_voter_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for Results Calculation (Vote Counts)
CREATE OR REPLACE VIEW election_results_view AS
SELECT 
  election_id,
  ballot_question_id,
  candidate_option_id,
  COUNT(*) as vote_count
FROM votes
GROUP BY election_id, ballot_question_id, candidate_option_id;

-- View for Participation Calculation
CREATE OR REPLACE VIEW election_participation_view AS
SELECT 
  election_id,
  COUNT(*) as total_voters,
  SUM(CASE WHEN has_voted THEN 1 ELSE 0 END) as voted_count,
  (SUM(CASE WHEN has_voted THEN 1 ELSE 0 END)::FLOAT / NULLIF(COUNT(*), 0) * 100) as participation_rate
FROM voters
GROUP BY election_id;

-- Note: In a real app, you would also need policies allowing Voters (authenticated via their voter_key) 
-- to SELECT their own record and execute the submit_ballot RPC. This can be done via Supabase RPC or custom claims.