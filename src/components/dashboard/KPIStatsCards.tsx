import React from 'react';
import {
  Users,
  UserPlus,
  CheckCircle,
  Building2,
  BookOpen,
  GraduationCap,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { DashboardKPICards } from '../../types/dashboard';

interface KPIStatsCardsProps {
  cards: DashboardKPICards;
  loading?: boolean;
}

export const KPIStatsCards: React.FC<KPIStatsCardsProps> = ({ cards, loading }) => {
  const cardItems = [
    {
      id: 'total-students',
      title: 'Total Students',
      data: cards.totalStudents,
      icon: Users,
      accentColor: 'from-amber-500/20 to-yellow-600/10 border-amber-500/30 text-amber-400',
      iconBg: 'bg-amber-500/10 text-amber-400'
    },
    {
      id: 'new-admissions',
      title: 'New Admissions',
      data: cards.newAdmissions,
      icon: UserPlus,
      accentColor: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/30 text-emerald-400',
      iconBg: 'bg-emerald-500/10 text-emerald-400'
    },
    {
      id: 'active-students',
      title: 'Active Students',
      data: cards.activeStudents,
      icon: CheckCircle,
      accentColor: 'from-cyan-500/20 to-blue-600/10 border-cyan-500/30 text-cyan-400',
      iconBg: 'bg-cyan-500/10 text-cyan-400'
    },
    {
      id: 'departments',
      title: 'Departments',
      data: cards.departments,
      icon: Building2,
      accentColor: 'from-purple-500/20 to-indigo-600/10 border-purple-500/30 text-purple-400',
      iconBg: 'bg-purple-500/10 text-purple-400'
    },
    {
      id: 'courses',
      title: 'Courses',
      data: cards.courses,
      icon: BookOpen,
      accentColor: 'from-blue-500/20 to-indigo-600/10 border-blue-500/30 text-blue-400',
      iconBg: 'bg-blue-500/10 text-blue-400'
    },
    {
      id: 'faculty',
      title: 'Faculty',
      data: cards.faculty,
      icon: GraduationCap,
      accentColor: 'from-rose-500/20 to-pink-600/10 border-rose-500/30 text-rose-400',
      iconBg: 'bg-rose-500/10 text-rose-400'
    },
    {
      id: 'pending-admissions',
      title: 'Pending Admissions',
      data: cards.pendingAdmissions,
      icon: Clock,
      accentColor: 'from-amber-600/20 to-orange-600/10 border-amber-600/40 text-amber-300',
      iconBg: 'bg-amber-600/20 text-amber-300 animate-pulse'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-wider text-amber-400/90 uppercase font-mono">
          Executive KPI Metrics
        </h2>
        <span className="text-[11px] text-zinc-500 font-mono">Real-time sync</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cardItems.map((item) => {
          const Icon = item.icon;
          const isPos = item.data.isPositive;
          const TrendIcon = isPos ? TrendingUp : TrendingDown;

          return (
            <div
              key={item.id}
              id={`kpi-card-${item.id}`}
              className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0d0d12]/80 backdrop-blur-md p-4 transition-all duration-300 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 group"
            >
              {/* Subtle accent gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.accentColor} opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none`}
              />

              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-400 font-sans tracking-wide">
                    {item.title}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold font-mono text-zinc-100 tracking-tight">
                    {item.data.value.toLocaleString()}
                  </h3>
                </div>

                <div className={`p-2.5 rounded-lg border border-white/10 ${item.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="relative z-10 mt-3 flex items-center justify-between text-xs pt-2 border-t border-white/5">
                <div className="flex items-center gap-1 font-mono">
                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                      isPos
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    }`}
                  >
                    <TrendIcon className="w-3 h-3" />
                    {item.data.growthRate}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500 font-sans truncate pl-1">
                  {item.data.trendText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
