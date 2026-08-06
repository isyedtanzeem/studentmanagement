import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, XCircle, AlertCircle } from 'lucide-react';
import { admissionApi } from '../../api/admissionApi';
import { AdmissionApplication } from '../../types/admission';

interface AdmissionRejectionModalProps {
  isOpen: boolean;
  application: AdmissionApplication | null;
  onClose: () => void;
  onSuccess: () => void;
}

const REASON_PRESETS = [
  'Does not fulfill minimum Class XII Board percentage criteria.',
  'Entrance exam percentile score below university cutoff threshold.',
  'Incomplete / Discrepant verification documents submitted.',
  'Seat capacity filled in requested engineering discipline.',
  'Duplicate admission application record detected.'
];

export const AdmissionRejectionModal: React.FC<AdmissionRejectionModalProps> = ({
  isOpen,
  application,
  onClose,
  onSuccess
}) => {
  const [selectedReason, setSelectedReason] = useState(REASON_PRESETS[0]);
  const [customRemarks, setCustomRemarks] = useState('');
  const [rejectedBy, setRejectedBy] = useState('Central Admissions Verification Committee');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !application) return null;

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customRemarks.trim() ? `${selectedReason} - ${customRemarks.trim()}` : selectedReason;

    setIsSubmitting(true);
    setError(null);

    try {
      await admissionApi.rejectApplication(application.id, finalReason, rejectedBy);
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to reject admission application.');
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
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-red-950/40 via-black to-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  Reject Admission Application
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

          <form onSubmit={handleReject} className="p-6 space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-white font-semibold">{application.applicantName}</p>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Department: {application.department} • Degree: {application.degree || 'B.Tech'}
              </p>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1.5 font-medium">Primary Rejection Category</label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
              >
                {REASON_PRESETS.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Additional Officer Remarks / Notes</label>
              <textarea
                rows={3}
                placeholder="Specific comments explaining rejection decision for audit logs..."
                value={customRemarks}
                onChange={(e) => setCustomRemarks(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Officer / Committee Name</label>
              <input
                type="text"
                value={rejectedBy}
                onChange={(e) => setRejectedBy(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
              />
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
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-xs font-mono transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Rejecting...' : 'Confirm Application Rejection'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
