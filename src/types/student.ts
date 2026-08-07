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
  gender: 'Male' | 'Female' | 'Other';
  status: 'Active' | 'Inactive' | 'Graduated' | 'Suspended';
  enrollmentYear: number;
  gpa: number; // Represents 10-point CGPA scale (e.g. 8.75)
  cgpa?: number; // Explicit 10-point scale CGPA
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
