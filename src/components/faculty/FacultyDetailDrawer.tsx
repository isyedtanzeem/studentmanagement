import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserCheck, Mail, Phone, Building2, Calendar, Award, BookOpen, Clock } from 'lucide-react';
import { Faculty } from '../../types/faculty';

interface FacultyDetailDrawerProps {
  isOpen: boolean;
  faculty: Faculty | null;
  onClose: () => void;
  onEdit?: (faculty: Faculty) => void;
}

export const FacultyDetailDrawer: React.FC<FacultyDetailDrawerProps> = ({
  isOpen,
  faculty,
  onClose,
  onEdit
}) => {
  if (!isOpen || !faculty) return null;

  const designationBadge = {
    HOD: 'bg-purple-100 text-purple-800 border-purple-200',
    Professor: 'bg-blue-100 text-blue-800 border-blue-200',
    'Asst. Professor': 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }[faculty.designation] || 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-white border-l border-slate-200 w-full max-w-lg h-full flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 uppercase font-mono tracking-wider">
                  Faculty Dossier Profile
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  {faculty.employeeId}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {/* Identity Card */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shadow-md flex-shrink-0">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-blue-700 font-bold text-xl font-mono">
                    {faculty.fullName.charAt(0)}
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-mono">{faculty.fullName}</h3>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${designationBadge}`}>
                    {faculty.designation}
                  </span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border ${
                faculty.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {faculty.status}
              </span>
            </div>

            {/* Contact Details */}
            <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                Contact & Communication
              </h4>
              <div className="space-y-2 text-slate-700 font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Official Email:</span>
                  <a href={`mailto:${faculty.email}`} className="text-blue-600 hover:underline font-mono">
                    {faculty.email}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Phone Contact:</span>
                  <span className="text-slate-900 font-mono">{faculty.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Department & Qualification */}
            <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Academic Department & Credentials
              </h4>
              <div className="space-y-2 text-slate-700">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Department Assignment</span>
                  <strong className="text-slate-900 text-sm">{faculty.department}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Highest Qualification</span>
                  <span className="text-indigo-700 font-medium">{faculty.qualification || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500 text-[10px] uppercase font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date Joined:
                  </span>
                  <span className="text-slate-900 font-mono font-medium">{faculty.joiningDate || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Courses Taught */}
            {faculty.coursesTaught && faculty.coursesTaught.length > 0 && (
              <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Assigned Curriculum Courses ({faculty.coursesTaught.length})
                </h4>
                <div className="space-y-2">
                  {faculty.coursesTaught.map((c: any) => (
                    <div key={c.id} className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">{c.courseName}</span>
                        <span className="text-[10px] font-mono text-slate-500">{c.courseCode} • {c.credits} Credits</span>
                      </div>
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">
                        Semester {c.semester}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Footer Action */}
          <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-slate-500 font-mono text-[11px]">Record ID: {faculty.id}</span>
            {onEdit && (
              <button
                onClick={() => onEdit(faculty)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
              >
                Edit Profile
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
