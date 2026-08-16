import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
<<<<<<< HEAD
import { FiUsers, FiUploadCloud, FiPlus, FiTrash2, FiSearch, FiEdit2, FiMoreVertical, FiDownload, FiCheck, FiMail, FiCopy } from 'react-icons/fi';
=======
import { FiUsers, FiUploadCloud, FiPlus, FiTrash2, FiSearch, FiEdit2, FiMoreVertical, FiDownload, FiCheck, FiCopy, FiFileText, FiSend, FiLink } from 'react-icons/fi';
>>>>>>> 4e0837aa3e245bf5dcc9357438f33256f1eaa5b9
import { ElectionSidebarLayout } from '../../components/layout/ElectionSidebarLayout';
import { AddVoterModal } from '../../components/election/AddVoterModal';
import { ImportVotersModal } from '../../components/election/ImportVotersModal';
import { EditVoterModal } from '../../components/election/EditVoterModal';
import { api } from '../../utils/api';
import { Voter, Election } from '../../types';
import Papa from 'papaparse';

export const Voters: React.FC = () => {
  const { id: electionId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'voters' | 'registrations'>('voters');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRegConfigOpen, setIsRegConfigOpen] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [election, setElection] = useState<Election | null>(null);
  const [electionStatus, setElectionStatus] = useState('draft');
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
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
      const [votersData, electionData, regData] = await Promise.all([
        api.getVoters(id),
        api.getElectionById(id),
        api.getRegistrations(id)
      ]);
      setVoters(votersData as unknown as Voter[]);
      setElection(electionData);
      setElectionStatus(electionData.status);
      setRegistrations(regData);
    } catch (error) {
      console.error('Error fetching voters/election:', error);
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
      await api.triggerVoterReminders(electionId, election?.title || 'Election');
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

  const handleMigrateRegistrations = async () => {
    if (!electionId) return;
    if (registrations.length === 0) return;
    if (!window.confirm(`Are you sure you want to import all ${registrations.length} registrants into the official voter list? This will generate unique Voter Keys for each.`)) return;
    
    try {
      setMigrating(true);
      const result = await api.migrateRegistrations(electionId);
      alert(`Successfully imported ${result.count} voters!`);
      await fetchVoters(electionId);
      setActiveTab('voters');
    } catch (error) {
      console.error('Migration error:', error);
      alert('Failed to import registrants.');
    } finally {
      setMigrating(false);
    }
  };

  const handleToggleRegistration = async (enabled: boolean) => {
    if (!electionId || !election) return;
    try {
      const updatedSettings = {
        ...(election.settings || {}),
        registration_enabled: enabled
      };
      await api.updateElection(electionId, { settings: updatedSettings });
      setElection({ ...election, settings: updatedSettings });
    } catch (error) {
      console.error('Error toggling registration:', error);
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
        {/* Voting closed banner */}
        {electionStatus && electionStatus !== 'active' && (
          <div className="mb-6 p-4 rounded border border-gray-200 bg-yellow-50 text-gray-800">
            <strong className="font-bold mr-2">Voting is not active.</strong>
            {electionStatus === 'completed'
              ? 'This election has been completed — voters can no longer vote and any voting links will show that voting is closed.'
              : 'This election is not currently running. Voter login and voting will be disabled until the election is set to Running.'}
          </div>
        )}
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
              onClick={() => setIsRegConfigOpen(!isRegConfigOpen)}
              className={`flex items-center gap-2 px-4 py-2 bg-white border ${isRegConfigOpen ? 'border-[#00AEEF] text-[#00AEEF]' : 'border-gray-300 text-gray-600'} rounded hover:bg-gray-50 font-bold text-sm shadow-sm transition-all`}
            >
              <FiLink /> Self-Registration
            </button>
            <button 
              onClick={() => setIsImportModalOpen(true)}
              disabled={electionStatus === 'completed'}
              className={`flex items-center gap-2 px-4 py-2 ${electionStatus === 'completed' ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-white border border-gray-300 text-[#00AEEF]'} rounded hover:bg-gray-50 font-bold text-sm shadow-sm transition-all`}
            >
              <FiUploadCloud /> Import
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              disabled={electionStatus === 'completed'}
              className={`flex items-center gap-2 px-4 py-2 ${electionStatus === 'completed' ? 'bg-gray-100 text-gray-400' : 'bg-[#00D02D] text-white hover:bg-[#00B026]'} rounded font-bold text-sm shadow-sm transition-all`}
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
                  <button onClick={handleSendReminders} disabled={electionStatus !== 'active'} className={`w-full flex items-center gap-2 px-4 py-3 text-sm ${electionStatus !== 'active' ? 'text-gray-400' : 'text-[#00AEEF]'} hover:bg-blue-50 border-b border-gray-100`}>
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

        {/* Self-Registration Config Panel */}
        {isRegConfigOpen && (
          <div className="mb-8 p-6 bg-white border border-[#00AEEF] rounded-lg shadow-sm animate-in slide-in-from-top duration-300">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FiLink className="text-[#00AEEF]" />
                  <h3 className="font-bold text-gray-800">Voter Self-Registration Phase</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Enable a public registration link to allow voters to sign up for this election. You can review sign-ups before importing them into your official voter list.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={election?.settings?.registration_enabled || false}
                      onChange={(e) => handleToggleRegistration(e.target.checked)}
                      className="w-4 h-4 text-[#00AEEF] rounded border-gray-300 focus:ring-[#00AEEF]"
                    />
                    <span className="text-sm font-bold text-gray-700 group-hover:text-[#00AEEF] transition-colors">Enabled</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Starts</span>
                    <input 
                      type="datetime-local" 
                      value={election?.settings?.registration_start || ''}
                      onChange={(e) => {
                        const updated = { ...(election?.settings || {}), registration_start: e.target.value };
                        api.updateElection(electionId!, { settings: updated });
                        setElection({ ...election!, settings: updated });
                      }}
                      className="text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-[#00AEEF]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Ends</span>
                    <input 
                      type="datetime-local" 
                      value={election?.settings?.registration_end || ''}
                      onChange={(e) => {
                        const updated = { ...(election?.settings || {}), registration_end: e.target.value };
                        api.updateElection(electionId!, { settings: updated });
                        setElection({ ...election!, settings: updated });
                      }}
                      className="text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-[#00AEEF]"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={election?.settings?.registration_list_public || false}
                      onChange={(e) => {
                        const updated = { ...(election?.settings || {}), registration_list_public: e.target.checked };
                        api.updateElection(electionId!, { settings: updated });
                        setElection({ ...election!, settings: updated });
                      }}
                      className="w-4 h-4 text-[#00AEEF] rounded border-gray-300 focus:ring-[#00AEEF]"
                    />
                    <span className="text-sm font-bold text-gray-700 group-hover:text-[#00AEEF] transition-colors">Public Transparency List</span>
                  </label>
                </div>
                {election?.settings?.registration_enabled && (
                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded border border-blue-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Registration Link</span>
                      <span className="text-xs font-mono text-gray-600 select-all">
                        {window.location.origin}/register/{electionId}
                      </span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/register/${electionId}`);
                          alert('Registration link copied!');
                        }}
                        className="text-[10px] font-bold text-[#00AEEF] uppercase hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                    {election?.settings?.registration_list_public && (
                      <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded border border-orange-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Transparency List</span>
                        <span className="text-xs font-mono text-gray-600 select-all">
                          {window.location.origin}/register/{electionId}/list
                        </span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/register/${electionId}/list`);
                            alert('Transparency list link copied!');
                          }}
                          className="text-[10px] font-bold text-orange-600 uppercase hover:underline"
                        >
                          Copy
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</div>
                  <div className={`text-sm font-bold ${election?.settings?.registration_enabled ? 'text-green-600' : 'text-gray-400'}`}>
                    {election?.settings?.registration_enabled ? 'Accepting Sign-ups' : 'Disabled'}
                  </div>
                </div>
                <div className="w-px h-10 bg-gray-100"></div>
                <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Registered</div>
                    <div className="text-sm font-bold text-gray-800">{registrations.length} People</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-8 mb-6 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('voters')}
            className={`pb-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'voters' ? 'border-[#00AEEF] text-[#00AEEF]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Voter List ({voters.length})
          </button>
          <button 
            onClick={() => setActiveTab('registrations')}
            className={`pb-4 text-sm font-bold transition-all border-b-2 relative ${activeTab === 'registrations' ? 'border-[#00AEEF] text-[#00AEEF]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Self-Registrations ({registrations.length})
            {registrations.length > 0 && activeTab !== 'registrations' && (
              <span className="absolute top-[-4px] right-[-12px] w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            )}
          </button>
        </div>

        {activeTab === 'voters' ? (
          <>
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
          </>
        ) : (
          <div className="animate-fade-in">
             <div className="flex items-center justify-between mb-6">
                <div>
                   <h2 className="text-lg font-bold text-gray-800">Registration Sign-ups</h2>
                   <p className="text-sm text-gray-500">Review people who have signed up via the public registration link.</p>
                </div>
                <button 
                  onClick={handleMigrateRegistrations}
                  disabled={registrations.length === 0 || migrating}
                  className="flex items-center gap-2 px-6 py-3 bg-[#00AEEF] text-white rounded font-bold hover:bg-[#009ED9] transition-all shadow-lg shadow-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
                >
                  {migrating ? 'Importing...' : `Import ${registrations.length} Registrants into Election`}
                </button>
             </div>

             <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden mb-4">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider">Registration Date</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider">Full Name</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider">Identifier (ID)</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-[13px] text-gray-500">{new Date(reg.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[14px] text-gray-700 font-medium">{reg.full_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[14px] text-gray-600 font-mono">{reg.identifier}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[14px] text-gray-600">{reg.email}</div>
                      </td>
                    </tr>
                  ))}
                  {registrations.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                        No registrations yet. Share the link to start collecting sign-ups!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
