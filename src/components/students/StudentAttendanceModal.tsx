import React, { useState, useEffect } from 'react';
import { Student, SemesterRecord, AttendanceLogEntry } from '../../types/student';
import {
  X,
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  Edit,
  Plus,
  Save,
  User,
  FileText,
  ShieldCheck,
  TrendingUp,
  Percent,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface StudentAttendanceModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
}

export const StudentAttendanceModal: React.FC<StudentAttendanceModalProps> = ({
  student,
  isOpen,
  onClose,
  onUpdateStudent
}) => {
  const [activeTab, setActiveTab] = useState<'semesters' | 'edit' | 'logs'>('semesters');
  
  // Form states for adding/editing attendance
  const [targetSemester, setTargetSemester] = useState<number>(4);
  const [totalClasses, setTotalClasses] = useState<number>(180);
  const [attendedClasses, setAttendedClasses] = useState<number>(155);
  const [customPercentage, setCustomPercentage] = useState<number>(86.1);
  const [editedBy, setEditedBy] = useState<string>('Academic Registrar Office');
  const [reason, setReason] = useState<string>('Regular monthly attendance reconciliation & medical leave condonation.');

  const [semesters, setSemesters] = useState<SemesterRecord[]>([]);
  const [logs, setLogs] = useState<AttendanceLogEntry[]>([]);

  // Seed default semester attendance records if missing
  const generateSeedSemesterAttendance = (st: Student): SemesterRecord[] => {
    if (st.semesterRecords && st.semesterRecords.length > 0) {
      return st.semesterRecords;
    }

    const currentSem = st.semester || st.currentSemester || 4;
    const startYear = st.enrollmentYear || 2024;

    const list: SemesterRecord[] = [];
    for (let s = 1; s <= 8; s++) {
      const yearOffset = Math.floor((s - 1) / 2);
      const isOdd = s % 2 !== 0;
      const termName = `${startYear + yearOffset}-${startYear + yearOffset + 1} ${isOdd ? 'Autumn' : 'Spring'}`;
      const isCompleted = s < currentSem;
      const isCurrent = s === currentSem;

      // Base attendance values
      const attVal = isCompleted
        ? Math.min(98, Math.max(68, 82 + (s * 3) % 15))
        : isCurrent
        ? 88.5
        : 0;

      list.push({
        id: `sem-rec-${st.id}-${s}`,
        semester: s,
        academicTerm: termName,
        sgpa: isCompleted || isCurrent ? 8.5 : 0,
        cgpa: isCompleted || isCurrent ? 8.4 : 0,
        creditsRegistered: 20,
        creditsEarned: isCompleted || isCurrent ? 20 : 0,
        attendancePercentage: Number(attVal.toFixed(1)),
        backlogsCount: 0,
        status: isCompleted ? 'Passed' : isCurrent ? 'In Progress' : 'In Progress',
        remarks: `Semester ${s} academic record.`
      });
    }

    return list;
  };

  // Seed default audit logs if missing
  const generateSeedLogs = (st: Student, semList: SemesterRecord[]): AttendanceLogEntry[] => {
    if (st.attendanceLogs && st.attendanceLogs.length > 0) {
      return st.attendanceLogs;
    }

    const currentSem = st.semester || st.currentSemester || 4;
    const seedLogs: AttendanceLogEntry[] = [
      {
        id: `att-log-${st.id}-1`,
        studentId: st.studentId || st.id,
        semester: currentSem,
        oldPercentage: 81.0,
        newPercentage: 88.5,
        classesAttended: 159,
        totalClasses: 180,
        editedBy: 'Dr. R. K. Sharma (HOD & Academic Chair)',
        editedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        reason: 'Added approved attendance credit for National Technical Symposium participation.'
      },
      {
        id: `att-log-${st.id}-2`,
        studentId: st.studentId || st.id,
        semester: Math.max(1, currentSem - 1),
        oldPercentage: 74.5,
        newPercentage: 85.0,
        classesAttended: 153,
        totalClasses: 180,
        editedBy: 'Accounts & Academic Controller',
        editedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        reason: 'Medical leave condonation granted upon submission of hospital discharge certificate.'
      }
    ];

    return seedLogs;
  };

  useEffect(() => {
    if (student) {
      const sems = generateSeedSemesterAttendance(student);
      const initialLogs = generateSeedLogs(student, sems);
      setSemesters(sems);
      setLogs(initialLogs);

      const activeSem = student.semester || student.currentSemester || 4;
      setTargetSemester(activeSem);
      const currSem = sems.find(s => s.semester === activeSem);
      if (currSem && currSem.attendancePercentage > 0) {
        setCustomPercentage(currSem.attendancePercentage);
        setAttendedClasses(Math.round((currSem.attendancePercentage / 100) * 180));
      }
    }
  }, [student?.id, student?.semester]);

  if (!isOpen || !student) return null;

  // Calculate Overall Aggregate Attendance
  const activeSemesters = semesters.filter(s => s.attendancePercentage > 0);
  const overallAttendance = activeSemesters.length > 0
    ? Number((activeSemesters.reduce((acc, s) => acc + s.attendancePercentage, 0) / activeSemesters.length).toFixed(1))
    : (student.attendance || 85.0);

  const isShortage = overallAttendance < 75;

  // Handle updating attendance for a semester
  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();

    let finalPct = Number(customPercentage);
    if (totalClasses > 0 && attendedClasses >= 0) {
      finalPct = Number(((attendedClasses / totalClasses) * 100).toFixed(1));
    }

    if (isNaN(finalPct) || finalPct < 0 || finalPct > 100) {
      alert('Please enter a valid attendance percentage between 0 and 100.');
      return;
    }

    const currentSemObj = semesters.find(s => s.semester === Number(targetSemester));
    const oldPct = currentSemObj ? currentSemObj.attendancePercentage : 0;

    // Create Audit Log
    const newLog: AttendanceLogEntry = {
      id: `att-log-${Date.now()}`,
      studentId: student.studentId || student.id,
      semester: Number(targetSemester),
      oldPercentage: oldPct,
      newPercentage: finalPct,
      classesAttended: attendedClasses,
      totalClasses: totalClasses,
      editedBy: editedBy || 'Academic Officer',
      editedAt: new Date().toISOString(),
      reason: reason || 'Manual attendance adjustment.'
    };

    // Update semester records
    const updatedSemesters = semesters.map(s => {
      if (s.semester === Number(targetSemester)) {
        return {
          ...s,
          attendancePercentage: finalPct,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });

    const newActiveSem = updatedSemesters.filter(s => s.attendancePercentage > 0);
    const newOverall = newActiveSem.length > 0
      ? Number((newActiveSem.reduce((acc, s) => acc + s.attendancePercentage, 0) / newActiveSem.length).toFixed(1))
      : finalPct;

    const updatedLogs = [newLog, ...logs];

    const updatedStudent: Student = {
      ...student,
      attendance: newOverall,
      semesterRecords: updatedSemesters,
      attendanceLogs: updatedLogs
    };

    setSemesters(updatedSemesters);
    setLogs(updatedLogs);

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }

    alert(`Semester ${targetSemester} attendance updated to ${finalPct}% successfully! Edit log saved.`);
    setActiveTab('logs');
  };

  const studentName = student.fullName || (student as any).name || 'Student';
  const studentIdStr = student.studentId || student.id || '2024CSE1001';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-6">
        
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl text-white flex items-center justify-center shadow-md ${
              isShortage ? 'bg-gradient-to-br from-rose-600 to-amber-600' : 'bg-gradient-to-br from-blue-600 to-indigo-700'
            }`}>
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{studentName}</h3>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-800 font-mono text-[11px] font-bold">
                  {studentIdStr}
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono ${
                  isShortage ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  Overall Attendance: {overallAttendance}%
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{student.department}</span>
                <span>•</span>
                <span>Current Enrolled Semester: <strong className="text-slate-800 font-bold">Sem {student.semester || student.currentSemester || 4}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('edit')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Edit / Add Attendance</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Aggregate KPI Banner */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aggregate Attendance</span>
              <div className="text-2xl font-black text-slate-900 mt-0.5 font-mono">
                {overallAttendance}%
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Across Active Semesters</span>
            </div>
            <div className={`p-2.5 rounded-xl ${isShortage ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <Percent className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Eligibility Threshold</span>
              <div className={`text-2xl font-black mt-0.5 font-mono ${isShortage ? 'text-rose-600' : 'text-emerald-700'}`}>
                {isShortage ? '75% Shortage!' : '75% Met ✓'}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {isShortage ? 'Condonation or NOC required for exams' : 'Eligible for End-Sem Examinations'}
              </span>
            </div>
            <div className={`p-2.5 rounded-xl ${isShortage ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {isShortage ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Modification Audit Logs</span>
              <div className="text-2xl font-black text-blue-700 mt-0.5 font-mono">
                {logs.length} Edits Logged
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Tracked by Registrar & Faculty</span>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <History className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-white border-b border-slate-200 flex items-center gap-4 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('semesters')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'semesters'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Semester-Wise Attendance Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'edit'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Edit className="w-4 h-4" />
            <span>Update / Add Semester Attendance</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'logs'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Logs & History ({logs.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[460px] overflow-y-auto space-y-6">
          
          {/* TAB 1: Semester Wise Table */}
          {activeTab === 'semesters' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
                      <th className="p-3 pl-4">Semester</th>
                      <th className="p-3">Academic Session</th>
                      <th className="p-3">Attendance %</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Eligibility Note</th>
                      <th className="p-3 text-right pr-4">Quick Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-mono">
                    {semesters.map(s => {
                      const isLow = s.attendancePercentage > 0 && s.attendancePercentage < 75;
                      const hasData = s.attendancePercentage > 0;

                      return (
                        <tr key={s.semester} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 pl-4 font-bold text-blue-700">Sem {s.semester}</td>
                          <td className="p-3 text-slate-600">{s.academicTerm}</td>
                          <td className="p-3">
                            {hasData ? (
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.min(100, s.attendancePercentage)}%` }}
                                  ></div>
                                </div>
                                <span className={`font-bold text-xs ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                                  {s.attendancePercentage}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">Not Registered</span>
                            )}
                          </td>
                          <td className="p-3">
                            {hasData ? (
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isLow
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {isLow ? 'Shortage (<75%)' : 'Regular (>=75%)'}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">—</span>
                            )}
                          </td>
                          <td className="p-3 font-sans text-slate-600 text-[11px]">
                            {hasData
                              ? isLow
                                ? 'Shortage warning issued; condonation required.'
                                : 'Eligible for end-semester exams.'
                              : 'Future semester schedule.'}
                          </td>
                          <td className="p-3 text-right pr-4">
                            <button
                              onClick={() => {
                                setTargetSemester(s.semester);
                                if (s.attendancePercentage > 0) {
                                  setCustomPercentage(s.attendancePercentage);
                                  setAttendedClasses(Math.round((s.attendancePercentage / 100) * 180));
                                }
                                setActiveTab('edit');
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 justify-end ml-auto cursor-pointer"
                            >
                              <Edit className="w-3 h-3 text-blue-600" />
                              <span>Update</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Edit Form */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveAttendance} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-5 text-xs">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Edit className="w-4 h-4 text-blue-600" />
                    <span>Update / Add Semester Attendance</span>
                  </h4>
                  <p className="text-slate-500 text-[11px]">All changes are logged in the official audit trail with editor details & reason</p>
                </div>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Audit Trail Enabled
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Semester</label>
                  <select
                    value={targetSemester}
                    onChange={e => {
                      const semNum = Number(e.target.value);
                      setTargetSemester(semNum);
                      const s = semesters.find(item => item.semester === semNum);
                      if (s && s.attendancePercentage > 0) {
                        setCustomPercentage(s.attendancePercentage);
                        setAttendedClasses(Math.round((s.attendancePercentage / 100) * 180));
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => {
                      const semObj = semesters.find(item => item.semester === s);
                      return (
                        <option key={s} value={s}>
                          Semester {s} {semObj?.attendancePercentage ? `(Current: ${semObj.attendancePercentage}%)` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Total Classes Conducted</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={totalClasses}
                    onChange={e => {
                      const tot = Number(e.target.value);
                      setTotalClasses(tot);
                      if (tot > 0) {
                        setCustomPercentage(Number(((attendedClasses / tot) * 100).toFixed(1)));
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Classes Attended by Student</label>
                  <input
                    type="number"
                    min="0"
                    max={totalClasses}
                    value={attendedClasses}
                    onChange={e => {
                      const att = Number(e.target.value);
                      setAttendedClasses(att);
                      if (totalClasses > 0) {
                        setCustomPercentage(Number(((att / totalClasses) * 100).toFixed(1)));
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Calculated Attendance Percentage (%)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={customPercentage}
                      onChange={e => setCustomPercentage(Number(e.target.value))}
                      className="w-32 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-black text-blue-700"
                      required
                    />
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                      customPercentage < 75 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {customPercentage < 75 ? '⚠️ Shortage Warning' : '✓ Normal Attendance'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Officer / Editor Name & Role</label>
                  <input
                    type="text"
                    value={editedBy}
                    onChange={e => setEditedBy(e.target.value)}
                    placeholder="e.g. Dr. A. Sharma (HOD & Faculty Coordinator)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mandatory Audit Reason for Edit</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Specify why attendance is being modified (e.g. Medical certificate approved, sports quota attendance condoned, lab attendance entry correction)"
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('semesters')}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Attendance & Record Audit Log</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Audit Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              {logs.length > 0 ? (
                <div className="space-y-3">
                  {logs.map(log => {
                    const diff = Number((log.newPercentage - log.oldPercentage).toFixed(1));
                    const isPositive = diff >= 0;

                    return (
                      <div key={log.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2 hover:border-blue-200 transition-colors">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold font-mono text-[10px]">
                              Semester {log.semester}
                            </span>
                            <span className="font-bold text-slate-900 flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              {log.editedBy}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(log.editedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">OLD ATTENDANCE</span>
                            <span className="font-bold text-slate-600 line-through">{log.oldPercentage}%</span>
                          </div>

                          <div className="text-slate-400 font-bold">➔</div>

                          <div>
                            <span className="text-[10px] text-slate-400 block">UPDATED ATTENDANCE</span>
                            <span className="font-extrabold text-blue-700">{log.newPercentage}%</span>
                          </div>

                          <div className="ml-auto flex items-center gap-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {isPositive ? `+${diff}%` : `${diff}%`}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-600 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                          <strong className="text-slate-800">Audit Reason: </strong>
                          <span>{log.reason}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 italic">
                  No attendance modification edit logs recorded yet.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>ScholarCore Academic Attendance & Audit Logging Service</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
