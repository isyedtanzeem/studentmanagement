import { dbStore, DocumentRecord, RecentActivityRecord } from '../config/db';

export interface DocumentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  documentType?: string;
  verificationStatus?: string;
  studentId?: string;
}

export class DocumentService {
  public async getDocuments(params: DocumentQueryParams) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const search = (params.search || '').toLowerCase().trim();
    const documentType = params.documentType;
    const verificationStatus = params.verificationStatus;
    const studentId = params.studentId;

    let allDocs = Array.from(dbStore.documents.values());

    // Filter by studentId
    if (studentId) {
      allDocs = allDocs.filter(d => d.studentId === studentId);
    }

    // Filter by document type
    if (documentType && documentType !== 'ALL') {
      allDocs = allDocs.filter(d => d.documentType === documentType);
    }

    // Filter by verification status
    if (verificationStatus && verificationStatus !== 'ALL') {
      allDocs = allDocs.filter(d => d.verificationStatus === verificationStatus);
    }

    // Filter by search query
    if (search) {
      allDocs = allDocs.filter(
        d =>
          d.title.toLowerCase().includes(search) ||
          d.studentName.toLowerCase().includes(search) ||
          d.studentRollNo.toLowerCase().includes(search) ||
          d.documentId.toLowerCase().includes(search) ||
          d.fileName.toLowerCase().includes(search)
      );
    }

    // Sort newest upload first
    allDocs.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

    // Calculate Stats
    const total = allDocs.length;
    const verified = allDocs.filter(d => d.verificationStatus === 'Verified').length;
    const pending = allDocs.filter(d => d.verificationStatus === 'Pending Verification').length;
    const rejected = allDocs.filter(d => d.verificationStatus === 'Rejected').length;
    const reuploadRequested = allDocs.filter(d => d.verificationStatus === 'Re-upload Requested').length;

    const uniqueStudents = new Set(allDocs.map(d => d.studentId)).size;

    // Type Breakdown counts
    const typeBreakdown = {
      Aadhaar: allDocs.filter(d => d.documentType === 'Aadhaar').length,
      BirthCertificate: allDocs.filter(d => d.documentType === 'Birth Certificate').length,
      TransferCertificate: allDocs.filter(d => d.documentType === 'Transfer Certificate').length,
      MarksCards: allDocs.filter(d => d.documentType === 'Marks Cards').length,
      PassportPhoto: allDocs.filter(d => d.documentType === 'Passport Photo').length,
      Other: allDocs.filter(d => d.documentType === 'Other').length
    };

    // Pagination
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedDocs = allDocs.slice(startIndex, startIndex + limit);

    return {
      documents: paginatedDocs,
      stats: {
        total,
        verified,
        pending,
        rejected,
        reuploadRequested,
        uniqueStudents,
        typeBreakdown
      },
      pagination: {
        page,
        limit,
        totalPages,
        totalItems: total
      }
    };
  }

  public async getDocumentById(id: string): Promise<DocumentRecord | null> {
    return dbStore.documents.get(id) || null;
  }

  public async createDocument(data: Partial<DocumentRecord>, actorName = 'System Admin'): Promise<DocumentRecord> {
    if (!data.studentName || !data.documentType || !data.title) {
      throw new Error('Student name, document type, and title are required fields.');
    }

    const nextNumber = dbStore.documents.size + 1;
    const generatedId = `doc-${Date.now()}`;
    const generatedDocId = `DOC-2026-${String(nextNumber).padStart(3, '0')}`;

    const newDoc: DocumentRecord = {
      id: generatedId,
      documentId: generatedDocId,
      studentId: data.studentId || 'std-1',
      studentRollNo: data.studentRollNo || '2023CSE014',
      studentName: data.studentName,
      documentType: data.documentType as any,
      title: data.title,
      fileName: data.fileName || `${data.documentType.replace(/\s+/g, '_')}_${data.studentName.replace(/\s+/g, '_')}.pdf`,
      fileType: data.fileType || 'application/pdf',
      fileSize: data.fileSize || '1.2 MB',
      fileUrl: data.fileUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      verificationStatus: data.verificationStatus || 'Pending Verification',
      verifiedBy: data.verificationStatus === 'Verified' ? actorName : undefined,
      verificationDate: data.verificationStatus === 'Verified' ? new Date().toISOString() : undefined,
      remarks: data.remarks || '',
      uploadDate: new Date().toISOString()
    };

    dbStore.documents.set(newDoc.id, newDoc);

    // Record system activity
    const activity: RecentActivityRecord = {
      id: `act-${Date.now()}`,
      title: `New Document Uploaded (${newDoc.documentType})`,
      description: `Uploaded '${newDoc.title}' for student ${newDoc.studentName} (${newDoc.studentRollNo}).`,
      category: 'Admission',
      actorName,
      actorRole: 'System Admin',
      timestamp: new Date().toISOString(),
      badgeType: 'info'
    };
    dbStore.activities.unshift(activity);

    return newDoc;
  }

  public async updateDocument(id: string, updates: Partial<DocumentRecord>, actorName = 'System Admin'): Promise<DocumentRecord> {
    const existing = dbStore.documents.get(id);
    if (!existing) {
      throw new Error('Document record not found.');
    }

    const updated: DocumentRecord = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updates.verificationStatus === 'Verified' && existing.verificationStatus !== 'Verified') {
      updated.verifiedBy = actorName;
      updated.verificationDate = new Date().toISOString();
    }

    dbStore.documents.set(id, updated);

    // Log activity
    const activity: RecentActivityRecord = {
      id: `act-${Date.now()}`,
      title: `Document Record Updated (${updated.documentId})`,
      description: `Updated status to '${updated.verificationStatus}' for student ${updated.studentName}.`,
      category: 'Admission',
      actorName,
      actorRole: 'Registrar',
      timestamp: new Date().toISOString(),
      badgeType: 'warning'
    };
    dbStore.activities.unshift(activity);

    return updated;
  }

  public async deleteDocument(id: string, actorName = 'System Admin'): Promise<boolean> {
    const existing = dbStore.documents.get(id);
    if (!existing) {
      throw new Error('Document record not found.');
    }

    dbStore.documents.delete(id);

    // Activity log
    const activity: RecentActivityRecord = {
      id: `act-${Date.now()}`,
      title: `Document Record Purged (${existing.documentId})`,
      description: `Deleted document '${existing.title}' belonging to ${existing.studentName}.`,
      category: 'System',
      actorName,
      actorRole: 'Super Admin',
      timestamp: new Date().toISOString(),
      badgeType: 'danger'
    };
    dbStore.activities.unshift(activity);

    return true;
  }
}

export const documentService = new DocumentService();
