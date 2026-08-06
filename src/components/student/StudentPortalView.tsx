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
    setUploadSuccess(`Document "${uploadDocName}" uploaded successfully to Student Vault.`);
    setTimeout(() => {
      setUploadSuccess(null);
      setIsUploadModalOpen(false);
      setUploadDocName('');
    }, 2000);
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. Student Academic Hero Header */}
      <div className="bg-[#0d0d12]/90 border border-white/10 p-6 rounded-2xl backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Top Decorative Amber Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Profile Basic Info */}
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <img
                src={student.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250'}
                alt={student.fullName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#D4AF37] shadow-xl shadow-amber-500/10"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-black rounded-full" title="Active Student Session" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-white serif-font tracking-tight">
                  {student.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                  {student.status} • Regular
                </span>
                <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                  Roll No: {student.studentId}
                </span>
              </div>

              <p className="text-xs text-zinc-400 font-mono flex flex-wrap items-center gap-2">
                <span>{student.email}</span>
                <span>•</span>
                <span>ABC ID: ABC-9821-4412</span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300 pt-1">
                <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  {student.department}
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 font-mono">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                  Sem {student.currentSemester} ({student.academicBatch})
                </span>
                <span className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 text-emerald-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Fee Clearance: 100% Paid
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <button
              onClick={() => setActiveTab('idcard')}
              className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 rounded-xl text-xs font-semibold text-amber-300 transition-all flex items-center gap-2 shadow-md shadow-amber-500/10"
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Digital ID Card</span>
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-zinc-200 transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Upload Document</span>
            </button>

            <button
              onClick={loadPortalData}
              disabled={loading}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-all"
              title="Refresh Portal Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
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
        <div className="bg-[#0d0d12]/90 border border-white/10 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] text-zinc-400 font-mono uppercase tracking-wider">Academic CGPA</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono flex items-baseline gap-1">
                {student.gpa}
                <span className="text-xs text-zinc-500 font-normal">/ 10.0</span>
              </h3>
              <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Grade A+ • Distinction
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-zinc-400">
            Ranked #4 in CSE Department (Class of '28)
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-[#0d0d12]/90 border border-white/10 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] text-zinc-400 font-mono uppercase tracking-wider">Overall Attendance</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                {student.attendancePercentage}%
              </h3>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Above 75% Limit
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-zinc-400">
            Attended 142 of 160 Conducted Lectures
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="bg-[#0d0d12]/90 border border-white/10 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/40 transition-all shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] text-zinc-400 font-mono uppercase tracking-wider">Active Subjects</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">
                6 Courses
              </h3>
              <p className="text-[11px] text-indigo-400 mt-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> 22 Total Credits
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-zinc-400">
            5 Theory + 1 Full Stack Eng Lab
          </div>
        </div>

        {/* Fee Status */}
        <div className="bg-[#0d0d12]/90 border border-white/10 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden group hover:border-blue-500/40 transition-all shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] text-zinc-400 font-mono uppercase tracking-wider">Semester Fee Status</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                ₹1,25,000
              </h3>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" /> Cleared • No Dues
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-zinc-400">
            Receipt #REC-2026-9021 Verified
          </div>
        </div>
      </div>

      {/* 3. Navigation Perspective Tabs */}
      <div className="border-b border-white/10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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
              className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold shadow-md shadow-amber-500/10'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
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
              <h2 className="text-lg font-semibold text-white serif-font">Current Semester Enrolled Subjects</h2>
              <p className="text-xs text-zinc-400">Registered courses for Spring 2026 Semester 3</p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-lg">
              Batch 2024-2028 • B.Tech CSE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { code: 'CS101', title: 'Data Structures & Algorithms in C++', faculty: 'Prof. Ramesh Kulkarni', credits: 4, room: 'Turing Hall A', schedule: 'Mon/Wed 09:00 AM', status: 'Enrolled' },
              { code: 'CS204', title: 'Machine Learning & Artificial Intelligence', faculty: 'Dr. Vikramaditya Sen', credits: 4, room: 'AI Lab 3', schedule: 'Mon/Fri 11:00 AM', status: 'Enrolled' },
              { code: 'CS202', title: 'Database Management Systems', faculty: 'Dr. Sunita Deshmukh', credits: 4, room: 'Bhabha Block B', schedule: 'Tue/Thu 10:00 AM', status: 'Enrolled' },
              { code: 'MA201', title: 'Discrete Mathematics & Logic', faculty: 'Dr. S. K. Gupta', credits: 3, room: 'Lecture Hall 101', schedule: 'Thu 02:00 PM', status: 'Enrolled' },
              { code: 'EC205', title: 'Digital Electronics & Circuits', faculty: 'Dr. Venkatesh Iyer', credits: 3, room: 'Hardware Lab', schedule: 'Fri 11:00 AM', status: 'Enrolled' },
              { code: 'CS209', title: 'Full Stack Web Engineering Lab', faculty: 'Prof. Ramesh Kulkarni', credits: 4, room: 'Software Lab 2', schedule: 'Wed 09:00 AM', status: 'Enrolled' }
            ].map((course, idx) => (
              <div key={idx} className="bg-[#0d0d12]/90 border border-white/10 p-5 rounded-2xl backdrop-blur-md space-y-3 hover:border-amber-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono text-xs font-semibold">
                    {course.code}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {course.credits} Credits
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white leading-snug">{course.title}</h3>

                <div className="space-y-1.5 text-xs text-zinc-400 pt-1 border-t border-white/5 font-mono">
                  <p className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Faculty: {course.faculty}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>Room: {course.room}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>Schedule: {course.schedule}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Timetable Grid */}
          <div className="bg-[#0d0d12]/90 border border-white/10 p-6 rounded-2xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-semibold text-white serif-font flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Weekly Academic Time-Table Schedule
              </h3>
              <span className="text-xs text-zinc-400 font-mono">Spring 2026 Session</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-white/5 text-zinc-400 uppercase text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3">Day</th>
                    <th className="p-3">Time Slot</th>
                    <th className="p-3">Course / Subject</th>
                    <th className="p-3">Classroom / Lab</th>
                    <th className="p-3">Faculty Instructor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {weeklySchedule.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-semibold text-amber-300">{item.day}</td>
                      <td className="p-3 text-zinc-400">{item.time}</td>
                      <td className="p-3 font-medium text-white">{item.subject}</td>
                      <td className="p-3 text-zinc-400">{item.room}</td>
                      <td className="p-3 text-zinc-400">{item.instructor}</td>
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
          <div className="bg-[#0d0d12]/90 border border-white/10 p-6 rounded-2xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white serif-font">Subject-Wise Attendance Breakdown</h3>
                <p className="text-xs text-zinc-400">Minimum 75% attendance required for semester end-term examinations</p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold">
                Overall: {student.attendancePercentage}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {[
                { code: 'CS101', title: 'Data Structures & Algorithms', total: 25, attended: 23, percentage: 92 },
                { code: 'CS204', title: 'Machine Learning & AI', total: 21, attended: 18, percentage: 86 },
                { code: 'CS202', title: 'Database Management Systems', total: 30, attended: 27, percentage: 90 },
                { code: 'MA201', title: 'Discrete Mathematics & Logic', total: 20, attended: 17, percentage: 85 },
                { code: 'EC205', title: 'Digital Electronics & Circuits', total: 25, attended: 22, percentage: 88 },
                { code: 'CS209', title: 'Full Stack Web Engineering Lab', total: 20, attended: 19, percentage: 95 }
              ].map((sub, idx) => (
                <div key={idx} className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white font-mono">{sub.code}: {sub.title}</span>
                    <span className={`font-mono font-bold ${sub.percentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {sub.percentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${sub.percentage >= 90 ? 'bg-emerald-400' : sub.percentage >= 75 ? 'bg-amber-400' : 'bg-rose-500'}`}
                      style={{ width: `${sub.percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-zinc-400 font-mono">
                    <span>Attended: {sub.attended} / {sub.total} Classes</span>
                    <span className={sub.percentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}>
                      {sub.percentage >= 75 ? 'Eligible for Exams' : 'Shortage Alert'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SGPA Progress History */}
          <div className="bg-[#0d0d12]/90 border border-white/10 p-6 rounded-2xl backdrop-blur-md space-y-4">
            <h3 className="text-base font-semibold text-white serif-font">Semester-Wise Academic Performance (SGPA)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
                <p className="text-[10px] text-zinc-400 uppercase">Semester 1 (Autumn 2024)</p>
                <p className="text-2xl font-bold text-white">8.70 <span className="text-xs text-zinc-500 font-normal">/ 10.0</span></p>
                <p className="text-[10px] text-emerald-400">Passed • Distinction</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
                <p className="text-[10px] text-zinc-400 uppercase">Semester 2 (Spring 2025)</p>
                <p className="text-2xl font-bold text-white">8.90 <span className="text-xs text-zinc-500 font-normal">/ 10.0</span></p>
                <p className="text-[10px] text-emerald-400">Passed • Distinction</p>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
                <p className="text-[10px] text-amber-300 uppercase">Semester 3 (Current)</p>
                <p className="text-2xl font-bold text-amber-300">{student.gpa} <span className="text-xs text-amber-500 font-normal">/ 10.0</span></p>
                <p className="text-[10px] text-amber-300">CGPA Average • Top 5%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Digital Student ID Card */}
      {activeTab === 'idcard' && (
        <div className="space-y-6 flex flex-col items-center">
          <div className="w-full max-w-md bg-gradient-to-br from-[#0f121d] via-[#161a28] to-[#0a0c14] border-2 border-[#D4AF37] rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
            {/* Header branding */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center text-slate-950 font-bold text-xl serif-font shadow-md">
                  S
                </div>
                <div>
                  <h3 className="text-base font-bold text-white serif-font tracking-tight">
                    ScholarCore University
                  </h3>
                  <p className="text-[10px] text-amber-400 font-mono tracking-widest uppercase">Official Student Identity Card</p>
                </div>
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Verified ID" />
            </div>

            {/* Photo & Roll Info */}
            <div className="flex gap-5 items-center">
              <img
                src={student.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250'}
                alt={student.fullName}
                className="w-24 h-28 rounded-2xl object-cover border-2 border-amber-400/60 shadow-lg shrink-0"
              />

              <div className="space-y-1.5 text-xs text-zinc-300 font-mono">
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase">Student Name</p>
                  <p className="text-base font-bold text-white serif-font">{student.fullName}</p>
                </div>

                <div>
                  <p className="text-[9px] text-zinc-500 uppercase">Roll Number / Student ID</p>
                  <p className="text-xs font-bold text-amber-400">{student.studentId}</p>
                </div>

                <div>
                  <p className="text-[9px] text-zinc-500 uppercase">Department & Program</p>
                  <p className="text-xs text-zinc-200 truncate">{student.department}</p>
                </div>
              </div>
            </div>

            {/* Additional details */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-black/50 p-3 rounded-xl border border-white/5">
              <div>
                <p className="text-[9px] text-zinc-500">Academic Batch</p>
                <p className="text-zinc-200 font-semibold">{student.academicBatch}</p>
              </div>
              <div>
                <p className="text-[9px] text-zinc-500">Current Semester</p>
                <p className="text-zinc-200 font-semibold">Semester {student.currentSemester}</p>
              </div>
              <div>
                <p className="text-[9px] text-zinc-500">Guardian Contact</p>
                <p className="text-zinc-200 truncate">{student.guardianPhone}</p>
              </div>
              <div>
                <p className="text-[9px] text-zinc-500">Valid Through</p>
                <p className="text-amber-400 font-semibold">July 2028</p>
              </div>
            </div>

            {/* QR Code & Barcode */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <QrCode className="w-12 h-12 text-white bg-white/10 p-1.5 rounded-lg border border-white/20" />
                <div className="text-[9px] font-mono text-zinc-400">
                  <p className="text-amber-300 font-bold">Encrypted QR Verification</p>
                  <p>Scan for instant verification</p>
                </div>
              </div>

              <div className="text-right font-mono text-[9px] text-zinc-500">
                <p className="text-zinc-300 font-bold">SECURITY SEAL</p>
                <p>SIMS-VERIFIED-2026</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-amber-500 text-slate-950 font-semibold rounded-xl text-xs hover:bg-amber-400 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
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
              <h2 className="text-lg font-semibold text-white serif-font">My Student Documents Vault</h2>
              <p className="text-xs text-zinc-400">Verified academic certificates, fee receipts, and identity records</p>
            </div>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-semibold flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New File</span>
            </button>
          </div>

          <div className="bg-[#0d0d12]/90 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
            <div className="space-y-3 font-mono text-xs">
              {[
                { name: 'Class X Secondary Board Marksheet & Certificate', category: 'Academic', date: '2024-07-15', status: 'Verified' },
                { name: 'Class XII Senior Secondary Passing Certificate', category: 'Academic', date: '2024-07-15', status: 'Verified' },
                { name: 'Semester 3 Tuition Fee Payment Receipt (#REC-2026-9021)', category: 'Finance', date: '2026-01-10', status: 'Verified' },
                { name: 'Official Bonafide Student Enrollment Certificate', category: 'General', date: '2026-02-01', status: 'Approved' },
                { name: 'Aadhaar Card / Government Identity Proof', category: 'Identity', date: '2024-07-15', status: 'Verified' }
              ].map((doc, idx) => (
                <div key={idx} className="p-3.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">{doc.name}</p>
                      <p className="text-[10px] text-zinc-500">{doc.category} • Uploaded on {doc.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                      {doc.status}
                    </span>
                    <button
                      onClick={() => alert(`Downloading verified document: ${doc.name}`)}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 hover:text-amber-400 border border-white/10 transition-all"
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
          <h2 className="text-lg font-semibold text-white serif-font">Official University Notices & Circulars</h2>

          <div className="space-y-3 font-mono text-xs">
            {notices.map((n: any) => (
              <div key={n.id} className="p-5 bg-[#0d0d12]/90 border border-white/10 rounded-2xl space-y-2 hover:border-amber-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                    {n.category} • {n.priority} Priority
                  </span>
                  <span className="text-[10px] text-zinc-500">{n.date}</span>
                </div>

                <h3 className="text-sm font-semibold text-white serif-font">{n.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{n.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Profile & Guardian Info */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-[#0d0d12]/90 border border-white/10 p-6 rounded-2xl backdrop-blur-md space-y-6">
            <h2 className="text-lg font-semibold text-white serif-font border-b border-white/5 pb-3">
              Personal Profile & Emergency Contact
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              <div className="space-y-3">
                <p className="text-amber-400 font-bold uppercase text-[10px]">Academic Details</p>
                <p className="text-zinc-300"><span className="text-zinc-500">Full Name:</span> {student.fullName}</p>
                <p className="text-zinc-300"><span className="text-zinc-500">Student ID / Roll:</span> {student.studentId}</p>
                <p className="text-zinc-300"><span className="text-zinc-500">Department:</span> {student.department}</p>
                <p className="text-zinc-300"><span className="text-zinc-500">Academic Batch:</span> {student.academicBatch}</p>
                <p className="text-zinc-300"><span className="text-zinc-500">ABC Credit ID:</span> ABC-9821-4412</p>
              </div>

              <div className="space-y-3">
                <p className="text-amber-400 font-bold uppercase text-[10px]">Guardian & Emergency Contact</p>
                <p className="text-zinc-300"><span className="text-zinc-500">Father / Guardian Name:</span> {student.guardianName || 'Rajesh Sharma'}</p>
                <p className="text-zinc-300"><span className="text-zinc-500">Guardian Phone:</span> {student.guardianPhone || '+91 98112 34567'}</p>
                <p className="text-zinc-300"><span className="text-zinc-500">Student Mobile:</span> {student.phone}</p>
                <p className="text-zinc-300"><span className="text-zinc-500">Permanent Address:</span> {student.address}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white serif-font">Upload Document to Student Vault</h3>
            <p className="text-xs text-zinc-400">Select a document type and file name to upload to your official student profile.</p>

            {uploadSuccess ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-mono">
                {uploadSuccess}
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    value={uploadDocName}
                    onChange={e => setUploadDocName(e.target.value)}
                    placeholder="e.g., Medical Certificate / Assignment Proof"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Category</label>
                  <select
                    value={uploadDocType}
                    onChange={e => setUploadDocType(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Assignment">Assignment Submission</option>
                    <option value="Medical">Medical Leave Certificate</option>
                    <option value="Identity">Identity / Address Proof</option>
                    <option value="General">General Application</option>
                  </select>
                </div>

                <div className="p-4 border-2 border-dashed border-white/10 rounded-xl text-center space-y-1">
                  <Upload className="w-6 h-6 text-amber-400 mx-auto" />
                  <p className="text-xs text-zinc-300">Click or drag file here (PDF, PNG, JPG)</p>
                  <p className="text-[10px] text-zinc-500 font-mono">Max size: 10MB</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-semibold rounded-xl text-xs hover:bg-amber-400"
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
