import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiLock, FiUser, FiArrowRight, FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiX, FiGlobe } from 'react-icons/fi';
import { api } from '../../utils/api';
import { Election } from '../../types';

export const VoteLogin: React.FC = () => {
  const { id: electionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [election, setElection] = useState<Election | null>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [voterId, setVoterId] = useState('');
  const [voterKey, setVoterKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryParams = new URLSearchParams(location.search);
  const isPreview = queryParams.get('preview') === 'true';

  useEffect(() => {
    if (electionId) {
      fetchData();
      
      const vID = queryParams.get('vID');
      const vKey = queryParams.get('vKey');
      if (vID) setVoterId(vID);
      if (vKey) setVoterKey(vKey);
    }
  }, [electionId]);

  const fetchData = async () => {
    try {
      const data = await api.getElectionWithOrganization(electionId!);
      setElection(data);
      if (data.organization) {
        setOrganization(data.organization);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Election not found or invalid link.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!electionId || !voterId) return;

    setSubmitting(true);
    setError(null);

    try {
      if (isPreview) {
        if (voterId.toLowerCase() === 'test' && voterKey.toLowerCase() === 'test') {
          const testVoter = {
            id: 'test-voter',
            election_id: electionId,
            name: 'Test Voter',
            voter_identifier: 'test',
            voter_key: 'test',
            has_voted: false
          };
          localStorage.setItem(`voter_session_${electionId}`, JSON.stringify(testVoter));
          navigate(`/vote/${electionId}/ballot?preview=true`);
          return;
        } else {
          throw new Error('In preview mode, use "test" for both ID and Key.');
        }
      }

      const voters = await api.getVoters(electionId);
      const voter = voters.find(v => 
        v.voter_identifier.toLowerCase() === voterId.toLowerCase() && 
        (v.voter_key === voterKey || !v.voter_key)
      );

      if (!voter) {
        throw new Error('Invalid Voter ID or Key.');
      }

      if (voter.has_voted) {
        throw new Error('This voter has already cast a ballot in this election.');
      }

      localStorage.setItem(`voter_session_${electionId}`, JSON.stringify(voter));
      navigate(`/vote/${electionId}/ballot`);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400 font-medium">Loading election...</div>;

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col">
      {/* Preview Banner */}
      {isPreview && (
        <div className="bg-red-600 text-white py-2 px-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider relative z-50">
          YOU ARE CURRENTLY IN PREVIEW MODE
          <button onClick={() => navigate(`/election/${electionId}/preview`)} className="absolute right-4 hover:bg-red-700 p-1 rounded transition-colors">
            <FiX className="text-lg" />
          </button>
        </div>
      )}

      {/* Top Organization Header */}
      <div className="bg-[#00AEEF] text-white py-4 text-center shadow-md">
        <h2 className="text-lg font-medium opacity-90">{organization?.name || 'Example Organization'}</h2>
        <p className="text-sm opacity-75">
          {organization?.city || 'City'}, {organization?.state_region || 'Region'}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">{election?.title || 'Election'}</h1>
          </div>

          <div className="bg-white rounded shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-[#00AEEF] px-6 py-4">
              <h3 className="text-white font-bold text-lg">Login to Vote</h3>
            </div>
            
            <div className="p-8 space-y-6">
                {isPreview && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded flex items-start gap-3">
                        <FiAlertTriangle className="text-red-500 text-2xl mt-1 flex-shrink-0" />
                        <p className="text-sm text-red-800 leading-relaxed font-medium">
                            While testing your election in "preview" mode, you can only login using "test" as the Voter ID & Key.
                        </p>
                    </div>
                )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2 uppercase tracking-wide">Voter ID</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your Voter ID"
                    value={voterId}
                    onChange={(e) => setVoterId(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none transition-all font-medium text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2 uppercase tracking-wide">Voter Key</label>
                  <input
                    type="password"
                    placeholder="Enter your Voter Key"
                    value={voterKey}
                    onChange={(e) => setVoterKey(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none transition-all font-medium text-gray-700"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 p-4 rounded flex items-center gap-3 text-red-600 text-sm">
                    <FiAlertCircle className="flex-shrink-0 text-lg" />
                    <p className="font-bold">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#00D02D] hover:bg-[#00B026] text-white py-3.5 rounded font-bold uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {submitting ? 'Verifying...' : 'Login to Vote'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 px-10 border-t border-gray-200 bg-white flex items-center justify-between text-[13px] text-gray-500">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 font-bold text-gray-700">
                <FiCheckCircle className="text-[#00AEEF]" /> electionrunner
            </div>
            <div className="flex items-center gap-1">
                <FiGlobe className="text-gray-400" /> English (US) ▾
            </div>
        </div>
        <div className="flex items-center gap-4">
            <span>Copyright © 2026 Election Runner</span>
            <span className="text-gray-300">|</span>
            <a href="#" className="hover:underline">Terms of Service</a>
            <span className="text-gray-300">|</span>
            <a href="#" className="hover:underline">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};
