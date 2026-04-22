import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, FiPieChart, FiShield, FiUsers, 
  FiList, FiPackage, FiSettings, FiChevronDown,
  FiCalendar, FiMessageSquare, FiMail, FiCopy,
  FiArchive, FiTrash2, FiCheckCircle
} from 'react-icons/fi';

interface SubMenuItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  { label: 'Overview', path: '/overview', icon: <FiHome /> },
  { label: 'Results', path: '/results', icon: <FiPieChart /> },
  { label: 'Fraud Analysis', path: '/fraud-analysis', icon: <FiShield /> },
  { label: 'Voters', path: '/voters', icon: <FiUsers /> },
  { label: 'Ballot', path: '/ballot', icon: <FiList /> },
  { label: 'Add-ons', path: '/add-ons', icon: <FiPackage /> },
];

const settingsSubItems: SubMenuItem[] = [
  { label: 'General', path: '/settings/general' },
  { label: 'Dates', path: '/settings/dates' },
  { label: 'Voters', path: '/settings/voters' },
  { label: 'Messages', path: '/settings/messages' },
  { label: 'Email', path: '/settings/email' },
  { label: 'Results', path: '/settings/results' },
  { label: 'Duplicate', path: '/settings/duplicate' },
  { label: 'Archive', path: '/settings/archive' },
  { label: 'Delete', path: '/settings/delete' },
];

export const Sidebar: React.FC = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
            <FiList className="text-white" />
          </div>
          <span className="text-xl font-bold text-blue-400">ElectorateRun</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}

        {/* Settings with Submenu */}
        <div>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <FiSettings />
            <span className="font-medium flex-1 text-left">Settings</span>
            <FiChevronDown
              className={`transform transition-transform ${
                settingsOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {settingsOpen && (
            <div className="ml-4 pl-4 border-l border-slate-700">
              {settingsSubItems.map((subItem) => (
                <NavLink
                  key={subItem.path}
                  to={subItem.path}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg mb-1 text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`
                  }
                >
                  {subItem.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Election Info */}
      <div className="p-4 border-t border-slate-700 mt-auto">
        <div className="text-xs text-slate-400 space-y-2">
          <div>
            <div className="font-semibold text-slate-300">START DATE</div>
            <div>6/29/24, 6:00 AM</div>
          </div>
          <div>
            <div className="font-semibold text-slate-300">END DATE</div>
            <div>6/29/24, 6:00 PM</div>
          </div>
          <div>
            <div className="font-semibold text-slate-300">TIMEZONE</div>
            <div>Asia/Kolkata</div>
          </div>
        </div>
      </div>
    </aside>
  );
};