import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  ShieldAlert,
  GraduationCap,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserCheck,
  Building,
  DollarSign
} from 'lucide-react';
import { Guardian, GuardianQueryParams, GuardianStats } from '../../types/guardian';
import { guardianApi } from '../../api/guardianApi';
import { GuardianModal } from './GuardianModal';
import { GuardianDeleteModal } from './GuardianDeleteModal';
import { GuardianDetailDrawer } from './GuardianDetailDrawer';

export const GuardianManagementView: React.FC = () => {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [stats, setStats] = useState<GuardianStats>({
    total: 0,
    active: 0,
    inactive: 0,
    totalMappedStudents: 0,
    emergencyContactsCount: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
  const [deletingGuardian, setDeletingGuardian] = useState<Guardian | null>(null);
  const [viewingGuardian, setViewingGuardian] = useState<Guardian | null>(null);

  useEffect(() => {
    fetchGuardians();
  }, [page, limit, search, relationshipFilter, statusFilter]);

  const fetchGuardians = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: GuardianQueryParams = {
        page,
        limit,
        search: search.trim() || undefined,
        relationship: relationshipFilter !== 'ALL' ? relationshipFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined
      };

      const res = await guardianApi.getGuardians(params);
      if (res.success) {
        setGuardians(res.data);
        setStats(res.stats);
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.totalItems);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load guardian records.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleRelationshipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRelationshipFilter(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            Guardian & Parent Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain parents' details, emergency contact hotlines, residential addresses, and student mappings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchGuardians()}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs transition-all"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <button
            onClick={() => {
              setEditingGuardian(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Add Guardian Record
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Guardians */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Total Registered Guardians</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{stats.total}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Active Profiles */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Active Profiles</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{stats.active}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Mapped Students */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Mapped Enrolled Students</p>
            <p className="text-xl font-bold text-purple-600 mt-1">{stats.totalMappedStudents}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Emergency Hotlines Active</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{stats.emergencyContactsCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by guardian name, parent name, student roll #, phone, city..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Relationship Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={relationshipFilter}
                onChange={handleRelationshipChange}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Relationships</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Legal Guardian">Legal Guardian</option>
                <option value="Local Guardian">Local Guardian</option>
                <option value="Relative">Relative</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Layout Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table Rows View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="w-24 h-4 bg-slate-200 rounded-md"></div>
                <div className="w-16 h-4 bg-slate-200 rounded-full"></div>
              </div>
              <div className="w-40 h-6 bg-slate-200 rounded-md"></div>
              <div className="w-full h-12 bg-slate-100 rounded-xl"></div>
              <div className="w-32 h-4 bg-slate-200 rounded-md"></div>
            </div>
          ))}
        </div>
      ) : guardians.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Guardian Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or filter settings, or add a new guardian profile.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setRelationshipFilter('ALL');
              setStatusFilter('ALL');
            }}
            className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {guardians.map(guardian => (
            <motion.div
              key={guardian.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
                    {guardian.guardianId}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        guardian.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {guardian.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                    {guardian.guardianName}
                  </h3>
                  <p className="text-xs font-medium text-indigo-600">
                    Relationship: {guardian.relationship}
                    {guardian.occupation && ` • ${guardian.occupation}`}
                  </p>
                </div>

                {/* Parents Chips */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">Father:</span>
                    <span className="font-semibold text-slate-800 line-clamp-1">
                      {guardian.fatherName || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">Mother:</span>
                    <span className="font-semibold text-slate-800 line-clamp-1">
                      {guardian.motherName || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Contact & Emergency Highlights */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800">{guardian.primaryPhone}</span>
                  </div>

                  {guardian.emergencyContactName && (
                    <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200/60 text-[11px]">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="line-clamp-1 font-semibold">
                        Emergency: {guardian.emergencyContactName} ({guardian.emergencyContactPhone})
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-slate-500 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="line-clamp-1">
                      {guardian.city}, {guardian.state}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200/60">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                  {guardian.mappedStudentIds ? guardian.mappedStudentIds.length : 0} Student(s)
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingGuardian(guardian)}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="View Profile Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setEditingGuardian(guardian);
                      setIsAddModalOpen(true);
                    }}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit Guardian"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingGuardian(guardian)}
                    className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Guardian"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* TABLE ROWS VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Guardian ID & Name</th>
                  <th className="py-3 px-4">Relationship</th>
                  <th className="py-3 px-4">Parent Names</th>
                  <th className="py-3 px-4">Primary Contact</th>
                  <th className="py-3 px-4">Emergency Hotline</th>
                  <th className="py-3 px-4">Mapped Students</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {guardians.map(guardian => (
                  <tr key={guardian.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{guardian.guardianName}</p>
                        <p className="font-mono text-[10px] text-indigo-600 font-bold">
                          {guardian.guardianId}
                        </p>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {guardian.relationship}
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-700 space-y-0.5">
                        <p className="line-clamp-1">
                          <span className="text-slate-400 text-[10px]">F:</span> {guardian.fatherName}
                        </p>
                        <p className="line-clamp-1">
                          <span className="text-slate-400 text-[10px]">M:</span> {guardian.motherName}
                        </p>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900">{guardian.primaryPhone}</p>
                        <p className="text-[11px] text-slate-400">{guardian.email || '-'}</p>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {guardian.emergencyContactPhone}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">
                        {guardian.mappedStudentIds ? guardian.mappedStudentIds.length : 0} student(s)
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {guardian.city}, {guardian.state}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingGuardian(guardian)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingGuardian(guardian);
                            setIsAddModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingGuardian(guardian)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
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
      )}

      {/* Pagination Footer */}
      {!loading && guardians.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-900">{guardians.length}</strong> of{' '}
            <strong className="text-slate-900">{totalItems}</strong> guardian records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <GuardianModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingGuardian(null);
        }}
        onSuccess={fetchGuardians}
        guardianToEdit={editingGuardian}
      />

      <GuardianDeleteModal
        isOpen={!!deletingGuardian}
        onClose={() => setDeletingGuardian(null)}
        onSuccess={fetchGuardians}
        guardian={deletingGuardian}
      />

      <GuardianDetailDrawer
        isOpen={!!viewingGuardian}
        onClose={() => setViewingGuardian(null)}
        guardian={viewingGuardian}
        onEdit={g => {
          setViewingGuardian(null);
          setEditingGuardian(g);
          setIsAddModalOpen(true);
        }}
      />
    </div>
  );
};
