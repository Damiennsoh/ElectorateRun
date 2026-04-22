import React from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ElectionSidebarLayout } from '../../../components/layout/ElectionSidebarLayout';
import {
  FiSettings,
  FiCalendar,
  FiUsers,
  FiMessageSquare,
  FiMail,
  FiPieChart,
  FiCopy,
  FiArchive,
  FiTrash2,
} from 'react-icons/fi';

export const ElectionSettingsLayout: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const settingsMenu = [
    { label: 'General', path: `/election/${id}/settings/general`, icon: FiSettings },
    { label: 'Dates', path: `/election/${id}/settings/dates`, icon: FiCalendar },
    { label: 'Voters', path: `/election/${id}/settings/voters`, icon: FiUsers },
    { label: 'Messages', path: `/election/${id}/settings/messages`, icon: FiMessageSquare },
    { label: 'Email', path: `/election/${id}/settings/email`, icon: FiMail },
    { label: 'Results', path: `/election/${id}/settings/results`, icon: FiPieChart },
    { label: 'Duplicate', path: `/election/${id}/settings/duplicate`, icon: FiCopy },
    { label: 'Delete', path: `/election/${id}/settings/delete`, icon: FiTrash2 },
  ];

  return (
    <ElectionSidebarLayout>
      <div className="max-w-6xl">
        <h2 className="text-xl font-bold text-[#333] mb-8 flex items-center gap-2">
          <FiSettings className="text-gray-800" /> Settings
        </h2>

        <div className="flex gap-8 items-start">
          {/* Settings Sidebar */}
          <aside className="w-56 flex-shrink-0 bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
            <nav className="flex flex-col">
              {settingsMenu.map((item) => {
                const isActive = location.pathname.includes(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left border-l-4 ${
                      isActive
                        ? 'bg-[#00AEEF] text-white border-[#00AEEF]'
                        : 'text-[#333] hover:bg-gray-50 border-transparent'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Settings Content */}
          <div className="flex-1 bg-white border border-gray-200 rounded-sm shadow-sm">
            <Outlet />
          </div>
        </div>
      </div>
    </ElectionSidebarLayout>
  );
};
