import { AlumniRecord, AlumniAnalyticsReport } from '../types/alumni';
import { fetchWithAuth } from './httpClient';

export interface AlumniFilterParams {
  search?: string;
  graduationYear?: number;
  department?: string;
  employmentStatus?: string;
  industry?: string;
  networkingOptIn?: boolean;
}

export const alumniApi = {
  // Fetch list of alumni with filters
  async getAlumni(filters: AlumniFilterParams = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.graduationYear) params.append('graduationYear', filters.graduationYear.toString());
    if (filters.department) params.append('department', filters.department);
    if (filters.employmentStatus) params.append('employmentStatus', filters.employmentStatus);
    if (filters.industry) params.append('industry', filters.industry);
    if (filters.networkingOptIn !== undefined) params.append('networkingOptIn', filters.networkingOptIn.toString());

    const res = await fetchWithAuth(`/api/v1/alumni?${params.toString()}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch alumni records.');
    }
    return data.data as AlumniRecord[];
  },

  // Fetch reports and analytics
  async getReports() {
    const res = await fetchWithAuth('/api/v1/alumni/reports');
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch alumni reports.');
    }
    return data.data as AlumniAnalyticsReport;
  },

  // Get single alumni details
  async getById(id: string) {
    const res = await fetchWithAuth(`/api/v1/alumni/${id}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch alumni details.');
    }
    return data.data as AlumniRecord;
  },

  // Create alumni
  async createAlumni(payload: Partial<AlumniRecord>) {
    const res = await fetchWithAuth('/api/v1/alumni', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to create alumni profile.');
    }
    return data.data as AlumniRecord;
  },

  // Update alumni
  async updateAlumni(id: string, payload: Partial<AlumniRecord>) {
    const res = await fetchWithAuth(`/api/v1/alumni/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update alumni profile.');
    }
    return data.data as AlumniRecord;
  },

  // Delete alumni
  async deleteAlumni(id: string) {
    const res = await fetchWithAuth(`/api/v1/alumni/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete alumni record.');
    }
    return true;
  },

  // Record donation/giving
  async recordGiving(id: string, giving: { amount: number; currency?: string; purpose: string; date?: string }) {
    const res = await fetchWithAuth(`/api/v1/alumni/${id}/giving`, {
      method: 'POST',
      body: JSON.stringify(giving),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to record contribution.');
    }
    return data.data as AlumniRecord;
  }
};
