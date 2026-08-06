import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building2,
  Award,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  UserCheck
} from 'lucide-react';
import { admissionApi } from '../../api/admissionApi';
import {
  AdmissionApplication,
  AdmissionQueryParams,
  AdmissionStats,
  AdmissionStatus
} from '../../types/admission';
import { AdmissionApplicationModal } from './AdmissionApplicationModal';
import { DocumentVerificationModal } from './DocumentVerificationModal';
import { AdmissionApprovalModal } from './AdmissionApprovalModal';
import { AdmissionRejectionModal } from './AdmissionRejectionModal';
import { AdmissionDetailDrawer } from './AdmissionDetailDrawer';

const DEPARTMENTS = [
  'ALL',
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Biotechnology & Life Sciences',
  'Department of Management Studies',
  'Civil Engineering'
];

const CATEGORIES = ['ALL', 'General', 'OBC', 'SC', 'ST', 'EWS'];

export const AdmissionManagementView: React.FC = () => {
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [stats, setStats] = useState<AdmissionStats>({
    total: 0,
    pending: 0,
    underReview: 0,
    documentVerification: 0,
    approved: 0,
    rejected: 0
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  });

  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('appliedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal & Drawer states
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeApplication, setActiveApplication] = useState<AdmissionApplication | null>(null);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: AdmissionQueryParams = {
        page: pagination.currentPage,
        limit: pagination.limit,
        search,
        status: selectedStatus,
        department: selectedDepartment,
        category: selectedCategory,
        sortBy,
        sortOrder
      };

      const response = await admissionApi.getApplications(params);
      if (response.success) {
        setApplications(response.data);
        setStats(response.stats);
        setPagination((prev) => ({
          ...prev,
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          totalItems: response.pagination.totalItems
        }));
      }
    } catch (err) {
      console.error('Error loading admission applications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.currentPage,
    pagination.limit,
    search,
    selectedStatus,
    selectedDepartment,
    selectedCategory,
    sortBy,
    sortOrder
  ]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusQuickUpdate = async (appId: string, newStatus: AdmissionStatus) => {
    try {
      await admissionApi.updateStatus(appId, newStatus);
      fetchApplications();
      if (activeApplication && activeApplication.id === appId) {
        setActiveApplication((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleOpenDrawer = (app: AdmissionApplication) => {
    setActiveApplication(app);
    setIsDrawerOpen(true);
  };

  const handleOpenVerify = (app: AdmissionApplication) => {
    setActiveApplication(app);
    setIsVerifyModalOpen(true);
  };

  const handleOpenApprove = (app: AdmissionApplication) => {
    setActiveApplication(app);
    setIsApproveModalOpen(true);
  };

  const handleOpenReject = (app: AdmissionApplication) => {
    setActiveApplication(app);
    setIsRejectModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Admission Management Module
              </h1>
              <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono px-2 py-0.5 rounded-md uppercase font-bold">
                2026-2027 Session
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Central Admissions Cell • Application Tracking, Document Verification & Automated Roll Number Enrollment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchApplications()}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors border border-slate-300 cursor-pointer"
            title="Refresh Applications"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={() => setIsNewAppModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Admission Application
          </button>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider block font-medium">Total Applications</span>
          <span className="text-2xl font-bold text-slate-900 font-mono mt-0.5 block">{stats.total}</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider block font-medium">Pending Intake</span>
          <span className="text-2xl font-bold text-amber-600 font-mono mt-0.5 block">{stats.pending}</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider block font-medium">Under Review</span>
          <span className="text-2xl font-bold text-blue-600 font-mono mt-0.5 block">{stats.underReview}</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider block font-semibold">Docs Verification</span>
          <span className="text-2xl font-bold text-purple-600 font-mono mt-0.5 block">{stats.documentVerification}</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider block font-medium">Approved & Enrolled</span>
          <span className="text-2xl font-bold text-emerald-600 font-mono mt-0.5 block">{stats.approved}</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider block font-medium">Rejected</span>
          <span className="text-2xl font-bold text-rose-600 font-mono mt-0.5 block">{stats.rejected}</span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-mono border-b border-slate-200">
          {[
            { id: 'ALL', label: 'All Applications' },
            { id: 'Pending', label: 'Pending' },
            { id: 'Under Review', label: 'Under Review' },
            { id: 'Document Verification', label: 'Doc Verification' },
            { id: 'Approved', label: 'Approved & Enrolled' },
            { id: 'Rejected', label: 'Rejected' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedStatus(tab.id);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedStatus === tab.id
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Inputs & Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by applicant name, Application # (APP-2026-XXXX), email, roll no..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Departments / Streams</option>
              {DEPARTMENTS.filter((d) => d !== 'ALL').map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.filter((c) => c !== 'ALL').map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-mono text-[11px] uppercase border-b border-slate-200">
              <tr>
                <th className="p-3.5">Application #</th>
                <th className="p-3.5">Applicant Name</th>
                <th className="p-3.5">Department & Degree</th>
                <th className="p-3.5">Class XII / Entrance</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Status & Enrolled Roll No</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 font-sans bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-mono">
                    Loading admission records...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-mono">
                    No admission applications found matching current criteria.
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const statusColors = {
                    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
                    'Under Review': 'bg-blue-50 text-blue-700 border-blue-200',
                    'Document Verification': 'bg-purple-50 text-purple-700 border-purple-200',
                    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    Rejected: 'bg-rose-50 text-rose-700 border-rose-200'
                  }[app.status] || 'bg-slate-100 text-slate-700 border-slate-200';

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDrawer(app)}
                    >
                      <td className="p-3.5 font-mono text-slate-900 font-bold">
                        {app.applicationNumber}
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {app.applicantName}
                        </div>
                        <div className="text-[11px] text-slate-500">{app.email}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="text-slate-900 font-medium">{app.department}</div>
                        <div className="text-[11px] text-blue-700 font-mono">{app.degree || 'B.Tech'} • {app.academicTerm}</div>
                      </td>

                      <td className="p-3.5 font-mono">
                        <div><span className="text-slate-500">Class XII:</span> <strong className="text-slate-900">{app.classXIIPercentage ? `${app.classXIIPercentage}%` : 'N/A'}</strong></div>
                        <div className="text-[10px] text-slate-500">{app.entranceExamScore || 'No entrance score'}</div>
                      </td>

                      <td className="p-3.5 font-mono">
                        <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                          {app.category || 'General'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-semibold ${statusColors}`}>
                            {app.status}
                          </span>
                          {app.generatedStudentId && (
                            <span className="text-[10px] font-mono text-emerald-700 font-bold">
                              Roll: {app.generatedStudentId}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenVerify(app)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 text-[10px] font-mono font-medium cursor-pointer"
                            title="Verify Documents"
                          >
                            Verify
                          </button>

                          <button
                            onClick={() => handleOpenApprove(app)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 text-[10px] font-mono font-medium cursor-pointer"
                            title="Approve & Enroll"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => handleOpenReject(app)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 text-[10px] font-mono font-medium cursor-pointer"
                            title="Reject Application"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-mono text-slate-600">
          <div>
            Showing {applications.length} of {pagination.totalItems} admission records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
              disabled={pagination.currentPage === 1}
              className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              onClick={() => setPagination((prev) => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals & Drawer */}
      <AdmissionApplicationModal
        isOpen={isNewAppModalOpen}
        onClose={() => setIsNewAppModalOpen(false)}
        onSuccess={() => fetchApplications()}
      />

      <DocumentVerificationModal
        isOpen={isVerifyModalOpen}
        application={activeApplication}
        onClose={() => setIsVerifyModalOpen(false)}
        onSuccess={() => fetchApplications()}
      />

      <AdmissionApprovalModal
        isOpen={isApproveModalOpen}
        application={activeApplication}
        onClose={() => setIsApproveModalOpen(false)}
        onSuccess={() => fetchApplications()}
      />

      <AdmissionRejectionModal
        isOpen={isRejectModalOpen}
        application={activeApplication}
        onClose={() => setIsRejectModalOpen(false)}
        onSuccess={() => fetchApplications()}
      />

      <AdmissionDetailDrawer
        isOpen={isDrawerOpen}
        application={activeApplication}
        onClose={() => setIsDrawerOpen(false)}
        onOpenVerifyModal={() => {
          setIsDrawerOpen(false);
          setIsVerifyModalOpen(true);
        }}
        onOpenApproveModal={() => {
          setIsDrawerOpen(false);
          setIsApproveModalOpen(true);
        }}
        onOpenRejectModal={() => {
          setIsDrawerOpen(false);
          setIsRejectModalOpen(true);
        }}
        onUpdateStatus={(newStatus) => {
          if (activeApplication) {
            handleStatusQuickUpdate(activeApplication.id, newStatus);
          }
        }}
      />
    </div>
  );
};
