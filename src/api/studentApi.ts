import {
  Student,
  StudentQueryParams,
  StudentListResponse,
  BulkImportResult
} from '../types/student';
import { fetchWithAuth } from './httpClient';

class StudentApiClient {
  public async getStudents(params: StudentQueryParams): Promise<StudentListResponse> {
    const queryParts: string[] = [];
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.department) queryParts.push(`department=${encodeURIComponent(params.department)}`);
    if (params.status) queryParts.push(`status=${encodeURIComponent(params.status)}`);
    if (params.gender) queryParts.push(`gender=${encodeURIComponent(params.gender)}`);
    if (params.enrollmentYear) queryParts.push(`enrollmentYear=${params.enrollmentYear}`);
    if (params.sortBy) queryParts.push(`sortBy=${params.sortBy}`);
    if (params.sortOrder) queryParts.push(`sortOrder=${params.sortOrder}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

    const response = await fetchWithAuth(`/api/v1/students${queryString}`, {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch students list.');
    }
    return data;
  }

  public async getStudentById(id: string): Promise<{ success: boolean; data: Student }> {
    const response = await fetchWithAuth(`/api/v1/students/${id}`, {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch student details.');
    }
    return data;
  }

  public async createStudent(studentData: Partial<Student>): Promise<{ success: boolean; data: Student; message: string }> {
    const response = await fetchWithAuth('/api/v1/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create student.');
    }
    return data;
  }

  public async updateStudent(id: string, studentData: Partial<Student>): Promise<{ success: boolean; data: Student; message: string }> {
    const response = await fetchWithAuth(`/api/v1/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update student profile.');
    }
    return data;
  }

  public async deleteStudent(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithAuth(`/api/v1/students/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete student record.');
    }
    return data;
  }

  public async bulkImport(students: Partial<Student>[]): Promise<{ success: boolean; data: BulkImportResult; message: string }> {
    const response = await fetchWithAuth('/api/v1/students/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ students })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Bulk import failed.');
    }
    return data;
  }

  public async exportCSV(): Promise<string> {
    const response = await fetchWithAuth('/api/v1/students/export/csv', {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error('Failed to export students CSV.');
    }
    return await response.text();
  }

  public async getMyPortalData(): Promise<{ success: boolean; data: any }> {
    const response = await fetchWithAuth('/api/v1/students/my-portal', {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch student portal data.');
    }
    return data;
  }
}

export const studentApi = new StudentApiClient();
