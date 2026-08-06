import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { Guardian } from '../../types/guardian';
import { guardianApi } from '../../api/guardianApi';

interface GuardianDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  guardian: Guardian | null;
}

export const GuardianDeleteModal: React.FC<GuardianDeleteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  guardian
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !guardian) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await guardianApi.deleteGuardian(guardian.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete guardian record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-rose-600 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/30 rounded-lg text-rose-100 border border-rose-400/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Delete Guardian Record</h3>
                <p className="text-xs text-rose-200">Irreversible System Operation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-rose-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                {error}
              </div>
            )}

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently remove guardian profile{' '}
              <strong className="text-slate-900">{guardian.guardianName}</strong> (ID:{' '}
              <span className="font-mono text-indigo-600">{guardian.guardianId}</span>)?
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Relationship:</span>
                <span className="font-semibold text-slate-900">{guardian.relationship}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Primary Contact:</span>
                <span className="font-semibold text-slate-900">{guardian.primaryPhone}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Mapped Students:</span>
                <span className="font-semibold text-purple-600">
                  {guardian.mappedStudentIds ? guardian.mappedStudentIds.length : 0} student(s)
                </span>
              </div>
            </div>

            <p className="text-[11px] text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100 font-medium">
              ⚠️ Warning: Deleting this guardian will remove their emergency contact references and family profile mapping.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Confirm Delete
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
