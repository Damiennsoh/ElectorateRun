import React, { useEffect, useState } from 'react';
import { FiMail, FiTrash2, FiCheck, FiBell } from 'react-icons/fi';
import { api } from '../../utils/api';
import { AppNotification } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Set up click outside listener
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.notification-dropdown-container')) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'election_launched': return <div className="p-2 bg-green-100 text-green-600 rounded-full"><FiBell className="w-4 h-4" /></div>;
      case 'election_completed': return <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><FiCheck className="w-4 h-4" /></div>;
      case 'results_published': return <div className="p-2 bg-purple-100 text-purple-600 rounded-full"><FiMail className="w-4 h-4" /></div>;
      default: return <div className="p-2 bg-gray-100 text-gray-600 rounded-full"><FiBell className="w-4 h-4" /></div>;
    }
  };

  return (
    <div className="absolute right-0 mt-3 w-[360px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[100] notification-dropdown-container animate-fade-in">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div>
          <h3 className="font-bold text-gray-900 text-base">Notifications</h3>
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Stay updated on your elections</p>
        </div>
        <button 
          onClick={handleMarkAllRead}
          className="text-[12px] text-[#00AEEF] hover:text-[#009CD6] font-bold transition-colors"
        >
          Mark all as read
        </button>
      </div>

      <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm italic">Loading your updates...</div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <FiMail className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">All caught up!</p>
            <p className="text-gray-400 text-xs mt-1">No new notifications at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                className={`p-5 flex gap-4 hover:bg-gray-50/80 transition-all cursor-pointer relative group ${!n.is_read ? 'bg-[#00AEEF]/[0.03]' : ''}`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-[14px] leading-tight ${!n.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                      {n.title}
                    </p>
                    <button 
                      onClick={(e) => handleDelete(n.id, e)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed line-clamp-3">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${!n.is_read ? 'bg-[#00AEEF]' : 'bg-transparent'}`}></div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-4 bg-gray-50/50 text-center border-t border-gray-100">
          <button className="text-[13px] text-gray-600 hover:text-[#00AEEF] font-bold transition-colors uppercase tracking-widest">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
};
