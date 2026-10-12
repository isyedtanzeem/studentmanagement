import React, { useState } from 'react';
import {
  LineChart,
  Line,
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
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { DashboardChartsData } from '../../types/dashboard';

interface AnalyticsChartsProps {
  data: DashboardChartsData;
  timeframe: 'year' | 'semester' | 'month';
  onTimeframeChange: (timeframe: 'year' | 'semester' | 'month') => void;
  loading?: boolean;
}

// 2015 Flat Design 2.0 Color Palette
const FLAT_PALETTE = [
  '#00B5AD', // Vibrant Flat Teal
  '#2ECC71', // Vibrant Emerald Green
  '#3498DB', // Flat Dodger Blue
  '#E67E22', // Flat Orange
  '#9B59B6', // Flat Purple
  '#E74C3C'  // Flat Red
];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  data,
  timeframe,
  onTimeframeChange,
  loading
}) => {
  const [activeDonutView, setActiveDonutView] = useState<'departments' | 'gender'>('departments');

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-96 bg-white border border-[#E4E7EB] rounded-[4px] p-5 shadow-[0_2px_4px_rgba(0,0,0,0.06)] animate-pulse" />
        <div className="lg:col-span-1 h-96 bg-white border border-[#E4E7EB] rounded-[4px] p-5 shadow-[0_2px_4px_rgba(0,0,0,0.06)] animate-pulse" />
      </div>
    );
  }

  // Format donut data
  const donutData =
    activeDonutView === 'departments'
      ? data.departmentWiseStudents.map((dept, idx) => ({
          name: dept.name,
          fullName: dept.fullName,
          value: dept.students,
          color: FLAT_PALETTE[idx % FLAT_PALETTE.length]
        }))
      : data.genderRatio.map((g, idx) => ({
          name: g.name,
          fullName: `${g.name} Ratio`,
          value: g.value,
          color: FLAT_PALETTE[idx % FLAT_PALETTE.length]
        }));

  const totalDonutValue = donutData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 font-roboto">
      {/* 1. Left Card: Vibrant Flat Teal and Emerald Green Line Chart (Spans 2 columns) */}
      <div className="lg:col-span-2 bg-white border border-[#E4E7EB] rounded-[4px] p-5 shadow-[0_2px_4px_rgba(0,0,0,0.06)] flex flex-col justify-between">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ECEFF1]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-[#00B5AD] flex items-center justify-center text-white shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#263238] tracking-tight uppercase">
                Student Enrollment & Retention Trajectory
              </h3>
              <p className="text-[11px] text-[#78909C]">
                Comparative metrics in vibrant flat teal & emerald green
              </p>
            </div>
          </div>

          {/* Timeframe Selector (Flat 2.0 Buttons with 4px corners) */}
          <div className="flex items-center gap-1 bg-[#F4F6F9] border border-[#E4E7EB] rounded-[4px] p-1 self-start sm:self-auto">
            {(['year', 'semester', 'month'] as const).map((t) => (
              <button
                key={t}
                onClick={() => onTimeframeChange(t)}
                className={`px-3 py-1 rounded-[4px] text-xs font-medium transition-colors capitalize ${
                  timeframe === t
                    ? 'bg-[#00B5AD] text-white shadow-xs font-bold'
                    : 'text-[#546E7A] hover:text-[#263238] hover:bg-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Line Chart Area */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.studentGrowth}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF1" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#78909C"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#CFD8DC' }}
                fontFamily="Roboto, sans-serif"
              />
              <YAxis
                stroke="#78909C"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#CFD8DC' }}
                fontFamily="Roboto, sans-serif"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#263238',
                  border: 'none',
                  borderRadius: '4px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontFamily: 'Roboto, sans-serif',
                  padding: '8px 12px'
                }}
                itemStyle={{ color: '#ECEFF1' }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: '12px',
                  fontFamily: 'Roboto, sans-serif',
                  paddingTop: '8px'
                }}
              />
              {/* Vibrant Flat Teal Line */}
              <Line
                type="monotone"
                dataKey="total"
                name="Total Enrolled"
                stroke="#00B5AD"
                strokeWidth={3}
                dot={{ r: 4, fill: '#00B5AD', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 6, fill: '#00B5AD', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
              {/* Vibrant Emerald Green Line */}
              <Line
                type="monotone"
                dataKey="active"
                name="Active Students"
                stroke="#2ECC71"
                strokeWidth={3}
                dot={{ r: 4, fill: '#2ECC71', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 6, fill: '#2ECC71', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Card Footer Legend / Summary */}
        <div className="mt-2 pt-3 border-t border-[#ECEFF1] flex items-center justify-between text-xs text-[#546E7A]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#00B5AD]" />
              <strong className="text-[#263238]">Flat Teal:</strong> Total Registrations
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#2ECC71]" />
              <strong className="text-[#263238]">Emerald Green:</strong> Active Attendance
            </span>
          </div>
          <span className="text-[11px] text-[#78909C] font-mono">
            {timeframe.toUpperCase()} VIEW
          </span>
        </div>
      </div>

      {/* 2. Right Card: Circular Donut Graph (Spans 1 column) */}
      <div className="lg:col-span-1 bg-white border border-[#E4E7EB] rounded-[4px] p-5 shadow-[0_2px_4px_rgba(0,0,0,0.06)] flex flex-col justify-between">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ECEFF1]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-[#2ECC71] flex items-center justify-center text-white shadow-xs">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#263238] tracking-tight uppercase">
                {activeDonutView === 'departments' ? 'Department Ratio' : 'Gender Diversity'}
              </h3>
              <p className="text-[11px] text-[#78909C]">
                Distribution by academic wings
              </p>
            </div>
          </div>

          {/* Toggle between Department / Diversity */}
          <button
            onClick={() =>
              setActiveDonutView(activeDonutView === 'departments' ? 'gender' : 'departments')
            }
            className="text-[11px] px-2 py-0.5 rounded-[4px] bg-[#F4F6F9] hover:bg-[#E4E7EB] text-[#546E7A] border border-[#E4E7EB] transition-colors"
          >
            {activeDonutView === 'departments' ? 'By Gender' : 'By Dept'}
          </button>
        </div>

        {/* Circular Donut Graph */}
        <div className="relative h-48 w-full my-2 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#263238',
                  border: 'none',
                  borderRadius: '4px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontFamily: 'Roboto, sans-serif'
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Donut Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold text-[#78909C] uppercase tracking-wider">
              Total
            </span>
            <span className="text-xl font-bold text-[#263238] tabular-nums font-roboto">
              {totalDonutValue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Donut Breakdown Legend Table */}
        <div className="mt-1 space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
          {donutData.map((item) => {
            const pct =
              totalDonutValue > 0
                ? ((item.value / totalDonutValue) * 100).toFixed(1)
                : '0';

            return (
              <div
                key={item.name}
                className="flex items-center justify-between text-xs py-1 border-b border-[#F4F6F9]"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-[2px] shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[#263238] font-medium truncate" title={item.fullName}>
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                  <span className="text-[#78909C] tabular-nums">{item.value}</span>
                  <span className="font-bold text-[#263238] tabular-nums">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
