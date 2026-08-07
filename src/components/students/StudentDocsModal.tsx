import React, { useState, useEffect } from 'react';
import { Student, StudentDocument } from '../../types/student';
import {
  X,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Eye,
  Plus,
  ShieldCheck,
  Building2,
  Calendar,
  File,
  Upload,
  Check,
  QrCode
} from 'lucide-react';

interface StudentDocsModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStudentDocs?: (updatedDocs: StudentDocument[]) => void;
}

export const StudentDocsModal: React.FC<StudentDocsModalProps> = ({
  student,
  isOpen,
  onClose,
  onUpdateStudentDocs
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [previewDoc, setPreviewDoc] = useState<StudentDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Upload form state
  const [newDocType, setNewDocType] = useState<StudentDocument['documentType']>('Marks Cards');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newFileName, setNewFileName] = useState('');

  // Generate seed documents helper
  const getSeedDocs = (st: Student): StudentDocument[] => {
    if (st.documents && st.documents.length > 0) {
      return st.documents;
    }
    const id = st.id || 'std';
    const sId = st.studentId || 'STUDENT';
    return [
      {
        id: `doc-${id}-1`,
        documentType: 'Aadhaar',
        title: 'Aadhaar Government Identity Card',
        fileName: `Aadhaar_${sId}.pdf`,
        fileSize: '1.4 MB',
        fileType: 'application/pdf',
        uploadDate: '2024-07-15',
        verificationStatus: 'Verified',
        verifiedBy: 'Registrar Admission Cell',
        remarks: 'Aadhaar UID verified with UIDAI central database.'
      },
      {
        id: `doc-${id}-2`,
        documentType: 'Marks Cards',
        title: 'Class X Secondary Board Marksheet',
        fileName: `Class10_Marksheet_${sId}.pdf`,
        fileSize: '2.1 MB',
        fileType: 'application/pdf',
        uploadDate: '2024-07-15',
        verificationStatus: 'Verified',
        verifiedBy: 'Senior Verification Officer',
        remarks: 'Scanned original board certificate verified.'
      },
      {
        id: `doc-${id}-3`,
        documentType: 'Marks Cards',
        title: 'Class XII Senior Secondary Marksheet',
        fileName: `Class12_Marksheet_${sId}.pdf`,
        fileSize: '2.8 MB',
        fileType: 'application/pdf',
        uploadDate: '2024-07-16',
        verificationStatus: 'Verified',
        verifiedBy: 'Senior Verification Officer',
        remarks: 'PCM cut-off eligibility validated.'
      },
      {
        id: `doc-${id}-4`,
        documentType: 'Transfer Certificate',
        title: 'Institutional Transfer & Migration Certificate',
        fileName: `TC_Migration_${sId}.pdf`,
        fileSize: '1.1 MB',
        fileType: 'application/pdf',
        uploadDate: '2024-07-18',
        verificationStatus: 'Verified',
        verifiedBy: 'Registrar Cell',
        remarks: 'Original TC surrendered during counsel seat lock.'
      },
      {
        id: `doc-${id}-5`,
        documentType: 'Passport Photo',
        title: 'Official Academic Passport Photograph',
        fileName: `Photo_${sId}.jpg`,
        fileSize: '450 KB',
        fileType: 'image/jpeg',
        uploadDate: '2024-07-15',
        verificationStatus: 'Verified',
        verifiedBy: 'ID Card Processing Bureau',
        remarks: 'High resolution digital photo approved for RFID card printing.'
      }
    ];
  };

  const [docsList, setDocsList] = useState<StudentDocument[]>([]);

  useEffect(() => {
    if (student) {
      setDocsList(getSeedDocs(student));
      setSelectedCategory('ALL');
      setPreviewDoc(null);
      setIsUploading(false);
    }
  }, [student?.id, student?.studentId]);

  if (!isOpen || !student) return null;

  const filteredDocs = selectedCategory === 'ALL'
    ? docsList
    : docsList.filter(d => d.documentType === selectedCategory);

  const getStatusBadge = (status: StudentDocument['verificationStatus']) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Verified</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200">
            {status || 'Submitted'}
          </span>
        );
    }
  };

  const handleUploadNewDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle) return;

    const sId = student.studentId || 'STUDENT';
    const newDoc: StudentDocument = {
      id: `doc-${Date.now()}`,
      documentType: newDocType,
      title: newDocTitle,
      fileName: newFileName || `${newDocType.replace(/\s+/g, '_')}_${sId}.pdf`,
      fileSize: '1.5 MB',
      fileType: 'application/pdf',
      uploadDate: new Date().toISOString().slice(0, 10),
      verificationStatus: 'Pending',
      remarks: 'Uploaded by Administrator via Student Dossier.'
    };

    const updated = [newDoc, ...docsList];
    setDocsList(updated);
    if (onUpdateStudentDocs) {
      onUpdateStudentDocs(updated);
    }
    setIsUploading(false);
    setNewDocTitle('');
    setNewFileName('');
  };

  const handleDownload = (doc: StudentDocument) => {
    alert(`Downloading student document: ${doc.title} (${doc.fileName})`);
  };

  const formattedGpa = typeof student.gpa === 'number'
    ? student.gpa.toFixed(2)
    : typeof (student as any).cgpa === 'number'
    ? (student as any).cgpa.toFixed(2)
    : '8.50';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-8">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{student.fullName || (student as any).name || 'Student'}</h3>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold">
                  {student.studentId || student.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{student.department || 'Academic Department'}</span>
                <span>•</span>
                <span>CGPA: <strong className="text-blue-600">{formattedGpa}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUploading(!isUploading)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Attach Document</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upload Form Modal Expansion */}
        {isUploading && (
          <form onSubmit={handleUploadNewDoc} className="p-4 bg-indigo-50/50 border-b border-indigo-100 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-indigo-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Upload New Student Document</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsUploading(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Document Category</label>
                <select
                  value={newDocType}
                  onChange={e => setNewDocType(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                >
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="Birth Certificate">Birth Certificate</option>
                  <option value="Transfer Certificate">Transfer Certificate</option>
                  <option value="Marks Cards">Marks Cards / Transcript</option>
                  <option value="Passport Photo">Passport Photo</option>
                  <option value="Other">Other Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. 12th Standard Passing Marksheet"
                  value={newDocTitle}
                  onChange={e => setNewDocTitle(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">File Name / Ref</label>
                <input
                  type="text"
                  placeholder="e.g. Marksheet_12th_Scan.pdf"
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs cursor-pointer"
              >
                Upload & Register Document
              </button>
            </div>
          </form>
        )}

        {/* Filter Pills */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['ALL', 'Aadhaar', 'Marks Cards', 'Transfer Certificate', 'Passport Photo', 'Other'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat === 'ALL' ? 'All Documents' : cat}
              </button>
            ))}
          </div>

          <div className="text-slate-500 font-mono text-[11px]">
            Showing <strong className="text-slate-900">{filteredDocs.length}</strong> record(s)
          </div>
        </div>

        {/* Documents Table */}
        <div className="p-5 max-h-[420px] overflow-y-auto space-y-3">
          {filteredDocs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              No documents found matching selected filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredDocs.map(doc => (
                <div
                  key={doc.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg">
                          <File className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{doc.title}</h4>
                          <span className="text-[10px] font-mono text-slate-500">{doc.documentType}</span>
                        </div>
                      </div>
                      {getStatusBadge(doc.verificationStatus)}
                    </div>

                    <div className="pt-2 text-[11px] text-slate-600 space-y-1 bg-slate-50/60 rounded-lg p-2.5 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">File Name:</span>
                        <span className="font-mono text-slate-800 font-medium truncate max-w-[180px]">{doc.fileName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Upload Date:</span>
                        <span className="font-mono text-slate-800">{doc.uploadDate}</span>
                      </div>
                      {doc.verifiedBy && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Verified By:</span>
                          <span className="font-mono text-emerald-700 font-semibold">{doc.verifiedBy}</span>
                        </div>
                      )}
                      {doc.remarks && (
                        <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                          "{doc.remarks}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-lg font-semibold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => handleDownload(doc)}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg font-semibold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ScholarCore Official Registrar Document Verification Repository</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Document Preview Overlay Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Bar */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-sm">{previewDoc.title}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Doc ID: {previewDoc.id} • {student.fullName}</p>
                </div>
              </div>

              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Watermarked Graphic Preview Box */}
            <div className="p-8 bg-slate-100 flex flex-col items-center justify-center relative min-h-[320px] border-b border-slate-200">
              <div className="bg-white border-2 border-slate-300 shadow-xl rounded-xl p-6 w-full max-w-lg space-y-4 relative overflow-hidden">
                {/* Official Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                  <span className="text-6xl font-black text-slate-900 rotate-[-30deg] uppercase font-mono">
                    VERIFIED SCHOLARCORE
                  </span>
                </div>

                {/* Doc Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-sm font-black text-slate-900 tracking-wider uppercase">SCHOLARCORE INSTITUTIONAL RECORDS</h2>
                    <p className="text-[9px] text-slate-500 font-mono">Registrar & Verification Cell • Academic Year 2026</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                </div>

                {/* Student Info */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/80 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[9px]">STUDENT NAME</span>
                    <span className="font-bold text-slate-900">{student.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">ROLL / ENROLLMENT NO</span>
                    <span className="font-bold text-blue-700">{student.studentId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">DEPARTMENT</span>
                    <span className="font-bold text-slate-800">{student.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">DOCUMENT TYPE</span>
                    <span className="font-bold text-emerald-700">{previewDoc.documentType}</span>
                  </div>
                </div>

                {/* Document Status Seal */}
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-emerald-900 font-bold text-xs block">Official Digital Document Verification</span>
                    <p className="text-[10px] text-emerald-700">Verified by {previewDoc.verifiedBy || 'Registrar Office'} on {previewDoc.uploadDate}</p>
                  </div>
                  <QrCode className="w-10 h-10 text-emerald-800 p-1 bg-white rounded border border-emerald-200 flex-shrink-0" />
                </div>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="p-4 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">File: {previewDoc.fileName} ({previewDoc.fileSize})</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewDoc)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Document</span>
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
