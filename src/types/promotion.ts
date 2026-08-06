export interface StudentRecord {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  gender: 'Male' | 'Female' | 'Other';
  status: 'Active' | 'Inactive' | 'Graduated' | 'Suspended';
  enrollmentYear: number;
  currentSemester?: number;
  currentYear?: number;
  academicBatch?: string;
  attendancePercentage?: number;
  backlogsCount?: number;
  feeStatus?: 'Paid' | 'Due' | 'Partial' | 'Exempt';
  disciplinaryClearance?: boolean;
  gpa: number;
  createdAt: string;
  photoUrl?: string;
}

export interface ValidationSummary {
  eligible: boolean;
  attendanceOk: boolean;
  attendanceVal: number;
  backlogsOk: boolean;
  backlogsVal: number;
  feeOk: boolean;
  feeVal: string;
  disciplineOk: boolean;
  reasons: string[];
}

export interface PromotionStudentItem {
  student: StudentRecord;
  validation: ValidationSummary;
  nextSemester: number;
  nextYear: number;
  isGraduating: boolean;
}

export interface PromotionRecord {
  id: string;
  studentDbId: string;
  studentId: string;
  studentName: string;
  department: string;
  promotionType: 'Semester Promotion' | 'Year Promotion' | 'Graduation' | 'Conditional Promotion';
  previousSemester: number;
  newSemester: number;
  previousYear: number;
  newYear: number;
  promotedBy: string;
  promotedAt: string;
  academicSession: string;
  status: 'Promoted' | 'Conditional' | 'Rolled Back';
  remarks?: string;
  validationPassed: boolean;
  validationCheckSummary: {
    attendanceOk: boolean;
    attendanceVal: number;
    backlogsOk: boolean;
    backlogsVal: number;
    feeOk: boolean;
    feeVal: string;
    disciplineOk: boolean;
  };
  rollbackReason?: string;
  rolledBackBy?: string;
  rolledBackAt?: string;
}

export interface ValidationRules {
  minAttendance: number;
  maxBacklogs: number;
  requireFeePaid: boolean;
  requireDisciplineClearance: boolean;
}

export interface BulkPromotionResult {
  totalProcessed: number;
  successCount: number;
  conditionalCount: number;
  failedCount: number;
  failures: Array<{
    studentId: string;
    studentName: string;
    reasons: string[];
  }>;
  createdRecords: PromotionRecord[];
}
