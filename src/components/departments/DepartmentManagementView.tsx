import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  MapPin,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  ArrowUpDown,
  UserCheck
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

  // Filters & Sorting
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
  }, [
    pagination.currentPage,
    pagination.limit,
    search,
    selectedStatus,
    sortBy,
    sortOrder
  ]);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Department Management Module
              </h1>
              <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold uppercase">
                Academic Year 2026-2027
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Academic Dean's Office • Departmental Hierarchy, Head of Department (HOD) Assignments & Curriculum Mapping
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDepartments()}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors border border-slate-200 cursor-pointer"
            title="Refresh Departments"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold tracking-wider block">Total Departments</span>
          <span className="text-2xl font-bold text-slate-900 font-mono mt-0.5 block">{stats.total}</span>
        </div>

        <div className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold tracking-wider block">Active Intake</span>
          <span className="text-2xl font-bold text-emerald-600 font-mono mt-0.5 block">{stats.active}</span>
        </div>

        <div className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold tracking-wider block">Total Enrolled</span>
          <span className="text-2xl font-bold text-blue-600 font-mono mt-0.5 block">{stats.totalStudents}</span>
        </div>

        <div className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold tracking-wider block">Faculty Members</span>
          <span className="text-2xl font-bold text-indigo-600 font-mono mt-0.5 block">{stats.totalFaculty}</span>
        </div>

        <div className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold tracking-wider block">Courses Offered</span>
          <span className="text-2xl font-bold text-purple-600 font-mono mt-0.5 block">{stats.totalCourses}</span>
        </div>

        <div className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold tracking-wider block">Avg Students / Dept</span>
          <span className="text-2xl font-bold text-amber-600 font-mono mt-0.5 block">
            {stats.total > 0 ? Math.round(stats.totalStudents / stats.total) : 0}
          </span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search department by name, code (e.g. CSE), HOD name, location..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 font-medium text-xs">
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
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    selectedStatus === tab.id
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-xl px-2 py-1 font-medium text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-900 focus:outline-none pr-2 py-1 cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                <option value="code">Sort by Code</option>
                <option value="studentCount">Sort by Enrolled Students</option>
                <option value="facultyCount">Sort by Faculty Count</option>
                <option value="coursesCount">Sort by Courses</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-1.5 py-0.5 rounded hover:bg-slate-200 text-xs font-bold text-blue-600 cursor-pointer"
                title="Toggle Sort Direction"
              >
                {sortOrder.toUpperCase()}
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 border border-slate-300 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
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
        <div className="p-12 text-center text-slate-500 font-mono bg-white border border-slate-200/90 rounded-2xl shadow-xs">
          Loading department records...
        </div>
      ) : departments.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-slate-500 font-medium text-sm">No departments found matching your criteria.</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs inline-flex items-center gap-2 shadow-xs cursor-pointer"
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
              whileHover={{ y: -2 }}
              onClick={() => handleOpenDrawer(dept)}
              className="bg-white border border-slate-200/90 hover:border-blue-400 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-mono font-bold text-blue-700 text-sm shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {dept.code}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {dept.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {dept.buildingLocation || 'Main Block'}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold shrink-0 ${
                    dept.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {dept.status}
                </span>
              </div>

              {/* HOD Section */}
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold block">Head of Department (HOD)</span>
                  <div className="text-xs font-semibold text-slate-900 truncate">{dept.headOfDepartment}</div>
                  <div className="text-[10px] text-blue-700 font-medium truncate">{dept.hodDesignation || 'Professor & HOD'}</div>
                </div>
              </div>

              {/* Metrics Pills */}
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                <div className="bg-slate-50 border border-slate-200/80 p-2 rounded-lg text-center">
                  <span className="text-slate-400 text-[9px] block uppercase font-semibold">Students</span>
                  <span className="text-blue-700 font-bold block mt-0.5">{dept.studentCount}</span>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 p-2 rounded-lg text-center">
                  <span className="text-slate-400 text-[9px] block uppercase font-semibold">Faculty</span>
                  <span className="text-indigo-700 font-bold block mt-0.5">{dept.facultyCount}</span>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 p-2 rounded-lg text-center">
                  <span className="text-slate-400 text-[9px] block uppercase font-semibold">Courses</span>
                  <span className="text-purple-700 font-bold block mt-0.5">{dept.coursesCount}</span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs text-slate-500 font-medium">Est. {dept.establishedYear || 'N/A'}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                    title="Edit Department"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenDelete(dept)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition-colors cursor-pointer"
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
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-mono text-[11px] uppercase border-b border-slate-200 font-semibold">
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
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {departments.map((dept) => (
                  <tr
                    key={dept.id}
                    onClick={() => handleOpenDrawer(dept)}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    <td className="p-3.5 font-mono text-blue-700 font-bold">
                      {dept.code}
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {dept.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Est. {dept.establishedYear || 'N/A'}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="text-slate-900 font-medium">{dept.headOfDepartment}</div>
                      <div className="text-[10px] text-slate-500">{dept.hodDesignation || 'Professor & HOD'}</div>
                    </td>

                    <td className="p-3.5 text-slate-700 font-medium">
                      {dept.buildingLocation || 'Main Block'}
                    </td>

                    <td className="p-3.5 font-mono text-center text-blue-700 font-bold">
                      {dept.studentCount}
                    </td>

                    <td className="p-3.5 font-mono text-center text-indigo-700 font-bold">
                      {dept.facultyCount}
                    </td>

                    <td className="p-3.5 font-mono text-center text-purple-700 font-bold">
                      {dept.coursesCount}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono border font-semibold ${
                          dept.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {dept.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5 font-medium">
                        <button
                          onClick={() => handleOpenEdit(dept)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 text-xs cursor-pointer"
                          title="Edit"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleOpenDelete(dept)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 text-xs cursor-pointer"
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
      <div className="p-4 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between text-xs text-slate-600 font-medium shadow-xs">
        <div>
          Showing {departments.length} of {pagination.totalItems} departments
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPagination((prev) => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
            disabled={pagination.currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-mono">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => setPagination((prev) => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-800 transition-colors cursor-pointer"
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
