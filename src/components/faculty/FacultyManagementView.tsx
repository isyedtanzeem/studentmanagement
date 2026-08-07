import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Award,
  Eye,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Faculty, FacultyStats } from '../../types/faculty';
import { facultyApi } from '../../api/facultyApi';
import { departmentApi } from '../../api/departmentApi';
import { FacultyFormModal } from './FacultyFormModal';
import { FacultyDetailDrawer } from './FacultyDetailDrawer';
import { FacultyDeleteModal } from './FacultyDeleteModal';

export const FacultyManagementView: React.FC = () => {
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [stats, setStats] = useState<FacultyStats>({
    total: 0,
    hodCount: 0,
    professorCount: 0,
    asstProfessorCount: 0,
    activeCount: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedDesignation, setSelectedDesignation] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [departmentsList, setDepartmentsList] = useState<string[]>([]);

  // Modals & Drawers State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [viewingFaculty, setViewingFaculty] = useState<Faculty | null>(null);
  const [deletingFaculty, setDeletingFaculty] = useState<Faculty | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchFacultyList();
  }, [searchQuery, selectedDept, selectedDesignation, selectedStatus, currentPage]);

  const fetchDepartments = async () => {
    try {
      const res = await departmentApi.getDepartments({ limit: 100 });
      if (res.data) {
        setDepartmentsList(res.data.map((d) => d.name));
      }
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  const fetchFacultyList = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await facultyApi.getFacultyList({
        page: currentPage,
        limit: 12,
        search: searchQuery,
        department: selectedDept,
        designation: selectedDesignation,
        status: selectedStatus
      });

      setFacultyList(res.data);
      if (res.stats) setStats(res.stats);
      if (res.pagination) setTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load faculty list.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSuccess = async (facultyData: Partial<Faculty>) => {
    if (editingFaculty) {
      await facultyApi.updateFaculty(editingFaculty.id, facultyData);
    } else {
      await facultyApi.createFaculty(facultyData);
    }
    fetchFacultyList();
  };

  const handleDeleteSuccess = async (id: string) => {
    await facultyApi.deleteFaculty(id);
    fetchFacultyList();
  };

  const designationBadgeStyle = (designation: string) => {
    const des = designation.toLowerCase();
    if (des.includes('hod')) {
      return 'bg-purple-50 text-purple-800 border-purple-200';
    }
    if (des.includes('asst') || des.includes('assistant')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (des.includes('professor')) {
      return 'bg-blue-50 text-blue-800 border-blue-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Faculty Directory & Registration
              <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-mono font-bold border border-blue-200">
                {stats.total} Staff
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage institution faculty, Head of Departments (HOD), Professors, and Asst. Professors
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingFaculty(null);
            setIsFormModalOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Faculty</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-mono font-bold tracking-wider block">Total Faculty</span>
          <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">{stats.total}</span>
        </div>

        <div className="bg-purple-50/50 border border-purple-200 p-4 rounded-xl shadow-xs">
          <span className="text-purple-700 text-[10px] uppercase font-mono font-bold tracking-wider block flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-600" /> HOD Count
          </span>
          <span className="text-2xl font-bold text-purple-900 font-mono mt-1 block">{stats.hodCount}</span>
        </div>

        <div className="bg-blue-50/50 border border-blue-200 p-4 rounded-xl shadow-xs">
          <span className="text-blue-700 text-[10px] uppercase font-mono font-bold tracking-wider block">Professors</span>
          <span className="text-2xl font-bold text-blue-900 font-mono mt-1 block">{stats.professorCount}</span>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-xl shadow-xs">
          <span className="text-emerald-700 text-[10px] uppercase font-mono font-bold tracking-wider block">Asst. Professors</span>
          <span className="text-2xl font-bold text-emerald-900 font-mono mt-1 block">{stats.asstProfessorCount}</span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-slate-600 text-[10px] uppercase font-mono font-bold tracking-wider block">Active Status</span>
          <span className="text-2xl font-bold text-slate-800 font-mono mt-1 block">{stats.activeCount}</span>
        </div>
      </div>

      {/* Controls & Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex-1 w-full flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by faculty name, employee ID, email, or department..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            <option value="All">All Departments</option>
            {departmentsList.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Designation Filter (HOD, Professor, Asst. Professor) */}
          <select
            value={selectedDesignation}
            onChange={(e) => {
              setSelectedDesignation(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            <option value="All">All Designations</option>
            <option value="HOD">HOD (Head of Department)</option>
            <option value="Professor">Professor</option>
            <option value="Asst">Asst. Professor</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>

        {/* View Toggle & Refresh */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => fetchFacultyList()}
            title="Refresh List"
            className="p-2 border border-slate-300 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main List Render */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 font-medium text-xs">
          Loading faculty registry...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700 text-xs font-medium">
          {error}
        </div>
      ) : facultyList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs font-medium space-y-2">
          <Users className="w-8 h-8 text-slate-300 mx-auto" />
          <p>No faculty members found matching selected criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDept('All');
              setSelectedDesignation('All');
              setSelectedStatus('All');
            }}
            className="text-blue-600 hover:underline font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                  <th className="p-3.5 pl-5">Faculty Member</th>
                  <th className="p-3.5">Emp. ID</th>
                  <th className="p-3.5">Designation</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Qualification</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {facultyList.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 pl-5 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-mono font-bold text-xs flex-shrink-0">
                          {fac.fullName.charAt(0)}
                        </div>
                        <div>
                          <span className="block font-medium text-slate-900">{fac.fullName}</span>
                          <span className="block text-[10px] text-slate-500 font-mono">{fac.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-600 font-semibold">{fac.employeeId}</td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${designationBadgeStyle(fac.designation)}`}>
                        {fac.designation}
                      </span>
                    </td>

                    <td className="p-3.5 font-medium text-slate-800">{fac.department}</td>

                    <td className="p-3.5 text-slate-600">{fac.qualification || 'N/A'}</td>

                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                        fac.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {fac.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right pr-5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingFaculty(fac)}
                          title="View Dossier"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingFaculty(fac);
                            setIsFormModalOpen(true);
                          }}
                          title="Edit Faculty"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeletingFaculty(fac)}
                          title="Delete Faculty"
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {facultyList.map((fac) => (
            <div key={fac.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shadow-xs">
                      <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-blue-700 font-bold font-mono">
                        {fac.fullName.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{fac.fullName}</h3>
                      <span className="text-[10px] font-mono text-slate-500 block">{fac.employeeId}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${designationBadgeStyle(fac.designation)}`}>
                    {fac.designation}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-medium text-slate-800">{fac.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-[11px] text-slate-600 truncate">{fac.email}</span>
                  </div>
                  {fac.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-[11px] text-slate-600">{fac.phone}</span>
                    </div>
                  )}
                  {fac.qualification && (
                    <div className="text-[11px] text-indigo-700 font-medium pt-1">
                      {fac.qualification}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                  fac.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {fac.status}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingFaculty(fac)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingFaculty(fac);
                      setIsFormModalOpen(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingFaculty(fac)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs font-mono">
          <span className="text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-300 rounded-xl disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-300 rounded-xl disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <FacultyFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleRegisterSuccess}
        initialData={editingFaculty}
        departmentsList={departmentsList}
      />

      <FacultyDetailDrawer
        isOpen={!!viewingFaculty}
        faculty={viewingFaculty}
        onClose={() => setViewingFaculty(null)}
        onEdit={(fac) => {
          setViewingFaculty(null);
          setEditingFaculty(fac);
          setIsFormModalOpen(true);
        }}
      />

      <FacultyDeleteModal
        isOpen={!!deletingFaculty}
        faculty={deletingFaculty}
        onClose={() => setDeletingFaculty(null)}
        onConfirmDelete={handleDeleteSuccess}
      />
    </div>
  );
};
