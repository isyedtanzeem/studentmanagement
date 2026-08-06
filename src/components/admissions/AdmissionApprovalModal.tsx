import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, UserCheck, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { admissionApi } from '../../api/admissionApi';
import { AdmissionApplication } from '../../types/admission';

interface AdmissionApprovalModalProps {
  isOpen: boolean;
  application: AdmissionApplication | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdmissionApprovalModal: React.FC<AdmissionApprovalModalProps> = ({
  isOpen,
  application,
  onClose,
  onSuccess
}) => {
  const [rollNumber, setRollNumber] = useState('');
  const [approvedBy, setApprovedBy] = useState('Dr. Sunita Deshmukh (Academic Registrar)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRollNumber = async (dept: string) => {
    setIsGenerating(true);
    try {
      const res = await admissionApi.generateRollNumber(dept);
      if (res.rollNumber) {
        setRollNumber(res.rollNumber);
      }
    } catch (err) {
      console.error('Failed to auto-generate roll number', err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (application) {
      if (application.generatedStudentId) {
        setRollNumber(application.generatedStudentId);
      } else {
        fetchRollNumber(application.department);
      }
    }
  }, [application]);

  if (!isOpen || !application) return null;

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumber.trim()) {
      setError('Student Roll Number / Enrollment ID is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await admissionApi.approveAndEnroll(application.id, rollNumber, approvedBy);
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to approve application and enroll student.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0f0f15] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-black to-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  Approve Admission & Enroll Student
                </h2>
                <p className="text-xs text-zinc-400 font-mono">
                  Application #{application.applicationNumber}
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

          <form onSubmit={handleApprove} className="p-6 space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-semibold font-mono uppercase tracking-wider">
                  Applicant Profile
                </span>
                <span className="text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono">
                  Verified Eligible
                </span>
              </div>
              <p className="text-white font-bold text-sm">{application.applicantName}</p>
              <p className="text-zinc-300">
                Department: <strong className="text-white">{application.department}</strong>
              </p>
              <p className="text-zinc-400">
                Degree Program: <span className="text-white">{application.degree || 'B.Tech'}</span> • Session: <span className="text-white">{application.academicTerm}</span>
              </p>
            </div>

            {/* Generated Admission Roll Number */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-zinc-300 font-bold uppercase font-mono tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Generated Student Roll / Enrollment Number
                </label>
                <button
                  type="button"
                  onClick={() => fetchRollNumber(application.department)}
                  disabled={isGenerating}
                  className="text-[11px] text-[#D4AF37] hover:underline font-mono flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} /> Regenerate
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 2026CSE1043"
                  className="w-full bg-black border-2 border-[#D4AF37] text-[#D4AF37] font-mono font-bold text-lg rounded-xl px-4 py-2.5 tracking-widest focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                Deterministic NEP 2020 roll number format: <code className="text-zinc-200">YYYY + DeptCode + RollSequence</code>
              </p>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Approving Authority Signature</label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-zinc-300 text-[11px] leading-relaxed flex items-start gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Automatic Enrollment Confirmation:</strong> Approving this application will automatically convert <span className="text-white">{application.applicantName}</span> into an active student record with Roll No <span className="text-[#D4AF37] font-mono">{rollNumber}</span> in the Student Management Module.
              </span>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl text-xs font-mono transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !rollNumber}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs font-mono transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Approving & Enrolling...' : 'Approve & Enroll Student'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
