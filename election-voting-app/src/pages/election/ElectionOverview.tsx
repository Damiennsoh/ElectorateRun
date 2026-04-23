import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ElectionSidebarLayout } from '../../components/layout/ElectionSidebarLayout';
import { FiHome, FiCopy, FiGlobe, FiUsers, FiHelpCircle, FiList, FiCheckCircle } from 'react-icons/fi';
import { api } from '../../utils/api';
import { Election } from '../../types';

export const ElectionOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [election, setElection] = useState<Election | null>(null);
  const [stats, setStats] = useState({ voters: 0, questions: 0, options: 0, votesCast: 0 });
  const [orgSubdomain, setOrgSubdomain] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState('');
  const [submissionsByDate, setSubmissionsByDate] = useState<{date:string,count:number}[]>([]);

  useEffect(() => {
    if (id) {
      fetchElectionDetails(id);
    }
  }, [id]);

  useEffect(() => {
    if (!election?.end_date) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(election.end_date).getTime();
      const start = new Date(election.start_date!).getTime();
      
      const isRunning = election.status === 'active';
      const isScheduled = election.status === 'draft' && now < start;

      if (isRunning) {
        const diff = end - now;
        if (diff <= 0) {
            setCountdown('Election has ended');
            clearInterval(timer);
            handleAutoClose();
            return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`Your election is running and will automatically end in ${days > 0 ? days + ' days ' : ''}${hours} hours ${minutes} minutes ${seconds} seconds`);
      } else if (isScheduled) {
        const diff = start - now;
        if (diff <= 0) {
            setCountdown('Election is starting...');
            clearInterval(timer);
            return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`Your election is scheduled to start in ${days > 0 ? days + ' day ' : ''}${hours} hour ${minutes} minutes ${seconds} seconds`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [election]);

  const handleAutoClose = async () => {
    if (!id || election?.status !== 'active') return;
    try {
      await api.updateElection(id, { status: 'completed' });
      await api.sendVoterInvitations(id, false, true);
      fetchElectionDetails(id);
    } catch (err) {
      console.error("Error during auto-close:", err);
    }
  };

  const fetchElectionDetails = async (electionId: string) => {
    try {
      const [electionData, votersData, questionsData, orgData] = await Promise.all([
        api.getElectionById(electionId),
        api.getVoters(electionId),
        api.getBallotQuestions(electionId),
        api.getOrganization()
      ]);

      setElection(electionData as unknown as Election);
      setOrgSubdomain(orgData?.subdomain || null);
      
      const totalOptions = (questionsData as any[]).reduce((acc, question) => {
        return acc + (question.candidate_options?.length || 0);
      }, 0);

      const votesCast = votersData?.filter((v: any) => v.has_voted).length || 0;

      setStats({
        voters: votersData?.length || 0,
        questions: questionsData?.length || 0,
        options: totalOptions,
        votesCast
      });

      // Fetch ballots by date for the chart
      try {
        const byDate = await api.getBallotsByDate(electionId);
        setSubmissionsByDate(byDate || []);
      } catch (e) {
        console.warn('Failed to load ballots by date', e);
      }
    } catch (error) {
      console.error('Error fetching election details:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) return <ElectionSidebarLayout><div className="p-20 text-center text-gray-500">Loading...</div></ElectionSidebarLayout>;
  if (!election) return <ElectionSidebarLayout><div className="p-20 text-center text-red-500">Election not found.</div></ElectionSidebarLayout>;

  const baseUrl = (import.meta.env.VITE_PUBLIC_URL as string) || 'https://vote.electorateun.com';
  const baseOrg = (import.meta.env.VITE_PUBLIC_URL_ORG as string) || 'https://electorateun.com';
  const electionUrl = `${baseUrl}/election/${id}`;
  const orgUrl = `${orgSubdomain ? `https://${orgSubdomain}.` : ''}${baseOrg.replace(/^https?:\/\//, '')}`;

  const participationRate = stats.voters > 0 ? Math.round((stats.votesCast / stats.voters) * 100) : 0;

  return (
    <ElectionSidebarLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <h2 className="text-[17px] font-bold text-[#333] flex items-center gap-2">
          <FiHome className="text-gray-800" /> Overview
        </h2>

        {/* Status Banners */}
        {election.status === 'draft' && (
            <div className="bg-[#FFF5EB] border border-[#FFD8B1] p-4 rounded text-center text-[#975A16] font-medium text-[15px] flex items-center justify-center gap-2">
                {countdown || 'Election is being prepared'}
            </div>
        )}

        {election.status === 'active' && (
            <div className="bg-[#E6F9EA] border border-[#00D02D]/30 p-4 rounded text-center text-[#00D02D] font-medium text-[15px] flex items-center justify-center gap-2">
                {countdown || 'Your election is running'}
            </div>
        )}

        {election.status === 'completed' && (
            <div className="bg-[#00D02D] p-4 rounded text-center text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-sm animate-fade-in">
                This election ended on {new Date(election.end_date!).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true })}. 
                <button onClick={() => window.location.href=`/election/${id}/results`} className="underline ml-2 hover:opacity-80 transition-opacity">View Results »</button>
            </div>
        )}

        {/* For completed elections: show full-width chart and horizontal stat cards */}
        {election.status === 'completed' ? (
          <>
            <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 text-[18px]">Ballots Submitted <span className="text-gray-400 font-normal">By Date</span></h3>
              </div>
              <div className="p-6">
                <div className="h-[220px] flex items-end">
                  <svg width="100%" height="220" className="block">
                    {/* compute simple bars */}
                    {submissionsByDate.length === 0 && (
                      <text x="50%" y="50%" textAnchor="middle" fill="#cbd5e1">No submissions</text>
                    )}
                    {submissionsByDate.length > 0 && (() => {
                      const max = Math.max(...submissionsByDate.map(d => d.count));
                      const gap = 100 / submissionsByDate.length;
                      return submissionsByDate.map((d, i) => {
                        const h = (d.count / max) * 160;
                        const x = (i * (100 / submissionsByDate.length));
                        return (
                          <rect key={d.date} x={`${x}%`} y={180 - h} width={`${gap - 6}%`} height={h} fill="#00AEEF" />
                        );
                      });
                    })()}
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex gap-6 mt-6">
              {(election.status === 'active' || election.status === 'completed') && (
                <div className="bg-[#00D02D] rounded p-6 text-white flex-1 text-center shadow-sm">
                  <FiCheckCircle className="opacity-10 w-12 h-12 mx-auto" />
                  <div className="text-4xl font-bold mt-2">{participationRate}%</div>
                  <div className="text-xs font-bold uppercase tracking-widest mt-2">Participation ({stats.votesCast} Voters)</div>
                </div>
              )}

              <div className="bg-[#FF6A13] rounded p-6 text-white flex-1 text-center shadow-sm">
                <FiUsers className="opacity-10 w-12 h-12 mx-auto" />
                <div className="text-4xl font-bold mt-2">{stats.voters}</div>
                <div className="text-xs font-bold uppercase tracking-widest mt-2">Voters</div>
              </div>

              <div className="bg-[#FF0080] rounded p-6 text-white flex-1 text-center shadow-sm">
                <FiHelpCircle className="opacity-10 w-12 h-12 mx-auto" />
                <div className="text-4xl font-bold mt-2">{stats.questions}</div>
                <div className="text-xs font-bold uppercase tracking-widest mt-2">Ballot Questions</div>
              </div>

              <div className="bg-[#603FEF] rounded p-6 text-white flex-1 text-center shadow-sm">
                <FiList className="opacity-10 w-12 h-12 mx-auto" />
                <div className="text-4xl font-bold mt-2">{stats.options}</div>
                <div className="text-xs font-bold uppercase tracking-widest mt-2">Options</div>
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              {/* Charts Section for Running Election */}
              { (election.status === 'active' || election.status === 'draft') && (
                <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 text-[18px]">Ballots Submitted <span className="text-gray-400 font-normal">By Date</span></h3>
                  </div>
                  <div className="p-8 h-[250px] flex items-end justify-between relative">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 pointer-events-none">
                      <svg width="100%" height="100%" className="opacity-20">
                        <path d="M0 200 Q 150 150, 300 180 T 600 100 T 900 140" fill="none" stroke="#00AEEF" strokeWidth="2" />
                      </svg>
                    </div>
                    <div className="w-full h-[1px] bg-[#00AEEF] absolute bottom-8 opacity-50"></div>
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-[#00AEEF] mb-[-4px] relative z-10"></div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                  <FiGlobe className="text-gray-800" />
                  <h3 className="font-bold text-gray-800 text-sm">Voting URLs</h3>
                </div>
                <div className="p-8 space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[13px] font-bold text-gray-700">Election URL</label>
                    </div>
                    <div className="flex">
                      <input readOnly value={electionUrl} className="flex-1 px-3 py-2 bg-[#F9FBFC] border border-gray-200 rounded-l outline-none text-[15px] text-gray-600" />
                      <button onClick={() => copyToClipboard(electionUrl)} className="px-5 py-2 bg-white border border-gray-200 border-l-0 rounded-r flex items-center gap-2 text-[14px] font-bold text-gray-700 hover:bg-gray-50">
                        <FiCopy /> Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[13px] font-bold text-gray-700">Short URL</label>
                    </div>
                    <div className="flex">
                      <input readOnly placeholder=" " className="flex-1 px-3 py-2 bg-[#F9FBFC] border border-gray-200 rounded-l outline-none text-[15px] text-gray-600" />
                      <button className="px-5 py-2 bg-white border border-gray-200 border-l-0 rounded-r flex items-center gap-2 text-[14px] font-bold text-gray-700 hover:bg-gray-50">
                        <FiCopy /> Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[13px] font-bold text-gray-700">Organization Subdomain</label>
                    </div>
                    <div className="flex">
                      <input readOnly value={orgUrl} className="flex-1 px-3 py-2 bg-[#F9FBFC] border border-gray-200 rounded-l outline-none text-[15px] text-gray-600" />
                      <button onClick={() => copyToClipboard(orgUrl)} className="px-5 py-2 bg-white border border-gray-200 border-l-0 rounded-r flex items-center gap-2 text-[14px] font-bold text-gray-700 hover:bg-gray-50">
                        <FiCopy /> Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {(election.status === 'active' || election.status === 'completed') && (
                <div className="bg-[#00D02D] rounded p-6 text-white relative overflow-hidden flex flex-col items-end shadow-sm">
                  <FiCheckCircle className="absolute left-[-20px] top-[-10px] w-32 h-32 opacity-10 rotate-12" />
                  <div className="text-5xl font-bold relative z-10">{participationRate}%</div>
                  <div className="text-xs font-bold uppercase tracking-widest mt-2 relative z-10">Participation ({stats.votesCast} Voters)</div>
                </div>
              )}

              <div className="bg-[#FF6A13] rounded p-6 text-white relative overflow-hidden flex flex-col items-end shadow-sm">
                <FiUsers className="absolute left-[-20px] top-[-10px] w-32 h-32 opacity-10 rotate-12" />
                <div className="text-5xl font-bold relative z-10">{stats.voters}</div>
                <div className="text-xs font-bold uppercase tracking-widest mt-2 relative z-10">Voters</div>
              </div>

              <div className="bg-[#FF0080] rounded p-6 text-white relative overflow-hidden flex flex-col items-end shadow-sm">
                <FiHelpCircle className="absolute left-[-20px] top-[-10px] w-32 h-32 opacity-10 rotate-12" />
                <div className="text-5xl font-bold relative z-10">{stats.questions}</div>
                <div className="text-xs font-bold uppercase tracking-widest mt-2 relative z-10">Ballot Questions</div>
              </div>

              <div className="bg-[#603FEF] rounded p-6 text-white relative overflow-hidden flex flex-col items-end shadow-sm">
                <FiList className="absolute left-[-20px] top-[-10px] w-32 h-32 opacity-10 rotate-12" />
                <div className="text-5xl font-bold relative z-10">{stats.options}</div>
                <div className="text-xs font-bold uppercase tracking-widest mt-2 relative z-10">Options</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ElectionSidebarLayout>
  );
};