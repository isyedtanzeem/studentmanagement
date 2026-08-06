import {
  IdCardRecord,
  IdCardQueryParams,
  IdCardStats,
  CollegeBrandingConfig,
  GenerateCardPayload
} from '../types/idCard';
import { fetchWithAuth } from './httpClient';

export interface IdCardListResponse {
  success: boolean;
  data: IdCardRecord[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  stats: IdCardStats;
  branding: CollegeBrandingConfig;
}

class IdCardApiClient {
  public async getIdCards(params: IdCardQueryParams): Promise<IdCardListResponse> {
    const queryParts: string[] = [];
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.department) queryParts.push(`department=${encodeURIComponent(params.department)}`);
    if (params.status) queryParts.push(`status=${encodeURIComponent(params.status)}`);
    if (params.layoutTemplate) queryParts.push(`layoutTemplate=${encodeURIComponent(params.layoutTemplate)}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const res = await fetchWithAuth(`/api/v1/idcards${queryString}`);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch student ID cards.');
    }

    return await res.json();
  }

  public async getIdCardById(id: string): Promise<{ success: boolean; data: IdCardRecord }> {
    const res = await fetchWithAuth(`/api/v1/idcards/${id}`);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch ID card record.');
    }

    return await res.json();
  }

  public async generateCard(payload: GenerateCardPayload): Promise<{ success: boolean; data: IdCardRecord; message: string }> {
    const res = await fetchWithAuth('/api/v1/idcards/generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to generate ID card.');
    }

    return await res.json();
  }

  public async batchGenerateCards(studentDbIds: string[], layoutTemplate: string): Promise<{ success: boolean; data: { generatedCount: number }; message: string }> {
    const res = await fetchWithAuth('/api/v1/idcards/batch-generate', {
      method: 'POST',
      body: JSON.stringify({ studentDbIds, layoutTemplate })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to execute batch ID card generation.');
    }

    return await res.json();
  }

  public async updateCard(id: string, updates: Partial<IdCardRecord>): Promise<{ success: boolean; data: IdCardRecord; message: string }> {
    const res = await fetchWithAuth(`/api/v1/idcards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to update ID card profile.');
    }

    return await res.json();
  }

  public async revokeCard(id: string, reason: string): Promise<{ success: boolean; data: IdCardRecord; message: string }> {
    const res = await fetchWithAuth(`/api/v1/idcards/${id}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to revoke ID card.');
    }

    return await res.json();
  }

  public async recordPrint(id: string): Promise<{ success: boolean; data: IdCardRecord }> {
    const res = await fetchWithAuth(`/api/v1/idcards/${id}/record-print`, {
      method: 'POST'
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to record print action.');
    }

    return await res.json();
  }

  public async getBranding(): Promise<{ success: boolean; data: CollegeBrandingConfig }> {
    const res = await fetchWithAuth('/api/v1/idcards/branding');

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch college branding config.');
    }

    return await res.json();
  }

  public async updateBranding(data: Partial<CollegeBrandingConfig>): Promise<{ success: boolean; data: CollegeBrandingConfig; message: string }> {
    const res = await fetchWithAuth('/api/v1/idcards/branding', {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to update college branding.');
    }

    return await res.json();
  }
}

export const idCardApi = new IdCardApiClient();
