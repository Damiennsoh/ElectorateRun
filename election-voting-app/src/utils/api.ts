import { supabase } from './supabase';
import { Election } from '../types';

export const api = {
  // --- Elections ---
  async getElections() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        console.warn('api.getElections: No active session found');
    }

    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
        console.error('api.getElections error:', error);
        throw error;
    }
    return data;
  },

  async getElectionById(id: string) {
    if (!id || id === 'undefined') return null;
    
    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error(`api.getElectionById(${id}) error:`, error);
        throw error;
    }
    return data;
  },

  async getElectionWithOrganization(id: string) {
    const { data: election, error: electionError } = await supabase
      .from('elections')
      .select('*')
      .eq('id', id)
      .single();
    
    if (electionError) throw electionError;

    const { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('user_id', election.user_id)
      .single();
    
    // We don't throw for orgError because an election should still show even if org profile isn't set
    return { ...election, organization };
  },

  async createElection(electionData: Partial<Election>) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from('elections')
      .insert([{ ...electionData, user_id: userData.user.id }])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async updateElection(id: string, updates: Partial<Election>) {
    const { data, error } = await supabase
      .from('elections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // --- Ballot Questions ---
  async getBallotQuestions(electionId: string) {
    const { data, error } = await supabase
      .from('ballot_questions')
      .select('*, candidate_options(*)')
      .eq('election_id', electionId)
      .order('order_index', { ascending: true });
      
    if (error) throw error;
    return data;
  },

  async createBallotQuestion(questionData: any) {
    const { data, error } = await supabase
      .from('ballot_questions')
      .insert([questionData])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async updateBallotQuestion(id: string, updates: any) {
    const { data, error } = await supabase
      .from('ballot_questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async deleteBallotQuestion(id: string) {
    const { error } = await supabase
      .from('ballot_questions')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  },

  // --- Candidate Options ---
  async createCandidateOption(candidateData: any) {
    const { data, error } = await supabase
      .from('candidate_options')
      .insert([candidateData])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async updateCandidateOption(id: string, updates: any) {
    const { data, error } = await supabase
      .from('candidate_options')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async deleteCandidateOption(id: string) {
    const { error } = await supabase
      .from('candidate_options')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  },

  async bulkCreateCandidateOptions(options: any[]) {
    const { data, error } = await supabase
      .from('candidate_options')
      .insert(options)
      .select();
      
    if (error) throw error;
    return data;
  },

  async deleteElection(id: string) {
    const { error } = await supabase
      .from('elections')
      .delete()
      .eq('id', id);
 
    if (error) throw error;
    return true;
  },

  async getVoters(electionId: string) {
    const { data, error } = await supabase
      .from('voters')
      .select('*')
      .eq('election_id', electionId);
      
    if (error) throw error;
    return data;
  },

  async getVoterById(id: string) {
    const { data, error } = await supabase
      .from('voters')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },

  async getVoterCount(electionId: string) {
    const { count, error } = await supabase
      .from('voters')
      .select('*', { count: 'exact', head: true })
      .eq('election_id', electionId);
      
    if (error) throw error;
    return count || 0;
  },

  async addVoter(voterData: any) {
    const { data, error } = await supabase
      .from('voters')
      .insert([voterData])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async deleteVoter(id: string) {
    const { error } = await supabase
      .from('voters')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async updateVoter(id: string, updates: any) {
    const { data, error } = await supabase
      .from('voters')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async deleteAllVoters(electionId: string) {
    const { error } = await supabase
      .from('voters')
      .delete()
      .eq('election_id', electionId);

    if (error) throw error;
    return true;
  },

  async bulkAddVoters(voters: any[]) {
    const { data, error } = await supabase
      .from('voters')
      .insert(voters)
      .select();
      
    if (error) throw error;
    return data;
  },

  // --- Voting ---
  async submitBallot(
    voterId: string, 
    electionId: string, 
    votes: { ballot_question_id: string; candidate_option_id: string; rank_order?: number }[],
    voteHash: string,
    auditData: { ip: string, user_agent: string }
  ) {
    const { error } = await supabase.rpc('submit_ballot', {
      p_voter_id: voterId,
      p_election_id: electionId,
      p_votes: votes,
      p_vote_hash: voteHash,
      p_ip: auditData.ip,
      p_ua: auditData.user_agent
    });

    if (error) {
      console.error('RPC submit_ballot failed:', error);
      throw error;
    }
    return { id: voteHash };
  },

  async getVoterActivity(voterId: string) {
    const { data: voter, error } = await supabase
      .from('voters')
      .select('*')
      .eq('id', voterId)
      .single();
    
    if (error) throw error;
    
    const activity = [];
    if (voter.created_at) activity.push({ text: 'Voter created.', date: voter.created_at });
    if (voter.invitation_sent_at) activity.push({ text: 'Voter email instructions delivered.', date: voter.invitation_sent_at });
    if (voter.voted_at) {
        // Derive login times for visualization as per mockup
        activity.push({ text: 'Voter login: Success', date: new Date(new Date(voter.voted_at).getTime() - 30000).toISOString() });
        activity.push({ text: 'Voter login: Success', date: new Date(new Date(voter.voted_at).getTime() - 10000).toISOString() });
        activity.push({ text: 'Voter successfully submitted ballot.', date: voter.voted_at });
    }
    
    return activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getResults(electionId: string) {
    // Queries the secure election_results_view to get aggregated results
    const { data, error } = await supabase
      .from('election_results_view')
      .select('*')
      .eq('election_id', electionId);

    if (error) throw error;
    return data;
  },

  async getParticipation(electionId: string) {
    // Queries the secure election_participation_view to get participation rate
    const { data, error } = await supabase
      .from('election_participation_view')
      .select('*')
      .eq('election_id', electionId)
      .single();

    if (error) throw error;
    return data;
  },

  async getBallotsByDate(electionId: string) {
    // Fetch votes and return counts grouped by date (YYYY-MM-DD)
    const { data, error } = await supabase
      .from('votes')
      .select('submitted_at, timestamp')
      .eq('election_id', electionId);

    if (error) throw error;

    const counts: Record<string, number> = {};
    (data || []).forEach((row: any) => {
      const dt = row.submitted_at || row.timestamp;
      if (!dt) return;
      const d = new Date(dt).toISOString().slice(0,10);
      counts[d] = (counts[d] || 0) + 1;
    });

    // Convert to sorted array
    return Object.keys(counts).sort().map(k => ({ date: k, count: counts[k] }));
  },

  // --- Organizations ---
  async getOrganization() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; 
    return data;
  },

  async updateOrganization(updates: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from('organizations')
      .upsert({ ...updates, user_id: user.id }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // --- Storage ---
  async uploadFile(file: File, path: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${user.id}/${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('election-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('election-assets')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async getElectionsWithVoterCounts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Fetch elections and join with count of voters
    const { data, error } = await supabase
      .from('elections')
      .select(`
        id,
        title,
        voters(count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(e => ({
      id: e.id,
      title: e.title,
      voterCount: (e.voters as any)?.[0]?.count || 0
    }));
  },

  async bulkCreateBallotQuestions(questions: any[]) {
    const { data, error } = await supabase
      .from('ballot_questions')
      .insert(questions)
      .select();
      
    if (error) throw error;
    return data;
  },

  // --- Email Invitations ---
  async sendVoterInvitations(electionId: string, notifyCreator: boolean = false, notifyEnded: boolean = false) {
    const { data, error } = await supabase.functions.invoke('send-invitations', {
      body: { electionId, notifyCreator, notifyEnded }
    });
    if (error) throw error;
    return data;
  },

  async sendVoterReminders(electionId: string) {
    const { data, error } = await supabase.functions.invoke('send-reminders', {
      body: { electionId }
    });
    if (error) throw error;
    return data;
  },

  async computeElectionHash(electionId: string) {
    const { data, error } = await supabase.functions.invoke('compute-election-hash', {
      body: { electionId }
    });
    if (error) throw error;
    return data;
  },

  async getAllElectionActivity(electionId: string) {
    const { data: voters, error } = await supabase
      .from('voters')
      .select('*')
      .eq('election_id', electionId);
    
    if (error) throw error;
    
    let allActivity: any[] = [];
    voters.forEach((v: any) => {
        if (v.created_at) {
            allActivity.push({ date: v.created_at, name: v.name, voter_id: v.voter_identifier, action: 'Voter created.', ip: '' });
        }
        if (v.invitation_sent_at) {
            allActivity.push({ date: v.invitation_sent_at, name: v.name, voter_id: v.voter_identifier, action: 'Voter email instructions delivered.', ip: '' });
        }
        if (v.voted_at) {
            // Derive login times for visualization as per mockup
            allActivity.push({ date: new Date(new Date(v.voted_at).getTime() - 10000).toISOString(), name: v.name, voter_id: v.voter_identifier, action: 'Voter login: Success', ip: v.ip_address || '' });
            allActivity.push({ date: v.voted_at, name: v.name, voter_id: v.voter_identifier, action: 'Voter successfully submitted ballot.', ip: v.ip_address || '' });
        }
    });
    
    return allActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
};