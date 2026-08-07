export interface Department {
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
  status: 'Active' | 'Inactive';
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDepartmentDto {
  code: string;
  name: string;
  headOfDepartment: string;
  hodEmail?: string;
  hodPhone?: string;
  hodDesignation?: string;
  establishedYear?: number;
  buildingLocation?: string;
  status?: 'Active' | 'Inactive';
  description?: string;
}

export type DepartmentFormData = CreateDepartmentDto;

export interface UpdateDepartmentDto extends Partial<CreateDepartmentDto> {}

export interface DepartmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DepartmentStats {
  total: number;
  active: number;
  inactive: number;
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
}

export interface FacultyOption {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  designation: string;
  department: string;
}

export interface DepartmentListResponse {
  success: boolean;
  data: Department[];
  stats: DepartmentStats;
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}
