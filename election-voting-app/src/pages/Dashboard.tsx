import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiCalendar, FiClock, FiTrash2 } from 'react-icons/fi';
import { MainLayout } from '../components/layout/MainLayout';
import { api } from '../utils/api';
import { Election } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const data = await api.getElections();
      setElections(data as unknown as Election[]);
    } catch (error) {
      console.error('Error fetching elections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteElection = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this election? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteElection(id);
      setElections(elections.filter(election => election.id !== id));
    } catch (error) {
      console.error('Error deleting election:', error);
      alert('Failed to delete election. Please try again.');
    }
  };

  const filteredElections = elections.filter((election) => {
    const matchesSearch = election.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus
      ? election.status === filterStatus
      : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold text-[#333]">Dashboard</h1>
          <button
            onClick={() => navigate('/create-election')}
            className="flex items-center gap-2 px-4 py-2 bg-[#00D02D] hover:bg-[#00B828] text-white font-bold rounded transition-colors text-sm"
          >
            <FiPlus className="w-5 h-5" />
            New Election
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-3 relative">
            <input
              type="text"
              placeholder="Search by election title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-400 outline-none transition-all text-gray-800"
            />
            <div className="absolute right-0 top-0 h-full px-3 flex items-center border-l border-gray-300 bg-gray-50 text-gray-400 rounded-r">
              <FiSearch className="w-5 h-5" />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-400 outline-none transition-all text-gray-800 appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23999\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
          >
            <option value="">Filter by status...</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
            <option value="building">Building</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Election List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading elections...</div>
          ) : filteredElections.length === 0 ? (
            <div className="bg-white rounded-md border border-gray-200 p-12 text-center">
              <p className="text-gray-500 mb-6 text-lg">No elections found.</p>
              <button
                onClick={() => navigate('/create-election')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#00D02D] hover:bg-[#00B828] text-white font-bold rounded transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                Create Your First Election
              </button>
            </div>
          ) : (
            filteredElections.map((election) => (
              <div
                key={election.id}
                onClick={() => navigate(`/election/${election.id}/overview`)}
                className="bg-white rounded-md border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex-1">
                  <h3 className="text-[15px] font-bold text-[#333] mb-2 uppercase">
                    {election.title}
                  </h3>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      election.status === 'completed'
                        ? 'bg-[#E8F0FE] text-[#00AEEF] border-[#00AEEF]'
                        : election.status === 'active'
                        ? 'bg-[#E6F9EA] text-[#00D02D] border-[#00D02D]'
                        : 'bg-gray-50 text-gray-500 border-gray-300'
                    }`}
                  >
                    {election.status}
                  </span>
                </div>
                
                <div className="flex gap-12 text-gray-600 mr-8">
                  <div className="flex flex-col gap-1 w-40">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                      <FiCalendar className="w-3 h-3" /> Start Date
                    </div>
                    <div className="text-[13px] font-medium">
                      {election.start_date ? (
                        <>
                          {new Date(election.start_date).toLocaleDateString()}, {new Date(election.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </>
                      ) : 'Not set'}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 w-40">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                      <FiClock className="w-3 h-3" /> End Date
                    </div>
                    <div className="text-[13px] font-medium">
                      {election.end_date ? (
                        <>
                          {new Date(election.end_date).toLocaleDateString()}, {new Date(election.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </>
                      ) : 'Not set'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDeleteElection(e, election.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Election"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};