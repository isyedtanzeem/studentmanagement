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
      accentColor: 'from-blue-50 to-slate-50 border-blue-200 text-blue-700',
      iconBg: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'new-admissions',
      title: 'New Admissions',
      data: cards.newAdmissions,
      icon: UserPlus,
      accentColor: 'from-emerald-50 to-slate-50 border-emerald-200 text-emerald-700',
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'active-students',
      title: 'Active Students',
      data: cards.activeStudents,
      icon: CheckCircle,
      accentColor: 'from-indigo-50 to-slate-50 border-indigo-200 text-indigo-700',
      iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      id: 'departments',
      title: 'Departments',
      data: cards.departments,
      icon: Building2,
      accentColor: 'from-purple-50 to-slate-50 border-purple-200 text-purple-700',
      iconBg: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      id: 'courses',
      title: 'Courses',
      data: cards.courses,
      icon: BookOpen,
      accentColor: 'from-sky-50 to-slate-50 border-sky-200 text-sky-700',
      iconBg: 'bg-sky-50 text-sky-700 border-sky-200'
    },
    {
      id: 'faculty',
      title: 'Faculty',
      data: cards.faculty,
      icon: GraduationCap,
      accentColor: 'from-rose-50 to-slate-50 border-rose-200 text-rose-700',
      iconBg: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      id: 'pending-admissions',
      title: 'Pending Admissions',
      data: cards.pendingAdmissions,
      icon: Clock,
      accentColor: 'from-amber-50 to-slate-50 border-amber-200 text-amber-800',
      iconBg: 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-slate-100 border border-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-wider text-slate-600 uppercase font-mono">
          Executive KPI Metrics
        </h2>
        <span className="text-[11px] text-slate-500 font-mono">Real-time sync</span>
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
              className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-blue-300 hover:shadow-md shadow-xs group"
            >
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 font-sans tracking-wide">
                    {item.title}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">
                    {item.data.value.toLocaleString()}
                  </h3>
                </div>

                <div className={`p-2.5 rounded-lg border ${item.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="relative z-10 mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1 font-mono">
                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                      isPos
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    <TrendIcon className="w-3 h-3" />
                    {item.data.growthRate}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-sans truncate pl-1">
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
