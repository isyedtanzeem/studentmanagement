export interface KPICardItem {
  value: number;
  growthRate: string;
  trendText: string;
  isPositive: boolean;
  period: string;
}

export interface DashboardKPICards {
  totalStudents: KPICardItem;
  newAdmissions: KPICardItem;
  activeStudents: KPICardItem;
  departments: KPICardItem;
  courses: KPICardItem;
  faculty: KPICardItem;
  pendingAdmissions: KPICardItem;
}

export interface DashboardStatsResponse {
  kpiCards: DashboardKPICards;
  lastUpdated: string;
}

export interface StudentGrowthPoint {
  label: string;
  total: number;
  active: number;
  newAdmissions: number;
}

export interface DeptStudentsPoint {
  name: string;
  fullName: string;
  students: number;
  faculty: number;
  courses: number;
}

export interface GenderRatioPoint {
  name: string;
  value: number;
  percentage: string;
}

export interface AdmissionTrendPoint {
  month: string;
  applications: number;
  accepted: number;
  pending: number;
  rejected: number;
}

export interface DashboardChartsData {
  studentGrowth: StudentGrowthPoint[];
  departmentWiseStudents: DeptStudentsPoint[];
  genderRatio: GenderRatioPoint[];
  admissionTrends: AdmissionTrendPoint[];
  timeframe: 'year' | 'semester' | 'month';
}

export interface RecentActivity {
  id: string;
  title: string;
  description: string;
  category: 'Admission' | 'Academic' | 'System' | 'Faculty' | 'Fee';
  actorName: string;
  actorRole: string;
  timestamp: string;
  badgeType: 'success' | 'warning' | 'info' | 'danger' | 'gold';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  category: 'Admission' | 'Academic' | 'Finance' | 'System';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export type QuickActionType = 'ADD_ADMISSION' | 'ADD_DEPARTMENT' | 'ADD_COURSE' | 'ISSUE_NOTIFICATION';
