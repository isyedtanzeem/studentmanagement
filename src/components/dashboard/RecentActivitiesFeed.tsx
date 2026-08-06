import React, { useState } from 'react';
import {
  Activity,
  UserCheck,
  BookOpen,
  DollarSign,
  ShieldCheck,
  Search,
  RefreshCw,
  Clock
} from 'lucide-react';
import { RecentActivity } from '../../types/dashboard';

interface RecentActivitiesFeedProps {
  activities: RecentActivity[];
  loading?: boolean;
  onRefresh?: () => void;
}

export const RecentActivitiesFeed: React.FC<RecentActivitiesFeedProps> = ({
  activities,
  loading,
  onRefresh
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredActivities = activities.filter((act) => {
    const matchesCategory =
      categoryFilter === 'ALL' || act.category.toUpperCase() === categoryFilter.toUpperCase();
    const matchesQuery =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.actorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Admission':
        return <UserCheck className="w-4 h-4 text-emerald-400" />;
      case 'Academic':
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'Fee':
        return <DollarSign className="w-4 h-4 text-amber-400" />;
      case 'System':
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      default:
        return <Activity className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'gold':
        return 'bg-amber-400/20 text-amber-300 border-amber-400/40';
      case 'info':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMinutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));

      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-[#0d0d12]/90 border border-white/10 rounded-xl p-5 backdrop-blur-md flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 font-sans">Recent Activities</h3>
            <p className="text-[11px] text-zinc-400 font-mono">Live system audit feed</p>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 transition-all disabled:opacity-50"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-3 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search activity, user, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {['ALL', 'Admission', 'Academic', 'Fee', 'System'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-zinc-500 hover:text-zinc-300 bg-white/[0.02]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Activities List */}
      <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[360px] custom-scrollbar">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-white/5 animate-pulse" />
          ))
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs font-mono">
            No matching activities recorded.
          </div>
        ) : (
          filteredActivities.map((act) => (
            <div
              key={act.id}
              className="p-3 rounded-xl border border-white/5 bg-black/20 hover:border-amber-500/20 transition-all flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 p-2 rounded-lg bg-white/5 border border-white/10 shrink-0">
                  {getCategoryIcon(act.category)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-zinc-200 truncate">
                      {act.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${getBadgeColor(
                        act.badgeType
                      )}`}
                    >
                      {act.category}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{act.description}</p>

                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-1.5">
                    <span>by {act.actorName}</span>
                    <span>•</span>
                    <span className="text-zinc-400">{act.actorRole}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1 text-[11px] font-mono text-zinc-500">
                <Clock className="w-3 h-3" />
                {formatTime(act.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
