export type DocumentType =
  | 'Aadhaar'
  | 'Birth Certificate'
  | 'Transfer Certificate'
  | 'Marks Cards'
  | 'Passport Photo'
  | 'Other';

export type VerificationStatus =
  | 'Verified'
  | 'Pending Verification'
  | 'Rejected'
  | 'Re-upload Requested';

export interface DocumentRecord {
  id: string;
  documentId: string;
  studentId: string;
  studentRollNo: string;
  studentName: string;
  documentType: DocumentType;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  fileUrl: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verificationDate?: string;
  remarks?: string;
  uploadDate: string;
  updatedAt?: string;
}

export interface DocumentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  documentType?: string;
  verificationStatus?: string;
  studentId?: string;
}

export interface DocumentStats {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
  reuploadRequested: number;
  uniqueStudents: number;
  typeBreakdown: {
    Aadhaar: number;
    BirthCertificate: number;
    TransferCertificate: number;
    MarksCards: number;
    PassportPhoto: number;
    Other: number;
  };
}

export interface DocumentListResponse {
  success: boolean;
  data: DocumentRecord[];
  stats: DocumentStats;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}
