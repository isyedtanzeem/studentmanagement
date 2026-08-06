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
  CheckCircle2,
  User,
  Layers,
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
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-xl bg-[#0d0d12] border-l border-white/10 h-full overflow-y-auto flex flex-col shadow-2xl"
        >
          {/* Top Bar Header */}
          <div className="p-6 border-b border-white/10 bg-black/40 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#D4AF37] px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                    {activeCourse.code}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      activeCourse.status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {activeCourse.status || 'Active'}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white mt-1 font-sans">{activeCourse.title}</h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 space-y-6 flex-1 text-xs">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 font-mono">
              <div className="bg-black/60 border border-white/10 p-3.5 rounded-xl text-center">
                <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="text-xs font-bold text-white block truncate">{activeCourse.duration || '4 Years'}</span>
                <span className="text-[10px] text-zinc-400 uppercase">Duration</span>
              </div>

              <div className="bg-black/60 border border-white/10 p-3.5 rounded-xl text-center">
                <Award className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <span className="text-lg font-bold text-white block">{activeCourse.credits}</span>
                <span className="text-[10px] text-zinc-400 uppercase">Credits</span>
              </div>

              <div className="bg-black/60 border border-white/10 p-3.5 rounded-xl text-center">
                <Users className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                <span className="text-lg font-bold text-white block">
                  {activeCourse.enrolledStudentsCount || activeCourse.enrolledStudents}
                </span>
                <span className="text-[10px] text-zinc-400 uppercase">Enrolled</span>
              </div>
            </div>

            {/* Course Fee Structure Card */}
            <div className="bg-gradient-to-br from-[#D4AF37]/10 via-black to-black border border-[#D4AF37]/30 p-4 rounded-2xl space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-semibold flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  Academic Fee Structure
                </span>
                <span className="text-xs font-bold text-white bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-2.5 py-0.5 rounded-md">
                  Total: ₹{totalFee.toLocaleString('en-IN')} / Sem
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-zinc-300">
                <div className="bg-black/40 border border-white/10 p-2.5 rounded-xl">
                  <span className="text-zinc-500 text-[10px] block uppercase">Tuition Fee</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">₹{courseFee.toLocaleString('en-IN')}</span>
                </div>

                <div className="bg-black/40 border border-white/10 p-2.5 rounded-xl">
                  <span className="text-zinc-500 text-[10px] block uppercase">Lab & Examination Fee</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">₹{labFee.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Department Mapping & Program Details */}
            <div className="bg-black/60 border border-white/10 p-4 rounded-2xl space-y-3 font-mono">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block border-b border-white/10 pb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#D4AF37]" />
                Department & Academic Mapping
              </span>

              <div className="grid grid-cols-2 gap-3 text-zinc-300">
                <div className="space-y-0.5">
                  <span className="text-zinc-500 text-[10px] uppercase block">Mapped Department</span>
                  <div className="text-white font-semibold">{activeCourse.department}</div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-zinc-500 text-[10px] uppercase block">Degree Program</span>
                  <div className="text-white font-semibold">{activeCourse.degreeProgram || 'B.Tech'}</div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-zinc-500 text-[10px] uppercase block">Academic Level</span>
                  <div className="text-amber-400">{activeCourse.level || 'Undergraduate'}</div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-zinc-500 text-[10px] uppercase block">Primary Faculty Lead</span>
                  <div className="text-sky-300">{activeCourse.instructorName || 'Faculty Chair'}</div>
                </div>
              </div>
            </div>

            {/* Syllabus & Prerequisites */}
            <div className="bg-black/60 border border-white/10 p-4 rounded-2xl space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block border-b border-white/10 pb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-400" />
                Syllabus & Prerequisites
              </span>

              {activeCourse.prerequisites && (
                <div className="space-y-1 font-mono">
                  <span className="text-zinc-500 text-[10px] uppercase block">Prerequisites</span>
                  <p className="text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg text-xs">
                    {activeCourse.prerequisites}
                  </p>
                </div>
              )}

              {activeCourse.description ? (
                <div className="space-y-1">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase block">Course Summary</span>
                  <p className="text-zinc-300 font-sans leading-relaxed text-xs">
                    {activeCourse.description}
                  </p>
                </div>
              ) : (
                <p className="text-zinc-500 italic font-mono text-xs">No detailed syllabus text added yet.</p>
              )}
            </div>

            {/* Enrolled Students Preview */}
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-semibold flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  Enrolled Students Preview
                </span>
                <span className="text-[10px] text-zinc-400">
                  {activeCourse.enrolledStudentsCount || activeCourse.enrolledStudents} Registered
                </span>
              </div>

              {activeCourse.enrolledStudentsList && activeCourse.enrolledStudentsList.length > 0 ? (
                <div className="space-y-2">
                  {activeCourse.enrolledStudentsList.map((s: any) => (
                    <div
                      key={s.id}
                      className="p-3 bg-black/60 border border-white/10 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white">{s.fullName}</div>
                        <div className="text-[10px] text-zinc-400">{s.rollNumber} • {s.batchYear}</div>
                      </div>
                      <div className="text-right text-[11px] text-[#D4AF37]">
                        {s.academicTerm || 'Enrolled'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl text-center text-zinc-500">
                  Active batch roster assigned.
                </div>
              )}
            </div>
          </div>

          {/* Drawer Action Footer */}
          <div className="p-6 border-t border-white/10 bg-black/60 flex items-center justify-between gap-3 font-mono sticky bottom-0 z-10 backdrop-blur-md">
            <button
              onClick={() => {
                onClose();
                onDelete(activeCourse);
              }}
              className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Course</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(activeCourse);
              }}
              className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c49f27] text-black font-semibold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-lg shadow-[#D4AF37]/10"
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
