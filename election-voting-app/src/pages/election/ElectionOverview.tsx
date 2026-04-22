import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ElectionSidebarLayout } from '../../components/layout/ElectionSidebarLayout';
import { FiHome, FiCopy, FiGlobe, FiUsers, FiHelpCircle, FiList, FiClock } from 'react-icons/fi';
import { api } from '../../utils/api';
import { Election } from '../../types';

export const ElectionOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [election, setElection] = useState<Election | null>(null);
  const [stats, setStats] = useState({ voters: 0, questions: 0, options: 0 });
  const [orgSubdomain, setOrgSubdomain] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (id) {
      fetchElectionDetails(id);
    }
  }, [id]);

  useEffect(() => {
    if (!election?.start_date) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(election.start_date).getTime();
      const diff = start - now;

      if (diff <= 0) {
        setCountdown('Election has started');
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(`Your election is scheduled to start in ${days > 0 ? days + ' day ' : ''}${hours} hour ${minutes} minutes ${seconds} seconds`);
    }, 1000);

    return () => clearInterval(timer);
  }, [election]);

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

      setStats({
        voters: votersData?.length || 0,
        questions: questionsData?.length || 0,
        options: totalOptions
      });
    } catch (error) {
      console.error('Error fetching election details:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Custom toast or alert
  };

  if (loading) return <ElectionSidebarLayout><div className="p-20 text-center text-gray-500">Loading...</div></ElectionSidebarLayout>;
  if (!election) return <ElectionSidebarLayout><div className="p-20 text-center text-red-500">Election not found.</div></ElectionSidebarLayout>;

  const baseDomain = 'electionrunner.com';
  const electionUrl = `https://vote.${baseDomain}/election/ILOX8`; // Mocking the hash for design accuracy
  const orgUrl = `https://${orgSubdomain || 'mmuleadership'}.${baseDomain}`;

  return (
    <ElectionSidebarLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <h2 className="text-[17px] font-bold text-[#333] flex items-center gap-2">
          <FiHome className="text-gray-800" /> Overview
        </h2>

        {/* Scheduled Banner */}
        {election.status === 'draft' && (
            <div className="bg-[#FFF5EB] border border-[#FFD8B1] p-4 rounded text-center text-[#975A16] font-medium text-[15px] flex items-center justify-center gap-2">
                {countdown || 'Election is being prepared'}
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
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
      </div>
    </ElectionSidebarLayout>
  );
};