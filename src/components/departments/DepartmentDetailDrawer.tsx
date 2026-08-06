import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Building2,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Users,
  GraduationCap,
  Edit2,
  Trash2,
  ShieldCheck,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';
import { Department } from '../../types/department';
import { departmentApi } from '../../api/departmentApi';

interface DepartmentDetailDrawerProps {
  isOpen: boolean;
  department: Department | null;
  onClose: () => void;
  onEdit: (dept: Department) => void;
  onDelete: (dept: Department) => void;
}

export const DepartmentDetailDrawer: React.FC<DepartmentDetailDrawerProps> = ({
  isOpen,
  department,
  onClose,
  onEdit,
  onDelete
}) => {
  const [details, setDetails] = useState<
    (Department & { coursesList?: any[]; facultyList?: any[] }) | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && department) {
      fetchFullDetails(department.id);
    }
  }, [isOpen, department]);

  const fetchFullDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await departmentApi.getDepartmentById(id);
      if (res.success) {
        setDetails(res.data);
      }
    } catch (err) {
      console.error('Failed to load department details', err);
      setDetails(department as any);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !department) return null;

  const activeDept = details || department;

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
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#D4AF37] px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                    {activeDept.code}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      activeDept.status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {activeDept.status}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1 font-sans">{activeDept.name}</h2>
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
                <Users className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="text-lg font-bold text-white block">{activeDept.studentCount}</span>
                <span className="text-[10px] text-zinc-400 uppercase">Enrolled Students</span>
              </div>

              <div className="bg-black/60 border border-white/10 p-3.5 rounded-xl text-center">
                <GraduationCap className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                <span className="text-lg font-bold text-white block">{activeDept.facultyCount}</span>
                <span className="text-[10px] text-zinc-400 uppercase">Faculty Staff</span>
              </div>

              <div className="bg-black/60 border border-white/10 p-3.5 rounded-xl text-center">
                <BookOpen className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <span className="text-lg font-bold text-white block">{activeDept.coursesCount}</span>
                <span className="text-[10px] text-zinc-400 uppercase">Courses Offered</span>
              </div>
            </div>

            {/* HOD Card */}
            <div className="bg-gradient-to-br from-[#D4AF37]/10 via-black to-black border border-[#D4AF37]/30 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#D4AF37] font-semibold flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  Head of Department (HOD)
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Appointed Chair</span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37] text-black font-bold font-mono text-lg flex items-center justify-center shrink-0 shadow-lg">
                  {activeDept.headOfDepartment
                    ? activeDept.headOfDepartment
                        .split(' ')
                        .filter((p) => !p.includes('.'))
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2) || 'HD'
                    : 'HOD'}
                </div>

                <div className="space-y-1 flex-1">
                  <h3 className="text-sm font-bold text-white">{activeDept.headOfDepartment}</h3>
                  <p className="text-[11px] text-[#D4AF37] font-mono">
                    {activeDept.hodDesignation || 'Professor & Chair'}
                  </p>

                  <div className="pt-2 grid grid-cols-1 gap-1 text-[11px] text-zinc-300 font-mono">
                    {activeDept.hodEmail && (
                      <a
                        href={`mailto:${activeDept.hodEmail}`}
                        className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{activeDept.hodEmail}</span>
                      </a>
                    )}
                    {activeDept.hodPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{activeDept.hodPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Department Meta */}
            <div className="bg-black/60 border border-white/10 p-4 rounded-2xl space-y-3 font-mono">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block border-b border-white/10 pb-2">
                Department Logistics & Location
              </span>

              <div className="grid grid-cols-2 gap-3 text-zinc-300">
                <div className="space-y-0.5">
                  <span className="text-zinc-500 text-[10px] uppercase block">Building Location</span>
                  <div className="flex items-center gap-1.5 text-white">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{activeDept.buildingLocation || 'Main Academic Block'}</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-zinc-500 text-[10px] uppercase block">Established Year</span>
                  <div className="flex items-center gap-1.5 text-white">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{activeDept.establishedYear || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {activeDept.description && (
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <span className="text-zinc-500 text-[10px] uppercase block">Academic Vision & Description</span>
                  <p className="text-zinc-300 font-sans leading-relaxed text-xs">
                    {activeDept.description}
                  </p>
                </div>
              )}
            </div>

            {/* Associated Courses List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono">
                <span className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-semibold flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  Accredited Courses ({activeDept.coursesList?.length || activeDept.coursesCount})
                </span>
              </div>

              {activeDept.coursesList && activeDept.coursesList.length > 0 ? (
                <div className="space-y-2">
                  {activeDept.coursesList.map((course: any) => (
                    <div
                      key={course.id}
                      className="p-3 bg-black/60 border border-white/10 rounded-xl flex items-center justify-between hover:border-white/20 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-white font-mono flex items-center gap-2">
                          <span>{course.code}</span>
                          <span className="text-[10px] font-normal text-[#D4AF37] px-1.5 py-0.5 rounded bg-[#D4AF37]/10">
                            {course.credits} Credits
                          </span>
                        </div>
                        <div className="text-zinc-300 font-sans mt-0.5">{course.title}</div>
                      </div>
                      <div className="text-right font-mono text-[11px] text-zinc-400">
                        {course.enrolledStudents} Enrolled
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl text-center text-zinc-500 font-mono">
                  Standard curriculum courses assigned.
                </div>
              )}
            </div>

            {/* Associated Faculty Staff */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono">
                <span className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-semibold flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  Faculty Members ({activeDept.facultyList?.length || activeDept.facultyCount})
                </span>
              </div>

              {activeDept.facultyList && activeDept.facultyList.length > 0 ? (
                <div className="space-y-2">
                  {activeDept.facultyList.map((fac: any) => (
                    <div
                      key={fac.id}
                      className="p-3 bg-black/60 border border-white/10 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white">{fac.fullName}</div>
                        <div className="text-[11px] text-[#D4AF37] font-mono">{fac.designation}</div>
                      </div>
                      <div className="text-right font-mono text-[11px] text-zinc-400">
                        {fac.email}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl text-center text-zinc-500 font-mono">
                  Full faculty body assigned to department.
                </div>
              )}
            </div>
          </div>

          {/* Drawer Action Footer */}
          <div className="p-6 border-t border-white/10 bg-black/60 flex items-center justify-between gap-3 font-mono sticky bottom-0 z-10 backdrop-blur-md">
            <button
              onClick={() => {
                onClose();
                onDelete(activeDept);
              }}
              className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Department</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(activeDept);
              }}
              className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c49f27] text-black font-semibold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-lg shadow-[#D4AF37]/10"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Department</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
