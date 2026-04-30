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
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100] notification-dropdown-container">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <button 
          onClick={handleMarkAllRead}
          className="text-xs text-[#00AEEF] hover:underline font-medium"
        >
          Mark all as read
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiMail className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id}
              onClick={() => !n.is_read && handleMarkAsRead(n.id)}
              className={`p-4 border-b border-gray-50 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${!n.is_read ? 'bg-[#00AEEF]/5' : ''}`}
            >
              {getIcon(n.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${!n.is_read ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                  <button 
                    onClick={(e) => handleDelete(n.id, e)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-2">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
              {!n.is_read && (
                <div className="absolute top-4 right-2 w-2 h-2 bg-[#00AEEF] rounded-full"></div>
              )}
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
          <button className="text-xs text-gray-600 hover:text-gray-900 font-medium">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
};
