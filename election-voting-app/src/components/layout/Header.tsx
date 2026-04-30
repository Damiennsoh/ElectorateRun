import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FiMail, FiUser, FiLogOut } from 'react-icons/fi';
import { supabase } from '../../utils/supabase';
import { api } from '../../utils/api';
import { NotificationDropdown } from './NotificationDropdown';
import { AppNotification } from '../../types';

export const Header: React.FC = () => {
  const [userName, setUserName] = useState<string>('Guest');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    
    // Subscribe to notifications
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const data = await api.getNotifications();
      const unread = data.filter((n: AppNotification) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

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

      <div className="flex items-center gap-6 relative">
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="hover:opacity-80 transition-opacity relative p-2"
        >
          <FiMail className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-[#00AEEF]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <NotificationDropdown onClose={() => setShowNotifications(false)} />
        )}
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