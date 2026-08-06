import {
  DocumentRecord,
  DocumentQueryParams,
  DocumentListResponse
} from '../types/document';
import { fetchWithAuth } from './httpClient';

class DocumentApiClient {
  public async getDocuments(params: DocumentQueryParams): Promise<DocumentListResponse> {
    const queryParts: string[] = [];
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.documentType) queryParts.push(`documentType=${encodeURIComponent(params.documentType)}`);
    if (params.verificationStatus) queryParts.push(`verificationStatus=${encodeURIComponent(params.verificationStatus)}`);
    if (params.studentId) queryParts.push(`studentId=${encodeURIComponent(params.studentId)}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const res = await fetchWithAuth(`/api/v1/documents${queryString}`);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || errData.message || 'Failed to fetch document records');
    }

    return await res.json();
  }

  public async getDocumentById(id: string): Promise<{ success: boolean; data: DocumentRecord }> {
    const res = await fetchWithAuth(`/api/v1/documents/${id}`);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || errData.message || 'Failed to fetch document details');
    }

    return await res.json();
  }

  public async createDocument(data: Partial<DocumentRecord>): Promise<{ success: boolean; data: DocumentRecord; message: string }> {
    const res = await fetchWithAuth('/api/v1/documents', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || errData.message || 'Failed to upload document');
    }

    return await res.json();
  }

  public async updateDocument(id: string, updates: Partial<DocumentRecord>): Promise<{ success: boolean; data: DocumentRecord; message: string }> {
    const res = await fetchWithAuth(`/api/v1/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || errData.message || 'Failed to update document record');
    }

    return await res.json();
  }

  public async deleteDocument(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetchWithAuth(`/api/v1/documents/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || errData.message || 'Failed to delete document record');
    }

    return await res.json();
  }
}

export const documentApi = new DocumentApiClient();
