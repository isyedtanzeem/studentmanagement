import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Phone, GraduationCap, Award, FileText, CheckCircle2, AlertCircle, Building2, MapPin } from 'lucide-react';
import { admissionApi } from '../../api/admissionApi';
import { CreateAdmissionInput } from '../../types/admission';

interface AdmissionApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Biotechnology & Life Sciences',
  'Department of Management Studies',
  'Civil Engineering'
];

const STATES = [
  'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal',
  'Uttar Pradesh', 'Telangana', 'Gujarat', 'Rajasthan', 'Kerala',
  'Madhya Pradesh', 'Punjab', 'Haryana', 'Bihar', 'Odisha'
];

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
    state: 'Maharashtra',
    address: '',
    department: 'Computer Science & Engineering',
    degree: 'B.Tech',
    academicTerm: '2026-2027 Session',
    classXPercentage: 90.0,
    classXIIPercentage: 88.5,
    entranceExamScore: 'JEE Main: 95.5 Percentile'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'classXPercentage' || name === 'classXIIPercentage' ? parseFloat(value) || 0 : value
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0f0f15] border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-zinc-900 via-black to-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
                  New Admission Application
                </h2>
                <p className="text-xs text-zinc-400">
                  ScholarCore Academic Intake • 2026-2027 Session
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Header */}
          <div className="grid grid-cols-3 border-b border-white/10 text-xs font-mono bg-black/40">
            <button
              onClick={() => setActiveStep(1)}
              className={`p-3 text-center border-r border-white/5 flex items-center justify-center gap-2 transition-colors ${
                activeStep === 1
                  ? 'text-[#D4AF37] bg-[#D4AF37]/10 border-b-2 border-b-[#D4AF37] font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">1</span>
              Personal Details
            </button>
            <button
              onClick={() => setActiveStep(2)}
              className={`p-3 text-center border-r border-white/5 flex items-center justify-center gap-2 transition-colors ${
                activeStep === 2
                  ? 'text-[#D4AF37] bg-[#D4AF37]/10 border-b-2 border-b-[#D4AF37] font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">2</span>
              Academic Choice
            </button>
            <button
              onClick={() => setActiveStep(3)}
              className={`p-3 text-center flex items-center justify-center gap-2 transition-colors ${
                activeStep === 3
                  ? 'text-[#D4AF37] bg-[#D4AF37]/10 border-b-2 border-b-[#D4AF37] font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">3</span>
              Documents & Submit
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: Personal Details */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Applicant Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        name="applicantName"
                        required
                        placeholder="e.g. Siddharth Mukherjee"
                        value={formData.applicantName}
                        onChange={handleChange}
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Email Address *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="e.g. siddharth.m@gmail.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Mobile Number (+91)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        name="phone"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Father's Name</label>
                    <input
                      type="text"
                      name="fatherName"
                      placeholder="e.g. Debabrata Mukherjee"
                      value={formData.fatherName}
                      onChange={handleChange}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Mother's Name</label>
                    <input
                      type="text"
                      name="motherName"
                      placeholder="e.g. Sharmila Mukherjee"
                      value={formData.motherName}
                      onChange={handleChange}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
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
                    <label className="block text-zinc-400 mb-1 font-medium">State / Region</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      {STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-zinc-400 mb-1 font-medium">Residential Address</label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Full residential street address with pincode"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
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
                    <label className="block text-zinc-400 mb-1 font-medium">Department / Discipline *</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Degree Program</label>
                    <select
                      name="degree"
                      value={formData.degree}
                      onChange={handleChange}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="B.Tech">B.Tech (Bachelor of Technology - NEP 4 Year)</option>
                      <option value="M.Tech">M.Tech (Master of Technology)</option>
                      <option value="MBA">MBA (Master of Business Administration)</option>
                      <option value="MCA">MCA (Master of Computer Applications)</option>
                      <option value="B.Sc">B.Sc (Honours Research)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Class X Board Marks (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      name="classXPercentage"
                      value={formData.classXPercentage}
                      onChange={handleChange}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Class XII Board Marks (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      name="classXIIPercentage"
                      value={formData.classXIIPercentage}
                      onChange={handleChange}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Academic Session</label>
                    <input
                      type="text"
                      name="academicTerm"
                      readOnly
                      value={formData.academicTerm}
                      className="w-full bg-black/80 border border-white/10 rounded-xl px-3 py-2 text-zinc-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">National / State Entrance Exam Score</label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="entranceExamScore"
                      placeholder="e.g. JEE Main: 98.4 Percentile or CUET Score: 720/800"
                      value={formData.entranceExamScore}
                      onChange={handleChange}
                      className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Documents Upload & Confirmation */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#D4AF37]" />
                    Mandatory Document Submission Checklist
                  </h3>

                  <div className="space-y-2 text-zinc-300">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Class 10 Board Marksheet & Certificate
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                        Self-Attested Attached
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Class 12 Senior Secondary Marksheet
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                        Self-Attested Attached
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Government Proof of Identity (Aadhaar / Voter ID)
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                        Verified
                      </span>
                    </div>

                    {formData.category !== 'General' && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          {formData.category} Caste / Reservation Certificate
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                          Attached
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl text-zinc-300 text-[11px] leading-relaxed">
                  <strong className="text-[#D4AF37] block font-mono uppercase tracking-wider mb-0.5">
                    Verification Notice
                  </strong>
                  Upon submitting this admission application, an official tracking application number (e.g. APP-2026-XXXX) will be issued. The Central Verification Cell will audit academic credentials before approving student enrollment.
                </div>
              </div>
            )}

            {/* Modal Controls */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              {activeStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev - 1) as any)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono transition-colors"
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
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl text-xs font-mono transition-colors"
                >
                  Cancel
                </button>

                {activeStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => (prev + 1) as any)}
                    className="px-5 py-2 bg-[#D4AF37] hover:bg-[#c49f27] text-black font-semibold rounded-xl text-xs font-mono transition-colors"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#D4AF37] hover:bg-[#c49f27] text-black font-semibold rounded-xl text-xs font-mono transition-colors flex items-center gap-2 disabled:opacity-50"
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
