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
  Trash2
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
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                    {activeDept.code}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                      activeDept.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {activeDept.status}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">{activeDept.name}</h2>
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
                <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="text-lg font-bold text-slate-900 block">{activeDept.studentCount}</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Students</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
                <GraduationCap className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                <span className="text-lg font-bold text-slate-900 block">{activeDept.facultyCount}</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Faculty Staff</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
                <BookOpen className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                <span className="text-lg font-bold text-slate-900 block">{activeDept.coursesCount}</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Courses Offered</span>
              </div>
            </div>

            {/* HOD Card */}
            <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                <span className="text-xs uppercase tracking-wide text-blue-900 font-bold flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Head of Department (HOD)
                </span>
                <span className="text-[10px] text-blue-800 font-mono font-medium">Appointed Chair</span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-bold font-mono text-base flex items-center justify-center shrink-0 shadow-sm">
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
                  <h3 className="text-sm font-bold text-slate-900">{activeDept.headOfDepartment}</h3>
                  <p className="text-xs text-blue-700 font-semibold">
                    {activeDept.hodDesignation || 'Professor & Chair'}
                  </p>

                  <div className="pt-2 grid grid-cols-1 gap-1 text-xs text-slate-700">
                    {activeDept.hodEmail && (
                      <a
                        href={`mailto:${activeDept.hodEmail}`}
                        className="flex items-center gap-2 hover:text-blue-700 transition-colors font-medium"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{activeDept.hodEmail}</span>
                      </a>
                    )}
                    {activeDept.hodPhone && (
                      <div className="flex items-center gap-2 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{activeDept.hodPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Department Meta */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
              <span className="text-xs uppercase tracking-wider text-slate-800 font-bold block border-b border-slate-200 pb-2">
                Department Logistics & Location
              </span>

              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <div className="space-y-0.5">
                  <span className="text-slate-500 text-[10px] uppercase block font-medium">Building Location</span>
                  <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{activeDept.buildingLocation || 'Main Academic Block'}</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-500 text-[10px] uppercase block font-medium">Established Year</span>
                  <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{activeDept.establishedYear || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {activeDept.description && (
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase block font-medium">Academic Vision & Description</span>
                  <p className="text-slate-700 leading-relaxed text-xs">
                    {activeDept.description}
                  </p>
                </div>
              )}
            </div>

            {/* Associated Courses List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-slate-800 font-bold flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Accredited Courses ({activeDept.coursesList?.length || activeDept.coursesCount})
                </span>
              </div>

              {activeDept.coursesList && activeDept.coursesList.length > 0 ? (
                <div className="space-y-2">
                  {activeDept.coursesList.map((course: any) => (
                    <div
                      key={course.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:border-blue-300 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-slate-900 font-mono flex items-center gap-2">
                          <span>{course.code}</span>
                          <span className="text-[10px] font-normal text-blue-700 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">
                            {course.credits} Credits
                          </span>
                        </div>
                        <div className="text-slate-700 mt-0.5 font-medium">{course.title}</div>
                      </div>
                      <div className="text-right font-mono text-xs text-slate-500">
                        {course.enrolledStudents} Enrolled
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 font-medium">
                  Standard curriculum courses assigned.
                </div>
              )}
            </div>

            {/* Associated Faculty Staff */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-slate-800 font-bold flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Faculty Members ({activeDept.facultyList?.length || activeDept.facultyCount})
                </span>
              </div>

              {activeDept.facultyList && activeDept.facultyList.length > 0 ? (
                <div className="space-y-2">
                  {activeDept.facultyList.map((fac: any) => (
                    <div
                      key={fac.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{fac.fullName}</div>
                        <div className="text-xs text-blue-700 font-medium">{fac.designation}</div>
                      </div>
                      <div className="text-right text-xs text-slate-500 font-mono">
                        {fac.email}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 font-medium">
                  Full faculty body assigned to department.
                </div>
              )}
            </div>
          </div>

          {/* Drawer Action Footer */}
          <div className="p-6 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between gap-3 font-medium sticky bottom-0 z-10 backdrop-blur-md">
            <button
              onClick={() => {
                onClose();
                onDelete(activeDept);
              }}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Department</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(activeDept);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20 cursor-pointer"
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
