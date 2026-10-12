import React, { useState } from 'react';
import { Bell, CheckCheck, Circle, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { NotificationItem } from '../../types/dashboard';

interface NotificationsPanelProps {
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  loading?: boolean;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  loading
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const displayedList = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          color: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: ShieldAlert
        };
      case 'medium':
        return {
          color: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: AlertCircle
        };
      default:
        return {
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Info
        };
    }
  };

  return (
    <div className="bg-white border border-[#E4E7EB] rounded-[4px] p-5 shadow-[0_2px_4px_rgba(0,0,0,0.06)] flex flex-col h-full font-roboto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ECEFF1]">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-[4px] bg-[#F39C12] flex items-center justify-center text-white shadow-xs">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#E74C3C] animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#263238] uppercase tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-[2px] bg-[#FDEDEC] text-[#C0392B] border border-[#F5B7B1]">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#78909C]">System dispatch channel</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 px-2.5 py-1 rounded-[4px] border border-[#CFD8DC] bg-[#F4F6F9] text-[#263238] hover:bg-[#ECEFF1] text-xs transition-colors shadow-2xs font-medium"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#00B5AD]" />
            Mark All Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="mt-3 flex items-center gap-1.5">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-[4px] text-xs font-medium transition-colors ${
            filter === 'all'
              ? 'bg-[#00B5AD] text-white shadow-xs font-bold'
              : 'text-[#546E7A] hover:text-[#263238] bg-[#F4F6F9] border border-[#E4E7EB]'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded-[4px] text-xs font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-[#00B5AD] text-white shadow-xs font-bold'
              : 'text-[#546E7A] hover:text-[#263238] bg-[#F4F6F9] border border-[#E4E7EB]'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px] custom-scrollbar">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-slate-100 animate-pulse" />
          ))
        ) : displayedList.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-mono">
            {filter === 'unread' ? 'No unread notifications.' : 'No notifications found.'}
          </div>
        ) : (
          displayedList.map((notif) => {
            const priorityBadge = getPriorityBadge(notif.priority);
            const PriorityIcon = priorityBadge.icon;

            return (
              <div
                key={notif.id}
                onClick={() => !notif.read && onMarkRead(notif.id)}
                className={`p-3 rounded-[4px] border transition-colors cursor-pointer ${
                  notif.read
                    ? 'border-[#E4E7EB] bg-[#F4F6F9] opacity-80 hover:opacity-100 hover:bg-white'
                    : 'border-[#CFD8DC] bg-white hover:border-[#00B5AD] shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {!notif.read && <Circle className="w-2 h-2 fill-[#00B5AD] text-[#00B5AD] shrink-0" />}
                    <h4 className="text-xs font-bold text-[#263238]">{notif.title}</h4>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded-[2px] border capitalize ${priorityBadge.color}`}
                  >
                    <PriorityIcon className="w-3 h-3" />
                    {notif.priority}
                  </span>
                </div>

                <p className="text-xs text-[#546E7A] mt-1.5 line-clamp-2">{notif.message}</p>

                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[#78909C]">
                  <span className="px-1.5 py-0.2 rounded-[2px] bg-[#ECEFF1] text-[#455A64]">
                    {notif.category}
                  </span>
                  <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
