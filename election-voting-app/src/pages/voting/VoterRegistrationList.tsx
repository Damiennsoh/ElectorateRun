import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../utils/api';
import { Election } from '../../types';
import { FiUsers, FiSearch, FiCheck, FiArrowLeft, FiShield } from 'react-icons/fi';

export const VoterRegistrationList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [election, setElection] = useState<Election | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (electionId: string) => {
    try {
      const [electionData, regData] = await Promise.all([
        api.getElectionById(electionId),
        api.getRegistrations(electionId)
      ]);
      setElection(electionData);
      setRegistrations(regData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = registrations.filter(r => 
    r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.identifier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 animate-pulse font-medium">Loading transparency list...</div>
      </div>
    );
  }

  const showList = election?.settings?.registration_list_public;

  if (!showList) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiShield className="text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Private List</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            The transparency list for this registration phase is not public. Please contact the administrator for verification.
          </p>
          <Link to={`/register/${id}`} className="text-[#00AEEF] font-bold hover:underline flex items-center justify-center gap-2">
            <FiArrowLeft /> Back to Registration
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
                <Link to={`/register/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#00AEEF] mb-4 transition-colors">
                    <FiArrowLeft /> Back to Registration
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">{election?.title}</h1>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mt-1">Transparency List: Registered Voters</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
                <FiUsers className="text-[#00AEEF]" />
                <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase leading-none">Total Sign-ups</div>
                    <div className="text-lg font-bold text-gray-800 leading-none mt-1">{registrations.length}</div>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or identifier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="px-8 py-4">Full Name</th>
                  <th className="px-8 py-4">Identifier / ID</th>
                  <th className="px-8 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((reg) => (
                  <tr key={reg.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="font-bold text-gray-800">{reg.full_name}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{new Date(reg.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-8 py-4 font-mono text-sm text-gray-600">
                      {reg.identifier}
                    </td>
                    <td className="px-8 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase rounded-full border border-green-100">
                        <FiCheck className="text-[12px]" /> Verified
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center text-gray-400 italic">
                      No matching registrants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                <FiShield className="text-[#00AEEF]" /> Transparency Protected
            </div>
            <div className="text-[10px] text-gray-400 font-medium italic">
                Emails are hidden for privacy.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
