import React, { useState } from 'react';
import { AdmissionApplication, CreateAdmissionInput, AdmissionAttachment } from '../../types/admission';
import { admissionApi } from '../../api/admissionApi';
import { DEPARTMENTS, DEPARTMENT_DEGREES, INDIAN_STATES } from '../../constants/admissionConstants';
import {
  GraduationCap,
  Phone,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  User,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Upload,
  Building2,
  Calendar,
  Award,
  ShieldCheck,
  Check,
  Sparkles,
  RefreshCw,
  Download,
  Info,
  LogOut,
  Plus,
  Trash2,
  Paperclip,
  Eye
} from 'lucide-react';

interface ApplicantPortalPageProps {
  onBackToStaffLogin: () => void;
}

const SAMPLE_PHONES = [
  { label: 'Sample Applicant 1', phone: '+91 98765 11001' },
  { label: 'Sample Applicant 2', phone: '+91 98765 22002' },
  { label: 'Sample Approved', phone: '+91 98765 33003' }
];

export const ApplicantPortalPage: React.FC<ApplicantPortalPageProps> = ({ onBackToStaffLogin }) => {
  // Navigation / Login state
  const [mobileNumber, setMobileNumber] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);

  // Form mode state
  const [isApplyingNew, setIsApplyingNew] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccessApp, setSubmitSuccessApp] = useState<AdmissionApplication | null>(null);

  // Application Form state
  const [formData, setFormData] = useState<CreateAdmissionInput>({
    applicantName: '',
    email: '',
    phone: '',
    fatherName: '',
    motherName: '',
    gender: 'Male',
    dateOfBirth: '',
    category: 'General',
    state: INDIAN_STATES[0],
    address: '',
    department: DEPARTMENTS[0],
    degree: DEPARTMENT_DEGREES[DEPARTMENTS[0]][0],
    academicTerm: '2026-2027 Session',
    classXPercentage: 88.5,
    classXIIPercentage: 89.2,
    entranceExamScore: 'JEE Main 94.5 Percentile',
    attachments: []
  });

  const [customDocTitle, setCustomDocTitle] = useState('');

  // Handle department change & auto sync degree
  const handleDepartmentChange = (newDept: string) => {
    const availableDegrees = DEPARTMENT_DEGREES[newDept] || ['B.Tech'];
    setFormData((prev) => ({
      ...prev,
      department: newDept,
      degree: availableDegrees[0]
    }));
  };

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, categoryName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      alert(`File "${file.name}" exceeds 12 MB limit. Please attach a compressed document.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = event.target?.result as string;
      const newAttachment: AdmissionAttachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: file.type || 'application/pdf',
        category: categoryName,
        fileData,
        uploadedAt: new Date().toISOString()
      };

      setFormData((prev) => {
        const existing = prev.attachments || [];
        const filtered = existing.filter((a) => a.category !== categoryName);
        return {
          ...prev,
          attachments: [...filtered, newAttachment]
        };
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddCustomAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      alert(`File "${file.name}" exceeds 12 MB limit. Please attach a compressed document.`);
      e.target.value = '';
      return;
    }

    const title = customDocTitle.trim() || 'Additional Certificate';
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = event.target?.result as string;
      const newAttachment: AdmissionAttachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: file.type || 'application/pdf',
        category: title,
        fileData,
        uploadedAt: new Date().toISOString()
      };

      setFormData((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), newAttachment]
      }));
      setCustomDocTitle('');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((a) => a.id !== id)
    }));
  };

  // Uploaded docs mock state
  const [uploadedDocs, setUploadedDocs] = useState<{
    classX: boolean;
    classXII: boolean;
    idProof: boolean;
    migration: boolean;
  }>({
    classX: true,
    classXII: true,
    idProof: true,
    migration: false
  });

  // Handle phone lookup
  const handlePhoneLookup = async (e?: React.FormEvent, phoneOverride?: string) => {
    if (e) e.preventDefault();
    const targetPhone = phoneOverride || mobileNumber;
    if (!targetPhone.trim()) {
      setError('Please enter a valid mobile number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await admissionApi.publicLookupByPhone(targetPhone);
      setApplications(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedApp(res.data[0]);
        setIsApplyingNew(false);
      } else {
        // Pre-fill phone for new application
        setFormData((prev) => ({ ...prev, phone: targetPhone }));
        setIsApplyingNew(true);
      }
      setIsSearched(true);
    } catch (err: any) {
      setError(err.message || 'Failed to lookup mobile number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewApplication = () => {
    setFormData((prev) => ({
      ...prev,
      phone: mobileNumber || prev.phone
    }));
    setIsApplyingNew(true);
    setSubmitSuccessApp(null);
    setFormStep(1);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await admissionApi.publicSubmitApplication(formData);
      setSubmitSuccessApp(res.data);
      // Also refresh applications list for this mobile
      if (formData.phone) {
        const lookupRes = await admissionApi.publicLookupByPhone(formData.phone);
        setApplications(lookupRes.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit application. Please check input details.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for status styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: CheckCircle2,
          text: 'Approved & Enrolled'
        };
      case 'Rejected':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: XCircle,
          text: 'Application Rejected'
        };
      case 'Document Verification':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          icon: ShieldCheck,
          text: 'Under Document Verification'
        };
      case 'Under Review':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: Clock,
          text: 'Under Academic Review'
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: FileText,
          text: 'Application Submitted (Pending)'
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Banner & Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">ScholarCore SIMS</h1>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-mono font-bold border border-blue-200">
                  Admissions 2026-27
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Official Student Admission & Application Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isSearched && (
              <button
                onClick={() => {
                  setIsSearched(false);
                  setApplications([]);
                  setSelectedApp(null);
                  setIsApplyingNew(false);
                  setSubmitSuccessApp(null);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Switch Mobile</span>
              </button>
            )}

            <button
              onClick={onBackToStaffLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-2xs transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Staff / Officer Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {!isSearched ? (
          /* STEP 1: Mobile Number Login / Lookup Screen */
          <div className="max-w-xl mx-auto my-8 sm:my-12">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                  <Phone className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Student Applicant Portal</h2>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Enter your registered 10-digit mobile number to apply for admission or track your live application status.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handlePhoneLookup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mobile Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-mono font-semibold text-slate-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="98765 00000"
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    No password or OTP required for standard application access.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Mobile Number...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Application</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Sample presets helper */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2 text-center">
                  Or Test With Preset Sample Applications
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {SAMPLE_PHONES.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setMobileNumber(s.phone);
                        handlePhoneLookup(undefined, s.phone);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-xs font-mono transition-all shadow-2xs"
                    >
                      {s.label} ({s.phone})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Information card */}
            <div className="mt-6 p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-blue-950">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Key Information for Applicants (Session 2026-27)</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 text-[11px]">
                <li>Admissions open for B.Tech, M.Tech, MBA, B.Sc & Diploma programs.</li>
                <li>Document verification takes approximately 24 to 48 hours after submission.</li>
                <li>Upon approval, your official Student Roll Number will be generated automatically.</li>
              </ul>
            </div>
          </div>
        ) : isApplyingNew ? (
          /* STEP 2: Submit New Application Form */
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => {
                    if (applications.length > 0) setIsApplyingNew(false);
                    else setIsSearched(false);
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 mb-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Applications</span>
                </button>
                <h2 className="text-xl font-bold text-slate-900">New Student Admission Application</h2>
                <p className="text-xs text-slate-500 font-mono">
                  Mobile Number: <span className="font-semibold text-slate-800">{formData.phone}</span>
                </p>
              </div>

              {/* Form Step Indicator */}
              <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    onClick={() => setFormStep(s as any)}
                    className={`px-3 py-1 rounded-lg cursor-pointer border transition-all ${
                      formStep === s
                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                        : formStep > s
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    Step {s}
                  </div>
                ))}
              </div>
            </div>

            {submitSuccessApp ? (
              /* Success Submission Card */
              <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center space-y-6 shadow-xs">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-300 shadow-2xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
                    Application Submitted Successfully
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Application Number: <span className="font-mono text-blue-700">{submitSuccessApp.applicationNumber}</span>
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Your admission request for <span className="font-semibold">{submitSuccessApp.department}</span> has been logged. The Central Admissions Cell will review your credentials shortly.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-lg mx-auto text-left text-xs space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Applicant Name:</span>
                    <span className="font-semibold text-slate-900">{submitSuccessApp.applicantName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mobile Phone:</span>
                    <span className="text-slate-800">{submitSuccessApp.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span className="text-slate-800">{submitSuccessApp.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Initial Status:</span>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                      {submitSuccessApp.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => {
                      setSubmitSuccessApp(null);
                      setIsApplyingNew(false);
                      if (formData.phone) handlePhoneLookup(undefined, formData.phone);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
                  >
                    Track Live Application Status
                  </button>
                </div>
              </div>
            ) : (
              /* Application Multi-step Form */
              <form onSubmit={handleSubmitApplication} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Step 1: Personal Details */}
                {formStep === 1 && (
                  <div className="space-y-4">
                    <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Step 1: Personal & Guardian Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name of Applicant <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.applicantName}
                          onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                          placeholder="e.g. Aarav Sharma"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="aarav.sharma@gmail.com"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Father's Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.fatherName}
                          onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                          placeholder="e.g. Ramesh Chandra Sharma"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Mother's Name
                        </label>
                        <input
                          type="text"
                          value={formData.motherName}
                          onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                          placeholder="e.g. Sunita Sharma"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600 focus:outline-none bg-white"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600 focus:outline-none bg-white"
                        >
                          <option value="General">General</option>
                          <option value="OBC">OBC</option>
                          <option value="SC">SC</option>
                          <option value="ST">ST</option>
                          <option value="EWS">EWS</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Domicile State / UT <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600 focus:outline-none bg-white font-medium"
                          required
                        >
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Postal Address</label>
                      <textarea
                        rows={2}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Flat No, House Street, City, Pincode"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => setFormStep(2)}
                        className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Next: Program Choice</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Program & Department Choice */}
                {formStep === 2 && (
                  <div className="space-y-4">
                    <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Step 2: Department & Program Selection
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Select Academic Department <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formData.department}
                          onChange={(e) => handleDepartmentChange(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600 focus:outline-none bg-white font-medium"
                          required
                        >
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Degree Program <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formData.degree}
                          onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600 focus:outline-none bg-white font-medium"
                        >
                          {(DEPARTMENT_DEGREES[formData.department] || ['B.Tech (Bachelor of Technology)']).map((deg) => (
                            <option key={deg} value={deg}>
                              {deg}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Session</label>
                        <input
                          type="text"
                          value={formData.academicTerm}
                          readOnly
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 font-mono font-semibold"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setFormStep(1)}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormStep(3)}
                        className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Next: Academic Record</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Academic Qualifications */}
                {formStep === 3 && (
                  <div className="space-y-4">
                    <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Step 3: Academic Marks & Entrance Exam
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Class X Percentage (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          max={100}
                          value={formData.classXPercentage || ''}
                          onChange={(e) => setFormData({ ...formData, classXPercentage: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Class XII Percentage (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          max={100}
                          value={formData.classXIIPercentage || ''}
                          onChange={(e) => setFormData({ ...formData, classXIIPercentage: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Entrance Exam Score / Rank</label>
                        <input
                          type="text"
                          value={formData.entranceExamScore || ''}
                          onChange={(e) => setFormData({ ...formData, entranceExamScore: e.target.value })}
                          placeholder="e.g. JEE Main 92.4 %ile"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setFormStep(2)}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormStep(4)}
                        className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Next: Attach Documents</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Documents Attachment & Confirmation */}
                {formStep === 4 && (
                  <div className="space-y-4">
                    <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Step 4: Document Uploads & Attachments
                      </h3>
                    </div>

                    {/* Standard Required Documents */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: 'Class X Marksheet', title: 'Class X Marksheet / Passing Certificate', req: true },
                        { key: 'Class XII Marksheet', title: 'Class XII Senior Secondary Marksheet', req: true },
                        { key: 'Identity Proof', title: 'Identity Proof (Aadhaar / Passport / Voter ID)', req: true },
                        { key: 'Transfer Certificate', title: 'Transfer / Migration Certificate', req: false }
                      ].map((doc) => {
                        const existingAtt = (formData.attachments || []).find((a) => a.category === doc.key);
                        return (
                          <div
                            key={doc.key}
                            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-slate-900 truncate">{doc.title}</h4>
                              {existingAtt ? (
                                <p className="text-[10px] text-emerald-600 font-mono truncate">
                                  ✓ {existingAtt.name} ({existingAtt.size})
                                </p>
                              ) : (
                                <p className="text-[10px] text-slate-500 font-mono">
                                  {doc.req ? 'Mandatory Verification Doc' : 'Optional / Secondary Doc'}
                                </p>
                              )}
                            </div>

                            <label className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono font-semibold cursor-pointer transition-all shrink-0 flex items-center gap-1 ${
                              existingAtt
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                            }`}>
                              <Upload className="w-3 h-3 text-blue-600" />
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, doc.key)}
                              />
                              <span>{existingAtt ? 'Re-upload' : 'Attach File'}</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>

                    {/* Custom Attachments Section */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                          <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                          Additional Document Attachments
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {(formData.attachments || []).length} Attached
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <input
                          type="text"
                          value={customDocTitle}
                          onChange={(e) => setCustomDocTitle(e.target.value)}
                          placeholder="e.g. Caste Certificate / Income Proof / Sports Certificate"
                          className="flex-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 bg-white"
                        />
                        <label className="w-full sm:w-auto px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-center gap-1 shrink-0 transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Attach File</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleAddCustomAttachment}
                          />
                        </label>
                      </div>

                      {/* Attachment List */}
                      {(formData.attachments || []).length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-200">
                          {(formData.attachments || []).map((att) => (
                            <div
                              key={att.id}
                              className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs gap-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <div className="min-w-0">
                                  <span className="font-semibold text-slate-900 block truncate">{att.category}</span>
                                  <span className="text-[10px] text-slate-500 font-mono block truncate">
                                    {att.name} ({att.size || 'Attached'})
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment(att.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                                title="Remove attachment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          required
                          className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-slate-700 leading-relaxed">
                          I hereby declare that all particulars entered above are correct to the best of my knowledge. I understand that false statements will render my application subject to cancellation.
                        </span>
                      </label>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setFormStep(3)}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        {submitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Submitting Application...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Submit Admission Application</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        ) : (
          /* STEP 3: Applicant Application Dashboard & Live Tracker */
          <div className="space-y-6">
            {/* Header & Switchers */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div>
                <span className="text-[11px] font-mono font-bold text-blue-700 uppercase tracking-wider block">
                  Registered Applicant Account
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Applications for Mobile: <span className="font-mono text-blue-800">{mobileNumber}</span>
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {applications.length} admission request{applications.length === 1 ? '' : 's'} logged in SIMS database
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartNewApplication}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply for Another Program</span>
                </button>
              </div>
            </div>

            {/* Application Tabs (if multiple apps for this mobile) */}
            {applications.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {applications.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono transition-all whitespace-nowrap border ${
                      selectedApp?.id === app.id
                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {app.applicationNumber} ({app.department})
                  </button>
                ))}
              </div>
            )}

            {selectedApp && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Live Status Tracker & Application Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Status Banner */}
                  {(() => {
                    const badge = getStatusBadge(selectedApp.status);
                    const StatusIcon = badge.icon;
                    return (
                      <div className={`border rounded-2xl p-6 shadow-xs ${badge.bg}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shrink-0 shadow-2xs">
                              <StatusIcon className="w-6 h-6 text-slate-900" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                                  Current Application Status
                                </span>
                              </div>
                              <h3 className="text-xl font-bold mt-0.5">{badge.text}</h3>
                              <p className="text-xs mt-1 leading-relaxed opacity-90">
                                {selectedApp.status === 'Approved' &&
                                  'Congratulations! Your admission has been verified and formally approved by the Academic Registrar Cell.'}
                                {selectedApp.status === 'Rejected' &&
                                  'Your application was evaluated and could not be approved for current session enrollment.'}
                                {selectedApp.status === 'Document Verification' &&
                                  'Your submitted academic documents are actively being cross-verified by the Verification Cell.'}
                                {selectedApp.status === 'Under Review' &&
                                  'Your application is currently under academic merit evaluation.'}
                                {selectedApp.status === 'Pending' &&
                                  'Your application is queued for initial officer review in the Central Admissions Cell.'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Approved Student ID Highlight */}
                        {selectedApp.status === 'Approved' && (
                          <div className="mt-4 p-4 rounded-xl bg-white border border-emerald-300 text-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                            <div>
                              <span className="text-[10px] font-mono uppercase font-bold text-emerald-800">
                                Official Generated Student Roll Number
                              </span>
                              <div className="text-2xl font-extrabold font-mono text-emerald-700 tracking-wider">
                                {selectedApp.generatedStudentId || '2026CSE1001'}
                              </div>
                            </div>
                            <div className="text-xs text-slate-600 font-mono">
                              Status: <span className="text-emerald-700 font-bold">Active Enrolled Student</span>
                            </div>
                          </div>
                        )}

                        {/* Rejection Reason Highlight */}
                        {selectedApp.status === 'Rejected' && selectedApp.rejectionReason && (
                          <div className="mt-4 p-4 rounded-xl bg-white border border-rose-300 text-rose-950 text-xs space-y-1 shadow-2xs">
                            <span className="font-bold text-rose-800 block uppercase font-mono text-[10px]">
                              Rejection Communication Remarks
                            </span>
                            <p>{selectedApp.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Status Progress Stepper */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Admission Verification Timeline</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                      {[
                        {
                          step: 1,
                          title: 'Submitted',
                          desc: 'App Logged',
                          active: true,
                          completed: true
                        },
                        {
                          step: 2,
                          title: 'Under Review',
                          desc: 'Officer Screening',
                          active: ['Under Review', 'Document Verification', 'Approved', 'Rejected'].includes(selectedApp.status),
                          completed: ['Document Verification', 'Approved'].includes(selectedApp.status)
                        },
                        {
                          step: 3,
                          title: 'Doc Verification',
                          desc: 'Checklist Verified',
                          active: ['Document Verification', 'Approved', 'Rejected'].includes(selectedApp.status),
                          completed: ['Approved'].includes(selectedApp.status)
                        },
                        {
                          step: 4,
                          title: 'Final Decision',
                          desc: selectedApp.status === 'Approved' ? 'Enrolled' : selectedApp.status === 'Rejected' ? 'Rejected' : 'Pending Approval',
                          active: ['Approved', 'Rejected'].includes(selectedApp.status),
                          completed: ['Approved'].includes(selectedApp.status)
                        }
                      ].map((st) => (
                        <div
                          key={st.step}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            st.completed
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : st.active
                              ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono font-bold">STAGE 0{st.step}</span>
                            {st.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : st.active ? (
                              <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                            ) : null}
                          </div>
                          <h4 className="text-xs font-bold">{st.title}</h4>
                          <p className="text-[10px] opacity-80 mt-0.5">{st.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Document Verification Checklist */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Officer Document Verification Checklist
                        </h3>
                      </div>
                      {selectedApp.verificationChecklist?.verifiedBy && (
                        <span className="text-[10px] font-mono text-slate-500">
                          Verified by {selectedApp.verificationChecklist.verifiedBy}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: 'Class X Marksheet', key: 'classXMarksheet' },
                        { label: 'Class XII Marksheet', key: 'classXIIMarksheet' },
                        { label: 'Identity Proof (Aadhaar/Passport)', key: 'identityProof' },
                        { label: 'Migration / Transfer Certificate', key: 'migrationCertificate' }
                      ].map((item) => {
                        const isVerified = Boolean(
                          selectedApp.verificationChecklist && (selectedApp.verificationChecklist as any)[item.key]
                        );
                        return (
                          <div
                            key={item.key}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                              isVerified
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            <span className="text-xs font-medium">{item.label}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                isVerified
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-slate-200 text-slate-700 border-slate-300'
                              }`}
                            >
                              {isVerified ? 'VERIFIED' : 'PENDING'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Application Data Details */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
                      Submitted Personal & Academic Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Applicant Full Name</span>
                        <span className="font-semibold text-slate-900">{selectedApp.applicantName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Email Address</span>
                        <span className="font-semibold text-slate-900">{selectedApp.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Father's Name</span>
                        <span className="font-semibold text-slate-900">{selectedApp.fatherName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Mother's Name</span>
                        <span className="font-semibold text-slate-900">{selectedApp.motherName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Gender & DOB</span>
                        <span className="font-semibold text-slate-900">
                          {selectedApp.gender} • {selectedApp.dateOfBirth || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Category & State</span>
                        <span className="font-semibold text-slate-900">
                          {selectedApp.category || 'General'} ({selectedApp.state || 'India'})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Class X Marks</span>
                        <span className="font-mono font-semibold text-slate-900">
                          {selectedApp.classXPercentage ? `${selectedApp.classXPercentage}%` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Class XII Marks</span>
                        <span className="font-mono font-semibold text-slate-900">
                          {selectedApp.classXIIPercentage ? `${selectedApp.classXIIPercentage}%` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 1 Col: Summary Card & Official Receipt */}
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>Application Summary</span>
                    </div>

                    <div className="space-y-3 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Application ID</span>
                        <span className="font-bold text-blue-700 text-sm">{selectedApp.applicationNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Department</span>
                        <span className="font-semibold text-slate-900">{selectedApp.department}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Degree & Term</span>
                        <span className="text-slate-800">
                          {selectedApp.degree || 'B.Tech'} ({selectedApp.academicTerm})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Applied On</span>
                        <span className="text-slate-800">
                          {new Date(selectedApp.appliedDate).toLocaleDateString([], {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <button
                        onClick={() => window.print()}
                        className="w-full py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Acknowledgment</span>
                      </button>
                    </div>
                  </div>

                  {/* Admission Cell Contact */}
                  <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                      Central Admissions Helpline
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      For document verification queries or intake updates, contact the Registrar Office.
                    </p>
                    <div className="text-xs font-mono space-y-1 text-slate-300 pt-1">
                      <div>📞 +91 1800 123 4567</div>
                      <div>✉️ admissions@scholarcore.edu.in</div>
                      <div>🏢 Building A, Administrative Block</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        ScholarCore SIMS • Public Admission Portal 2026-27 • Institutional Office of the Registrar
      </footer>
    </div>
  );
};
