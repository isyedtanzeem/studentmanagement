import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { Course } from '../../types/course';
import { courseApi } from '../../api/courseApi';

interface CourseDeleteModalProps {
  isOpen: boolean;
  course: Course | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CourseDeleteModal: React.FC<CourseDeleteModalProps> = ({
  isOpen,
  course,
  onClose,
  onSuccess
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !course) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await courseApi.deleteCourse(course.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete course.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-[#0d0d12] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10 bg-red-950/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono">Delete Academic Course</h3>
                <p className="text-xs text-red-300 font-mono">{course.code} • {course.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 text-xs font-sans">
            {errorMessage ? (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-mono space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>Deletion Prevented</span>
                </div>
                <p className="text-[11px] leading-relaxed">{errorMessage}</p>
              </div>
            ) : (
              <p className="text-zinc-300 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-white">{course.code} ({course.title})</strong>?
                This will remove syllabus mappings, credit structures, and fee configurations.
              </p>
            )}

            <div className="bg-black/60 border border-white/10 p-3 rounded-xl space-y-2 font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Department Mapping:</span>
                <span className="text-white font-medium">{course.department}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Course Duration:</span>
                <span className="text-amber-400">{course.duration || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Total Semester Fee:</span>
                <span className="text-white font-bold">₹{(course.totalFee || (course.courseFee || 0)).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Enrolled Students:</span>
                <span className={course.enrolledStudents > 0 ? 'text-amber-400 font-bold' : 'text-white'}>
                  {course.enrolledStudents}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-5 border-t border-white/10 bg-black/40 flex items-center justify-end gap-3 font-mono text-xs">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
