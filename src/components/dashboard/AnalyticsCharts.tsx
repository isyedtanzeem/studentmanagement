import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart2, Layers } from 'lucide-react';
import { DashboardChartsData } from '../../types/dashboard';

interface AnalyticsChartsProps {
  data: DashboardChartsData;
  timeframe: 'year' | 'semester' | 'month';
  onTimeframeChange: (timeframe: 'year' | 'semester' | 'month') => void;
  loading?: boolean;
}

const GENDER_COLORS = ['#3b82f6', '#ec4899', '#a855f7'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  data,
  timeframe,
  onTimeframeChange,
  loading
}) => {
  const [activeTab, setActiveTab] = useState<'growth' | 'departments' | 'gender' | 'admissions'>('growth');

  if (loading) {
    return (
      <div className="h-96 rounded-xl bg-white/5 border border-white/10 animate-pulse p-6" />
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            id="tab-growth"
            onClick={() => setActiveTab('growth')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all whitespace-nowrap ${
              activeTab === 'growth'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            Student Growth
          </button>

          <button
            id="tab-departments"
            onClick={() => setActiveTab('departments')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all whitespace-nowrap ${
              activeTab === 'departments'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
            Dept Wise Students
          </button>

          <button
            id="tab-gender"
            onClick={() => setActiveTab('gender')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all whitespace-nowrap ${
              activeTab === 'gender'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5 text-blue-600" />
            Gender Ratio
          </button>

          <button
            id="tab-admissions"
            onClick={() => setActiveTab('admissions')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all whitespace-nowrap ${
              activeTab === 'admissions'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            Admission Trends
          </button>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-1 self-end sm:self-auto">
          {(['year', 'semester', 'month'] as const).map((t) => (
            <button
              key={t}
              onClick={() => onTimeframeChange(t)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all capitalize ${
                timeframe === t
                  ? 'bg-white text-blue-700 font-semibold shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 font-sans flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              {activeTab === 'growth' && 'Student Enrollment & Active Growth Trajectory'}
              {activeTab === 'departments' && 'Department-Wise Student Distribution & Capacity'}
              {activeTab === 'gender' && 'Institutional Diversity & Gender Balance Ratio'}
              {activeTab === 'admissions' && 'Monthly Admission Application vs Acceptance Trends'}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Verified SIMS institutional metrics database
            </p>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          {/* 1. Student Growth Area Chart */}
          {activeTab === 'growth' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.studentGrowth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                <XAxis dataKey="label" stroke="#a1a1aa" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#a1a1aa" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#3f3f46',
                    borderRadius: '8px',
                    color: '#f4f4f5',
                    fontSize: '12px',
                    fontFamily: 'sans-serif'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace' }} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total Enrolled"
                  stroke="#d4af37"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  name="Active Students"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorActive)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* 2. Department Wise Bar Chart */}
          {activeTab === 'departments' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.departmentWiseStudents} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#a1a1aa" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#3f3f46',
                    borderRadius: '8px',
                    color: '#f4f4f5',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace' }} />
                <Bar dataKey="students" name="Students Count" fill="#d4af37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="faculty" name="Faculty Members" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* 3. Gender Ratio Donut Pie Chart */}
          {activeTab === 'gender' && (
            <div className="flex flex-col md:flex-row items-center justify-center h-full gap-6">
              <div className="w-full md:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.genderRatio}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.genderRatio.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#3f3f46',
                        borderRadius: '8px',
                        color: '#f4f4f5',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend Summary Cards */}
              <div className="w-full md:w-1/2 space-y-2">
                {data.genderRatio.map((item, idx) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: GENDER_COLORS[idx % GENDER_COLORS.length] }}
                      />
                      <span className="text-xs font-medium text-zinc-200">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-zinc-400">{item.value.toLocaleString()}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
                        {item.percentage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Admission Trends Bar Chart */}
          {activeTab === 'admissions' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.admissionTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                <XAxis dataKey="month" stroke="#a1a1aa" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#a1a1aa" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#3f3f46',
                    borderRadius: '8px',
                    color: '#f4f4f5',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace' }} />
                <Bar dataKey="applications" name="Total Applications" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="accepted" name="Approved Admissions" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending Review" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
