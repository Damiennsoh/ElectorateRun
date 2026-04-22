import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiMail, FiUser, FiLogOut } from 'react-icons/fi';
import { supabase } from '../../utils/supabase';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('Guest');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.user_metadata?.full_name) {
        setUserName(session.user.user_metadata.full_name);
      } else if (session?.user?.email) {
        // Fallback to name if full_name is missing but email exists
        setUserName(session.user.email.split('@')[0]);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    // Clear demo session
    localStorage.removeItem('demo-session');
    // Clear supabase session
    await supabase.auth.signOut();
    // Redirect to auth
    window.location.href = '/auth';
  };

  return (
    <header className="bg-[#00AEEF] text-white px-8 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-10">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-0.5">
            <div className="w-4 h-0.5 bg-white rounded-full opacity-40"></div>
            <div className="w-5 h-0.5 bg-white rounded-full opacity-70"></div>
            <div className="w-6 h-0.5 bg-white rounded-full"></div>
          </div>
          <span className="text-xl font-semibold tracking-tight">ElectorateRun</span>
        </div>

        {/* Main Nav */}
        <nav className="flex items-center gap-6">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `text-sm font-medium hover:opacity-80 transition-opacity ${isActive ? 'underline underline-offset-4' : ''}`}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/settings/account" 
            className={({ isActive }) => `text-sm font-medium hover:opacity-80 transition-opacity ${isActive ? 'underline underline-offset-4' : ''}`}
          >
            Settings
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <button className="hover:opacity-80 transition-opacity">
          <FiMail className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4 border-l border-white/20 pl-6">
          <div className="flex items-center gap-2 hover:opacity-80 cursor-pointer transition-opacity">
            <FiUser className="w-5 h-5" />
            <span className="text-sm font-medium">{userName}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="hover:opacity-80 transition-opacity p-1 bg-white/10 rounded"
            title="Logout"
          >
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};