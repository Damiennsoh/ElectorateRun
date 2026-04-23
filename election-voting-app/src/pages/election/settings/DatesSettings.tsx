import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiCalendar, FiClock } from 'react-icons/fi';
import { api } from '../../../utils/api';


export const DatesSettings: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timezone, setTimezone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchElection = async () => {
      if (!id) return;
      try {
        const election = await api.getElectionById(id);
        if (election) {
          // Format timestamps if they exist (YYYY-MM-DDTHH:MM)
          if (election.start_date) {
            setStartDate(new Date(election.start_date).toISOString().slice(0, 16));
          }
          if (election.end_date) {
            setEndDate(new Date(election.end_date).toISOString().slice(0, 16));
          }
          setTimezone(election.timezone || '(GMT+0:00) Africa/Abidjan');
        }
      } catch (err) {
        console.error("Error fetching election:", err);
      }
    };
    fetchElection();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await api.updateElection(id, {
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        timezone,
      });
      alert('Dates saved successfully!');
    } catch (err) {
      console.error("Error saving dates:", err);
      alert('Failed to save dates.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-[15px] font-bold text-[#333] flex items-center gap-2">
          <FiCalendar className="text-gray-500" />
          Election Dates
        </h3>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-2">
              Start Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="text-gray-400" />
              </div>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-[14px] text-gray-700 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-[#00AEEF] transition-colors"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-2">
              End Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="text-gray-400" />
              </div>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-[14px] text-gray-700 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-[#00AEEF] transition-colors"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-2 flex items-center gap-1">
            <FiClock className="w-3 h-3 text-gray-400" /> Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 text-[14px] text-gray-700 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-[#00AEEF] transition-colors"
          >
            <option value="(GMT-10:00) Pacific/Honolulu">(GMT-10:00) Pacific/Honolulu</option>
            <option value="(GMT-08:00) America/Los_Angeles">(GMT-08:00) America/Los_Angeles</option>
            <option value="(GMT-07:00) America/Denver">(GMT-07:00) America/Denver</option>
            <option value="(GMT-06:00) America/Chicago">(GMT-06:00) America/Chicago</option>
            <option value="(GMT-05:00) America/New_York">(GMT-05:00) America/New_York</option>
            <option value="(GMT-04:00) America/Halifax">(GMT-04:00) America/Halifax</option>
            <option value="(GMT-03:00) America/Sao_Paulo">(GMT-03:00) America/Sao_Paulo</option>
            <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
            <option value="(GMT+00:00) Europe/London">(GMT+00:00) Europe/London</option>
            <option value="(GMT+01:00) Europe/Paris">(GMT+01:00) Europe/Paris</option>
            <option value="(GMT+01:00) Africa/Lagos">(GMT+01:00) Africa/Lagos</option>
            <option value="(GMT+02:00) Europe/Berlin">(GMT+02:00) Europe/Berlin</option>
            <option value="(GMT+02:00) Africa/Johannesburg">(GMT+02:00) Africa/Johannesburg</option>
            <option value="(GMT+02:00) Africa/Cairo">(GMT+02:00) Africa/Cairo</option>
            <option value="(GMT+03:00) Europe/Moscow">(GMT+03:00) Europe/Moscow</option>
            <option value="(GMT+03:00) Asia/Riyadh">(GMT+03:00) Asia/Riyadh</option>
            <option value="(GMT+03:00) Africa/Nairobi">(GMT+03:00) Africa/Nairobi</option>
            <option value="(GMT+04:00) Asia/Dubai">(GMT+04:00) Asia/Dubai</option>
            <option value="(GMT+05:30) Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option>
            <option value="(GMT+07:00) Asia/Bangkok">(GMT+07:00) Asia/Bangkok</option>
            <option value="(GMT+08:00) Asia/Singapore">(GMT+08:00) Asia/Singapore</option>
            <option value="(GMT+08:00) Asia/Shanghai">(GMT+08:00) Asia/Shanghai</option>
            <option value="(GMT+09:00) Asia/Tokyo">(GMT+09:00) Asia/Tokyo</option>
            <option value="(GMT+10:00) Australia/Sydney">(GMT+10:00) Australia/Sydney</option>
            <option value="(GMT+12:00) Pacific/Auckland">(GMT+12:00) Pacific/Auckland</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-[#00D02D] text-white rounded font-bold text-[14px] hover:bg-[#00B026] transition-colors shadow-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Dates'}
        </button>
      </div>
    </div>
  );
};