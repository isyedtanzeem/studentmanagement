import { dbStore, AdmissionRecord, StudentRecord, DepartmentRecord, CourseRecord, NotificationRecord, RecentActivityRecord } from '../config/db';
import { getMongoCollection } from '../config/mongo';

export class DashboardService {
  public async getStats() {
    const [studentsList, admissionsList, deptsList, coursesList, facultyList] = await Promise.all([
      this.readCollection<StudentRecord>('students'),
      this.readCollection<AdmissionRecord>('admissions'),
      this.readCollection<DepartmentRecord>('departments'),
      this.readCollection<CourseRecord>('courses'),
      this.readCollection('faculty')
    ]);

    const totalStudentsCount = studentsList.length;
    const activeStudentsCount = studentsList.filter(s => s.status === 'Active').length;
    const paidFeesCount = studentsList.filter(s => s.feeStatus === 'Paid').length;
    
    // Average attendance calculation across active students
    const avgAttendance = studentsList.length > 0
      ? (studentsList.reduce((acc, s) => acc + (s.attendancePercentage || 0), 0) / studentsList.length).toFixed(1)
      : '0.0';

    const pendingAdmissionsCount = admissionsList.filter(a => a.status === 'Pending').length;
    const approvedAdmissionsCount = admissionsList.filter(a => a.status === 'Approved').length;
    const totalAdmissionsCount = admissionsList.length;

    const facultyToStudentRatio = facultyList.length > 0
      ? `1:${Math.round(totalStudentsCount / facultyList.length)}`
      : '1:0';

    const activeDeptsCount = deptsList.filter(d => d.status === 'Active').length;
    const totalCredits = coursesList.reduce((acc, c) => acc + (c.credits || 0), 0);

    return {
      kpiCards: {
        totalStudents: {
          value: totalStudentsCount,
          growthRate: `${((activeStudentsCount / (totalStudentsCount || 1)) * 100).toFixed(0)}% Active`,
          trendText: `${paidFeesCount} Fees Paid Clear`,
          isPositive: true,
          period: 'Directory Total'
        },
        newAdmissions: {
          value: approvedAdmissionsCount,
          growthRate: `${totalAdmissionsCount} Total Apps`,
          trendText: 'Approved & Enrolled Students',
          isPositive: true,
          period: 'Current Intake'
        },
        activeStudents: {
          value: activeStudentsCount,
          growthRate: `${avgAttendance}% Avg Att.`,
          trendText: 'Regular Classroom Attendance',
          isPositive: true,
          period: 'Live Academic'
        },
        departments: {
          value: deptsList.length,
          growthRate: `${activeDeptsCount} Operational`,
          trendText: 'Academic Faculties & Wings',
          isPositive: true,
          period: 'Active'
        },
        courses: {
          value: coursesList.length,
          growthRate: `${totalCredits} Total Credits`,
          trendText: 'Accredited Curriculum',
          isPositive: true,
          period: 'Active Catalog'
        },
        faculty: {
          value: facultyList.length,
          growthRate: `${facultyToStudentRatio} Staff Ratio`,
          trendText: 'Appointed Teaching Faculty',
          isPositive: true,
          period: 'Academic Staff'
        },
        pendingAdmissions: {
          value: pendingAdmissionsCount,
          growthRate: pendingAdmissionsCount > 0 ? `${pendingAdmissionsCount} Pending` : 'All Clear',
          trendText: 'Awaiting Board Approval',
          isPositive: pendingAdmissionsCount === 0,
          period: 'Action Required'
        }
      },
      lastUpdated: new Date().toISOString()
    };
  }

  public async getChartData(timeframe: 'year' | 'semester' | 'month' = 'year') {
    const [students, admissions, depts, faculty, courses] = await Promise.all([
      this.readCollection<StudentRecord>('students'),
      this.readCollection<AdmissionRecord>('admissions'),
      this.readCollection<DepartmentRecord>('departments'),
      this.readCollection('faculty'),
      this.readCollection<CourseRecord>('courses')
    ]);

    const currentYear = new Date().getFullYear();
    const years = timeframe === 'year' ? [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear] : [currentYear];
    const studentGrowth = years.map(year => {
      const yearStudents = students.filter(student => student.enrollmentYear === year);
      const yearAdmissions = admissions.filter(admission => new Date(admission.appliedDate).getFullYear() === year);
      return {
        label: String(year),
        total: students.filter(student => student.enrollmentYear <= year).length,
        active: students.filter(student => student.enrollmentYear <= year && student.status === 'Active').length,
        newAdmissions: yearAdmissions.length || yearStudents.length
      };
    });

    const departmentWiseStudents = depts.map(d => ({
      name: d.code,
      fullName: d.name,
      students: students.filter(student => student.department === d.name).length,
      faculty: faculty.filter((member: any) => member.department === d.name).length,
      courses: courses.filter(course => course.department === d.name).length
    }));

    const genderCounts = students.reduce<Record<string, number>>((counts, student) => {
      counts[student.gender] = (counts[student.gender] || 0) + 1;
      return counts;
    }, {});
    const genderRatio = Object.entries(genderCounts).map(([name, value]) => ({
      name,
      value,
      percentage: students.length ? `${Math.round((value / students.length) * 100)}%` : '0%'
    }));

    const admissionTrends = Array.from({ length: 12 }, (_, monthIndex) => {
      const monthlyAdmissions = admissions.filter(admission => {
        const date = new Date(admission.appliedDate);
        return date.getFullYear() === currentYear && date.getMonth() === monthIndex;
      });
      return {
        month: new Date(currentYear, monthIndex, 1).toLocaleString('en-US', { month: 'short' }),
        applications: monthlyAdmissions.length,
        accepted: monthlyAdmissions.filter(admission => admission.status === 'Approved').length,
        pending: monthlyAdmissions.filter(admission => admission.status === 'Pending').length,
        rejected: monthlyAdmissions.filter(admission => admission.status === 'Rejected').length
      };
    });

    return {
      studentGrowth,
      departmentWiseStudents,
      genderRatio,
      admissionTrends,
      timeframe
    };
  }

  public async getRecentActivities(limit: number = 10) {
    const activities = await this.readCollection<RecentActivityRecord>('activities');
    return activities.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
  }

  public async getNotifications() {
    const notifications = await this.readCollection<NotificationRecord>('notifications');
    const unreadCount = notifications.filter(n => !n.read).length;
    return {
      notifications,
      unreadCount
    };
  }

  public async markNotificationRead(id: string) {
    await (await getMongoCollection<NotificationRecord>('notifications')).updateOne({ id }, { $set: { read: true } });
    return this.getNotifications();
  }

  public async markAllNotificationsRead() {
    await (await getMongoCollection<NotificationRecord>('notifications')).updateMany({ read: false }, { $set: { read: true } });
    return this.getNotifications();
  }

  private async readCollection<T extends object>(name: string): Promise<T[]> {
    const collection = await getMongoCollection<T>(name);
    return (await collection.find({}).toArray()) as T[];
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
