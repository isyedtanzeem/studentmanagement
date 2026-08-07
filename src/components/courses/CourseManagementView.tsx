import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  Building2,
  Clock,
  GraduationCap,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  ArrowUpDown
} from 'lucide-react';
import { Course, CourseQueryParams, CourseStats, DepartmentOption } from '../../types/course';
import { courseApi } from '../../api/courseApi';
import { CourseModal } from './CourseModal';
import { CourseDeleteModal } from './CourseDeleteModal';
import { CourseDetailDrawer } from './CourseDetailDrawer';

export const CourseManagementView: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<CourseStats>({
    total: 0,
    active: 0,
    inactive: 0,
    totalEnrolled: 0,
    totalCredits: 0,
    avgFee: 0
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 9
  });

  const [departmentOptions, setDepartmentOptions] = useState<DepartmentOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals & Drawer State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: CourseQueryParams = {
        page: pagination.currentPage,
        limit: pagination.limit,
        search,
        department: selectedDepartment,
        level: selectedLevel,
        status: selectedStatus,
        sortBy,
        sortOrder
      };

      const res = await courseApi.getCourses(params);
      if (res.success) {
        setCourses(res.data);
        setStats(res.stats);
        setPagination((prev) => ({
          ...prev,
          currentPage: res.pagination.currentPage,
          totalPages: res.pagination.totalPages,
          totalItems: res.pagination.totalItems
        }));
      }
    } catch (err) {
      console.error('Error loading courses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.currentPage,
    pagination.limit,
    search,
    selectedDepartment,
    selectedLevel,
    selectedStatus,
    sortBy,
    sortOrder
  ]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchDepartmentOptions();
  }, []);

  const fetchDepartmentOptions = async () => {
    try {
      const res = await courseApi.getDepartmentOptions();
      if (res.success) {
        setDepartmentOptions(res.data);
      }
    } catch (err) {
      console.error('Failed to load department options', err);
    }
  };

  const handleOpenAdd = () => {
    setActiveCourse(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (crs: Course) => {
    setActiveCourse(crs);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (crs: Course) => {
    setActiveCourse(crs);
    setIsDeleteModalOpen(true);
  };

  const handleOpenDrawer = (crs: Course) => {
    setActiveCourse(crs);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Course Management Module
              </h1>
              <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold uppercase">
                Curriculum '26
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Academic Affairs • Degree Programs, Duration Specifications, Semester Fee Matrices & Department Mapping
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchCourses()}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors border border-slate-200 cursor-pointer"
            title="Refresh Courses"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Course
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold tracking-wider block">Total Courses</span>
          <span className="text-2xl font-bold text-slate-900 font-mono mt-0.5 block">{stats.total}</span>
        </div>

        <div className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold tracking-wider block">Active Intake</span>
          <span className="text-2xl font-bold text-emerald-600 font-mono mt-0.5 block">{stats.active}</span>
        </div>

        <div className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold tracking-wider block">Total Enrolled</span>
          <span className="text-2xl font-bold text-blue-600 font-mono mt-0.5 block">{stats.totalEnrolled}</span>
        </div>

        <div className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold tracking-wider block">Total Credits</span>
          <span className="text-2xl font-bold text-purple-600 font-mono mt-0.5 block">{stats.totalCredits}</span>
        </div>

        <div className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold tracking-wider block">Avg Semester Fee</span>
          <span className="text-2xl font-bold text-amber-600 font-mono mt-0.5 block">
            ₹{stats.avgFee > 0 ? stats.avgFee.toLocaleString('en-IN') : '0'}
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold tracking-wider block">Avg Enrollment</span>
          <span className="text-2xl font-bold text-indigo-600 font-mono mt-0.5 block">
            {stats.total > 0 ? Math.round(stats.totalEnrolled / stats.total) : 0}
          </span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search course title, code (e.g. CS101), instructor, degree..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Department Dropdown Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-medium text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="bg-transparent text-slate-900 focus:outline-none cursor-pointer max-w-[160px] truncate"
              >
                <option value="ALL">All Departments</option>
                {departmentOptions.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-medium text-slate-700">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <select
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="bg-transparent text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Academic Levels</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Diploma">Diploma</option>
                <option value="Doctoral">Doctoral</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-xl px-2 py-1 font-medium text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-900 focus:outline-none pr-2 py-1 cursor-pointer"
              >
                <option value="title">Sort by Title</option>
                <option value="code">Sort by Code</option>
                <option value="totalFee">Sort by Total Fee</option>
                <option value="credits">Sort by Credits</option>
                <option value="enrolledStudents">Sort by Enrolled</option>
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

      {/* Main Grid or Table Content */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 font-mono bg-white border border-slate-200/90 rounded-2xl shadow-xs">
          Loading course catalog records...
        </div>
      ) : courses.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-slate-500 text-sm font-medium">No course records found matching your filters.</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Course
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((crs) => {
            const courseFee = crs.courseFee || 0;
            const labFee = crs.labFee || 0;
            const totalFee = crs.totalFee || (courseFee + labFee);

            return (
              <motion.div
                key={crs.id}
                whileHover={{ y: -2 }}
                onClick={() => handleOpenDrawer(crs)}
                className="bg-white border border-slate-200/90 hover:border-blue-400 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-mono font-bold text-blue-700 text-sm shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {crs.code}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {crs.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {crs.department}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold shrink-0 ${
                      crs.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {crs.status || 'Active'}
                  </span>
                </div>

                {/* Duration & Fee Row */}
                <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold block">Duration</span>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{crs.duration || '4 Years'}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold block">Semester Fee</span>
                    <div className="text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-mono">
                      ₹{totalFee.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Metrics Pills */}
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                  <div className="bg-slate-50 border border-slate-200/80 p-2 rounded-lg text-center">
                    <span className="text-slate-400 text-[9px] block uppercase font-semibold">Credits</span>
                    <span className="text-purple-700 font-bold block mt-0.5">{crs.credits}</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 p-2 rounded-lg text-center">
                    <span className="text-slate-400 text-[9px] block uppercase font-semibold">Level</span>
                    <span className="text-indigo-700 font-bold block mt-0.5 truncate text-[10px]">
                      {crs.level || 'UG'}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 p-2 rounded-lg text-center">
                    <span className="text-slate-400 text-[9px] block uppercase font-semibold">Enrolled</span>
                    <span className="text-blue-700 font-bold block mt-0.5">{crs.enrolledStudents}</span>
                  </div>
                </div>

                {/* Instructor Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs text-slate-500 font-medium truncate max-w-[170px]">
                    Lead: <span className="text-slate-800 font-semibold">{crs.instructorName || 'Faculty Chair'}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(crs)}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                      title="Edit Course"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenDelete(crs)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                      title="Delete Course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-mono text-[11px] uppercase border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Course Title & Program</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5 text-right">Semester Fee</th>
                  <th className="p-3.5 text-center">Credits</th>
                  <th className="p-3.5 text-center">Enrolled</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {courses.map((crs) => {
                  const courseFee = crs.courseFee || 0;
                  const labFee = crs.labFee || 0;
                  const totalFee = crs.totalFee || (courseFee + labFee);

                  return (
                    <tr
                      key={crs.id}
                      onClick={() => handleOpenDrawer(crs)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      <td className="p-3.5 font-mono text-blue-700 font-bold">
                        {crs.code}
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {crs.title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {crs.degreeProgram || 'Degree Course'} • {crs.level || 'UG'}
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-700 font-medium">
                        {crs.department}
                      </td>

                      <td className="p-3.5 text-slate-800 font-medium">
                        {crs.duration || '4 Years / 8 Semesters'}
                      </td>

                      <td className="p-3.5 font-mono text-right text-slate-900 font-bold">
                        ₹{totalFee.toLocaleString('en-IN')}
                      </td>

                      <td className="p-3.5 font-mono text-center text-purple-700 font-bold">
                        {crs.credits}
                      </td>

                      <td className="p-3.5 font-mono text-center text-blue-700 font-bold">
                        {crs.enrolledStudents}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono border font-semibold ${
                            crs.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {crs.status || 'Active'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5 font-medium">
                          <button
                            onClick={() => handleOpenEdit(crs)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 text-xs cursor-pointer"
                            title="Edit"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleOpenDelete(crs)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 text-xs cursor-pointer"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      <div className="p-4 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between text-xs text-slate-600 font-medium shadow-xs">
        <div>
          Showing {courses.length} of {pagination.totalItems} courses
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
      <CourseModal
        isOpen={isModalOpen}
        courseToEdit={activeCourse}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchCourses()}
      />

      <CourseDeleteModal
        isOpen={isDeleteModalOpen}
        course={activeCourse}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={() => fetchCourses()}
      />

      <CourseDetailDrawer
        isOpen={isDrawerOpen}
        course={activeCourse}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={(crs) => {
          setIsDrawerOpen(false);
          handleOpenEdit(crs);
        }}
        onDelete={(crs) => {
          setIsDrawerOpen(false);
          handleOpenDelete(crs);
        }}
      />
    </div>
  );
};
