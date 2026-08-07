import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { Department } from '../../types/department';
import { departmentApi } from '../../api/departmentApi';

interface DepartmentDeleteModalProps {
  isOpen: boolean;
  department: Department | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DepartmentDeleteModal: React.FC<DepartmentDeleteModalProps> = ({
  isOpen,
  department,
  onClose,
  onSuccess
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !department) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await departmentApi.deleteDepartment(department.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete department.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-white border border-rose-200 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-rose-100 bg-rose-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Department</h3>
                <p className="text-xs text-rose-700 font-mono font-medium">{department.code} • {department.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 text-xs font-sans">
            {errorMessage ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-mono space-y-1">
                <div className="font-semibold text-rose-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Deletion Prevented</span>
                </div>
                <p className="text-[11px] leading-relaxed">{errorMessage}</p>
              </div>
            ) : (
              <p className="text-slate-700 leading-relaxed font-medium">
                Are you sure you want to permanently delete the <strong className="text-slate-900">{department.name}</strong> department record?
                This operation will remove department metrics, HOD assignments, and curriculum mapping.
              </p>
            )}

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Enrolled Students:</span>
                <span className={department.studentCount > 0 ? 'text-amber-700 font-bold' : 'text-slate-900 font-medium'}>
                  {department.studentCount}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Faculty Members:</span>
                <span className="text-slate-900 font-medium">{department.facultyCount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Accredited Courses:</span>
                <span className="text-slate-900 font-medium">{department.coursesCount}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3 font-medium">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm shadow-rose-500/20 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
