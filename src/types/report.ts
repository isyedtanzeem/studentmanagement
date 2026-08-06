export interface StudentReportData {
  totalStudents: number;
  activeCount: number;
  graduatedCount: number;
  suspendedCount: number;
  onLeaveCount: number;
  feePaid: number;
  feePending: number;
  feePartial: number;
  avgCgpa: number;
  topPerformers: number;
  byDepartment: Array<{ department: string; count: number; percentage: number }>;
  byAcademicYear: Array<{ year: string; count: number }>;
  studentRecords: Array<{
    id: string;
    studentId: string;
    fullName: string;
    email: string;
    department: string;
    academicYear: string;
    semester: string;
    gender: string;
    cgpa: number;
    feeStatus: string;
    status: string;
    enrollmentDate: string;
  }>;
}

export interface AdmissionReportData {
  totalApplications: number;
  approvedCount: number;
  pendingCount: number;
  reviewCount: number;
  rejectedCount: number;
  conversionRate: number;
  byDepartment: Array<{
    department: string;
    total: number;
    approved: number;
    pending: number;
    approvalRate: number;
  }>;
  byCategory: Array<{ category: string; count: number }>;
  admissionRecords: Array<{
    id: string;
    applicantName: string;
    email: string;
    department: string;
    category: string;
    score: number;
    status: string;
    applicationDate: string;
  }>;
}

export interface DepartmentReportData {
  totalDepartments: number;
  totalCapacity: number;
  totalEnrolled: number;
  overallFillRate: number;
  departments: Array<{
    id: string;
    code: string;
    name: string;
    headOfDepartment: string;
    capacity: number;
    enrolledStudents: number;
    facultyCount: number;
    courseCount: number;
    fillRate: number;
    avgGpa: number;
    establishedYear: number;
  }>;
}

export interface GenderReportData {
  totalStudents: number;
  maleCount: number;
  femaleCount: number;
  otherCount: number;
  maleRatio: number;
  femaleRatio: number;
  otherRatio: number;
  maleAvgGpa: number;
  femaleAvgGpa: number;
  byDepartment: Array<{
    department: string;
    total: number;
    male: number;
    female: number;
    other: number;
    femalePercentage: number;
  }>;
}

export interface AlumniReportData {
  totalAlumni: number;
  employed: number;
  founders: number;
  higherEd: number;
  seeking: number;
  careerSuccessRate: number;
  totalDonations: number;
  byIndustry: Array<{ industry: string; count: number }>;
  byGraduationYear: Array<{ year: number; count: number }>;
  alumniRecords: Array<{
    id: string;
    studentId: string;
    fullName: string;
    email: string;
    graduationYear: number;
    department: string;
    employmentStatus: string;
    currentCompany: string;
    designation: string;
    industry: string;
    workLocation: string;
  }>;
}
