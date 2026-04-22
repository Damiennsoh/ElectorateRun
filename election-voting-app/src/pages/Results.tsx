import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { DonutChart } from '../components/charts/DonutChart';
import { Button } from '../components/common/Button';
import { FiDownload, FiShare2, FiBarChart2, FiCheckCircle } from 'react-icons/fi';
import { api } from '../utils/api';
import { supabase } from '../utils/supabase';
import { Election, BallotQuestion, CandidateOption } from '../types';

interface ResultItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface QuestionResult {
  title: string;
  totalVotes: number;
  data: ResultItem[];
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

export const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [election, setElection] = useState<Election | null>(null);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (electionId: string) => {
    try {
      // 1. Fetch Election
      const electionData = await api.getElectionById(electionId);
      setElection(electionData);

      // 2. Fetch Questions and Options
      const questionsByElection = await api.getBallotQuestions(electionId);
      
      // 3. Fetch Vote Counts
      // We can query vote_choices directly and count by candidate_option_id
      const { data: voteCounts, error: countsError } = await supabase
        .from('vote_choices')
        .select('candidate_option_id')
        .in('ballot_question_id', questionsByElection.map(q => q.id));

      if (countsError) throw countsError;

      // Group counts by candidate_option_id
      const countsMap: Record<string, number> = {};
      voteCounts?.forEach((vc: any) => {
        countsMap[vc.candidate_option_id] = (countsMap[vc.candidate_option_id] || 0) + 1;
      });

      // 4. Build Results Object
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

        // Sort by value descending
        data.sort((a, b) => b.value - a.value);

        return {
          title: q.title,
          totalVotes: totalVotesInQuestion,
          data
        };
      });

      setResults(resultsData);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Loading Results..." status="active">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500 font-medium">Calculating results...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={election?.title || 'Election Results'} 
      status={election?.status || 'completed'}
    >
      <div className="max-w-7xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#E6F7FF] rounded-lg">
              <FiBarChart2 className="text-[#00AEEF] text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Election Results</h1>
              <p className="text-sm text-gray-500">Live tally of all submitted and verified ballots.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex items-center gap-2">
              <FiShare2 />
              Share
            </Button>
            <Button variant="primary" className="flex items-center gap-2">
              <FiDownload />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Results Info Card */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-6 mb-10 rounded-xl flex items-start gap-4">
          <div className="bg-[#DCFCE7] p-2 rounded-full">
            <FiCheckCircle className="text-[#16A34A] text-xl" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[#166534] mb-1">
              Final results are in!
            </h2>
            <p className="text-[#166534] text-[15px] opacity-80 mb-4">
              All ballots have been verified and the tally is complete. Public results can be shared with the following link:
            </p>
            <div className="flex items-center gap-2">
              <div className="bg-white px-4 py-2 rounded-lg border border-[#BBF7D0] font-mono text-[13px] text-gray-600 flex-1">
                {window.location.origin}/election/{id}/public-results
              </div>
              <button className="text-[#16A34A] font-bold text-sm hover:underline p-2">Copy Link</button>
            </div>
          </div>
        </div>

        {/* Questions Grid */}
        <div className="grid grid-cols-1 gap-10">
          {results.map((qResult, qIdx) => (
            <div key={qIdx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">
                  {qResult.title}
                </h3>
                <span className="text-sm font-bold text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                  {qResult.totalVotes} Total Votes
                </span>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left pb-4 font-bold text-gray-400 uppercase text-[11px] tracking-widest">
                            Option / Candidate
                          </th>
                          <th className="text-right pb-4 font-bold text-gray-400 uppercase text-[11px] tracking-widest">
                            Tally
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {qResult.data.map((candidate) => (
                          <tr key={candidate.name} className="group hover:bg-gray-50/50 transition-colors">
                            <td className="py-5">
                              <div className="flex items-center gap-4">
                                <div
                                  className="w-3 h-3 rounded-full shadow-sm"
                                  style={{ backgroundColor: candidate.color }}
                                />
                                <span className="text-[16px] font-medium text-gray-700">
                                  {candidate.name}
                                </span>
                              </div>
                            </td>
                            <td className="text-right py-5">
                              <div className="flex items-center justify-end gap-4">
                                <span className="text-[15px] font-bold text-gray-400">
                                  {candidate.percentage}%
                                </span>
                                <span className="min-w-[40px] text-center bg-gray-900 text-white px-3 py-1 rounded-md text-sm font-bold shadow-sm">
                                  {candidate.value}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-center items-center py-4 bg-gray-50/30 rounded-3xl border border-dashed border-gray-200">
                    <DonutChart data={qResult.data} size={280} />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {results.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-20 text-center text-gray-500">
              No questions found for this election.
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};