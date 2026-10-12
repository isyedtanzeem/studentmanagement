import { dbStore } from '../config/db';

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

export class NotificationService {
  private static emailLogsStore: EmailLog[] = [];
  private static broadcastStore: BroadcastMessage[] = [];
  private static inAppStore: InAppNotification[] = [];

  private static isSeeded = false;

  public static seedDataIfEmpty() {
    // Clean data mode: No mock seeding. Start with clean data stores.
  }

  // --- 1. In-App Notifications ---
  public static getInAppNotifications(filters?: { category?: string; priority?: string; unreadOnly?: boolean }) {
    this.seedDataIfEmpty();
    let result = [...this.inAppStore];

    if (filters?.category && filters.category !== 'ALL') {
      result = result.filter(n => n.type.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters?.priority && filters.priority !== 'ALL') {
      result = result.filter(n => n.priority === filters.priority);
    }
    if (filters?.unreadOnly) {
      result = result.filter(n => !n.read);
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static markAsRead(id: string) {
    this.seedDataIfEmpty();
    const item = this.inAppStore.find(n => n.id === id);
    if (item) {
      item.read = true;
    }
    return item;
  }

  public static markAllAsRead() {
    this.seedDataIfEmpty();
    this.inAppStore.forEach(n => {
      n.read = true;
    });
    return { success: true, count: this.inAppStore.length };
  }

  public static deleteNotification(id: string) {
    this.seedDataIfEmpty();
    this.inAppStore = this.inAppStore.filter(n => n.id !== id);
    return { success: true };
  }

  public static clearAllNotifications() {
    this.seedDataIfEmpty();
    this.inAppStore = [];
    return { success: true };
  }

  // --- 2. Broadcast Dispatcher ---
  public static sendBroadcastMessage(data: {
    title: string;
    message: string;
    senderName?: string;
    senderRole?: string;
    targetGroup: 'All Users' | 'All Students' | 'All Faculty' | 'Specific Department' | 'Specific Batch';
    departmentFilter?: string;
    priority: 'high' | 'medium' | 'low';
    sendEmailCopy?: boolean;
  }) {
    this.seedDataIfEmpty();

    const recipientCount = data.targetGroup === 'All Users' ? 450 : data.targetGroup === 'All Students' ? 380 : 70;

    const broadcast: BroadcastMessage = {
      id: `bc-${Date.now()}`,
      title: data.title,
      message: data.message,
      senderName: data.senderName || 'Admin Registrar',
      senderRole: data.senderRole || 'Office of Academic Affairs',
      targetGroup: data.targetGroup,
      departmentFilter: data.departmentFilter,
      priority: data.priority,
      sentAt: new Date().toISOString(),
      totalRecipientsCount: recipientCount,
      sendEmailCopy: !!data.sendEmailCopy
    };

    this.broadcastStore.unshift(broadcast);

    // Create corresponding In-App Notification
    const inApp: InAppNotification = {
      id: `notif-bc-${Date.now()}`,
      title: `[BROADCAST] ${data.title}`,
      message: data.message,
      type: 'Broadcast',
      priority: data.priority,
      targetAudience: data.targetGroup === 'All Students' ? 'Students' : data.targetGroup === 'All Faculty' ? 'Faculty' : 'All',
      read: false,
      createdAt: new Date().toISOString()
    };
    this.inAppStore.unshift(inApp);

    // If email copy requested, add to email logs
    if (data.sendEmailCopy) {
      const emailLog: EmailLog = {
        id: `email-bc-${Date.now()}`,
        recipientEmail: 'all-campus-users@scholarcore.edu',
        recipientName: data.targetGroup,
        subject: `[ScholarCore Broadcast] ${data.title}`,
        templateName: 'Campus Wide Broadcast',
        category: 'Broadcast',
        status: 'Delivered',
        sentAt: new Date().toISOString(),
        bodyPreview: data.message.substring(0, 120) + '...'
      };
      this.emailLogsStore.unshift(emailLog);
    }

    return broadcast;
  }

  public static getBroadcasts() {
    this.seedDataIfEmpty();
    return [...this.broadcastStore].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  // --- 3. Targeted Alert Triggers ---
  public static triggerAdmissionAlert(
    alertType: 'NEW_APPLICATION' | 'UNDER_REVIEW' | 'DOCUMENT_REQUIRED' | 'OFFER_SENT' | 'FEE_REMINDER',
    data: {
      applicantName: string;
      email: string;
      department: string;
      applicationId?: string;
      customMessage?: string;
    }
  ) {
    this.seedDataIfEmpty();

    let title = '';
    let message = '';
    let priority: 'high' | 'medium' | 'low' = 'medium';

    switch (alertType) {
      case 'NEW_APPLICATION':
        title = 'New Admission Application Received';
        message = `Application ${data.applicationId || 'ADM2026-NEW'} submitted by ${data.applicantName} for ${data.department}.`;
        priority = 'medium';
        break;
      case 'UNDER_REVIEW':
        title = 'Application Under Review';
        message = `Admission file for ${data.applicantName} (${data.department}) moved to Academic Board Review.`;
        priority = 'low';
        break;
      case 'DOCUMENT_REQUIRED':
        title = 'Action Required: Documents Missing';
        message = `Attention ${data.applicantName}: Class XII mark sheet and Migration Certificate are required to process admission.`;
        priority = 'high';
        break;
      case 'OFFER_SENT':
        title = 'Admission Offer Letter Dispatched';
        message = `Provisional Admission Offer Letter issued to ${data.applicantName} for ${data.department}.`;
        priority = 'high';
        break;
      case 'FEE_REMINDER':
        title = 'Admission Confirmation Fee Payment Reminder';
        message = `Seat booking fee payment deadline is approaching for ${data.applicantName}.`;
        priority = 'high';
        break;
    }

    if (data.customMessage) {
      message = data.customMessage;
    }

    // Add to in-app
    const inApp: InAppNotification = {
      id: `notif-adm-${Date.now()}`,
      title,
      message,
      type: 'Admission',
      priority,
      targetAudience: 'Admissions',
      recipientEmail: data.email,
      recipientName: data.applicantName,
      read: false,
      actionUrl: '/dashboard/admissions',
      createdAt: new Date().toISOString()
    };
    this.inAppStore.unshift(inApp);

    // Add to email log
    const emailLog: EmailLog = {
      id: `email-adm-${Date.now()}`,
      recipientEmail: data.email,
      recipientName: data.applicantName,
      subject: `ScholarCore Admission Update: ${title}`,
      templateName: `Admission Alert - ${alertType}`,
      category: 'Admission',
      status: 'Delivered',
      sentAt: new Date().toISOString(),
      bodyPreview: message
    };
    this.emailLogsStore.unshift(emailLog);

    return { inApp, emailLog };
  }

  public static triggerStudentAlert(
    alertType: 'LOW_ATTENDANCE' | 'FEE_DUE' | 'PROBATION_WARNING' | 'REGISTRATION_OPEN' | 'DISCIPLINARY',
    data: {
      studentId: string;
      fullName: string;
      email: string;
      department: string;
      attendance?: number;
      gpa?: number;
      amountDue?: number;
      customNote?: string;
    }
  ) {
    this.seedDataIfEmpty();

    let title = '';
    let message = '';
    let priority: 'high' | 'medium' | 'low' = 'medium';

    switch (alertType) {
      case 'LOW_ATTENDANCE':
        title = `Low Attendance Alert (${data.attendance || 68}%)`;
        message = `Student ${data.fullName} (${data.studentId}) attendance has dropped to ${data.attendance || 68}%. Minimum 75% required for exam hall ticket.`;
        priority = 'high';
        break;
      case 'FEE_DUE':
        title = `Tuition Fee Dues Alert (₹${(data.amountDue || 45000).toLocaleString()})`;
        message = `Pending fee balance of ₹${(data.amountDue || 45000).toLocaleString()} recorded for ${data.fullName} (${data.studentId}).`;
        priority = 'high';
        break;
      case 'PROBATION_WARNING':
        title = `Academic Probation Warning (CGPA: ${data.gpa || 4.2})`;
        message = `Student ${data.fullName} (${data.studentId}) is placed on Academic Probation due to CGPA falling below academic threshold.`;
        priority = 'high';
        break;
      case 'REGISTRATION_OPEN':
        title = 'Next Semester Course Registration Open';
        message = `Course registration for next semester is now active for ${data.fullName} (${data.department}).`;
        priority = 'medium';
        break;
      case 'DISCIPLINARY':
        title = 'Disciplinary Clearance Warning';
        message = `Disciplinary notice logged for ${data.fullName} (${data.studentId}). Please contact Proctorial Board.`;
        priority = 'high';
        break;
    }

    if (data.customNote) {
      message += ` Note: ${data.customNote}`;
    }

    const inApp: InAppNotification = {
      id: `notif-stu-${Date.now()}`,
      title,
      message,
      type: 'Student',
      priority,
      targetAudience: 'Individual',
      recipientEmail: data.email,
      recipientName: data.fullName,
      read: false,
      actionUrl: '/dashboard/students',
      createdAt: new Date().toISOString()
    };
    this.inAppStore.unshift(inApp);

    const emailLog: EmailLog = {
      id: `email-stu-${Date.now()}`,
      recipientEmail: data.email,
      recipientName: data.fullName,
      subject: `ScholarCore Academic Alert: ${title}`,
      templateName: `Student Notification - ${alertType}`,
      category: 'Student',
      status: 'Sent',
      sentAt: new Date().toISOString(),
      bodyPreview: message
    };
    this.emailLogsStore.unshift(emailLog);

    return { inApp, emailLog };
  }

  public static triggerDocumentAlert(
    alertType: 'VERIFICATION_PENDING' | 'IDCARD_READY' | 'REJECTED_REUPLOAD' | 'IDCARD_EXPIRY',
    data: {
      studentId: string;
      studentName: string;
      email: string;
      documentType?: string;
      reason?: string;
    }
  ) {
    this.seedDataIfEmpty();

    let title = '';
    let message = '';
    let priority: 'high' | 'medium' | 'low' = 'medium';

    switch (alertType) {
      case 'VERIFICATION_PENDING':
        title = `Document Verification Pending (${data.documentType || 'Mark Sheet'})`;
        message = `Submitted document '${data.documentType || 'Degree Certificate'}' for ${data.studentName} (${data.studentId}) is pending approval.`;
        priority = 'medium';
        break;
      case 'IDCARD_READY':
        title = 'Smart ID Card Ready for Collection';
        message = `RFID Student ID card for ${data.studentName} (${data.studentId}) is printed and ready at Registrar Counter.`;
        priority = 'medium';
        break;
      case 'REJECTED_REUPLOAD':
        title = `Document Verification Rejected: ${data.documentType || 'Identity Proof'}`;
        message = `Uploaded document was rejected. Reason: ${data.reason || 'Blurry scan / unreadable image'}. Please re-upload.`;
        priority = 'high';
        break;
      case 'IDCARD_EXPIRY':
        title = 'Student ID Card Expiring Soon';
        message = `Student ID Card for ${data.studentName} expires at the end of this academic session. Re-issuance required.`;
        priority = 'low';
        break;
    }

    const inApp: InAppNotification = {
      id: `notif-doc-${Date.now()}`,
      title,
      message,
      type: 'Document',
      priority,
      targetAudience: 'Individual',
      recipientEmail: data.email,
      recipientName: data.studentName,
      read: false,
      actionUrl: '/dashboard/documents',
      createdAt: new Date().toISOString()
    };
    this.inAppStore.unshift(inApp);

    const emailLog: EmailLog = {
      id: `email-doc-${Date.now()}`,
      recipientEmail: data.email,
      recipientName: data.studentName,
      subject: `ScholarCore Document Services: ${title}`,
      templateName: `Document Service - ${alertType}`,
      category: 'Document',
      status: 'Delivered',
      sentAt: new Date().toISOString(),
      bodyPreview: message
    };
    this.emailLogsStore.unshift(emailLog);

    return { inApp, emailLog };
  }

  // --- 4. Email Dispatch Logs & Direct Email ---
  public static getEmailLogs(categoryFilter?: string) {
    this.seedDataIfEmpty();
    let logs = [...this.emailLogsStore];
    if (categoryFilter && categoryFilter !== 'ALL') {
      logs = logs.filter(l => l.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    return logs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  public static sendCustomEmail(data: {
    recipientEmail: string;
    recipientName: string;
    subject: string;
    templateName: string;
    messageBody: string;
    category?: 'Admission' | 'Student' | 'Document' | 'Broadcast' | 'System';
  }) {
    this.seedDataIfEmpty();

    const emailLog: EmailLog = {
      id: `email-custom-${Date.now()}`,
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      subject: data.subject,
      templateName: data.templateName || 'Custom Manual Email',
      category: data.category || 'System',
      status: 'Sent',
      sentAt: new Date().toISOString(),
      bodyPreview: data.messageBody.substring(0, 150) + '...'
    };

    this.emailLogsStore.unshift(emailLog);

    // Also push to in-app if it matches a campus user
    const inApp: InAppNotification = {
      id: `notif-custom-${Date.now()}`,
      title: data.subject,
      message: data.messageBody,
      type: data.category || 'System',
      priority: 'medium',
      targetAudience: 'Individual',
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.inAppStore.unshift(inApp);

    return emailLog;
  }

  // --- 5. Notification Stats ---
  public static getStats() {
    this.seedDataIfEmpty();

    const totalInApp = this.inAppStore.length;
    const unreadInApp = this.inAppStore.filter(n => !n.read).length;
    const totalEmails = this.emailLogsStore.length;
    const totalBroadcasts = this.broadcastStore.length;

    return {
      totalInApp,
      unreadInApp,
      totalEmails,
      totalBroadcasts
    };
  }
}
