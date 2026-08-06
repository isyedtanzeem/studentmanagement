import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Sliders,
  Filter,
  Search,
  Building,
  GraduationCap,
  Calendar,
  ShieldCheck,
  FileText,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Users,
  Check,
  Info,
  X,
  Clock,
  ArrowRight,
  ShieldAlert,
  Download,
  Eye,
} from 'lucide-react';
import {
  PromotionStudentItem,
  PromotionRecord,
  ValidationRules,
  BulkPromotionResult,
} from '../../types/promotion';
import { promotionApi } from '../../api/promotionApi';

export const PromotionManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bulk' | 'individual' | 'history'>('bulk');
  const [loading, setLoading] = useState<boolean>(true);
  const [studentsData, setStudentsData] = useState<PromotionStudentItem[]>([]);
  const [historyData, setHistoryData] = useState<PromotionRecord[]>([]);
  const [historyStats, setHistoryStats] = useState({ total: 0, promoted: 0, conditional: 0, rolledBack: 0 });
  
  // Filters for bulk/individual
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [semesterFilter, setSemesterFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [academicSession, setAcademicSession] = useState<string>('2026-2027 Odd Semester');

  // Selected students for bulk promotion
  const [selectedDbIds, setSelectedDbIds] = useState<string[]>([]);

  // Rules State
  const [rules, setRules] = useState<ValidationRules>({
    minAttendance: 75,
    maxBacklogs: 2,
    requireFeePaid: true,
    requireDisciplineClearance: true,
  });
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  // Bulk promotion modal
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [bulkPromotionType, setBulkPromotionType] = useState<'Semester Promotion' | 'Year Promotion'>('Semester Promotion');
  const [allowConditionalOverride, setAllowConditionalOverride] = useState<boolean>(true);
  const [bulkRemarks, setBulkRemarks] = useState<string>('');
  const [bulkExecuting, setBulkExecuting] = useState<boolean>(false);
  const [bulkResult, setBulkResult] = useState<BulkPromotionResult | null>(null);

  // Individual promotion modal / state
  const [selectedStudentItem, setSelectedStudentItem] = useState<PromotionStudentItem | null>(null);
  const [indivPromotionType, setIndivPromotionType] = useState<'Semester Promotion' | 'Year Promotion' | 'Graduation' | 'Conditional Promotion'>('Semester Promotion');
  const [indivTargetSem, setIndivTargetSem] = useState<number>(2);
  const [indivTargetYr, setIndivTargetYr] = useState<number>(1);
  const [indivRemarks, setIndivRemarks] = useState<string>('');
  const [indivAllowOverride, setIndivAllowOverride] = useState<boolean>(false);
  const [indivExecuting, setIndivExecuting] = useState<boolean>(false);

  // History filters & Rollback
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyDept, setHistoryDept] = useState<string>('ALL');
  const [historyType, setHistoryType] = useState<string>('ALL');
  const [rollbackModalRecord, setRollbackModalRecord] = useState<PromotionRecord | null>(null);
  const [rollbackReason, setRollbackReason] = useState<string>('');
  const [rollbackExecuting, setRollbackExecuting] = useState<boolean>(false);
  const [viewDetailRecord, setViewDetailRecord] = useState<PromotionRecord | null>(null);

  // Notification Banner
  const [banner, setBanner] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Fetch Students & History
  const loadData = async () => {
    setLoading(true);
    try {
      const studentsRes = await promotionApi.getStudents({
        department: departmentFilter,
        currentSemester: semesterFilter !== 'ALL' ? Number(semesterFilter) : undefined,
        currentYear: yearFilter !== 'ALL' ? Number(yearFilter) : undefined,
        search: searchQuery,
        minAttendance: rules.minAttendance,
        maxBacklogs: rules.maxBacklogs,
        requireFeePaid: rules.requireFeePaid,
        requireDisciplineClearance: rules.requireDisciplineClearance,
      });

      setStudentsData(studentsRes.students);

      const historyRes = await promotionApi.getHistory({
        search: historySearch,
        department: historyDept,
        promotionType: historyType,
      });

      setHistoryData(historyRes.history);
      setHistoryStats(historyRes.stats);
    } catch (err: any) {
      showBanner('error', err.message || 'Failed to load promotion data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [departmentFilter, semesterFilter, yearFilter, searchQuery, historySearch, historyDept, historyType, rules]);

  const showBanner = (type: 'success' | 'error' | 'info', message: string) => {
    setBanner({ type, message });
    setTimeout(() => {
      setBanner(null);
    }, 5000);
  };

  // Toggle select all in bulk view
  const toggleSelectAll = () => {
    if (selectedDbIds.length === studentsData.length) {
      setSelectedDbIds([]);
    } else {
      setSelectedDbIds(studentsData.map(i => i.student.id));
    }
  };

  const toggleSelectStudent = (id: string) => {
    if (selectedDbIds.includes(id)) {
      setSelectedDbIds(selectedDbIds.filter(item => item !== id));
    } else {
      setSelectedDbIds([...selectedDbIds, id]);
    }
  };

  // Handle Bulk Execute
  const handleExecuteBulk = async () => {
    if (selectedDbIds.length === 0) return;
    setBulkExecuting(true);
    setBulkResult(null);

    try {
      const result = await promotionApi.promoteBulk({
        studentDbIds: selectedDbIds,
        promotionType: bulkPromotionType,
        academicSession,
        promotedBy: 'Academic Registrar',
        remarks: bulkRemarks || `Batch promotion executed for session ${academicSession}.`,
        allowOverride: allowConditionalOverride,
        validationRules: rules,
      });

      setBulkResult(result);
      showBanner(
        'success',
        `Bulk promotion completed! ${result.successCount} promoted, ${result.conditionalCount} conditional, ${result.failedCount} failed.`
      );
      setSelectedDbIds([]);
      loadData();
    } catch (err: any) {
      showBanner('error', err.message || 'Bulk promotion failed.');
    } finally {
      setBulkExecuting(false);
    }
  };

  // Handle Individual Execute
  const handleExecuteIndividual = async () => {
    if (!selectedStudentItem) return;
    setIndivExecuting(true);

    try {
      const record = await promotionApi.promoteIndividual({
        studentDbId: selectedStudentItem.student.id,
        promotionType: indivPromotionType,
        targetSemester: indivTargetSem,
        targetYear: indivTargetYr,
        academicSession,
        promotedBy: 'Academic Officer',
        remarks: indivRemarks,
        allowOverride: indivAllowOverride,
        validationRules: rules,
      });

      showBanner('success', `Student ${record.studentName} promoted to Semester ${record.newSemester}!`);
      setSelectedStudentItem(null);
      loadData();
    } catch (err: any) {
      showBanner('error', err.message || 'Individual promotion failed.');
    } finally {
      setIndivExecuting(false);
    }
  };

  // Handle Rollback Execute
  const handleExecuteRollback = async () => {
    if (!rollbackModalRecord) return;
    setRollbackExecuting(true);

    try {
      await promotionApi.rollbackPromotion(
        rollbackModalRecord.id,
        rollbackReason || 'Admin request to undo promotion step.',
        'Academic Registrar'
      );

      showBanner('success', `Promotion record for ${rollbackModalRecord.studentName} rolled back successfully.`);
      setRollbackModalRecord(null);
      setRollbackReason('');
      loadData();
    } catch (err: any) {
      showBanner('error', err.message || 'Rollback failed.');
    } finally {
      setRollbackExecuting(false);
    }
  };

  // Calculate statistics for header cards
  const totalEligible = studentsData.filter(s => s.validation.eligible).length;
  const totalWarnings = studentsData.filter(s => !s.validation.eligible).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Alert */}
      {banner && (
        <div
          className={`p-4 rounded-xl border shadow-sm flex items-start justify-between transition-all ${
            banner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : banner.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center space-x-3">
            {banner.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
            {banner.type === 'error' && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
            {banner.type === 'info' && <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />}
            <span className="text-sm font-medium">{banner.message}</span>
          </div>
          <button onClick={() => setBanner(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Title Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100/80">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Promotion Module</h1>
                <p className="text-slate-5-00 text-sm">
                  Automated semester advancement, bulk batch progression, academic validation checks, and audit rollbacks.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
              <Calendar className="w-4 h-4 text-slate-500 ml-2" />
              <select
                value={academicSession}
                onChange={e => setAcademicSession(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 px-2 py-1.5 focus:outline-none"
              >
                <option value="2026-2027 Odd Semester">2026-2027 Odd Semester</option>
                <option value="2026-2027 Even Semester">2026-2027 Even Semester</option>
                <option value="2027-2028 Academic Year">2027-2028 Academic Year</option>
              </select>
            </div>

            <button
              onClick={() => setShowRulesModal(true)}
              className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl transition shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Validation Criteria</span>
            </button>
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Filtered Students</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{studentsData.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Ready for review</div>
          </div>

          <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-700">Passed Validation</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">{totalEligible}</div>
            <div className="text-[11px] text-emerald-600 mt-0.5">100% criteria satisfied</div>
          </div>

          <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-700">Requires Override</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-900 mt-1">{totalWarnings}</div>
            <div className="text-[11px] text-amber-600 mt-0.5">Attendance/Backlog/Fee issues</div>
          </div>

          <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-indigo-700">History Log Count</span>
              <RotateCcw className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-indigo-900 mt-1">{historyStats.total}</div>
            <div className="text-[11px] text-indigo-600 mt-0.5">{historyStats.rolledBack} rolled back</div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 space-x-8 text-sm font-medium">
        <button
          onClick={() => setActiveTab('bulk')}
          className={`pb-3 px-1 border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'bulk'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Bulk & Batch Promotion</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 font-bold">
            {studentsData.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('individual')}
          className={`pb-3 px-1 border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'individual'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Single Student Promotion</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-1 border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Promotion History & Rollbacks</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-medium">
            {historyStats.total}
          </span>
        </button>
      </div>

      {/* TAB 1: BULK PROMOTION */}
      {activeTab === 'bulk' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by student name or roll ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Department Filter */}
              <div>
                <select
                  value={departmentFilter}
                  onChange={e => setDepartmentFilter(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="ALL">All Departments</option>
                  <option value="Computer Science & Engineering">Computer Science & Engg</option>
                  <option value="Electronics & Communication">Electronics & Comm</option>
                  <option value="Electrical & Electronics">Electrical & Electronics</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Biotechnology & Life Sciences">Biotechnology</option>
                  <option value="Department of Management Studies">Management Studies</option>
                </select>
              </div>

              {/* Current Semester Filter */}
              <div>
                <select
                  value={semesterFilter}
                  onChange={e => setSemesterFilter(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="ALL">All Current Semesters</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
              </div>

              {/* Current Year Filter */}
              <div>
                <select
                  value={yearFilter}
                  onChange={e => setYearFilter(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="ALL">All Academic Years</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            {/* Selection Status & Action Trigger */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center space-x-3 text-slate-600">
                <span>
                  Selected <strong className="text-slate-900">{selectedDbIds.length}</strong> of{' '}
                  <strong className="text-slate-900">{studentsData.length}</strong> students
                </span>
                {selectedDbIds.length > 0 && (
                  <button
                    onClick={() => setSelectedDbIds([])}
                    className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleSelectAll}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
                >
                  {selectedDbIds.length === studentsData.length && studentsData.length > 0
                    ? 'Deselect All'
                    : 'Select All Filtered'}
                </button>

                <button
                  disabled={selectedDbIds.length === 0}
                  onClick={() => setShowBulkModal(true)}
                  className={`inline-flex items-center space-x-2 px-4 py-1.5 text-xs font-semibold rounded-xl transition shadow-sm ${
                    selectedDbIds.length > 0
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Promote Selected ({selectedDbIds.length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Student Batch Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 mt-2">Evaluating student validation status...</p>
              </div>
            ) : studentsData.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-800 mt-2">No active students match current filters</h3>
                <p className="text-xs text-slate-500 mt-1">Try resetting department or semester dropdowns above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="p-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedDbIds.length === studentsData.length && studentsData.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                      </th>
                      <th className="p-3.5">Student Details</th>
                      <th className="p-3.5">Current Status</th>
                      <th className="p-3.5">Target Step</th>
                      <th className="p-3.5 text-center">Attendance</th>
                      <th className="p-3.5 text-center">Backlogs</th>
                      <th className="p-3.5 text-center">Fees</th>
                      <th className="p-3.5 text-center">Validation</th>
                      <th className="p-3.5 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {studentsData.map(item => {
                      const isSelected = selectedDbIds.includes(item.student.id);
                      return (
                        <tr
                          key={item.student.id}
                          className={`hover:bg-slate-50/80 transition ${
                            isSelected ? 'bg-indigo-50/40' : ''
                          }`}
                        >
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectStudent(item.student.id)}
                              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                            />
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center space-x-3">
                              <img
                                src={
                                  item.student.photoUrl ||
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                                }
                                alt={item.student.fullName}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                              />
                              <div>
                                <div className="font-semibold text-slate-900">{item.student.fullName}</div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  {item.student.studentId} • {item.student.department}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-medium text-slate-800">
                              Sem {item.student.currentSemester || 1}
                            </span>
                            <span className="text-slate-400 mx-1">•</span>
                            <span className="text-slate-500">
                              Year {item.student.currentYear || 1}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {item.isGraduating ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                <GraduationCap className="w-3 h-3 mr-1" />
                                Graduation
                              </span>
                            ) : (
                              <div className="flex items-center space-x-1.5 font-medium text-indigo-700">
                                <span>Sem {item.nextSemester}</span>
                                <ArrowRight className="w-3 h-3 text-indigo-400" />
                                <span className="text-slate-500 font-normal">Yr {item.nextYear}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`font-semibold ${
                                item.validation.attendanceOk ? 'text-slate-800' : 'text-red-600'
                              }`}
                            >
                              {item.student.attendancePercentage ?? 100}%
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                item.validation.backlogsOk
                                  ? 'bg-slate-100 text-slate-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {item.student.backlogsCount ?? 0}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                item.student.feeStatus === 'Paid' || item.student.feeStatus === 'Exempt'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {item.student.feeStatus || 'Paid'}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            {item.validation.eligible ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Pass
                              </span>
                            ) : (
                              <span
                                title={item.validation.reasons.join(', ')}
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 cursor-help"
                              >
                                <AlertTriangle className="w-3 h-3 mr-1" /> Override Req
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => {
                                setSelectedStudentItem(item);
                                setIndivTargetSem(item.nextSemester);
                                setIndivTargetYr(item.nextYear);
                                setIndivPromotionType(
                                  item.isGraduating ? 'Graduation' : 'Semester Promotion'
                                );
                                setActiveTab('individual');
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-medium text-xs rounded-lg transition"
                            >
                              Inspect & Promote
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INDIVIDUAL PROMOTION */}
      {activeTab === 'individual' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Student Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Select Student</span>
              <span className="text-xs font-normal text-slate-500">{studentsData.length} active</span>
            </h3>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name or roll..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="max-h-[480px] overflow-y-auto space-y-2 pr-1">
              {studentsData.map(item => {
                const isSelected = selectedStudentItem?.student.id === item.student.id;
                return (
                  <div
                    key={item.student.id}
                    onClick={() => {
                      setSelectedStudentItem(item);
                      setIndivTargetSem(item.nextSemester);
                      setIndivTargetYr(item.nextYear);
                      setIndivPromotionType(item.isGraduating ? 'Graduation' : 'Semester Promotion');
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          item.student.photoUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                        }
                        alt={item.student.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{item.student.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {item.student.studentId} • Sem {item.student.currentSemester || 1}
                        </div>
                      </div>
                    </div>

                    {item.validation.eligible ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Promotion Workbench Card */}
          <div className="md:col-span-2 space-y-6">
            {selectedStudentItem ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-4">
                    <img
                      src={
                        selectedStudentItem.student.photoUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                      }
                      alt={selectedStudentItem.student.fullName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm"
                    />
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {selectedStudentItem.student.fullName}
                      </h2>
                      <p className="text-xs text-slate-500 font-mono">
                        {selectedStudentItem.student.studentId} • {selectedStudentItem.student.department}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                          Current: Sem {selectedStudentItem.student.currentSemester || 1} (Year{' '}
                          {selectedStudentItem.student.currentYear || 1})
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          GPA {selectedStudentItem.student.gpa}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Batch</span>
                    <span className="text-sm font-bold text-slate-800">
                      {selectedStudentItem.student.academicBatch || '2024-2028'}
                    </span>
                  </div>
                </div>

                {/* Validation Checks Checklist */}
                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                    <span>Academic Eligibility Audit</span>
                    {selectedStudentItem.validation.eligible ? (
                      <span className="text-emerald-700 text-xs font-semibold flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Pass All Thresholds
                      </span>
                    ) : (
                      <span className="text-amber-700 text-xs font-semibold flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" /> Warnings Detected
                      </span>
                    )}
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">Attendance</div>
                      <div className="font-bold text-slate-800 mt-0.5 flex items-center justify-between">
                        <span>{selectedStudentItem.student.attendancePercentage ?? 100}%</span>
                        {selectedStudentItem.validation.attendanceOk ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-red-600" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">Min: {rules.minAttendance}%</div>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">Active Backlogs</div>
                      <div className="font-bold text-slate-800 mt-0.5 flex items-center justify-between">
                        <span>{selectedStudentItem.student.backlogsCount ?? 0}</span>
                        {selectedStudentItem.validation.backlogsOk ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-red-600" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">Max: {rules.maxBacklogs}</div>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">Fee Clearance</div>
                      <div className="font-bold text-slate-800 mt-0.5 flex items-center justify-between">
                        <span>{selectedStudentItem.student.feeStatus || 'Paid'}</span>
                        {selectedStudentItem.validation.feeOk ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-red-600" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">Paid / Exempt</div>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">Discipline</div>
                      <div className="font-bold text-slate-800 mt-0.5 flex items-center justify-between">
                        <span>
                          {selectedStudentItem.student.disciplinaryClearance !== false ? 'Cleared' : 'Flagged'}
                        </span>
                        {selectedStudentItem.validation.disciplineOk ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-red-600" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">Clearance Req</div>
                    </div>
                  </div>

                  {!selectedStudentItem.validation.eligible && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-xs space-y-1">
                      <div className="font-bold flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Promotion Blockers Detected:
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px]">
                        {selectedStudentItem.validation.reasons.map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Promotion Step Form */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Configure Targeted Step
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Promotion Action</label>
                      <select
                        value={indivPromotionType}
                        onChange={e => {
                          const val = e.target.value as any;
                          setIndivPromotionType(val);
                          if (val === 'Graduation') {
                            setIndivTargetSem(8);
                            setIndivTargetYr(4);
                          } else if (val === 'Year Promotion') {
                            const nextYr = Math.min(4, (selectedStudentItem.student.currentYear || 1) + 1);
                            setIndivTargetYr(nextYr);
                            setIndivTargetSem((nextYr - 1) * 2 + 1);
                          } else {
                            const nextSem = Math.min(8, (selectedStudentItem.student.currentSemester || 1) + 1);
                            setIndivTargetSem(nextSem);
                            setIndivTargetYr(Math.ceil(nextSem / 2));
                          }
                        }}
                        className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="Semester Promotion">Promote Semester (+1)</option>
                        <option value="Year Promotion">Promote Year (+1 Year)</option>
                        <option value="Graduation">Mark Graduated</option>
                        <option value="Conditional Promotion">Conditional Promotion</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Target Semester</label>
                      <select
                        value={indivTargetSem}
                        onChange={e => {
                          const sem = Number(e.target.value);
                          setIndivTargetSem(sem);
                          setIndivTargetYr(Math.ceil(sem / 2));
                        }}
                        className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                          <option key={s} value={s}>
                            Semester {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Target Year</label>
                      <select
                        value={indivTargetYr}
                        onChange={e => setIndivTargetYr(Number(e.target.value))}
                        className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value={1}>Year 1</option>
                        <option value={2}>Year 2</option>
                        <option value={3}>Year 3</option>
                        <option value={4}>Year 4</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Remarks / Justification Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g., Recommended by Academic Committee upon passing Semester 3 evaluation..."
                      value={indivRemarks}
                      onChange={e => setIndivRemarks(e.target.value)}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {!selectedStudentItem.validation.eligible && (
                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="checkbox"
                        id="overrideCheck"
                        checked={indivAllowOverride}
                        onChange={e => setIndivAllowOverride(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <label htmlFor="overrideCheck" className="text-xs text-amber-800 font-medium">
                        I confirm Admin Override & grant Conditional Promotion despite validation warnings.
                      </label>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                    <button
                      disabled={indivExecuting || (!selectedStudentItem.validation.eligible && !indivAllowOverride)}
                      onClick={handleExecuteIndividual}
                      className={`inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold rounded-xl transition shadow-sm ${
                        !selectedStudentItem.validation.eligible && !indivAllowOverride
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {indivExecuting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      <span>Execute Promotion Step</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-semibold text-slate-800 mt-3">Select a student from the list</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Pick any student on the left panel to inspect academic records, test eligibility criteria, and execute a targeted promotion step.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PROMOTION HISTORY & AUDIT LOGS */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* History Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search history by student name, roll ID, or officer..."
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={historyDept}
                onChange={e => setHistoryDept(e.target.value)}
                className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">All Departments</option>
                <option value="Computer Science & Engineering">Computer Science & Engg</option>
                <option value="Electronics & Communication">Electronics & Comm</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Biotechnology & Life Sciences">Biotechnology</option>
              </select>

              <select
                value={historyType}
                onChange={e => setHistoryType(e.target.value)}
                className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">All Promotion Types</option>
                <option value="Semester Promotion">Semester Promotion</option>
                <option value="Year Promotion">Year Promotion</option>
                <option value="Graduation">Graduation</option>
                <option value="Conditional Promotion">Conditional Promotion</option>
              </select>
            </div>
          </div>

          {/* History Log Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {historyData.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-800 mt-2">No promotion history logs found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Promotions executed through the module will automatically record here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="p-3.5">Student</th>
                      <th className="p-3.5">Promotion Details</th>
                      <th className="p-3.5">Session / Date</th>
                      <th className="p-3.5 text-center">Outcome Status</th>
                      <th className="p-3.5">Promoted By</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {historyData.map(record => (
                      <tr key={record.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-900">{record.studentName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {record.studentId} • {record.department}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-slate-800 flex items-center space-x-1.5">
                            <span>Sem {record.previousSemester}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className="font-bold text-indigo-600">Sem {record.newSemester}</span>
                            <span className="text-slate-400 text-[11px]">
                              (Yr {record.previousYear} → Yr {record.newYear})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{record.promotionType}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-slate-800">{record.academicSession}</div>
                          <div className="text-[11px] text-slate-500">
                            {new Date(record.promotedAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          {record.status === 'Promoted' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Promoted
                            </span>
                          )}
                          {record.status === 'Conditional' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <AlertTriangle className="w-3 h-3 mr-1" /> Conditional
                            </span>
                          )}
                          {record.status === 'Rolled Back' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              <RotateCcw className="w-3 h-3 mr-1" /> Rolled Back
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-slate-800">{record.promotedBy}</div>
                          {record.remarks && (
                            <div className="text-[11px] text-slate-500 truncate max-w-xs">{record.remarks}</div>
                          )}
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => setViewDetailRecord(record)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
                          >
                            <Eye className="w-3.5 h-3.5 inline mr-1" /> Inspect
                          </button>

                          {record.status !== 'Rolled Back' && (
                            <button
                              onClick={() => {
                                setRollbackModalRecord(record);
                                setRollbackReason('');
                              }}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5 inline mr-1" /> Rollback
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: VALIDATION THRESHOLDS CONFIG */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Promotion Validation Criteria</h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Minimum Attendance Percentage Required (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={rules.minAttendance}
                  onChange={e => setRules({ ...rules, minAttendance: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <span className="text-[10px] text-slate-400">Default standard is 75% as per AICTE/UGC rules.</span>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Maximum Active Backlogs Permitted
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={rules.maxBacklogs}
                  onChange={e => setRules({ ...rules, maxBacklogs: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <span className="text-[10px] text-slate-400">
                  Students exceeding this limit trigger a validation warning for conditional review.
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="font-semibold text-slate-800">Mandatory Fee Clearance</div>
                  <div className="text-[10px] text-slate-500">Require Paid or Exempt fee status for auto-pass.</div>
                </div>
                <input
                  type="checkbox"
                  checked={rules.requireFeePaid}
                  onChange={e => setRules({ ...rules, requireFeePaid: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="font-semibold text-slate-800">Disciplinary Clearance</div>
                  <div className="text-[10px] text-slate-500">Block promotion if student has active disciplinary holds.</div>
                </div>
                <input
                  type="checkbox"
                  checked={rules.requireDisciplineClearance}
                  onChange={e => setRules({ ...rules, requireDisciplineClearance: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition"
              >
                Apply Criteria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK PROMOTION CONFIRMATION */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Confirm Bulk Promotion Batch</h3>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-900 font-medium">
                You are about to promote <strong className="font-bold">{selectedDbIds.length} selected students</strong> for academic session <strong>{academicSession}</strong>.
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Promotion Action</label>
                <select
                  value={bulkPromotionType}
                  onChange={e => setBulkPromotionType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Semester Promotion">Increment Current Semester (+1)</option>
                  <option value="Year Promotion">Increment Current Academic Year (+1 Year)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <input
                  type="checkbox"
                  id="bulkAllowConditional"
                  checked={allowConditionalOverride}
                  onChange={e => setAllowConditionalOverride(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="bulkAllowConditional" className="text-xs text-amber-900 font-medium">
                  Grant Conditional Promotion to students with attendance/backlogs warnings.
                </label>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Batch Remarks / Executive Order Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. End of Semester Senate Approval Ref #SIMS-2026-P09..."
                  value={bulkRemarks}
                  onChange={e => setBulkRemarks(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-medium text-xs rounded-xl hover:bg-slate-200 transition"
              >
                Cancel
              </button>

              <button
                disabled={bulkExecuting}
                onClick={async () => {
                  await handleExecuteBulk();
                  setShowBulkModal(false);
                }}
                className="px-5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition flex items-center space-x-1.5"
              >
                {bulkExecuting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Run Bulk Promotion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ROLLBACK CONFIRMATION */}
      {rollbackModalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-red-600">
                <RotateCcw className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Rollback Promotion Step</h3>
              </div>
              <button
                onClick={() => setRollbackModalRecord(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-red-800 space-y-1">
                <div className="font-bold">
                  Roll Back for {rollbackModalRecord.studentName} ({rollbackModalRecord.studentId})
                </div>
                <div>
                  This will revert the student from <strong>Semester {rollbackModalRecord.newSemester}</strong> back to{' '}
                  <strong>Semester {rollbackModalRecord.previousSemester}</strong>.
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Reason for Rollback (Mandatory Audit Trail)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide explicit reason for reversing promotion (e.g. Administrative error, exam re-valuation pending)..."
                  value={rollbackReason}
                  onChange={e => setRollbackReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setRollbackModalRecord(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-medium text-xs rounded-xl hover:bg-slate-200 transition"
              >
                Cancel
              </button>

              <button
                disabled={rollbackExecuting || !rollbackReason.trim()}
                onClick={handleExecuteRollback}
                className={`px-5 py-2 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 ${
                  !rollbackReason.trim()
                    ? 'bg-red-300 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {rollbackExecuting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                <span>Confirm Rollback</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: RECORD DETAIL INSPECTION DRAWER */}
      {viewDetailRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Promotion Record Inspection</h3>
              </div>
              <button
                onClick={() => setViewDetailRecord(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Student Name</span>
                  <span className="font-bold text-slate-900">{viewDetailRecord.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Student Roll ID</span>
                  <span className="font-mono text-slate-800">{viewDetailRecord.studentId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Department</span>
                  <span className="text-slate-800">{viewDetailRecord.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Academic Session</span>
                  <span className="text-slate-800">{viewDetailRecord.academicSession}</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
                <div className="text-[10px] text-indigo-600 font-semibold uppercase">Progression Transition</div>
                <div className="text-sm font-bold text-indigo-900 flex items-center space-x-2">
                  <span>Semester {viewDetailRecord.previousSemester} (Yr {viewDetailRecord.previousYear})</span>
                  <ArrowRight className="w-4 h-4 text-indigo-500" />
                  <span>Semester {viewDetailRecord.newSemester} (Yr {viewDetailRecord.newYear})</span>
                </div>
                <div className="text-[11px] text-indigo-700 font-medium">{viewDetailRecord.promotionType}</div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Validation Audit Check Summary</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <span>Attendance: {viewDetailRecord.validationCheckSummary.attendanceVal}%</span>
                    {viewDetailRecord.validationCheckSummary.attendanceOk ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-red-600" />
                    )}
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <span>Backlogs: {viewDetailRecord.validationCheckSummary.backlogsVal}</span>
                    {viewDetailRecord.validationCheckSummary.backlogsOk ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-red-600" />
                    )}
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <span>Fee Status: {viewDetailRecord.validationCheckSummary.feeVal}</span>
                    {viewDetailRecord.validationCheckSummary.feeOk ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-red-600" />
                    )}
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <span>Disciplinary Clearance</span>
                    {viewDetailRecord.validationCheckSummary.disciplineOk ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-red-600" />
                    )}
                  </div>
                </div>
              </div>

              {viewDetailRecord.remarks && (
                <div>
                  <span className="font-bold text-slate-800 block mb-0.5">Remarks / Audit Notes</span>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                    {viewDetailRecord.remarks}
                  </div>
                </div>
              )}

              {viewDetailRecord.status === 'Rolled Back' && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-800 space-y-1">
                  <div className="font-bold flex items-center">
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Rolled Back Details
                  </div>
                  <div>By: {viewDetailRecord.rolledBackBy}</div>
                  <div>At: {new Date(viewDetailRecord.rolledBackAt!).toLocaleString()}</div>
                  <div>Reason: {viewDetailRecord.rollbackReason}</div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setViewDetailRecord(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
