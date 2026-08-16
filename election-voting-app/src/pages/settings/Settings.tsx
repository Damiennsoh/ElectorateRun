import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
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

const settingsMenu = [
  { label: 'General', path: '/settings/general', icon: FiSettings },
  { label: 'Dates', path: '/settings/dates', icon: FiCalendar },
  { label: 'Voters', path: '/settings/voters', icon: FiUsers },
  { label: 'Messages', path: '/settings/messages', icon: FiMessageSquare },
  { label: 'Email', path: '/settings/email', icon: FiMail },
  { label: 'Results', path: '/settings/results', icon: FiPieChart },
  { label: 'Duplicate', path: '/settings/duplicate', icon: FiCopy },
  { label: 'Archive', path: '/settings/archive', icon: FiArchive },
  { label: 'Delete', path: '/settings/delete', icon: FiTrash2 },
];

export const Settings: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState(location.pathname);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-8">
          {/* Settings Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FiSettings />
              Settings
            </h2>
            <nav className="space-y-1">
              {settingsMenu.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    setActiveItem(item.path);
                    navigate(item.path);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeItem === item.path
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Settings Content */}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};