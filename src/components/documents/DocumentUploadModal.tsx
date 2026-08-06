import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  UploadCloud,
  FileText,
  FileCheck,
  User,
  Shield,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  File,
  Sparkles
} from 'lucide-react';
import { DocumentRecord, DocumentType, VerificationStatus } from '../../types/document';
import { documentApi } from '../../api/documentApi';
import { studentApi } from '../../api/studentApi';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  documentToEdit?: DocumentRecord | null;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  documentToEdit
}) => {
  const [students, setStudents] = useState<Array<{ id: string; rollNumber: string; firstName: string; lastName: string }>>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [studentId, setStudentId] = useState('');
  const [studentRollNo, setStudentRollNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('Aadhaar');
  const [title, setTitle] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('application/pdf');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [fileUrl, setFileUrl] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('Pending Verification');
  const [remarks, setRemarks] = useState('');

  const [isDragOver, setIsDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
      if (documentToEdit) {
        setStudentId(documentToEdit.studentId);
        setStudentRollNo(documentToEdit.studentRollNo);
        setStudentName(documentToEdit.studentName);
        setDocumentType(documentToEdit.documentType);
        setTitle(documentToEdit.title);
        setFileName(documentToEdit.fileName);
        setFileType(documentToEdit.fileType);
        setFileSize(documentToEdit.fileSize);
        setFileUrl(documentToEdit.fileUrl);
        setVerificationStatus(documentToEdit.verificationStatus);
        setRemarks(documentToEdit.remarks || '');
      } else {
        resetForm();
      }
    }
  }, [isOpen, documentToEdit]);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const res = await studentApi.getStudents({ limit: 50 });
      if (res && res.data) {
        setStudents(res.data);
      }
    } catch {
      // Fallback default student list if any issue
      setStudents([
        { id: 'std-1', rollNumber: '2023CSE014', firstName: 'Aarav', lastName: 'Sharma' },
        { id: 'std-2', rollNumber: '2023ECE028', firstName: 'Ananya', lastName: 'Iyer' },
        { id: 'std-3', rollNumber: '2022ME009', firstName: 'Rohan', lastName: 'Verma' }
      ]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const resetForm = () => {
    setStudentId('std-1');
    setStudentRollNo('2023CSE014');
    setStudentName('Aarav Sharma');
    setDocumentType('Aadhaar');
    setTitle('');
    setFileName('');
    setFileType('application/pdf');
    setFileSize('1.2 MB');
    setFileUrl('');
    setVerificationStatus('Pending Verification');
    setRemarks('');
    setError(null);
  };

  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setStudentId(selectedId);
    const found = students.find(s => s.id === selectedId);
    if (found) {
      setStudentRollNo(found.rollNumber);
      setStudentName(`${found.firstName} ${found.lastName}`);
    }
  };

  const handleDocumentTypeChange = (type: DocumentType) => {
    setDocumentType(type);
    if (!title || title.includes('Card') || title.includes('Certificate') || title.includes('Photo')) {
      if (type === 'Aadhaar') setTitle(`Aadhaar Card - ${studentName || 'Student'}`);
      else if (type === 'Birth Certificate') setTitle(`Municipal Birth Certificate - ${studentName || 'Student'}`);
      else if (type === 'Transfer Certificate') setTitle(`College Transfer Certificate (TC) - ${studentName || 'Student'}`);
      else if (type === 'Marks Cards') setTitle(`Consolidated Statement of Marks Sheet`);
      else if (type === 'Passport Photo') setTitle(`Official Passport Size Photograph`);
      else setTitle(`Supporting Document Record`);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setFileName(file.name);
    setFileType(file.type || 'application/pdf');

    // Size formatting
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const sizeInKB = (file.size / 1024).toFixed(0);
    setFileSize(file.size > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`);

    // Create File Data Reader for local preview
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setFileUrl(reader.result as string);
      }
    };
    reader.readAsDataURL(file);

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!studentName.trim() || !studentRollNo.trim()) {
      setError('Please specify student roll number and full name.');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a document title or description.');
      return;
    }

    try {
      setSubmitting(true);

      const payload: Partial<DocumentRecord> = {
        studentId: studentId || 'std-1',
        studentRollNo,
        studentName,
        documentType,
        title,
        fileName: fileName || `${documentType.replace(/\s+/g, '_')}_${studentRollNo}.pdf`,
        fileType,
        fileSize,
        fileUrl: fileUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
        verificationStatus,
        remarks
      };

      if (documentToEdit) {
        await documentApi.updateDocument(documentToEdit.id, payload);
      } else {
        await documentApi.createDocument(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save document record.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 text-indigo-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {documentToEdit ? 'Update Document Record' : 'Upload Student Document'}
              </h2>
              <p className="text-xs text-slate-400">
                Official document repository (Aadhaar, Birth Cert, TC, Marks Cards, Photo)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-slate-700">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Document Type Tabs */}
          <div>
            <label className="block font-bold text-slate-900 mb-2">Select Document Type *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { type: 'Aadhaar' as DocumentType, label: 'Aadhaar Card', icon: Shield },
                { type: 'Birth Certificate' as DocumentType, label: 'Birth Certificate', icon: FileText },
                { type: 'Transfer Certificate' as DocumentType, label: 'Transfer Cert (TC)', icon: FileCheck },
                { type: 'Marks Cards' as DocumentType, label: 'Marks Cards', icon: File },
                { type: 'Passport Photo' as DocumentType, label: 'Passport Photo', icon: ImageIcon },
                { type: 'Other' as DocumentType, label: 'Other Document', icon: Sparkles }
              ].map(item => {
                const IconComp = item.icon;
                const isSelected = documentType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleDocumentTypeChange(item.type)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="line-clamp-1">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Student Mapping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Select Enrolled Student</label>
              <select
                value={studentId}
                onChange={handleStudentSelect}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.rollNumber} - {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Student Name & Roll No *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={studentRollNo}
                  onChange={e => setStudentRollNo(e.target.value)}
                  placeholder="Roll No"
                  className="w-1/3 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                />
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="Student Full Name"
                  className="w-2/3 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Document Title */}
          <div>
            <label className="block font-bold text-slate-900 mb-1">Document Title / Description *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Aadhaar Card - Front & Back Scan, Consolidated 10th Class SSLC Marksheet"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Section 4: File Drag & Drop Dropzone */}
          <div>
            <label className="block font-bold text-slate-900 mb-1">Attach File (PDF, PNG, JPG, JPEG)</label>
            <div
              onDragOver={e => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-indigo-500 bg-indigo-50/60 scale-[1.01]'
                  : fileName
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />

              {fileName ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900 line-clamp-1">{fileName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {fileType} • {fileSize}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto" />
                  <p className="font-bold text-slate-800">
                    Drag and drop file here, or <span className="text-indigo-600 underline">browse files</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Supports high-resolution PDF scans, PNG, and JPG images up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Verification & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Verification Status</label>
              <select
                value={verificationStatus}
                onChange={e => setVerificationStatus(e.target.value as VerificationStatus)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                <option value="Pending Verification">Pending Verification</option>
                <option value="Verified">Verified</option>
                <option value="Re-upload Requested">Re-upload Requested</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Remarks / Office Notes</label>
              <input
                type="text"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="e.g. Digilocker verified, original verified by registrar"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              {submitting ? 'Saving Document...' : documentToEdit ? 'Save Changes' : 'Upload Document'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
