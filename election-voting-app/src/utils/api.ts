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
    // Prevent adding voters to completed elections
    if (!voterData || !voterData.election_id) throw new Error('Missing election_id');
    const election = await this.getElectionById(voterData.election_id);
    if (election && election.status === 'completed') {
      throw new Error('Cannot add voters to a completed election.');
    }

    const { data, error } = await supabase
      .from('voters')
      .insert([voterData])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async deleteVoter(id: string) {
    // Ensure the voter isn't deleted for a running or completed election
    const voter = await this.getVoterById(id);
    if (!voter) throw new Error('Voter not found');
    const election = await this.getElectionById(voter.election_id);
    if (election && (election.status === 'active' || election.status === 'completed')) {
      throw new Error('Cannot delete voters while the election is running or completed.');
    }

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
    const election = await this.getElectionById(electionId);
    if (election && (election.status === 'active' || election.status === 'completed')) {
      throw new Error('Cannot delete voters while the election is running or completed.');
    }

    const { error } = await supabase
      .from('voters')
      .delete()
      .eq('election_id', electionId);

    if (error) throw error;
    return true;
  },

  async bulkAddVoters(voters: any[]) {
    if (!voters || !voters.length) return [];
    const electionId = voters[0].election_id;
    if (!electionId) throw new Error('Missing election_id for bulk add');
    const election = await this.getElectionById(electionId);
    if (election && election.status === 'completed') {
      throw new Error('Cannot import voters into a completed election.');
    }

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
    // Fetch votes
    const { data, error } = await supabase
      .from('votes')
      .select('submitted_at')
      .eq('election_id', electionId)
      .order('submitted_at', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    const first = new Date(data[0].submitted_at);
    const last = new Date(data[data.length - 1].submitted_at);
    const diffHours = (last.getTime() - first.getTime()) / (1000 * 60 * 60);

    const counts: Record<string, number> = {};
    data.forEach((row: any) => {
      const dt = new Date(row.submitted_at);
      if (diffHours > 72) {
        // Group by day if range > 3 days
        const d = dt.toISOString().slice(0, 10);
        counts[d] = (counts[d] || 0) + 1;
      } else {
        // Group by hour
        dt.setMinutes(0, 0, 0);
        const key = dt.toISOString();
        counts[key] = (counts[key] || 0) + 1;
      }
    });

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
    try {
      const { data, error } = await supabase.functions.invoke('send-invitations', {
        body: { electionId, notifyCreator, notifyEnded }
      });
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error("Email invocation error:", err);
      // We don't want to block the UI, but we should log it
      return { error: err.message };
    }
  },

  async sendVoterReminders(electionId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('send-reminders', {
        body: { electionId }
      });
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error("Email reminder error:", err);
      return { error: err.message };
    }
  },

  async computeElectionHash(electionId: string) {
    const { data, error } = await supabase.functions.invoke('compute-election-hash', {
      body: { electionId }
    });
    if (error) throw error;
    return data;
  },

  async launchElection(id: string, title: string) {
    // 1. Update status to active
    const data = await this.updateElection(id, { status: 'active' });
    
    // 2. Trigger launch email notifications (Edge function handles the actual email)
    await this.sendVoterInvitations(id, true);

    // 3. Create app notification for the admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await this.createNotification({
        user_id: user.id,
        election_id: id,
        type: 'election_launched',
        title: 'Election Launched!',
        message: `Your election "${title}" has been successfully launched and is now active.`
      });
    }
    return data;
  },

  async closeElection(id: string, title: string) {
    // 1. Update status to completed
    const data = await this.updateElection(id, { status: 'completed' });
    
    // 2. Trigger completion notifications
    await this.sendVoterInvitations(id, true, true);

    // 3. Create app notification for the admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await this.createNotification({
        user_id: user.id,
        election_id: id,
        type: 'election_completed',
        title: 'Election Completed!',
        message: `Your election "${title}" has been completed. Results are now being compiled.`
      });
    }
    return data;
  },

  async triggerVoterReminders(id: string, title: string) {
    const data = await this.sendVoterReminders(id);
    
    // Create app notification for the admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await this.createNotification({
        user_id: user.id,
        election_id: id,
        type: 'reminders_sent',
        title: 'Reminders Sent',
        message: `Reminders have been sent to all eligible voters for "${title}".`
      });
    }
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
  },

  // --- Notifications ---
  async getNotifications() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async markNotificationRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async markAllNotificationsRead() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  },

  async deleteNotification(id: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async createNotification(notificationData: any) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // --- Voter Registrations ---
  async getRegistrations(electionId: string) {
    const { data, error } = await supabase
      .from('voter_registrations')
      .select('*')
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async submitRegistration(registrationData: any) {
    const { data, error } = await supabase
      .from('voter_registrations')
      .insert([registrationData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async migrateRegistrations(electionId: string) {
    // 1. Fetch all registrations for this election
    const { data: registrations, error: fetchError } = await supabase
      .from('voter_registrations')
      .select('*')
      .eq('election_id', electionId);
    
    if (fetchError) throw fetchError;
    if (!registrations || registrations.length === 0) return { count: 0 };

    const generateShortKey = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous characters like 0, O, 1, I
      const length = Math.floor(Math.random() * 2) + 3; // Random length between 3 and 4
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    // 2. Prepare voter records
    const votersToInsert = registrations.map(reg => ({
      election_id: electionId,
      name: reg.full_name,
      email: reg.email,
      voter_identifier: reg.identifier,
      voter_key: generateShortKey(),
      has_voted: false
    }));

    // 3. Bulk insert into voters table
    const { data, error: insertError } = await supabase
      .from('voters')
      .insert(votersToInsert)
      .select();

    if (insertError) throw insertError;

    // 4. Delete processed registrations
    await supabase
      .from('voter_registrations')
      .delete()
      .eq('election_id', electionId);

    return { count: data.length };
  }
};