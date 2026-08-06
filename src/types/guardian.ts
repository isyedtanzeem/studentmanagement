export interface MappedStudent {
  id: string;
  studentId: string;
  fullName: string;
  department: string;
  email?: string;
  phone?: string;
  status?: string;
}

export interface Guardian {
  id: string;
  guardianId: string;
  // Parent Details
  fatherName: string;
  fatherOccupation?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  motherName: string;
  motherOccupation?: string;
  motherPhone?: string;
  motherEmail?: string;
  // Primary Guardian / Contact
  guardianName: string;
  relationship: 'Father' | 'Mother' | 'Legal Guardian' | 'Local Guardian' | 'Relative' | 'Other';
  occupation?: string;
  primaryPhone: string;
  email?: string;
  annualIncome?: number;
  // Emergency Contacts
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactAltPhone?: string;
  emergencyRelationship: string;
  emergencyAddress?: string;
  // Residential Address
  residentialAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  // Student Mapping
  mappedStudentIds: string[];
  mappedStudents?: MappedStudent[];
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface GuardianQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  relationship?: string;
  status?: string;
  city?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GuardianStats {
  total: number;
  active: number;
  inactive: number;
  totalMappedStudents: number;
  emergencyContactsCount: number;
}

export interface GuardianPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

export interface GuardianFormData {
  fatherName: string;
  fatherOccupation?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  motherName: string;
  motherOccupation?: string;
  motherPhone?: string;
  motherEmail?: string;
  guardianName: string;
  relationship: 'Father' | 'Mother' | 'Legal Guardian' | 'Local Guardian' | 'Relative' | 'Other';
  occupation?: string;
  primaryPhone: string;
  email?: string;
  annualIncome?: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactAltPhone?: string;
  emergencyRelationship: string;
  emergencyAddress?: string;
  residentialAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  mappedStudentIds: string[];
  status: 'Active' | 'Inactive';
}

export interface StudentOption {
  id: string;
  studentId: string;
  fullName: string;
  department: string;
}
