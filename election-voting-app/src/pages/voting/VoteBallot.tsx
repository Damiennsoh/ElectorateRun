import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiCheckCircle, FiUser, FiLogOut, FiLoader, FiX, FiGlobe } from 'react-icons/fi';
import { api } from '../../utils/api';
import { Election, BallotQuestion, Voter } from '../../types';
import { ReceiptModal } from '../../components/voting/ReceiptModal';

export const VoteBallot: React.FC = () => {
  const { id: electionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [election, setElection] = useState<Election | null>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [questions, setQuestions] = useState<BallotQuestion[]>([]);
  const [voter, setVoter] = useState<Voter | null>(null);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [receiptId, setReceiptId] = useState('');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryParams = new URLSearchParams(location.search);
  const isPreview = queryParams.get('preview') === 'true';

  useEffect(() => {
    if (electionId) {
      validateSession();
    }
  }, [electionId]);

  const validateSession = async () => {
    const sessionData = localStorage.getItem(`voter_session_${electionId}`);
    if (!sessionData) {
      navigate(`/vote/${electionId}${isPreview ? '?preview=true' : ''}`);
      return;
    }

    try {
      const currentVoter = JSON.parse(sessionData);
      
      // Check if already voted
      const freshVoter = await api.getVoterById(currentVoter.id);
      if (freshVoter.has_voted) {
          setVoter(freshVoter);
          setSubmitted(true);
          setLoading(false);
          return;
      }

      setVoter(currentVoter);

      const [electionWithOrg, questionsData] = await Promise.all([
        api.getElectionWithOrganization(electionId!),
        api.getBallotQuestions(electionId!)
      ]);

      setElection(electionWithOrg);
      // If election is not active, prevent voting
      if (electionWithOrg?.status && electionWithOrg.status !== 'active') {
        setError('Voting for this election is closed.');
        setLoading(false);
        return;
      }
      if (electionWithOrg.organization) {
        setOrganization(electionWithOrg.organization);
      }
      setQuestions(questionsData as unknown as BallotQuestion[]);
    } catch (error) {
      console.error('Error loading ballot:', error);
      setError('Failed to load ballot data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelection = (questionId: string, optionId: string, maxSelections: number) => {
    const current = selections[questionId] || [];
    
    if (maxSelections === 1) {
      setSelections({ ...selections, [questionId]: [optionId] });
    } else {
      if (current.includes(optionId)) {
        setSelections({ ...selections, [questionId]: current.filter(id => id !== optionId) });
      } else if (current.length < maxSelections) {
        setSelections({ ...selections, [questionId]: [...current, optionId] });
      }
    }
  };

  const handleSubmit = async () => {
    if (isPreview) {
        const tempHash = Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
        setReceiptId(tempHash);
        setSubmitted(true);
        localStorage.removeItem(`voter_session_${electionId}`);
        return;
    }

    // Validation
    for (const question of questions) {
      const selected = selections[question.id] || [];
      if (selected.length < question.min_selections) {
        alert(`Please make at least ${question.min_selections} selection(s) for: ${question.title}`);
        return;
      }
    }

    if (!window.confirm('Are you sure you want to submit your ballot? This cannot be undone.')) return;

    setSubmitting(true);
    try {
      // Get Audit Data
      let ip = 'Unknown';
      try {
          const res = await fetch('https://api.ipify.org?format=json');
          const data = await res.json();
          ip = data.ip;
      } catch (e) { console.error("Failed to fetch IP", e); }
      
      const userAgent = navigator.userAgent;

      const formattedVotes = Object.entries(selections).flatMap(([qId, optIds]) => 
        optIds.map(optId => ({
          ballot_question_id: qId,
          candidate_option_id: optId
        }))
      );

      const voteHash = Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
      setReceiptId(voteHash);
      
      await api.submitBallot(voter!.id, electionId!, formattedVotes, voteHash, { ip, user_agent: userAgent });
      
      // Update local voter state
      if (voter) {
          setVoter({ ...voter, has_voted: true, voted_at: new Date().toISOString(), ballot_receipt: voteHash, ip_address: ip, user_agent: userAgent });
      }

      localStorage.removeItem(`voter_session_${electionId}`);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting ballot:', error);
      if (!submitted) {
          alert('Failed to submit ballot. Please try again.');
      }
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><FiLoader className="text-4xl text-[#00AEEF] animate-spin" /></div>;

  const settings = (election?.settings as any) || {};
  const isReceiptEnabled = settings.ballot_receipt === true;

  if (voter?.has_voted || receiptId) {
    const isAlreadyVoted = voter?.has_voted && !receiptId;
    const displayVotedAt = voter?.voted_at ? new Date(voter.voted_at).toLocaleString() : 'Recently';

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
                <h2 className="text-lg font-medium opacity-90">{organization?.name || 'Organization'}</h2>
                <p className="text-sm opacity-75">
                {organization?.city || 'City'}, {organization?.state_region || 'Region'}
                </p>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div className="max-w-xl w-full bg-white rounded shadow p-12 border border-gray-100 animate-fade-in text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        {isAlreadyVoted ? 'You have already voted!' : 'Thank you for voting in this election!'}
                    </h1>
                    
                    {isAlreadyVoted && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 text-left space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="font-bold text-gray-500 uppercase text-[11px]">Voter ID</span>
                                <span className="font-mono text-gray-700">{voter?.voter_identifier}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-bold text-gray-500 uppercase text-[11px]">Date & Time</span>
                                <span className="text-gray-700">{displayVotedAt}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-bold text-gray-500 uppercase text-[11px]">Device / Browser</span>
                                <span className="text-gray-700 truncate ml-4" title={voter?.user_agent}>{voter?.user_agent?.split(')')[0] + ')'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-bold text-gray-500 uppercase text-[11px]">Ballot Receipt</span>
                                <span className="font-mono text-[#00AEEF] font-bold">{voter?.ballot_receipt}</span>
                            </div>
                        </div>
                    )}

                    {!isAlreadyVoted && isReceiptEnabled && (
                        <div className="flex flex-col items-center gap-4">
                            <button 
                                onClick={() => setIsReceiptOpen(true)}
                                className="px-10 py-3 bg-[#00D02D] text-white rounded font-bold hover:bg-[#00B026] transition-all transform hover:-translate-y-0.5 shadow-md flex items-center gap-2"
                            >
                                Download Receipt
                            </button>
                        </div>
                    )}

                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <button 
                            onClick={() => navigate(isPreview ? `/election/${electionId}/preview` : '/')}
                            className="text-gray-400 hover:text-gray-600 font-bold uppercase text-xs tracking-widest transition-colors"
                        >
                            {isPreview ? 'Back to Manager' : 'Finish'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="w-full py-6 px-10 border-t border-gray-200 bg-white flex items-center justify-between text-[13px] text-gray-500 mt-auto">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 font-bold text-gray-700">
                        <FiCheckCircle className="text-[#00AEEF]" /> electionrunner
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

            <ReceiptModal 
                isOpen={isReceiptOpen}
                onClose={() => setIsReceiptOpen(false)}
                data={{
                    electionTitle: election?.title || 'Election',
                    voterName: voter?.name || 'Voter',
                    votedOn: new Date().toString(),
                    receiptId: receiptId
                }}
            />
        </div>
    );
  }

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
        <h2 className="text-lg font-medium opacity-90">{organization?.name || 'Organization'}</h2>
        <p className="text-sm opacity-75">
          {organization?.city || 'City'}, {organization?.state_region || 'Region'}
        </p>
      </div>

      {/* Voter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#00AEEF]">
              <FiUser />
            </div>
            <div>
              <span className="text-[11px] text-gray-400 font-black uppercase block leading-none">Voting as</span>
              <span className="text-sm font-bold text-gray-700">{voter?.name || voter?.voter_identifier}</span>
            </div>
          </div>
          <button onClick={() => {
              localStorage.removeItem(`voter_session_${electionId}`);
              navigate(`/vote/${electionId}${isPreview ? '?preview=true' : ''}`);
          }} className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors uppercase">
            <FiLogOut /> Exit
          </button>
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto px-6 pt-10 pb-20 flex-1">
        <div className="mb-10 text-center">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600 text-sm">
              <FiX className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <h1 className="text-3xl font-black text-gray-800 mb-2">{election?.title}</h1>
          <p className="text-gray-500 italic">Please make your selections below and click "Submit Ballot" when finished.</p>
        </div>

        <div className="space-y-8">
          {questions.map((question) => (
            <div key={question.id} className="bg-white rounded shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-[#00AEEF] px-6 py-4">
                  <h2 className="text-white font-bold text-lg">{question.title}</h2>
              </div>
              <div className="p-8">
                <div className="mb-6">
                  {question.description && (
                    <div 
                      className="text-gray-600 text-[15px] leading-relaxed mb-6 rich-text-content"
                      dangerouslySetInnerHTML={{ __html: question.description }}
                    />
                  )}
                  <div className="bg-[#F8F9FA] border border-gray-100 p-4 rounded flex flex-col gap-2">
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Instructions</span>
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                        Select <span className="w-6 h-6 rounded bg-[#00AEEF] text-white flex items-center justify-center text-xs">{question.max_selections}</span> option{question.max_selections > 1 ? 's' : ''} from the list below. <span className="text-red-500">* Required</span>
                      </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {(question.candidate_options || []).map((option) => {
                    const isSelected = (selections[question.id] || []).includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelection(question.id, option.id, question.max_selections)}
                        className={`text-left p-4 border-2 transition-all flex items-center gap-6 group ${
                          isSelected 
                            ? 'border-[#00D02D] bg-green-50/20' 
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                          isSelected ? 'bg-white border-[#00D02D]' : 'bg-white border-gray-200'
                        }`}>
                           <div className={`w-6 h-6 rounded-full transition-all ${isSelected ? 'bg-[#00D02D]' : 'bg-transparent'}`} />
                        </div>

                        {option.photo_url && (
                          <img src={option.photo_url} alt="" className="w-16 h-16 rounded object-cover border border-gray-100 flex-shrink-0" />
                        )}

                        <div className="flex-grow">
                          <div className={`font-bold text-xl transition-colors ${isSelected ? 'text-[#00D02D]' : 'text-gray-800'}`}>
                            {option.title}
                          </div>
                          {option.short_description && (
                            <p className="text-sm text-gray-500 mt-1">{option.short_description}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-5 bg-[#00D02D] hover:bg-[#00B026] text-white rounded font-bold text-xl uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Ballot'}
          </button>
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
