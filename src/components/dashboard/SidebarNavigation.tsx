import React from 'react';
import {
  Sparkles,
  GraduationCap,
  Users,
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
  | 'departments'
  | 'courses'
  | 'guardians'
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
      label: userRole === 'Student' ? 'My Student Portal' : 'Executive Overview',
      icon: Sparkles,
      description: userRole === 'Student' ? 'Personal Academic Hub & Attendance' : 'KPIs, Enrolment Trends & Health',
      roles: ['Super Admin', 'Admin', 'Admission Officer', 'Faculty', 'Student']
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
      description: 'Profiles & Attendance',
      roles: ['Super Admin', 'Admin', 'Admission Officer', 'Faculty']
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Building2,
      description: 'Faculties & HODs',
      roles: ['Super Admin', 'Admin', 'Faculty']
    },
    {
      id: 'courses',
      label: userRole === 'Student' ? 'Course Catalog' : 'Course Catalog',
      icon: BookOpen,
      description: userRole === 'Student' ? 'Enrolled Subjects & Credits' : 'Syllabus & Credits',
      roles: ['Super Admin', 'Admin', 'Faculty', 'Student']
    },
    {
      id: 'guardians',
      label: 'Guardians & Contacts',
      icon: ShieldCheck,
      description: 'Emergency Info',
      roles: ['Super Admin', 'Admin', 'Admission Officer']
    },
    {
      id: 'documents',
      label: userRole === 'Student' ? 'My Documents Vault' : 'Student Documents',
      icon: FileText,
      description: userRole === 'Student' ? 'Verified Marks & Certificates' : 'Certificates & Vault',
      roles: ['Super Admin', 'Admin', 'Admission Officer', 'Faculty', 'Student']
    },
    {
      id: 'idcards',
      label: userRole === 'Student' ? 'My Digital ID Card' : 'Digital ID Cards',
      icon: CreditCard,
      description: userRole === 'Student' ? 'Official QR Verified Student ID' : 'Issue & QR Scan',
      roles: ['Super Admin', 'Admin', 'Admission Officer', 'Faculty', 'Student']
    },
    {
      id: 'promotion',
      label: 'Semester Promotion',
      icon: TrendingUp,
      description: 'Grading & Elevation',
      roles: ['Super Admin', 'Admin', 'Faculty']
    },
    {
      id: 'alumni',
      label: 'Alumni Network',
      icon: GraduationCap,
      badge: 'Global',
      description: 'Placements & Reunion',
      roles: ['Super Admin', 'Admin', 'Faculty', 'Student']
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: FileText,
      description: 'PDF Export & Charts',
      roles: ['Super Admin', 'Admin', 'Admission Officer', 'Faculty']
    },
    {
      id: 'notifications',
      label: userRole === 'Student' ? 'My Notices & Alerts' : 'Alerts & Dispatch',
      icon: Bell,
      badge: unreadCount > 0 ? `${unreadCount}` : undefined,
      description: userRole === 'Student' ? 'Academic Notices & Circulars' : 'Broadcasts & Logs',
      roles: ['Super Admin', 'Admin', 'Admission Officer', 'Faculty', 'Student']
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
    <div className="flex flex-col h-full font-sans select-none">
      {/* Brand Header */}
      <div className={`p-4 border-b border-white/10 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center font-bold text-slate-950 text-lg shadow-md shadow-amber-500/20 shrink-0">
            S
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight serif-font flex items-center gap-1.5">
                ScholarCore
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                  SIMS
                </span>
              </h2>
              <p className="text-[10px] text-zinc-400 truncate max-w-[130px]">University Portal</p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 text-amber-400" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1 text-zinc-400 hover:text-white"
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
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 font-semibold border border-amber-500/30 shadow-lg shadow-amber-500/10'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <div className={`p-1.5 rounded-lg transition-all shrink-0 ${
                isActive ? 'bg-amber-500 text-slate-950 font-bold' : 'text-zinc-400 group-hover:text-amber-400 group-hover:bg-amber-500/10'
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
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 truncate group-hover:text-zinc-400">{item.description}</p>
                </div>
              )}

              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-400 rounded-r-full shadow-[0_0_8px_#f59e0b]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Role Footer */}
      {!isCollapsed && (
        <div className="p-3 m-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <div>
              <p className="text-[10px] font-semibold text-zinc-300">{userRole}</p>
              <p className="text-[9px] text-zinc-500">Access Granted</p>
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
          className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`md:hidden fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0a0a10] border-r border-white/10 shadow-2xl transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 bg-[#0a0a10]/95 border-r border-white/10 backdrop-blur-md transition-all duration-300 sticky top-0 h-screen z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
