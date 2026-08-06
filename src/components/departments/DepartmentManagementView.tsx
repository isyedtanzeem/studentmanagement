import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  Users,
  GraduationCap,
  BookOpen,
  MapPin,
  Calendar,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  MoreVertical,
  Mail,
  Phone,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { Department, DepartmentQueryParams, DepartmentStats } from '../../types/department';
import { departmentApi } from '../../api/departmentApi';
import { DepartmentModal } from './DepartmentModal';
import { DepartmentDeleteModal } from './DepartmentDeleteModal';
import { DepartmentDetailDrawer } from './DepartmentDetailDrawer';

export const DepartmentManagementView: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stats, setStats] = useState<DepartmentStats>({
    total: 0,
    active: 0,
    inactive: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 9
  });

  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals & Drawer State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDepartment, setActiveDepartment] = useState<Department | null>(null);

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: DepartmentQueryParams = {
        page: pagination.currentPage,
        limit: pagination.limit,
        search,
        status: selectedStatus,
        sortBy,
        sortOrder
      };

      const res = await departmentApi.getDepartments(params);
      if (res.success) {
        setDepartments(res.data);
        setStats(res.stats);
        setPagination((prev) => ({
          ...prev,
          currentPage: res.pagination.currentPage,
          totalPages: res.pagination.totalPages,
          totalItems: res.pagination.totalItems
        }));
      }
    } catch (err) {
      console.error('Error loading departments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, search, selectedStatus, sortBy, sortOrder]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleOpenAdd = () => {
    setActiveDepartment(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setActiveDepartment(dept);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (dept: Department) => {
    setActiveDepartment(dept);
    setIsDeleteModalOpen(true);
  };

  const handleOpenDrawer = (dept: Department) => {
    setActiveDepartment(dept);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d0d12]/90 border border-white/10 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-amber-700 p-0.5 shadow-xl">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center text-[#D4AF37]">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-mono tracking-wider">
                Department Management Module
              </h1>
              <span className="bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-mono px-2 py-0.5 rounded-md uppercase">
                Academic Year 2026-2027
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Academic Dean's Office • Departmental Hierarchy, Head of Department (HOD) Assignments & Curriculum Mapping
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDepartments()}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl transition-colors border border-white/10"
            title="Refresh Departments"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#c49f27] text-black font-semibold rounded-xl text-xs font-mono transition-colors flex items-center gap-2 shadow-lg shadow-[#D4AF37]/10"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0d0d12]/90 border border-white/10 p-4 rounded-xl">
          <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider block">Total Departments</span>
          <span className="text-2xl font-bold text-white font-mono mt-0.5 block">{stats.total}</span>
        </div>

        <div className="bg-[#0d0d12]/90 border border-white/10 p-4 rounded-xl">
          <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider block">Active Intake</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono mt-0.5 block">{stats.active}</span>
        </div>

        <div className="bg-[#0d0d12]/90 border border-white/10 p-4 rounded-xl">
          <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider block">Total Enrolled</span>
          <span className="text-2xl font-bold text-amber-400 font-mono mt-0.5 block">{stats.totalStudents}</span>
        </div>

        <div className="bg-[#0d0d12]/90 border border-white/10 p-4 rounded-xl">
          <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider block">Faculty Members</span>
          <span className="text-2xl font-bold text-sky-400 font-mono mt-0.5 block">{stats.totalFaculty}</span>
        </div>

        <div className="bg-[#0d0d12]/90 border border-white/10 p-4 rounded-xl">
          <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider block">Courses Offered</span>
          <span className="text-2xl font-bold text-purple-400 font-mono mt-0.5 block">{stats.totalCourses}</span>
        </div>

        <div className="bg-[#0d0d12]/90 border border-white/10 p-4 rounded-xl">
          <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider block">Avg Students / Dept</span>
          <span className="text-2xl font-bold text-[#D4AF37] font-mono mt-0.5 block">
            {stats.total > 0 ? Math.round(stats.totalStudents / stats.total) : 0}
          </span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-[#0d0d12]/90 border border-white/10 p-4 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search department by name, code (e.g. CSE), HOD name, location..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 font-mono">
              {[
                { id: 'ALL', label: 'All Status' },
                { id: 'Active', label: 'Active' },
                { id: 'Inactive', label: 'Inactive' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedStatus(tab.id);
                    setPagination((prev) => ({ ...prev, currentPage: 1 }));
                  }}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    selectedStatus === tab.id
                      ? 'bg-[#D4AF37] text-black font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-black/60 border border-white/10 rounded-xl px-2 py-1 font-mono text-zinc-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-white focus:outline-none pr-2 py-1 cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                <option value="code">Sort by Code</option>
                <option value="studentCount">Sort by Enrolled Students</option>
                <option value="facultyCount">Sort by Faculty Count</option>
                <option value="coursesCount">Sort by Courses</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-1.5 py-0.5 rounded hover:bg-white/10 text-xs font-bold text-[#D4AF37]"
                title="Toggle Sort Direction"
              >
                {sortOrder.toUpperCase()}
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-1 font-mono">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white/10 text-[#D4AF37]' : 'text-zinc-400 hover:text-white'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white/10 text-[#D4AF37]' : 'text-zinc-400 hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Department Cards Grid or Table View */}
      {isLoading ? (
        <div className="p-12 text-center text-zinc-500 font-mono bg-[#0d0d12]/90 border border-white/10 rounded-2xl">
          Loading department records...
        </div>
      ) : departments.length === 0 ? (
        <div className="p-12 text-center bg-[#0d0d12]/90 border border-white/10 rounded-2xl space-y-3">
          <Building2 className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-zinc-400 font-mono text-sm">No departments found matching your criteria.</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c49f27] text-black font-semibold rounded-xl text-xs font-mono inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Department
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <motion.div
              key={dept.id}
              whileHover={{ y: -3 }}
              onClick={() => handleOpenDrawer(dept)}
              className="bg-[#0d0d12]/90 border border-white/10 hover:border-[#D4AF37]/50 rounded-2xl p-5 shadow-xl transition-all cursor-pointer flex flex-col justify-between group space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-amber-900/40 border border-[#D4AF37]/40 flex items-center justify-center font-mono font-bold text-[#D4AF37] text-base shrink-0 group-hover:scale-105 transition-transform">
                    {dept.code}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                      {dept.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        {dept.buildingLocation || 'Main Block'}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-medium shrink-0 ${
                    dept.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {dept.status}
                </span>
              </div>

              {/* HOD Section */}
              <div className="bg-black/60 border border-white/5 p-3 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] text-xs font-mono font-bold shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Head of Department (HOD)</span>
                  <div className="text-xs font-semibold text-white truncate">{dept.headOfDepartment}</div>
                  <div className="text-[10px] text-[#D4AF37] font-mono truncate">{dept.hodDesignation || 'Professor & HOD'}</div>
                </div>
              </div>

              {/* Metrics Pills */}
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg text-center">
                  <span className="text-zinc-500 text-[9px] block uppercase">Students</span>
                  <span className="text-amber-400 font-bold block mt-0.5">{dept.studentCount}</span>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg text-center">
                  <span className="text-zinc-500 text-[9px] block uppercase">Faculty</span>
                  <span className="text-sky-400 font-bold block mt-0.5">{dept.facultyCount}</span>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg text-center">
                  <span className="text-zinc-500 text-[9px] block uppercase">Courses</span>
                  <span className="text-purple-400 font-bold block mt-0.5">{dept.coursesCount}</span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono" onClick={(e) => e.stopPropagation()}>
                <span className="text-[10px] text-zinc-500">Est. {dept.establishedYear || 'N/A'}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg border border-sky-500/20 transition-colors"
                    title="Edit Department"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenDelete(dept)}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-colors"
                    title="Delete Department"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-[#0d0d12]/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/60 text-zinc-400 font-mono text-[11px] uppercase border-b border-white/10">
                <tr>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Department Name</th>
                  <th className="p-3.5">Head of Department (HOD)</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5 text-center">Students</th>
                  <th className="p-3.5 text-center">Faculty</th>
                  <th className="p-3.5 text-center">Courses</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300 font-sans">
                {departments.map((dept) => (
                  <tr
                    key={dept.id}
                    onClick={() => handleOpenDrawer(dept)}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  >
                    <td className="p-3.5 font-mono text-[#D4AF37] font-bold">
                      {dept.code}
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
                        {dept.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">Est. {dept.establishedYear || 'N/A'}</div>
                    </td>

                    <td className="p-3.5 font-mono">
                      <div className="text-white font-medium">{dept.headOfDepartment}</div>
                      <div className="text-[10px] text-zinc-400">{dept.hodDesignation || 'Professor & HOD'}</div>
                    </td>

                    <td className="p-3.5 font-mono text-zinc-300">
                      {dept.buildingLocation || 'Main Block'}
                    </td>

                    <td className="p-3.5 font-mono text-center text-amber-400 font-bold">
                      {dept.studentCount}
                    </td>

                    <td className="p-3.5 font-mono text-center text-sky-400 font-bold">
                      {dept.facultyCount}
                    </td>

                    <td className="p-3.5 font-mono text-center text-purple-400 font-bold">
                      {dept.coursesCount}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                          dept.status === 'Active'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {dept.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5 font-mono">
                        <button
                          onClick={() => handleOpenEdit(dept)}
                          className="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg border border-sky-500/20 text-[10px]"
                          title="Edit"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleOpenDelete(dept)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 text-[10px]"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      <div className="p-4 bg-[#0d0d12]/90 border border-white/10 rounded-2xl flex items-center justify-between text-xs font-mono text-zinc-400">
        <div>
          Showing {departments.length} of {pagination.totalItems} departments
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPagination((prev) => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
            disabled={pagination.currentPage === 1}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => setPagination((prev) => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modals & Drawer */}
      <DepartmentModal
        isOpen={isModalOpen}
        departmentToEdit={activeDepartment}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchDepartments()}
      />

      <DepartmentDeleteModal
        isOpen={isDeleteModalOpen}
        department={activeDepartment}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={() => fetchDepartments()}
      />

      <DepartmentDetailDrawer
        isOpen={isDrawerOpen}
        department={activeDepartment}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={(dept) => {
          setIsDrawerOpen(false);
          handleOpenEdit(dept);
        }}
        onDelete={(dept) => {
          setIsDrawerOpen(false);
          handleOpenDelete(dept);
        }}
      />
    </div>
  );
};
