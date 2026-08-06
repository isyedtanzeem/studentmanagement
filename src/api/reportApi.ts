import {
  StudentReportData,
  AdmissionReportData,
  DepartmentReportData,
  GenderReportData,
  AlumniReportData,
} from '../types/report';
import { fetchWithAuth } from './httpClient';

export const reportApi = {
  async getStudentReport(filters?: { department?: string; year?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.department) params.append('department', filters.department);
    if (filters?.year) params.append('year', filters.year);
    if (filters?.status) params.append('status', filters.status);

    const res = await fetchWithAuth(`/api/v1/reports/student?${params.toString()}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch student report');
    return data.data as StudentReportData;
  },

  async getAdmissionReport(filters?: { department?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.department) params.append('department', filters.department);
    if (filters?.status) params.append('status', filters.status);

    const res = await fetchWithAuth(`/api/v1/reports/admission?${params.toString()}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch admission report');
    return data.data as AdmissionReportData;
  },

  async getDepartmentReport() {
    const res = await fetchWithAuth('/api/v1/reports/department');
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch department report');
    return data.data as DepartmentReportData;
  },

  async getGenderReport(filters?: { department?: string }) {
    const params = new URLSearchParams();
    if (filters?.department) params.append('department', filters.department);

    const res = await fetchWithAuth(`/api/v1/reports/gender?${params.toString()}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch gender report');
    return data.data as GenderReportData;
  },

  async getAlumniReport(filters?: { department?: string; year?: string }) {
    const params = new URLSearchParams();
    if (filters?.department) params.append('department', filters.department);
    if (filters?.year) params.append('year', filters.year);

    const res = await fetchWithAuth(`/api/v1/reports/alumni?${params.toString()}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch alumni report');
    return data.data as AlumniReportData;
  }
};
