import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ElectionSidebarLayout } from '../components/layout/ElectionSidebarLayout';
import { DonutChart } from '../components/charts/DonutChart';
import { FiDownload, FiBarChart2, FiRotateCw, FiUsers, FiFileText, FiChevronDown } from 'react-icons/fi';
import { api } from '../utils/api';
import { supabase } from '../utils/supabase';
import { Election } from '../types';

interface ResultItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface QuestionResult {
  id: string;
  title: string;
  totalVotes: number;
  data: ResultItem[];
}

const COLORS = ['#00AEEF', '#FF6600', '#00D02D', '#FF0066', '#6633CC', '#FFCC00', '#009999'];

export const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [election, setElection] = useState<Election | null>(null);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (electionId: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [electionData, questionsByElection] = await Promise.all([
        api.getElectionById(electionId),
        api.getBallotQuestions(electionId)
      ]);
      
      setElection(electionData);

      // Fetch Vote Counts
      const { data: voteCounts, error: countsError } = await supabase
        .from('vote_choices')
        .select('candidate_option_id, ballot_question_id')
        .in('ballot_question_id', questionsByElection.map(q => q.id));

      if (countsError) throw countsError;

      const countsMap: Record<string, number> = {};
      voteCounts?.forEach((vc: any) => {
        countsMap[vc.candidate_option_id] = (countsMap[vc.candidate_option_id] || 0) + 1;
      });

      const resultsData: QuestionResult[] = questionsByElection.map((q: any) => {
        const totalVotesInQuestion = (q.candidate_options || []).reduce((acc: number, opt: any) => {
          return acc + (countsMap[opt.id] || 0);
        }, 0);

        const data: ResultItem[] = (q.candidate_options || []).map((opt: any, index: number) => {
          const count = countsMap[opt.id] || 0;
          return {
            name: opt.title,
            value: count,
            percentage: totalVotesInQuestion > 0 ? Math.round((count / totalVotesInQuestion) * 100) : 0,
            color: COLORS[index % COLORS.length]
          };
        });

        return {
          id: q.id,
          title: q.title,
          totalVotes: totalVotesInQuestion,
          data
        };
      });

      setResults(resultsData);
      setLastUpdated(new Date().toLocaleString('en-US', { 
        month: 'numeric', day: 'numeric', year: '2-digit', 
        hour: 'numeric', minute: '2-digit', hour12: true 
      }));
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (id) fetchData(id, true);
  };

  const handleDownloadResults = () => {
    if (!election) return;
    let csv = '';
    results.forEach(q => {
      csv += `${q.title}\n`;
      csv += `Name,Votes\n`;
      q.data.forEach(opt => {
        csv += `${opt.name},${opt.value}\n`;
      });
      csv += `\n`;
    });

    downloadCSV(csv, `${election.title}_Results.csv`);
    setShowDownloadMenu(false);
  };

  const handleDownloadAudit = async () => {
    if (!election || !id) return;
    try {
      const voters = await api.getVoters(id);
      const votedVoters = voters.filter((v: any) => v.has_voted);
      
      let csv = `Name,Voter Identifier,Ballot Receipt,IP Address,User Agent,Vote Date/Time\n`;
      votedVoters.forEach((v: any) => {
        csv += `"${v.name}","${v.voter_identifier}","${v.ballot_receipt || ''}","${v.ip_address || ''}","${v.user_agent || ''}","${v.voted_at ? new Date(v.voted_at).toLocaleString() : ''}"\n`;
      });

      downloadCSV(csv, `${election.title}_Vote_Audit.csv`);
      setShowDownloadMenu(false);
    } catch (error) {
      console.error('Error downloading audit:', error);
    }
  };

  const handlePublishResults = async () => {
    if (!id || !agreeToTerms) return;
    setPublishing(true);
    try {
      const hashResult = await api.computeElectionHash(id);
      await api.updateElection(id, { 
        is_results_published: true,
        results_hash: hashResult.hash
      });
      setElection(prev => prev ? { 
        ...prev, 
        is_results_published: true,
        results_hash: hashResult.hash
      } : null);
      setShowPublishModal(false);
      alert('Results have been published and cryptographically hashed successfully!');
    } catch (error) {
      console.error('Error publishing results:', error);
      alert('Failed to publish results. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <ElectionSidebarLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Loading results...</div>
        </div>
      </ElectionSidebarLayout>
    );
  }

  const totalVotesCast = results.reduce((acc, q) => acc + q.totalVotes, 0);

  return (
    <ElectionSidebarLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <FiBarChart2 className="text-gray-800 text-[18px]" />
            <h2 className="text-[17px] font-bold text-gray-800">Results</h2>
          </div>
            <div className="flex items-center gap-2">
              {election?.status === 'completed' && (
                <button 
                  onClick={() => !election.is_results_published && setShowPublishModal(true)}
                  className={`px-4 py-1.5 rounded font-bold text-[13px] shadow-sm transition-colors ${
                    election.is_results_published 
                      ? 'bg-[#00D02D] text-white cursor-default' 
                      : 'bg-[#00D02D] text-white hover:bg-[#00B828]'
                  }`}
                >
                  {election.is_results_published ? 'Published' : 'Publish Results'}
                </button>
              )}
              <button 
                onClick={handleRefresh}
                className="p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors shadow-sm"
                title="Refresh Results"
              >
                <FiRotateCw className={`text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  className="flex items-center gap-2 px-4 py-1.5 bg-[#00AEEF] text-white rounded font-bold text-[13px] hover:bg-blue-500 transition-colors shadow-sm"
                >
                  <FiDownload /> Download <FiChevronDown />
                </button>
                {showDownloadMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-xl z-50 overflow-hidden">
                    <button onClick={handleDownloadResults} className="w-full flex items-center gap-2 px-4 py-3 text-[13px] text-gray-700 hover:bg-gray-50 border-b border-gray-100 font-medium">
                      <FiFileText className="text-gray-400" /> Election Results
                    </button>
                    <button onClick={handleDownloadAudit} className="w-full flex items-center gap-2 px-4 py-3 text-[13px] text-gray-700 hover:bg-gray-50 font-medium">
                      <FiUsers className="text-gray-400" /> Voter Audit
                    </button>
                  </div>
                )}
              </div>
          </div>
        </div>

        {election?.is_results_published && (
            <div className="bg-white border border-gray-200 border-l-4 border-l-[#00AEEF] rounded p-6 shadow-sm space-y-4 mb-8">
                <h3 className="text-xl font-medium text-gray-800">Election results have been published!</h3>
                <p className="text-sm text-gray-600">Voters can view the results by visiting the following URL:</p>
                <div className="flex">
                    <input 
                        readOnly 
                        value={`${window.location.origin}/election/${id}/results/public`}
                        className="flex-1 bg-gray-50 border border-gray-200 px-3 py-2 text-[15px] text-gray-600 outline-none rounded-l"
                    />
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/election/${id}/results/public`);
                            alert('Link copied!');
                        }}
                        className="px-4 py-2 border border-gray-200 border-l-0 rounded-r bg-white hover:bg-gray-50 text-[13px] font-bold text-gray-700"
                    >
                        Copy
                    </button>
                </div>
            </div>
        )}

        {totalVotesCast === 0 ? (
          <div className="space-y-6">
            <div className="bg-[#E6F9FB] border border-[#00AEEF]/20 p-4 rounded text-[#00AEEF] text-[15px]">
              No results yet. Results will show here as soon as voters start voting.
            </div>
            <div className="text-[14px] font-bold text-[#333]">
              Last Updated: <span className="font-normal text-gray-600">{lastUpdated}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-[14px] font-bold text-[#333] mb-4">
              Last Updated: <span className="font-normal text-gray-600">{lastUpdated}</span>
            </div>

            {results.map((qResult) => (
              <div key={qResult.id} className="bg-white border border-gray-200 rounded overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                  <h3 className="text-[15px] font-bold text-gray-800">{qResult.title}</h3>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left pb-4 font-bold text-gray-800 text-[13px]">Option</th>
                            <th className="text-right pb-4 font-bold text-gray-800 text-[13px]">Votes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {qResult.data.map((item) => (
                            <tr key={item.name} className="group">
                              <td className="py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                                  <span className="text-[14px] text-gray-700">{item.name}</span>
                                </div>
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex items-center justify-end gap-4">
                                  <span className="text-[14px] text-gray-500">{item.percentage}%</span>
                                  <span className="min-w-[32px] text-center bg-gray-800 text-white px-2 py-0.5 rounded text-[12px] font-bold">
                                    {item.value}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-center">
                      <DonutChart data={qResult.data} size={250} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#00AEEF] rounded-lg shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Publish Election Results</h3>
                    <button onClick={() => setShowPublishModal(false)} className="text-white/60 hover:text-white">
                        <FiRotateCw className="rotate-45" />
                    </button>
                </div>
                <div className="p-8 bg-white space-y-6">
                    <p className="text-[14px] text-gray-600 leading-relaxed">
                        Publishing the election's results will make the results publicly accessible.
                    </p>
                    <p className="text-[14px] text-gray-600 leading-relaxed">
                        You will be provided with a unique URL that will contain your published results - just as you see it in the election admin (vote counts, charts, etc.). <button className="text-[#00AEEF]">Learn More</button>
                    </p>
                    <ul className="space-y-3 text-[13px] text-gray-600 list-disc pl-5">
                        <li>Once results have been published they cannot be un-published. To remove the results your election must be archived or deleted.</li>
                        <li>Discarding ballots through the <button className="text-[#00AEEF]">fraud analysis</button> has no effect if the results have already been published.</li>
                        <li>Results will be publicly accessible to all voters and anyone with the link to the results page</li>
                        <li>All results are final</li>
                    </ul>

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="mt-1" 
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                        />
                        <span className="text-[13px] text-gray-600">
                            I understand and agree to the <button className="text-[#00AEEF]">privacy policy</button> and <button className="text-[#00AEEF]">terms of service</button>
                        </span>
                    </label>

                    <button 
                        onClick={handlePublishResults}
                        disabled={!agreeToTerms || publishing}
                        className="w-full py-3 bg-[#00D02D] hover:bg-[#00B828] disabled:bg-gray-300 text-white font-bold rounded transition-colors text-[14px]"
                    >
                        {publishing ? 'Publishing...' : 'Publish Election Results'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </ElectionSidebarLayout>
  );
};