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
    <div className="bg-white border border-[#E4E7EB] rounded-[4px] p-5 shadow-[0_2px_4px_rgba(0,0,0,0.06)] flex flex-col h-full font-roboto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ECEFF1] gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[4px] bg-[#3498DB] flex items-center justify-center text-white shadow-xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#263238] uppercase tracking-tight">Recent Activities</h3>
            <p className="text-[11px] text-[#78909C]">Live system event ledger</p>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-[4px] border border-[#CFD8DC] bg-[#F4F6F9] text-[#546E7A] hover:text-[#263238] hover:bg-[#ECEFF1] transition-colors disabled:opacity-50"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#00B5AD] ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-3 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#90A4AE]" />
          <input
            type="text"
            placeholder="Search activity, user, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-[4px] bg-[#F4F6F9] border border-[#CFD8DC] text-xs text-[#263238] placeholder-[#90A4AE] focus:outline-none focus:border-[#00B5AD] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {['ALL', 'Admission', 'Academic', 'Fee', 'System'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-[4px] text-[11px] font-mono transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-[#00B5AD] text-white font-bold shadow-2xs'
                  : 'text-[#546E7A] hover:text-[#263238] bg-[#F4F6F9] border border-[#E4E7EB]'
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
              className="p-3 rounded-[4px] border border-[#E4E7EB] bg-[#F4F6F9] hover:bg-white hover:border-[#CFD8DC] transition-colors flex items-start justify-between gap-3 group shadow-2xs"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 p-2 rounded-[4px] bg-white border border-[#E4E7EB] shrink-0 shadow-2xs">
                  {getCategoryIcon(act.category)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#263238] truncate">
                      {act.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-[2px] border ${getBadgeColor(
                        act.badgeType
                      )}`}
                    >
                      {act.category}
                    </span>
                  </div>

                  <p className="text-xs text-[#546E7A] mt-1 line-clamp-2">{act.description}</p>

                  <div className="flex items-center gap-2 text-[10px] text-[#78909C] font-mono mt-1.5">
                    <span>by {act.actorName}</span>
                    <span>•</span>
                    <span className="text-[#546E7A] font-medium">{act.actorRole}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1 text-[11px] font-mono text-[#78909C]">
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
