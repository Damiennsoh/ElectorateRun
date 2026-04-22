import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { 
  FiSettings, FiBriefcase, FiEdit2, 
  FiSmartphone, FiCreditCard, FiKey 
} from 'react-icons/fi';

const menuItems = [
  { label: 'General', path: 'profile', icon: <FiSettings /> },
  { label: 'Organization', path: 'organization', icon: <FiBriefcase /> },
  { label: 'Appearance', path: 'appearance', icon: <FiEdit2 /> },
  { label: 'Mobile App', path: 'mobile-app', icon: <FiSmartphone /> },
  { label: 'Billing', path: 'billing', icon: <FiCreditCard /> },
  { label: 'Security', path: 'security', icon: <FiKey /> },
];

export const AccountSettingsLayout: React.FC = () => {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-8 py-8">
        <h1 className="text-3xl font-bold text-[#333] mb-10">Account Settings</h1>
        
        <div className="flex gap-10">
          {/* Settings Sidebar */}
          <aside className="w-56 flex-shrink-0">
            <nav className="space-y-0.5">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-all ${
                      isActive
                        ? 'bg-[#00AEEF] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Settings Content */}
          <div className="flex-1 bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <Outlet />
          </div>
        </div>
        
        <div className="mt-10 text-[11px] text-gray-500">
          Copyright © 2026 ElectorateRun | Terms of Service | Privacy Policy
        </div>
      </div>
    </MainLayout>
  );
};