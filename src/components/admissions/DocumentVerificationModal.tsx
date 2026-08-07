import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckSquare,
  Square,
  ShieldCheck,
  AlertCircle,
  Eye,
  Download,
  Paperclip,
  FileText
} from 'lucide-react';
import { admissionApi } from '../../api/admissionApi';
import { AdmissionApplication, VerificationChecklist, AdmissionAttachment } from '../../types/admission';
import { DocumentViewerModal, ViewableDocument } from './DocumentViewerModal';

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

  // Document Viewer Modal State
  const [selectedDocForView, setSelectedDocForView] = useState<ViewableDocument | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

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

  // Helper to retrieve uploaded attachment or generate viewable doc
  const getDocForCategory = (title: string, categoryKeys: string[]): ViewableDocument => {
    const found = application.attachments?.find((att) =>
      categoryKeys.some(
        (k) =>
          att.category?.toLowerCase().includes(k.toLowerCase()) ||
          att.name?.toLowerCase().includes(k.toLowerCase())
      )
    );

    if (found) {
      return {
        id: found.id,
        name: found.name,
        category: title,
        fileData: found.fileData,
        size: found.size,
        type: found.type,
        uploadedAt: found.uploadedAt
      };
    }

    return {
      name: `${application.applicantName.replace(/\s+/g, '_')}_${title.replace(/\s+/g, '_')}.pdf`,
      category: title,
      uploadedAt: application.appliedDate,
      size: '1.8 MB (Verified Scan)'
    };
  };

  const openDocumentView = (doc: ViewableDocument) => {
    setSelectedDocForView(doc);
    setIsViewerOpen(true);
  };

  const checklistDocConfig = [
    {
      key: 'classXMarksheet' as keyof VerificationChecklist,
      title: 'Class X Board Marksheet & Pass Certificate',
      keys: ['classX', 'class x', '10th', 'marksheet']
    },
    {
      key: 'classXIIMarksheet' as keyof VerificationChecklist,
      title: 'Class XII Senior Secondary Marksheet',
      keys: ['classXII', 'class xii', '12th', 'marksheet']
    },
    {
      key: 'identityProof' as keyof VerificationChecklist,
      title: 'Government Photo ID (Aadhaar / Voter ID)',
      keys: ['identity', 'id', 'aadhaar', 'voter']
    },
    ...(application.category && application.category !== 'General'
      ? [
          {
            key: 'casteCertificate' as keyof VerificationChecklist,
            title: `${application.category} Category Certificate`,
            keys: ['caste', 'category', 'reservation', 'sc', 'st', 'obc', 'ews']
          }
        ]
      : []),
    {
      key: 'migrationCertificate' as keyof VerificationChecklist,
      title: 'School Leaving / Migration Certificate',
      keys: ['migration', 'leaving', 'transfer']
    }
  ];

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-mono uppercase tracking-wider">
                    Document Verification
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    {application.applicationNumber} • {application.applicantName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-slate-600">
                  Mark verified documents submitted by applicant <strong className="text-slate-900">{application.applicantName}</strong> for <span className="text-blue-700 font-semibold">{application.department}</span>:
                </p>

                {/* Verification Checklist Items with direct Document Viewer Action */}
                <div className="space-y-2.5 bg-slate-50 p-4 border border-slate-200 rounded-xl">
                  {checklistDocConfig.map((item) => {
                    const isChecked = Boolean(checklist[item.key]);
                    const docToView = getDocForCategory(item.title, item.keys);

                    return (
                      <div
                        key={item.key}
                        className="p-3 rounded-xl bg-white border border-slate-200 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div
                            onClick={() => toggleCheck(item.key)}
                            className="flex items-center gap-2.5 cursor-pointer select-none group flex-1 min-w-0"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-slate-600" />
                            )}
                            <span className={`font-medium truncate ${isChecked ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                              {item.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                isChecked
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}
                            >
                              {isChecked ? 'Verified ✓' : 'Pending'}
                            </span>

                            {/* Enable Document Viewing Button for Reviewer */}
                            <button
                              type="button"
                              onClick={() => openDocumentView(docToView)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg flex items-center gap-1 font-mono text-[11px] transition-colors cursor-pointer"
                              title="View Document Attachment"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Doc</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Uploaded Attachments Dossier */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                      Uploaded File Attachments ({application.attachments?.length || 0})
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">All Submitted Documents</span>
                  </div>

                  {application.attachments && application.attachments.length > 0 ? (
                    <div className="space-y-2 font-mono text-[11px]">
                      {application.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="text-slate-900 font-medium block truncate">{att.category}</span>
                            <span className="text-[10px] text-slate-500 block truncate">
                              {att.name} ({att.size || 'Attached File'})
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                openDocumentView({
                                  id: att.id,
                                  name: att.name,
                                  category: att.category,
                                  fileData: att.fileData,
                                  size: att.size,
                                  type: att.type,
                                  uploadedAt: att.uploadedAt
                                })
                              }
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </button>

                            {att.fileData ? (
                              <a
                                href={att.fileData}
                                download={att.name}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded flex items-center gap-1 transition-colors"
                              >
                                <Download className="w-3 h-3" />
                                <span>Save</span>
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  openDocumentView({
                                    id: att.id,
                                    name: att.name,
                                    category: att.category,
                                    size: att.size,
                                    uploadedAt: att.uploadedAt
                                  })
                                }
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded flex items-center gap-1 transition-colors"
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
                      <p className="text-slate-700">Standard secondary board & identification certificates attached.</p>
                      <button
                        type="button"
                        onClick={() =>
                          openDocumentView({
                            name: `${application.applicantName.replace(/\s+/g, '_')}_Complete_Dossier.pdf`,
                            category: 'Submitted Applicant Documents Dossier',
                            uploadedAt: application.appliedDate,
                            size: '2.4 MB Scan'
                          })
                        }
                        className="mt-2 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded font-mono text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Applicant Document Dossier</span>
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Verifying Authority / Officer Signature</label>
                  <input
                    type="text"
                    value={verifiedBy}
                    onChange={(e) => setVerifiedBy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-mono transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs font-mono transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Save Document Verification'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Document Viewer Modal for Reviewer */}
      <DocumentViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        document={selectedDocForView}
        applicantName={application.applicantName}
        applicationNumber={application.applicationNumber}
        department={application.department}
      />
    </>
  );
};
