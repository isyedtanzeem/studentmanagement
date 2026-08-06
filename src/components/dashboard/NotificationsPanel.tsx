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
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: ShieldAlert
        };
      case 'medium':
        return {
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: AlertCircle
        };
      default:
        return {
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          icon: Info
        };
    }
  };

  return (
    <div className="bg-[#0d0d12]/90 border border-white/10 rounded-xl p-5 backdrop-blur-md flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="relative p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-100 font-sans">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">System broadcast channel</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-mono transition-all"
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
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
              : 'text-zinc-500 hover:text-zinc-300 bg-white/[0.02]'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
            filter === 'unread'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
              : 'text-zinc-500 hover:text-zinc-300 bg-white/[0.02]'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px] custom-scrollbar">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-white/5 animate-pulse" />
          ))
        ) : displayedList.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs font-mono">
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
                    ? 'border-white/5 bg-black/20 opacity-70 hover:opacity-100'
                    : 'border-amber-500/30 bg-amber-500/[0.03] hover:border-amber-500/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {!notif.read && <Circle className="w-2 h-2 fill-amber-400 text-amber-400 shrink-0" />}
                    <h4 className="text-xs font-semibold text-zinc-200">{notif.title}</h4>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded border capitalize ${priorityBadge.color}`}
                  >
                    <PriorityIcon className="w-3 h-3" />
                    {notif.priority}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2">{notif.message}</p>

                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span className="px-1.5 py-0.2 rounded bg-white/5 text-zinc-400">
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
