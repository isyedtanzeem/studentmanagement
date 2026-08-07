export type FacultyDesignation = 'HOD' | 'Professor' | 'Asst. Professor' | string;
export type FacultyStatus = 'Active' | 'On Leave' | 'Inactive';

export interface Faculty {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  designation: FacultyDesignation;
  qualification?: string;
  joiningDate?: string;
  status: FacultyStatus;
  createdAt?: string;
  updatedAt?: string;
  coursesTaught?: any[];
}

export interface FacultyStats {
  total: number;
  hodCount: number;
  professorCount: number;
  asstProfessorCount: number;
  activeCount: number;
}

export interface FacultyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  designation?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FacultyListResponse {
  success: boolean;
  data: Faculty[];
  stats: FacultyStats;
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}
