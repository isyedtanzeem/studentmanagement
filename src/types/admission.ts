export interface AdmissionAttachment {
  id: string;
  name: string;
  size?: string;
  type?: string;
  category: string;
  fileData?: string;
  uploadedAt: string;
}

export interface VerificationChecklist {
  classXMarksheet: boolean;
  classXIIMarksheet: boolean;
  identityProof: boolean;
  casteCertificate?: boolean;
  migrationCertificate: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export type AdmissionStatus = 'Pending' | 'Under Review' | 'Document Verification' | 'Approved' | 'Rejected';

export interface AdmissionApplication {
  id: string;
  applicationNumber: string;
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
  academicTerm: string;
  classXPercentage?: number;
  classXIIPercentage?: number;
  entranceExamScore?: string;
  attachments?: AdmissionAttachment[];
  status: AdmissionStatus;
  rejectionReason?: string;
  verificationChecklist?: VerificationChecklist;
  generatedStudentId?: string;
  enrolledStudentId?: string;
  appliedDate: string;
  updatedAt?: string;
}

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

export interface AdmissionStats {
  total: number;
  pending: number;
  underReview: number;
  documentVerification: number;
  approved: number;
  rejected: number;
}

export interface AdmissionPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface AdmissionListResponse {
  success: boolean;
  data: AdmissionApplication[];
  pagination: AdmissionPagination;
  stats: AdmissionStats;
  message?: string;
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
  attachments?: AdmissionAttachment[];
}
