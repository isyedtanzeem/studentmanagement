import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Users,
  Phone,
  Mail,
  MapPin,
  ShieldAlert,
  GraduationCap,
  Briefcase,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search
} from 'lucide-react';
import { Guardian, GuardianFormData, StudentOption } from '../../types/guardian';
import { guardianApi } from '../../api/guardianApi';

interface GuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  guardianToEdit?: Guardian | null;
}

type TabType = 'parent' | 'emergency' | 'address' | 'mapping';

export const GuardianModal: React.FC<GuardianModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  guardianToEdit
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('parent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  const [formData, setFormData] = useState<GuardianFormData>({
    fatherName: '',
    fatherOccupation: '',
    fatherPhone: '',
    fatherEmail: '',
    motherName: '',
    motherOccupation: '',
    motherPhone: '',
    motherEmail: '',
    guardianName: '',
    relationship: 'Father',
    occupation: '',
    primaryPhone: '',
    email: '',
    annualIncome: undefined,
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactAltPhone: '',
    emergencyRelationship: 'Paternal Uncle',
    emergencyAddress: '',
    residentialAddress: '',
    city: 'New Delhi',
    state: 'Delhi',
    zipCode: '110001',
    country: 'India',
    mappedStudentIds: [],
    status: 'Active'
  });

  useEffect(() => {
    if (isOpen) {
      loadStudentOptions();
      if (guardianToEdit) {
        setFormData({
          fatherName: guardianToEdit.fatherName || '',
          fatherOccupation: guardianToEdit.fatherOccupation || '',
          fatherPhone: guardianToEdit.fatherPhone || '',
          fatherEmail: guardianToEdit.fatherEmail || '',
          motherName: guardianToEdit.motherName || '',
          motherOccupation: guardianToEdit.motherOccupation || '',
          motherPhone: guardianToEdit.motherPhone || '',
          motherEmail: guardianToEdit.motherEmail || '',
          guardianName: guardianToEdit.guardianName || '',
          relationship: guardianToEdit.relationship || 'Father',
          occupation: guardianToEdit.occupation || '',
          primaryPhone: guardianToEdit.primaryPhone || '',
          email: guardianToEdit.email || '',
          annualIncome: guardianToEdit.annualIncome,
          emergencyContactName: guardianToEdit.emergencyContactName || '',
          emergencyContactPhone: guardianToEdit.emergencyContactPhone || '',
          emergencyContactAltPhone: guardianToEdit.emergencyContactAltPhone || '',
          emergencyRelationship: guardianToEdit.emergencyRelationship || 'Paternal Uncle',
          emergencyAddress: guardianToEdit.emergencyAddress || '',
          residentialAddress: guardianToEdit.residentialAddress || '',
          city: guardianToEdit.city || 'New Delhi',
          state: guardianToEdit.state || 'Delhi',
          zipCode: guardianToEdit.zipCode || '110001',
          country: guardianToEdit.country || 'India',
          mappedStudentIds: guardianToEdit.mappedStudentIds || [],
          status: guardianToEdit.status || 'Active'
        });
      } else {
        resetForm();
      }
      setActiveTab('parent');
      setError(null);
    }
  }, [isOpen, guardianToEdit]);

  const loadStudentOptions = async () => {
    try {
      const res = await guardianApi.getStudentOptions();
      if (res.success) {
        setStudentOptions(res.data);
      }
    } catch (err) {
      console.error('Failed to load student options:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      fatherName: '',
      fatherOccupation: '',
      fatherPhone: '',
      fatherEmail: '',
      motherName: '',
      motherOccupation: '',
      motherPhone: '',
      motherEmail: '',
      guardianName: '',
      relationship: 'Father',
      occupation: '',
      primaryPhone: '',
      email: '',
      annualIncome: undefined,
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactAltPhone: '',
      emergencyRelationship: 'Paternal Uncle',
      emergencyAddress: '',
      residentialAddress: '',
      city: 'New Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India',
      mappedStudentIds: [],
      status: 'Active'
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Auto sync primary guardian name/phone/email if relationship is Father or Mother
      if (name === 'fatherName' && prev.relationship === 'Father') {
        updated.guardianName = value;
      }
      if (name === 'fatherPhone' && prev.relationship === 'Father') {
        updated.primaryPhone = value;
      }
      if (name === 'fatherEmail' && prev.relationship === 'Father') {
        updated.email = value;
      }
      if (name === 'fatherOccupation' && prev.relationship === 'Father') {
        updated.occupation = value;
      }

      if (name === 'motherName' && prev.relationship === 'Mother') {
        updated.guardianName = value;
      }
      if (name === 'motherPhone' && prev.relationship === 'Mother') {
        updated.primaryPhone = value;
      }
      if (name === 'motherEmail' && prev.relationship === 'Mother') {
        updated.email = value;
      }
      if (name === 'motherOccupation' && prev.relationship === 'Mother') {
        updated.occupation = value;
      }

      return updated;
    });
  };

  const toggleStudentMapping = (studentId: string) => {
    setFormData(prev => {
      const exists = prev.mappedStudentIds.includes(studentId);
      if (exists) {
        return {
          ...prev,
          mappedStudentIds: prev.mappedStudentIds.filter(id => id !== studentId)
        };
      } else {
        return {
          ...prev,
          mappedStudentIds: [...prev.mappedStudentIds, studentId]
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.guardianName.trim()) {
      setError('Primary Guardian Name is required.');
      setActiveTab('parent');
      return;
    }

    if (!formData.primaryPhone.trim()) {
      setError('Primary Contact Phone Number is required.');
      setActiveTab('parent');
      return;
    }

    if (!formData.emergencyContactName.trim() || !formData.emergencyContactPhone.trim()) {
      setError('Emergency Contact Name & Emergency Phone are required.');
      setActiveTab('emergency');
      return;
    }

    if (!formData.residentialAddress.trim()) {
      setError('Residential Address is required.');
      setActiveTab('address');
      return;
    }

    try {
      setLoading(true);
      if (guardianToEdit) {
        await guardianApi.updateGuardian(guardianToEdit.id, formData);
      } else {
        await guardianApi.createGuardian(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save guardian record.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredStudentOptions = studentOptions.filter(
    s =>
      s.fullName.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {guardianToEdit ? 'Edit Guardian & Parent Record' : 'Register New Guardian'}
                </h2>
                <p className="text-xs text-slate-400">
                  Manage parent details, emergency contacts, address, and student mappings
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-2 overflow-x-auto gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('parent')}
              className={`flex items-center gap-2 py-3 px-4 font-semibold text-xs rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'parent'
                  ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" />
              Parent & Guardian Details
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('emergency')}
              className={`flex items-center gap-2 py-3 px-4 font-semibold text-xs rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'emergency'
                  ? 'border-amber-600 text-amber-600 bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Emergency Contacts
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('address')}
              className={`flex items-center gap-2 py-3 px-4 font-semibold text-xs rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'address'
                  ? 'border-emerald-600 text-emerald-600 bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Residential Address
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mapping')}
              className={`flex items-center gap-2 py-3 px-4 font-semibold text-xs rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'mapping'
                  ? 'border-purple-600 text-purple-600 bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student Mapping ({formData.mappedStudentIds.length})
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
              {error && (
                <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* TAB 1: PARENT & GUARDIAN DETAILS */}
              {activeTab === 'parent' && (
                <div className="space-y-6">
                  {/* Father Details Card */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-600" />
                      Father's Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Father's Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fatherName"
                          value={formData.fatherName}
                          onChange={handleInputChange}
                          placeholder="e.g. Rajesh Sharma"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Father's Occupation
                        </label>
                        <input
                          type="text"
                          name="fatherOccupation"
                          value={formData.fatherOccupation}
                          onChange={handleInputChange}
                          placeholder="e.g. Senior Software Architect"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Father's Phone Number
                        </label>
                        <input
                          type="text"
                          name="fatherPhone"
                          value={formData.fatherPhone}
                          onChange={handleInputChange}
                          placeholder="+91 98112 34567"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Father's Email Address
                        </label>
                        <input
                          type="email"
                          name="fatherEmail"
                          value={formData.fatherEmail}
                          onChange={handleInputChange}
                          placeholder="father@example.com"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mother Details Card */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-600" />
                      Mother's Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Mother's Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="motherName"
                          value={formData.motherName}
                          onChange={handleInputChange}
                          placeholder="e.g. Sunita Sharma"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Mother's Occupation
                        </label>
                        <input
                          type="text"
                          name="motherOccupation"
                          value={formData.motherOccupation}
                          onChange={handleInputChange}
                          placeholder="e.g. High School Vice Principal"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Mother's Phone Number
                        </label>
                        <input
                          type="text"
                          name="motherPhone"
                          value={formData.motherPhone}
                          onChange={handleInputChange}
                          placeholder="+91 98112 34568"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Mother's Email Address
                        </label>
                        <input
                          type="email"
                          name="motherEmail"
                          value={formData.motherEmail}
                          onChange={handleInputChange}
                          placeholder="mother@example.com"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Primary Designated Guardian Details Card */}
                  <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      Primary Designated Guardian & Relationship
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Relationship to Student <span className="text-rose-500">*</span>
                        </label>
                        <select
                          name="relationship"
                          value={formData.relationship}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Legal Guardian">Legal Guardian</option>
                          <option value="Local Guardian">Local Guardian</option>
                          <option value="Relative">Relative</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Primary Guardian Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="guardianName"
                          value={formData.guardianName}
                          onChange={handleInputChange}
                          placeholder="e.g. Rajesh Sharma"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Primary Contact Phone <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="primaryPhone"
                          value={formData.primaryPhone}
                          onChange={handleInputChange}
                          placeholder="+91 98112 34567"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Primary Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="guardian@example.com"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Occupation
                        </label>
                        <input
                          type="text"
                          name="occupation"
                          value={formData.occupation}
                          onChange={handleInputChange}
                          placeholder="e.g. Business Owner"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Annual Family Income (₹)
                        </label>
                        <input
                          type="number"
                          name="annualIncome"
                          value={formData.annualIncome || ''}
                          onChange={handleInputChange}
                          placeholder="e.g. 2800000"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EMERGENCY CONTACTS */}
              {activeTab === 'emergency' && (
                <div className="space-y-6">
                  <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-4">
                    <div className="flex items-center gap-2 text-amber-900">
                      <ShieldAlert className="w-5 h-5 text-amber-600" />
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider">
                          Emergency Contact Hotline Person
                        </h3>
                        <p className="text-[11px] text-amber-700">
                          Designated contact reached immediately during medical emergencies or campus alerts
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Emergency Contact Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleInputChange}
                          placeholder="e.g. Alok Sharma"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Relationship to Family/Student
                        </label>
                        <input
                          type="text"
                          name="emergencyRelationship"
                          value={formData.emergencyRelationship}
                          onChange={handleInputChange}
                          placeholder="e.g. Paternal Uncle (Local Resident)"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Emergency Phone Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="emergencyContactPhone"
                          value={formData.emergencyContactPhone}
                          onChange={handleInputChange}
                          placeholder="+91 98112 99887"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Alternate Emergency Phone
                        </label>
                        <input
                          type="text"
                          name="emergencyContactAltPhone"
                          value={formData.emergencyContactAltPhone}
                          onChange={handleInputChange}
                          placeholder="+91 98112 99888"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Emergency Contact Residential Address
                        </label>
                        <input
                          type="text"
                          name="emergencyAddress"
                          value={formData.emergencyAddress}
                          onChange={handleInputChange}
                          placeholder="e.g. C-12 Vasant Kunj, New Delhi 110070"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RESIDENTIAL ADDRESS */}
              {activeTab === 'address' && (
                <div className="space-y-6">
                  <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-900">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider">
                          Permanent Family Residence
                        </h3>
                        <p className="text-[11px] text-emerald-700">
                          Official mailing and residential address for academic transcripts and physical dispatches
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Street / Apartment / House Address <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          name="residentialAddress"
                          value={formData.residentialAddress}
                          onChange={handleInputChange}
                          placeholder="e.g. B-104, Vasant Kunj, New Delhi"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          City <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="e.g. New Delhi"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          State / Union Territory <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="e.g. Delhi"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          PIN / Zip Code
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          placeholder="e.g. 110070"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="India"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: STUDENT MAPPING */}
              {activeTab === 'mapping' && (
                <div className="space-y-6">
                  <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-purple-900">
                        <GraduationCap className="w-5 h-5 text-purple-600" />
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider">
                            Map Students to Guardian Profile
                          </h3>
                          <p className="text-[11px] text-purple-700">
                            Select enrolled students whose academic reports and emergency notifications are linked to this guardian
                          </p>
                        </div>
                      </div>

                      <div className="relative w-64">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search student or roll #..."
                          value={studentSearchQuery}
                          onChange={e => setStudentSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    {/* Selected Student Badges */}
                    {formData.mappedStudentIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1 border-t border-purple-200/60">
                        <span className="text-[11px] font-bold text-purple-800 self-center">
                          Currently Mapped ({formData.mappedStudentIds.length}):
                        </span>
                        {formData.mappedStudentIds.map(sId => {
                          const student = studentOptions.find(opt => opt.id === sId);
                          return (
                            <span
                              key={sId}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white shadow-xs"
                            >
                              {student ? `${student.fullName} (${student.studentId})` : sId}
                              <button
                                type="button"
                                onClick={() => toggleStudentMapping(sId)}
                                className="hover:bg-purple-700 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Student List Checkboxes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                      {filteredStudentOptions.map(std => {
                        const isMapped = formData.mappedStudentIds.includes(std.id);
                        return (
                          <div
                            key={std.id}
                            onClick={() => toggleStudentMapping(std.id)}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                              isMapped
                                ? 'bg-purple-100/70 border-purple-400 shadow-xs'
                                : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                                  isMapped
                                    ? 'bg-purple-600 border-purple-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isMapped && <CheckCircle2 className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800">{std.fullName}</p>
                                <p className="text-[11px] text-slate-500">
                                  {std.studentId} • {std.department}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {filteredStudentOptions.length === 0 && (
                        <div className="col-span-2 text-center py-6 text-slate-400 text-xs">
                          No matching student records found.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-800">
                        Guardian Account Record Status
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Inactive profiles are suppressed from emergency broadcasts
                      </p>
                    </div>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
              <div className="flex items-center gap-2">
                {activeTab !== 'parent' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'emergency') setActiveTab('parent');
                      if (activeTab === 'address') setActiveTab('emergency');
                      if (activeTab === 'mapping') setActiveTab('address');
                    }}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl transition-colors"
                  >
                    Back
                  </button>
                )}
                {activeTab !== 'mapping' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'parent') setActiveTab('emergency');
                      if (activeTab === 'emergency') setActiveTab('address');
                      if (activeTab === 'address') setActiveTab('mapping');
                    }}
                    className="px-4 py-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                  >
                    Next Step →
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Guardian...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {guardianToEdit ? 'Save Changes' : 'Register Guardian'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
