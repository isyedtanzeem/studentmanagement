import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Trash2, X, FileText } from 'lucide-react';
import { DocumentRecord } from '../../types/document';
import { documentApi } from '../../api/documentApi';

interface DocumentDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  document: DocumentRecord | null;
}

export const DocumentDeleteModal: React.FC<DocumentDeleteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  document
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !document) return null;

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError(null);
      await documentApi.deleteDocument(document.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete document record.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Trash2 className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">Delete Document Record</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete this document from the official repository? This action cannot be undone.
            </p>
          </div>

          {/* Document Summary Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-1 text-xs">
            <div className="flex items-center gap-2 text-indigo-600 font-bold font-mono">
              <FileText className="w-3.5 h-3.5" />
              <span>{document.documentId} • {document.documentType}</span>
            </div>
            <p className="font-bold text-slate-900">{document.title}</p>
            <p className="text-slate-500">
              Student: <span className="font-semibold text-slate-800">{document.studentName} ({document.studentRollNo})</span>
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl text-left">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
