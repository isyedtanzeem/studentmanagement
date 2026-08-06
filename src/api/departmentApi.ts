import {
  Department,
  DepartmentQueryParams,
  DepartmentListResponse,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  FacultyOption
} from '../types/department';
import { fetchWithAuth } from './httpClient';

class DepartmentApiClient {
  public async getDepartments(params: DepartmentQueryParams): Promise<DepartmentListResponse> {
    const queryParts: string[] = [];
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.status) queryParts.push(`status=${encodeURIComponent(params.status)}`);
    if (params.sortBy) queryParts.push(`sortBy=${params.sortBy}`);
    if (params.sortOrder) queryParts.push(`sortOrder=${params.sortOrder}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

    const response = await fetchWithAuth(`/api/v1/departments${queryString}`, {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to fetch departments.');
    }
    return data;
  }

  public async getDepartmentById(id: string): Promise<{ success: boolean; data: Department & { coursesList?: any[]; facultyList?: any[] } }> {
    const response = await fetchWithAuth(`/api/v1/departments/${id}`, {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to fetch department details.');
    }
    return data;
  }

  public async createDepartment(input: CreateDepartmentDto): Promise<{ success: boolean; data: Department; message: string }> {
    const response = await fetchWithAuth('/api/v1/departments', {
      method: 'POST',
      body: JSON.stringify(input)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to create department.');
    }
    return data;
  }

  public async updateDepartment(id: string, input: UpdateDepartmentDto): Promise<{ success: boolean; data: Department; message: string }> {
    const response = await fetchWithAuth(`/api/v1/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to update department.');
    }
    return data;
  }

  public async deleteDepartment(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithAuth(`/api/v1/departments/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to delete department.');
    }
    return data;
  }

  public async getFacultyOptions(): Promise<{ success: boolean; data: FacultyOption[] }> {
    const response = await fetchWithAuth('/api/v1/departments/faculty-options', {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to fetch faculty options.');
    }
    return data;
  }
}

export const departmentApi = new DepartmentApiClient();
