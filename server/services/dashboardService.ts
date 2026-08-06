import { dbStore, AdmissionRecord, StudentRecord, DepartmentRecord, CourseRecord, NotificationRecord, RecentActivityRecord } from '../config/db';
import { DashboardModel } from '../models/Dashboard';

export class DashboardService {
  constructor() {
    DashboardModel.seedDataIfEmpty();
  }

  public getStats() {
    DashboardModel.seedDataIfEmpty();

    const pendingAdmissionsCount = Array.from(dbStore.admissions.values()).filter(a => a.status === 'Pending').length + 42;
    const approvedAdmissionsCount = Array.from(dbStore.admissions.values()).filter(a => a.status === 'Approved').length + 298;

    return {
      kpiCards: {
        totalStudents: {
          value: 2845 + dbStore.students.size - 5,
          growthRate: '+12.4%',
          trendText: 'vs. last academic year',
          isPositive: true,
          period: 'Annual'
        },
        newAdmissions: {
          value: approvedAdmissionsCount + 42,
          growthRate: '+18.2%',
          trendText: 'Fall 2026 intake',
          isPositive: true,
          period: 'Current Term'
        },
        activeStudents: {
          value: 2680 + dbStore.students.size - 5,
          growthRate: '+9.1%',
          trendText: '94.2% active attendance',
          isPositive: true,
          period: 'Real-time'
        },
        departments: {
          value: 12 + dbStore.departments.size - 5,
          growthRate: '+2 new',
          trendText: 'Biotech & AI Research added',
          isPositive: true,
          period: 'Active'
        },
        courses: {
          value: 84 + dbStore.courses.size - 6,
          growthRate: '+6 added',
          trendText: 'Accredited STEM curriculum',
          isPositive: true,
          period: 'Active'
        },
        faculty: {
          value: 156 + dbStore.faculty.size - 5,
          growthRate: '+8 hired',
          trendText: '1:18 Faculty-to-Student ratio',
          isPositive: true,
          period: 'Active'
        },
        pendingAdmissions: {
          value: pendingAdmissionsCount,
          growthRate: '-14% turnaround',
          trendText: 'Awaiting Board Review',
          isPositive: false, // warning indicator color
          period: 'Action Required'
        }
      },
      lastUpdated: new Date().toISOString()
    };
  }

  public getChartData(timeframe: 'year' | 'semester' | 'month' = 'year') {
    DashboardModel.seedDataIfEmpty();

    // Student Growth Data
    const studentGrowth = [
      { label: '2022', total: 1850, active: 1720, newAdmissions: 280 },
      { label: '2023', total: 2120, active: 1980, newAdmissions: 310 },
      { label: '2024', total: 2450, active: 2310, newAdmissions: 360 },
      { label: '2025', total: 2680, active: 2520, newAdmissions: 320 },
      { label: '2026', total: 2845, active: 2680, newAdmissions: 340 }
    ];

    // Department Wise Students Data
    const depts = Array.from(dbStore.departments.values());
    const departmentWiseStudents = depts.map(d => ({
      name: d.code,
      fullName: d.name,
      students: d.studentCount,
      faculty: d.facultyCount,
      courses: d.coursesCount
    }));

    // Gender Ratio
    const genderRatio = [
      { name: 'Male', value: 1480, percentage: '52%' },
      { name: 'Female', value: 1310, percentage: '46%' },
      { name: 'Other', value: 55, percentage: '2%' }
    ];

    // Admission Trends (Monthly breakdown)
    const admissionTrends = [
      { month: 'Jan', applications: 120, accepted: 85, pending: 25, rejected: 10 },
      { month: 'Feb', applications: 180, accepted: 130, pending: 35, rejected: 15 },
      { month: 'Mar', applications: 240, accepted: 175, pending: 45, rejected: 20 },
      { month: 'Apr', applications: 310, accepted: 220, pending: 65, rejected: 25 },
      { month: 'May', applications: 450, accepted: 320, pending: 95, rejected: 35 },
      { month: 'Jun', applications: 520, accepted: 380, pending: 105, rejected: 35 },
      { month: 'Jul', applications: 380, accepted: 290, pending: 60, rejected: 30 },
      { month: 'Aug', applications: 340, accepted: 280, pending: 48, rejected: 12 }
    ];

    return {
      studentGrowth,
      departmentWiseStudents,
      genderRatio,
      admissionTrends,
      timeframe
    };
  }

  public getRecentActivities(limit: number = 10) {
    DashboardModel.seedDataIfEmpty();
    return dbStore.activities.slice(0, limit);
  }

  public getNotifications() {
    DashboardModel.seedDataIfEmpty();
    const unreadCount = dbStore.notifications.filter(n => !n.read).length;
    return {
      notifications: dbStore.notifications,
      unreadCount
    };
  }

  public markNotificationRead(id: string) {
    const notif = dbStore.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
    }
    return this.getNotifications();
  }

  public markAllNotificationsRead() {
    dbStore.notifications.forEach(n => {
      n.read = true;
    });
    return this.getNotifications();
  }

  public quickAddAdmission(data: { applicantName: string; email: string; department: string; gender: 'Male' | 'Female' | 'Other'; academicTerm: string }, user: any) {
    const newId = `adm-${Date.now()}`;
    const newAdmission: AdmissionRecord = {
      id: newId,
      applicationNumber: `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      applicantName: data.applicantName,
      email: data.email,
      department: data.department,
      appliedDate: new Date().toISOString(),
      status: 'Pending',
      gender: data.gender || 'Female',
      academicTerm: data.academicTerm || 'Fall 2026'
    };

    dbStore.admissions.set(newId, newAdmission);

    // Record activity
    const activity: RecentActivityRecord = {
      id: `act-${Date.now()}`,
      title: 'New Admission Application',
      description: `${data.applicantName} applied for ${data.department}.`,
      category: 'Admission',
      actorName: user.fullName,
      actorRole: user.role,
      timestamp: new Date().toISOString(),
      badgeType: 'gold'
    };
    dbStore.activities.unshift(activity);

    // Add Audit Log
    dbStore.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'QUICK_ADD_ADMISSION',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
      details: `Created admission record for ${data.applicantName} (${data.department})`
    });

    return newAdmission;
  }

  public quickAddDepartment(data: { code: string; name: string; headOfDepartment: string }, user: any) {
    const newId = `dept-${Date.now()}`;
    const newDept: DepartmentRecord = {
      id: newId,
      code: data.code.toUpperCase(),
      name: data.name,
      headOfDepartment: data.headOfDepartment,
      studentCount: 0,
      facultyCount: 1,
      coursesCount: 0
    };

    dbStore.departments.set(newId, newDept);

    dbStore.activities.unshift({
      id: `act-${Date.now()}`,
      title: 'New Department Created',
      description: `Department of ${data.name} (${data.code}) initialized under ${data.headOfDepartment}.`,
      category: 'System',
      actorName: user.fullName,
      actorRole: user.role,
      timestamp: new Date().toISOString(),
      badgeType: 'success'
    });

    dbStore.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'QUICK_ADD_DEPARTMENT',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
      details: `Created department ${data.name} (${data.code})`
    });

    return newDept;
  }

  public quickAddCourse(data: { code: string; title: string; department: string; credits: number }, user: any) {
    const newId = `crs-${Date.now()}`;
    const newCourse: CourseRecord = {
      id: newId,
      code: data.code.toUpperCase(),
      title: data.title,
      department: data.department,
      credits: Number(data.credits) || 3,
      enrolledStudents: 0
    };

    dbStore.courses.set(newId, newCourse);

    dbStore.activities.unshift({
      id: `act-${Date.now()}`,
      title: 'New Course Offered',
      description: `Course ${data.code}: ${data.title} added to ${data.department}.`,
      category: 'Academic',
      actorName: user.fullName,
      actorRole: user.role,
      timestamp: new Date().toISOString(),
      badgeType: 'info'
    });

    return newCourse;
  }

  public quickIssueNotification(data: { title: string; message: string; priority: 'high' | 'medium' | 'low'; category: 'Admission' | 'Academic' | 'Finance' | 'System' }, user: any) {
    const newId = `notif-${Date.now()}`;
    const newNotif: NotificationRecord = {
      id: newId,
      title: data.title,
      message: data.message,
      priority: data.priority || 'medium',
      category: data.category || 'System',
      timestamp: new Date().toISOString(),
      read: false
    };

    dbStore.notifications.unshift(newNotif);

    dbStore.activities.unshift({
      id: `act-${Date.now()}`,
      title: 'System Announcement Issued',
      description: `Broadcast alert: ${data.title}`,
      category: 'System',
      actorName: user.fullName,
      actorRole: user.role,
      timestamp: new Date().toISOString(),
      badgeType: 'warning'
    });

    return newNotif;
  }
}
