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
  Download,
  Eye
} from 'lucide-react';
import { AdmissionApplication, AdmissionStatus } from '../../types/admission';
import { DocumentViewerModal, ViewableDocument } from './DocumentViewerModal';

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
  const [selectedDocForView, setSelectedDocForView] = React.useState<ViewableDocument | null>(null);
  const [isViewerOpen, setIsViewerOpen] = React.useState(false);

  if (!isOpen || !application) return null;

  const openDocumentView = (docName: string, category: string, fileData?: string, size?: string) => {
    setSelectedDocForView({
      name: docName,
      category,
      fileData,
      size: size || '1.8 MB (Verified Scan)',
      uploadedAt: application.appliedDate
    });
    setIsViewerOpen(true);
  };

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
    Pending: 'bg-amber-50 text-amber-800 border-amber-200',
    'Under Review': 'bg-blue-50 text-blue-800 border-blue-200',
    'Document Verification': 'bg-purple-50 text-purple-800 border-purple-200',
    Approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Rejected: 'bg-red-50 text-red-800 border-red-200'
  }[application.status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-white border-l border-slate-200 w-full max-w-2xl h-full flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-mono uppercase tracking-wider">
                  Admission Profile Dossier
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  App #{application.applicationNumber}
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

          {/* Drawer Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {/* Top Identity Banner */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shadow-md">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-blue-700 font-bold text-lg font-mono">
                    {application.applicantName.charAt(0)}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-mono">{application.applicantName}</h3>
                  <p className="text-slate-600 text-xs">{application.email}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{application.phone || 'Phone not provided'}</p>
                </div>
              </div>

              <div className="text-right flex flex-col items-start md:items-end">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border ${statusBadgeColor}`}>
                  {application.status}
                </span>
                <span className="text-slate-500 font-mono text-[10px] mt-1">
                  Applied: {new Date(application.appliedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Application Tracking Timeline */}
            <div className="bg-slate-50/80 border border-slate-200 p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
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
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium'
                          : state === 'current'
                          ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold shadow-xs'
                          : state === 'current-rejected'
                          ? 'bg-red-50 border-red-300 text-red-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      {state === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : state === 'current-rejected' ? (
                        <XCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <div className={`w-3 h-3 rounded-full ${state === 'current' ? 'bg-blue-600' : 'bg-slate-300'}`} />
                      )}
                      <span>{step.label}</span>
                    </div>
                  );
                })}
              </div>

              {application.generatedStudentId && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center justify-between font-mono">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Enrolled Roll Number:
                  </span>
                  <strong className="text-slate-900 text-sm bg-white px-2.5 py-1 rounded border border-emerald-300">
                    {application.generatedStudentId}
                  </strong>
                </div>
              )}

              {application.rejectionReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 space-y-1">
                  <strong className="block font-mono uppercase text-[10px] text-red-900">Rejection Remarks:</strong>
                  <p>{application.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Academic & Program Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Academic Discipline
                </h4>
                <div className="space-y-1.5 text-slate-700">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Department</span>
                    <strong className="text-slate-900">{application.department}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Degree Choice</span>
                    <strong className="text-blue-700">{application.degree || 'B.Tech'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Academic Term</span>
                    <span className="text-slate-800">{application.academicTerm}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  Prior Academic Performance
                </h4>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Class X Board:</span>
                    <strong className="text-slate-900 font-mono">{application.classXPercentage ? `${application.classXPercentage}%` : 'N/A'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Class XII Board:</span>
                    <strong className="text-slate-900 font-mono">{application.classXIIPercentage ? `${application.classXIIPercentage}%` : 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Entrance Score</span>
                    <span className="text-blue-700 font-mono font-bold">{application.entranceExamScore || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal & Parent Dossier */}
            <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Personal & Family Details
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-slate-700">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Category</span>
                  <span className="text-slate-900 font-semibold">{application.category || 'General'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Gender</span>
                  <span className="text-slate-900">{application.gender}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Date of Birth</span>
                  <span className="text-slate-900">{application.dateOfBirth || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Father's Name</span>
                  <span className="text-slate-900">{application.fatherName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Mother's Name</span>
                  <span className="text-slate-900">{application.motherName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">State / Domicile</span>
                  <span className="text-slate-900">{application.state || 'N/A'}</span>
                </div>
              </div>

              {application.address && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Address</span>
                  <span className="text-slate-700">{application.address}</span>
                </div>
              )}
            </div>

            {/* Document Verification Overview */}
            <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Document Verification Checklist
                </h4>
                <button
                  onClick={onOpenVerifyModal}
                  className="text-blue-600 hover:underline font-mono text-[11px] cursor-pointer"
                >
                  Edit Checklist
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                  <span className="text-slate-700">Class X Marksheet</span>
                  <div className="flex items-center gap-2">
                    {application.verificationChecklist?.classXMarksheet ? (
                      <span className="text-emerald-600 font-semibold">Verified ✓</span>
                    ) : (
                      <span className="text-slate-400">Pending</span>
                    )}
                    <button
                      type="button"
                      onClick={() => openDocumentView(`${application.applicantName}_ClassX_Marksheet.pdf`, 'Class X Marksheet')}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="View Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                  <span className="text-slate-700">Class XII Marksheet</span>
                  <div className="flex items-center gap-2">
                    {application.verificationChecklist?.classXIIMarksheet ? (
                      <span className="text-emerald-600 font-semibold">Verified ✓</span>
                    ) : (
                      <span className="text-slate-400">Pending</span>
                    )}
                    <button
                      type="button"
                      onClick={() => openDocumentView(`${application.applicantName}_ClassXII_Marksheet.pdf`, 'Class XII Marksheet')}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="View Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                  <span className="text-slate-700">Identity Proof (Aadhaar)</span>
                  <div className="flex items-center gap-2">
                    {application.verificationChecklist?.identityProof ? (
                      <span className="text-emerald-600 font-semibold">Verified ✓</span>
                    ) : (
                      <span className="text-slate-400">Pending</span>
                    )}
                    <button
                      type="button"
                      onClick={() => openDocumentView(`${application.applicantName}_Government_ID.pdf`, 'Government Identity Proof')}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="View Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                  <span className="text-slate-700">Migration Certificate</span>
                  <div className="flex items-center gap-2">
                    {application.verificationChecklist?.migrationCertificate ? (
                      <span className="text-emerald-600 font-semibold">Verified ✓</span>
                    ) : (
                      <span className="text-slate-400">Pending</span>
                    )}
                    <button
                      type="button"
                      onClick={() => openDocumentView(`${application.applicantName}_Migration_Certificate.pdf`, 'Migration Certificate')}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="View Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Applicant Attached Files & Documents */}
            <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-blue-600" />
                  Uploaded Attachments Dossier ({application.attachments?.length || 0})
                </h4>
              </div>

              {application.attachments && application.attachments.length > 0 ? (
                <div className="space-y-2 text-[11px] font-mono">
                  {application.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-slate-900 font-medium block truncate">{att.category}</span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {att.name} ({att.size || 'File Attached'})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => openDocumentView(att.name, att.category, att.fileData, att.size)}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>

                        {att.fileData ? (
                          <a
                            href={att.fileData}
                            download={att.name}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded flex items-center gap-1 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openDocumentView(att.name, att.category, undefined, att.size)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-center text-slate-500 font-mono text-[11px] space-y-1">
                  <p>No additional custom attachments uploaded for this application.</p>
                  <button
                    type="button"
                    onClick={() => openDocumentView(`${application.applicantName}_Secondary_Certificates.pdf`, 'Applicant Verification Dossier')}
                    className="mt-1 text-blue-600 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" /> View Submitted Academic Certificates
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Drawer Quick Action Footer */}
          <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-mono text-[11px]">Quick Status:</span>
              <select
                value={application.status}
                onChange={(e) => onUpdateStatus(e.target.value as AdmissionStatus)}
                className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-mono font-medium transition-colors"
              >
                Reject
              </button>

              <button
                onClick={onOpenVerifyModal}
                className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-mono font-medium transition-colors"
              >
                Verify Docs
              </button>

              <button
                onClick={onOpenApproveModal}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs font-mono transition-colors shadow-xs"
              >
                Approve & Enroll
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <DocumentViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        document={selectedDocForView}
        applicantName={application.applicantName}
        applicationNumber={application.applicationNumber}
        department={application.department}
      />
    </AnimatePresence>
  );
};
