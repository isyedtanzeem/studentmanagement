import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  FileText,
  User,
  GraduationCap,
  Calendar,
  HardDrive,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Edit2,
  Trash2,
  ShieldAlert,
  Award
} from 'lucide-react';
import { DocumentRecord, VerificationStatus } from '../../types/document';
import { documentApi } from '../../api/documentApi';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentRecord | null;
  onStatusUpdated: () => void;
  onEdit: (doc: DocumentRecord) => void;
  onDelete: (doc: DocumentRecord) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document,
  onStatusUpdated,
  onEdit,
  onDelete
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [remarks, setRemarks] = useState('');

  if (!isOpen || !document) return null;

  const handleDownload = () => {
    // Create simulated download link or trigger blob download
    const link = document.createElement('a');
    link.href = document.fileUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';
    link.download = document.fileName || `${document.documentType}_${document.studentRollNo}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateStatus = async (status: VerificationStatus) => {
    try {
      setUpdatingStatus(true);
      await documentApi.updateDocument(document.id, {
        verificationStatus: status,
        remarks: remarks || document.remarks
      });
      onStatusUpdated();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Document
          </span>
        );
      case 'Pending Verification':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending Verification
          </span>
        );
      case 'Re-upload Requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Re-upload Requested
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {document.documentId}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {document.documentType}
                </span>
              </div>
              <h2 className="text-base font-bold text-white line-clamp-1 mt-0.5">
                {document.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-xs"
              title="Download Original File"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={() => onEdit(document)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              title="Edit Document Info"
            >
              <Edit2 className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={() => onDelete(document)}
              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-xl transition-all"
              title="Delete Document"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content: Split Screen */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden bg-slate-100">
          {/* Left Column: Visual Document Previewer (2 Cols) */}
          <div className="lg:col-span-2 bg-slate-900 p-4 sm:p-6 flex flex-col justify-between items-center relative overflow-y-auto">
            {/* Zoom controls */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-slate-800/90 border border-slate-700/80 p-1 rounded-xl text-white text-xs backdrop-blur-xs">
              <button
                onClick={() => setZoomLevel(z => Math.max(50, z - 25))}
                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono font-semibold text-[11px]">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(z => Math.min(200, z + 25))}
                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Document Preview Stage */}
            <div className="w-full h-full flex items-center justify-center p-4">
              <div
                style={{ transform: `scale(${zoomLevel / 100})` }}
                className="transition-transform duration-200 max-w-full max-h-[60vh] bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 relative overflow-hidden flex flex-col items-center justify-center"
              >
                {document.fileType.includes('image') || document.fileUrl.startsWith('data:image') || document.fileUrl.includes('unsplash') ? (
                  <img
                    src={document.fileUrl}
                    alt={document.title}
                    className="max-h-[50vh] object-contain rounded-lg border border-slate-100"
                  />
                ) : (
                  <div className="p-8 text-center space-y-4 max-w-sm">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{document.fileName}</p>
                      <p className="text-xs text-slate-500 font-mono mt-1">
                        {document.fileType} • {document.fileSize}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 font-serif italic">
                      "Official educational document scan on record for {document.studentName} ({document.studentRollNo}). Verified by ScholarCore Registrar Cell."
                    </div>
                  </div>
                )}

                {/* Verification Seal Overlay */}
                {document.verificationStatus === 'Verified' && (
                  <div className="absolute bottom-4 right-4 bg-emerald-600 text-white p-2.5 rounded-2xl shadow-lg border border-emerald-400 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-300" />
                    <div className="text-[10px] text-left">
                      <p className="font-extrabold uppercase tracking-widest leading-none">Verified Seal</p>
                      <p className="text-emerald-100 font-mono text-[9px] mt-0.5">{document.verifiedBy || 'Registrar'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full text-center text-slate-400 text-[11px] pt-2 border-t border-slate-800">
              ScholarCore Academic Document Vault • SHA-256 Encrypted Audit Trail
            </div>
          </div>

          {/* Right Column: Metadata & Status Controls */}
          <div className="p-6 bg-white overflow-y-auto space-y-6 flex flex-col justify-between text-xs">
            <div className="space-y-5">
              {/* Status Header */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Verification Status</p>
                <div>{getStatusBadge(document.verificationStatus)}</div>
              </div>

              {/* Student Information Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{document.studentName}</p>
                    <p className="text-indigo-600 font-mono font-bold">{document.studentRollNo}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 text-[10px]">Document Type:</span>
                    <p className="font-semibold text-slate-800">{document.documentType}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Upload Date:</span>
                    <p className="font-semibold text-slate-800">
                      {new Date(document.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* File Specs Box */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">File Specifications</p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">File Name:</span>
                    <span className="font-semibold text-slate-800 line-clamp-1">{document.fileName}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">File Format:</span>
                    <span className="font-mono font-semibold text-slate-800">{document.fileType}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">File Size:</span>
                    <span className="font-mono font-semibold text-slate-800">{document.fileSize}</span>
                  </div>
                </div>
              </div>

              {/* Remarks & Notes */}
              {document.remarks && (
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Remarks / Notes</p>
                  <p className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl font-medium">
                    {document.remarks}
                  </p>
                </div>
              )}

              {/* Verification Action Controls */}
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-3">
                <p className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  Admin Verification Desk
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus('Verified')}
                    className="px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve / Verify
                  </button>

                  <button
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus('Re-upload Requested')}
                    className="px-3 py-2 text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-200 rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Request Re-upload
                  </button>
                </div>

                <button
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus('Rejected')}
                  className="w-full px-3 py-2 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Mark as Rejected
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-200 text-center text-slate-400 text-[11px]">
              Last verified: {document.verificationDate ? new Date(document.verificationDate).toLocaleString() : 'N/A'}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
