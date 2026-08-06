import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, Users, Building2, BookOpen, FileText, X, ArrowRight, ShieldCheck, Bell, Settings, CreditCard, TrendingUp, Sparkles } from 'lucide-react';
import { studentApi } from '../../api/studentApi';
import { courseApi } from '../../api/courseApi';
import { departmentApi } from '../../api/departmentApi';
import { admissionApi } from '../../api/admissionApi';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (module: 'admissions' | 'students' | 'departments' | 'courses' | 'guardians' | 'documents' | 'idcards' | 'promotion' | 'alumni' | 'reports' | 'notifications' | 'settings' | 'executive') => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectModule
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    students: Array<{ id: string; name: string; roll: string; dept: string }>;
    courses: Array<{ id: string; code: string; title: string; dept: string }>;
    departments: Array<{ id: string; code: string; name: string }>;
    admissions: Array<{ id: string; appNo: string; name: string; status: string }>;
  }>({
    students: [],
    courses: [],
    departments: [],
    admissions: []
  });

  // Global Quick Shortcuts / System Modules
  const quickModules = [
    { id: 'executive', name: 'Executive Dashboard & KPIs', icon: Sparkles, cat: 'Overview' },
    { id: 'admissions', name: 'Admission Intake & Verification', icon: GraduationCap, cat: 'Students' },
    { id: 'students', name: 'Student Information Directory', icon: Users, cat: 'Students' },
    { id: 'departments', name: 'Departmental Faculties', icon: Building2, cat: 'Academics' },
    { id: 'courses', name: 'Course Catalog & Syllabus', icon: BookOpen, cat: 'Academics' },
    { id: 'documents', name: 'Student Academic Records', icon: FileText, cat: 'Documents' },
    { id: 'idcards', name: 'Student Digital ID Cards', icon: CreditCard, cat: 'Verification' },
    { id: 'promotion', name: 'Semester Academic Promotion', icon: TrendingUp, cat: 'Academics' },
    { id: 'alumni', name: 'Graduated Alumni Network', icon: GraduationCap, cat: 'Network' },
    { id: 'reports', name: 'Analytics & Audit Reports', icon: FileText, cat: 'Analytics' },
    { id: 'notifications', name: 'System Alerts & Dispatch', icon: Bell, cat: 'Communication' },
    { id: 'settings', name: 'System Governance & Users', icon: Settings, cat: 'Admin' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ students: [], courses: [], departments: [], admissions: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const q = query.toLowerCase();
        const [studRes, courseRes, deptRes, admRes] = await Promise.all([
          studentApi.getStudents({ search: query, limit: 5 }).catch(() => ({ data: { students: [] } })),
          courseApi.getCourses({ search: query }).catch(() => ({ data: { courses: [] } })),
          departmentApi.getDepartments({ search: query }).catch(() => ({ data: { departments: [] } })),
          admissionApi.getApplications({ search: query, limit: 5 }).catch(() => ({ data: { applications: [] } }))
        ]);

        const studentsArr = (studRes as any)?.data?.students || [];
        const coursesArr = (courseRes as any)?.data?.courses || [];
        const deptsArr = (deptRes as any)?.data?.departments || [];
        const admArr = (admRes as any)?.data?.applications || [];

        setResults({
          students: studentsArr.slice(0, 4).map((s: any) => ({
            id: s.id,
            name: `${s.firstName} ${s.lastName}`,
            roll: s.enrollmentNumber || s.rollNumber || 'N/A',
            dept: s.departmentName || s.departmentCode || 'General'
          })),
          courses: coursesArr.slice(0, 4).map((c: any) => ({
            id: c.id,
            code: c.code,
            title: c.name || c.title,
            dept: c.departmentCode || 'CS'
          })),
          departments: deptsArr.slice(0, 4).map((d: any) => ({
            id: d.id,
            code: d.code,
            name: d.name
          })),
          admissions: admArr.slice(0, 4).map((a: any) => ({
            id: a.id,
            appNo: a.applicationNumber,
            name: a.applicantName,
            status: a.status
          }))
        });
      } catch (err) {
        console.error('Global search query error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const filteredQuickModules = quickModules.filter(
    m => m.name.toLowerCase().includes(query.toLowerCase()) || m.cat.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-200">
      <div className="bg-[#12121a] border border-amber-500/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-amber-500/10 flex flex-col max-h-[80vh]">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-black/40">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            placeholder="Search students, courses, departments, applications, or jump to workspace module..."
            className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-zinc-500 font-sans"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-zinc-400 font-mono">
            ESC
          </span>
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 font-sans">
          {loading && (
            <div className="py-8 text-center text-xs text-amber-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>Searching across ScholarCore SIMS database...</span>
            </div>
          )}

          {/* Module Navigation Jump Shortcuts */}
          {(!query || filteredQuickModules.length > 0) && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Workspace Quick Jump
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredQuickModules.slice(0, query ? 6 : 8).map(mod => {
                  const Icon = mod.icon;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => {
                        onSelectModule(mod.id as any);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all text-left flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white group-hover:text-amber-300">{mod.name}</p>
                          <span className="text-[10px] text-zinc-400">{mod.cat}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Student Search Results */}
          {results.students.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Student Matches ({results.students.length})
              </span>
              <div className="space-y-1.5">
                {results.students.map(s => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onSelectModule('students');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-amber-500/30 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="text-xs font-medium text-white">{s.name}</p>
                        <p className="text-[10px] text-zinc-400">Roll: {s.roll} • Dept: {s.dept}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-mono">View Record</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Search Results */}
          {results.courses.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Course Catalog Matches ({results.courses.length})
              </span>
              <div className="space-y-1.5">
                {results.courses.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectModule('courses');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-amber-500/30 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="text-xs font-medium text-white">{c.code}: {c.title}</p>
                        <p className="text-[10px] text-zinc-400">Department: {c.dept}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded font-mono font-semibold">Syllabus</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Department Results */}
          {results.departments.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Department Matches ({results.departments.length})
              </span>
              <div className="space-y-1.5">
                {results.departments.map(d => (
                  <div
                    key={d.id}
                    onClick={() => {
                      onSelectModule('departments');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-amber-500/30 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="text-xs font-medium text-white">[{d.code}] {d.name}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">Faculty Info</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admission Results */}
          {results.admissions.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Admission Application Matches ({results.admissions.length})
              </span>
              <div className="space-y-1.5">
                {results.admissions.map(a => (
                  <div
                    key={a.id}
                    onClick={() => {
                      onSelectModule('admissions');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-amber-500/30 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="text-xs font-medium text-white">{a.name} ({a.appNo})</p>
                        <p className="text-[10px] text-zinc-400">Status: {a.status}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-mono">Applicant Details</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-black/60 border-t border-white/10 text-xs text-zinc-400 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">↑↓</span> to navigate
            <span className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">ENTER</span> to select
          </div>
          <span className="text-[10px] text-amber-400/80 font-mono">ScholarCore Search v2.6</span>
        </div>
      </div>
    </div>
  );
};
