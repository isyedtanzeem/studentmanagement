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
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="relative p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 font-sans">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-mono">System broadcast channel</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-mono transition-all shadow-2xs"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
            filter === 'all'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold shadow-2xs'
              : 'text-slate-500 hover:text-slate-800 bg-slate-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
            filter === 'unread'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold shadow-2xs'
              : 'text-slate-500 hover:text-slate-800 bg-slate-100'
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
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  notif.read
                    ? 'border-slate-200 bg-slate-50 opacity-80 hover:opacity-100'
                    : 'border-blue-200 bg-blue-50/50 hover:border-blue-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {!notif.read && <Circle className="w-2 h-2 fill-blue-600 text-blue-600 shrink-0" />}
                    <h4 className="text-xs font-semibold text-slate-900">{notif.title}</h4>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded border capitalize ${priorityBadge.color}`}
                  >
                    <PriorityIcon className="w-3 h-3" />
                    {notif.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{notif.message}</p>

                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
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
