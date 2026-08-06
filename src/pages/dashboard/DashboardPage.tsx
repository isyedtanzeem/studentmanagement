import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import { dashboardApi } from '../../api/dashboardApi';
import { AuditLogItem } from '../../types/auth';
import {
  DashboardKPICards,
  DashboardChartsData,
  RecentActivity,
  NotificationItem,
  QuickActionType
} from '../../types/dashboard';
import { ChangePasswordModal } from '../../components/auth/ChangePasswordModal';
import { KPIStatsCards } from '../../components/dashboard/KPIStatsCards';
import { AnalyticsCharts } from '../../components/dashboard/AnalyticsCharts';
import { RecentActivitiesFeed } from '../../components/dashboard/RecentActivitiesFeed';
import { NotificationsPanel } from '../../components/dashboard/NotificationsPanel';
import { QuickActionsModal } from '../../components/dashboard/QuickActionsModal';
import { SidebarNavigation, ModuleType } from '../../components/dashboard/SidebarNavigation';
import { GlobalSearchModal } from '../../components/dashboard/GlobalSearchModal';
import { StudentManagementView } from '../../components/students/StudentManagementView';
import { AdmissionManagementView } from '../../components/admissions/AdmissionManagementView';
import { DepartmentManagementView } from '../../components/departments/DepartmentManagementView';
import { CourseManagementView } from '../../components/courses/CourseManagementView';
import { GuardianManagementView } from '../../components/guardians/GuardianManagementView';
import { DocumentManagementView } from '../../components/documents/DocumentManagementView';
import { IdCardManagementView } from '../../components/idcard/IdCardManagementView';
import { PromotionManagementView } from '../../components/promotion/PromotionManagementView';
import { AlumniManagementView } from '../../components/alumni/AlumniManagementView';
import { ReportsManagementView } from '../../components/reports/ReportsManagementView';
import { NotificationManagementView } from '../../components/notifications/NotificationManagementView';
import { SettingsManagementView } from '../../components/settings/SettingsManagementView';
import { StudentPortalView } from '../../components/student/StudentPortalView';

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
  Zap,
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
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

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

  // Quick Action execution handler
  const handleExecuteQuickAction = async (type: QuickActionType, payload: any) => {
    await dashboardApi.executeQuickAction(type, payload);
    // Refresh dashboard view to reflect updated stats and activities immediately
    await loadDashboardData();
    if (user?.role === 'Super Admin' || user?.role === 'Admin') {
      fetchAuditLogs();
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
    <div className="min-h-screen bg-[#050505] text-zinc-200 flex font-sans selection:bg-[#D4AF37]/30 selection:text-[#D4AF37]">
      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      {/* Executive Quick Actions Modal */}
      <QuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        onExecute={handleExecuteQuickAction}
        userRole={user?.role}
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
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#050505]">
        {/* Navigation Header */}
        <header className="h-16 border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg bg-white/5 border border-white/10"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* University Portal Title */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold tracking-tight serif-font text-white">
                  ScholarCore <span className="text-[#D4AF37] italic font-light">SIMS</span>
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 font-mono font-semibold">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Center Search Bar Trigger */}
          <div className="flex-1 max-w-md mx-4">
            <button
              onClick={() => setIsGlobalSearchOpen(true)}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3.5 py-1.5 text-xs text-zinc-400 flex items-center justify-between transition-all group shadow-inner"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="truncate">Search students, courses, applications...</span>
              </div>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] text-zinc-400 font-mono">
                  ⌘K / Ctrl+K
                </kbd>
            </button>
          </div>

          {/* User Quick Actions Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Action Button for privileged roles */}
            {['Super Admin', 'Admin', 'Admission Officer', 'Faculty'].includes(user?.role || '') && (
              <button
                id="btn-quick-actions"
                onClick={() => setIsQuickActionsOpen(true)}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 rounded-lg text-xs font-semibold text-amber-300 transition-all flex items-center gap-1.5 font-mono shadow-md shadow-amber-500/10"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Quick Actions</span>
              </button>
            )}

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
        {user?.role === 'Student' && (activeModule === 'executive' || activeModule === 'students') ? (
          <StudentPortalView />
        ) : activeModule === 'admissions' ? (
          <AdmissionManagementView />
        ) : activeModule === 'students' ? (
          <StudentManagementView />
        ) : activeModule === 'departments' ? (
          <DepartmentManagementView />
        ) : activeModule === 'courses' ? (
          <CourseManagementView />
        ) : activeModule === 'guardians' ? (
          <GuardianManagementView />
        ) : activeModule === 'documents' ? (
          <DocumentManagementView />
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
        ) : user?.role === 'Student' ? (
          <StudentPortalView />
        ) : (
          <>
            {/* User Hero Banner */}
        <div className="bg-[#0d0d12]/90 border border-white/10 p-6 rounded-2xl backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={
                    user?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                  }
                  alt={user?.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D4AF37]/50 shadow-lg"
                />
                <span
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-black rounded-full"
                  title="Active Session"
                />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-light text-white serif-font">{user?.fullName}</h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                    {user?.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 font-mono">{user?.email}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mt-2">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {user?.department || 'Academic Affairs Board'}
                  </span>
                  {(user?.employeeId || user?.studentId) && (
                    <span className="flex items-center gap-1.5 font-mono">
                      <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                      ID: {user?.employeeId || user?.studentId}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    Auth Sync: {user?.lastLogin ? new Date(user.lastLogin).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:text-amber-400 hover:border-amber-500/30 text-xs font-mono transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
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

        {/* 2. Analytics Charts Module */}
        {chartsData && (
          <AnalyticsCharts
            data={chartsData}
            timeframe={timeframe}
            onTimeframeChange={handleTimeframeChange}
            loading={loading}
          />
        )}

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
          <div className="bg-[#0d0d12]/90 border border-white/10 p-6 rounded-2xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-semibold text-white serif-font">
                  System Audit Stream & Security Ledger
                </h3>
              </div>

              <button
                onClick={fetchAuditLogs}
                disabled={logsLoading}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-zinc-300 transition-all flex items-center gap-1.5 font-mono"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${logsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Audit Stream</span>
              </button>
            </div>

            <div className="font-mono text-xs overflow-x-auto">
              {auditLogs.length === 0 ? (
                <p className="text-zinc-500 py-4 text-center">
                  No audit logs recorded in current runtime session.
                </p>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-zinc-400 uppercase text-[10px] border-b border-white/10">
                    <tr>
                      <th className="p-2.5">Timestamp</th>
                      <th className="p-2.5">User / Role</th>
                      <th className="p-2.5">Action Event</th>
                      <th className="p-2.5">IP Address</th>
                      <th className="p-2.5">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300 text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-2.5 text-zinc-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="p-2.5">
                          <span className="text-white font-medium">{log.userEmail}</span>
                          <span className="text-zinc-500 text-[10px] block">{log.userRole}</span>
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 text-[10px] font-semibold">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-2.5 text-zinc-400">{log.ipAddress}</td>
                        <td className="p-2.5 text-zinc-400">{log.details}</td>
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
      <footer className="h-10 border-t border-white/10 px-8 bg-black flex items-center justify-between text-[10px] text-zinc-500 font-mono">
        <div>ScholarCore SIMS • Executive Dashboard Module</div>
        <div>Real-time Analytics Engine Active</div>
      </footer>
      </div>
    </div>
  );
};
