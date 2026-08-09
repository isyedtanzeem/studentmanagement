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
  BookOpen,
  CreditCard,
  TrendingUp,
  Receipt,
  ExternalLink
} from 'lucide-react';

interface StudentProfileDrawerProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onOpenPDF: (student: Student) => void;
  onOpenSemestersModal?: (student: Student) => void;
  onOpenFeesModal?: (student: Student) => void;
}

export const StudentProfileDrawer: React.FC<StudentProfileDrawerProps> = ({
  student,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onOpenPDF,
  onOpenSemestersModal,
  onOpenFeesModal
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'fees' | 'documents' | 'guardian'>('overview');

  if (!isOpen || !student) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Graduated':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Inactive':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Suspended':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border-l border-slate-200 w-full max-w-xl h-full shadow-2xl flex flex-col relative overflow-hidden text-xs">
        {/* Header Banner */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Student Record Dossier</h3>
              <p className="text-[11px] text-slate-500 font-mono">{student.studentId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPDF(student)}
              className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-all font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Transcript / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Card Summary */}
        <div className="p-6 bg-slate-50/50 border-b border-slate-200 flex items-center gap-5 relative">
          <img
            src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={student.fullName}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-200 shadow-sm flex-shrink-0"
          />

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 truncate">{student.fullName}</h2>
              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase ${getStatusBadge(student.status)}`}>
                {student.status}
              </span>
            </div>

            <p className="text-slate-600 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="truncate">{student.department}</span>
            </p>

            <div className="flex items-center gap-4 text-slate-600 font-mono text-[11px] pt-1">
              <span>CGPA (10.0 Scale): <strong className="text-blue-700">{student.gpa.toFixed(2)}</strong></span>
              <span>Year: <strong className="text-slate-900">{student.enrollmentYear}</strong></span>
              <span>Gender: <strong className="text-slate-900">{student.gender}</strong></span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 font-mono text-[11px] overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('academic')}
            className={`py-3 px-3 border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'academic'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Semester Progress
          </button>
          <button
            onClick={() => setActiveTab('fees')}
            className={`py-3 px-3 border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'fees'
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Fees & Ledger
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-3 border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('guardian')}
            className={`py-3 px-3 border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'guardian'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Guardian
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onOpenSemestersModal && onOpenSemestersModal(student)}
                  className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Semester Progress</span>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <span className="text-sm font-bold text-slate-900 block mt-1">Manage Sem 1 to 8 Results</span>
                  <span className="text-[10px] text-slate-500 font-mono">Update SGPA, Grades & Promote</span>
                </button>

                <button
                  onClick={() => onOpenFeesModal && onOpenFeesModal(student)}
                  className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Fee Management</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <span className="text-sm font-bold text-slate-900 block mt-1">Fee Ledger & Collect Payment</span>
                  <span className="text-[10px] text-slate-500 font-mono">Record Payment & Print Receipt</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                <h4 className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-2">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block">Email Address</span>
                    <span className="font-mono text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      {student.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Phone Number</span>
                    <span className="font-mono text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      {student.phone || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Date of Birth</span>
                    <span className="font-mono text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {student.dateOfBirth || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Registered On</span>
                    <span className="font-mono text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(student.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Clearance Summary */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                <h4 className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-2">
                  Institutional Status & Clearance
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-slate-500 block text-[10px]">Academic Standing</span>
                    <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Good Standing
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-slate-500 block text-[10px]">Library & Fee Clearance</span>
                    <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1 mt-1">
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
                <div className="bg-white border border-slate-200 p-3.5 rounded-xl text-center shadow-xs">
                  <span className="text-slate-500 block text-[10px]">Cumulative GPA</span>
                  <span className="text-xl font-bold text-blue-600 font-mono mt-1 block">
                    {student.gpa.toFixed(2)}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 p-3.5 rounded-xl text-center shadow-xs">
                  <span className="text-slate-500 block text-[10px]">Credits Completed</span>
                  <span className="text-xl font-bold text-slate-900 font-mono mt-1 block">
                    {Math.round((2026 - student.enrollmentYear) * 32)} / 128
                  </span>
                </div>
                <div className="bg-white border border-slate-200 p-3.5 rounded-xl text-center shadow-xs">
                  <span className="text-slate-500 block text-[10px]">Class Rank</span>
                  <span className="text-xl font-bold text-emerald-600 font-mono mt-1 block">
                    Top {student.gpa >= 3.8 ? '5%' : student.gpa >= 3.5 ? '15%' : '30%'}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                <h4 className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-2">
                  Enrolled Courses & Semesters
                </h4>
                <ul className="divide-y divide-slate-100 font-mono text-[11px]">
                  <li className="py-2 flex items-center justify-between">
                    <span className="text-slate-900">CS-301 Data Structures & Algorithms</span>
                    <span className="text-emerald-600 font-semibold">Grade: A (4.0)</span>
                  </li>
                  <li className="py-2 flex items-center justify-between">
                    <span className="text-slate-900">CS-305 Database Management Systems</span>
                    <span className="text-emerald-600 font-semibold">Grade: A- (3.7)</span>
                  </li>
                  <li className="py-2 flex items-center justify-between">
                    <span className="text-slate-900">ENG-201 Advanced Software Architecture</span>
                    <span className="text-blue-600 font-semibold">Grade: B+ (3.3)</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-indigo-900 text-xs">Official Document Repository</h4>
                  <p className="text-[10px] text-indigo-700 font-mono">Academic & Identity Certificates</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold font-mono">
                  {(student.documents && student.documents.length) || 5} Documents Verified
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { title: 'Aadhaar Government Identity Card', type: 'Identity', date: '2024-07-15', status: 'Verified' },
                  { title: 'Class X Secondary Board Marksheet', type: 'Academic', date: '2024-07-15', status: 'Verified' },
                  { title: 'Class XII Senior Secondary Certificate', type: 'Academic', date: '2024-07-16', status: 'Verified' },
                  { title: 'Institutional Transfer Certificate (TC)', type: 'Transfer', date: '2024-07-18', status: 'Verified' },
                  { title: 'Official Academic Passport Photo', type: 'Photo ID', date: '2024-07-15', status: 'Verified' }
                ].map((doc, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between hover:border-blue-300 transition-all">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-slate-50 border border-slate-200 text-blue-600 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs">{doc.title}</h5>
                        <p className="text-[10px] text-slate-500 font-mono">{doc.type} • Uploaded {doc.date}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'guardian' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                <h4 className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-2">
                  Emergency Contact / Guardian
                </h4>
                <div className="space-y-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block">Guardian Name</span>
                    <span className="text-slate-900 font-medium">{student.guardianName || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Guardian Phone</span>
                    <span className="text-slate-900 font-mono">{student.guardianPhone || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
                <h4 className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-2">
                  Residential Address
                </h4>
                <p className="text-slate-700 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>{student.address || 'No primary address recorded on file.'}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onDelete(student);
              onClose();
            }}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-rose-700 transition-all font-medium flex items-center gap-2 cursor-pointer"
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
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-slate-800 transition-all font-medium flex items-center gap-2 cursor-pointer"
            >
              <Edit2 className="w-4 h-4 text-blue-600" />
              <span>Edit Record</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
