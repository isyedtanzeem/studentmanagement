import {
  AdmissionApplication,
  AdmissionQueryParams,
  AdmissionListResponse,
  CreateAdmissionInput,
  VerificationChecklist
} from '../types/admission';
import { Student } from '../types/student';
import { fetchWithAuth } from './httpClient';

class AdmissionApiClient {
  public async getApplications(params: AdmissionQueryParams): Promise<AdmissionListResponse> {
    const queryParts: string[] = [];
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.status) queryParts.push(`status=${encodeURIComponent(params.status)}`);
    if (params.department) queryParts.push(`department=${encodeURIComponent(params.department)}`);
    if (params.category) queryParts.push(`category=${encodeURIComponent(params.category)}`);
    if (params.sortBy) queryParts.push(`sortBy=${params.sortBy}`);
    if (params.sortOrder) queryParts.push(`sortOrder=${params.sortOrder}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

    const response = await fetchWithAuth(`/api/v1/admissions${queryString}`, {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch admission applications.');
    }
    return data;
  }

  public async getApplicationById(id: string): Promise<{ success: boolean; data: AdmissionApplication }> {
    const response = await fetchWithAuth(`/api/v1/admissions/${id}`, {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch admission application details.');
    }
    return data;
  }

  public async createApplication(input: CreateAdmissionInput): Promise<{ success: boolean; data: AdmissionApplication; message: string }> {
    const response = await fetchWithAuth('/api/v1/admissions', {
      method: 'POST',
      body: JSON.stringify(input)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit admission application.');
    }
    return data;
  }

  public async updateStatus(id: string, status: string, remarks?: string): Promise<{ success: boolean; data: AdmissionApplication; message: string }> {
    const response = await fetchWithAuth(`/api/v1/admissions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update admission status.');
    }
    return data;
  }

  public async verifyDocuments(id: string, checklist: Partial<VerificationChecklist>, verifiedBy?: string): Promise<{ success: boolean; data: AdmissionApplication; message: string }> {
    const response = await fetchWithAuth(`/api/v1/admissions/${id}/verify-documents`, {
      method: 'PUT',
      body: JSON.stringify({ checklist, verifiedBy })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update document verification checklist.');
    }
    return data;
  }

  public async approveAndEnroll(id: string, customRollNumber?: string, approvedBy?: string): Promise<{
    success: boolean;
    data: { application: AdmissionApplication; student: Student };
    message: string;
  }> {
    const response = await fetchWithAuth(`/api/v1/admissions/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ customRollNumber, approvedBy })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to approve admission and enroll student.');
    }
    return data;
  }

  public async rejectApplication(id: string, rejectionReason: string, rejectedBy?: string): Promise<{ success: boolean; data: AdmissionApplication; message: string }> {
    const response = await fetchWithAuth(`/api/v1/admissions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason, rejectedBy })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to reject admission application.');
    }
    return data;
  }

  public async generateRollNumber(department: string): Promise<{ success: boolean; rollNumber: string }> {
    const response = await fetchWithAuth(`/api/v1/admissions/generate-rollno?department=${encodeURIComponent(department)}`, {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to generate roll number.');
    }
    return data;
  }
}

export const admissionApi = new AdmissionApiClient();
