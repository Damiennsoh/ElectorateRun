import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiSend, FiEdit, FiCheckCircle, FiArrowRight, FiCheck, FiShoppingBag } from 'react-icons/fi';
import { ElectionSidebarLayout } from '../../components/layout/ElectionSidebarLayout';
import { api } from '../../utils/api';
import { Election, BallotQuestion } from '../../types';
import { ElectionAssistantModal } from '../../components/election/ElectionAssistantModal';

export const LaunchElection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const [questions, setQuestions] = useState<BallotQuestion[]>([]);
  const [voterCount, setVoterCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [step, setStep] = useState(1);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  
  // Step 2 & 3 Checkboxes
  const [readBallotWarning, setReadBallotWarning] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [scanResults, setScanResults] = useState({
    settings: { issues: [] as string[] },
    voters: { issues: [] as string[] },
    ballot: { issues: [] as string[] }
  });

  useEffect(() => {
    const fetchElectionData = async () => {
      if (!id) return;
      try {
        const [electionData, questionsData, count] = await Promise.all([
          api.getElectionById(id),
          api.getBallotQuestions(id),
          api.getVoterCount(id)
        ]);
        setElection(electionData);
        setQuestions(questionsData as any);
        setVoterCount(count);
      } catch (error) {
        console.error('Error fetching election data for launch:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchElectionData();
  }, [id]);

  const runScan = async () => {
    const results = {
      settings: { issues: [] as string[] },
      voters: { issues: [] as string[] },
      ballot: { issues: [] as string[] }
    };

    if (voterCount === 0) {
      results.voters.issues.push('There are no voters added to this election.');
    }

    const allQuestionsHaveOptions = questions.every((q: any) => q.candidate_options && q.candidate_options.length > 0);
    if (questions.length === 0) {
      results.ballot.issues.push('There are no questions on the ballot.');
    } else if (!allQuestionsHaveOptions) {
      results.ballot.issues.push('All questions on the ballot require at least one option.');
    }
    
    // As per user screenshot
    results.ballot.issues.push('All questions on the ballot require a response.');

    setScanResults(results);
    const totalIssues = results.settings.issues.length + results.voters.issues.length + results.ballot.issues.length;
    
    if (totalIssues > 0) {
      setIsAssistantOpen(true);
    } else {
      setStep(2);
    }
  };

  const handleLaunch = async () => {
    if (!id) return;
    setLaunching(true);
    try {
      await api.updateElection(id, { status: 'active' });
      alert('Election launched successfully!');
      navigate(`/election/${id}`);
    } catch (error) {
      console.error('Error launching election:', error);
      alert('Failed to launch election. Please try again.');
    } finally {
      setLaunching(false);
    }
  };

  if (loading) return <ElectionSidebarLayout><div className="p-20 text-center text-gray-500">Loading...</div></ElectionSidebarLayout>;
  if (!election) return <ElectionSidebarLayout><div className="p-20 text-center text-red-500">Election not found.</div></ElectionSidebarLayout>;

  const startDateFormatted = election.start_date ? new Date(election.start_date).toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'Not set';
  const endDateFormatted = election.end_date ? new Date(election.end_date).toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'Not set';
  const settings = (election.settings as any) || {};
  const isEmailEnabled = settings.enable_email !== false ? 'Enabled' : 'Disabled';
  const isWeightedVoting = settings.weighted_voting ? 'Enabled' : 'Disabled';
  const timezone = election.timezone || 'Africa/Abidjan';

  const steps = [
    { id: 1, label: 'Confirm Details' },
    { id: 2, label: 'Check Ballot' },
    { id: 3, label: 'Terms' },
    { id: 4, label: 'Checkout' }
  ];

  return (
    <ElectionSidebarLayout>
      <div className="max-w-5xl mx-auto pb-20">
        <h2 className="text-xl font-bold text-[#333] mb-8 flex items-center gap-2">
          <FiSend className="text-gray-800" /> Launch Election
        </h2>

        {/* Stepper */}
        <div className="flex mb-8 shadow-sm border border-gray-200 rounded overflow-hidden">
          {steps.map((s, idx) => (
            <div 
              key={s.id}
              className={`flex-1 px-6 py-4 font-bold text-[13px] flex items-center justify-center gap-2 relative transition-all uppercase tracking-wide border-r border-white last:border-r-0 ${
                step === s.id ? 'bg-[#00AEEF] text-white' : (step > s.id ? 'bg-[#00D02D] text-white' : 'bg-[#F9FBFC] text-gray-400')
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === s.id ? 'bg-white text-[#00AEEF]' : (step > s.id ? 'bg-white text-[#00D02D]' : 'bg-gray-300 text-white')
              }`}>
                {step > s.id ? <FiCheck /> : s.id}
              </div>
              {s.label}
              {idx < steps.length - 1 && (
                 <div className={`absolute -right-[15px] top-0 bottom-0 w-[30px] transform skew-x-[25deg] z-10 border-r border-white ${
                    step === s.id ? 'bg-[#00AEEF]' : (step > s.id ? 'bg-[#00D02D]' : 'bg-[#F9FBFC]')
                 }`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Content Box */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-[15px] font-bold text-[#333] flex items-center gap-2 uppercase tracking-tight">
               <FiCheckCircle className={step >= 2 ? "text-green-500" : "text-[#00AEEF]"} /> 
               {steps.find(s => s.id === step)?.label}
            </h3>
          </div>

          <div className="p-8">
            {step === 1 && (
              <>
                <div className="mb-6 border border-gray-200 rounded">
                    <div className="p-4 border-b border-gray-100 bg-[#F9FBFC] font-bold text-[13px] text-[#333] flex items-center gap-2">
                        <FiCheck className="text-green-500" /> Confirm Election Details
                    </div>
                    <table className="w-full text-sm text-[#333]">
                    <tbody>
                        <tr className="border-b border-gray-100 last:border-b-0">
                        <td className="px-5 py-4 font-bold w-1/3 text-[12px] text-gray-500 uppercase">Title</td>
                        <td className="px-5 py-4 text-[15px] font-bold">{election.title}</td>
                        </tr>
                        <tr className="border-b border-gray-100 last:border-b-0">
                        <td className="px-5 py-4 font-bold text-[12px] text-gray-500 uppercase">Start Date</td>
                        <td className="px-5 py-4 flex items-center justify-between">
                            <span className="text-[15px]">{startDateFormatted}</span>
                            <FiEdit className="text-[#00AEEF] cursor-pointer" onClick={() => navigate(`/election/${id}/settings/dates`)} />
                        </td>
                        </tr>
                        <tr className="border-b border-gray-100 last:border-b-0">
                        <td className="px-5 py-4 font-bold text-[12px] text-gray-500 uppercase">End Date</td>
                        <td className="px-5 py-4 flex items-center justify-between">
                            <span className="text-[15px]">{endDateFormatted}</span>
                            <FiEdit className="text-[#00AEEF] cursor-pointer" onClick={() => navigate(`/election/${id}/settings/dates`)} />
                        </td>
                        </tr>
                        <tr className="border-b border-gray-100 last:border-b-0">
                        <td className="px-5 py-4 font-bold text-[12px] text-gray-500 uppercase">Timezone</td>
                        <td className="px-5 py-4">{timezone} <FiEdit className="text-[#00AEEF] ml-2 inline cursor-pointer" /></td>
                        </tr>
                        <tr className="border-b border-gray-100 last:border-b-0">
                        <td className="px-5 py-4 font-bold text-[12px] text-gray-500 uppercase">Email Enabled?</td>
                        <td className="px-5 py-4">{isEmailEnabled} <FiEdit className="text-[#00AEEF] ml-2 inline cursor-pointer" /></td>
                        </tr>
                        <tr className="border-b border-gray-100 last:border-b-0">
                        <td className="px-5 py-4 font-bold text-[12px] text-gray-500 uppercase">Weighted Voting Enabled?</td>
                        <td className="px-5 py-4">{isWeightedVoting} <FiEdit className="text-[#00AEEF] ml-2 inline cursor-pointer" /></td>
                        </tr>
                    </tbody>
                    </table>
                </div>

                <button 
                  className="bg-[#00D02D] hover:bg-[#00B026] text-white px-10 py-3 rounded font-bold transition-all flex items-center gap-2 text-[15px] shadow-sm uppercase tracking-wider"
                  onClick={runScan}
                >
                  Continue <FiArrowRight />
                </button>
              </>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <div className="bg-[#EBF8FF] border border-[#BEE3F8] p-5 rounded flex items-start gap-3">
                        <div className="flex-grow">
                             <p className="text-[#2b6cb0] text-[14px] leading-relaxed">
                             You will not be able to change the ballot once the election starts. This is to maintain the integrity of the election for the voters.
                             </p>
                        </div>
                    </div>

                    {questions.map((q) => (
                        <div key={q.id} className="border border-gray-200 rounded overflow-hidden mb-6">
                            <div className="bg-white border-b border-gray-100 p-6">
                                <h4 className="text-xl font-bold text-gray-800">{q.title}</h4>
                                <span className="text-gray-500 text-sm italic">{q.type === 'ranked_choice' ? 'Ranked Choice' : 'Multiple Choice'}</span>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <h5 className="text-[13px] font-bold text-gray-800 mb-2 uppercase">Description</h5>
                                    <div className="border border-gray-200 p-4 rounded text-gray-700 text-[15px]" 
                                         dangerouslySetInnerHTML={{ __html: q.description || '' }} />
                                </div>
                                <div>
                                    <h5 className="text-[13px] font-bold text-gray-800 mb-2 uppercase">Rules</h5>
                                    <div className="border border-gray-200 rounded divide-y divide-gray-100">
                                        <div className="p-3 text-sm text-gray-600">Voters are required to select a <span className="font-bold">minimum of {q.min_selections}</span> option(s)</div>
                                        <div className="p-3 text-sm text-gray-600">Voters can select <span className="font-bold">only {q.max_selections}</span> option</div>
                                    </div>
                                </div>
                                <div>
                                    <h5 className="text-[13px] font-bold text-gray-800 mb-2 uppercase">Options</h5>
                                    <div className="border border-gray-200 rounded">
                                        {(q.candidate_options || []).map((opt: any) => (
                                            <div key={opt.id} className="p-4 flex items-center justify-between border-b border-gray-100 last:border-b-0">
                                                <div className="flex items-center gap-4">
                                                    <FiCheckCircle className="text-gray-800" />
                                                    {opt.photo_url && <img src={opt.photo_url} className="w-10 h-10 object-cover rounded border border-gray-100" />}
                                                    <span className="font-bold text-gray-700">{opt.title}</span>
                                                </div>
                                                <button className="text-[#00AEEF] px-4 py-1.5 border border-[#00AEEF] rounded font-bold text-xs uppercase hover:bg-blue-50">Details</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="pt-6 border-t border-gray-100">
                        <label className="flex items-center gap-3 cursor-pointer group mb-10">
                            <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded border-gray-300 text-[#00D02D] focus:ring-[#00D02D]" 
                                checked={readBallotWarning}
                                onChange={(e) => setReadBallotWarning(e.target.checked)}
                            />
                            <span className="text-[15px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors">I understand that I cannot change my ballot after the election starts</span>
                        </label>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => setStep(3)}
                                disabled={!readBallotWarning}
                                className="bg-[#00D02D] hover:bg-[#00B026] text-white px-10 py-3 rounded font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                Continue <FiArrowRight />
                            </button>
                            <button onClick={() => setStep(1)} className="text-gray-500 font-bold uppercase text-[13px]">Back</button>
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-8">
                    <div className="max-w-2xl">
                        <div className="mb-10">
                            <h4 className="text-[15px] font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FiCheckCircle className="text-green-500" /> You <span className="text-red-500">will not be allowed</span> to change following after your election launches:
                            </h4>
                            <div className="bg-gray-50/80 border border-gray-100 p-6 rounded-lg ml-7">
                                <ul className="list-disc pl-5 space-y-2 text-gray-700 text-[15px]">
                                    <li>Add, Edit, or Delete Questions</li>
                                    <li>Add, Edit, or Delete Question Options</li>
                                    <li>Change the election start date</li>
                                </ul>
                                <p className="mt-6 italic text-gray-500 text-sm">
                                    If you wish to make changes to these items, then you will need to cancel the election and recreate it (no refunds given for elections launched with user errors)
                                </p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[15px] font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FiCheckCircle className="text-green-500" /> You <span className="text-green-500">will be allowed</span> to change following after your election launches:
                            </h4>
                            <div className="bg-gray-50/80 border border-gray-100 p-6 rounded-lg ml-7">
                                <ul className="list-disc pl-5 space-y-2 text-gray-700 text-[15px]">
                                    <li>Add, Edit and Delete Voters</li>
                                    <li>Extend your election end date</li>
                                    <li>Close the election</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100">
                        <label className="flex items-center gap-3 cursor-pointer group mb-10">
                            <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded border-gray-300 text-[#00D02D] focus:ring-[#00D02D]" 
                                checked={acceptTerms}
                                onChange={(e) => setAcceptTerms(e.target.checked)}
                            />
                            <span className="text-[15px] font-medium text-gray-700">
                                I understand and agree to the <Link to="/privacy" className="text-[#00AEEF] hover:underline">privacy policy</Link> and <Link to="/terms" className="text-[#00AEEF] hover:underline">terms of service</Link>
                            </span>
                        </label>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => setStep(4)}
                                disabled={!acceptTerms}
                                className="bg-[#00D02D] hover:bg-[#00B026] text-white px-10 py-3 rounded font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                Continue <FiArrowRight />
                            </button>
                            <button onClick={() => setStep(2)} className="text-gray-500 font-bold uppercase text-[13px]">Back</button>
                        </div>
                    </div>
                </div>
            )}

            {step === 4 && (
              <div className="space-y-12 py-10 max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 bg-gray-50 px-5 py-2.5 rounded border border-gray-100 text-gray-700 mb-4">
                    <FiShoppingBag className="text-[#00AEEF]" /> <span className="font-bold">Secure Checkout</span>
                </div>

                <div className="space-y-8">
                    <h4 className="text-2xl font-bold text-gray-800">
                        This election is <span className="text-[#00D02D]">free</span> because you have 20 voters or less.
                    </h4>
                    
                    <div className="flex flex-col gap-5 items-center">
                        <button 
                            disabled={launching}
                            className="bg-[#00D02D] hover:bg-[#00B026] text-white px-16 py-4 rounded-lg font-bold transition-all text-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 active:translate-y-0"
                            onClick={handleLaunch}
                        >
                            {launching ? 'Launching...' : 'Launch Election'}
                        </button>
                        
                        <button 
                            onClick={() => setStep(3)}
                            className="text-gray-400 hover:text-gray-600 font-bold uppercase text-xs tracking-widest transition-colors py-2"
                        >
                            Back
                        </button>
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ElectionAssistantModal 
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onContinue={() => {
            setIsAssistantOpen(false);
            setStep(2);
        }}
        results={scanResults}
      />
    </ElectionSidebarLayout>
  );
};
