import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import { dashboardApi } from '../../api/dashboardApi';
import { AuditLogItem } from '../../types/auth';
import {
  DashboardKPICards,
  DashboardChartsData,
  RecentActivity,
  NotificationItem
} from '../../types/dashboard';
import { ChangePasswordModal } from '../../components/auth/ChangePasswordModal';
import { KPIStatsCards } from '../../components/dashboard/KPIStatsCards';
import { ExecutiveDataSummary } from '../../components/dashboard/ExecutiveDataSummary';
import { RecentActivitiesFeed } from '../../components/dashboard/RecentActivitiesFeed';
import { NotificationsPanel } from '../../components/dashboard/NotificationsPanel';
import { SidebarNavigation, ModuleType } from '../../components/dashboard/SidebarNavigation';
import { GlobalSearchModal } from '../../components/dashboard/GlobalSearchModal';
import { StudentManagementView } from '../../components/students/StudentManagementView';
import { FacultyManagementView } from '../../components/faculty/FacultyManagementView';
import { AdmissionManagementView } from '../../components/admissions/AdmissionManagementView';
import { DepartmentManagementView } from '../../components/departments/DepartmentManagementView';
import { CourseManagementView } from '../../components/courses/CourseManagementView';
import { IdCardManagementView } from '../../components/idcard/IdCardManagementView';
import { PromotionManagementView } from '../../components/promotion/PromotionManagementView';
import { AlumniManagementView } from '../../components/alumni/AlumniManagementView';
import { ReportsManagementView } from '../../components/reports/ReportsManagementView';
import { NotificationManagementView } from '../../components/notifications/NotificationManagementView';
import { SettingsManagementView } from '../../components/settings/SettingsManagementView';

import {
  ShieldCheck,
  CreditCard,
  TrendingUp,
  FileText,
  LogOut,
  KeyRound,
  UserCheck,
  Building2,
  BookOpen,
  Clock,
  RefreshCw,
  Terminal,
  Layers,
  Sparkles,
  Users,
  LayoutDashboard,
  GraduationCap,
  Bell,
  Settings,
  Search,
  Menu
} from 'lucide-react';

interface DashboardPageProps {}

export const DashboardPage: React.FC<DashboardPageProps> = () => {
  const { user, logout, accessToken } = useAuth();

  // Active Workspace Module state
  const [activeModule, setActiveModule] = useState<ModuleType>('executive');

  // Sidebar & Navigation States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);

  // Modals State
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Dashboard Data States
  const [stats, setStats] = useState<DashboardKPICards | null>(null);
  const [chartsData, setChartsData] = useState<DashboardChartsData | null>(null);
  const [timeframe, setTimeframe] = useState<'year' | 'semester' | 'month'>('year');
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);

  // Loading & Error States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Load all Dashboard Data
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, chartsRes, activitiesRes, notifRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getChartData(timeframe),
        dashboardApi.getActivities(10),
        dashboardApi.getNotifications()
      ]);

      if (statsRes.success) setStats(statsRes.data.kpiCards);
      if (chartsRes.success) setChartsData(chartsRes.data);
      if (activitiesRes.success) setActivities(activitiesRes.data);
      if (notifRes.success) {
        setNotifications(notifRes.data.notifications);
        setUnreadNotifCount(notifRes.data.unreadCount);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sync dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  // Timeframe change handler for charts
  const handleTimeframeChange = async (newTimeframe: 'year' | 'semester' | 'month') => {
    setTimeframe(newTimeframe);
    try {
      const res = await dashboardApi.getChartData(newTimeframe);
      if (res.success) setChartsData(res.data);
    } catch (err: any) {
      console.error('Failed to change chart timeframe:', err);
    }
  };

  // Notification actions
  const handleMarkNotifRead = async (id: string) => {
    try {
      const res = await dashboardApi.markNotificationRead(id);
      if (res.success) {
        setNotifications(res.data.notifications);
        setUnreadNotifCount(res.data.unreadCount);
      }
    } catch (err: any) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      const res = await dashboardApi.markAllNotificationsRead();
      if (res.success) {
        setNotifications(res.data.notifications);
        setUnreadNotifCount(res.data.unreadCount);
      }
    } catch (err: any) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  // Fetch security audit logs for Admin / Super Admin
  const fetchAuditLogs = async () => {
    if (user?.role === 'Super Admin' || user?.role === 'Admin') {
      setLogsLoading(true);
      try {
        const res = await authApi.getAuditLogs(accessToken);
        if (res.success && res.data) {
          setAuditLogs(res.data);
        }
      } catch (err: any) {
        console.error('Audit logs load failed:', err);
      } finally {
        setLogsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadDashboardData();
    fetchAuditLogs();
  }, [user?.role, accessToken]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      {/* Global Search Command Palette Modal */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onSelectModule={mod => {
          setActiveModule(mod);
          setIsGlobalSearchOpen(false);
        }}
      />

      {/* Collapsible Desktop Sidebar & Mobile Drawer Navigation */}
      <SidebarNavigation
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        userRole={user?.role}
        unreadCount={unreadNotifCount}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-slate-50">
        {/* Navigation Header */}
        <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg bg-slate-100 border border-slate-200"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* University Portal Title */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold tracking-tight serif-font text-slate-900">
                  ScholarCore <span className="text-blue-700 italic font-light">SIMS</span>
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono font-semibold">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Center Search Bar Trigger */}
          <div className="flex-1 max-w-md mx-4">
            <button
              onClick={() => setIsGlobalSearchOpen(true)}
              className="w-full bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-600 flex items-center justify-between transition-all group shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="truncate">Search students, courses, applications...</span>
              </div>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-500 font-mono shadow-2xs">
                ⌘K / Ctrl+K
              </kbd>
            </button>
          </div>

          {/* User Quick Actions Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsChangePasswordOpen(true)}
              className="p-2 sm:px-3 sm:py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-zinc-300 transition-all flex items-center gap-2"
              title="Change Password"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden lg:inline">Password</span>
            </button>

            <button
              onClick={logout}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs text-rose-400 transition-all flex items-center gap-1.5 font-medium"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        <div className="accent-line w-full" />

        {/* Main Workspace Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {activeModule === 'admissions' ? (
          <AdmissionManagementView />
        ) : activeModule === 'students' ? (
          <StudentManagementView />
        ) : activeModule === 'faculty' ? (
          <FacultyManagementView />
        ) : activeModule === 'departments' ? (
          <DepartmentManagementView />
        ) : activeModule === 'courses' ? (
          <CourseManagementView />
        ) : activeModule === 'idcards' ? (
          <IdCardManagementView />
        ) : activeModule === 'promotion' ? (
          <PromotionManagementView />
        ) : activeModule === 'alumni' ? (
          <AlumniManagementView />
        ) : activeModule === 'reports' ? (
          <ReportsManagementView />
        ) : activeModule === 'notifications' ? (
          <NotificationManagementView />
        ) : activeModule === 'settings' ? (
          <SettingsManagementView />
        ) : (
          <>
            {/* User Hero Banner */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={
                    user?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                  }
                  alt={user?.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-200 shadow-sm"
                />
                <span
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"
                  title="Active Session"
                />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold text-slate-900 serif-font">{user?.fullName}</h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    {user?.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-mono">{user?.email}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    {user?.department || 'Academic Affairs Board'}
                  </span>
                  {(user?.employeeId || user?.studentId) && (
                    <span className="flex items-center gap-1.5 font-mono">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      ID: {user?.employeeId || user?.studentId}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Auth Sync: {user?.lastLogin ? new Date(user.lastLogin).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:text-blue-700 hover:border-blue-300 text-xs font-mono transition-all flex items-center gap-2 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                <span>Sync Metrics</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        {/* 1. Dashboard KPI Cards Module */}
        {stats && <KPIStatsCards cards={stats} loading={loading} />}

        {/* 2. Executive Minimal Data Summary (No Graphs) */}
        <ExecutiveDataSummary onNavigateToModule={setActiveModule} />

        {/* 3. Grid Row: Recent Activities & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivitiesFeed
            activities={activities}
            loading={loading}
            onRefresh={loadDashboardData}
          />

          <NotificationsPanel
            notifications={notifications}
            unreadCount={unreadNotifCount}
            onMarkRead={handleMarkNotifRead}
            onMarkAllRead={handleMarkAllNotifsRead}
            loading={loading}
          />
        </div>

        {/* 4. Security Audit Stream (Admins) */}
        {(user?.role === 'Super Admin' || user?.role === 'Admin') && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-semibold text-slate-900 serif-font">
                  System Audit Stream & Security Ledger
                </h3>
              </div>

              <button
                onClick={fetchAuditLogs}
                disabled={logsLoading}
                className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 transition-all flex items-center gap-1.5 font-mono shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${logsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Audit Stream</span>
              </button>
            </div>

            <div className="font-mono text-xs overflow-x-auto">
              {auditLogs.length === 0 ? (
                <p className="text-slate-400 py-4 text-center">
                  No audit logs recorded in current runtime session.
                </p>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Timestamp</th>
                      <th className="p-2.5">User / Role</th>
                      <th className="p-2.5">Action Event</th>
                      <th className="p-2.5">IP Address</th>
                      <th className="p-2.5">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="p-2.5">
                          <span className="text-slate-900 font-medium">{log.userEmail}</span>
                          <span className="text-slate-500 text-[10px] block">{log.userRole}</span>
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-500">{log.ipAddress}</td>
                        <td className="p-2.5 text-slate-500">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        </>
        )}
      </main>

      {/* Footer */}
      <footer className="h-10 border-t border-slate-200 px-8 bg-white flex items-center justify-between text-[10px] text-slate-500 font-mono shadow-2xs">
        <div>ScholarCore SIMS • Executive Dashboard Module</div>
        <div>Real-time Analytics Engine Active</div>
      </footer>
      </div>
    </div>
  );
};
