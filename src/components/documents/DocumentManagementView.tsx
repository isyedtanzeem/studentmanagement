import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  UploadCloud,
  Search,
  Filter,
  Eye,
  Download,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Shield,
  ShieldCheck,
  RefreshCw,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Image as ImageIcon,
  File,
  Sparkles,
  Users
} from 'lucide-react';
import { DocumentRecord, DocumentQueryParams, DocumentStats, DocumentType } from '../../types/document';
import { documentApi } from '../../api/documentApi';
import { DocumentUploadModal } from './DocumentUploadModal';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { DocumentDeleteModal } from './DocumentDeleteModal';

export const DocumentManagementView: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [stats, setStats] = useState<DocumentStats>({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
    reuploadRequested: 0,
    uniqueStudents: 0,
    typeBreakdown: {
      Aadhaar: 0,
      BirthCertificate: 0,
      TransferCertificate: 0,
      MarksCards: 0,
      PassportPhoto: 0,
      Other: 0
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentRecord | null>(null);
  const [previewingDoc, setPreviewingDoc] = useState<DocumentRecord | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<DocumentRecord | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [page, limit, search, typeFilter, statusFilter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: DocumentQueryParams = {
        page,
        limit,
        search: search.trim() || undefined,
        documentType: typeFilter !== 'ALL' ? typeFilter : undefined,
        verificationStatus: statusFilter !== 'ALL' ? statusFilter : undefined
      };

      const res = await documentApi.getDocuments(params);
      if (res.success) {
        setDocuments(res.data);
        setStats(res.stats);
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.totalItems);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load document records.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = (doc: DocumentRecord) => {
    const link = document.createElement('a');
    link.href = doc.fileUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';
    link.download = doc.fileName || `${doc.documentType}_${doc.studentRollNo}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDocTypeBadge = (type: DocumentType) => {
    switch (type) {
      case 'Aadhaar':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center gap-1 shrink-0">
            <Shield className="w-3 h-3 text-blue-600" />
            Aadhaar Card
          </span>
        );
      case 'Birth Certificate':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1 shrink-0">
            <FileText className="w-3 h-3 text-emerald-600" />
            Birth Cert
          </span>
        );
      case 'Transfer Certificate':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-1 shrink-0">
            <FileCheck className="w-3 h-3 text-amber-600" />
            Transfer Cert (TC)
          </span>
        );
      case 'Marks Cards':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/80 flex items-center gap-1 shrink-0">
            <File className="w-3 h-3 text-purple-600" />
            Marks Sheet
          </span>
        );
      case 'Passport Photo':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200/80 flex items-center gap-1 shrink-0">
            <ImageIcon className="w-3 h-3 text-pink-600" />
            Passport Photo
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-slate-500" />
            Other
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </span>
        );
      case 'Pending Verification':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'Re-upload Requested':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Re-upload
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            Student Documents Vault
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload, verify, preview, and manage Aadhaar cards, birth certificates, TCs, marksheets, & photos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDocuments()}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs transition-all"
            title="Refresh repository"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <button
            onClick={() => {
              setEditingDoc(null);
              setIsUploadModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md transition-all shrink-0"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Total Archival Documents</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{stats.total}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Verified Records */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">UIDAI & Board Verified</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{stats.verified}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Verification */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Pending Registrar Review</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{stats.pending}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Mapped Students */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Students with Vault Records</p>
            <p className="text-xl font-bold text-purple-600 mt-1">{stats.uniqueStudents}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by document title, ID, student roll #, student name, file name..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Document Type Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={typeFilter}
                onChange={e => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Document Types</option>
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="Birth Certificate">Birth Certificate</option>
                <option value="Transfer Certificate">Transfer Certificate (TC)</option>
                <option value="Marks Cards">Marks Cards</option>
                <option value="Passport Photo">Passport Photo</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <select
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Verified">Verified</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Re-upload Requested">Re-upload Requested</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table Rows View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="w-20 h-4 bg-slate-200 rounded-md"></div>
                <div className="w-16 h-4 bg-slate-200 rounded-full"></div>
              </div>
              <div className="w-3/4 h-5 bg-slate-200 rounded-md"></div>
              <div className="w-full h-12 bg-slate-100 rounded-xl"></div>
              <div className="w-1/2 h-4 bg-slate-200 rounded-md"></div>
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Student Documents Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No document records match your current filter settings. Upload new documents or adjust your search term.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setTypeFilter('ALL');
              setStatusFilter('ALL');
            }}
            className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {documents.map(doc => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Card Body */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {doc.documentId}
                  </span>
                  {getStatusBadge(doc.verificationStatus)}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {doc.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5">
                    {getDocTypeBadge(doc.documentType)}
                  </div>
                </div>

                {/* Student info box */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">Student Name:</span>
                    <span className="font-bold text-slate-900 line-clamp-1">{doc.studentName}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">Roll Number:</span>
                    <span className="font-mono font-bold text-indigo-600">{doc.studentRollNo}</span>
                  </div>
                </div>

                {/* File Specs */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="truncate max-w-[160px]" title={doc.fileName}>
                    📄 {doc.fileName}
                  </span>
                  <span className="font-mono font-semibold text-slate-700 shrink-0">
                    {doc.fileSize}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  {new Date(doc.uploadDate).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewingDoc(doc)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    title="Preview Document"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>

                  <button
                    onClick={() => handleDownloadFile(doc)}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setEditingDoc(doc);
                      setIsUploadModalOpen(true);
                    }}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit Record"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingDoc(doc)}
                    className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* TABLE ROWS VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Doc ID & Title</th>
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">Student Name & Roll #</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">File Spec</th>
                  <th className="py-3 px-4">Upload Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">{doc.title}</p>
                        <p className="font-mono text-[10px] text-indigo-600 font-bold">{doc.documentId}</p>
                      </div>
                    </td>

                    <td className="py-3 px-4">{getDocTypeBadge(doc.documentType)}</td>

                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{doc.studentName}</p>
                        <p className="font-mono text-[10px] text-indigo-600 font-semibold">{doc.studentRollNo}</p>
                      </div>
                    </td>

                    <td className="py-3 px-4">{getStatusBadge(doc.verificationStatus)}</td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] text-slate-600">
                        <p className="line-clamp-1 text-slate-900">{doc.fileName}</p>
                        <p className="text-slate-400 text-[10px]">{doc.fileSize}</p>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewingDoc(doc)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="Preview Modal"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDownloadFile(doc)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingDoc(doc);
                            setIsUploadModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeletingDoc(doc)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && documents.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-900">{documents.length}</strong> of{' '}
            <strong className="text-slate-900">{totalItems}</strong> document records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setEditingDoc(null);
        }}
        onSuccess={fetchDocuments}
        documentToEdit={editingDoc}
      />

      <DocumentPreviewModal
        isOpen={!!previewingDoc}
        onClose={() => setPreviewingDoc(null)}
        document={previewingDoc}
        onStatusUpdated={fetchDocuments}
        onEdit={doc => {
          setPreviewingDoc(null);
          setEditingDoc(doc);
          setIsUploadModalOpen(true);
        }}
        onDelete={doc => {
          setPreviewingDoc(null);
          setDeletingDoc(doc);
        }}
      />

      <DocumentDeleteModal
        isOpen={!!deletingDoc}
        onClose={() => setDeletingDoc(null)}
        onSuccess={fetchDocuments}
        document={deletingDoc}
      />
    </div>
  );
};
