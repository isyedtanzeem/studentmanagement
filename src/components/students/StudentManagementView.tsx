import React, { useState, useEffect } from 'react';
import { studentApi } from '../../api/studentApi';
import { Student, StudentQueryParams, StudentStats, StudentPagination } from '../../types/student';
import { StudentListTable } from './StudentListTable';
import { StudentFormModal } from './StudentFormModal';
import { StudentProfileDrawer } from './StudentProfileDrawer';
import { StudentBulkImportModal } from './StudentBulkImportModal';
import { StudentPDFReportModal } from './StudentPDFReportModal';
import {
  Users,
  UserCheck,
  GraduationCap,
  Award,
  Search,
  Filter,
  UserPlus,
  FileSpreadsheet,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  AlertTriangle
} from 'lucide-react';

const DEPARTMENTS = [
  'ALL',
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Biotechnology & Life Sciences',
  'Department of Management Studies',
  'Civil Engineering'
];

export const StudentManagementView: React.FC = () => {
  // Data state
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [pagination, setPagination] = useState<StudentPagination>({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10
  });

  // Query filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [gender, setGender] = useState('ALL');
  const [enrollmentYear, setEnrollmentYear] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // UI / Selection states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  const [isImportOpen, setIsImportOpen] = useState(false);

  const [isPDFOpen, setIsPDFOpen] = useState(false);
  const [pdfStudent, setPdfStudent] = useState<Student | null>(null);

  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Load students data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams: StudentQueryParams = {
        page: currentPage,
        limit,
        search,
        department,
        status,
        gender,
        enrollmentYear: enrollmentYear !== 'ALL' ? Number(enrollmentYear) : undefined,
        sortBy,
        sortOrder
      };

      const res = await studentApi.getStudents(queryParams);
      if (res.success) {
        setStudents(res.data);
        setStats(res.stats);
        setPagination(res.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch student registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, limit, department, status, gender, enrollmentYear, sortBy, sortOrder]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Selection handlers
  const handleSelectToggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllToggle = () => {
    if (students.every(s => selectedIds.includes(s.id))) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s.id));
    }
  };

  // Sorting
  const handleSortChange = (col: string) => {
    if (sortBy === col) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  // Form Submit (Create / Edit)
  const handleFormSubmit = async (formData: Partial<Student>) => {
    if (editingStudent) {
      await studentApi.updateStudent(editingStudent.id, formData);
    } else {
      await studentApi.createStudent(formData);
    }
    loadData();
  };

  // Single Delete
  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    try {
      await studentApi.deleteStudent(deletingStudent.id);
      setDeletingStudent(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete student.');
    }
  };

  // Bulk Delete
  const handleConfirmBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => studentApi.deleteStudent(id)));
      setSelectedIds([]);
      setIsBulkDeleteOpen(false);
      loadData();
    } catch (err: any) {
      setError('Failed to complete bulk deletion.');
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const csvText = await studentApi.exportCSV();
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scholarcore_students_export_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Failed to export students CSV.');
    }
  };

  // Bulk Import Executor
  const handleBulkImport = async (importedStudents: Partial<Student>[]) => {
    const res = await studentApi.bulkImport(importedStudents);
    loadData();
    return res.data;
  };

  return (
    <div className="space-y-6">
      {/* Module Header Title & Quick Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-light text-white serif-font">Student Management Module</h2>
              <p className="text-xs text-zinc-400">Complete student records, profiling, registration, & academic standing</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={() => setIsBulkDeleteOpen(true)}
              className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={() => setIsImportOpen(true)}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Bulk Import</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingStudent(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c49f27] text-black font-semibold rounded-xl text-xs transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0d0d12]/90 border border-white/10 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider block">Total Enrolled</span>
              <span className="text-xl font-bold text-white font-mono mt-0.5 block">{stats.total}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-[#0d0d12]/90 border border-white/10 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider block">Active Status</span>
              <span className="text-xl font-bold text-emerald-400 font-mono mt-0.5 block">{stats.active}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-[#0d0d12]/90 border border-white/10 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider block">Graduated Alumni</span>
              <span className="text-xl font-bold text-blue-400 font-mono mt-0.5 block">{stats.graduated}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-[#0d0d12]/90 border border-white/10 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider block">Average CGPA (10.0)</span>
              <span className="text-xl font-bold text-[#D4AF37] font-mono mt-0.5 block">{stats.avgGpa}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Award className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#0d0d12]/90 border border-white/10 p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by student name, Roll No (e.g. 2024CSE1001), email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="ALL" className="bg-zinc-900">All Departments</option>
              {DEPARTMENTS.filter(d => d !== 'ALL').map(d => (
                <option key={d} value={d} className="bg-zinc-900">{d}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="ALL" className="bg-zinc-900">All Statuses</option>
              <option value="Active" className="bg-zinc-900">Active</option>
              <option value="Inactive" className="bg-zinc-900">Inactive</option>
              <option value="Graduated" className="bg-zinc-900">Graduated</option>
              <option value="Suspended" className="bg-zinc-900">Suspended</option>
            </select>
          </div>

          {/* Enrollment Year Filter */}
          <div>
            <select
              value={enrollmentYear}
              onChange={(e) => {
                setEnrollmentYear(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="ALL" className="bg-zinc-900">All Enrollment Years</option>
              <option value="2026" className="bg-zinc-900">2026</option>
              <option value="2024" className="bg-zinc-900">2024</option>
              <option value="2023" className="bg-zinc-900">2023</option>
              <option value="2022" className="bg-zinc-900">2022</option>
              <option value="2021" className="bg-zinc-900">2021</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Main Student List Table */}
      <StudentListTable
        students={students}
        selectedIds={selectedIds}
        onSelectToggle={handleSelectToggle}
        onSelectAllToggle={handleSelectAllToggle}
        onView={(st) => {
          setViewingStudent(st);
          setIsDrawerOpen(true);
        }}
        onEdit={(st) => {
          setEditingStudent(st);
          setIsFormOpen(true);
        }}
        onDelete={(st) => setDeletingStudent(st)}
        onOpenPDF={(st) => {
          setPdfStudent(st);
          setIsPDFOpen(true);
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />

      {/* Pagination Footer Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0d0d12]/90 border border-white/10 p-4 rounded-2xl text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-3">
          <span>Showing items {students.length > 0 ? (pagination.currentPage - 1) * limit + 1 : 0} to {Math.min(pagination.currentPage * limit, pagination.totalItems)} of {pagination.totalItems}</span>
          <div className="flex items-center gap-1.5 ml-4">
            <span className="text-zinc-500">Per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-black border border-white/10 text-white rounded-lg px-2 py-1 text-xs focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={pagination.currentPage <= 1 || loading}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 bg-black border border-white/10 rounded-lg text-white font-semibold">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            disabled={pagination.currentPage >= pagination.totalPages || loading}
            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
            className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modals & Drawers */}
      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingStudent}
        isEditing={!!editingStudent}
      />

      <StudentProfileDrawer
        student={viewingStudent}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setViewingStudent(null);
        }}
        onEdit={(st) => {
          setEditingStudent(st);
          setIsFormOpen(true);
        }}
        onDelete={(st) => setDeletingStudent(st)}
        onOpenPDF={(st) => {
          setPdfStudent(st);
          setIsPDFOpen(true);
        }}
      />

      <StudentBulkImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleBulkImport}
      />

      <StudentPDFReportModal
        student={pdfStudent}
        isOpen={isPDFOpen}
        onClose={() => {
          setIsPDFOpen(false);
          setPdfStudent(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f0f15] border border-rose-500/30 p-6 rounded-2xl max-w-md w-full space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white serif-font">Delete Student Record?</h3>
                <p className="text-zinc-400">This action will remove the student dossier from the database.</p>
              </div>
            </div>

            <div className="bg-black/60 p-3 rounded-xl border border-white/10 font-mono text-zinc-300">
              <div className="text-white font-bold">{deletingStudent.fullName}</div>
              <div className="text-zinc-500">ID: {deletingStudent.studentId} • {deletingStudent.department}</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-zinc-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {isBulkDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f0f15] border border-rose-500/30 p-6 rounded-2xl max-w-md w-full space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white serif-font">Delete {selectedIds.length} Selected Students?</h3>
                <p className="text-zinc-400">Are you sure you want to permanently delete all selected records?</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsBulkDeleteOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-zinc-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl"
              >
                Delete All Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
