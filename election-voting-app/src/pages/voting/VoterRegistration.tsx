import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../utils/api';
import { Election } from '../../types';
import { FiUser, FiMail, FiHash, FiCheckCircle, FiClock, FiUsers } from 'react-icons/fi';

export const VoterRegistration: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [election, setElection] = useState<Election | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    identifier: ''
  });

  useEffect(() => {
    if (id) {
      fetchElection(id);
    }
  }, [id]);

  const fetchElection = async (id: string) => {
    try {
      const [electionData, regData] = await Promise.all([
        api.getElectionById(id),
        api.getRegistrations(id)
      ]);
      setElection(electionData);
      setRegistrations(regData);
    } catch (err) {
      console.error('Error fetching election:', err);
      setError('Could not find election details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    setError(null);

    try {
      await api.submitRegistration({
        election_id: id,
        ...formData
      });
      setSuccess(true);
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === '23505') {
        setError('You have already registered for this election.');
      } else {
        setError('Failed to submit registration. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 animate-pulse font-medium">Loading registration details...</div>
      </div>
    );
  }

  const settings = election?.settings || {};
  const registrationEnabled = settings.registration_enabled;
  const now = new Date().getTime();
  const regStart = settings.registration_start ? new Date(settings.registration_start).getTime() : 0;
  const regEnd = settings.registration_end ? new Date(settings.registration_end).getTime() : Infinity;

  const isWithinWindow = now >= regStart && now <= regEnd;
  const isUpcoming = now < regStart;

  if (!registrationEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiHash className="text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Closed</h2>
          <p className="text-gray-600 leading-relaxed">
            Public registration is not enabled for this election. Please contact the administrator for instructions.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100 animate-fade-in">
          <div className="w-16 h-16 bg-[#00D02D] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#00D02D]/30">
            <FiCheckCircle className="text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
          <p className="text-gray-600 mb-6">
            You have successfully registered for <strong>{election?.title}</strong>.
          </p>
          <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm font-medium border border-blue-100">
            You will receive further instructions once the voting period begins.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 flex flex-col items-center">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{election?.title}</h1>
          <p className="text-gray-600 font-medium tracking-wide uppercase text-xs">Voter Registration Phase</p>
        </div>

        {/* Status Alert */}
        {!isWithinWindow && (
            <div className={`mb-8 p-4 rounded-lg border flex items-center gap-3 ${isUpcoming ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                <FiClock className="flex-shrink-0" />
                <span className="text-sm font-semibold">
                    {isUpcoming 
                        ? `Registration opens on ${new Date(regStart).toLocaleString()}` 
                        : `Registration ended on ${new Date(regEnd).toLocaleString()}`}
                </span>
            </div>
        )}

        <div className={`bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 ${!isWithinWindow ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="bg-[#00AEEF] p-1 shadow-inner"></div>
          <div className="p-8 sm:p-10">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Register to Vote</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">Please provide your details exactly as they appear on your official documentation to ensure eligibility.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all outline-none text-gray-700"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all outline-none text-gray-700"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">ID / Identifier</label>
                <div className="relative">
                  <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="text"
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all outline-none text-gray-700"
                    placeholder="Student ID, Staff ID, etc."
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded text-sm font-medium border border-red-100 animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !isWithinWindow}
                className="w-full py-4 bg-[#00AEEF] hover:bg-[#009ED9] disabled:bg-gray-200 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
              >
                {submitting ? 'Submitting Details...' : 'Register to Vote'}
              </button>
            </form>
          </div>
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex flex-col items-center gap-2">
            {election?.settings?.registration_list_public && (
                <Link to={`/register/${id}/list`} className="text-xs font-bold text-[#00AEEF] hover:underline flex items-center gap-2">
                    <FiUsers className="text-sm" /> View Transparency List ({registrations.length} Sign-ups)
                </Link>
            )}
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Powered by ElectorateRun Security</p>
          </div>
        </div>
      </div>
    </div>
  );
};
