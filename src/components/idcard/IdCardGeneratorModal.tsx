import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, User, Calendar, Phone, Heart, Image as ImageIcon, Layout, CheckCircle2, ShieldCheck } from 'lucide-react';
import { IdCardRecord, CollegeBrandingConfig, IdCardLayout, GenerateCardPayload } from '../../types/idCard';
import { idCardApi } from '../../api/idCardApi';
import { IdCardRenderer } from './IdCardRenderer';

interface StudentOption {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  department: string;
  enrollmentYear: number;
  phone?: string;
  photoUrl?: string;
  guardianPhone?: string;
}

interface IdCardGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branding: CollegeBrandingConfig;
  cardToEdit?: IdCardRecord | null;
}

export const IdCardGeneratorModal: React.FC<IdCardGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  branding,
  cardToEdit
}) => {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);

  // Form Fields
  const [layoutTemplate, setLayoutTemplate] = useState<IdCardLayout>('compact-badge');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [validUntil, setValidUntil] = useState('30 JUN 2028');
  const [photoUrl, setPhotoUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen]);

  useEffect(() => {
    if (cardToEdit) {
      setSelectedStudentId(cardToEdit.studentDbId);
      setLayoutTemplate(cardToEdit.layoutTemplate || 'compact-badge');
      setBloodGroup(cardToEdit.bloodGroup || 'O+');
      setEmergencyPhone(cardToEdit.emergencyPhone || '');
      setValidUntil(cardToEdit.validUntil || '30 JUN 2028');
      setPhotoUrl(cardToEdit.photoUrl || '');
    } else if (selectedStudent) {
      setEmergencyPhone(selectedStudent.guardianPhone || selectedStudent.phone || '+91 98765 43210');
      setPhotoUrl(selectedStudent.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedStudent.fullName)}`);
      setValidUntil(`30 JUN ${selectedStudent.enrollmentYear + 4}`);
    }
  }, [cardToEdit, selectedStudent]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/students?limit=100', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sims_access_token') || ''}`
        }
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setStudents(json.data);
        if (!cardToEdit && json.data.length > 0) {
          setSelectedStudentId(json.data[0].id);
          setSelectedStudent(json.data[0]);
        }
      }
    } catch (err) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    const stu = students.find(s => s.id === id) || null;
    setSelectedStudent(stu);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setError('Please upload a PNG or JPEG image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId && !cardToEdit) {
      setError('Please select a student.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (cardToEdit) {
        await idCardApi.updateCard(cardToEdit.id, {
          layoutTemplate,
          bloodGroup,
          emergencyPhone,
          validUntil,
          photoUrl
        });
      } else {
        const payload: GenerateCardPayload = {
          studentDbId: selectedStudentId,
          layoutTemplate,
          bloodGroup,
          emergencyPhone,
          validUntil,
          photoUrl
        };
        await idCardApi.generateCard(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to issue student ID card.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // Mock preview card object for live rendering
  const currentStudentName = selectedStudent ? selectedStudent.fullName : cardToEdit ? cardToEdit.studentName : 'John Doe';
  const currentStudentRoll = selectedStudent ? selectedStudent.studentId : cardToEdit ? cardToEdit.studentRollNo : 'STU-2025-101';
  const currentDepartment = selectedStudent ? selectedStudent.department : cardToEdit ? cardToEdit.department : 'Computer Science';
  const currentEnrollment = selectedStudent ? selectedStudent.enrollmentYear : cardToEdit ? cardToEdit.enrollmentYear : 2025;

  const mockPreviewCard: IdCardRecord = {
    id: 'preview-id',
    cardNumber: cardToEdit ? cardToEdit.cardNumber : `IDC-${currentEnrollment}-8841`,
    studentDbId: selectedStudentId,
    studentRollNo: currentStudentRoll,
    studentName: currentStudentName,
    department: currentDepartment,
    enrollmentYear: currentEnrollment,
    validUntil,
    issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
    dob: '15 AUG 2003',
    bloodGroup,
    emergencyPhone,
    address: 'Bengaluru Campus',
    photoUrl: photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentStudentName)}`,
    qrCodeData: cardToEdit?.qrCodeData || '',
    barcodeValue: cardToEdit?.barcodeValue || 'data:image/svg+xml;utf8,<svg></svg>',
    status: 'Active',
    layoutTemplate,
    printCount: cardToEdit ? cardToEdit.printCount : 0,
    createdAt: new Date().toISOString()
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {cardToEdit ? 'Update Student ID Card' : 'Issue New Student ID Card'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure student profile, layout template, emergency details, and QR barcode specs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Form Controls */}
            <div className="lg:col-span-7 space-y-4">
              {/* Student Picker */}
              {!cardToEdit && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Student Profile *
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={e => handleStudentSelect(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.studentId}) • {s.department}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Layout Template Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                  <Layout className="w-4 h-4 text-indigo-600" />
                  Select Card Layout Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'compact-badge', name: 'Compact Badge', desc: 'Clean Minimal' },
                    { id: 'compact-badge-blue', name: 'Compact Badge Blue', desc: 'Blue Accent' }
                  ].map(tmpl => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setLayoutTemplate(tmpl.id as IdCardLayout)}
                      className={`p-2.5 rounded-xl border text-left transition-all relative ${
                        layoutTemplate === tmpl.id
                          ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 font-bold shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <p className="text-[11px] leading-tight">{tmpl.name}</p>
                      <p className="text-[9px] text-slate-400 font-normal">{tmpl.desc}</p>
                      {layoutTemplate === tmpl.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 absolute top-2 right-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Blood Group */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Valid Until */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Valid Until Date
                  </label>
                  <input
                    type="text"
                    value={validUntil}
                    onChange={e => setValidUntil(e.target.value)}
                    placeholder="e.g. 30 JUN 2028"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                {/* Emergency Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    Emergency Contact Phone
                  </label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={e => setEmergencyPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                {/* Student Photo Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
                    Student Photo (PNG/JPEG)
                  </label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handlePhotoUpload}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl file:mr-3 file:border-0 file:bg-indigo-600 file:px-3 file:py-1 file:text-white file:rounded-lg file:cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Right Live Card Preview */}
            <div className="lg:col-span-5 bg-slate-100 rounded-2xl p-4 border border-slate-200/80 flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Live Card Preview
              </div>

              <div className="p-2 flex justify-center overflow-x-auto max-w-full">
                <IdCardRenderer card={mockPreviewCard} branding={branding} scale={0.9} />
              </div>

              <p className="text-[11px] text-slate-400 text-center font-mono">
                {branding.collegeName} Official ID Card
              </p>
            </div>
          </div>

          {/* Buttons Footer */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {saving ? 'Saving...' : cardToEdit ? 'Update Card Record' : 'Issue ID Card'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
