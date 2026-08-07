import {
  Faculty,
  FacultyQueryParams,
  FacultyListResponse
} from '../types/faculty';
import { fetchWithAuth } from './httpClient';

class FacultyApiClient {
  public async getFacultyList(params: FacultyQueryParams): Promise<FacultyListResponse> {
    const queryParts: string[] = [];
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.department) queryParts.push(`department=${encodeURIComponent(params.department)}`);
    if (params.designation) queryParts.push(`designation=${encodeURIComponent(params.designation)}`);
    if (params.status) queryParts.push(`status=${encodeURIComponent(params.status)}`);
    if (params.sortBy) queryParts.push(`sortBy=${params.sortBy}`);
    if (params.sortOrder) queryParts.push(`sortOrder=${params.sortOrder}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

    const response = await fetchWithAuth(`/api/v1/faculty${queryString}`, {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to fetch faculty list.');
    }

    return data;
  }

  public async getFacultyById(id: string): Promise<{ success: boolean; data: Faculty }> {
    const response = await fetchWithAuth(`/api/v1/faculty/${id}`, {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to fetch faculty member.');
    }

    return data;
  }

  public async createFaculty(payload: Partial<Faculty>): Promise<{ success: boolean; message: string; data: Faculty }> {
    const response = await fetchWithAuth('/api/v1/faculty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to register faculty member.');
    }

    return data;
  }

  public async updateFaculty(id: string, payload: Partial<Faculty>): Promise<{ success: boolean; message: string; data: Faculty }> {
    const response = await fetchWithAuth(`/api/v1/faculty/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to update faculty member.');
    }

    return data;
  }

  public async deleteFaculty(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithAuth(`/api/v1/faculty/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to delete faculty member.');
    }

    return data;
  }
}

export const facultyApi = new FacultyApiClient();
