import React, { useState } from 'react';
import { Student } from '../../types/student';
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  MapPin,
  GraduationCap,
  Award,
  Shield,
  FileText,
  Printer,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  QrCode,
  BookOpen
} from 'lucide-react';

interface StudentProfileDrawerProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onOpenPDF: (student: Student) => void;
}

export const StudentProfileDrawer: React.FC<StudentProfileDrawerProps> = ({
  student,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onOpenPDF
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'guardian'>('overview');

  if (!isOpen || !student) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Graduated':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Inactive':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Suspended':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0b0b10] border-l border-white/10 w-full max-w-xl h-full shadow-2xl flex flex-col relative overflow-hidden text-xs">
        {/* Header Banner */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-black/80 via-[#151520] to-black/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white serif-font">Student Record Dossier</h3>
              <p className="text-[11px] text-zinc-400 font-mono">{student.studentId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPDF(student)}
              className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all font-medium flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Transcript / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Card Summary */}
        <div className="p-6 bg-white/5 border-b border-white/10 flex items-center gap-5 relative">
          <img
            src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={student.fullName}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-[#D4AF37]/50 shadow-lg flex-shrink-0"
          />

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-light text-white serif-font truncate">{student.fullName}</h2>
              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium uppercase ${getStatusBadge(student.status)}`}>
                {student.status}
              </span>
            </div>

            <p className="text-zinc-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="truncate">{student.department}</span>
            </p>

            <div className="flex items-center gap-4 text-zinc-400 font-mono text-[11px] pt-1">
              <span>CGPA (10.0 Scale): <strong className="text-[#D4AF37]">{student.gpa.toFixed(2)}</strong></span>
              <span>Year: <strong className="text-white">{student.enrollmentYear}</strong></span>
              <span>Gender: <strong className="text-white">{student.gender}</strong></span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-white/10 bg-black/40 px-6 font-mono text-[11px]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 font-medium transition-all ${
              activeTab === 'overview'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Overview & Contact
          </button>
          <button
            onClick={() => setActiveTab('academic')}
            className={`py-3 px-4 border-b-2 font-medium transition-all ${
              activeTab === 'academic'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Academic Performance
          </button>
          <button
            onClick={() => setActiveTab('guardian')}
            className={`py-3 px-4 border-b-2 font-medium transition-all ${
              activeTab === 'guardian'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Guardian & Address
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-black/60 border border-white/10 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-white uppercase text-[10px] tracking-wider text-zinc-400 border-b border-white/10 pb-2">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-300">
                  <div>
                    <span className="text-zinc-500 block">Email Address</span>
                    <span className="font-mono text-white flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {student.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Phone Number</span>
                    <span className="font-mono text-white flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {student.phone || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Date of Birth</span>
                    <span className="font-mono text-white flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      {student.dateOfBirth || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Registered On</span>
                    <span className="font-mono text-white flex items-center gap-1.5 mt-0.5">
                      <Shield className="w-3.5 h-3.5 text-zinc-400" />
                      {new Date(student.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Clearance Summary */}
              <div className="bg-black/60 border border-white/10 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-white uppercase text-[10px] tracking-wider text-zinc-400 border-b border-white/10 pb-2">
                  Institutional Status & Clearance
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-zinc-400 block text-[10px]">Academic Standing</span>
                    <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Good Standing
                    </span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-zinc-400 block text-[10px]">Library & Fee Clearance</span>
                    <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Fully Cleared
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/60 border border-white/10 p-3.5 rounded-xl text-center">
                  <span className="text-zinc-400 block text-[10px]">Cumulative GPA</span>
                  <span className="text-xl font-bold text-[#D4AF37] font-mono mt-1 block">
                    {student.gpa.toFixed(2)}
                  </span>
                </div>
                <div className="bg-black/60 border border-white/10 p-3.5 rounded-xl text-center">
                  <span className="text-zinc-400 block text-[10px]">Credits Completed</span>
                  <span className="text-xl font-bold text-white font-mono mt-1 block">
                    {Math.round((2026 - student.enrollmentYear) * 32)} / 128
                  </span>
                </div>
                <div className="bg-black/60 border border-white/10 p-3.5 rounded-xl text-center">
                  <span className="text-zinc-400 block text-[10px]">Class Rank</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">
                    Top {student.gpa >= 3.8 ? '5%' : student.gpa >= 3.5 ? '15%' : '30%'}
                  </span>
                </div>
              </div>

              <div className="bg-black/60 border border-white/10 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-white uppercase text-[10px] tracking-wider text-zinc-400 border-b border-white/10 pb-2">
                  Enrolled Courses & Semesters
                </h4>
                <ul className="divide-y divide-white/5 font-mono text-[11px]">
                  <li className="py-2 flex items-center justify-between">
                    <span className="text-white">CS-301 Data Structures & Algorithms</span>
                    <span className="text-emerald-400 font-semibold">Grade: A (4.0)</span>
                  </li>
                  <li className="py-2 flex items-center justify-between">
                    <span className="text-white">CS-305 Database Management Systems</span>
                    <span className="text-emerald-400 font-semibold">Grade: A- (3.7)</span>
                  </li>
                  <li className="py-2 flex items-center justify-between">
                    <span className="text-white">ENG-201 Advanced Software Architecture</span>
                    <span className="text-amber-400 font-semibold">Grade: B+ (3.3)</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'guardian' && (
            <div className="space-y-4">
              <div className="bg-black/60 border border-white/10 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-white uppercase text-[10px] tracking-wider text-zinc-400 border-b border-white/10 pb-2">
                  Emergency Contact / Guardian
                </h4>
                <div className="space-y-2 text-zinc-300">
                  <div>
                    <span className="text-zinc-500 block">Guardian Name</span>
                    <span className="text-white font-medium">{student.guardianName || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Guardian Phone</span>
                    <span className="text-white font-mono">{student.guardianPhone || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/60 border border-white/10 rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-white uppercase text-[10px] tracking-wider text-zinc-400 border-b border-white/10 pb-2">
                  Residential Address
                </h4>
                <p className="text-zinc-300 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <span>{student.address || 'No primary address recorded on file.'}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="p-6 border-t border-white/10 bg-black/60 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onDelete(student);
              onClose();
            }}
            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400 hover:text-rose-300 transition-all font-medium flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Student</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onEdit(student);
                onClose();
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all font-medium flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4 text-[#D4AF37]" />
              <span>Edit Record</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
