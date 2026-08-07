import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Phone, GraduationCap, Award, FileText, CheckCircle2, AlertCircle, Building2, MapPin, Upload, Plus, Trash2, Paperclip } from 'lucide-react';
import { admissionApi } from '../../api/admissionApi';
import { CreateAdmissionInput, AdmissionAttachment } from '../../types/admission';
import { DEPARTMENTS, DEPARTMENT_DEGREES, INDIAN_STATES } from '../../constants/admissionConstants';

interface AdmissionApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdmissionApplicationModal: React.FC<AdmissionApplicationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateAdmissionInput>({
    applicantName: '',
    email: '',
    phone: '',
    fatherName: '',
    motherName: '',
    gender: 'Male',
    dateOfBirth: '2005-06-15',
    category: 'General',
    state: INDIAN_STATES[0],
    address: '',
    department: DEPARTMENTS[0],
    degree: DEPARTMENT_DEGREES[DEPARTMENTS[0]][0],
    academicTerm: '2026-2027 Session',
    classXPercentage: 90.0,
    classXIIPercentage: 88.5,
    entranceExamScore: 'JEE Main: 95.5 Percentile',
    attachments: []
  });

  const [customDocTitle, setCustomDocTitle] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'department') {
      const availableDegrees = DEPARTMENT_DEGREES[value] || ['B.Tech'];
      setFormData((prev) => ({
        ...prev,
        department: value,
        degree: availableDegrees[0]
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'classXPercentage' || name === 'classXIIPercentage' ? parseFloat(value) || 0 : value
      }));
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.applicantName.trim() || !formData.email.trim()) {
      setError('Please provide applicant full name and email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await admissionApi.createApplication(formData);
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to submit admission application.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-mono uppercase tracking-wider">
                  New Admission Application
                </h2>
                <p className="text-xs text-slate-500">
                  ScholarCore Academic Intake • 2026-2027 Session
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Header */}
          <div className="grid grid-cols-3 border-b border-slate-200 text-xs font-mono bg-slate-50/50">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`p-3 text-center border-r border-slate-200 flex items-center justify-center gap-2 transition-colors ${
                activeStep === 1
                  ? 'text-blue-700 bg-blue-50/80 border-b-2 border-b-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                activeStep === 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>1</span>
              Personal Details
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`p-3 text-center border-r border-slate-200 flex items-center justify-center gap-2 transition-colors ${
                activeStep === 2
                  ? 'text-blue-700 bg-blue-50/80 border-b-2 border-b-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                activeStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>2</span>
              Academic Choice
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`p-3 text-center flex items-center justify-center gap-2 transition-colors ${
                activeStep === 3
                  ? 'text-blue-700 bg-blue-50/80 border-b-2 border-b-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                activeStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>3</span>
              Documents & Submit
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: Personal Details */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 mb-1 font-medium">Applicant Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        name="applicantName"
                        required
                        placeholder="e.g. Siddharth Mukherjee"
                        value={formData.applicantName}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-medium">Email Address *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="e.g. siddharth.m@gmail.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 mb-1 font-medium">Mobile Number (+91)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        name="phone"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-medium">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-medium">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 mb-1 font-medium">Father's Name</label>
                    <input
                      type="text"
                      name="fatherName"
                      placeholder="e.g. Debabrata Mukherjee"
                      value={formData.fatherName}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-medium">Mother's Name</label>
                    <input
                      type="text"
                      name="motherName"
                      placeholder="e.g. Sharmila Mukherjee"
                      value={formData.motherName}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-medium">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC (Non-Creamy)</option>
                      <option value="SC">Scheduled Caste (SC)</option>
                      <option value="ST">Scheduled Tribe (ST)</option>
                      <option value="EWS">Economically Weaker Section (EWS)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 mb-1 font-medium">State / Region (Domicile)</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-700 mb-1 font-medium">Residential Address</label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Full residential street address with pincode"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Academic Choice */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 mb-1 font-medium">Department / Discipline *</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-medium">Degree Program *</label>
                    <select
                      name="degree"
                      value={formData.degree}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    >
                      {(DEPARTMENT_DEGREES[formData.department] || ['B.Tech (Bachelor of Technology)']).map((deg) => (
                        <option key={deg} value={deg}>{deg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 mb-1 font-medium">Class X Board Marks (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      name="classXPercentage"
                      value={formData.classXPercentage}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-medium">Class XII Board Marks (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      name="classXIIPercentage"
                      value={formData.classXIIPercentage}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-medium">Academic Session</label>
                    <input
                      type="text"
                      name="academicTerm"
                      readOnly
                      value={formData.academicTerm}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-medium">National / State Entrance Exam Score</label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="entranceExamScore"
                      placeholder="e.g. JEE Main: 98.4 Percentile or CUET Score: 720/800"
                      value={formData.entranceExamScore}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Documents Upload & Confirmation */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Document Submission & Attachments
                  </h3>

                  {/* Standard Document Rows with Upload inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700 text-xs">
                    {[
                      { key: 'Class X Marksheet', label: 'Class X Marksheet' },
                      { key: 'Class XII Marksheet', label: 'Class XII Marksheet' },
                      { key: 'Identity Proof', label: 'Identity Proof (Aadhaar/Voter ID)' },
                      { key: 'Migration Certificate', label: 'Migration / Transfer Certificate' }
                    ].map((doc) => {
                      const existingAtt = (formData.attachments || []).find((a) => a.category === doc.key);
                      return (
                        <div key={doc.key} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                          <div className="min-w-0 pr-2">
                            <span className="block font-medium text-slate-900 truncate">{doc.label}</span>
                            {existingAtt ? (
                              <span className="text-[10px] text-emerald-600 font-mono truncate block font-semibold">
                                ✓ {existingAtt.name} ({existingAtt.size})
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono block">Not Attached</span>
                            )}
                          </div>
                          <label className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-mono text-slate-700 cursor-pointer transition-colors shrink-0 flex items-center gap-1 border border-slate-300">
                            <Upload className="w-3 h-3 text-blue-600" />
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, doc.key)}
                            />
                            <span>{existingAtt ? 'Change' : 'Attach'}</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom Document Attachment Input */}
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-blue-700 uppercase flex items-center gap-1">
                        <Paperclip className="w-3.5 h-3.5" /> Add Custom Attachment
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {(formData.attachments || []).length} Attached
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customDocTitle}
                        onChange={(e) => setCustomDocTitle(e.target.value)}
                        placeholder="e.g. Caste / Income / Sports Certificate"
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs font-mono cursor-pointer transition-colors flex items-center gap-1 shrink-0 shadow-xs">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleAddCustomAttachment}
                        />
                      </label>
                    </div>

                    {/* Display Attached Files List */}
                    {(formData.attachments || []).length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        {(formData.attachments || []).map((att) => (
                          <div
                            key={att.id}
                            className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between text-xs font-mono"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="text-slate-900 font-medium block truncate">{att.category}</span>
                              <span className="text-[10px] text-slate-500 block truncate">{att.name} ({att.size || 'Attached'})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(att.id)}
                              className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                              title="Remove attachment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] leading-relaxed">
                  <strong className="text-blue-800 block font-mono uppercase tracking-wider mb-0.5">
                    Verification Notice
                  </strong>
                  Upon submitting this admission application, an official tracking application number (e.g. APP-2026-XXXX) will be issued. The Central Verification Cell will audit academic credentials before approving student enrollment.
                </div>
              </div>
            )}

            {/* Modal Controls */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              {activeStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev - 1) as any)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-mono transition-colors"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-mono transition-colors"
                >
                  Cancel
                </button>

                {activeStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => (prev + 1) as any)}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs font-mono transition-colors shadow-xs"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs font-mono transition-colors flex items-center gap-2 disabled:opacity-50 shadow-xs"
                  >
                    {isSubmitting ? 'Submitting Application...' : 'Submit Admission Application'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
