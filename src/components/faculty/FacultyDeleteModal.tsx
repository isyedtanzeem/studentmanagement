import React, { useState } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { Faculty } from '../../types/faculty';

interface FacultyDeleteModalProps {
  isOpen: boolean;
  faculty: Faculty | null;
  onClose: () => void;
  onConfirmDelete: (id: string) => Promise<void>;
}

export const FacultyDeleteModal: React.FC<FacultyDeleteModalProps> = ({
  isOpen,
  faculty,
  onClose,
  onConfirmDelete
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !faculty) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await onConfirmDelete(faculty.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete faculty record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Remove Faculty Member</h3>
              <p className="text-xs text-slate-500 font-mono">{faculty.employeeId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <div className="space-y-2 text-xs text-slate-600">
          <p>
            Are you sure you want to remove <strong className="text-slate-900">{faculty.fullName}</strong> ({faculty.designation}) from <strong className="text-slate-900">{faculty.department}</strong>?
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] font-medium">
            This action will purge this faculty profile from the active faculty register.
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-100 text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            {loading ? 'Removing...' : 'Confirm Remove'}
          </button>
        </div>
      </div>
    </div>
  );
};
