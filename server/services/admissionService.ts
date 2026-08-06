import { dbStore, AdmissionRecord, StudentRecord, VerificationChecklist } from '../config/db';
import { DashboardModel } from '../models/Dashboard';

export interface AdmissionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  department?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateAdmissionInput {
  applicantName: string;
  email: string;
  phone?: string;
  fatherName?: string;
  motherName?: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  category?: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  state?: string;
  address?: string;
  department: string;
  degree?: string;
  academicTerm?: string;
  classXPercentage?: number;
  classXIIPercentage?: number;
  entranceExamScore?: string;
}

export class AdmissionService {
  private static deptCodeMap: Record<string, string> = {
    'Computer Science & Engineering': 'CSE',
    'Electronics & Communication': 'ECE',
    'Electrical & Electronics': 'EEE',
    'Mechanical Engineering': 'ME',
    'Biotechnology & Life Sciences': 'BT',
    'Department of Management Studies': 'MBA',
    'Civil Engineering': 'CE'
  };

  private static generateApplicationNumber(): string {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `APP-2026-${randomDigits}`;
  }

  public static generateAdmissionRollNumber(departmentName: string, year: number = 2026): string {
    const code = this.deptCodeMap[departmentName] || 'GEN';
    
    // Find highest index among existing students and admissions
    let count = 1000;
    dbStore.students.forEach((s) => {
      if (s.studentId && s.studentId.includes(code)) {
        const numPart = parseInt(s.studentId.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(numPart) && numPart >= count) {
          count = numPart + 1;
        }
      }
    });

    dbStore.admissions.forEach((a) => {
      if (a.generatedStudentId && a.generatedStudentId.includes(code)) {
        const numPart = parseInt(a.generatedStudentId.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(numPart) && numPart >= count) {
          count = numPart + 1;
        }
      }
    });

    return `${year}${code}${count + 1}`;
  }

  public static getAllApplications(params: AdmissionQueryParams) {
    DashboardModel.seedDataIfEmpty();

    let list = Array.from(dbStore.admissions.values());

    // Search filter
    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.applicantName.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.applicationNumber.toLowerCase().includes(q) ||
          (a.generatedStudentId && a.generatedStudentId.toLowerCase().includes(q)) ||
          (a.phone && a.phone.includes(q))
      );
    }

    // Status filter
    if (params.status && params.status !== 'ALL') {
      list = list.filter((a) => a.status === params.status);
    }

    // Department filter
    if (params.department && params.department !== 'ALL') {
      list = list.filter((a) => a.department === params.department);
    }

    // Category filter
    if (params.category && params.category !== 'ALL') {
      list = list.filter((a) => a.category === params.category);
    }

    // Stats calculation
    const allList = Array.from(dbStore.admissions.values());
    const stats = {
      total: allList.length,
      pending: allList.filter((a) => a.status === 'Pending').length,
      underReview: allList.filter((a) => a.status === 'Under Review').length,
      documentVerification: allList.filter((a) => a.status === 'Document Verification').length,
      approved: allList.filter((a) => a.status === 'Approved').length,
      rejected: allList.filter((a) => a.status === 'Rejected').length
    };

    // Sorting
    const sortBy = params.sortBy || 'appliedDate';
    const sortOrder = params.sortOrder || 'desc';

    list.sort((a: any, b: any) => {
      let valA = a[sortBy] ?? '';
      let valB = b[sortBy] ?? '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const totalItems = list.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedData = list.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit
      },
      stats
    };
  }

  public static getApplicationById(id: string): AdmissionRecord | null {
    DashboardModel.seedDataIfEmpty();
    return dbStore.admissions.get(id) || null;
  }

  public static createApplication(input: CreateAdmissionInput): AdmissionRecord {
    DashboardModel.seedDataIfEmpty();

    const id = `adm-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const applicationNumber = this.generateApplicationNumber();

    const newApp: AdmissionRecord = {
      id,
      applicationNumber,
      applicantName: input.applicantName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone,
      fatherName: input.fatherName,
      motherName: input.motherName,
      gender: input.gender || 'Male',
      dateOfBirth: input.dateOfBirth,
      category: input.category || 'General',
      state: input.state,
      address: input.address,
      department: input.department,
      degree: input.degree || 'B.Tech',
      academicTerm: input.academicTerm || '2026-2027 Session',
      classXPercentage: input.classXPercentage,
      classXIIPercentage: input.classXIIPercentage,
      entranceExamScore: input.entranceExamScore,
      status: 'Pending',
      verificationChecklist: {
        classXMarksheet: false,
        classXIIMarksheet: false,
        identityProof: false,
        migrationCertificate: false
      },
      appliedDate: new Date().toISOString()
    };

    dbStore.admissions.set(id, newApp);

    // Record system activity
    dbStore.activities.unshift({
      id: `act-${Date.now()}`,
      title: 'New Admission Application Submitted',
      description: `${newApp.applicantName} applied for ${newApp.degree || ''} ${newApp.department} (${newApp.applicationNumber}).`,
      category: 'Admission',
      actorName: newApp.applicantName,
      actorRole: 'Applicant',
      timestamp: new Date().toISOString(),
      badgeType: 'gold'
    });

    return newApp;
  }

  public static updateApplicationStatus(
    id: string,
    status: 'Pending' | 'Under Review' | 'Document Verification' | 'Approved' | 'Rejected',
    remarks?: string
  ): AdmissionRecord | null {
    DashboardModel.seedDataIfEmpty();
    const app = dbStore.admissions.get(id);
    if (!app) return null;

    app.status = status;
    if (remarks && status === 'Rejected') {
      app.rejectionReason = remarks;
    }
    app.updatedAt = new Date().toISOString();

    dbStore.admissions.set(id, app);

    dbStore.activities.unshift({
      id: `act-${Date.now()}`,
      title: `Admission Status Updated: ${status}`,
      description: `Application ${app.applicationNumber} (${app.applicantName}) updated to ${status}.`,
      category: 'Admission',
      actorName: 'Admissions Officer',
      actorRole: 'Officer',
      timestamp: new Date().toISOString(),
      badgeType: status === 'Approved' ? 'success' : status === 'Rejected' ? 'danger' : 'info'
    });

    return app;
  }

  public static verifyDocuments(id: string, checklist: Partial<VerificationChecklist>, verifiedBy?: string): AdmissionRecord | null {
    DashboardModel.seedDataIfEmpty();
    const app = dbStore.admissions.get(id);
    if (!app) return null;

    app.verificationChecklist = {
      ...(app.verificationChecklist || {
        classXMarksheet: false,
        classXIIMarksheet: false,
        identityProof: false,
        migrationCertificate: false
      }),
      ...checklist,
      verifiedBy: verifiedBy || 'Central Verification Cell',
      verifiedAt: new Date().toISOString()
    };

    app.status = 'Document Verification';
    app.updatedAt = new Date().toISOString();

    dbStore.admissions.set(id, app);

    dbStore.activities.unshift({
      id: `act-${Date.now()}`,
      title: 'Document Verification Updated',
      description: `Verification status updated for ${app.applicantName} (${app.applicationNumber}).`,
      category: 'Admission',
      actorName: verifiedBy || 'Verification Officer',
      actorRole: 'Officer',
      timestamp: new Date().toISOString(),
      badgeType: 'info'
    });

    return app;
  }

  public static approveAndEnrollStudent(id: string, customStudentRollNo?: string, approvedBy?: string): { application: AdmissionRecord; student: StudentRecord } | null {
    DashboardModel.seedDataIfEmpty();
    const app = dbStore.admissions.get(id);
    if (!app) return null;

    // 1. Generate Admission Roll Number if not supplied
    const rollNo = customStudentRollNo || this.generateAdmissionRollNumber(app.department, 2026);

    // 2. Mark application as Approved
    app.status = 'Approved';
    app.generatedStudentId = rollNo;
    app.updatedAt = new Date().toISOString();

    // 3. Create active Student Record (Student Enrollment)
    const newStudentId = `std-${Date.now()}`;
    const newStudent: StudentRecord = {
      id: newStudentId,
      studentId: rollNo,
      fullName: app.applicantName,
      email: app.email,
      phone: app.phone || '+91 98765 00000',
      department: app.department,
      gender: app.gender,
      status: 'Active',
      enrollmentYear: 2026,
      gpa: 0.0, // Initial fresh enrollment CGPA
      createdAt: new Date().toISOString(),
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      dateOfBirth: app.dateOfBirth || '2005-01-01',
      address: app.address || `${app.state || 'India'} Address`,
      guardianName: app.fatherName || app.motherName || 'Parent / Guardian',
      guardianPhone: app.phone || '+91 98765 00000'
    };

    app.enrolledStudentId = newStudentId;
    dbStore.admissions.set(id, app);
    dbStore.students.set(newStudentId, newStudent);

    // Activity Log
    dbStore.activities.unshift({
      id: `act-${Date.now()}`,
      title: 'Admission Approved & Student Enrolled',
      description: `${app.applicantName} enrolled into ${app.department} with Roll No: ${rollNo}.`,
      category: 'Admission',
      actorName: approvedBy || 'Academic Registrar Cell',
      actorRole: 'Registrar',
      timestamp: new Date().toISOString(),
      badgeType: 'success'
    });

    return { application: app, student: newStudent };
  }

  public static rejectApplication(id: string, rejectionReason: string, rejectedBy?: string): AdmissionRecord | null {
    DashboardModel.seedDataIfEmpty();
    const app = dbStore.admissions.get(id);
    if (!app) return null;

    app.status = 'Rejected';
    app.rejectionReason = rejectionReason || 'Does not satisfy mandatory eligibility criteria.';
    app.updatedAt = new Date().toISOString();

    dbStore.admissions.set(id, app);

    dbStore.activities.unshift({
      id: `act-${Date.now()}`,
      title: 'Admission Application Rejected',
      description: `Application ${app.applicationNumber} (${app.applicantName}) rejected: ${rejectionReason}`,
      category: 'Admission',
      actorName: rejectedBy || 'Admissions Officer',
      actorRole: 'Officer',
      timestamp: new Date().toISOString(),
      badgeType: 'danger'
    });

    return app;
  }
}
