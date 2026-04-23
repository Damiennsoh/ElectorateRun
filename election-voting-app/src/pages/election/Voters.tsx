import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FiUsers, FiUploadCloud, FiPlus, FiTrash2, FiSearch, FiEdit2, FiMoreVertical, FiDownload, FiCheck, FiCopy, FiFileText, FiSend } from 'react-icons/fi';
import { ElectionSidebarLayout } from '../../components/layout/ElectionSidebarLayout';
import { AddVoterModal } from '../../components/election/AddVoterModal';
import { ImportVotersModal } from '../../components/election/ImportVotersModal';
import { EditVoterModal } from '../../components/election/EditVoterModal';
import { api } from '../../utils/api';
import { Voter } from '../../types';
import Papa from 'papaparse';

export const Voters: React.FC = () => {
  const { id: electionId } = useParams<{ id: string }>();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [electionStatus, setElectionStatus] = useState('draft');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (electionId) {
      fetchVoters(electionId);
    }
  }, [electionId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchVoters = async (id: string) => {
    try {
      const [votersData, electionData] = await Promise.all([
        api.getVoters(id),
        api.getElectionById(id)
      ]);
      setVoters(votersData as unknown as Voter[]);
      setElectionStatus(electionData.status);
    } catch (error) {
      console.error('Error fetching voters:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleAddVoter = async (voterData: any) => {
    if (!electionId) return;
    try {
      const newVoter = await api.addVoter({
        election_id: electionId,
        ...voterData
      });
      setVoters([...voters, newVoter]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding voter:', error);
      alert('Failed to add voter.');
    }
  };

  const handleUpdateVoter = async (voterData: any) => {
    try {
      const updated = await api.updateVoter(voterData.id, {
        name: voterData.name,
        email: voterData.email,
        vote_weight: voterData.vote_weight
      });
      setVoters(voters.map(v => v.id === updated.id ? updated : v));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating voter:', error);
      alert('Failed to update voter.');
    }
  };

  const handleDeleteVoter = async (voterId: string) => {
    if (electionStatus === 'active' || electionStatus === 'completed') {
        alert('Voters cannot be deleted while the election is running or completed.');
        return;
    }
    if (!window.confirm('Are you sure you want to delete this voter?')) return;
    try {
      await api.deleteVoter(voterId);
      setVoters(voters.filter(v => v.id !== voterId));
    } catch (error) {
      console.error('Error deleting voter:', error);
    }
  };

  const handleDeleteAllVoters = async () => {
    if (!electionId) return;
    if (electionStatus === 'active' || electionStatus === 'completed') {
        alert('Voters cannot be deleted while the election is running or completed.');
        return;
    }
    if (!window.confirm('WARNING: Are you sure you want to delete ALL voters for this election? This cannot be undone.')) return;
    
    try {
      setLoading(true);
      await api.deleteAllVoters(electionId);
      setVoters([]);
      setShowActionsMenu(false);
    } catch (error) {
      console.error('Error deleting all voters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminders = async () => {
    if (!electionId) return;
    if (!window.confirm('Send email reminders to all voters who haven\'t voted yet?')) return;
    
    try {
      await api.sendVoterReminders(electionId);
      alert('Reminders are being sent!');
    } catch (error: any) {
      console.error('Error sending reminders:', error);
      alert('Note: Supabase Edge Function "send-reminders" needs to be deployed.');
    }
  };

  const handleExportVoters = () => {
    if (!voters.length) return;

    let exportData = [];
    
    if (electionStatus === 'active' || electionStatus === 'completed') {
        // High-fidelity export for active/completed elections (as per Image 10)
        exportData = voters.map(v => ({
            'Voted?': v.has_voted ? 'Yes' : 'No',
            'Name': v.name,
            'Voter Identifier': v.voter_identifier,
            'Voter Key': v.voter_key,
            'Email': v.email || '',
            'Vote Weight': v.vote_weight || 1,
            'Voting URL': `${window.location.origin}/vote/${electionId}?vID=${v.voter_identifier}&vKey=${v.voter_key}`
        }));
    } else {
        // Basic export for building phase
        exportData = voters.map(v => ({
            'Name': v.name,
            'Voter Identifier': v.voter_identifier,
            'Voter Key': v.voter_key,
            'Email': v.email || '',
            'Vote Weight': v.vote_weight || 1
        }));
    }

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `voters_election_${electionId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowActionsMenu(false);
  };

  const handleExportVoterLogs = async () => {
    if (!electionId) return;
    try {
      setLoading(true);
      const activity = await api.getAllElectionActivity(electionId);
      
      const exportData = activity.map(a => ({
        'Date': new Date(a.date).toLocaleString(),
        'Voter Name': a.name,
        'Voter ID': a.voter_id,
        'Action': a.action,
        'IP Address': a.ip
      }));

      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `voter_activity_logs_${electionId}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowActionsMenu(false);
    } catch (err) {
      console.error("Error exporting logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportVoters = async (data: any[]) => {
    if (!electionId) return;
    try {
      setLoading(true);
      const votersToInsert = data.map(v => ({
        ...v,
        election_id: electionId
      }));
      await api.bulkAddVoters(votersToInsert);
      await fetchVoters(electionId);
    } catch (error) {
      console.error('Error importing:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyVoterLink = (v: Voter) => {
    const url = `${window.location.origin}/vote/${electionId}?vID=${v.voter_identifier}&vKey=${v.voter_key}`;
    navigator.clipboard.writeText(url);
    alert('Voting link copied for ' + v.name);
  };

  const filteredVoters = voters.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.voter_identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <ElectionSidebarLayout><div className="flex items-center justify-center min-h-[400px]">Loading...</div></ElectionSidebarLayout>;

  return (
    <ElectionSidebarLayout>
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FiUsers className="text-2xl text-gray-700" />
            <h1 className="text-2xl font-bold text-gray-800">Voters ({voters.length})</h1>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border capitalize ${
                electionStatus === 'active' ? 'bg-green-50 text-green-600 border-green-200' : 
                electionStatus === 'completed' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                'bg-blue-50 text-blue-600 border-blue-200'
            }`}>
                {electionStatus === 'active' ? 'Running' : electionStatus}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-[#00AEEF] rounded hover:bg-gray-50 font-bold text-sm shadow-sm transition-all"
            >
              <FiUploadCloud /> Import
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#00D02D] text-white rounded hover:bg-[#00B026] font-bold text-sm shadow-sm transition-all"
            >
              <FiPlus /> Add Voter
            </button>
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded transition-all"
              >
                <FiMoreVertical />
              </button>
              {showActionsMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-xl z-50 overflow-hidden">
                  <button onClick={handleExportVoters} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100">
                    <FiDownload className="text-gray-400" /> Export Voters
                  </button>
                  <button onClick={handleExportVoterLogs} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100">
                    <FiFileText className="text-gray-400" /> Export Voter Logs
                  </button>
                  <button onClick={handleSendReminders} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#00AEEF] hover:bg-blue-50 border-b border-gray-100">
                    <FiSend className="text-[#00AEEF]" /> Send Reminders
                  </button>
                  {electionStatus !== 'active' && electionStatus !== 'completed' && (
                    <button onClick={handleDeleteAllVoters} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50">
                      <FiTrash2 className="text-red-400" /> Delete All Voters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative flex">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-l outline-none focus:border-[#00AEEF] transition-all text-sm"
            />
            <button className="px-4 bg-gray-50 border border-l-0 border-gray-300 rounded-r text-gray-400">
              <FiSearch />
            </button>
          </div>
        </div>

        {/* Voters Table */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden mb-4">
          <table className="w-full border-collapse">
            <thead className="bg-[#1D2B36] text-white">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider">Voted?</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider">Voter ID</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVoters.map((voter) => (
                <tr key={voter.id} className="hover:bg-yellow-50 transition-colors group">
                  <td className="px-6 py-4">
                    {voter.has_voted ? (
                        <div className="w-5 h-5 bg-[#00D02D] rounded-full flex items-center justify-center">
                            <FiCheck className="text-white text-[10px]" />
                        </div>
                    ) : (
                        <div className="w-5 h-5 border-2 border-gray-100 rounded-full" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[14px] text-gray-700 font-medium">{voter.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[14px] text-gray-600 font-mono">{voter.voter_identifier}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[14px] text-gray-600">{voter.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 group-hover:visible visible">
                        <button 
                            onClick={() => copyVoterLink(voter)}
                            className="p-1.5 text-gray-400 hover:text-[#00AEEF] transition-colors"
                            title="Copy Voting Link"
                        >
                            <FiCopy />
                        </button>
                        <button 
                            onClick={() => {
                                setSelectedVoter(voter);
                                setIsEditModalOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit Voter"
                        >
                            <FiEdit2 />
                        </button>
                        {electionStatus !== 'active' && electionStatus !== 'completed' && (
                          <button 
                              onClick={() => handleDeleteVoter(voter.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete Voter"
                          >
                              <FiTrash2 />
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVoters.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                    No voters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-[13px] text-gray-500">
            {voters.length} Voters
          </div>
        </div>
      </div>

      <AddVoterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddVoter}
      />

      <ImportVotersModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportVoters}
      />

      <EditVoterModal
        isOpen={isEditModalOpen}
        onClose={() => {
            setIsEditModalOpen(false);
            setSelectedVoter(null);
        }}
        voter={selectedVoter}
        onSave={handleUpdateVoter}
        electionStatus={electionStatus}
      />
    </ElectionSidebarLayout>
  );
};
