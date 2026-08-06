import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Clock,
  DollarSign,
  Award,
  Users,
  GraduationCap,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  ArrowUpDown,
  UserCheck,
  Layers,
  Sparkles
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d0d12]/90 border border-white/10 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-amber-700 p-0.5 shadow-xl">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center text-[#D4AF37]">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-mono tracking-wider">
                Course Management Module
              </h1>
              <span className="bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-mono px-2 py-0.5 rounded-md uppercase">
                Curriculum '26
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Academic Affairs • Degree Programs, Duration Specifications, Semester Fee Matrices & Department Mapping
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchCourses()}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl transition-colors border border-white/10"
            title="Refresh Courses"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#c49f27] text-black font-semibold rounded-xl text-xs font-mono transition-colors flex items-center gap-2 shadow-lg shadow-[#D4AF37]/10"
          >
            <Plus className="w-4 h-4" />
            Add New Course
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0d0d12]/90 border border-white/10 p-4 rounded-xl">
          <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider block">Total Courses</span>
          <span className="text-2xl font-bold text-white font-mono mt-0.5 block">{stats.total}</span>
        </div>

        <div className="bg-[#0d0d12]/90 border border-white/10 p-4 rounded-xl">
          <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider block">Active Intake</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono mt-0.5 block">{stats.active}</span>
        </div>

        <div className="bg-[#0d0d12]/90 border border-white/10 p-4 rounded-xl">
          <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider block">Total Enrolled</span>
          <span className="text-2xl font-bold text-sky-400 font-mono mt-0.5 block">{stats.totalEnrolled}</span>
        </div>

        <div className="bg-[#0d0d12]/90 border border-white/10 p-4 rounded-xl">
          <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider block">Total Credits</span>
          <span className="text-2xl font-bold text-purple-400 font-mono mt-0.5 block">{stats.totalCredits}</span>
        </div>

        <div className="bg-[#0d0d12]/90 border border-white/10 p-4 rounded-xl">
          <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider block">Avg Semester Fee</span>
          <span className="text-2xl font-bold text-[#D4AF37] font-mono mt-0.5 block">
            ₹{stats.avgFee > 0 ? stats.avgFee.toLocaleString('en-IN') : '0'}
          </span>
        </div>

        <div className="bg-[#0d0d12]/90 border border-white/10 p-4 rounded-xl">
          <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider block">Avg Enrollment</span>
          <span className="text-2xl font-bold text-amber-400 font-mono mt-0.5 block">
            {stats.total > 0 ? Math.round(stats.totalEnrolled / stats.total) : 0}
          </span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-[#0d0d12]/90 border border-white/10 p-4 rounded-2xl space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search course title, code (e.g. CS101), instructor, degree..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Department Dropdown Filter */}
            <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 font-mono text-zinc-300">
              <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="bg-transparent text-white focus:outline-none cursor-pointer max-w-[150px] truncate"
              >
                <option value="ALL" className="bg-zinc-900 text-white">All Departments</option>
                {departmentOptions.map((d) => (
                  <option key={d.id} value={d.name} className="bg-zinc-900 text-white">
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 font-mono text-zinc-300">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-zinc-900 text-white">All Academic Levels</option>
                <option value="Undergraduate" className="bg-zinc-900 text-white">Undergraduate</option>
                <option value="Postgraduate" className="bg-zinc-900 text-white">Postgraduate</option>
                <option value="Diploma" className="bg-zinc-900 text-white">Diploma</option>
                <option value="Doctoral" className="bg-zinc-900 text-white">Doctoral</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-black/60 border border-white/10 rounded-xl px-2 py-1 font-mono text-zinc-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-white focus:outline-none pr-2 py-1 cursor-pointer"
              >
                <option value="title">Sort by Title</option>
                <option value="code">Sort by Code</option>
                <option value="totalFee">Sort by Total Fee</option>
                <option value="credits">Sort by Credits</option>
                <option value="enrolledStudents">Sort by Enrolled</option>
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

      {/* Main Grid or Table Content */}
      {isLoading ? (
        <div className="p-12 text-center text-zinc-500 font-mono bg-[#0d0d12]/90 border border-white/10 rounded-2xl">
          Loading course catalog records...
        </div>
      ) : courses.length === 0 ? (
        <div className="p-12 text-center bg-[#0d0d12]/90 border border-white/10 rounded-2xl space-y-3">
          <BookOpen className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-zinc-400 font-mono text-sm">No course records found matching your filters.</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c49f27] text-black font-semibold rounded-xl text-xs font-mono inline-flex items-center gap-2"
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
                whileHover={{ y: -3 }}
                onClick={() => handleOpenDrawer(crs)}
                className="bg-[#0d0d12]/90 border border-white/10 hover:border-[#D4AF37]/50 rounded-2xl p-5 shadow-xl transition-all cursor-pointer flex flex-col justify-between group space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-amber-900/40 border border-[#D4AF37]/40 flex items-center justify-center font-mono font-bold text-[#D4AF37] text-sm shrink-0 group-hover:scale-105 transition-transform">
                      {crs.code}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                        {crs.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#D4AF37]" />
                          {crs.department}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-medium shrink-0 ${
                      crs.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {crs.status || 'Active'}
                  </span>
                </div>

                {/* Duration & Fee Row */}
                <div className="bg-black/60 border border-white/5 p-3 rounded-xl flex items-center justify-between font-mono">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-zinc-500 uppercase block">Duration</span>
                    <div className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{crs.duration || '4 Years'}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className="text-[9px] text-zinc-500 uppercase block">Semester Fee</span>
                    <div className="text-xs font-bold text-white bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2 py-0.5 rounded">
                      ₹{totalFee.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Metrics Pills */}
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                  <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg text-center">
                    <span className="text-zinc-500 text-[9px] block uppercase">Credits</span>
                    <span className="text-purple-400 font-bold block mt-0.5">{crs.credits}</span>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg text-center">
                    <span className="text-zinc-500 text-[9px] block uppercase">Level</span>
                    <span className="text-amber-300 font-bold block mt-0.5 truncate text-[10px]">
                      {crs.level || 'UG'}
                    </span>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg text-center">
                    <span className="text-zinc-500 text-[9px] block uppercase">Enrolled</span>
                    <span className="text-sky-400 font-bold block mt-0.5">{crs.enrolledStudents}</span>
                  </div>
                </div>

                {/* Instructor Footer */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[10px] text-zinc-400 truncate max-w-[170px]">
                    Lead: {crs.instructorName || 'Faculty Chair'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(crs)}
                      className="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg border border-sky-500/20 transition-colors"
                      title="Edit Course"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenDelete(crs)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-colors"
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
        <div className="bg-[#0d0d12]/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/60 text-zinc-400 font-mono text-[11px] uppercase border-b border-white/10">
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
              <tbody className="divide-y divide-white/5 text-zinc-300 font-sans">
                {courses.map((crs) => {
                  const courseFee = crs.courseFee || 0;
                  const labFee = crs.labFee || 0;
                  const totalFee = crs.totalFee || (courseFee + labFee);

                  return (
                    <tr
                      key={crs.id}
                      onClick={() => handleOpenDrawer(crs)}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    >
                      <td className="p-3.5 font-mono text-[#D4AF37] font-bold">
                        {crs.code}
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
                          {crs.title}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {crs.degreeProgram || 'Degree Course'} • {crs.level || 'UG'}
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-zinc-300">
                        {crs.department}
                      </td>

                      <td className="p-3.5 font-mono text-amber-400">
                        {crs.duration || '4 Years / 8 Semesters'}
                      </td>

                      <td className="p-3.5 font-mono text-right text-white font-bold">
                        ₹{totalFee.toLocaleString('en-IN')}
                      </td>

                      <td className="p-3.5 font-mono text-center text-purple-400 font-bold">
                        {crs.credits}
                      </td>

                      <td className="p-3.5 font-mono text-center text-sky-400 font-bold">
                        {crs.enrolledStudents}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                            crs.status === 'Active'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          {crs.status || 'Active'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5 font-mono">
                          <button
                            onClick={() => handleOpenEdit(crs)}
                            className="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg border border-sky-500/20 text-[10px]"
                            title="Edit"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleOpenDelete(crs)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 text-[10px]"
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
      <div className="p-4 bg-[#0d0d12]/90 border border-white/10 rounded-2xl flex items-center justify-between text-xs font-mono text-zinc-400">
        <div>
          Showing {courses.length} of {pagination.totalItems} courses
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
