import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DonutChart } from '../../components/charts/DonutChart';
import { api } from '../../utils/api';
import { supabase } from '../../utils/supabase';
import { Election } from '../../types';
import { FiCheckCircle, FiGlobe } from 'react-icons/fi';

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

export const PublicResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [election, setElection] = useState<Election | null>(null);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (electionId: string) => {
    try {
      const [electionData, questionsByElection] = await Promise.all([
        api.getElectionById(electionId),
        api.getBallotQuestions(electionId)
      ]);
      
      if (!electionData || !electionData.is_results_published) {
          setLoading(false);
          return;
      }

      setElection(electionData);

      // Fetch Organization (owner of election)
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('user_id', electionData.user_id)
        .single();
      
      setOrg(orgData);

      // Fetch Vote Counts
      const { data: voteCounts } = await supabase
        .from('vote_choices')
        .select('candidate_option_id, ballot_question_id')
        .in('ballot_question_id', questionsByElection.map(q => q.id));

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

        return { id: q.id, title: q.title, totalVotes: totalVotesInQuestion, data };
      });

      setResults(resultsData);
    } catch (error) {
      console.error('Error fetching public results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading results...</div>;

  if (!election || !election.is_results_published) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Results Not Available</h1>
            <p className="text-gray-600 max-w-md">The results for this election have not been published yet or are currently private.</p>
        </div>
    );
  }

  const resultHash = election.results_hash || "Hash computation pending...";

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col">
      {/* Blue Header Strip */}
      <div className="bg-[#00AEEF] text-white py-4 px-6 text-center shadow-md">
        <h2 className="text-sm font-bold uppercase tracking-widest">{org?.name || 'Election Platform'}</h2>
        {org && (org.location || org.city || org.state_region) && (
          <p className="text-[12px] opacity-80 mt-1">
            {Array.from(new Set([org.location, org.city, org.state_region].filter(Boolean))).join(', ')}
          </p>
        )}
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto p-8 lg:p-12 space-y-12">
        <h1 className="text-4xl font-normal text-center text-gray-800">{election.title}</h1>

        {results.map((qResult) => (
          <div key={qResult.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-[#00AEEF] px-6 py-4">
              <h3 className="text-xl font-bold text-white">{qResult.title}</h3>
            </div>
            <div className="p-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left pb-4 font-bold text-gray-800 text-[15px]">Option</th>
                        <th className="text-right pb-4 font-bold text-gray-800 text-[15px]">Votes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {qResult.data.map((item) => (
                        <tr key={item.name}>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: item.color }} />
                              <span className="text-[16px] text-gray-700">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-6">
                              <span className="text-[16px] text-gray-500">{item.percentage}%</span>
                              <span className="min-w-[36px] text-center bg-gray-800 text-white px-2.5 py-1 rounded text-[13px] font-bold">
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
                  <DonutChart data={qResult.data} size={300} />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Verification Footer */}
        <div className="flex flex-col items-center gap-4 pt-8">
            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                <span>MD5 Hash: {resultHash}</span>
                <Link 
                    to={`/election/${id}/validate${election.results_hash ? `?hash=${election.results_hash}` : ''}`}
                    className="px-4 py-1.5 bg-[#00D02D] text-white rounded font-bold hover:bg-[#00B828] transition-colors"
                >
                    Validate
                </Link>
            </div>
        </div>
      </main>

      <footer className="w-full py-8 px-10 border-t border-gray-200 bg-white flex flex-col lg:flex-row items-center justify-between text-[13px] text-gray-500 gap-4">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 font-bold text-gray-700 text-base">
                <FiCheckCircle className="text-[#00AEEF]" /> ElectorateRun
            </div>
            <div className="flex items-center gap-1">
                <FiGlobe className="text-gray-400" /> English (US) ▾
            </div>
        </div>
        <div className="flex items-center gap-4">
            <span>Copyright © 2026 ElectorateRun</span>
            <span className="text-gray-300">|</span>
            <a href="#" className="hover:underline">Terms of Service</a>
            <span className="text-gray-300">|</span>
            <a href="#" className="hover:underline">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};
