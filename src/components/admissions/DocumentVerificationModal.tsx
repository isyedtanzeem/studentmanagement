import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckSquare, Square, ShieldCheck, AlertCircle } from 'lucide-react';
import { admissionApi } from '../../api/admissionApi';
import { AdmissionApplication, VerificationChecklist } from '../../types/admission';

interface DocumentVerificationModalProps {
  isOpen: boolean;
  application: AdmissionApplication | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DocumentVerificationModal: React.FC<DocumentVerificationModalProps> = ({
  isOpen,
  application,
  onClose,
  onSuccess
}) => {
  const [checklist, setChecklist] = useState<VerificationChecklist>({
    classXMarksheet: true,
    classXIIMarksheet: true,
    identityProof: true,
    casteCertificate: false,
    migrationCertificate: false
  });

  const [verifiedBy, setVerifiedBy] = useState('Central Admissions Cell');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (application?.verificationChecklist) {
      setChecklist({
        classXMarksheet: application.verificationChecklist.classXMarksheet ?? true,
        classXIIMarksheet: application.verificationChecklist.classXIIMarksheet ?? true,
        identityProof: application.verificationChecklist.identityProof ?? true,
        casteCertificate: application.verificationChecklist.casteCertificate ?? false,
        migrationCertificate: application.verificationChecklist.migrationCertificate ?? false
      });
      if (application.verificationChecklist.verifiedBy) {
        setVerifiedBy(application.verificationChecklist.verifiedBy);
      }
    }
  }, [application]);

  if (!isOpen || !application) return null;

  const toggleCheck = (key: keyof VerificationChecklist) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await admissionApi.verifyDocuments(application.id, checklist, verifiedBy);
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to update document verification checklist.');
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
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-zinc-900 via-black to-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  Document Verification
                </h2>
                <p className="text-xs text-zinc-400 font-mono">
                  {application.applicationNumber} • {application.applicantName}
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

          <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-zinc-400">
                Mark verified documents submitted by applicant <strong className="text-white">{application.applicantName}</strong> for <span className="text-[#D4AF37]">{application.department}</span>:
              </p>

              {/* Checklist Items */}
              <div className="space-y-2 bg-black/60 p-4 border border-white/10 rounded-xl">
                <div
                  onClick={() => toggleCheck('classXMarksheet')}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <span className="text-white font-medium">Class X Board Marksheet & Pass Certificate</span>
                  {checklist.classXMarksheet ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                      <CheckSquare className="w-4 h-4" /> Verified
                    </span>
                  ) : (
                    <span className="text-zinc-500 flex items-center gap-1 font-mono text-[11px]">
                      <Square className="w-4 h-4" /> Pending
                    </span>
                  )}
                </div>

                <div
                  onClick={() => toggleCheck('classXIIMarksheet')}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <span className="text-white font-medium">Class XII Senior Secondary Marksheet</span>
                  {checklist.classXIIMarksheet ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                      <CheckSquare className="w-4 h-4" /> Verified
                    </span>
                  ) : (
                    <span className="text-zinc-500 flex items-center gap-1 font-mono text-[11px]">
                      <Square className="w-4 h-4" /> Pending
                    </span>
                  )}
                </div>

                <div
                  onClick={() => toggleCheck('identityProof')}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <span className="text-white font-medium">Government Photo ID (Aadhaar / Voter ID)</span>
                  {checklist.identityProof ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                      <CheckSquare className="w-4 h-4" /> Verified
                    </span>
                  ) : (
                    <span className="text-zinc-500 flex items-center gap-1 font-mono text-[11px]">
                      <Square className="w-4 h-4" /> Pending
                    </span>
                  )}
                </div>

                {application.category && application.category !== 'General' && (
                  <div
                    onClick={() => toggleCheck('casteCertificate')}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <span className="text-white font-medium">{application.category} Reservation / Category Certificate</span>
                    {checklist.casteCertificate ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                        <CheckSquare className="w-4 h-4" /> Verified
                      </span>
                    ) : (
                      <span className="text-zinc-500 flex items-center gap-1 font-mono text-[11px]">
                        <Square className="w-4 h-4" /> Pending
                      </span>
                    )}
                  </div>
                )}

                <div
                  onClick={() => toggleCheck('migrationCertificate')}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <span className="text-white font-medium">School Leaving / Migration Certificate</span>
                  {checklist.migrationCertificate ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                      <CheckSquare className="w-4 h-4" /> Verified
                    </span>
                  ) : (
                    <span className="text-zinc-500 flex items-center gap-1 font-mono text-[11px]">
                      <Square className="w-4 h-4" /> Pending
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Verifying Authority / Officer Signature</label>
                <input
                  type="text"
                  value={verifiedBy}
                  onChange={(e) => setVerifiedBy(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
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
                disabled={isSubmitting}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-black font-semibold rounded-xl text-xs font-mono transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Document Verification'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
