import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  Megaphone,
  UserCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Trash2,
  Filter,
  RefreshCw,
  Send,
  PlusCircle,
  Eye,
  Search,
  ShieldAlert,
  Clock,
  Sparkles,
  Inbox,
  SendHorizontal
} from 'lucide-react';
import {
  notificationApi,
  InAppNotification,
  EmailLog,
  BroadcastMessage,
  NotificationStats
} from '../../api/notificationApi';

export const NotificationManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'inapp' | 'emails' | 'broadcasts' | 'admission_alerts' | 'student_alerts' | 'doc_alerts'
  >('inapp');

  const [loading, setLoading] = useState(true);
  const [inAppNotifs, setInAppNotifs] = useState<InAppNotification[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    totalInApp: 0,
    unreadInApp: 0,
    totalEmails: 0,
    totalBroadcasts: 0
  });

  // Filters for In-App Feed
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast / Feedback message
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals / Form States
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Broadcast Form
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    targetGroup: 'All Users' as 'All Users' | 'All Students' | 'All Faculty' | 'Specific Department' | 'Specific Batch',
    departmentFilter: 'Computer Science & Engineering',
    priority: 'high' as 'high' | 'medium' | 'low',
    sendEmailCopy: true,
    senderName: 'Office of Registrar',
    senderRole: 'Academic Administrator'
  });

  // Direct Email Form
  const [emailForm, setEmailForm] = useState({
    recipientEmail: '',
    recipientName: '',
    subject: '',
    templateName: 'Custom Direct Email',
    messageBody: '',
    category: 'System' as 'Admission' | 'Student' | 'Document' | 'Broadcast' | 'System'
  });

  // Admission Alert Trigger Form
  const [admAlertForm, setAdmAlertForm] = useState({
    alertType: 'NEW_APPLICATION' as 'NEW_APPLICATION' | 'UNDER_REVIEW' | 'DOCUMENT_REQUIRED' | 'OFFER_SENT' | 'FEE_REMINDER',
    applicantName: 'Vikramaditya Sen',
    email: 'vikram.sen@gmail.com',
    department: 'Computer Science & Engineering',
    applicationId: 'ADM-2026-8812',
    customMessage: ''
  });

  // Student Alert Trigger Form
  const [stuAlertForm, setStuAlertForm] = useState({
    alertType: 'LOW_ATTENDANCE' as 'LOW_ATTENDANCE' | 'FEE_DUE' | 'PROBATION_WARNING' | 'REGISTRATION_OPEN' | 'DISCIPLINARY',
    studentId: 'CS2024018',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@scholarcore.edu',
    department: 'Computer Science & Engineering',
    attendance: 64.5,
    gpa: 4.8,
    amountDue: 55000,
    customNote: ''
  });

  // Document Alert Trigger Form
  const [docAlertForm, setDocAlertForm] = useState({
    alertType: 'VERIFICATION_PENDING' as 'VERIFICATION_PENDING' | 'IDCARD_READY' | 'REJECTED_REUPLOAD' | 'IDCARD_EXPIRY',
    studentId: 'EC2024009',
    studentName: 'Rahul Deshmukh',
    email: 'rahul.d@scholarcore.edu',
    documentType: '12th Standard Marksheet',
    reason: 'Image is partially truncated and illegible'
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [notifsRes, emailRes, bcRes] = await Promise.all([
        notificationApi.getInAppNotifications({
          category: categoryFilter,
          priority: priorityFilter,
          unreadOnly
        }),
        notificationApi.getEmailLogs(),
        notificationApi.getBroadcasts()
      ]);

      if (notifsRes.success) {
        setInAppNotifs(notifsRes.data);
        if (notifsRes.stats) setStats(notifsRes.stats);
      }
      if (emailRes.success) {
        setEmailLogs(emailRes.data);
      }
      if (bcRes.success) {
        setBroadcasts(bcRes.data);
      }
    } catch (err) {
      console.error('Error fetching notification data', err);
      showToast('Failed to load notification module data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter, priorityFilter, unreadOnly]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await notificationApi.markAsRead(id);
      if (res.success) {
        setInAppNotifs(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
        setStats(prev => ({ ...prev, unreadInApp: Math.max(0, prev.unreadInApp - 1) }));
        showToast('Marked as read');
      }
    } catch {
      showToast('Error marking notification read', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await notificationApi.markAllAsRead();
      if (res.success) {
        setInAppNotifs(prev => prev.map(n => ({ ...n, read: true })));
        setStats(prev => ({ ...prev, unreadInApp: 0 }));
        showToast('All notifications marked as read');
      }
    } catch {
      showToast('Error marking all as read', 'error');
    }
  };

  const handleDeleteNotif = async (id: string) => {
    try {
      const res = await notificationApi.deleteNotification(id);
      if (res.success) {
        setInAppNotifs(prev => prev.filter(n => n.id !== id));
        showToast('Notification deleted');
      }
    } catch {
      showToast('Error deleting notification', 'error');
    }
  };

  const handleClearAllNotifs = async () => {
    if (!window.confirm('Are you sure you want to clear all in-app notifications?')) return;
    try {
      const res = await notificationApi.clearAll();
      if (res.success) {
        setInAppNotifs([]);
        setStats(prev => ({ ...prev, unreadInApp: 0, totalInApp: 0 }));
        showToast('In-App notifications cleared');
      }
    } catch {
      showToast('Error clearing notifications', 'error');
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
      showToast('Please fill in broadcast title and message', 'error');
      return;
    }
    try {
      const res = await notificationApi.sendBroadcast(broadcastForm);
      if (res.success) {
        showToast(res.message || 'Broadcast sent successfully!');
        setShowBroadcastModal(false);
        setBroadcastForm({
          title: '',
          message: '',
          targetGroup: 'All Users',
          departmentFilter: 'Computer Science & Engineering',
          priority: 'high',
          sendEmailCopy: true,
          senderName: 'Office of Registrar',
          senderRole: 'Academic Administrator'
        });
        loadData();
      }
    } catch {
      showToast('Failed to dispatch broadcast', 'error');
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.recipientEmail || !emailForm.subject || !emailForm.messageBody) {
      showToast('Please fill recipient email, subject, and message body', 'error');
      return;
    }
    try {
      const res = await notificationApi.sendCustomEmail(emailForm);
      if (res.success) {
        showToast(`Email dispatched to ${emailForm.recipientEmail}`);
        setShowEmailModal(false);
        setEmailForm({
          recipientEmail: '',
          recipientName: '',
          subject: '',
          templateName: 'Custom Direct Email',
          messageBody: '',
          category: 'System'
        });
        loadData();
      }
    } catch {
      showToast('Failed to send email', 'error');
    }
  };

  const handleTriggerAdmissionAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await notificationApi.triggerAdmissionAlert(admAlertForm);
      if (res.success) {
        showToast(`Admission Alert dispatched to ${admAlertForm.email}`);
        loadData();
      }
    } catch {
      showToast('Failed to trigger admission alert', 'error');
    }
  };

  const handleTriggerStudentAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await notificationApi.triggerStudentAlert(stuAlertForm);
      if (res.success) {
        showToast(`Student Alert dispatched to ${stuAlertForm.email}`);
        loadData();
      }
    } catch {
      showToast('Failed to trigger student alert', 'error');
    }
  };

  const handleTriggerDocAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await notificationApi.triggerDocumentAlert(docAlertForm);
      if (res.success) {
        showToast(`Document Alert dispatched to ${docAlertForm.email}`);
        loadData();
      }
    } catch {
      showToast('Failed to trigger document alert', 'error');
    }
  };

  // Filtered in-app notifications by search term
  const filteredNotifs = inAppNotifs.filter(n => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q) ||
      (n.recipientName && n.recipientName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2 transition-all duration-200 ${
            toastMessage.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}
        >
          {toastMessage.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 text-sm font-semibold tracking-wide uppercase mb-1">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>ScholarCore Communication Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Notification & Alert Center</h1>
          <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
            Manage multi-channel notifications, broadcast announcements, automated triggers for admissions, student academic alerts, and document service dispatches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm flex items-center gap-2 shadow-md transition-all duration-150"
          >
            <Megaphone className="w-4 h-4" />
            <span>New Broadcast</span>
          </button>

          <button
            onClick={() => setShowEmailModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-md transition-all duration-150"
          >
            <Mail className="w-4 h-4" />
            <span>Compose Email</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-all duration-150"
            title="Refresh Notification Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Unread Alerts</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.unreadInApp}</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Bell className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">In-App Total</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalInApp}</p>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Emails Dispatched</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.totalEmails}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Mail className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Broadcasts</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.totalBroadcasts}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Megaphone className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-sm overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('inapp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'inapp'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>In-App Feed</span>
          {stats.unreadInApp > 0 && (
            <span className="bg-amber-400 text-slate-950 text-xs px-2 py-0.5 rounded-full font-bold">
              {stats.unreadInApp}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('emails')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'emails'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Email Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcasts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'broadcasts'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Broadcast Messages</span>
        </button>

        <button
          onClick={() => setActiveTab('admission_alerts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'admission_alerts'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Admission Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('student_alerts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'student_alerts'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Student Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('doc_alerts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'doc_alerts'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Document Alerts</span>
        </button>
      </div>

      {/* TAB 1: IN-APP FEED */}
      {activeTab === 'inapp' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 border-b border-slate-100 pb-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search notifications by title or text..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Categories</option>
                <option value="Admission">Admission</option>
                <option value="Student">Student</option>
                <option value="Document">Document</option>
                <option value="Broadcast">Broadcast</option>
                <option value="System">System</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>

              {/* Unread Only Toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={e => setUnreadOnly(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Unread Only</span>
              </label>

              <button
                onClick={handleMarkAllRead}
                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>

              <button
                onClick={handleClearAllNotifs}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Feed</span>
              </button>
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifs.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Inbox className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No notifications found</p>
              <p className="text-xs mt-1">Adjust filters or search criteria above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifs.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border transition-all duration-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                    !notif.read
                      ? 'bg-indigo-50/40 border-indigo-200 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    {/* Category Icon */}
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        notif.type === 'Admission'
                          ? 'bg-blue-100 text-blue-700'
                          : notif.type === 'Student'
                          ? 'bg-amber-100 text-amber-800'
                          : notif.type === 'Document'
                          ? 'bg-emerald-100 text-emerald-800'
                          : notif.type === 'Broadcast'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {notif.type === 'Admission' && <UserCheck className="w-5 h-5" />}
                      {notif.type === 'Student' && <AlertTriangle className="w-5 h-5" />}
                      {notif.type === 'Document' && <FileCheck className="w-5 h-5" />}
                      {notif.type === 'Broadcast' && <Megaphone className="w-5 h-5" />}
                      {notif.type === 'System' && <Bell className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                        {!notif.read && (
                          <span className="bg-indigo-600 text-white text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full">
                            NEW
                          </span>
                        )}

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            notif.priority === 'high'
                              ? 'bg-rose-100 text-rose-700'
                              : notif.priority === 'medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {notif.priority}
                        </span>

                        {/* Category Pill */}
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          {notif.type}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">{notif.message}</p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(notif.createdAt).toLocaleString()}
                        </span>
                        {notif.recipientName && (
                          <span>Target: {notif.recipientName} ({notif.recipientEmail})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-all"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotif(notif.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EMAIL LOGS */}
      {activeTab === 'emails' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Email Dispatch Queue & Service Logs</h3>
              <p className="text-xs text-slate-500">Track outgoing automated & direct email notices.</p>
            </div>
            <button
              onClick={() => setShowEmailModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <SendHorizontal className="w-4 h-4" />
              <span>Send Direct Email</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-semibold">
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Template / Type</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Dispatched At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emailLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No email log records found.
                    </td>
                  </tr>
                ) : (
                  emailLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">
                        {log.recipientName}
                        <div className="text-[11px] font-normal text-slate-500">{log.recipientEmail}</div>
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate">{log.subject}</div>
                        <div className="text-[11px] text-slate-500 truncate">{log.bodyPreview}</div>
                      </td>
                      <td className="p-3 text-slate-700">{log.templateName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                          {log.category}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            log.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-700'
                              : log.status === 'Sent'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 whitespace-nowrap">
                        {new Date(log.sentAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BROADCAST MESSAGES */}
      {activeTab === 'broadcasts' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Mass Broadcast Messages & Announcements</h3>
              <p className="text-xs text-slate-500">Dispatch institution-wide emergency or academic notices.</p>
            </div>
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <Megaphone className="w-4 h-4" />
              <span>Create New Broadcast</span>
            </button>
          </div>

          <div className="space-y-4">
            {broadcasts.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Megaphone className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-700">No broadcast messages yet</p>
                <p className="text-xs mt-1">Click "Create New Broadcast" to send a campus notification.</p>
              </div>
            ) : (
              broadcasts.map(bc => (
                <div key={bc.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase rounded-full">
                          BROADCAST
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                            bc.priority === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {bc.priority} Priority
                        </span>
                        <span className="text-xs text-slate-500">Target: {bc.targetGroup}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">{bc.title}</h4>
                    </div>

                    <div className="text-right text-xs text-slate-500">
                      <div>Recipients: <span className="font-bold text-slate-900">{bc.totalRecipientsCount}</span></div>
                      <div className="text-[11px] mt-0.5">{new Date(bc.sentAt).toLocaleString()}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                    {bc.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Sender: <strong className="text-slate-800">{bc.senderName}</strong> ({bc.senderRole})</span>
                    <span>Email Copy Dispatched: {bc.sendEmailCopy ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ADMISSION ALERTS */}
      {activeTab === 'admission_alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trigger Form */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm border-b pb-3">
              <UserCheck className="w-5 h-5" />
              <span>Admission Alert Dispatcher</span>
            </div>

            <form onSubmit={handleTriggerAdmissionAlert} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Alert Event Type</label>
                <select
                  value={admAlertForm.alertType}
                  onChange={e => setAdmAlertForm({ ...admAlertForm, alertType: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="NEW_APPLICATION">New Application Submitted</option>
                  <option value="UNDER_REVIEW">Application Under Review</option>
                  <option value="DOCUMENT_REQUIRED">Action Required: Documents Missing</option>
                  <option value="OFFER_SENT">Admission Offer Letter Dispatched</option>
                  <option value="FEE_REMINDER">Seat Booking Fee Reminder</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Applicant Name</label>
                <input
                  type="text"
                  value={admAlertForm.applicantName}
                  onChange={e => setAdmAlertForm({ ...admAlertForm, applicantName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Applicant Email</label>
                <input
                  type="email"
                  value={admAlertForm.email}
                  onChange={e => setAdmAlertForm({ ...admAlertForm, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department</label>
                <select
                  value={admAlertForm.department}
                  onChange={e => setAdmAlertForm({ ...admAlertForm, department: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Computer Science & Engineering</option>
                  <option>Electronics & Communication</option>
                  <option>Electrical & Electronics</option>
                  <option>Mechanical Engineering</option>
                  <option>Civil Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Application Ref ID</label>
                <input
                  type="text"
                  value={admAlertForm.applicationId}
                  onChange={e => setAdmAlertForm({ ...admAlertForm, applicationId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch Admission Alert</span>
              </button>
            </form>
          </div>

          {/* Quick Presets & History */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-3">Automated Admission Workflows</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 border rounded-xl bg-blue-50/50 border-blue-200 space-y-2">
                <h4 className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Application Submission Hook</span>
                </h4>
                <p className="text-[11px] text-slate-600">
                  Sends instant email confirmation with reference tracking ID to applicant & in-app alert to admission desk.
                </p>
              </div>

              <div className="p-4 border rounded-xl bg-emerald-50/50 border-emerald-200 space-y-2">
                <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Provisional Offer Letter Hook</span>
                </h4>
                <p className="text-[11px] text-slate-600">
                  Triggers automated acceptance package email with deadline countdown & seat deposit link.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-700 mb-2">Recent Admission Alert Logs</h4>
              <div className="space-y-2">
                {inAppNotifs
                  .filter(n => n.type === 'Admission')
                  .slice(0, 5)
                  .map(notif => (
                    <div key={notif.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="font-bold text-slate-900">{notif.title}</div>
                      <div className="text-slate-600 mt-0.5">{notif.message}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STUDENT ALERTS */}
      {activeTab === 'student_alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trigger Form */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm border-b pb-3">
              <AlertTriangle className="w-5 h-5" />
              <span>Student Alert Dispatcher</span>
            </div>

            <form onSubmit={handleTriggerStudentAlert} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Alert Event Type</label>
                <select
                  value={stuAlertForm.alertType}
                  onChange={e => setStuAlertForm({ ...stuAlertForm, alertType: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="LOW_ATTENDANCE">Low Attendance Warning (&lt;75%)</option>
                  <option value="FEE_DUE">Tuition Fee Dues Notice</option>
                  <option value="PROBATION_WARNING">Academic Probation Notice (Low CGPA)</option>
                  <option value="REGISTRATION_OPEN">Course Registration Announcement</option>
                  <option value="DISCIPLINARY">Disciplinary Advisory</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Student Roll No / ID</label>
                <input
                  type="text"
                  value={stuAlertForm.studentId}
                  onChange={e => setStuAlertForm({ ...stuAlertForm, studentId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={stuAlertForm.fullName}
                  onChange={e => setStuAlertForm({ ...stuAlertForm, fullName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Student Email</label>
                <input
                  type="email"
                  value={stuAlertForm.email}
                  onChange={e => setStuAlertForm({ ...stuAlertForm, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {stuAlertForm.alertType === 'LOW_ATTENDANCE' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Current Attendance (%)</label>
                  <input
                    type="number"
                    value={stuAlertForm.attendance}
                    onChange={e => setStuAlertForm({ ...stuAlertForm, attendance: parseFloat(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {stuAlertForm.alertType === 'FEE_DUE' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Amount Due (₹)</label>
                  <input
                    type="number"
                    value={stuAlertForm.amountDue}
                    onChange={e => setStuAlertForm({ ...stuAlertForm, amountDue: parseFloat(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Trigger Student Alert</span>
              </button>
            </form>
          </div>

          {/* Alert Preview & Recent Feed */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-3">Academic & Discipline Rules</h3>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-2">
              <h4 className="font-bold text-amber-900">Automatic Threshold Rules</h4>
              <ul className="list-disc pl-4 space-y-1 text-amber-800">
                <li>Attendance below 75% triggers an immediate warning notification to the student and course instructor.</li>
                <li>CGPA below 5.0 triggers an Academic Probation Notice with mandatory counseling appointment.</li>
                <li>Unpaid semester fee dues beyond due date auto-sends fee collection notices weekly.</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2">Recent Student Academic Alerts</h4>
              <div className="space-y-2">
                {inAppNotifs
                  .filter(n => n.type === 'Student')
                  .slice(0, 5)
                  .map(notif => (
                    <div key={notif.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="font-bold text-slate-900">{notif.title}</div>
                      <div className="text-slate-600 mt-0.5">{notif.message}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DOCUMENT ALERTS */}
      {activeTab === 'doc_alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trigger Form */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm border-b pb-3">
              <FileCheck className="w-5 h-5" />
              <span>Document Alert Dispatcher</span>
            </div>

            <form onSubmit={handleTriggerDocAlert} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Alert Event Type</label>
                <select
                  value={docAlertForm.alertType}
                  onChange={e => setDocAlertForm({ ...docAlertForm, alertType: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="VERIFICATION_PENDING">Document Verification Pending</option>
                  <option value="IDCARD_READY">Smart RFID ID Card Ready for Pickup</option>
                  <option value="REJECTED_REUPLOAD">Document Rejected (Re-upload Request)</option>
                  <option value="IDCARD_EXPIRY">ID Card Expiry Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Student Roll No</label>
                <input
                  type="text"
                  value={docAlertForm.studentId}
                  onChange={e => setDocAlertForm({ ...docAlertForm, studentId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Student Name</label>
                <input
                  type="text"
                  value={docAlertForm.studentName}
                  onChange={e => setDocAlertForm({ ...docAlertForm, studentName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Student Email</label>
                <input
                  type="email"
                  value={docAlertForm.email}
                  onChange={e => setDocAlertForm({ ...docAlertForm, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Document Name / Type</label>
                <input
                  type="text"
                  value={docAlertForm.documentType}
                  onChange={e => setDocAlertForm({ ...docAlertForm, documentType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                <span>Dispatch Document Alert</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-3">Document Service Alerts</h3>

            <div className="space-y-2">
              {inAppNotifs
                .filter(n => n.type === 'Document')
                .slice(0, 5)
                .map(notif => (
                  <div key={notif.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="font-bold text-slate-900">{notif.title}</div>
                    <div className="text-slate-600 mt-0.5">{notif.message}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BROADCAST COMPOSER */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-500" />
                <span>Compose Campus Broadcast</span>
              </h3>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Broadcast Title</label>
                <input
                  type="text"
                  placeholder="e.g. Fall Semester Mid-Term Exam Timetable Released"
                  value={broadcastForm.title}
                  onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Group</label>
                  <select
                    value={broadcastForm.targetGroup}
                    onChange={e => setBroadcastForm({ ...broadcastForm, targetGroup: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="All Users">All Campus Users</option>
                    <option value="All Students">All Students</option>
                    <option value="All Faculty">All Faculty & Staff</option>
                    <option value="Specific Department">Specific Department</option>
                    <option value="Specific Batch">Specific Academic Batch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                  <select
                    value={broadcastForm.priority}
                    onChange={e => setBroadcastForm({ ...broadcastForm, priority: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Message Content</label>
                <textarea
                  rows={4}
                  placeholder="Type full broadcast message..."
                  value={broadcastForm.message}
                  onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sendEmailCopy"
                  checked={broadcastForm.sendEmailCopy}
                  onChange={e => setBroadcastForm({ ...broadcastForm, sendEmailCopy: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="sendEmailCopy" className="text-slate-700 font-medium cursor-pointer">
                  Send email notification copy to all recipients
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md"
                >
                  Dispatch Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DIRECT EMAIL COMPOSER */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                <span>Send Direct Targeted Email</span>
              </h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Recipient Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Aarav Sharma"
                    value={emailForm.recipientName}
                    onChange={e => setEmailForm({ ...emailForm, recipientName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Recipient Email</label>
                  <input
                    type="email"
                    placeholder="student@scholarcore.edu"
                    value={emailForm.recipientEmail}
                    onChange={e => setEmailForm({ ...emailForm, recipientEmail: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="Subject line..."
                  value={emailForm.subject}
                  onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Message Body</label>
                <textarea
                  rows={4}
                  placeholder="Type email body..."
                  value={emailForm.messageBody}
                  onChange={e => setEmailForm({ ...emailForm, messageBody: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  Send Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
