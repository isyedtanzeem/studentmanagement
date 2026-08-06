import { fetchWithAuth } from './httpClient';

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'Admission' | 'Student' | 'Document' | 'Broadcast' | 'System';
  priority: 'high' | 'medium' | 'low';
  targetAudience: 'All' | 'Students' | 'Faculty' | 'Admissions' | 'Individual';
  recipientEmail?: string;
  recipientName?: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface EmailLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  templateName: string;
  category: 'Admission' | 'Student' | 'Document' | 'Broadcast' | 'System';
  status: 'Sent' | 'Delivered' | 'Failed' | 'Queued';
  sentAt: string;
  bodyPreview: string;
}

export interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  senderName: string;
  senderRole: string;
  targetGroup: 'All Users' | 'All Students' | 'All Faculty' | 'Specific Department' | 'Specific Batch';
  departmentFilter?: string;
  priority: 'high' | 'medium' | 'low';
  sentAt: string;
  totalRecipientsCount: number;
  sendEmailCopy: boolean;
}

export interface NotificationStats {
  totalInApp: number;
  unreadInApp: number;
  totalEmails: number;
  totalBroadcasts: number;
}

class NotificationApiClient {
  public async getInAppNotifications(filters?: { category?: string; priority?: string; unreadOnly?: boolean }): Promise<{
    success: boolean;
    data: InAppNotification[];
    stats: NotificationStats;
  }> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.unreadOnly) params.append('unreadOnly', 'true');

    const url = `/api/v1/notifications${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetchWithAuth(url, { method: 'GET' });
    return await response.json();
  }

  public async markAsRead(id: string): Promise<{ success: boolean; data: InAppNotification }> {
    const response = await fetchWithAuth(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
    return await response.json();
  }

  public async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithAuth('/api/v1/notifications/read-all', { method: 'PATCH' });
    return await response.json();
  }

  public async deleteNotification(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithAuth(`/api/v1/notifications/${id}`, { method: 'DELETE' });
    return await response.json();
  }

  public async clearAll(): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithAuth('/api/v1/notifications/clear-all', { method: 'DELETE' });
    return await response.json();
  }

  public async getStats(): Promise<{ success: boolean; data: NotificationStats }> {
    const response = await fetchWithAuth('/api/v1/notifications/stats', { method: 'GET' });
    return await response.json();
  }

  public async sendBroadcast(payload: {
    title: string;
    message: string;
    senderName?: string;
    senderRole?: string;
    targetGroup: 'All Users' | 'All Students' | 'All Faculty' | 'Specific Department' | 'Specific Batch';
    departmentFilter?: string;
    priority: 'high' | 'medium' | 'low';
    sendEmailCopy?: boolean;
  }): Promise<{ success: boolean; data: BroadcastMessage; message: string }> {
    const response = await fetchWithAuth('/api/v1/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return await response.json();
  }

  public async getBroadcasts(): Promise<{ success: boolean; data: BroadcastMessage[] }> {
    const response = await fetchWithAuth('/api/v1/notifications/broadcasts', { method: 'GET' });
    return await response.json();
  }

  public async triggerAdmissionAlert(payload: {
    alertType: 'NEW_APPLICATION' | 'UNDER_REVIEW' | 'DOCUMENT_REQUIRED' | 'OFFER_SENT' | 'FEE_REMINDER';
    applicantName: string;
    email: string;
    department: string;
    applicationId?: string;
    customMessage?: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithAuth('/api/v1/notifications/trigger/admission', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return await response.json();
  }

  public async triggerStudentAlert(payload: {
    alertType: 'LOW_ATTENDANCE' | 'FEE_DUE' | 'PROBATION_WARNING' | 'REGISTRATION_OPEN' | 'DISCIPLINARY';
    studentId: string;
    fullName: string;
    email: string;
    department?: string;
    attendance?: number;
    gpa?: number;
    amountDue?: number;
    customNote?: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithAuth('/api/v1/notifications/trigger/student', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return await response.json();
  }

  public async triggerDocumentAlert(payload: {
    alertType: 'VERIFICATION_PENDING' | 'IDCARD_READY' | 'REJECTED_REUPLOAD' | 'IDCARD_EXPIRY';
    studentId: string;
    studentName: string;
    email: string;
    documentType?: string;
    reason?: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithAuth('/api/v1/notifications/trigger/document', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return await response.json();
  }

  public async getEmailLogs(category?: string): Promise<{ success: boolean; data: EmailLog[] }> {
    const url = `/api/v1/notifications/email-logs${category ? `?category=${category}` : ''}`;
    const response = await fetchWithAuth(url, { method: 'GET' });
    return await response.json();
  }

  public async sendCustomEmail(payload: {
    recipientEmail: string;
    recipientName?: string;
    subject: string;
    templateName?: string;
    messageBody: string;
    category?: 'Admission' | 'Student' | 'Document' | 'Broadcast' | 'System';
  }): Promise<{ success: boolean; data: EmailLog; message: string }> {
    const response = await fetchWithAuth('/api/v1/notifications/send-email', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return await response.json();
  }
}

export const notificationApi = new NotificationApiClient();
