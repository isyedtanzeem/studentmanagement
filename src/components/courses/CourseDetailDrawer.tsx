import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  BookOpen,
  Building2,
  Clock,
  DollarSign,
  Award,
  Users,
  GraduationCap,
  Edit2,
  Trash2,
  FileText
} from 'lucide-react';
import { Course } from '../../types/course';
import { courseApi } from '../../api/courseApi';

interface CourseDetailDrawerProps {
  isOpen: boolean;
  course: Course | null;
  onClose: () => void;
  onEdit: (crs: Course) => void;
  onDelete: (crs: Course) => void;
}

export const CourseDetailDrawer: React.FC<CourseDetailDrawerProps> = ({
  isOpen,
  course,
  onClose,
  onEdit,
  onDelete
}) => {
  const [details, setDetails] = useState<
    (Course & { enrolledStudentsCount?: number; enrolledStudentsList?: any[]; departmentInfo?: any }) | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && course) {
      fetchFullDetails(course.id);
    }
  }, [isOpen, course]);

  const fetchFullDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await courseApi.getCourseById(id);
      if (res.success) {
        setDetails(res.data);
      }
    } catch (err) {
      console.error('Failed to load course details', err);
      setDetails(course as any);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !course) return null;

  const activeCourse = details || course;
  const courseFee = activeCourse.courseFee || 0;
  const labFee = activeCourse.labFee || 0;
  const totalFee = activeCourse.totalFee || (courseFee + labFee);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-xl bg-white border-l border-slate-200 h-full overflow-y-auto flex flex-col shadow-2xl"
        >
          {/* Top Bar Header */}
          <div className="p-6 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                    {activeCourse.code}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                      activeCourse.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {activeCourse.status || 'Active'}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">{activeCourse.title}</h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 space-y-6 flex-1 text-xs">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 font-mono">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
                <Clock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-900 block truncate">{activeCourse.duration || '4 Years'}</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Duration</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
                <Award className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                <span className="text-lg font-bold text-slate-900 block">{activeCourse.credits}</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Credits</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
                <Users className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                <span className="text-lg font-bold text-slate-900 block">
                  {activeCourse.enrolledStudentsCount || activeCourse.enrolledStudents}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Enrolled</span>
              </div>
            </div>

            {/* Course Fee Structure Card */}
            <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                <span className="text-xs font-bold uppercase tracking-wide text-blue-900 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  Academic Fee Structure
                </span>
                <span className="text-xs font-bold text-blue-900 bg-white border border-blue-200 px-2.5 py-0.5 rounded-md font-mono">
                  Total: ₹{totalFee.toLocaleString('en-IN')} / Sem
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <div className="bg-white border border-blue-100 p-2.5 rounded-xl">
                  <span className="text-slate-500 text-[10px] uppercase font-medium block">Tuition Fee</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block font-mono">₹{courseFee.toLocaleString('en-IN')}</span>
                </div>

                <div className="bg-white border border-blue-100 p-2.5 rounded-xl">
                  <span className="text-slate-500 text-[10px] uppercase font-medium block">Lab & Exam Fee</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block font-mono">₹{labFee.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Department Mapping & Program Details */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block border-b border-slate-200 pb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                Department & Academic Mapping
              </span>

              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <div className="space-y-0.5">
                  <span className="text-slate-500 text-[10px] uppercase block font-medium">Mapped Department</span>
                  <div className="text-slate-900 font-semibold">{activeCourse.department}</div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-500 text-[10px] uppercase block font-medium">Degree Program</span>
                  <div className="text-slate-900 font-semibold">{activeCourse.degreeProgram || 'B.Tech'}</div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-500 text-[10px] uppercase block font-medium">Academic Level</span>
                  <div className="text-blue-700 font-semibold">{activeCourse.level || 'Undergraduate'}</div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-500 text-[10px] uppercase block font-medium">Primary Faculty Lead</span>
                  <div className="text-indigo-700 font-semibold">{activeCourse.instructorName || 'Faculty Chair'}</div>
                </div>
              </div>
            </div>

            {/* Syllabus & Prerequisites */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block border-b border-slate-200 pb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-600" />
                Syllabus & Prerequisites
              </span>

              {activeCourse.prerequisites && (
                <div className="space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase block font-medium">Prerequisites</span>
                  <p className="text-slate-800 bg-amber-50 border border-amber-200 p-2 rounded-lg text-xs font-medium">
                    {activeCourse.prerequisites}
                  </p>
                </div>
              )}

              {activeCourse.description ? (
                <div className="space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase block font-medium">Course Summary</span>
                  <p className="text-slate-700 leading-relaxed text-xs">
                    {activeCourse.description}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400 italic text-xs">No detailed syllabus text added yet.</p>
              )}
            </div>

            {/* Enrolled Students Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Enrolled Students Preview
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-medium">
                  {activeCourse.enrolledStudentsCount || activeCourse.enrolledStudents} Registered
                </span>
              </div>

              {activeCourse.enrolledStudentsList && activeCourse.enrolledStudentsList.length > 0 ? (
                <div className="space-y-2">
                  {activeCourse.enrolledStudentsList.map((s: any) => (
                    <div
                      key={s.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{s.fullName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{s.rollNumber} • {s.batchYear}</div>
                      </div>
                      <div className="text-right text-xs font-medium text-blue-700">
                        {s.academicTerm || 'Enrolled'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 font-medium">
                  Active batch roster assigned.
                </div>
              )}
            </div>
          </div>

          {/* Drawer Action Footer */}
          <div className="p-6 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between gap-3 font-medium sticky bottom-0 z-10 backdrop-blur-md">
            <button
              onClick={() => {
                onClose();
                onDelete(activeCourse);
              }}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Course</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(activeCourse);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Course</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
