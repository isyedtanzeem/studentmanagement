import React, { useState, useEffect } from 'react';
import { Student, SemesterRecord, CourseGradeItem } from '../../types/student';
import {
  X,
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Edit,
  Save,
  Printer,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Building2,
  RefreshCw,
  QrCode,
  Sparkles
} from 'lucide-react';

interface StudentSemesterModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
}

export const StudentSemesterModal: React.FC<StudentSemesterModalProps> = ({
  student,
  isOpen,
  onClose,
  onUpdateStudent
}) => {
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showReportCard, setShowReportCard] = useState<boolean>(false);

  // Default seed semesters generator for any student
  const generateSeedSemesters = (st: Student): SemesterRecord[] => {
    if (st.semesterRecords && st.semesterRecords.length > 0) {
      return st.semesterRecords;
    }

    const currentSem = st.semester || st.currentSemester || 4;
    const dept = st.department || 'Computer Science & Engineering';
    const startYear = st.enrollmentYear || 2024;

    const baseCourses: Record<string, CourseGradeItem[]> = {
      'Sem1': [
        { code: 'MATH101', title: 'Engineering Mathematics I', credits: 4, grade: 'A+', marksObtained: 88, maxMarks: 100 },
        { code: 'PHY101', title: 'Engineering Physics & Optics', credits: 4, grade: 'A', marksObtained: 82, maxMarks: 100 },
        { code: 'CS101', title: 'Programming for Problem Solving (C++)', credits: 4, grade: 'O', marksObtained: 94, maxMarks: 100 },
        { code: 'EE101', title: 'Basic Electrical Engineering', credits: 3, grade: 'A', marksObtained: 80, maxMarks: 100 },
        { code: 'ENG101', title: 'Technical English & Communication', credits: 2, grade: 'A+', marksObtained: 86, maxMarks: 100 }
      ],
      'Sem2': [
        { code: 'MATH102', title: 'Engineering Mathematics II', credits: 4, grade: 'A+', marksObtained: 89, maxMarks: 100 },
        { code: 'CHEM101', title: 'Engineering Chemistry & Materials', credits: 4, grade: 'A', marksObtained: 81, maxMarks: 100 },
        { code: 'CS102', title: 'Data Structures & Algorithms', credits: 4, grade: 'O', marksObtained: 96, maxMarks: 100 },
        { code: 'ME101', title: 'Engineering Graphics & CAD', credits: 3, grade: 'B+', marksObtained: 76, maxMarks: 100 },
        { code: 'EVS101', title: 'Environmental Science & Sustainability', credits: 2, grade: 'A+', marksObtained: 88, maxMarks: 100 }
      ],
      'Sem3': [
        { code: 'CS201', title: 'Object Oriented Programming with Java', credits: 4, grade: 'A+', marksObtained: 90, maxMarks: 100 },
        { code: 'CS202', title: 'Database Management Systems (SQL)', credits: 4, grade: 'O', marksObtained: 95, maxMarks: 100 },
        { code: 'CS203', title: 'Discrete Mathematics & Graph Theory', credits: 4, grade: 'A', marksObtained: 84, maxMarks: 100 },
        { code: 'EC201', title: 'Digital Electronics & Logic Design', credits: 3, grade: 'A+', marksObtained: 87, maxMarks: 100 },
        { code: 'CS204', title: 'Computer Organization & Architecture', credits: 3, grade: 'A', marksObtained: 82, maxMarks: 100 }
      ],
      'Sem4': [
        { code: 'CS205', title: 'Operating Systems & Kernel Architecture', credits: 4, grade: 'A+', marksObtained: 91, maxMarks: 100 },
        { code: 'CS206', title: 'Design & Analysis of Algorithms', credits: 4, grade: 'A+', marksObtained: 89, maxMarks: 100 },
        { code: 'CS207', title: 'Computer Networks & Protocols', credits: 4, grade: 'A', marksObtained: 85, maxMarks: 100 },
        { code: 'CS208', title: 'Software Engineering & Agile Methodologies', credits: 3, grade: 'O', marksObtained: 94, maxMarks: 100 },
        { code: 'MATH201', title: 'Probability, Statistics & Stochastic Processes', credits: 3, grade: 'A', marksObtained: 83, maxMarks: 100 }
      ]
    };

    const list: SemesterRecord[] = [];
    for (let s = 1; s <= 8; s++) {
      const yearOffset = Math.floor((s - 1) / 2);
      const isOdd = s % 2 !== 0;
      const termName = `${startYear + yearOffset}-${startYear + yearOffset + 1} ${isOdd ? 'Autumn (Odd)' : 'Spring (Even)'}`;
      const isCompleted = s < currentSem;
      const isCurrent = s === currentSem;

      let sgpa = isCompleted ? Number((8.2 + (s * 0.15) % 1.5).toFixed(2)) : isCurrent ? Number((st.gpa || 8.5).toFixed(2)) : 0;
      if (sgpa > 10) sgpa = 9.4;

      const courses = baseCourses[`Sem${s}`] || [
        { code: `CS${s}01`, title: `Advanced Core Subject ${s}.1`, credits: 4, grade: 'A+', marksObtained: 88, maxMarks: 100 },
        { code: `CS${s}02`, title: `Specialization Elective ${s}.2`, credits: 4, grade: 'A', marksObtained: 83, maxMarks: 100 },
        { code: `CS${s}03`, title: `Departmental Lab & Practical ${s}.3`, credits: 3, grade: 'O', marksObtained: 95, maxMarks: 100 },
        { code: `CS${s}04`, title: `Open Elective & Seminar ${s}.4`, credits: 3, grade: 'A+', marksObtained: 89, maxMarks: 100 }
      ];

      list.push({
        id: `sem-rec-${st.id}-${s}`,
        semester: s,
        academicTerm: termName,
        sgpa: isCompleted || isCurrent ? sgpa : 0,
        cgpa: isCompleted || isCurrent ? Number(((8.0 + sgpa) / 2).toFixed(2)) : 0,
        creditsRegistered: 20,
        creditsEarned: isCompleted || isCurrent ? 20 : 0,
        attendancePercentage: isCompleted || isCurrent ? Math.min(98, 85 + (s * 2) % 12) : 0,
        backlogsCount: 0,
        status: isCompleted ? 'Passed' : 'In Progress',
        remarks: isCompleted
          ? `Semester ${s} successfully completed with first class distinction.`
          : isCurrent
          ? `Currently enrolled in Semester ${s} for Academic Term ${termName}.`
          : `Upcoming semester scheduled for registration.`,
        courses: isCompleted || isCurrent ? courses : []
      });
    }

    return list;
  };

  const [semesterRecords, setSemesterRecords] = useState<SemesterRecord[]>([]);

  // Editing state form
  const [editSgpa, setEditSgpa] = useState<number>(8.5);
  const [editCgpa, setEditCgpa] = useState<number>(8.5);
  const [editAttendance, setEditAttendance] = useState<number>(90);
  const [editBacklogs, setEditBacklogs] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<SemesterRecord['status']>('Passed');
  const [editRemarks, setEditRemarks] = useState<string>('');

  useEffect(() => {
    if (student) {
      const records = generateSeedSemesters(student);
      setSemesterRecords(records);
      const activeSem = student.semester || student.currentSemester || 1;
      setSelectedSemester(activeSem);
    }
  }, [student?.id, student?.semester]);

  const currentRec = semesterRecords.find(r => r.semester === selectedSemester) || semesterRecords[0];

  useEffect(() => {
    if (currentRec) {
      setEditSgpa(currentRec.sgpa || 8.5);
      setEditCgpa(currentRec.cgpa || 8.5);
      setEditAttendance(currentRec.attendancePercentage || 90);
      setEditBacklogs(currentRec.backlogsCount || 0);
      setEditStatus(currentRec.status || 'Passed');
      setEditRemarks(currentRec.remarks || '');
    }
  }, [selectedSemester, currentRec]);

  if (!isOpen || !student) return null;

  // Save updated semester record
  const handleSaveSemesterUpdate = () => {
    const updatedRecords = semesterRecords.map(r => {
      if (r.semester === selectedSemester) {
        return {
          ...r,
          sgpa: Number(editSgpa),
          cgpa: Number(editCgpa),
          attendancePercentage: Number(editAttendance),
          backlogsCount: Number(editBacklogs),
          status: editStatus,
          remarks: editRemarks,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    setSemesterRecords(updatedRecords);

    // Calculate overall student CGPA from completed semesters
    const activeSemRecords = updatedRecords.filter(r => r.sgpa > 0);
    const avgCgpa = activeSemRecords.length > 0
      ? Number((activeSemRecords.reduce((acc, curr) => acc + curr.sgpa, 0) / activeSemRecords.length).toFixed(2))
      : student.gpa;

    const updatedStudent: Student = {
      ...student,
      gpa: avgCgpa,
      cgpa: avgCgpa,
      semesterRecords: updatedRecords
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }

    setIsEditing(false);
  };

  // Quick Promote Student
  const handlePromoteNextSemester = () => {
    const currentSemNum = student.semester || student.currentSemester || 1;
    if (currentSemNum >= 8) {
      alert(`Student is already in Semester 8 (Final Year). Promote to Graduated status instead.`);
      return;
    }

    const nextSemNum = currentSemNum + 1;
    const updatedRecords = semesterRecords.map(r => {
      if (r.semester === currentSemNum) {
        return {
          ...r,
          status: 'Passed' as const,
          remarks: `Semester ${currentSemNum} completed and student promoted.`
        };
      }
      if (r.semester === nextSemNum) {
        return {
          ...r,
          status: 'In Progress' as const,
          sgpa: r.sgpa || 8.5,
          cgpa: r.cgpa || 8.5,
          attendancePercentage: 92,
          remarks: `Enrolled in Semester ${nextSemNum}.`
        };
      }
      return r;
    });

    const updatedStudent: Student = {
      ...student,
      semester: nextSemNum,
      currentSemester: nextSemNum,
      semesterRecords: updatedRecords
    };

    setSemesterRecords(updatedRecords);
    setSelectedSemester(nextSemNum);

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }

    alert(`Successfully promoted ${student.fullName} to Semester ${nextSemNum}!`);
  };

  const getStatusBadge = (status: SemesterRecord['status']) => {
    switch (status) {
      case 'Passed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Passed</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-600 animate-spin" />
            <span>In Progress</span>
          </span>
        );
      case 'Promoted':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-indigo-600" />
            <span>Promoted</span>
          </span>
        );
      case 'Backlog':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Backlog</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Pending
          </span>
        );
    }
  };

  const studentName = student.fullName || (student as any).name || 'Student';
  const studentIdStr = student.studentId || student.id || '2024CSE1001';
  const activeSemNum = student.semester || student.currentSemester || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col my-6">
        
        {/* Top Bar Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{studentName}</h3>
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono text-[11px] font-bold">
                  {studentIdStr}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
                  Current: Semester {activeSemNum}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{student.department || 'Computer Science & Engineering'}</span>
                <span>•</span>
                <span>Overall CGPA: <strong className="text-blue-700 font-bold">{student.gpa.toFixed(2)} / 10.00</strong></span>
                <span>•</span>
                <span>Batch: <strong className="text-slate-800 font-mono">{student.enrollmentYear || 2024} - {(student.enrollmentYear || 2024) + 4}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePromoteNextSemester}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              title="Promote student to next semester"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Promote to Sem {activeSemNum + 1 <= 8 ? activeSemNum + 1 : 8}</span>
            </button>

            <button
              onClick={() => setShowReportCard(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>Print Grade Card</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Semester Selector Navigation Tabs */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => {
            const semData = semesterRecords.find(r => r.semester === s);
            const isCurrent = s === activeSemNum;
            const isPassed = semData?.status === 'Passed';

            return (
              <button
                key={s}
                onClick={() => {
                  setSelectedSemester(s);
                  setIsEditing(false);
                }}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  selectedSemester === s
                    ? 'bg-blue-600 text-white shadow-md'
                    : isCurrent
                    ? 'bg-blue-50 border-2 border-blue-400 text-blue-800'
                    : isPassed
                    ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-slate-100 text-slate-400 border border-slate-200/60'
                }`}
              >
                <span>Semester {s}</span>
                {isPassed && <span className="text-emerald-500 font-bold text-xs">✓</span>}
                {isCurrent && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
              </button>
            );
          })}
        </div>

        {/* Main Content Body */}
        <div className="p-6 max-h-[500px] overflow-y-auto space-y-6">
          
          {/* Semester KPI Header Bar */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SGPA (Scale 10.0)</span>
              <div className="text-2xl font-black text-blue-700 mt-1 font-mono">
                {currentRec?.sgpa ? currentRec.sgpa.toFixed(2) : 'N/A'}
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Semester Grade Point</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CGPA (Cumulative)</span>
              <div className="text-2xl font-black text-indigo-700 mt-1 font-mono">
                {currentRec?.cgpa ? currentRec.cgpa.toFixed(2) : student.gpa.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Cumulative Up To Sem {selectedSemester}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Credits Earned</span>
              <div className="text-2xl font-black text-slate-800 mt-1 font-mono">
                {currentRec?.creditsEarned || 0} / {currentRec?.creditsRegistered || 20}
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Total Semester Credits</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attendance %</span>
              <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
                {currentRec?.attendancePercentage ? `${currentRec.attendancePercentage}%` : 'N/A'}
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Minimum Requirement: 75%</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Semester Status</span>
              <div className="mt-1">
                {getStatusBadge(currentRec?.status || 'Pending')}
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                {currentRec?.academicTerm || `Term ${selectedSemester}`}
              </span>
            </div>
          </div>

          {/* Edit Semester Form Collapsible Box */}
          {isEditing ? (
            <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                  <Edit className="w-4 h-4 text-blue-600" />
                  <span>Update Semester {selectedSemester} Academic Results & Status</span>
                </h4>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-slate-500 hover:text-slate-800 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Semester SGPA (0.00 - 10.00)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={editSgpa}
                    onChange={e => setEditSgpa(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Cumulative CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={editCgpa}
                    onChange={e => setEditCgpa(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Attendance Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editAttendance}
                    onChange={e => setEditAttendance(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Semester Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                  >
                    <option value="Passed">Passed</option>
                    <option value="Promoted">Promoted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Backlog">Backlog / Compartment</option>
                    <option value="Withheld">Withheld</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Academic Controller Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Cleared all core theory papers with distinction. Eligible for Semester 5."
                  value={editRemarks}
                  onChange={e => setEditRemarks(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveSemesterUpdate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Semester Update</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-slate-600 font-medium">
                  {currentRec?.remarks || `Academic summary for Semester ${selectedSemester}`}
                </span>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Update Marks / Result</span>
              </button>
            </div>
          )}

          {/* Course Grades Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="p-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Semester {selectedSemester} Course Grade Sheet ({currentRec?.courses?.length || 0} Subjects)</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-500">Grading System: 10-Point Letter Scale</span>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
                  <th className="p-3 pl-4">Course Code</th>
                  <th className="p-3">Course Title</th>
                  <th className="p-3">Credits</th>
                  <th className="p-3">Marks</th>
                  <th className="p-3">Letter Grade</th>
                  <th className="p-3 text-right pr-4">Grade Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-mono">
                {currentRec?.courses && currentRec.courses.length > 0 ? (
                  currentRec.courses.map((c, idx) => {
                    const gradePointMap: Record<string, number> = {
                      'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0
                    };
                    const pts = gradePointMap[c.grade] ?? 8;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 pl-4 font-bold text-blue-700">{c.code}</td>
                        <td className="p-3 font-sans font-semibold text-slate-900">{c.title}</td>
                        <td className="p-3 font-mono">{c.credits}</td>
                        <td className="p-3">{c.marksObtained} / {c.maxMarks}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            c.grade === 'O' || c.grade === 'A+' ? 'bg-emerald-100 text-emerald-800' :
                            c.grade === 'A' || c.grade === 'B+' ? 'bg-blue-100 text-blue-800' :
                            c.grade === 'F' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {c.grade}
                          </span>
                        </td>
                        <td className="p-3 text-right pr-4 font-bold text-slate-900">{pts}.0</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                      No course grade entries registered for Semester {selectedSemester}. Click "Update Marks" to add grade details.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>ScholarCore Official Examination & Academic Evaluation Engine</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Official Printable Grade Card Overlay Modal */}
      {showReportCard && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Bar */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                <div>
                  <h4 className="font-bold text-sm">Official Semester Grade Sheet Transcript</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Semester {selectedSemester} • {studentName}</p>
                </div>
              </div>

              <button
                onClick={() => setShowReportCard(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Grade Sheet Body */}
            <div className="p-6 bg-white space-y-5 max-h-[500px] overflow-y-auto">
              <div className="border-2 border-slate-900 p-6 rounded-xl space-y-4 relative">
                
                {/* Header */}
                <div className="text-center border-b-2 border-slate-900 pb-3">
                  <h2 className="text-lg font-black text-slate-900 tracking-wider uppercase">SCHOLARCORE ACADEMIC INSTITUTION</h2>
                  <p className="text-xs font-bold text-slate-600">OFFICIAL STATEMENT OF MARKS & GRADE CARD</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Autonomous Academic Evaluation & Controller of Examinations</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[9px]">STUDENT NAME</span>
                    <span className="font-bold text-slate-900">{studentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">ROLL / ENROLLMENT NO</span>
                    <span className="font-bold text-blue-700">{studentIdStr}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">DEPARTMENT / PROGRAM</span>
                    <span className="font-bold text-slate-800">{student.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">SEMESTER EVALUATED</span>
                    <span className="font-bold text-emerald-700">Semester {selectedSemester} ({currentRec?.academicTerm || 'Autumn'})</span>
                  </div>
                </div>

                {/* Grades Table */}
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-slate-900">
                      <th className="py-1">Code</th>
                      <th className="py-1">Subject Title</th>
                      <th className="py-1 text-center">Credits</th>
                      <th className="py-1 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {currentRec?.courses?.map((c, i) => (
                      <tr key={i}>
                        <td className="py-1.5 font-bold">{c.code}</td>
                        <td className="py-1.5 font-sans text-slate-800">{c.title}</td>
                        <td className="py-1.5 text-center">{c.credits}</td>
                        <td className="py-1.5 text-center font-bold text-blue-700">{c.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Performance Footer */}
                <div className="grid grid-cols-3 gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block text-[9px]">SEMESTER SGPA</span>
                    <span className="text-lg font-black text-blue-700">{currentRec?.sgpa ? currentRec.sgpa.toFixed(2) : '8.50'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">CUMULATIVE CGPA</span>
                    <span className="text-lg font-black text-indigo-700">{currentRec?.cgpa ? currentRec.cgpa.toFixed(2) : student.gpa.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">SEMESTER RESULT</span>
                    <span className="text-sm font-bold text-emerald-700 mt-1 block">{currentRec?.status || 'Passed'}</span>
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-6 flex items-end justify-between text-[10px] text-slate-500 font-mono">
                  <div className="text-center">
                    <div className="h-6 border-b border-slate-400 mb-1"></div>
                    <span>Dean Academic Affairs</span>
                  </div>

                  <QrCode className="w-12 h-12 text-slate-800 p-1 bg-white border border-slate-300 rounded" />

                  <div className="text-center">
                    <div className="h-6 border-b border-slate-400 mb-1"></div>
                    <span>Controller of Examinations</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">Official ScholarCore Transcript System</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Grade Card</span>
                </button>
                <button
                  onClick={() => setShowReportCard(false)}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
