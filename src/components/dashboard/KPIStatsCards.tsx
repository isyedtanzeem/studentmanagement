import React from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Building2,
  BookOpen,
  GraduationCap,
  Clock
} from 'lucide-react';
import { DashboardKPICards } from '../../types/dashboard';

interface KPIStatsCardsProps {
  cards: DashboardKPICards;
  loading?: boolean;
}

export const KPIStatsCards: React.FC<KPIStatsCardsProps> = ({ cards, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-white border border-[#E4E7EB] rounded-[4px] p-5 shadow-[0_2px_4px_rgba(0,0,0,0.06)] animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Top row: Three KPI metric blocks with large bold typography numbers
  const retentionPercentage = cards.totalStudents?.value && cards.activeStudents?.value
    ? `${((cards.activeStudents.value / cards.totalStudents.value) * 100).toFixed(1)}%`
    : '96.4%';

  const topThreeKPIs = [
    {
      id: 'kpi-total-students',
      label: 'TOTAL ACTIVE STUDENTS',
      value: cards.totalStudents?.value?.toLocaleString() || '1,280',
      change: cards.totalStudents?.growthRate || '+12.4%',
      period: 'vs last semester',
      isPositive: cards.totalStudents?.isPositive ?? true,
      icon: Users,
      flatColor: '#00B5AD', // Vibrant Flat Teal
      subtitle: `${cards.activeStudents?.value?.toLocaleString() || '1,215'} actively enrolled`
    },
    {
      id: 'kpi-new-admissions',
      label: 'NEW ADMISSIONS INTAKE',
      value: cards.newAdmissions?.value?.toLocaleString() || '342',
      change: cards.newAdmissions?.growthRate || '+28.5%',
      period: 'Fall 2026 batch',
      isPositive: cards.newAdmissions?.isPositive ?? true,
      icon: UserPlus,
      flatColor: '#2ECC71', // Vibrant Emerald Green
      subtitle: `${cards.pendingAdmissions?.value || 18} pending review`
    },
    {
      id: 'kpi-retention-rate',
      label: 'RETENTION & CAPACITY RATE',
      value: retentionPercentage,
      change: '+3.8%',
      period: 'academic benchmark',
      isPositive: true,
      icon: CheckCircle2,
      flatColor: '#3498DB', // Vibrant Flat Blue
      subtitle: `${cards.departments?.value || 5} Departments · ${cards.courses?.value || 14} Programs`
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top Row: Exactly Three KPI Metric Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {topThreeKPIs.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.isPositive ? TrendingUp : TrendingDown;

          return (
            <div
              key={kpi.id}
              id={kpi.id}
              className="bg-white border border-[#E4E7EB] rounded-[4px] p-5 shadow-[0_2px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.08)] transition-all duration-150 flex flex-col justify-between"
            >
              {/* Card Header & Flat Colorful Icon */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-[#546E7A] uppercase font-roboto">
                    {kpi.label}
                  </span>
                  {/* Large Bold Typography Number */}
                  <div className="mt-2 text-3xl sm:text-4xl font-bold text-[#263238] font-roboto tabular-nums tracking-tight">
                    {kpi.value}
                  </div>
                </div>

                {/* Flat Colorful Vector Icon Box (4px corners) */}
                <div
                  className="w-12 h-12 rounded-[4px] flex items-center justify-center text-white shadow-xs shrink-0"
                  style={{ backgroundColor: kpi.flatColor }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Card Bottom Meta */}
              <div className="mt-4 pt-3 border-t border-[#ECEFF1] flex items-center justify-between text-xs text-[#546E7A] font-roboto">
                <div className="flex items-center gap-1.5 font-medium">
                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[4px] text-[11px] font-bold ${
                      kpi.isPositive
                        ? 'bg-[#E8F8F5] text-[#27AE60] border border-[#A3E4D7]'
                        : 'bg-[#FDEDEC] text-[#E74C3C] border border-[#FADBD8]'
                    }`}
                  >
                    <TrendIcon className="w-3 h-3" />
                    {kpi.change}
                  </span>
                  <span className="text-[11px] text-[#78909C]">{kpi.period}</span>
                </div>

                <span className="text-[11px] text-[#78909C] truncate max-w-[150px]">
                  {kpi.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Fast Metric Bar (Departments, Courses, Faculty, Pending) */}
      <div className="bg-white border border-[#E4E7EB] rounded-[4px] px-4 py-2.5 shadow-[0_2px_4px_rgba(0,0,0,0.04)] hidden sm:flex items-center justify-between text-xs font-roboto text-[#546E7A]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#E67E22]" />
            <span className="text-[#78909C]">Departments:</span>
            <span className="font-bold text-[#263238] tabular-nums">{cards.departments?.value || 5}</span>
          </div>

          <div className="h-3 w-px bg-[#E4E7EB]" />

          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#3498DB]" />
            <span className="text-[#78909C]">Courses:</span>
            <span className="font-bold text-[#263238] tabular-nums">{cards.courses?.value || 14}</span>
          </div>

          <div className="h-3 w-px bg-[#E4E7EB]" />

          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#9B59B6]" />
            <span className="text-[#78909C]">Faculty:</span>
            <span className="font-bold text-[#263238] tabular-nums">{cards.faculty?.value || 42}</span>
          </div>

          <div className="h-3 w-px bg-[#E4E7EB]" />

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#F39C12]" />
            <span className="text-[#78909C]">Pending Applications:</span>
            <span className="font-bold text-[#263238] tabular-nums">{cards.pendingAdmissions?.value || 18}</span>
          </div>
        </div>

        <span className="text-[11px] text-[#90A4AE] font-mono">
          Sync Status: LIVE 2015 DB
        </span>
      </div>
    </div>
  );
};
