export type IdCardLayout = 
  | 'portrait-modern' 
  | 'portrait-classic' 
  | 'landscape-modern' 
  | 'compact-badge' 
  | 'executive-chip';

export type IdCardStatus = 'Active' | 'Revoked' | 'Expired' | 'Reissued';

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
  status: IdCardStatus;
  layoutTemplate: IdCardLayout;
  printCount: number;
  createdAt: string;
}

export interface IdCardQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
  layoutTemplate?: string;
}

export interface IdCardStats {
  totalGenerated: number;
  activeCards: number;
  revokedCards: number;
  expiredCards: number;
  totalPrints: number;
}

export interface GenerateCardPayload {
  studentDbId: string;
  validUntil?: string;
  bloodGroup?: string;
  emergencyPhone?: string;
  photoUrl?: string;
  layoutTemplate?: IdCardLayout;
}
