export interface ElectionSettings {
  hide_results?: boolean;
  allow_duplicate_write_in?: boolean;
  weighted_voting?: boolean;
  ballot_receipt?: boolean;
  submit_ballot_confirmation?: boolean;
  email?: {
    enabled: boolean;
    auto_login: boolean;
    from_name: string;
    subject: string;
  };
}

export interface Election {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'draft' | 'building' | 'active' | 'completed' | 'archived';
  start_date: string;
  end_date: string;
  timezone: string;
  is_results_published?: boolean;
  results_hash?: string;
  settings?: ElectionSettings;
  created_at: string;
  updated_at: string;
}

export interface Voter {
  id: string;
  election_id: string;
  email: string;
  name: string;
  voter_identifier: string;
  voter_key: string;
  has_voted: boolean;
  voted_at?: string;
  vote_weight?: number;
  ip_address?: string;
  user_agent?: string;
  ballot_receipt?: string;
}

export interface BallotQuestion {
  id: string;
  election_id: string;
  title: string;
  description: string;
  type: 'multiple_choice' | 'yes_no' | 'ranked_choice';
  min_selections: number;
  max_selections: number;
  randomize_options: boolean;
  order_index: number;
  attachments?: any[];
  candidate_options: CandidateOption[];
}

export interface CandidateOption {
  id: string;
  ballot_question_id: string;
  title: string;
  short_description?: string;
  description?: string;
  photo_url?: string;
  type: 'standard' | 'write-in';
  order_index: number;
}

export interface Vote {
  id: string;
  voterId: string;
  ballotQuestionId: string;
  candidateId: string;
  timestamp: Date;
}

export interface ElectionStats {
  totalVoters: number;
  participatedVoters: number;
  participationRate: number;
  totalBallotQuestions: number;
  totalOptions: number;
  ballotsSubmittedByDate: { date: string; count: number }[];
}

export interface ElectionResult {
  ballotQuestion: BallotQuestion;
  results: {
    candidate: CandidateOption;
    votes: number;
    percentage: number;
  }[];
}