import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Briefcase,
  Search,
  Building2,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe,
  Award,
  DollarSign,
  Plus,
  Filter,
  Download,
  Edit3,
  Trash2,
  Eye,
  Users,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Heart,
  Sparkles,
  RefreshCw,
  X,
  ChevronRight,
  Calendar,
  Building,
  FileSpreadsheet,
  Share2,
  BookOpen,
  Info,
  Check
} from 'lucide-react';
import { AlumniRecord, AlumniAnalyticsReport } from '../../types/alumni';
import { alumniApi } from '../../api/alumniApi';

export const AlumniManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'directory' | 'careers' | 'reports'>('directory');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [loading, setLoading] = useState<boolean>(true);
  const [alumniList, setAlumniList] = useState<AlumniRecord[]>([]);
  const [reports, setReports] = useState<AlumniAnalyticsReport | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [industryFilter, setIndustryFilter] = useState<string>('ALL');
  const [mentorsOnly, setMentorsOnly] = useState<boolean>(false);

  // Modals
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniRecord | null>(null);
  const [showAddEditModal, setShowAddEditModal] = useState<boolean>(false);
  const [editAlumniId, setEditAlumniId] = useState<string | null>(null);
  const [showDonationModal, setShowDonationModal] = useState<boolean>(false);

  // Form State for Add / Edit Alumni
  const [formData, setFormData] = useState<Partial<AlumniRecord>>({
    fullName: '',
    studentId: '',
    email: '',
    phone: '',
    graduationYear: 2024,
    department: 'Computer Science & Engineering',
    degree: 'B.Tech CSE',
    cgpa: 8.5,
    gender: 'Male',
    employmentStatus: 'Employed',
    currentCompany: '',
    designation: '',
    industry: 'Information Technology',
    salaryBand: '15 - 20 LPA',
    workLocation: '',
    currentCity: '',
    currentCountry: 'India',
    linkedinUrl: '',
    githubUrl: '',
    personalWebsite: '',
    networkingOptIn: true,
    achievements: [],
    notes: ''
  });

  // Donation form state
  const [donationAmount, setDonationAmount] = useState<number>(10000);
  const [donationPurpose, setDonationPurpose] = useState<string>('Student Scholarship Fund');
  const [donationCurrency, setDonationCurrency] = useState<string>('INR');

  // Banner
  const [banner, setBanner] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showBanner = (type: 'success' | 'error' | 'info', message: string) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 5000);
  };

  // Fetch data
  const loadData = async () => {
    setLoading(true);
    try {
      const records = await alumniApi.getAlumni({
        search: searchQuery,
        graduationYear: yearFilter !== 'ALL' ? Number(yearFilter) : undefined,
        department: departmentFilter,
        employmentStatus: statusFilter,
        industry: industryFilter,
        networkingOptIn: mentorsOnly ? true : undefined
      });
      setAlumniList(records);

      const analytics = await alumniApi.getReports();
      setReports(analytics);
    } catch (err: any) {
      showBanner('error', err.message || 'Failed to load alumni records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, yearFilter, departmentFilter, statusFilter, industryFilter, mentorsOnly]);

  // Open Edit Modal
  const handleOpenEdit = (alumni: AlumniRecord) => {
    setEditAlumniId(alumni.id);
    setFormData({
      fullName: alumni.fullName,
      studentId: alumni.studentId,
      email: alumni.email,
      phone: alumni.phone,
      graduationYear: alumni.graduationYear,
      department: alumni.department,
      degree: alumni.degree,
      cgpa: alumni.cgpa,
      gender: alumni.gender,
      employmentStatus: alumni.employmentStatus,
      currentCompany: alumni.currentCompany || '',
      designation: alumni.designation || '',
      industry: alumni.industry || '',
      salaryBand: alumni.salaryBand || '',
      workLocation: alumni.workLocation || '',
      currentCity: alumni.currentCity || '',
      currentCountry: alumni.currentCountry || '',
      linkedinUrl: alumni.linkedinUrl || '',
      githubUrl: alumni.githubUrl || '',
      personalWebsite: alumni.personalWebsite || '',
      networkingOptIn: alumni.networkingOptIn,
      notes: alumni.notes || ''
    });
    setShowAddEditModal(true);
  };

  // Save Alumni Record (Create/Edit)
  const handleSaveAlumni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.graduationYear) {
      showBanner('error', 'Please fill in required fields (Name, Email, Graduation Year).');
      return;
    }

    try {
      if (editAlumniId) {
        await alumniApi.updateAlumni(editAlumniId, formData);
        showBanner('success', `Alumni profile for ${formData.fullName} updated successfully!`);
      } else {
        await alumniApi.createAlumni(formData);
        showBanner('success', `New alumni profile created for ${formData.fullName}!`);
      }
      setShowAddEditModal(false);
      setEditAlumniId(null);
      loadData();
    } catch (err: any) {
      showBanner('error', err.message || 'Failed to save alumni profile.');
    }
  };

  // Delete Alumni
  const handleDeleteAlumni = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete alumni profile for ${name}?`)) return;
    try {
      await alumniApi.deleteAlumni(id);
      showBanner('success', `Deleted alumni record for ${name}.`);
      if (selectedAlumni?.id === id) setSelectedAlumni(null);
      loadData();
    } catch (err: any) {
      showBanner('error', err.message || 'Failed to delete alumni profile.');
    }
  };

  // Submit Donation
  const handleRecordDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumni) return;

    try {
      const updated = await alumniApi.recordGiving(selectedAlumni.id, {
        amount: donationAmount,
        currency: donationCurrency,
        purpose: donationPurpose
      });
      setSelectedAlumni(updated);
      showBanner('success', `Successfully recorded contribution of ${donationCurrency} ${donationAmount.toLocaleString()} from ${updated.fullName}!`);
      setShowDonationModal(false);
      loadData();
    } catch (err: any) {
      showBanner('error', err.message || 'Failed to record contribution.');
    }
  };

  // Export Alumni Directory CSV
  const handleExportCSV = () => {
    if (alumniList.length === 0) return;
    const headers = ['Student ID', 'Full Name', 'Email', 'Phone', 'Graduation Year', 'Department', 'Degree', 'Employment Status', 'Company', 'Designation', 'Industry', 'Work Location', 'City', 'Country', 'LinkedIn'];
    const rows = alumniList.map(a => [
      `"${a.studentId}"`,
      `"${a.fullName}"`,
      `"${a.email}"`,
      `"${a.phone}"`,
      a.graduationYear,
      `"${a.department}"`,
      `"${a.degree}"`,
      `"${a.employmentStatus}"`,
      `"${a.currentCompany || ''}"`,
      `"${a.designation || ''}"`,
      `"${a.industry || ''}"`,
      `"${a.workLocation || ''}"`,
      `"${a.currentCity || ''}"`,
      `"${a.currentCountry || ''}"`,
      `"${a.linkedinUrl || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ScholarCore_Alumni_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showBanner('success', 'Exported Alumni Directory CSV successfully.');
  };

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
            {banner.type === 'error' && <X className="w-5 h-5 text-red-600 flex-shrink-0" />}
            {banner.type === 'info' && <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />}
            <span className="text-sm font-medium">{banner.message}</span>
          </div>
          <button onClick={() => setBanner(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Quick Summary KPI Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Alumni Network & Career Tracker</h1>
                <p className="text-slate-500 text-sm">
                  Graduation records, employment statistics, global alumni directory, mentorship, and endowment contributions.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Directory</span>
            </button>

            <button
              onClick={() => {
                setEditAlumniId(null);
                setFormData({
                  fullName: '',
                  studentId: `ALM${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`,
                  email: '',
                  phone: '',
                  graduationYear: 2024,
                  department: 'Computer Science & Engineering',
                  degree: 'B.Tech CSE',
                  cgpa: 8.5,
                  gender: 'Male',
                  employmentStatus: 'Employed',
                  currentCompany: '',
                  designation: '',
                  industry: 'Information Technology',
                  salaryBand: '15 - 20 LPA',
                  workLocation: '',
                  currentCity: '',
                  currentCountry: 'India',
                  linkedinUrl: '',
                  githubUrl: '',
                  personalWebsite: '',
                  networkingOptIn: true,
                  notes: ''
                });
                setShowAddEditModal(true);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Register Alumni</span>
            </button>
          </div>
        </div>

        {/* Stats Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Registered Alumni</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{reports?.totalAlumni || alumniList.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Classes of 2018 - 2024</div>
          </div>

          <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-700">Employment Rate</span>
              <Briefcase className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">{reports?.employmentRate || 92.5}%</div>
            <div className="text-[11px] text-emerald-600 mt-0.5">Employed + Founders + Higher Ed</div>
          </div>

          <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-indigo-700">Top Employers</span>
              <Building2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-sm font-bold text-indigo-900 mt-1 truncate">
              {reports?.topCompanies?.slice(0, 2).map(c => c.company).join(', ') || 'Google, Qualcomm, Tesla'}
            </div>
            <div className="text-[11px] text-indigo-600 mt-0.5">{reports?.topCompanies?.length || 5}+ MNCs & Startups</div>
          </div>

          <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-700">Total Alumni Giving</span>
              <Heart className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-900 mt-1">
              ₹{(reports?.totalDonationsRaised || 425000).toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-600 mt-0.5">Endowments & Lab Funds</div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-200 space-x-8 text-sm font-medium">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 px-1 border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'directory'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Alumni Directory</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 font-bold">
            {alumniList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('careers')}
          className={`pb-3 px-1 border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'careers'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Career & Industry Insights</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-1 border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'reports'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Reports</span>
        </button>
      </div>

      {/* TAB 1: ALUMNI DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name, roll ID, company, location..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Graduation Year */}
              <div>
                <select
                  value={yearFilter}
                  onChange={e => setYearFilter(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="ALL">All Graduation Years</option>
                  <option value="2024">Class of 2024</option>
                  <option value="2023">Class of 2023</option>
                  <option value="2022">Class of 2022</option>
                  <option value="2021">Class of 2021</option>
                  <option value="2020">Class of 2020</option>
                </select>
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

              {/* Employment Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="ALL">All Employment Statuses</option>
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed / Founder">Self-Employed / Founder</option>
                  <option value="Higher Studies">Higher Studies</option>
                  <option value="Seeking Opportunities">Seeking Opportunities</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mentorsOnly}
                    onChange={e => setMentorsOnly(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>Show Mentors / Student Advisors Only</span>
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-slate-400">View:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    viewMode === 'grid' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-500'
                  }`}
                >
                  Cards Grid
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    viewMode === 'table' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-500'
                  }`}
                >
                  Table View
                </button>
              </div>
            </div>
          </div>

          {/* Alumni Grid / Table */}
          {loading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 mt-2">Loading alumni directory...</p>
            </div>
          ) : alumniList.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-800 mt-2">No alumni profiles match current search criteria</h3>
              <p className="text-xs text-slate-500 mt-1">Try resetting search keywords or filters above.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {alumniList.map(alumni => (
                <div
                  key={alumni.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            alumni.photoUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
                          }
                          alt={alumni.fullName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                        />
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition">
                            {alumni.fullName}
                          </h3>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {alumni.studentId} • Class of {alumni.graduationYear}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          alumni.employmentStatus === 'Employed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : alumni.employmentStatus === 'Self-Employed / Founder'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : alumni.employmentStatus === 'Higher Studies'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {alumni.employmentStatus}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50/80 rounded-xl text-xs space-y-1.5 border border-slate-100">
                      <div className="font-semibold text-slate-800 flex items-center truncate">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 mr-1.5 flex-shrink-0" />
                        <span className="truncate">{alumni.designation || 'Alumni'}</span>
                        {alumni.currentCompany && (
                          <span className="text-slate-500 font-normal ml-1">@ {alumni.currentCompany}</span>
                        )}
                      </div>

                      <div className="text-slate-500 text-[11px] flex items-center">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 mr-1.5 flex-shrink-0" />
                        <span>{alumni.degree} ({alumni.department})</span>
                      </div>

                      {(alumni.workLocation || alumni.currentCity) && (
                        <div className="text-slate-500 text-[11px] flex items-center">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1.5 flex-shrink-0" />
                          <span>{alumni.workLocation || `${alumni.currentCity}, ${alumni.currentCountry}`}</span>
                        </div>
                      )}
                    </div>

                    {alumni.higherEducation && (
                      <div className="text-[11px] p-2.5 bg-purple-50/60 rounded-xl border border-purple-100 text-purple-900">
                        <span className="font-bold">Higher Studies:</span> {alumni.higherEducation.degree} in {alumni.higherEducation.fieldOfStudy} at {alumni.higherEducation.institution}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      {alumni.linkedinUrl && (
                        <a
                          href={alumni.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg transition"
                          title="LinkedIn Profile"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {alumni.email && (
                        <a
                          href={`mailto:${alumni.email}`}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                          title={`Email ${alumni.email}`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {alumni.networkingOptIn && (
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                          title="Open to student mentorship"
                        >
                          Mentor
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setSelectedAlumni(alumni)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 font-medium rounded-lg transition"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handleOpenEdit(alumni)}
                        className="p-1 text-slate-400 hover:text-slate-700 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="p-3.5">Alumni Details</th>
                      <th className="p-3.5">Graduation & Degree</th>
                      <th className="p-3.5">Current Role & Company</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-center">Mentor</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {alumniList.map(alumni => (
                      <tr key={alumni.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5">
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                alumni.photoUrl ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
                              }
                              alt={alumni.fullName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{alumni.fullName}</div>
                              <div className="text-[11px] text-slate-500 font-mono">{alumni.studentId} • {alumni.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800">Class of {alumni.graduationYear}</div>
                          <div className="text-slate-500 text-[11px]">{alumni.degree} ({alumni.department})</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-900">{alumni.designation || '—'}</div>
                          <div className="text-slate-500 text-[11px]">{alumni.currentCompany || '—'}</div>
                        </td>
                        <td className="p-3.5 font-medium text-slate-700">
                          {alumni.workLocation || alumni.currentCity || '—'}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              alumni.employmentStatus === 'Employed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : alumni.employmentStatus === 'Self-Employed / Founder'
                                ? 'bg-amber-50 text-amber-700'
                                : alumni.employmentStatus === 'Higher Studies'
                                ? 'bg-purple-50 text-purple-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {alumni.employmentStatus}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          {alumni.networkingOptIn ? (
                            <span className="text-emerald-600 font-bold">Yes</span>
                          ) : (
                            <span className="text-slate-400">No</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => setSelectedAlumni(alumni)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-medium rounded-lg transition"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => handleOpenEdit(alumni)}
                            className="p-1 text-slate-400 hover:text-slate-700 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CAREER & INDUSTRY INSIGHTS */}
      {activeTab === 'careers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Industry Breakdown Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 md:col-span-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Industry & Placement Sectors</span>
              </h3>

              <div className="space-y-3">
                {reports?.byIndustry.map((ind, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-800">{ind.industry}</span>
                      <span className="text-slate-500">{ind.count} Alumni</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (ind.count / (reports?.totalAlumni || 1)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Hiring Companies Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Top Recruiting Organizations</span>
              </h3>

              <div className="space-y-2">
                {reports?.topCompanies.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="font-bold text-slate-900">{c.company}</div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                      {c.count} Hires
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REPORTS & ANALYTICS */}
      {activeTab === 'reports' && reports && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Graduation Year Progression */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Graduation Batch Career Rates</span>
              </h3>

              <div className="space-y-3">
                {reports.byGraduationYear.map(item => (
                  <div key={item.year} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900">Class of {item.year}</span>
                      <span className="text-emerald-700">{item.placementRate}% Career Rate</span>
                    </div>

                    <div className="flex text-[11px] text-slate-500 space-x-4">
                      <span>Total: <strong>{item.total}</strong></span>
                      <span>Employed: <strong>{item.employed}</strong></span>
                      <span>Higher Ed: <strong>{item.higherStudies}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>Alumni Distribution by Academic Department</span>
              </h3>

              <div className="space-y-3">
                {reports.byDepartment.map(d => (
                  <div key={d.department} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800">{d.department}</span>
                      <span className="text-slate-500">{d.count} ({d.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${d.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT ALUMNI MODAL */}
      {selectedAlumni && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedAlumni(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-start space-x-4 pb-4 border-b border-slate-100">
              <img
                src={
                  selectedAlumni.photoUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
                }
                alt={selectedAlumni.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm"
              />
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900">{selectedAlumni.fullName}</h2>
                <div className="text-xs text-slate-500 font-mono">
                  {selectedAlumni.studentId} • Class of {selectedAlumni.graduationYear}
                </div>
                <div className="text-xs font-semibold text-indigo-700">
                  {selectedAlumni.degree} ({selectedAlumni.department})
                </div>
              </div>
            </div>

            {/* Detailed Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                  Career & Employment
                </div>
                <div>Status: <strong>{selectedAlumni.employmentStatus}</strong></div>
                <div>Role: <strong>{selectedAlumni.designation || 'N/A'}</strong></div>
                <div>Company: <strong>{selectedAlumni.currentCompany || 'N/A'}</strong></div>
                <div>Industry: <strong>{selectedAlumni.industry || 'N/A'}</strong></div>
                <div>Salary Band: <strong>{selectedAlumni.salaryBand || 'N/A'}</strong></div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                  Contact & Location
                </div>
                <div className="truncate">Email: <a href={`mailto:${selectedAlumni.email}`} className="text-indigo-600 underline">{selectedAlumni.email}</a></div>
                <div>Phone: <strong>{selectedAlumni.phone}</strong></div>
                <div>City: <strong>{selectedAlumni.currentCity || 'N/A'}</strong></div>
                <div>Country: <strong>{selectedAlumni.currentCountry || 'N/A'}</strong></div>
                <div>Mentorship Consent: <strong>{selectedAlumni.networkingOptIn ? 'Opted In' : 'No'}</strong></div>
              </div>
            </div>

            {/* Donation History Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                  <Heart className="w-3.5 h-3.5 text-amber-600 mr-1.5" /> Alumni Giving & Endowment History
                </h4>
                <button
                  onClick={() => setShowDonationModal(true)}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg transition border border-amber-200"
                >
                  + Record Contribution
                </button>
              </div>

              {selectedAlumni.givingHistory && selectedAlumni.givingHistory.length > 0 ? (
                <div className="space-y-2">
                  {selectedAlumni.givingHistory.map(g => (
                    <div key={g.id} className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-amber-900">{g.purpose}</div>
                        <div className="text-[11px] text-amber-700 font-mono">Date: {g.date} • Rec: {g.receiptNumber}</div>
                      </div>
                      <div className="text-sm font-bold text-amber-900">
                        {g.currency} {g.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No recorded endowment donations yet.</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                onClick={() => setSelectedAlumni(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD DONATION MODAL */}
      {showDonationModal && selectedAlumni && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Heart className="w-5 h-5 text-amber-600" />
              <span>Record Contribution for {selectedAlumni.fullName}</span>
            </h3>

            <form onSubmit={handleRecordDonation} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Contribution Amount</label>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={e => setDonationAmount(Number(e.target.value))}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Currency</label>
                <select
                  value={donationCurrency}
                  onChange={e => setDonationCurrency(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Endowment Purpose</label>
                <input
                  type="text"
                  value={donationPurpose}
                  onChange={e => setDonationPurpose(e.target.value)}
                  placeholder="e.g. Merit Scholarship Endowment Fund"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDonationModal(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
                >
                  Record Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER / EDIT ALUMNI MODAL */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddEditModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900">
              {editAlumniId ? 'Edit Alumni Profile' : 'Register New Alumni Record'}
            </h2>

            <form onSubmit={handleSaveAlumni} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName || ''}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Student Roll ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.studentId || ''}
                    onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Graduation Year *</label>
                  <input
                    type="number"
                    required
                    value={formData.graduationYear || 2024}
                    onChange={e => setFormData({ ...formData, graduationYear: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Department *</label>
                  <select
                    value={formData.department || 'Computer Science & Engineering'}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Electrical & Electronics">Electrical & Electronics</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Biotechnology & Life Sciences">Biotechnology & Life Sciences</option>
                    <option value="Department of Management Studies">Department of Management Studies</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Degree Title</label>
                  <input
                    type="text"
                    value={formData.degree || 'B.Tech CSE'}
                    onChange={e => setFormData({ ...formData, degree: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Employment Status</label>
                  <select
                    value={formData.employmentStatus || 'Employed'}
                    onChange={e => setFormData({ ...formData, employmentStatus: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Employed">Employed</option>
                    <option value="Self-Employed / Founder">Self-Employed / Founder</option>
                    <option value="Higher Studies">Higher Studies</option>
                    <option value="Seeking Opportunities">Seeking Opportunities</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={formData.currentCompany || ''}
                    onChange={e => setFormData({ ...formData, currentCompany: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Job Designation</label>
                  <input
                    type="text"
                    value={formData.designation || ''}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Work Location / City</label>
                  <input
                    type="text"
                    value={formData.workLocation || ''}
                    onChange={e => setFormData({ ...formData, workLocation: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={formData.linkedinUrl || ''}
                    onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="mentorCheck"
                  checked={formData.networkingOptIn ?? true}
                  onChange={e => setFormData({ ...formData, networkingOptIn: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="mentorCheck" className="text-xs font-medium text-slate-800">
                  Allow current students to connect with this alumni for career mentorship.
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
