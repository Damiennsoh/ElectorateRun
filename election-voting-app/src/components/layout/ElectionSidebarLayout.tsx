import React, { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { 
  FiHome, FiSettings, FiList, FiUsers, 
  FiEye, FiPlusSquare, FiSend, FiShield
} from 'react-icons/fi';
import { Header } from './Header';
import { api } from '../../utils/api';

interface ElectionSidebarLayoutProps {
  children: React.ReactNode;
}

export const ElectionSidebarLayout: React.FC<ElectionSidebarLayoutProps> = ({ children }) => {
  const { id } = useParams();
  const [currentElection, setCurrentElection] = useState<any>({ title: 'Loading...', status: 'draft' });

  const [voterCount, setVoterCount] = useState(0);
  const [orgTier, setOrgTier] = useState('FREE');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [election, count, org] = await Promise.all([
          api.getElectionById(id),
          api.getVoterCount(id),
          api.getOrganization()
        ]);
        
        if (election) setCurrentElection(election);
        setVoterCount(count);
        if (org) setOrgTier(org.plan_tier || 'FREE');
      } catch (err) {
        console.error("Error fetching data for sidebar:", err);
      }
    };
    fetchData();
  }, [id]);

  // Status mapping to display text and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'active':
        return { text: 'Running', color: 'bg-green-100 text-green-700 border-green-200' };
      case 'completed':
        return { text: 'Completed', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'archived':
        return { text: 'Archived', color: 'bg-gray-100 text-gray-700 border-gray-200' };
      default:
        return { text: 'Building', color: 'bg-gray-100 text-gray-500 border-gray-200' };
    }
  };

  const statusDisplay = getStatusDisplay(currentElection.status);

  const menuItems = [
    { label: 'Overview', path: `/election/${id}/overview`, icon: <FiHome /> },
    { label: 'Settings', path: `/election/${id}/settings`, icon: <FiSettings /> },
    { label: 'Ballot', path: `/election/${id}/ballot`, icon: <FiList /> },
    { label: 'Voters', path: `/election/${id}/voters`, icon: <FiUsers /> },
    { label: 'Preview', path: `/election/${id}/preview`, icon: <FiEye /> },
    { label: 'Add-ons', path: `/election/${id}/addons`, icon: <FiPlusSquare /> },
    // Only show Fraud Analysis if the election is completed
    ...(currentElection.status === 'completed' 
      ? [{ label: 'Fraud Analysis', path: `/election/${id}/fraud-analysis`, icon: <FiShield /> }] 
      : []),
    { label: 'Launch', path: `/election/${id}/launch`, icon: <FiSend /> },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <Header />
      
      {/* Sub Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-[#333]">{currentElection.title}</h2>
          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${statusDisplay.color}`}>
            {statusDisplay.text}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#00D02D] bg-[#E6F9EA] px-2 py-1 rounded border border-[#00D02D]">
            {orgTier}
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase">{voterCount} Voters</span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-[#2C3E50] min-h-[calc(100vh-100px)] flex-shrink-0">
          <nav className="py-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 transition-colors ${
                    isActive
                      ? 'bg-[#1A2533] text-white border-l-4 border-[#00AEEF]'
                      : 'text-gray-400 hover:bg-[#34495E] hover:text-gray-200'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Sidebar Info */}
          <div className="mt-auto p-6 space-y-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-t border-gray-700/50">
            <div>
              <div className="text-white/40 mb-1">Base Price</div>
              <div className="text-[#00D02D] bg-[#00D02D]/10 px-1.5 py-0.5 inline-block rounded">{orgTier} {voterCount} Voters</div>
            </div>
            <div>
              <div className="text-white/40 mb-1">Start Date</div>
              <div className="text-gray-300">4/22/26, 3:00 AM</div>
            </div>
            <div>
              <div className="text-white/40 mb-1">End Date</div>
              <div className="text-gray-300">5/1/26, 2:00 AM</div>
            </div>
            <div>
              <div className="text-white/40 mb-1">Timezone</div>
              <div className="text-gray-300">UTC</div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Help Button */}
      <button className="fixed bottom-6 right-6 bg-[#FF6600] hover:bg-orange-600 text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 transition-colors z-50">
        <FiEye className="w-5 h-5" />
        <span className="font-medium">Help</span>
      </button>
    </div>
  );
};
