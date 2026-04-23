import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { supabase } from '../../utils/supabase';
import { Election } from '../../types';
import { FiCheckCircle, FiGlobe, FiAlertTriangle } from 'react-icons/fi';

export const ValidateElection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [election, setElection] = useState<Election | null>(null);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inputHash, setInputHash] = useState('');
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  useEffect(() => {
    if (id) {
      fetchElectionDetails(id);
    }
  }, [id]);

  const fetchElectionDetails = async (electionId: string) => {
    try {
      const electionData = await api.getElectionById(electionId);
      setElection(electionData);

      if (electionData) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('name')
          .eq('user_id', electionData.user_id)
          .single();
        setOrg(orgData);

        // Auto-fill and auto-validate if hash is provided in URL
        const urlHash = searchParams.get('hash');
        if (urlHash) {
          setInputHash(urlHash);
          if (urlHash === electionData.results_hash) {
            setValidationStatus('valid');
          } else {
            setValidationStatus('invalid');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching election for validation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputHash.trim() || !election) return;

    if (inputHash.trim() === election.results_hash) {
      setValidationStatus('valid');
    } else {
      setValidationStatus('invalid');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading validation tools...</div>;
  }

  if (!election || !election.is_results_published) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Cannot Validate</h1>
            <p className="text-gray-600 max-w-md">This election has not been published or does not exist.</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col items-center pt-16">
      
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2 text-4xl font-bold text-[#00AEEF] mb-4">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
            electoraterun
        </div>
        <p className="text-gray-600 max-w-2xl text-center text-[15px] leading-relaxed">
            Use this form to validate the results of an election. Just copy/paste or type in the election's results "hash" below and click "Validate". Our system will check that the hash matches the actual cryptographic signature of the election.
        </p>
      </div>

      <div className="w-full max-w-3xl bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        
        <form onSubmit={handleValidate} className="flex border-b border-gray-200">
            <input 
                type="text" 
                value={inputHash}
                onChange={(e) => {
                    setInputHash(e.target.value);
                    setValidationStatus('idle');
                }}
                placeholder="Paste the election results hash here..."
                className="flex-1 p-4 text-[15px] outline-none text-gray-700 font-mono"
            />
            <button 
                type="submit"
                className="bg-[#00D02D] hover:bg-[#00B828] text-white px-8 font-bold text-[15px] transition-colors"
            >
                Validate
            </button>
        </form>

        <div className="p-6">
            {validationStatus === 'valid' && (
                <div className="bg-[#DFF0D8] text-[#3C763D] p-4 rounded mb-6 flex items-center gap-2 font-bold">
                    <FiCheckCircle className="text-lg" /> This is a valid hash
                </div>
            )}

            {validationStatus === 'invalid' && (
                <div className="bg-[#F2DEDE] text-[#A94442] p-4 rounded mb-6 flex items-center gap-2 font-bold">
                    <FiAlertTriangle className="text-lg" /> Invalid hash. This signature does not match the published election results.
                </div>
            )}

            {validationStatus === 'valid' && (
                <>
                    <table className="w-full border-collapse border border-gray-200 text-[14px]">
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="p-3 bg-gray-50 font-bold text-gray-700 w-1/3">Organization</td>
                                <td className="p-3 text-gray-600">{org?.name || 'Election Platform'}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="p-3 bg-gray-50 font-bold text-gray-700">Election</td>
                                <td className="p-3 text-gray-600">{election.title}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="p-3 bg-gray-50 font-bold text-gray-700">Start Date</td>
                                <td className="p-3 text-gray-600">
                                    {new Date(election.start_date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="p-3 bg-gray-50 font-bold text-gray-700">End Date</td>
                                <td className="p-3 text-gray-600">
                                    {new Date(election.end_date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="p-3 bg-gray-50 font-bold text-gray-700">Timezone</td>
                                <td className="p-3 text-gray-600">{election.timezone}</td>
                            </tr>
                            <tr>
                                <td className="p-3 bg-gray-50 font-bold text-gray-700">Results Hash</td>
                                <td className="p-3 text-gray-600 font-mono text-[13px] break-all">{election.results_hash}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="mt-6">
                        <Link 
                            to={`/election/${id}/results/public`}
                            className="inline-block bg-[#00AEEF] hover:bg-[#009CD6] text-white px-6 py-2.5 rounded font-bold text-[14px] transition-colors"
                        >
                            View Election Results
                        </Link>
                    </div>
                </>
            )}
        </div>

      </div>

      <div className="mt-auto w-full py-8 px-10 flex flex-col lg:flex-row items-center justify-between text-[13px] text-gray-500 gap-4">
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
      </div>
    </div>
  );
};
