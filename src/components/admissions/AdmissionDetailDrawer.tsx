import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileText,
  User,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight,
  Paperclip,
  Download
} from 'lucide-react';
import { AdmissionApplication, AdmissionStatus } from '../../types/admission';

interface AdmissionDetailDrawerProps {
  isOpen: boolean;
  application: AdmissionApplication | null;
  onClose: () => void;
  onOpenVerifyModal: () => void;
  onOpenApproveModal: () => void;
  onOpenRejectModal: () => void;
  onUpdateStatus: (newStatus: AdmissionStatus) => void;
}

export const AdmissionDetailDrawer: React.FC<AdmissionDetailDrawerProps> = ({
  isOpen,
  application,
  onClose,
  onOpenVerifyModal,
  onOpenApproveModal,
  onOpenRejectModal,
  onUpdateStatus
}) => {
  if (!isOpen || !application) return null;

  // Timeline stage calculation
  const getStageStatus = (stage: string) => {
    const statusOrder: AdmissionStatus[] = [
      'Pending',
      'Under Review',
      'Document Verification',
      'Approved'
    ];

    if (application.status === 'Rejected') {
      if (stage === 'Rejected') return 'current-rejected';
      return 'completed';
    }

    const currentIndex = statusOrder.indexOf(application.status);
    const stageIndex = statusOrder.indexOf(stage as AdmissionStatus);

    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const statusBadgeColor = {
    Pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'Under Review': 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    'Document Verification': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    Approved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    Rejected: 'bg-red-500/20 text-red-300 border-red-500/30'
  }[application.status] || 'bg-zinc-800 text-zinc-300 border-zinc-700';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-[#0b0b10] border-l border-white/10 w-full max-w-2xl h-full flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-zinc-900 via-black to-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  Admission Profile Dossier
                </h2>
                <p className="text-xs text-zinc-400 font-mono">
                  App #{application.applicationNumber}
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

          {/* Drawer Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {/* Top Identity Banner */}
            <div className="bg-black/60 border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-amber-700 p-0.5 shadow-lg">
                  <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center text-white font-bold text-lg font-mono">
                    {application.applicantName.charAt(0)}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">{application.applicantName}</h3>
                  <p className="text-zinc-400 text-xs">{application.email}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">{application.phone || 'Phone not provided'}</p>
                </div>
              </div>

              <div className="text-right flex flex-col items-start md:items-end">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border ${statusBadgeColor}`}>
                  {application.status}
                </span>
                <span className="text-zinc-500 font-mono text-[10px] mt-1">
                  Applied: {new Date(application.appliedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Application Tracking Timeline */}
            <div className="bg-black/40 border border-white/10 p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                Application Lifecycle Tracking
              </h4>

              <div className="grid grid-cols-4 gap-2 pt-2">
                {[
                  { key: 'Pending', label: '1. Submitted' },
                  { key: 'Under Review', label: '2. Review' },
                  { key: 'Document Verification', label: '3. Verify' },
                  { key: 'Approved', label: '4. Approved' }
                ].map((step) => {
                  const state = getStageStatus(step.key);
                  return (
                    <div
                      key={step.key}
                      className={`p-2.5 rounded-xl border text-center font-mono text-[10px] flex flex-col items-center gap-1 transition-all ${
                        state === 'completed'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : state === 'current'
                          ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37] font-bold shadow-lg shadow-[#D4AF37]/5'
                          : state === 'current-rejected'
                          ? 'bg-red-500/10 border-red-500 text-red-400'
                          : 'bg-white/5 border-white/5 text-zinc-600'
                      }`}
                    >
                      {state === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : state === 'current-rejected' ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : (
                        <div className={`w-3 h-3 rounded-full ${state === 'current' ? 'bg-[#D4AF37]' : 'bg-zinc-700'}`} />
                      )}
                      <span>{step.label}</span>
                    </div>
                  );
                })}
              </div>

              {application.generatedStudentId && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center justify-between font-mono">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Enrolled Roll Number:
                  </span>
                  <strong className="text-white text-sm bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/40">
                    {application.generatedStudentId}
                  </strong>
                </div>
              )}

              {application.rejectionReason && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 space-y-1">
                  <strong className="block font-mono uppercase text-[10px]">Rejection Remarks:</strong>
                  <p>{application.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Academic & Program Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/40 border border-white/10 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#D4AF37]" />
                  Academic Discipline
                </h4>
                <div className="space-y-1.5 text-zinc-300">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Department</span>
                    <strong className="text-white">{application.department}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Degree Choice</span>
                    <strong className="text-[#D4AF37]">{application.degree || 'B.Tech'}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Academic Term</span>
                    <span className="text-zinc-200">{application.academicTerm}</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 border border-white/10 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#D4AF37]" />
                  Prior Academic Performance
                </h4>
                <div className="space-y-1.5 text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Class X Board:</span>
                    <strong className="text-white font-mono">{application.classXPercentage ? `${application.classXPercentage}%` : 'N/A'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Class XII Board:</span>
                    <strong className="text-white font-mono">{application.classXIIPercentage ? `${application.classXIIPercentage}%` : 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Entrance Score</span>
                    <span className="text-[#D4AF37] font-mono">{application.entranceExamScore || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal & Parent Dossier */}
            <div className="bg-black/40 border border-white/10 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <User className="w-4 h-4 text-[#D4AF37]" />
                Personal & Family Details
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-zinc-300">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">Category</span>
                  <span className="text-white font-semibold">{application.category || 'General'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">Gender</span>
                  <span className="text-white">{application.gender}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">Date of Birth</span>
                  <span className="text-white">{application.dateOfBirth || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">Father's Name</span>
                  <span className="text-white">{application.fatherName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">Mother's Name</span>
                  <span className="text-white">{application.motherName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">State / Domicile</span>
                  <span className="text-white">{application.state || 'N/A'}</span>
                </div>
              </div>

              {application.address && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">Address</span>
                  <span className="text-zinc-300">{application.address}</span>
                </div>
              )}
            </div>

            {/* Document Verification Overview */}
            <div className="bg-black/40 border border-white/10 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  Document Verification Checklist
                </h4>
                <button
                  onClick={onOpenVerifyModal}
                  className="text-sky-400 hover:underline font-mono text-[11px]"
                >
                  Edit Checklist
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="flex items-center justify-between p-2 rounded bg-white/5">
                  <span className="text-zinc-300">Class X Marksheet</span>
                  {application.verificationChecklist?.classXMarksheet ? (
                    <span className="text-emerald-400">Verified ✓</span>
                  ) : (
                    <span className="text-zinc-500">Pending</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white/5">
                  <span className="text-zinc-300">Class XII Marksheet</span>
                  {application.verificationChecklist?.classXIIMarksheet ? (
                    <span className="text-emerald-400">Verified ✓</span>
                  ) : (
                    <span className="text-zinc-500">Pending</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white/5">
                  <span className="text-zinc-300">Identity Proof (Aadhaar)</span>
                  {application.verificationChecklist?.identityProof ? (
                    <span className="text-emerald-400">Verified ✓</span>
                  ) : (
                    <span className="text-zinc-500">Pending</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white/5">
                  <span className="text-zinc-300">Migration Certificate</span>
                  {application.verificationChecklist?.migrationCertificate ? (
                    <span className="text-emerald-400">Verified ✓</span>
                  ) : (
                    <span className="text-zinc-500">Pending</span>
                  )}
                </div>
              </div>
            </div>

            {/* Applicant Attached Files & Documents */}
            <div className="bg-black/40 border border-white/10 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-[#D4AF37]" />
                  Uploaded Attachments Dossier ({application.attachments?.length || 0})
                </h4>
              </div>

              {application.attachments && application.attachments.length > 0 ? (
                <div className="space-y-2 text-[11px] font-mono">
                  {application.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-white font-medium block truncate">{att.category}</span>
                        <span className="text-[10px] text-zinc-400 block truncate">
                          {att.name} ({att.size || 'File Attached'})
                        </span>
                      </div>

                      {att.fileData ? (
                        <a
                          href={att.fileData}
                          download={att.name}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] rounded flex items-center gap-1 shrink-0 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded">
                          Attached
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-white/5 rounded-lg text-center text-zinc-500 font-mono text-[11px]">
                  No additional attachments uploaded for this application.
                </div>
              )}
            </div>
          </div>

          {/* Drawer Quick Action Footer */}
          <div className="p-5 border-t border-white/10 bg-black/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-mono text-[11px]">Quick Status:</span>
              <select
                value={application.status}
                onChange={(e) => onUpdateStatus(e.target.value as AdmissionStatus)}
                className="bg-black border border-white/10 rounded-lg px-2 py-1 text-white text-xs font-mono focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Document Verification">Document Verification</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenRejectModal}
                className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-mono font-medium transition-colors"
              >
                Reject
              </button>

              <button
                onClick={onOpenVerifyModal}
                className="px-3.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-mono font-medium transition-colors"
              >
                Verify Docs
              </button>

              <button
                onClick={onOpenApproveModal}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs font-mono transition-colors shadow-lg shadow-emerald-500/10"
              >
                Approve & Enroll
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
