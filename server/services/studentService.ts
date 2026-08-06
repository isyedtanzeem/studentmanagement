import { dbStore, StudentRecord, RecentActivityRecord } from '../config/db';
import { DashboardModel } from '../models/Dashboard';

export interface StudentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
  gender?: string;
  enrollmentYear?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class StudentService {
  constructor() {
    DashboardModel.seedDataIfEmpty();
  }

  public getStudents(params: StudentQueryParams) {
    DashboardModel.seedDataIfEmpty();

    let studentsList = Array.from(dbStore.students.values());

    // Search filter
    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase().trim();
      studentsList = studentsList.filter(
        s =>
          s.fullName.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.phone && s.phone.toLowerCase().includes(q))
      );
    }

    // Department filter
    if (params.department && params.department !== 'ALL') {
      studentsList = studentsList.filter(s => s.department === params.department);
    }

    // Status filter
    if (params.status && params.status !== 'ALL') {
      studentsList = studentsList.filter(s => s.status === params.status);
    }

    // Gender filter
    if (params.gender && params.gender !== 'ALL') {
      studentsList = studentsList.filter(s => s.gender === params.gender);
    }

    // Enrollment Year filter
    if (params.enrollmentYear && !isNaN(Number(params.enrollmentYear))) {
      studentsList = studentsList.filter(s => s.enrollmentYear === Number(params.enrollmentYear));
    }

    // Sorting
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    studentsList.sort((a: any, b: any) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return -1 * sortOrder;
      if (valA > valB) return 1 * sortOrder;
      return 0;
    });

    // Pagination
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const totalItems = studentsList.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedStudents = studentsList.slice(startIndex, startIndex + limit);

    // Summary stats for overview header
    const stats = {
      total: totalItems,
      active: studentsList.filter(s => s.status === 'Active').length,
      inactive: studentsList.filter(s => s.status === 'Inactive').length,
      graduated: studentsList.filter(s => s.status === 'Graduated').length,
      avgGpa: totalItems > 0 ? (studentsList.reduce((acc, s) => acc + (s.gpa || 0), 0) / totalItems).toFixed(2) : '0.00'
    };

    return {
      students: paginatedStudents,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit
      },
      stats
    };
  }

  public getStudentById(id: string): StudentRecord {
    DashboardModel.seedDataIfEmpty();
    const student = dbStore.students.get(id);
    if (!student) {
      throw new Error(`Student with ID ${id} not found.`);
    }
    return student;
  }

  public createStudent(data: Partial<StudentRecord>, user: any): StudentRecord {
    DashboardModel.seedDataIfEmpty();

    // Generate Student ID if not provided
    const year = data.enrollmentYear || new Date().getFullYear();
    const randomNum = Math.floor(100 + Math.random() * 900);
    const studentId = data.studentId || `STU-${year}-${randomNum}`;
    const id = `std-${Date.now()}`;

    const newStudent: StudentRecord = {
      id,
      studentId,
      fullName: data.fullName || 'Unnamed Student',
      email: data.email || `${studentId.toLowerCase()}@scholarcore.edu`,
      phone: data.phone || '',
      department: data.department || 'Computer Science & Engineering',
      gender: data.gender || 'Male',
      status: data.status || 'Active',
      enrollmentYear: Number(data.enrollmentYear) || year,
      gpa: Number(data.gpa) || 3.50,
      createdAt: new Date().toISOString(),
      photoUrl: data.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.fullName || studentId)}`,
      dateOfBirth: data.dateOfBirth || '',
      address: data.address || '',
      guardianName: data.guardianName || '',
      guardianPhone: data.guardianPhone || ''
    };

    dbStore.students.set(id, newStudent);

    // Add activity
    dbStore.activities.unshift({
      id: `act-${Date.now()}`,
      title: 'New Student Profile Registered',
      description: `Student ${newStudent.fullName} (${newStudent.studentId}) registered under ${newStudent.department}.`,
      category: 'Academic',
      actorName: user.fullName,
      actorRole: user.role,
      timestamp: new Date().toISOString(),
      badgeType: 'success'
    });

    // Add Audit Log
    dbStore.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'CREATE_STUDENT',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
      details: `Created student record: ${newStudent.fullName} (${newStudent.studentId})`
    });

    return newStudent;
  }

  public updateStudent(id: string, data: Partial<StudentRecord>, user: any): StudentRecord {
    DashboardModel.seedDataIfEmpty();
    const existing = dbStore.students.get(id);
    if (!existing) {
      throw new Error(`Student with ID ${id} not found.`);
    }

    const updatedStudent: StudentRecord = {
      ...existing,
      ...data,
      id: existing.id, // Preserve immutable ID
      studentId: existing.studentId // Preserve immutable Student ID
    };

    dbStore.students.set(id, updatedStudent);

    // Activity log
    dbStore.activities.unshift({
      id: `act-${Date.now()}`,
      title: 'Student Record Updated',
      description: `Profile details updated for ${updatedStudent.fullName} (${updatedStudent.studentId}).`,
      category: 'Academic',
      actorName: user.fullName,
      actorRole: user.role,
      timestamp: new Date().toISOString(),
      badgeType: 'info'
    });

    // Audit log
    dbStore.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'UPDATE_STUDENT',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
      details: `Updated student record ID: ${id}`
    });

    return updatedStudent;
  }

  public deleteStudent(id: string, user: any): boolean {
    DashboardModel.seedDataIfEmpty();
    const existing = dbStore.students.get(id);
    if (!existing) {
      throw new Error(`Student with ID ${id} not found.`);
    }

    dbStore.students.delete(id);

    // Activity log
    dbStore.activities.unshift({
      id: `act-${Date.now()}`,
      title: 'Student Record Removed',
      description: `Student ${existing.fullName} (${existing.studentId}) removed from database.`,
      category: 'Academic',
      actorName: user.fullName,
      actorRole: user.role,
      timestamp: new Date().toISOString(),
      badgeType: 'warning'
    });

    // Audit log
    dbStore.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'DELETE_STUDENT',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
      details: `Deleted student: ${existing.fullName} (${existing.studentId})`
    });

    return true;
  }

  public bulkImportStudents(studentsData: Partial<StudentRecord>[], user: any) {
    DashboardModel.seedDataIfEmpty();
    let importedCount = 0;
    const errors: string[] = [];

    studentsData.forEach((data, index) => {
      try {
        if (!data.fullName || !data.email) {
          errors.push(`Row ${index + 1}: Missing Full Name or Email.`);
          return;
        }

        this.createStudent(data, user);
        importedCount++;
      } catch (err: any) {
        errors.push(`Row ${index + 1}: ${err.message}`);
      }
    });

    return {
      successCount: importedCount,
      failedCount: errors.length,
      errors
    };
  }

  public exportCSV(): string {
    DashboardModel.seedDataIfEmpty();
    const students = Array.from(dbStore.students.values());

    const headers = [
      'Student ID',
      'Full Name',
      'Email',
      'Phone',
      'Department',
      'Gender',
      'Status',
      'Enrollment Year',
      'GPA',
      'Date of Birth',
      'Guardian Name'
    ];

    const rows = students.map(s => [
      `"${s.studentId}"`,
      `"${s.fullName}"`,
      `"${s.email}"`,
      `"${s.phone || ''}"`,
      `"${s.department}"`,
      `"${s.gender}"`,
      `"${s.status}"`,
      s.enrollmentYear,
      s.gpa,
      `"${s.dateOfBirth || ''}"`,
      `"${s.guardianName || ''}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  public getStudentPortalData(user: any) {
    DashboardModel.seedDataIfEmpty();
    const studentsList = Array.from(dbStore.students.values());

    // Match student by email or employeeId/studentId, or default to std-1
    let student = studentsList.find(
      s => s.email.toLowerCase() === user.email?.toLowerCase() || s.studentId === user.studentId || s.studentId === user.employeeId
    );

    if (!student && studentsList.length > 0) {
      student = studentsList[0]; // Aarav Sharma fallback
    }

    // Related courses
    const allCourses = Array.from(dbStore.courses.values());
    const enrolledCourses = allCourses.length > 0
      ? allCourses.slice(0, 5)
      : [
          {
            id: 'crs-101',
            code: 'CS101',
            title: 'Data Structures & Algorithms in C++',
            instructorName: 'Prof. Ramesh Kulkarni',
            credits: 4,
            department: 'Computer Science & Engineering',
            status: 'Active'
          },
          {
            id: 'crs-102',
            code: 'CS204',
            title: 'Machine Learning & Artificial Intelligence',
            instructorName: 'Dr. Vikramaditya Sen',
            credits: 4,
            department: 'Computer Science & Engineering',
            status: 'Active'
          }
        ];

    // Subject-wise attendance breakdown
    const subjectAttendance = [
      { code: 'CS101', title: 'Data Structures & Algorithms', totalClasses: 25, attended: 23, percentage: 92, status: 'Good' },
      { code: 'CS204', title: 'Machine Learning & AI', totalClasses: 21, attended: 18, percentage: 86, status: 'Good' },
      { code: 'CS202', title: 'Database Management Systems', totalClasses: 30, attended: 27, percentage: 90, status: 'Good' },
      { code: 'MA201', title: 'Discrete Mathematics & Logic', totalClasses: 20, attended: 17, percentage: 85, status: 'Good' },
      { code: 'EC205', title: 'Digital Electronics & Circuits', totalClasses: 25, attended: 22, percentage: 88, status: 'Good' },
      { code: 'CS209', title: 'Full Stack Web Engineering Lab', totalClasses: 20, attended: 19, percentage: 95, status: 'Excellent' }
    ];

    // SGPA Trend
    const sgpaHistory = [
      { semester: 'Sem 1', sgpa: 8.70, year: '2024' },
      { semester: 'Sem 2', sgpa: 8.90, year: '2025' },
      { semester: 'Sem 3 (Current)', sgpa: student?.gpa || 8.95, year: '2026' }
    ];

    // Timetable
    const weeklySchedule = [
      { day: 'Monday', time: '09:00 AM - 10:30 AM', subject: 'CS101: Data Structures', room: 'Turing Hall A', instructor: 'Prof. Ramesh Kulkarni' },
      { day: 'Monday', time: '11:00 AM - 12:30 PM', subject: 'CS204: Machine Learning', room: 'AI Lab 3', instructor: 'Dr. Vikramaditya Sen' },
      { day: 'Tuesday', time: '10:00 AM - 11:30 AM', subject: 'CS202: DBMS', room: 'Bhabha Block B', instructor: 'Dr. Sunita Deshmukh' },
      { day: 'Wednesday', time: '09:00 AM - 12:00 PM', subject: 'CS209: Web Eng Lab', room: 'Software Lab 2', instructor: 'Prof. Ramesh Kulkarni' },
      { day: 'Thursday', time: '02:00 PM - 03:30 PM', subject: 'MA201: Discrete Math', room: 'Lecture Theatre 101', instructor: 'Dr. S. K. Gupta' },
      { day: 'Friday', time: '11:00 AM - 12:30 PM', subject: 'EC205: Digital Circuits', room: 'Hardware Lab', instructor: 'Dr. Venkatesh Iyer' }
    ];

    // Documents Vault
    const documents = [
      { id: 'doc-101', name: 'Class X Secondary Marksheet', category: 'Academic Proof', status: 'Verified', date: '2024-07-15' },
      { id: 'doc-102', name: 'Class XII Senior Secondary Certificate', category: 'Academic Proof', status: 'Verified', date: '2024-07-15' },
      { id: 'doc-103', name: 'Semester 3 Fee Payment Receipt (#REC-2026-9021)', category: 'Finance', status: 'Verified', date: '2026-01-10' },
      { id: 'doc-104', name: 'Official Bonafide Student Certificate', category: 'General', status: 'Approved', date: '2026-02-01' }
    ];

    // Notices
    const notices = [
      { id: 'not-1', title: 'Mid-Term Examination Schedule Released (Spring 2026)', date: 'Today', category: 'Exam', priority: 'High', description: 'Mid-term exams commence from March 10, 2026. Hall tickets available for download in student portal.' },
      { id: 'not-2', title: 'ScholarCore Annual Hackathon 2026 Registration Open', date: 'Yesterday', category: 'Events', priority: 'Medium', description: 'Register your 4-member teams before Feb 25. Cash prizes up to ₹2,50,000.' },
      { id: 'not-3', title: 'Library Book Return Reminder', date: '3 days ago', category: 'Library', priority: 'Low', description: 'Please return "Introduction to Algorithms (4th Ed)" by Friday to avoid overdue fines.' }
    ];

    return {
      student,
      enrolledCourses,
      subjectAttendance,
      sgpaHistory,
      weeklySchedule,
      documents,
      notices
    };
  }
}
