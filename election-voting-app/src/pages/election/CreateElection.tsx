import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCalendar } from 'react-icons/fi';
import { api } from '../../utils/api';

export const CreateElection: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  
  // Dynamic default dates
  const now = new Date();
  const startDefault = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const endDefault = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const [startDate, setStartDate] = useState(startDefault);
  const [endDate, setEndDate] = useState(endDefault);
  const [timezone, setTimezone] = useState('Africa/Abidjan');
  const [loading, setLoading] = useState(false);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const newElection = await api.createElection({
        title,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        timezone,
        status: 'building',
      });
      navigate(`/election/${newElection.id}/overview`);
    } catch (error) {
      console.error('Error creating election:', error);
      alert('Failed to create election. Please ensure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col items-center pt-12 p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex flex-col gap-0.5">
          <div className="w-5 h-0.5 bg-[#00AEEF] rounded-full opacity-40"></div>
          <div className="w-6 h-0.5 bg-[#00AEEF] rounded-full opacity-70"></div>
          <div className="w-7 h-0.5 bg-[#00AEEF] rounded-full"></div>
        </div>
        <h1 className="text-3xl font-semibold text-[#00AEEF] tracking-tight">electorate<span className="text-[#333] font-normal">run</span></h1>
      </div>

      <h2 className="text-4xl font-light text-gray-700 mb-10">Create an Election</h2>

      <div className="max-w-2xl w-full bg-white rounded-sm shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleContinue} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#333] mb-2">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-400 outline-none text-gray-700"
              placeholder="e.g. Homecoming Court, Board of Directors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#333] mb-2">Start Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiCalendar />
                </div>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#F9F9F9] border border-gray-300 rounded focus:ring-1 focus:ring-blue-400 outline-none text-gray-700 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#333] mb-2">End Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiCalendar />
                </div>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#F9F9F9] border border-gray-300 rounded focus:ring-1 focus:ring-blue-400 outline-none text-gray-700 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#333] mb-2">Timezone</label>
            <div className="relative">
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F9F9F9] border border-gray-300 rounded focus:ring-1 focus:ring-blue-400 outline-none text-gray-700 text-sm appearance-none"
              >
                <option value="Africa/Abidjan">(GMT+0:00) Africa/Abidjan</option>
                <option value="UTC">(GMT+0:00) UTC</option>
                <option value="Asia/Kolkata">(GMT+5:30) Asia/Kolkata</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00D02D] hover:bg-[#00B828] text-white font-bold rounded transition-colors text-base disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Continue'} <FiArrowRight strokeWidth={3} />
          </button>
        </form>
      </div>

      <div className="mt-10 text-[11px] text-gray-500 text-center">
        Copyright © {new Date().getFullYear()} ElectorateRun | Terms of Service | Privacy Policy
      </div>
    </div>
  );
};