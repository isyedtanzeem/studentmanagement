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
import { AnalyticsCharts } from '../../components/dashboard/AnalyticsCharts';
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
  LogOut,
  KeyRound,
  UserCheck,
  Building2,
  Clock,
  RefreshCw,
  Terminal,
  Search,
  Menu
} from 'lucide-react';

interface DashboardPageProps {}

export const DashboardPage: React.FC<DashboardPageProps> = () => {
  const { user, logout, accessToken } = useAuth();

  // Active Workspace Module state
  const [activeModule, setActiveModule] = useState<ModuleType>('executive');

  // Enforce RBAC guard on activeModule
  const isOfficer = user?.role === 'Admission Officer';
  useEffect(() => {
    const adminModules: ModuleType[] = [
      'faculty',
      'departments',
      'courses',
      'idcards',
      'promotion',
      'alumni',
      'reports',
      'settings'
    ];
    if (isOfficer && adminModules.includes(activeModule)) {
      setActiveModule('admissions');
    }
  }, [isOfficer, activeModule]);

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
    <div className="min-h-screen bg-[#F4F6F9] text-[#263238] flex font-roboto selection:bg-[#00B5AD]/20 selection:text-[#00B5AD]">
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

      {/* Left-side Navigation Bar in Deep Charcoal Slate Gray */}
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

      {/* Main Content Area in Light Cool Gray Background (#F4F6F9) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#F4F6F9]">
        {/* Navigation Header (Google Material Design & 2015 Flat 2.0) */}
        <header className="h-14 border-b border-[#E4E7EB] bg-white sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 text-[#546E7A] hover:text-[#263238] rounded-[4px] bg-[#F4F6F9] border border-[#E4E7EB]"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* University Portal Title & Breadcrumbs */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-[#263238] tracking-tight">
                  ScholarCore SIMS
                </span>
                <span className="text-[#90A4AE]">/</span>
                <span className="text-[#546E7A] font-medium capitalize">
                  {activeModule === 'executive' ? 'Executive Overview' : activeModule}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-[4px] bg-[#ECEFF1] text-[#455A64] border border-[#CFD8DC] font-mono font-bold ml-1">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Center Search Bar Trigger */}
          <div className="flex-1 max-w-md mx-4">
            <button
              onClick={() => setIsGlobalSearchOpen(true)}
              className="w-full bg-[#F4F6F9] hover:bg-[#ECEFF1] border border-[#CFD8DC] rounded-[4px] px-3 py-1.5 text-xs text-[#546E7A] flex items-center justify-between transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-[#00B5AD]" />
                <span className="truncate">Quick search students, courses, applications...</span>
              </div>
              <kbd className="hidden sm:inline-block px-1.5 py-0.2 rounded-[2px] bg-white border border-[#CFD8DC] text-[10px] text-[#78909C] font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* User Quick Actions Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsChangePasswordOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-[#F4F6F9] border border-[#CFD8DC] rounded-[4px] text-xs text-[#546E7A] hover:text-[#263238] transition-colors flex items-center gap-1.5"
              title="Change Password"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#F39C12]" />
              <span className="hidden lg:inline">Password</span>
            </button>

            <button
              onClick={logout}
              className="px-3 py-1.5 bg-[#FDEDEC] hover:bg-[#FADBD8] border border-[#F5B7B1] rounded-[4px] text-xs text-[#C0392B] transition-colors flex items-center gap-1.5 font-medium"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Main Workspace Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-6 space-y-5 max-w-[1600px] mx-auto w-full">
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
              {/* Executive Welcome Bar (2015 Flat Design 2.0 Card) */}
              <div className="bg-white border border-[#E4E7EB] p-4 sm:p-5 rounded-[4px] shadow-[0_2px_4px_rgba(0,0,0,0.06)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Clean Flat Avatar with 4px rounded corners */}
                  <div className="w-12 h-12 rounded-[4px] bg-[#00B5AD] text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-[#263238] font-roboto tracking-tight">
                        {user?.fullName}
                      </h2>
                      <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-[#E8F8F5] text-[#27AE60] border border-[#A3E4D7] font-bold">
                        {user?.status || 'Active'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#546E7A] mt-1 font-roboto">
                      <span className="font-mono text-[#78909C]">{user?.email}</span>
                      <span aria-hidden="true" className="text-[#CFD8DC]">·</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#00B5AD]" />
                        {user?.department || 'Academic Affairs Board'}
                      </span>
                      {(user?.employeeId || user?.studentId) && (
                        <>
                          <span aria-hidden="true" className="text-[#CFD8DC]">·</span>
                          <span className="flex items-center gap-1 font-mono">
                            <UserCheck className="w-3.5 h-3.5 text-[#3498DB]" />
                            ID: {user?.employeeId || user?.studentId}
                          </span>
                        </>
                      )}
                      <span aria-hidden="true" className="text-[#CFD8DC]">·</span>
                      <span className="flex items-center gap-1 text-[#78909C]">
                        <Clock className="w-3.5 h-3.5" />
                        Sync: {user?.lastLogin ? new Date(user.lastLogin).toLocaleTimeString() : 'Current session'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <button
                    onClick={loadDashboardData}
                    disabled={loading}
                    className="px-3.5 py-1.5 rounded-[4px] border border-[#CFD8DC] bg-[#F4F6F9] hover:bg-[#ECEFF1] text-[#263238] text-xs font-medium transition-colors flex items-center gap-2 shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#00B5AD] ${loading ? 'animate-spin' : ''}`} />
                    <span>Sync Metrics</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-[4px] bg-[#FDEDEC] border border-[#F5B7B1] text-[#C0392B] text-xs font-mono">
                  {error}
                </div>
              )}

              {/* 1. TOP ROW: Three KPI Metric Blocks with Large Bold Typography Numbers */}
              {stats && <KPIStatsCards cards={stats} loading={loading} />}

              {/* 2. CENTER AREA: Vibrant Flat Teal and Emerald Green Line Chart + Circular Donut Graph */}
              {chartsData && (
                <AnalyticsCharts
                  data={chartsData}
                  timeframe={timeframe}
                  onTimeframeChange={handleTimeframeChange}
                  loading={loading}
                />
              )}

              {/* 3. BOTTOM AREA: Crisp White Rectangular Data Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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

              {/* Department Overview Strip */}
              <ExecutiveDataSummary onNavigateToModule={(mod) => setActiveModule(mod as ModuleType)} />

              {/* 4. Security Audit Stream (Admins) */}
              {(user?.role === 'Super Admin' || user?.role === 'Admin') && (
                <div className="bg-white border border-[#E4E7EB] p-5 rounded-[4px] shadow-[0_2px_4px_rgba(0,0,0,0.06)] space-y-3 font-roboto">
                  <div className="flex items-center justify-between border-b border-[#ECEFF1] pb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#00B5AD]" />
                      <h3 className="text-sm font-bold text-[#263238] uppercase tracking-tight">
                        System Audit Stream & Security Ledger
                      </h3>
                    </div>

                    <button
                      onClick={fetchAuditLogs}
                      disabled={logsLoading}
                      className="px-2.5 py-1 bg-[#F4F6F9] hover:bg-[#ECEFF1] border border-[#CFD8DC] rounded-[4px] text-xs text-[#546E7A] transition-colors flex items-center gap-1.5 font-mono shadow-2xs"
                    >
                      <RefreshCw className={`w-3 h-3 text-[#00B5AD] ${logsLoading ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  <div className="font-mono text-xs overflow-x-auto">
                    {auditLogs.length === 0 ? (
                      <p className="text-[#90A4AE] py-4 text-center">
                        No audit logs recorded in current runtime session.
                      </p>
                    ) : (
                      <table className="w-full text-left">
                        <thead className="bg-[#F4F6F9] text-[#546E7A] uppercase text-[10px] border-b border-[#E4E7EB]">
                          <tr>
                            <th className="p-2.5 font-bold">Timestamp</th>
                            <th className="p-2.5 font-bold">User / Role</th>
                            <th className="p-2.5 font-bold">Action Event</th>
                            <th className="p-2.5 font-bold">IP Address</th>
                            <th className="p-2.5 font-bold">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ECEFF1] text-[#263238] text-[11px]">
                          {auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-[#F4F6F9] transition-colors">
                              <td className="p-2.5 text-[#78909C]">{new Date(log.timestamp).toLocaleTimeString()}</td>
                              <td className="p-2.5">
                                <span className="text-[#263238] font-bold">{log.userEmail}</span>
                                <span className="text-[#78909C] text-[10px] block">{log.userRole}</span>
                              </td>
                              <td className="p-2.5">
                                <span className="px-1.5 py-0.5 rounded-[2px] bg-[#E8F8F5] text-[#27AE60] border border-[#A3E4D7] text-[10px] font-bold">
                                  {log.action}
                                </span>
                              </td>
                              <td className="p-2.5 text-[#78909C]">{log.ipAddress}</td>
                              <td className="p-2.5 text-[#546E7A]">{log.details}</td>
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

        {/* 2015 Flat Footer */}
        <footer className="h-10 border-t border-[#E4E7EB] px-6 bg-white flex items-center justify-between text-[11px] text-[#78909C] font-roboto shadow-2xs">
          <div>ScholarCore SIMS • Flat 2.0 & Material Design Dashboard</div>
          <div className="font-mono text-[10px]">Real-time Academic Analytics Engine</div>
        </footer>
      </div>
    </div>
  );
};
