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
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'Academic':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'Fee':
        return <DollarSign className="w-4 h-4 text-amber-600" />;
      case 'System':
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'gold':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'info':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
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
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 font-sans">Recent Activities</h3>
            <p className="text-[11px] text-slate-500 font-mono">Live system audit feed</p>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:text-blue-700 hover:border-blue-300 transition-all disabled:opacity-50"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-3 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search activity, user, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {['ALL', 'Admission', 'Academic', 'Fee', 'System'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 bg-slate-100'
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
            <div key={i} className="h-16 rounded-lg bg-slate-100 animate-pulse" />
          ))
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs font-mono">
            No matching activities recorded.
          </div>
        ) : (
          filteredActivities.map((act) => (
            <div
              key={act.id}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/40 hover:border-blue-300 transition-all flex items-start justify-between gap-3 group shadow-2xs"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 p-2 rounded-lg bg-white border border-slate-200 shrink-0 shadow-2xs">
                  {getCategoryIcon(act.category)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-900 truncate">
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

                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{act.description}</p>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-1.5">
                    <span>by {act.actorName}</span>
                    <span>•</span>
                    <span className="text-slate-600 font-medium">{act.actorRole}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1 text-[11px] font-mono text-slate-500">
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
