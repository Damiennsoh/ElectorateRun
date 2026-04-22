import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FiUsers, FiUploadCloud, FiPlus, FiTrash2, FiSearch, FiEdit2, FiMoreVertical, FiDownload, FiCheck, FiX, FiMail, FiCopy } from 'react-icons/fi';
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
  const [loading, setLoading] = useState(true);
  const [sendingInvites, setSendingInvites] = useState(false);
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
      const data = await api.getVoters(id);
      setVoters(data as unknown as Voter[]);
    } catch (error) {
      console.error('Error fetching voters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitations = async () => {
    if (!electionId) return;
    if (!window.confirm('Send email invitations to all voters who haven\'t received one yet?')) return;
    
    setSendingInvites(true);
    try {
      await api.sendVoterInvitations(electionId);
      alert('Invitations are being sent!');
      fetchVoters(electionId);
    } catch (error: any) {
      console.error('Error sending invitations:', error);
      alert('Note: Supabase Edge Function "send-invitations" needs to be deployed to handle email sending.');
    } finally {
      setSendingInvites(false);
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

  const handleExportVoters = () => {
    if (!voters.length) return;

    const exportData = voters.map(v => ({
      'Voted?': v.has_voted ? 'Yes' : 'No',
      'Name': v.name,
      'Voter Identifier': v.voter_identifier,
      'Voter Key': v.voter_key,
      'Email': v.email || '',
      'Vote Weight': v.vote_weight || 1,
      'Invitation Sent': v.invitation_sent_at ? 'Yes' : 'No',
      'Voting URL': `${window.location.origin}/vote/${electionId}?vID=${v.voter_identifier}&vKey=${v.voter_key}`
    }));

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
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={handleSendInvitations}
                disabled={sendingInvites || voters.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold text-sm shadow-sm transition-all disabled:opacity-50"
            >
                <FiMail /> {sendingInvites ? 'Sending...' : 'Send Invitations'}
            </button>
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
                  <button onClick={handleDeleteAllVoters} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50">
                    <FiTrash2 className="text-red-400" /> Delete All Voters
                  </button>
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
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider">Voter ID</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVoters.map((voter) => (
                <tr key={voter.id} className="hover:bg-yellow-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-[14px] text-gray-700 font-medium">{voter.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[14px] text-gray-600 font-mono">{voter.voter_identifier}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[14px] text-gray-600">{voter.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                        {voter.has_voted ? (
                            <span className="text-[11px] font-bold text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded border border-green-200">Voted</span>
                        ) : (
                            <span className="text-[11px] font-bold text-gray-400 uppercase bg-gray-50 px-2 py-0.5 rounded border border-gray-200">Not Voted</span>
                        )}
                        {voter.invitation_sent_at && (
                            <FiCheck className="text-blue-500" title="Invitation Sent" />
                        )}
                    </div>
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
                        >
                            <FiEdit2 />
                        </button>
                        <button 
                            onClick={() => handleDeleteVoter(voter.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        >
                            <FiTrash2 />
                        </button>
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
      />
    </ElectionSidebarLayout>
  );
};
