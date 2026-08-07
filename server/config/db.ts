import dotenv from 'dotenv';
dotenv.config();

export interface SystemUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'Super Admin' | 'Admin' | 'Admission Officer';
  department?: string;
  studentId?: string;
  employeeId?: string;
  avatarUrl?: string;
  status: 'Active' | 'Suspended' | 'Pending';
  lastLogin?: string;
  createdAt: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
}

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  token: string;
  expiresAt: number;
  createdAt: string;
  revoked: boolean;
  userAgent?: string;
  ipAddress?: string;
}

export interface AuditLogRecord {
  id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  action: string;
  ipAddress: string;
  timestamp: string;
  details?: string;
}

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
  currentSemester?: number; // 1 to 8
  currentYear?: number; // 1 to 4
  academicBatch?: string; // e.g. "2024-2028"
  attendancePercentage?: number; // e.g. 88.5
  backlogsCount?: number; // e.g. 0
  feeStatus?: 'Paid' | 'Due' | 'Partial' | 'Exempt';
  disciplinaryClearance?: boolean;
  gpa: number;
  createdAt: string;
  photoUrl?: string;
  dateOfBirth?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
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
  academicSession: string; // e.g. "2026-2027 Odd Sem"
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

export interface VerificationChecklist {
  classXMarksheet: boolean;
  classXIIMarksheet: boolean;
  identityProof: boolean;
  casteCertificate?: boolean;
  migrationCertificate: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface AdmissionAttachment {
  id: string;
  name: string;
  size?: string;
  type?: string;
  category: string;
  fileData?: string;
  uploadedAt: string;
}

export interface AdmissionRecord {
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
  status: 'Pending' | 'Under Review' | 'Document Verification' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  verificationChecklist?: VerificationChecklist;
  generatedStudentId?: string;
  enrolledStudentId?: string;
  appliedDate: string;
  updatedAt?: string;
}

export interface DepartmentRecord {
  id: string;
  code: string;
  name: string;
  headOfDepartment: string;
  hodEmail?: string;
  hodPhone?: string;
  hodDesignation?: string;
  studentCount: number;
  facultyCount: number;
  coursesCount: number;
  establishedYear?: number;
  buildingLocation?: string;
  status?: 'Active' | 'Inactive';
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseRecord {
  id: string;
  code: string;
  title: string;
  department: string;
  degreeProgram?: string;
  level?: 'Undergraduate' | 'Postgraduate' | 'Diploma' | 'Doctoral';
  duration?: string; // e.g. "4 Years / 8 Semesters" or "1 Semester"
  credits: number;
  courseFee?: number; // Tuition fee per semester/annual
  labFee?: number; // Lab/Additional Fee
  totalFee?: number;
  status?: 'Active' | 'Inactive' | 'Archived';
  description?: string;
  prerequisites?: string;
  instructorName?: string;
  maxCapacity?: number;
  enrolledStudents: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacultyRecord {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  designation: string; // 'HOD' | 'Professor' | 'Asst. Professor' | string
  qualification?: string;
  joiningDate?: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentRecord {
  id: string;
  documentId: string;
  studentId: string;
  studentRollNo: string;
  studentName: string;
  documentType: 'Aadhaar' | 'Birth Certificate' | 'Transfer Certificate' | 'Marks Cards' | 'Passport Photo' | 'Other';
  title: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  fileUrl: string;
  verificationStatus: 'Verified' | 'Pending Verification' | 'Rejected' | 'Re-upload Requested';
  verifiedBy?: string;
  verificationDate?: string;
  remarks?: string;
  uploadDate: string;
  updatedAt?: string;
}

export interface IdCardRecord {
  id: string;
  cardNumber: string;
  studentDbId: string;
  studentRollNo: string;
  studentName: string;
  department: string;
  enrollmentYear: number;
  validUntil: string;
  issueDate: string;
  dob?: string;
  bloodGroup: string;
  emergencyPhone: string;
  address?: string;
  photoUrl: string;
  qrCodeData: string;
  barcodeValue: string;
  status: 'Active' | 'Revoked' | 'Expired' | 'Reissued';
  layoutTemplate: 'portrait-modern' | 'portrait-classic' | 'landscape-modern' | 'compact-badge' | 'executive-chip';
  printCount: number;
  createdAt: string;
}

export interface CollegeBrandingConfig {
  collegeName: string;
  shortName: string;
  tagline: string;
  logoUrl: string;
  watermarkUrl?: string;
  principalSignatureUrl: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  website: string;
  primaryColor: string;
  accentColor: string;
  cardHeaderBg: string;
  showQrCode: boolean;
  showBarcode: boolean;
  showEmergencyPhone: boolean;
  showBloodGroup: boolean;
}

export interface RecentActivityRecord {
  id: string;
  title: string;
  description: string;
  category: 'Admission' | 'Academic' | 'System' | 'Faculty' | 'Fee';
  actorName: string;
  actorRole: string;
  timestamp: string;
  badgeType: 'success' | 'warning' | 'info' | 'danger' | 'gold';
}

export interface HigherEducationRecord {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  completionYear?: number;
  country?: string;
}

export interface AlumniGivingRecord {
  id: string;
  amount: number;
  currency: string;
  purpose: string;
  date: string;
  receiptNumber?: string;
}

export interface AlumniRecord {
  id: string;
  studentDbId?: string;
  studentId: string;
  fullName: string;
  email: string;
  phone: string;
  graduationYear: number;
  department: string;
  degree: string;
  cgpa: number;
  photoUrl?: string;
  gender: 'Male' | 'Female' | 'Other';
  employmentStatus: 'Employed' | 'Self-Employed / Founder' | 'Higher Studies' | 'Seeking Opportunities' | 'Other';
  currentCompany?: string;
  designation?: string;
  industry?: string;
  salaryBand?: string;
  workLocation?: string;
  higherEducation?: HigherEducationRecord;
  linkedinUrl?: string;
  githubUrl?: string;
  personalWebsite?: string;
  currentCity?: string;
  currentCountry?: string;
  permanentAddress?: string;
  givingHistory?: AlumniGivingRecord[];
  networkingOptIn: boolean;
  achievements?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  category: 'Admission' | 'Academic' | 'Finance' | 'System';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// In-memory persistent database store fallback for instant out-of-the-box execution
// Can be backed by MongoDB Mongoose when standard MONGODB_URI is provided.
export class DatabaseStore {
  private static instance: DatabaseStore;
  public users: Map<string, SystemUser> = new Map();
  public refreshTokens: Map<string, RefreshTokenRecord> = new Map();
  public auditLogs: AuditLogRecord[] = [];
  public resetTokens: Map<string, { email: string; token: string; expiresAt: number }> = new Map();

  // SIMS Core Data
  public students: Map<string, StudentRecord> = new Map();
  public admissions: Map<string, AdmissionRecord> = new Map();
  public departments: Map<string, DepartmentRecord> = new Map();
  public courses: Map<string, CourseRecord> = new Map();
  public faculty: Map<string, FacultyRecord> = new Map();
  public idCards: Map<string, IdCardRecord> = new Map();
  public promotionHistory: Map<string, PromotionRecord> = new Map();
  public alumni: Map<string, AlumniRecord> = new Map();
  public brandingConfig: CollegeBrandingConfig = {
    collegeName: 'ScholarCore Institute of Technology & Sciences',
    shortName: 'SCITS',
    tagline: 'Autonomous Institution • NAAC Grade A+ Accredited',
    logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=200&q=80',
    watermarkUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=300&q=80',
    principalSignatureUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Kirsch_Signature.png',
    address: 'Campus Drive, Academic Zone 4, Bengaluru, KA - 560103',
    contactPhone: '+91 80 4910 8800',
    contactEmail: 'registrar@scholarcore.edu.in',
    website: 'https://scholarcore.edu.in',
    primaryColor: '#1e1b4b',
    accentColor: '#D4AF37',
    cardHeaderBg: '#0f172a',
    showQrCode: true,
    showBarcode: true,
    showEmergencyPhone: true,
    showBloodGroup: true
  };
  public activities: RecentActivityRecord[] = [];
  public notifications: NotificationRecord[] = [];

  private constructor() {}

  public static getInstance(): DatabaseStore {
    if (!DatabaseStore.instance) {
      DatabaseStore.instance = new DatabaseStore();
    }
    return DatabaseStore.instance;
  }
}

export const dbStore = DatabaseStore.getInstance();
