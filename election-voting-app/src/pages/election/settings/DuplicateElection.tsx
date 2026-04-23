import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiCopy } from 'react-icons/fi';
import { api } from '../../../utils/api';

export const DuplicateElection: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [duplicating, setDuplicating] = useState(false);
  const [electionTitle, setElectionTitle] = useState('');

  useEffect(() => {
    const fetchElection = async () => {
      if (!id) return;
      try {
        const election = await api.getElectionById(id);
        if (election) {
          setElectionTitle(election.title || '');
        }
      } catch (err) {
        console.error("Error fetching election:", err);
      }
    };
    fetchElection();
  }, [id]);

  const handleDuplicate = async () => {
    if (!id) return;
    
    const confirmed = window.confirm("Are you sure you want to duplicate this election?");
    if (!confirmed) return;

    setDuplicating(true);
    try {
      const election = await api.getElectionById(id);
      const newTitle = `(COPY) ${election.title}`;
      
      const newElection = await api.createElection({
        title: newTitle,
        description: election.description,
        start_date: election.start_date,
        end_date: election.end_date,
        timezone: election.timezone,
        status: 'building',
        settings: election.settings
      });

      // Navigate to the new election's overview
      navigate(`/election/${newElection.id}/overview`);
    } catch (err) {
      console.error("Error duplicating election:", err);
      alert('Failed to duplicate election.');
    } finally {
      setDuplicating(false);
    }
  };

  return (
    <div className="bg-white p-6">
      <div className="border border-gray-200 rounded shadow-sm">
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <h3 className="text-[16px] font-bold text-[#333] flex items-center gap-2">
            <FiCopy className="text-[#333]" />
            Duplicate Election
          </h3>
        </div>
        
        <div className="p-4 bg-white">
          <p className="text-[14px] text-[#333] mb-4 leading-relaxed">
            Duplicating your election allows you to use this election as the base for a new election. It copies the election details, settings, ballot, and voters.
          </p>
          <p className="text-[14px] text-[#333] mb-6 leading-relaxed">
            After duplicating your election, please verify that the settings were copied over correctly. Your election's title will be <strong>(COPY) {electionTitle}</strong>.
          </p>
          
          <button
            onClick={handleDuplicate}
            disabled={duplicating}
            className="px-4 py-2 bg-[#00D02D] text-white rounded font-bold text-[14px] hover:bg-[#00B026] transition-colors shadow-sm disabled:opacity-50"
          >
            {duplicating ? 'Duplicating...' : 'Duplicate Election'}
          </button>
        </div>
      </div>
    </div>
  );
};
