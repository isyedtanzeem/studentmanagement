import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentApi } from '../../api/studentApi';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Download,
  Upload,
  User,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  QrCode,
  Printer,
  Sparkles,
  TrendingUp,
  Award,
  Bell,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Layers,
  FileCheck,
  Percent
} from 'lucide-react';

interface StudentPortalViewProps {}

export const StudentPortalView: React.FC<StudentPortalViewProps> = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'courses' | 'attendance' | 'idcard' | 'documents' | 'notices' | 'profile'
  >('overview');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portalData, setPortalData] = useState<any>(null);

  // Document Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadDocType, setUploadDocType] = useState('Assignment / Medical');
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Print ID Card Modal
  const [isPrintIdOpen, setIsPrintIdOpen] = useState(false);

  const loadPortalData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentApi.getMyPortalData();
      if (res.success) {
        setPortalData(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sync student portal data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, []);

  const student = portalData?.student || {
    studentId: user?.employeeId || user?.studentId || '2024CSE1001',
    fullName: user?.fullName || 'Aarav Sharma',
    email: user?.email || 'student@scholarcore.edu.in',
    phone: '+91 98765 43210',
    department: 'Computer Science & Engineering',
    status: 'Active',
    enrollmentYear: 2024,
    currentSemester: 3,
    academicBatch: '2024-2028',
    gpa: 8.95,
    attendancePercentage: 88.5,
    guardianName: 'Rajesh Sharma',
    guardianPhone: '+91 98112 34567',
    address: 'B-104, Vasant Kunj, New Delhi, Delhi 110070',
    photoUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250'
  };

  const courses = portalData?.enrolledCourses || [];
  const subjectAttendance = portalData?.subjectAttendance || [];
  const weeklySchedule = portalData?.weeklySchedule || [];
  const documents = portalData?.documents || [];
  const notices = portalData?.notices || [];

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDocName.trim()) return;

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: uploadDocName,
      category: uploadDocType,
      date: new Date().toISOString().split('T')[0],
      status: 'Submitted'
    };

    if (portalData) {
      setPortalData({
        ...portalData,
        documents: [newDoc, ...(portalData.documents || [])]
      });
    }

    setUploadSuccess(`Document "${uploadDocName}" uploaded successfully to Student Vault.`);
    setTimeout(() => {
      setUploadSuccess(null);
      setIsUploadModalOpen(false);
      setUploadDocName('');
    }, 1500);
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. Student Academic Hero Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-lg relative overflow-hidden">
        {/* Top Decorative Blue Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Profile Basic Info */}
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <img
                src={student.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250'}
                alt={student.fullName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-600 shadow-md shadow-blue-500/10"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Active Student Session" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-slate-900 serif-font tracking-tight">
                  {student.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  {student.status} • Regular
                </span>
                <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-bold">
                  Roll No: {student.studentId}
                </span>
              </div>

              <p className="text-xs text-slate-500 font-mono flex flex-wrap items-center gap-2">
                <span>{student.email}</span>
                <span>•</span>
                <span>ABC ID: ABC-9821-4412</span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 pt-1">
                <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  {student.department}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 font-mono">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  Sem {student.currentSemester} ({student.academicBatch})
                </span>
                <span className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-800 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Fee Clearance: 100% Paid
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <button
              onClick={() => setActiveTab('idcard')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-2 shadow-md shadow-blue-500/20"
            >
              <CreditCard className="w-4 h-4 text-white" />
              <span>Digital ID Card</span>
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs text-slate-700 transition-all flex items-center gap-2 font-medium"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Upload Document</span>
            </button>

            <button
              onClick={loadPortalData}
              disabled={loading}
              className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-slate-600 hover:text-blue-600 transition-all"
              title="Refresh Portal Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* 2. KPI Cards - Student Perspective Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CGPA */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl relative overflow-hidden group hover:border-blue-300 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Academic CGPA</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono flex items-baseline gap-1">
                {student.gpa}
                <span className="text-xs text-slate-400 font-normal">/ 10.0</span>
              </h3>
              <p className="text-[11px] text-blue-700 mt-1 flex items-center gap-1 font-semibold">
                <Award className="w-3.5 h-3.5" /> Grade A+ • Distinction
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
            Ranked #4 in {student.department}
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-300 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Overall Attendance</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
                {student.attendancePercentage}%
              </h3>
              <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Above 75% Limit
              </p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
            Current Semester Department Lectures
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl relative overflow-hidden group hover:border-indigo-300 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Active Subjects</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                {courses.length} Courses
              </h3>
              <p className="text-[11px] text-blue-600 mt-1 flex items-center gap-1 font-semibold">
                <BookOpen className="w-3.5 h-3.5" /> {courses.reduce((acc: number, c: any) => acc + (c.credits || 3), 0)} Total Credits
              </p>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
            Department of {student.department}
          </div>
        </div>

        {/* Fee Status */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl relative overflow-hidden group hover:border-blue-300 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Semester Fee Status</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
                ₹1,25,000
              </h3>
              <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-semibold">
                <FileCheck className="w-3.5 h-3.5" /> Cleared • No Dues
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-600">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
            Receipt #REC-{student.studentId} Verified
          </div>
        </div>
      </div>

      {/* 3. Navigation Perspective Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'overview', label: 'My Enrolled Courses & Schedule', icon: BookOpen },
          { id: 'attendance', label: 'Attendance & Performance', icon: TrendingUp },
          { id: 'idcard', label: 'Digital Student ID Card', icon: CreditCard },
          { id: 'documents', label: 'My Documents Vault', icon: FileText },
          { id: 'notices', label: 'Notices & Circulars', icon: Bell, badge: notices.length },
          { id: 'profile', label: 'My Profile & Emergency Info', icon: User }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Content Areas */}

      {/* TAB 1: Enrolled Courses & Schedule */}
      {(activeTab === 'overview' || activeTab === 'courses') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Current Semester Enrolled Subjects</h2>
              <p className="text-xs text-slate-500">Registered courses for Spring 2026 Semester {student.currentSemester || 1}</p>
            </div>
            <span className="text-xs font-mono text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg font-semibold">
              Batch {student.academicBatch || '2026-2030'} • {student.department}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course: any, idx: number) => (
              <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3 hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono text-xs font-semibold">
                    {course.code}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    {course.credits || 4} Credits
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 leading-snug">{course.title}</h3>

                <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100 font-mono">
                  <p className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Faculty: {course.instructorName || course.faculty || 'Department Faculty'}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Department: {course.department}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Status: {course.status || 'Active'}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Timetable Grid */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Weekly Academic Time-Table Schedule
              </h3>
              <span className="text-xs text-slate-500 font-mono">Spring 2026 Session</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Day</th>
                    <th className="p-3">Time Slot</th>
                    <th className="p-3">Course / Subject</th>
                    <th className="p-3">Classroom / Lab</th>
                    <th className="p-3">Faculty Instructor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                  {weeklySchedule.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold text-blue-700">{item.day}</td>
                      <td className="p-3 text-slate-500">{item.time}</td>
                      <td className="p-3 font-medium text-slate-900">{item.subject}</td>
                      <td className="p-3 text-slate-600">{item.room}</td>
                      <td className="p-3 text-slate-600">{item.instructor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Attendance & Performance */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Subject-Wise Attendance Breakdown</h3>
                <p className="text-xs text-slate-500">Minimum 75% attendance required for semester end-term examinations</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-mono font-bold">
                Overall: {student.attendancePercentage}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {subjectAttendance.map((sub: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-900 font-mono">{sub.code}: {sub.title}</span>
                    <span className={`font-mono font-bold ${sub.percentage >= 75 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {sub.percentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${sub.percentage >= 90 ? 'bg-emerald-500' : sub.percentage >= 75 ? 'bg-blue-600' : 'bg-rose-500'}`}
                      style={{ width: `${sub.percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-600 font-mono">
                    <span>Attended: {sub.attended} / {sub.totalClasses || sub.total || 25} Classes</span>
                    <span className={sub.percentage >= 75 ? 'text-emerald-700 font-medium' : 'text-rose-600 font-medium'}>
                      {sub.percentage >= 75 ? 'Eligible for Exams' : 'Shortage Alert'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SGPA Progress History */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Semester-Wise Academic Performance (SGPA)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="text-[10px] text-slate-500 uppercase">Semester 1 (Autumn 2024)</p>
                <p className="text-2xl font-bold text-slate-900">8.70 <span className="text-xs text-slate-400 font-normal">/ 10.0</span></p>
                <p className="text-[10px] text-emerald-700 font-medium">Passed • Distinction</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="text-[10px] text-slate-500 uppercase">Semester 2 (Spring 2025)</p>
                <p className="text-2xl font-bold text-slate-900">8.90 <span className="text-xs text-slate-400 font-normal">/ 10.0</span></p>
                <p className="text-[10px] text-emerald-700 font-medium">Passed • Distinction</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <p className="text-[10px] text-blue-700 uppercase font-semibold">Semester 3 (Current)</p>
                <p className="text-2xl font-bold text-blue-700">{student.gpa} <span className="text-xs text-blue-400 font-normal">/ 10.0</span></p>
                <p className="text-[10px] text-blue-700 font-medium">CGPA Average • Top 5%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Digital Student ID Card */}
      {activeTab === 'idcard' && (
        <div className="space-y-6 flex flex-col items-center">
          <div className="w-full max-w-md bg-white border-2 border-blue-600 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
            {/* Header branding */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl serif-font shadow-md">
                  S
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 serif-font tracking-tight">
                    ScholarCore University
                  </h3>
                  <p className="text-[10px] text-blue-600 font-mono tracking-widest uppercase font-bold">Official Student Identity Card</p>
                </div>
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" title="Verified ID" />
            </div>

            {/* Photo & Roll Info */}
            <div className="flex gap-5 items-center">
              <img
                src={student.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250'}
                alt={student.fullName}
                className="w-24 h-28 rounded-2xl object-cover border-2 border-blue-600 shadow-md shrink-0"
              />

              <div className="space-y-1.5 text-xs text-slate-700 font-mono">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-sans">Student Name</p>
                  <p className="text-base font-bold text-slate-900 serif-font">{student.fullName}</p>
                </div>

                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-sans">Roll Number / Student ID</p>
                  <p className="text-xs font-bold text-blue-600">{student.studentId}</p>
                </div>

                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-sans">Department & Program</p>
                  <p className="text-xs text-slate-800 truncate font-semibold">{student.department}</p>
                </div>
              </div>
            </div>

            {/* Additional details */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-blue-50/50 p-3 rounded-xl border border-blue-100">
              <div>
                <p className="text-[9px] text-slate-500">Academic Batch</p>
                <p className="text-slate-900 font-semibold">{student.academicBatch}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500">Current Semester</p>
                <p className="text-slate-900 font-semibold">Semester {student.currentSemester}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500">Guardian Contact</p>
                <p className="text-slate-900 truncate">{student.guardianPhone}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500">Valid Through</p>
                <p className="text-blue-700 font-bold">July 2028</p>
              </div>
            </div>

            {/* QR Code & Barcode */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <QrCode className="w-12 h-12 text-slate-800 bg-slate-100 p-1.5 rounded-lg border border-slate-200" />
                <div className="text-[9px] font-mono text-slate-500">
                  <p className="text-blue-700 font-bold">Encrypted QR Verification</p>
                  <p>Scan for instant verification</p>
                </div>
              </div>

              <div className="text-right font-mono text-[9px] text-slate-500">
                <p className="text-slate-900 font-bold">SECURITY SEAL</p>
                <p>SIMS-VERIFIED-2026</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-xs hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download Student ID</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Documents Vault */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Student Documents Vault</h2>
              <p className="text-xs text-slate-500">Verified academic certificates, fee receipts, and identity records</p>
            </div>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs text-blue-700 font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New File</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="space-y-3 font-mono text-xs">
              {documents.map((doc: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100/60 transition-all">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">{doc.name}</p>
                      <p className="text-[10px] text-slate-500">{doc.category || 'Academic'} • Uploaded on {doc.date || doc.uploadedAt || '2026-02-01'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                      {doc.status || 'Verified'}
                    </span>
                    <button
                      onClick={() => {
                        if (doc.fileData) {
                          const link = document.createElement('a');
                          link.href = doc.fileData;
                          link.download = doc.name;
                          link.click();
                        } else {
                          alert(`Downloading verified document: ${doc.name}`);
                        }
                      }}
                      className="p-1.5 bg-white hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-600 border border-slate-200 transition-all cursor-pointer"
                      title="Download File"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Notices & Circulars */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Official University Notices & Circulars</h2>

          <div className="space-y-3 font-mono text-xs">
            {notices.map((n: any) => (
              <div key={n.id} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-2 hover:border-blue-300 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                    {n.category} • {n.priority} Priority
                  </span>
                  <span className="text-[10px] text-slate-400">{n.date}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{n.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Profile & Guardian Info */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Personal Profile & Emergency Contact
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              <div className="space-y-3">
                <p className="text-blue-700 font-bold uppercase text-[10px]">Academic Details</p>
                <p className="text-slate-800"><span className="text-slate-400">Full Name:</span> {student.fullName}</p>
                <p className="text-slate-800"><span className="text-slate-400">Student ID / Roll:</span> {student.studentId}</p>
                <p className="text-slate-800"><span className="text-slate-400">Department:</span> {student.department}</p>
                <p className="text-slate-800"><span className="text-slate-400">Academic Batch:</span> {student.academicBatch}</p>
                <p className="text-slate-800"><span className="text-slate-400">ABC Credit ID:</span> ABC-9821-4412</p>
              </div>

              <div className="space-y-3">
                <p className="text-blue-700 font-bold uppercase text-[10px]">Guardian & Emergency Contact</p>
                <p className="text-slate-800"><span className="text-slate-400">Father / Guardian Name:</span> {student.guardianName || 'Rajesh Sharma'}</p>
                <p className="text-slate-800"><span className="text-slate-400">Guardian Phone:</span> {student.guardianPhone || '+91 98112 34567'}</p>
                <p className="text-slate-800"><span className="text-slate-400">Student Mobile:</span> {student.phone}</p>
                <p className="text-slate-800"><span className="text-slate-400">Permanent Address:</span> {student.address}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Upload Document to Student Vault</h3>
            <p className="text-xs text-slate-500">Select a document type and file name to upload to your official student profile.</p>

            {uploadSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-mono">
                {uploadSuccess}
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    value={uploadDocName}
                    onChange={e => setUploadDocName(e.target.value)}
                    placeholder="e.g., Medical Certificate / Assignment Proof"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1">Category</label>
                  <select
                    value={uploadDocType}
                    onChange={e => setUploadDocType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Assignment">Assignment Submission</option>
                    <option value="Medical">Medical Leave Certificate</option>
                    <option value="Identity">Identity / Address Proof</option>
                    <option value="General">General Application</option>
                  </select>
                </div>

                <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center space-y-1 bg-slate-50">
                  <Upload className="w-6 h-6 text-blue-600 mx-auto" />
                  <p className="text-xs text-slate-700">Click or drag file here (PDF, PNG, JPG)</p>
                  <p className="text-[10px] text-slate-500 font-mono">Max size: 10MB</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs text-slate-700 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-xs hover:bg-blue-700 cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    Upload Document
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
