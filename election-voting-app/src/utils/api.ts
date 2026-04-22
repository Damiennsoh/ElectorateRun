import { supabase } from './supabase';
import { Election, Voter, BallotQuestion, Candidate, Vote } from '../types';

export const api = {
  // --- Elections ---
  async getElections() {
    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getElectionById(id: string) {
    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getElectionWithOrganization(id: string) {
    const { data: election, error: electionError } = await supabase
      .from('elections')
      .select('*')
      .eq('id', id)
      .single();
    
    if (electionError) throw electionError;

    const { data: organization, error: orgError } = await supabase
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
    votes: { ballot_question_id: string; candidate_option_id: string }[],
    voteHash: string
  ) {
    const { data, error } = await supabase.rpc('submit_ballot', {
      p_voter_id: voterId,
      p_election_id: electionId,
      p_votes: votes,
      p_vote_hash: voteHash
    });

    if (error) throw error;
    return data;
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
  async sendVoterInvitations(electionId: string) {
    const { data, error } = await supabase.functions.invoke('send-invitations', {
      body: { electionId }
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
  }
};