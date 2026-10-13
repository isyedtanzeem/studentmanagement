import React, { useState, useEffect } from 'react';
import {
  Search,
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  FileText,
  X,
  ArrowRight,
  CreditCard,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Layers
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (module: 'admissions' | 'students' | 'departments' | 'courses' | 'documents' | 'idcards' | 'promotion' | 'alumni' | 'reports' | 'notifications' | 'settings' | 'executive') => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectModule
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    students: Array<{ id: string; name: string; roll: string; dept: string; email?: string }>;
    courses: Array<{ id: string; code: string; title: string; dept: string; credits?: number }>;
    departments: Array<{ id: string; code: string; name: string; buildingLocation?: string }>;
    admissions: Array<{ id: string; appNo: string; name: string; status: string; department?: string }>;
  }>({
    students: [],
    courses: [],
    departments: [],
    admissions: []
  });

  // Exactly matching the 8 quick jump shortcuts shown in user reference image
  const quickModules = [
    { id: 'executive', name: 'Executive Dashboard & KPIs', icon: Sparkles, cat: 'Overview' },
    { id: 'admissions', name: 'Admission Intake & Verification', icon: GraduationCap, cat: 'Students' },
    { id: 'students', name: 'Student Information Directory', icon: Users, cat: 'Students' },
    { id: 'departments', name: 'Departmental Faculties', icon: Building2, cat: 'Academics' },
    { id: 'courses', name: 'Course Catalog & Syllabus', icon: BookOpen, cat: 'Academics' },
    { id: 'idcards', name: 'Student Digital ID Cards', icon: CreditCard, cat: 'Verification' },
    { id: 'promotion', name: 'Semester Academic Promotion', icon: TrendingUp, cat: 'Academics' },
    { id: 'alumni', name: 'Graduated Alumni Network', icon: GraduationCap, cat: 'Network' }
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

  // Backend search logic: Calls /api/v1/dashboard/search?q=...
  useEffect(() => {
    if (!query.trim()) {
      setResults({ students: [], courses: [], departments: [], admissions: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await fetch(`/api/v1/dashboard/search?q=${encodeURIComponent(query.trim())}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        const data = await res.json();
        if (data.success && data.data) {
          setResults({
            students: data.data.students || [],
            courses: data.data.courses || [],
            departments: data.data.departments || [],
            admissions: data.data.admissions || []
          });
        }
      } catch (err) {
        console.error('Backend search query error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResultsCount =
    results.students.length +
    results.courses.length +
    results.departments.length +
    results.admissions.length;

  const filteredQuickModules = quickModules.filter(
    m => m.name.toLowerCase().includes(query.toLowerCase()) || m.cat.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-14 sm:pt-20 px-4 animate-in fade-in duration-150 font-poppins">
      <div className="bg-[#FAFBFD] border border-slate-300 rounded-[3px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Search Header Row (Authentic to user photo) */}
        <div className="p-3.5 bg-white border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            placeholder="Search students, courses, departments, applications, or jump to workspace module..."
            className="w-full bg-transparent text-sm text-slate-900 focus:outline-none placeholder:text-slate-400 font-poppins font-normal"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-[2px] transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded-[2px] bg-slate-100 border border-slate-300 text-[10px] text-slate-500 font-mono">
            ESC
          </kbd>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {loading && (
            <div className="py-6 text-center text-xs text-blue-700 flex items-center justify-center gap-2 font-medium bg-blue-50/50 border border-blue-100 rounded-[3px]">
              <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Querying backend database across ScholarCore modules...</span>
            </div>
          )}

          {/* WORKSPACE QUICK JUMP (Identical to User Photo Layout) */}
          {(!query || filteredQuickModules.length > 0) && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                Workspace Quick Jump
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredQuickModules.map(mod => {
                  const Icon = mod.icon;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => {
                        onSelectModule(mod.id as any);
                        onClose();
                      }}
                      className="p-3 rounded-[3px] bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/60 transition-all text-left flex items-center justify-between group shadow-2xs cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[3px] bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 truncate">{mod.name}</p>
                          <span className="text-[10px] text-slate-500 font-medium">{mod.cat}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-all shrink-0 ml-2" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Backend Search Result Sections */}
          {query.trim() && !loading && totalResultsCount === 0 && (
            <div className="py-8 text-center bg-white border border-dashed border-slate-300 rounded-[3px] p-6 space-y-2">
              <Search className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No matching database records found</p>
              <p className="text-[11px] text-slate-500">
                No students, courses, departments, or applications match &quot;{query}&quot;. Try searching by name, roll number, or department code.
              </p>
            </div>
          )}

          {/* Student Search Matches */}
          {results.students.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
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
                    className="p-2.5 rounded-[3px] bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer flex items-center justify-between shadow-2xs transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-[2px] bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{s.name}</p>
                        <p className="text-[11px] text-slate-500">
                          Roll: <strong className="text-slate-700">{s.roll}</strong> • Dept: {s.dept}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-[2px] font-medium">
                      View Profile
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Search Matches */}
          {results.courses.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
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
                    className="p-2.5 rounded-[3px] bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 cursor-pointer flex items-center justify-between shadow-2xs transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-[2px] bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {c.code.slice(0, 3)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">
                          <span className="text-indigo-700 font-bold mr-1">{c.code}</span>
                          {c.title}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Department: {c.dept} {c.credits ? `• ${c.credits} Credits` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-[2px] font-medium">
                      Syllabus
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Department Search Matches */}
          {results.departments.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
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
                    className="p-2.5 rounded-[3px] bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 cursor-pointer flex items-center justify-between shadow-2xs transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-[2px] bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {d.code}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">[{d.code}] {d.name}</p>
                        {d.buildingLocation && (
                          <p className="text-[11px] text-slate-500">{d.buildingLocation}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-[2px] font-medium">
                      View Dept
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admission Matches */}
          {results.admissions.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
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
                    className="p-2.5 rounded-[3px] bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 cursor-pointer flex items-center justify-between shadow-2xs transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-[2px] bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                        APP
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{a.name} ({a.appNo})</p>
                        <p className="text-[11px] text-slate-500">Status: {a.status} • {a.department || 'Applied'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-[2px] font-medium">
                      Applicant Details
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer (Authentic to user photo) */}
        <div className="p-2.5 bg-slate-100 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-1.5 py-0.5 rounded-[2px] bg-white border border-slate-300 font-mono text-[10px] shadow-2xs">↑↓</span> to navigate
            <span className="px-1.5 py-0.5 rounded-[2px] bg-white border border-slate-300 font-mono text-[10px] shadow-2xs ml-1">ENTER</span> to select
          </div>
          <span className="text-[10px] text-slate-500 font-mono font-medium">ScholarCore Search v2.6</span>
        </div>
      </div>
    </div>
  );
};
