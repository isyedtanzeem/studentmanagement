import React from 'react';
import {
  Sparkles,
  GraduationCap,
  Users,
  UserCheck,
  Building2,
  BookOpen,
  ShieldCheck,
  FileText,
  CreditCard,
  TrendingUp,
  Bell,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';

export type ModuleType =
  | 'executive'
  | 'admissions'
  | 'students'
  | 'faculty'
  | 'departments'
  | 'courses'
  | 'documents'
  | 'idcards'
  | 'promotion'
  | 'alumni'
  | 'reports'
  | 'notifications'
  | 'settings';

interface SidebarNavigationProps {
  activeModule: ModuleType;
  onSelectModule: (module: ModuleType) => void;
  userRole?: string;
  unreadCount?: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: ModuleType;
  label: string;
  icon: React.ElementType;
  badge?: string;
  roles?: string[];
  description: string;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeModule,
  onSelectModule,
  userRole = 'Admin',
  unreadCount = 0,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) => {
  const navItems: NavItem[] = [
    {
      id: 'executive',
      label: 'Executive Overview',
      icon: Sparkles,
      description: 'KPIs, Enrolment Trends & Health',
      roles: ['Super Admin', 'Admin', 'Admission Officer']
    },
    {
      id: 'admissions',
      label: 'Admissions & Intake',
      icon: GraduationCap,
      badge: "'26 Intake",
      description: 'Applications & Verification',
      roles: ['Super Admin', 'Admin', 'Admission Officer']
    },
    {
      id: 'students',
      label: 'Student Directory',
      icon: Users,
      description: 'Profiles & Attendance Management',
      roles: ['Super Admin', 'Admin', 'Admission Officer']
    },
    {
      id: 'faculty',
      label: 'Faculty & HODs',
      icon: UserCheck,
      description: 'Faculty Registration, HODs & Staff',
      roles: ['Super Admin', 'Admin', 'Admission Officer']
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Building2,
      description: 'Department HODs & Operations',
      roles: ['Super Admin', 'Admin', 'Admission Officer']
    },
    {
      id: 'courses',
      label: 'Course Catalog',
      icon: BookOpen,
      description: 'Syllabus, Credits & Departments',
      roles: ['Super Admin', 'Admin', 'Admission Officer']
    },
    {
      id: 'documents',
      label: 'Student Documents',
      icon: FileText,
      description: 'Certificates & Document Vault',
      roles: ['Super Admin', 'Admin', 'Admission Officer']
    },
    {
      id: 'idcards',
      label: 'Digital ID Cards',
      icon: CreditCard,
      description: 'Issue & QR Verification',
      roles: ['Super Admin', 'Admin', 'Admission Officer']
    },
    {
      id: 'promotion',
      label: 'Semester Promotion',
      icon: TrendingUp,
      description: 'Grading & Elevation',
      roles: ['Super Admin', 'Admin', 'Admission Officer']
    },
    {
      id: 'alumni',
      label: 'Alumni Network',
      icon: GraduationCap,
      badge: 'Global',
      description: 'Placements & Directory',
      roles: ['Super Admin', 'Admin', 'Admission Officer']
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: FileText,
      description: 'PDF Export & Charts',
      roles: ['Super Admin', 'Admin', 'Admission Officer']
    },
    {
      id: 'notifications',
      label: 'Alerts & Dispatch',
      icon: Bell,
      badge: unreadCount > 0 ? `${unreadCount}` : undefined,
      description: 'Broadcasts & Logs',
      roles: ['Super Admin', 'Admin', 'Admission Officer']
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      description: 'RBAC, Users & Audit',
      roles: ['Super Admin', 'Admin']
    }
  ];

  // Filter items based on role
  const visibleNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  const sidebarContent = (
    <div className="flex flex-col h-full font-sans select-none bg-white text-slate-800">
      {/* Brand Header */}
      <div className={`p-4 border-b border-slate-200 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-sm shrink-0">
            S
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight serif-font flex items-center gap-1.5">
                ScholarCore
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold">
                  SIMS
                </span>
              </h2>
              <p className="text-[10px] text-slate-500 truncate max-w-[130px]">University Portal</p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 text-blue-600" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1 text-slate-500 hover:text-slate-900"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 custom-scrollbar">
        {visibleNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectModule(item.id);
                onCloseMobile();
              }}
              title={isCollapsed ? `${item.label} - ${item.description}` : undefined}
              className={`w-full text-left transition-all rounded-xl flex items-center gap-3 p-2.5 relative group ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <div className={`p-1.5 rounded-lg transition-all shrink-0 ${
                isActive ? 'bg-blue-600 text-white font-bold' : 'text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50'
              }`}>
                <Icon className="w-4 h-4" />
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs truncate font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        item.id === 'notifications' && unreadCount > 0
                          ? 'bg-rose-500 text-white font-bold animate-pulse'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate group-hover:text-slate-600">{item.description}</p>
                </div>
              )}

              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full shadow-xs" />
              )}
            </button>
          );
        })}
      </div>

      {/* Role Footer */}
      {!isCollapsed && (
        <div className="p-3 m-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <div>
              <p className="text-[10px] font-semibold text-slate-800">{userRole}</p>
              <p className="text-[9px] text-slate-500">Access Granted</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`md:hidden fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-xl transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 bg-white border-r border-slate-200 backdrop-blur-md transition-all duration-300 sticky top-0 h-screen z-30 shadow-2xs ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
