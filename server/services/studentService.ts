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
    const userEmail = (user.email || '').toLowerCase().trim();

    // 1. Strict student lookup by email or studentId/employeeId
    let student = studentsList.find(
      s => s.email.toLowerCase().trim() === userEmail ||
           (user.studentId && s.studentId === user.studentId) ||
           (user.employeeId && s.studentId === user.employeeId)
    );

    // 2. Check if an approved admission application exists for this user email
    if (!student && userEmail) {
      const admissionsList = Array.from(dbStore.admissions.values());
      const approvedApp = admissionsList.find(
        a => a.email.toLowerCase().trim() === userEmail && a.status === 'Approved'
      );
      if (approvedApp) {
        const rollNo = approvedApp.generatedStudentId || `2026${(approvedApp.department || 'GEN').substring(0, 3).toUpperCase()}1001`;
        student = {
          id: approvedApp.enrolledStudentId || `std-${Date.now()}`,
          studentId: rollNo,
          fullName: approvedApp.applicantName,
          email: approvedApp.email,
          phone: approvedApp.phone || '+91 98765 00000',
          department: approvedApp.department || 'Computer Science & Engineering',
          gender: approvedApp.gender || 'Male',
          status: 'Active',
          enrollmentYear: 2026,
          currentSemester: 1,
          currentYear: 1,
          academicBatch: '2026-2030',
          attendancePercentage: 92.0,
          gpa: 8.80,
          createdAt: new Date().toISOString(),
          photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          dateOfBirth: approvedApp.dateOfBirth || '2005-01-01',
          address: approvedApp.address || `${approvedApp.state || 'India'} Address`,
          guardianName: approvedApp.fatherName || approvedApp.motherName || 'Parent / Guardian',
          guardianPhone: approvedApp.phone || '+91 98765 00000'
        };
        dbStore.students.set(student.id, student);
      }
    }

    // 3. Fallback for demo student user account
    if (!student) {
      if (userEmail === 'student@scholarcore.edu.in' || user.role === 'Student') {
        student = studentsList[0] || {
          id: 'std-1',
          studentId: '2024CSE1001',
          fullName: user.fullName || 'Aarav Sharma',
          email: user.email || 'student@scholarcore.edu.in',
          phone: '+91 98765 43210',
          department: user.department || 'Computer Science & Engineering',
          gender: 'Male',
          status: 'Active',
          enrollmentYear: 2024,
          currentSemester: 3,
          currentYear: 2,
          academicBatch: '2024-2028',
          attendancePercentage: 88.5,
          gpa: 8.95,
          createdAt: '2024-07-15T09:00:00Z',
          photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
          dateOfBirth: '2004-03-14',
          address: 'B-104, Vasant Kunj, New Delhi, Delhi 110070',
          guardianName: 'Rajesh Sharma',
          guardianPhone: '+91 98112 34567'
        };
      } else {
        student = studentsList[0];
      }
    }

    const dept = student.department || 'Computer Science & Engineering';

    // Department-Specific Course Catalog (Strict Data Isolation)
    const deptCoursesMap: Record<string, any[]> = {
      'Computer Science & Engineering': [
        { id: 'crs-cs-101', code: 'CS101', title: 'Data Structures & Algorithms in C++', instructorName: 'Prof. Ramesh Kulkarni', credits: 4, department: 'Computer Science & Engineering', status: 'Active' },
        { id: 'crs-cs-102', code: 'CS204', title: 'Machine Learning & Artificial Intelligence', instructorName: 'Dr. Vikramaditya Sen', credits: 4, department: 'Computer Science & Engineering', status: 'Active' },
        { id: 'crs-cs-103', code: 'CS202', title: 'Database Management Systems', instructorName: 'Dr. Sunita Deshmukh', credits: 4, department: 'Computer Science & Engineering', status: 'Active' },
        { id: 'crs-cs-104', code: 'CS209', title: 'Full Stack Web Engineering Lab', instructorName: 'Prof. Ramesh Kulkarni', credits: 3, department: 'Computer Science & Engineering', status: 'Active' },
        { id: 'crs-cs-105', code: 'MA201', title: 'Discrete Mathematics & Graph Theory', instructorName: 'Dr. S. K. Gupta', credits: 4, department: 'Computer Science & Engineering', status: 'Active' },
        { id: 'crs-cs-106', code: 'CS205', title: 'Operating Systems & Architecture', instructorName: 'Dr. Amit Vikram', credits: 3, department: 'Computer Science & Engineering', status: 'Active' }
      ],
      'Electronics & Communication': [
        { id: 'crs-ec-101', code: 'EC101', title: 'VLSI Design & Semiconductor Physics', instructorName: 'Dr. Venkatesh Iyer', credits: 4, department: 'Electronics & Communication', status: 'Active' },
        { id: 'crs-ec-102', code: 'EC204', title: 'Signals, Systems & DSP Analysis', instructorName: 'Prof. Meenakshi Sundaram', credits: 4, department: 'Electronics & Communication', status: 'Active' },
        { id: 'crs-ec-103', code: 'EC202', title: 'Wireless & Optical Communications', instructorName: 'Dr. Ananya Reddy', credits: 4, department: 'Electronics & Communication', status: 'Active' },
        { id: 'crs-ec-104', code: 'EC205', title: 'Microcontrollers & Embedded Systems Lab', instructorName: 'Prof. Rajesh Khanna', credits: 3, department: 'Electronics & Communication', status: 'Active' },
        { id: 'crs-ec-105', code: 'EC208', title: 'Analog Integrated Circuit Design', instructorName: 'Dr. S. Narayanan', credits: 4, department: 'Electronics & Communication', status: 'Active' }
      ],
      'Electrical & Electronics': [
        { id: 'crs-ee-101', code: 'EE101', title: 'Power Systems & Smart Grid Engineering', instructorName: 'Dr. K. V. Ramana', credits: 4, department: 'Electrical & Electronics', status: 'Active' },
        { id: 'crs-ee-102', code: 'EE204', title: 'Control Systems & Industrial Automation', instructorName: 'Prof. Suresh Nair', credits: 4, department: 'Electrical & Electronics', status: 'Active' },
        { id: 'crs-ee-103', code: 'EE202', title: 'Electrical Machines & Transformers', instructorName: 'Dr. Lakshmi Prasanna', credits: 4, department: 'Electrical & Electronics', status: 'Active' },
        { id: 'crs-ee-104', code: 'EE205', title: 'High Voltage & Power Electronics Lab', instructorName: 'Prof. Anand Vardhan', credits: 3, department: 'Electrical & Electronics', status: 'Active' }
      ],
      'Mechanical Engineering': [
        { id: 'crs-me-101', code: 'ME101', title: 'Applied Engineering Thermodynamics', instructorName: 'Dr. Harish Chandra', credits: 4, department: 'Mechanical Engineering', status: 'Active' },
        { id: 'crs-me-102', code: 'ME204', title: 'Fluid Mechanics & Hydraulic Machines', instructorName: 'Prof. Balram Pillai', credits: 4, department: 'Mechanical Engineering', status: 'Active' },
        { id: 'crs-me-103', code: 'ME202', title: 'CAD/CAM & Digital Manufacturing', instructorName: 'Dr. Rohan Deshmukh', credits: 4, department: 'Mechanical Engineering', status: 'Active' },
        { id: 'crs-me-104', code: 'ME205', title: 'Heat & Mass Transfer Engineering', instructorName: 'Prof. S. K. Mahapatra', credits: 3, department: 'Mechanical Engineering', status: 'Active' },
        { id: 'crs-me-105', code: 'ME209', title: 'Robotics & Mechatronics Automation Lab', instructorName: 'Dr. Nitin Kulkarni', credits: 3, department: 'Mechanical Engineering', status: 'Active' }
      ],
      'Biotechnology & Life Sciences': [
        { id: 'crs-bt-101', code: 'BT101', title: 'Bioprocess Engineering & Fermentation', instructorName: 'Dr. Kavita Subramanian', credits: 4, department: 'Biotechnology & Life Sciences', status: 'Active' },
        { id: 'crs-bt-102', code: 'BT204', title: 'Molecular Biology & Human Genetics', instructorName: 'Prof. Arun Kumar', credits: 4, department: 'Biotechnology & Life Sciences', status: 'Active' },
        { id: 'crs-bt-103', code: 'BT202', title: 'Recombinant DNA Technology & CRISPR', instructorName: 'Dr. Priya Rajagopal', credits: 4, department: 'Biotechnology & Life Sciences', status: 'Active' },
        { id: 'crs-bt-104', code: 'BT205', title: 'Bioinformatics & Genomic Analytics', instructorName: 'Prof. S. Ranganathan', credits: 3, department: 'Biotechnology & Life Sciences', status: 'Active' },
        { id: 'crs-bt-105', code: 'BT209', title: 'Industrial Microbiology & Cell Culture Lab', instructorName: 'Dr. Deepa Menon', credits: 3, department: 'Biotechnology & Life Sciences', status: 'Active' }
      ],
      'Department of Management Studies': [
        { id: 'crs-mb-101', code: 'MB101', title: 'Corporate Finance & Portfolio Management', instructorName: 'Dr. Vikramaditya Roy', credits: 4, department: 'Department of Management Studies', status: 'Active' },
        { id: 'crs-mb-102', code: 'MB204', title: 'Marketing Analytics & Digital Strategy', instructorName: 'Prof. Shalini Kapoor', credits: 4, department: 'Department of Management Studies', status: 'Active' },
        { id: 'crs-mb-103', code: 'MB202', title: 'Organizational Leadership & Behavior', instructorName: 'Dr. Rajeshwar Sharma', credits: 4, department: 'Department of Management Studies', status: 'Active' },
        { id: 'crs-mb-104', code: 'MB205', title: 'Business Analytics with Python & R', instructorName: 'Prof. Anirudh Sen', credits: 3, department: 'Department of Management Studies', status: 'Active' }
      ],
      'Civil Engineering': [
        { id: 'crs-ce-101', code: 'CE101', title: 'Advanced Structural Analysis & Steel Design', instructorName: 'Dr. G. S. Murthy', credits: 4, department: 'Civil Engineering', status: 'Active' },
        { id: 'crs-ce-102', code: 'CE204', title: 'Environmental Engineering & Waste Management', instructorName: 'Prof. N. K. Chaudhury', credits: 4, department: 'Civil Engineering', status: 'Active' },
        { id: 'crs-ce-103', code: 'CE202', title: 'Geotechnical Engineering & Soil Mechanics', instructorName: 'Dr. S. P. Mukherjee', credits: 4, department: 'Civil Engineering', status: 'Active' },
        { id: 'crs-ce-104', code: 'CE205', title: 'Transportation & Highway Engineering', instructorName: 'Prof. V. K. Bhasin', credits: 3, department: 'Civil Engineering', status: 'Active' }
      ]
    };

    const enrolledCourses = deptCoursesMap[dept] || deptCoursesMap['Computer Science & Engineering'];

    // Subject-wise attendance breakdown (Department Specific)
    const subjectAttendance = enrolledCourses.map((c, idx) => {
      const totalClasses = 22 + (idx * 3) % 10;
      const attended = totalClasses - (idx % 3);
      const percentage = Math.round((attended / totalClasses) * 100);
      return {
        code: c.code,
        title: c.title,
        totalClasses,
        attended,
        percentage,
        status: percentage >= 90 ? 'Excellent' : percentage >= 75 ? 'Good' : 'Warning'
      };
    });

    // SGPA History
    const sgpaHistory = [
      { semester: 'Sem 1', sgpa: 8.70, year: '2024' },
      { semester: 'Sem 2', sgpa: 8.90, year: '2025' },
      { semester: 'Sem 3 (Current)', sgpa: student.gpa || 8.95, year: '2026' }
    ];

    // Department Specific Timetable Schedule
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const times = ['09:00 AM - 10:30 AM', '11:00 AM - 12:30 PM', '02:00 PM - 03:30 PM', '03:45 PM - 05:15 PM'];
    const deptPrefix = dept.split(' ')[0].toUpperCase();

    const weeklySchedule = enrolledCourses.slice(0, 5).map((c, idx) => ({
      day: days[idx % days.length],
      time: times[idx % times.length],
      subject: `${c.code}: ${c.title}`,
      room: `${deptPrefix} Block - Room ${101 + idx}`,
      instructor: c.instructorName
    }));

    // Student Vault Attachments & Documents
    let userAttachments: any[] = [];
    const matchedApp = Array.from(dbStore.admissions.values()).find(
      a => a.email.toLowerCase().trim() === student.email.toLowerCase().trim() || a.enrolledStudentId === student.id
    );

    if (matchedApp && matchedApp.attachments && matchedApp.attachments.length > 0) {
      userAttachments = matchedApp.attachments.map((att: any) => ({
        id: att.id || `doc-${Date.now()}`,
        name: att.name || `${att.category} Document`,
        category: att.category || 'Admission Document',
        status: 'Verified',
        date: att.uploadedAt ? att.uploadedAt.split('T')[0] : '2026-08-01',
        fileData: att.fileData
      }));
    }

    const documents = [
      ...userAttachments,
      { id: 'doc-101', name: 'Class X Secondary Board Marksheet', category: 'Academic Proof', status: 'Verified', date: '2024-07-15' },
      { id: 'doc-102', name: 'Class XII Senior Secondary Passing Certificate', category: 'Academic Proof', status: 'Verified', date: '2024-07-15' },
      { id: 'doc-103', name: `Semester 1 Fee Receipt (#REC-${student.studentId})`, category: 'Finance', status: 'Verified', date: '2026-01-10' },
      { id: 'doc-104', name: `Official Bonafide Certificate (${dept})`, category: 'General', status: 'Approved', date: '2026-02-01' }
    ];

    // Department Specific Notices & Announcements
    const notices = [
      {
        id: 'not-1',
        title: `${dept} Mid-Term Examination Schedule Released (Spring 2026)`,
        date: 'Today',
        category: 'Exam',
        priority: 'High',
        description: `Mid-term examinations for all ${dept} degree courses commence from March 10, 2026. Hall tickets available in the portal.`
      },
      {
        id: 'not-2',
        title: `ScholarCore ${dept} Annual Academic Symposium 2026`,
        date: 'Yesterday',
        category: 'Events',
        priority: 'Medium',
        description: `Students registered in ${dept} are invited to submit research papers and technical project entries before Feb 25.`
      },
      {
        id: 'not-3',
        title: 'Central University Library Book Return Reminder',
        date: '3 days ago',
        category: 'Library',
        priority: 'Low',
        description: 'Please return all overdue reference books to avoid daily late fine levies.'
      }
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
