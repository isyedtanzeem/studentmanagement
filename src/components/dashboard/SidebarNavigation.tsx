import React from 'react';
import {
  Sparkles,
  GraduationCap,
  Users,
  UserCheck,
  Building2,
  BookOpen,
  CreditCard,
  TrendingUp,
  FileText,
  Bell,
  Settings,
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
  flatColor: string; // Flat 2.0 vibrant color hex
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
      description: 'KPIs & Trajectory',
      flatColor: '#00B5AD', // Vibrant Flat Teal
      roles: ['Super Admin', 'Admin', 'Admission Officer']
    },
    {
      id: 'admissions',
      label: 'Admissions & Intake',
      icon: GraduationCap,
      badge: 'Active',
      description: 'Applications & Verification',
      flatColor: '#2ECC71', // Vibrant Emerald Green
      roles: ['Super Admin', 'Admin', 'Admission Officer']
    },
    {
      id: 'students',
      label: 'Student Directory',
      icon: Users,
      description: 'Profiles & Attendance',
      flatColor: '#3498DB', // Vibrant Flat Blue
      roles: ['Super Admin', 'Admin', 'Admission Officer']
    },
    {
      id: 'faculty',
      label: 'Faculty & HODs',
      icon: UserCheck,
      description: 'Faculty Registry & Staff',
      flatColor: '#9B59B6', // Vibrant Amethyst Purple
      roles: ['Super Admin', 'Admin']
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Building2,
      description: 'Academic Wings & Capacity',
      flatColor: '#E67E22', // Vibrant Flat Orange
      roles: ['Super Admin', 'Admin']
    },
    {
      id: 'courses',
      label: 'Course Catalog',
      icon: BookOpen,
      description: 'Syllabus & Degree Programs',
      flatColor: '#E74C3C', // Vibrant Flat Red
      roles: ['Super Admin', 'Admin']
    },
    {
      id: 'idcards',
      label: 'Digital ID Cards',
      icon: CreditCard,
      description: 'Issue & QR Verification',
      flatColor: '#00BCD4', // Vibrant Flat Cyan
      roles: ['Super Admin', 'Admin']
    },
    {
      id: 'promotion',
      label: 'Semester Promotion',
      icon: TrendingUp,
      description: 'Grading & Elevation',
      flatColor: '#27AE60', // Vibrant Flat Lime
      roles: ['Super Admin', 'Admin']
    },
    {
      id: 'alumni',
      label: 'Alumni Network',
      icon: GraduationCap,
      badge: 'Global',
      description: 'Placements & Directory',
      flatColor: '#E91E63', // Vibrant Flat Pink
      roles: ['Super Admin', 'Admin']
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: FileText,
      description: 'Data Export & Summaries',
      flatColor: '#16A085', // Vibrant Deep Teal
      roles: ['Super Admin', 'Admin']
    },
    {
      id: 'notifications',
      label: 'Alerts & Dispatch',
      icon: Bell,
      badge: unreadCount > 0 ? `${unreadCount}` : undefined,
      description: 'Broadcasts & Logs',
      flatColor: '#F39C12', // Vibrant Flat Amber
      roles: ['Super Admin', 'Admin', 'Admission Officer']
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      description: 'RBAC, Users & Audit',
      flatColor: '#607D8B', // Vibrant Flat Blue Gray
      roles: ['Super Admin', 'Admin']
    }
  ];

  // Filter items based on role
  const visibleNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  const sidebarContent = (
    <div className="flex flex-col h-full font-roboto select-none bg-[#222D32] text-[#B8C7CE]">
      {/* Brand Header */}
      <div
        className={`h-14 px-4 bg-[#1A2226] border-b border-[#1E282C] flex items-center ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#00B5AD] rounded-[4px] flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0">
            S
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 truncate">
                ScholarCore
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#00B5AD]/20 text-[#00B5AD] border border-[#00B5AD]/30 rounded-[4px] font-semibold">
                  SIMS
                </span>
              </h2>
              <p className="text-[10px] text-[#8AA4AF] truncate">Flat 2.0 Material Portal</p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 text-[#8AA4AF] hover:text-white rounded-[4px] hover:bg-[#222D32] transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 text-[#00B5AD]" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1 text-[#8AA4AF] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Section Header */}
      {!isCollapsed && (
        <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-[#4B646F] uppercase tracking-wider">
          Main Navigation
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-1 space-y-0.5 custom-scrollbar">
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
              className={`w-full text-left transition-colors flex items-center gap-3 py-2.5 px-3 relative group ${
                isActive
                  ? 'bg-[#1A2226] text-white border-l-4 border-[#00B5AD] font-medium'
                  : 'text-[#B8C7CE] hover:text-white hover:bg-[#1E282C] border-l-4 border-transparent'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              {/* Flat Colorful Icon Box */}
              <div
                className="w-7 h-7 rounded-[4px] flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105"
                style={{ backgroundColor: item.flatColor }}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs truncate font-medium">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-[4px] font-mono font-bold ${
                          item.id === 'notifications' && unreadCount > 0
                            ? 'bg-[#E74C3C] text-white animate-pulse'
                            : 'bg-[#1E282C] text-[#8AA4AF] border border-[#2C3B41]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#6E8294] truncate group-hover:text-[#8AA4AF]">
                    {item.description}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Role Footer */}
      {!isCollapsed && (
        <div className="p-3 m-2 rounded-[4px] bg-[#1A2226] border border-[#2C3B41] flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[4px] bg-[#00B5AD]/20 border border-[#00B5AD]/40 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-[#00B5AD]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white">{userRole}</p>
              <p className="text-[9px] text-[#8AA4AF]">Authenticated Session</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#2ECC71]" title="System Online" />
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
          className="md:hidden fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`md:hidden fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#222D32] border-r border-[#1E282C] shadow-2xl transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar in Deep Charcoal Slate Gray */}
      <aside
        className={`hidden md:block shrink-0 bg-[#222D32] border-r border-[#1E282C] transition-all duration-200 sticky top-0 h-screen z-30 shadow-md ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
