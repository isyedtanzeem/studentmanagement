import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, UserCheck, Mail, Phone, MapPin, Calendar, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Department, CreateDepartmentDto, FacultyOption } from '../../types/department';
import { departmentApi } from '../../api/departmentApi';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  departmentToEdit?: Department | null;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  departmentToEdit
}) => {
  const isEditMode = !!departmentToEdit;

  const [formData, setFormData] = useState<CreateDepartmentDto>({
    code: '',
    name: '',
    headOfDepartment: '',
    hodEmail: '',
    hodPhone: '',
    hodDesignation: 'Professor & HOD',
    buildingLocation: '',
    establishedYear: new Date().getFullYear(),
    status: 'Active',
    description: ''
  });

  const [facultyOptions, setFacultyOptions] = useState<FacultyOption[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('custom');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFacultyOptions();
      if (departmentToEdit) {
        setFormData({
          code: departmentToEdit.code || '',
          name: departmentToEdit.name || '',
          headOfDepartment: departmentToEdit.headOfDepartment || '',
          hodEmail: departmentToEdit.hodEmail || '',
          hodPhone: departmentToEdit.hodPhone || '',
          hodDesignation: departmentToEdit.hodDesignation || 'Professor & HOD',
          buildingLocation: departmentToEdit.buildingLocation || '',
          establishedYear: departmentToEdit.establishedYear || new Date().getFullYear(),
          status: departmentToEdit.status || 'Active',
          description: departmentToEdit.description || ''
        });
      } else {
        setFormData({
          code: '',
          name: '',
          headOfDepartment: '',
          hodEmail: '',
          hodPhone: '',
          hodDesignation: 'Professor & HOD',
          buildingLocation: '',
          establishedYear: new Date().getFullYear(),
          status: 'Active',
          description: ''
        });
        setSelectedFacultyId('custom');
      }
      setErrorMessage(null);
    }
  }, [isOpen, departmentToEdit]);

  const loadFacultyOptions = async () => {
    try {
      const res = await departmentApi.getFacultyOptions();
      if (res.success) {
        setFacultyOptions(res.data);
      }
    } catch (err) {
      console.error('Failed to load faculty options', err);
    }
  };

  const handleFacultySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedFacultyId(val);

    if (val === 'custom') {
      return;
    }

    const selectedFac = facultyOptions.find(f => f.id === val);
    if (selectedFac) {
      setFormData(prev => ({
        ...prev,
        headOfDepartment: selectedFac.fullName,
        hodEmail: selectedFac.email || prev.hodEmail,
        hodDesignation: selectedFac.designation || 'Professor & HOD'
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim()) {
      setErrorMessage('Please enter department name.');
      return;
    }
    if (!formData.code.trim()) {
      setErrorMessage('Please enter a unique department code (e.g., CSE).');
      return;
    }
    if (!formData.headOfDepartment.trim()) {
      setErrorMessage('Please specify the Head of Department (HOD) name.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && departmentToEdit) {
        await departmentApi.updateDepartment(departmentToEdit.id, formData);
      } else {
        await departmentApi.createDepartment(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-[#0d0d12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-mono">
                  {isEditMode ? 'Edit Department Record' : 'Add New Academic Department'}
                </h2>
                <p className="text-xs text-zinc-400">
                  {isEditMode
                    ? `Updating details for ${departmentToEdit?.code}`
                    : 'Create a new department, assign HOD and building location.'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs font-sans">
            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Basic Info Group */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#D4AF37] font-semibold block">
                1. Department Identification
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-zinc-300 font-medium">Department Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science & Engineering"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Code (Abbr) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono uppercase placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    Building & Floor Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Turing Block A, Floor 3"
                    value={formData.buildingLocation}
                    onChange={(e) => setFormData({ ...formData, buildingLocation: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    Est. Year
                  </label>
                  <input
                    type="number"
                    placeholder="1995"
                    value={formData.establishedYear}
                    onChange={(e) => setFormData({ ...formData, establishedYear: Number(e.target.value) })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>

            {/* HOD Assignment Group */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#D4AF37] font-semibold block">
                2. Head of Department (HOD) Assignment
              </span>

              {facultyOptions.length > 0 && (
                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Quick Select from Registered Faculty</label>
                  <select
                    value={selectedFacultyId}
                    onChange={handleFacultySelect}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="custom">-- Custom HOD Name or External Appointment --</option>
                    {facultyOptions.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.fullName} ({fac.designation} • {fac.department})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                    HOD Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prof. Ramesh Kulkarni"
                    value={formData.headOfDepartment}
                    onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Designation / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Professor & HOD"
                    value={formData.hodDesignation}
                    onChange={(e) => setFormData({ ...formData, hodDesignation: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    HOD Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="hod.cse@scholarcore.edu.in"
                    value={formData.hodEmail}
                    onChange={(e) => setFormData({ ...formData, hodEmail: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    HOD Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 11001"
                    value={formData.hodPhone}
                    onChange={(e) => setFormData({ ...formData, hodPhone: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>

            {/* Department Status & Description */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#D4AF37] font-semibold block">
                3. Operational Status & Description
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Department Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Active">Active Intake</option>
                    <option value="Inactive">Inactive / Suspended</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    Overview & Key Focus Areas
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of academic vision, specialized labs, or degree programs offered..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Controls */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 font-mono">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c49f27] text-black font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-[#D4AF37]/10 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : isEditMode ? 'Update Department' : 'Create Department'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
