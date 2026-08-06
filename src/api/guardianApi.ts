import {
  Guardian,
  GuardianQueryParams,
  GuardianStats,
  GuardianPagination,
  GuardianFormData,
  StudentOption
} from '../types/guardian';
import { fetchWithAuth } from './httpClient';

export interface GuardianListResponse {
  success: boolean;
  data: Guardian[];
  stats: GuardianStats;
  pagination: GuardianPagination;
}

class GuardianApiClient {
  public async getGuardians(params: GuardianQueryParams): Promise<GuardianListResponse> {
    const queryParts: string[] = [];
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.relationship) queryParts.push(`relationship=${encodeURIComponent(params.relationship)}`);
    if (params.status) queryParts.push(`status=${encodeURIComponent(params.status)}`);
    if (params.city) queryParts.push(`city=${encodeURIComponent(params.city)}`);
    if (params.sortBy) queryParts.push(`sortBy=${params.sortBy}`);
    if (params.sortOrder) queryParts.push(`sortOrder=${params.sortOrder}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

    const response = await fetchWithAuth(`/api/v1/guardians${queryString}`, {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to fetch guardian profiles.');
    }
    return data;
  }

  public async getGuardianById(id: string): Promise<{ success: boolean; data: Guardian }> {
    const response = await fetchWithAuth(`/api/v1/guardians/${id}`, {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to fetch guardian profile details.');
    }
    return data;
  }

  public async createGuardian(formData: GuardianFormData): Promise<{ success: boolean; data: Guardian; message: string }> {
    const response = await fetchWithAuth('/api/v1/guardians', {
      method: 'POST',
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to create guardian profile.');
    }
    return data;
  }

  public async updateGuardian(id: string, formData: Partial<GuardianFormData>): Promise<{ success: boolean; data: Guardian; message: string }> {
    const response = await fetchWithAuth(`/api/v1/guardians/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to update guardian profile.');
    }
    return data;
  }

  public async deleteGuardian(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithAuth(`/api/v1/guardians/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to delete guardian profile.');
    }
    return data;
  }

  public async getStudentOptions(): Promise<{ success: boolean; data: StudentOption[] }> {
    const response = await fetchWithAuth('/api/v1/guardians/student-options', {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to load student selection options.');
    }
    return data;
  }
}

export const guardianApi = new GuardianApiClient();
