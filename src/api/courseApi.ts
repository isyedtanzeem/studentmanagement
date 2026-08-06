import {
  Course,
  CourseQueryParams,
  CourseStats,
  DepartmentOption,
  CourseFormData
} from '../types/course';
import { fetchWithAuth } from './httpClient';

export interface CourseListResponse {
  success: boolean;
  data: Course[];
  stats: CourseStats;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

class CourseApiClient {
  public async getCourses(params: CourseQueryParams): Promise<CourseListResponse> {
    const queryParts: string[] = [];
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.department) queryParts.push(`department=${encodeURIComponent(params.department)}`);
    if (params.level) queryParts.push(`level=${encodeURIComponent(params.level)}`);
    if (params.status) queryParts.push(`status=${encodeURIComponent(params.status)}`);
    if (params.sortBy) queryParts.push(`sortBy=${params.sortBy}`);
    if (params.sortOrder) queryParts.push(`sortOrder=${params.sortOrder}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

    const response = await fetchWithAuth(`/api/v1/courses${queryString}`, {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to fetch course records.');
    }
    return data;
  }

  public async getCourseById(id: string): Promise<{ success: boolean; data: Course & { enrolledStudentsCount?: number; enrolledStudentsList?: any[]; departmentInfo?: any } }> {
    const response = await fetchWithAuth(`/api/v1/courses/${id}`, {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to fetch course details.');
    }
    return data;
  }

  public async createCourse(input: Partial<CourseFormData>): Promise<{ success: boolean; data: Course; message: string }> {
    const response = await fetchWithAuth('/api/v1/courses', {
      method: 'POST',
      body: JSON.stringify(input)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to create course.');
    }
    return data;
  }

  public async updateCourse(id: string, input: Partial<CourseFormData>): Promise<{ success: boolean; data: Course; message: string }> {
    const response = await fetchWithAuth(`/api/v1/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to update course.');
    }
    return data;
  }

  public async deleteCourse(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithAuth(`/api/v1/courses/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to delete course.');
    }
    return data;
  }

  public async getDepartmentOptions(): Promise<{ success: boolean; data: DepartmentOption[] }> {
    const response = await fetchWithAuth('/api/v1/courses/department-options', {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to fetch department options.');
    }
    return data;
  }
}

export const courseApi = new CourseApiClient();
