-- ElectorateRun Supabase Schema (Idempotent Version)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. Safely Create Enums
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'election_status') THEN
        CREATE TYPE election_status AS ENUM ('draft', 'building', 'active', 'completed', 'archived');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type') THEN
        CREATE TYPE question_type AS ENUM ('multiple_choice', 'ranked_choice', 'yes_no');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'option_type') THEN
        CREATE TYPE option_type AS ENUM ('standard', 'write-in');
    END IF;
END $$;

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) DEFAULT 'Organization Name',
    subdomain VARCHAR(100) UNIQUE,
    location VARCHAR(255),
    city VARCHAR(100),
    state_region VARCHAR(100),
    show_in_search BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id) -- One org per user for now
);

-- 2. Elections
CREATE TABLE IF NOT EXISTS elections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    timezone VARCHAR(50) DEFAULT 'UTC',
    status election_status DEFAULT 'building',
    settings JSONB DEFAULT '{}'::jsonb, 
    is_results_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Ballot Questions
CREATE TABLE IF NOT EXISTS ballot_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type question_type DEFAULT 'multiple_choice',
    min_selections INTEGER DEFAULT 1,
    max_selections INTEGER DEFAULT 1,
    randomize_options BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Candidate Options
CREATE TABLE IF NOT EXISTS candidate_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ballot_question_id UUID REFERENCES ballot_questions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    short_description VARCHAR(255),
    description TEXT,
    photo_url TEXT,
    type option_type DEFAULT 'standard',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Voters
CREATE TABLE IF NOT EXISTS voters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    name VARCHAR(255),
    voter_identifier VARCHAR(255) NOT NULL,
    voter_key VARCHAR(255),
    email VARCHAR(255),
    vote_weight NUMERIC DEFAULT 1.0,
    has_voted BOOLEAN DEFAULT false,
    voted_at TIMESTAMPTZ,
    invitation_sent_at TIMESTAMPTZ,
    reminder_sent_at TIMESTAMPTZ,
    ip_address VARCHAR(45),
    user_agent TEXT,
    ballot_receipt VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(election_id, voter_identifier)
);

-- 6. Votes
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES voters(id) ON DELETE SET NULL,
    vote_hash VARCHAR(255) UNIQUE,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Vote Choices
CREATE TABLE IF NOT EXISTS vote_choices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vote_id UUID REFERENCES votes(id) ON DELETE CASCADE,
    ballot_question_id UUID REFERENCES ballot_questions(id) ON DELETE CASCADE,
    candidate_option_id UUID REFERENCES candidate_options(id) ON DELETE CASCADE,
    rank_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) Policies
-- Using DROP POLICY IF EXISTS to avoid errors on re-run

-- Elections
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own elections" ON elections;
CREATE POLICY "Users can manage their own elections" ON elections FOR ALL USING (auth.uid() = user_id);

-- Questions
ALTER TABLE ballot_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their election questions" ON ballot_questions;
CREATE POLICY "Users can manage their election questions" ON ballot_questions FOR ALL USING (
    EXISTS (SELECT 1 FROM elections WHERE elections.id = ballot_questions.election_id AND elections.user_id = auth.uid())
);

-- Options
ALTER TABLE candidate_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their candidate options" ON candidate_options;
CREATE POLICY "Users can manage their candidate options" ON candidate_options FOR ALL USING (
    EXISTS (
        SELECT 1 FROM ballot_questions
        JOIN elections ON elections.id = ballot_questions.election_id
        WHERE ballot_questions.id = candidate_options.ballot_question_id
        AND elections.user_id = auth.uid()
    )
);

-- Voters
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage voters for their elections" ON voters;
CREATE POLICY "Users can manage voters for their elections" ON voters FOR ALL USING (
    EXISTS (SELECT 1 FROM elections WHERE elections.id = voters.election_id AND elections.user_id = auth.uid())
);

-- Votes & Choices
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see votes for their elections" ON votes;
CREATE POLICY "Users can see votes for their elections" ON votes FOR SELECT USING (
    EXISTS (SELECT 1 FROM elections WHERE elections.id = votes.election_id AND elections.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Anyone can submit a vote" ON votes;
CREATE POLICY "Anyone can submit a vote" ON votes FOR INSERT WITH CHECK (true);

ALTER TABLE vote_choices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit vote choices" ON vote_choices;
CREATE POLICY "Anyone can submit vote choices" ON vote_choices FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can see vote choices for their elections" ON vote_choices;
CREATE POLICY "Users can see vote choices for their elections" ON vote_choices FOR SELECT USING (
    EXISTS (SELECT 1 FROM votes JOIN elections ON elections.id = votes.election_id WHERE votes.id = vote_choices.vote_id AND elections.user_id = auth.uid())
);

-- Organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own organization" ON organizations;
CREATE POLICY "Users can manage their own organization" ON organizations FOR ALL USING (auth.uid() = user_id);

-- Functions & Triggers
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_elections_modtime ON elections;
CREATE TRIGGER update_elections_modtime
BEFORE UPDATE ON elections
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Atomic Voting Function
CREATE OR REPLACE FUNCTION submit_ballot(
  p_voter_id UUID,
  p_election_id UUID,
  p_votes JSONB, -- Array of {ballot_question_id, candidate_option_id, rank_order}
  p_vote_hash VARCHAR(255)
)
RETURNS VOID AS $$
DECLARE
  v_vote_id UUID;
  v_vote_item RECORD;
BEGIN
  -- 1. Verify voter hasn't voted
  IF EXISTS (SELECT 1 FROM voters WHERE id = p_voter_id AND has_voted = true) THEN
    RAISE EXCEPTION 'Voter has already cast a ballot';
  END IF;

    -- 1b. Verify election is active
    IF NOT EXISTS (SELECT 1 FROM elections WHERE id = p_election_id AND status = 'active') THEN
        RAISE EXCEPTION 'Voting is closed for this election';
    END IF;

  -- 2. Create the Vote record
  INSERT INTO votes (election_id, voter_id, vote_hash)
  VALUES (p_election_id, p_voter_id, p_vote_hash)
  RETURNING id INTO v_vote_id;

  -- 3. Create Vote Choices
  FOR v_vote_item IN SELECT * FROM jsonb_to_recordset(p_votes) AS x(ballot_question_id UUID, candidate_option_id UUID, rank_order INTEGER) LOOP
    INSERT INTO vote_choices (vote_id, ballot_question_id, candidate_option_id, rank_order)
    VALUES (v_vote_id, v_vote_item.ballot_question_id, v_vote_item.candidate_option_id, v_vote_item.rank_order);
  END LOOP;

  -- 4. Mark Voter as voted
  UPDATE voters SET 
    has_voted = true, 
    voted_at = NOW() 
  WHERE id = p_voter_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage Bucket Setup (Run these manually in SQL editor if they fail in the script)
-- Note: storage schema might be locked depending on your Supabase permissions
INSERT INTO storage.buckets (id, name, public) 
VALUES ('election-assets', 'election-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- Note: These might require manual adjustment in the Supabase Storage Dashboard if they fail here
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'election-assets');

DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'election-assets');

-- 8. Views for Real-time Results & Participation
-- These views are used by the Results page to show live updates

-- election_results_view: Aggregates votes per candidate option
CREATE OR REPLACE VIEW election_results_view AS
SELECT 
    e.id AS election_id,
    bq.id AS question_id,
    bq.title AS question_title,
    co.id AS option_id,
    co.title AS option_title,
    co.photo_url,
    COUNT(vc.id) AS vote_count,
    SUM(v.vote_weight) AS weighted_vote_count
FROM elections e
JOIN ballot_questions bq ON bq.election_id = e.id
JOIN candidate_options co ON co.ballot_question_id = bq.id
LEFT JOIN vote_choices vc ON vc.candidate_option_id = co.id
LEFT JOIN votes vt ON vt.id = vc.vote_id
LEFT JOIN voters v ON v.id = vt.voter_id
GROUP BY e.id, bq.id, bq.title, co.id, co.title, co.photo_url;

-- election_participation_view: Calculates total vs voted counts
CREATE OR REPLACE VIEW election_participation_view AS
SELECT 
    election_id,
    COUNT(id) AS total_voters,
    COUNT(id) FILTER (WHERE has_voted = true) AS voted_count,
    CASE 
        WHEN COUNT(id) = 0 THEN 0 
        ELSE (COUNT(id) FILTER (WHERE has_voted = true)::FLOAT / COUNT(id)::FLOAT) * 100 
    END AS participation_rate
FROM voters
GROUP BY election_id;

-- Ensure RLS doesn't block the views (Supabase handles this via the underlying tables, but we grant access)
GRANT SELECT ON election_results_view TO authenticated;
GRANT SELECT ON election_participation_view TO authenticated;
GRANT SELECT ON election_results_view TO anon;
GRANT SELECT ON election_participation_view TO anon;
