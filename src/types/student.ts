export interface StudentDocument {
  id: string;
  documentType: 'Aadhaar' | 'Birth Certificate' | 'Transfer Certificate' | 'Marks Cards' | 'Passport Photo' | 'Other';
  title: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadDate: string;
  verificationStatus: 'Verified' | 'Pending' | 'Rejected';
  verifiedBy?: string;
  remarks?: string;
  fileUrl?: string;
}

export interface CourseGradeItem {
  code: string;
  title: string;
  credits: number;
  grade: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F';
  marksObtained: number;
  maxMarks: number;
}

export interface SemesterRecord {
  id: string;
  semester: number; // 1 to 8
  academicTerm: string; // e.g. "2024-2025 Autumn"
  sgpa: number; // e.g. 8.75
  cgpa: number; // e.g. 8.68
  creditsRegistered: number;
  creditsEarned: number;
  attendancePercentage: number;
  backlogsCount: number;
  status: 'Passed' | 'Promoted' | 'In Progress' | 'Withheld' | 'Backlog';
  remarks?: string;
  updatedAt?: string;
  courses?: CourseGradeItem[];
}

export interface FeeComponent {
  name: string;
  amount: number;
}

export interface StudentFeeStructure {
  id: string;
  semester: number;
  academicYear: string; // e.g. "2024-2025"
  tuitionFee: number;
  examFee: number;
  libraryLabFee: number;
  hostelFee?: number;
  otherCharges?: number;
  totalFee: number;
  paidAmount: number;
  dueAmount: number;
  dueDate: string;
  status: 'Paid' | 'Partially Paid' | 'Overdue' | 'Unpaid';
}

export interface FeePaymentTransaction {
  id: string;
  receiptNo: string;
  paymentDate: string;
  amountPaid: number;
  paymentMode: 'UPI' | 'NetBanking' | 'Credit/Debit Card' | 'Demand Draft' | 'Cash';
  transactionRef: string;
  feeType: string; // e.g. "Semester 4 Tuition & Exam Fee"
  semester: number;
  status: 'Completed' | 'Pending Verification' | 'Failed';
  collectedBy: string;
  remarks?: string;
}

export interface AttendanceLogEntry {
  id: string;
  studentId: string;
  semester: number;
  oldPercentage: number;
  newPercentage: number;
  classesAttended?: number;
  totalClasses?: number;
  editedBy: string;
  editedAt: string;
  reason: string;
}

export interface Student {
  id: string;
  studentId: string; // Roll No / Enrollment No e.g. 2024CSE1042
  rollNumber?: string;
  fullName: string;
  email: string;
  phone?: string; // +91-XXXXX XXXXX
  department: string; // e.g. Computer Science & Engineering
  degree?: string; // B.Tech, M.Tech, MBA, MCA, B.Sc
  semester?: number; // 1 to 8
  currentSemester?: number; // 1 to 8
  gender: 'Male' | 'Female' | 'Other';
  status: 'Active' | 'Inactive' | 'Graduated' | 'Suspended';
  enrollmentYear: number;
  gpa: number; // Represents 10-point CGPA scale (e.g. 8.75)
  cgpa?: number; // Explicit 10-point scale CGPA
  attendance?: number; // Overall Attendance Percentage e.g. 88.5
  attendanceLogs?: AttendanceLogEntry[];
  category?: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  fatherName?: string;
  motherName?: string;
  abcId?: string; // Academic Bank of Credits ID
  aadhaarNo?: string;
  state?: string; // e.g. Maharashtra, Delhi, Karnataka
  tuitionFeeInINR?: number; // e.g. 125000 (INR ₹)
  createdAt: string;
  photoUrl?: string;
  dateOfBirth?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  documents?: StudentDocument[];
  semesterRecords?: SemesterRecord[];
  feeStructures?: StudentFeeStructure[];
  feePayments?: FeePaymentTransaction[];
  totalFeeAmount?: number;
  totalPaidAmount?: number;
  totalDueAmount?: number;
  feeStatus?: 'Paid' | 'Partially Paid' | 'Overdue' | 'Unpaid';
}

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

export interface StudentPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface StudentStats {
  total: number;
  active: number;
  inactive: number;
  graduated: number;
  avgGpa: string; // CGPA out of 10.0
  totalFeesInINR?: number;
}

export interface StudentListResponse {
  success: boolean;
  data: Student[];
  pagination: StudentPagination;
  stats: StudentStats;
  message?: string;
}

export interface BulkImportResult {
  successCount: number;
  failedCount: number;
  errors: string[];
}
