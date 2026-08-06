export interface Course {
  id: string;
  code: string;
  title: string;
  department: string;
  degreeProgram?: string;
  level?: 'Undergraduate' | 'Postgraduate' | 'Diploma' | 'Doctoral';
  duration?: string; // e.g., "4 Years / 8 Semesters" or "1 Semester"
  credits: number;
  courseFee?: number; // Tuition fee
  labFee?: number; // Lab/Exam fee
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

export interface CourseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  level?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CourseStats {
  total: number;
  active: number;
  inactive: number;
  totalEnrolled: number;
  totalCredits: number;
  avgFee: number;
}

export interface DepartmentOption {
  id: string;
  code: string;
  name: string;
}

export interface CourseFormData {
  code: string;
  title: string;
  department: string;
  degreeProgram: string;
  level: 'Undergraduate' | 'Postgraduate' | 'Diploma' | 'Doctoral';
  duration: string;
  credits: number;
  courseFee: number;
  labFee: number;
  status: 'Active' | 'Inactive';
  instructorName: string;
  maxCapacity: number;
  prerequisites: string;
  description: string;
}
