import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Building2,
  AlertCircle,
  CheckCircle,
  MapPin,
  Calendar,
  UserCheck,
  Mail,
  Phone,
  FileText
} from 'lucide-react';
import { Department, DepartmentFormData } from '../../types/department';
import { departmentApi } from '../../api/departmentApi';

interface DepartmentModalProps {
  isOpen: boolean;
  departmentToEdit?: Department | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_FORM: DepartmentFormData = {
  name: '',
  code: '',
  headOfDepartment: '',
  hodDesignation: 'Professor & HOD',
  hodEmail: '',
  hodPhone: '',
  buildingLocation: '',
  establishedYear: 2005,
  status: 'Active',
  description: ''
};

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  departmentToEdit,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<DepartmentFormData>(DEFAULT_FORM);
  const [facultyOptions, setFacultyOptions] = useState<any[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('custom');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEditMode = Boolean(departmentToEdit);

  useEffect(() => {
    if (isOpen) {
      fetchFacultyOptions();
      if (departmentToEdit) {
        setFormData({
          name: departmentToEdit.name || '',
          code: departmentToEdit.code || '',
          headOfDepartment: departmentToEdit.headOfDepartment || '',
          hodDesignation: departmentToEdit.hodDesignation || 'Professor & HOD',
          hodEmail: departmentToEdit.hodEmail || '',
          hodPhone: departmentToEdit.hodPhone || '',
          buildingLocation: departmentToEdit.buildingLocation || '',
          establishedYear: departmentToEdit.establishedYear || 2005,
          status: departmentToEdit.status || 'Active',
          description: departmentToEdit.description || ''
        });
      } else {
        setFormData(DEFAULT_FORM);
      }
      setErrorMessage(null);
    }
  }, [isOpen, departmentToEdit]);

  const fetchFacultyOptions = async () => {
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
    const facId = e.target.value;
    setSelectedFacultyId(facId);

    if (facId !== 'custom') {
      const fac = facultyOptions.find((f) => f.id === facId);
      if (fac) {
        setFormData((prev) => ({
          ...prev,
          headOfDepartment: fac.fullName,
          hodDesignation: fac.designation || 'Professor & HOD',
          hodEmail: fac.email || prev.hodEmail,
          hodPhone: fac.phone || prev.hodPhone
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (!formData.name || !formData.code || !formData.headOfDepartment) {
        throw new Error('Department Name, Code, and Head of Department (HOD) are required.');
      }

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isEditMode ? 'Edit Department Record' : 'Add New Academic Department'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isEditMode
                    ? `Updating details for ${departmentToEdit?.code}`
                    : 'Create a new department, assign HOD and building location.'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs font-sans">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Basic Info Group */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-blue-900 font-bold block">
                1. Department Identification
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-700 font-medium">Department Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science & Engineering"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-medium">Code (Abbr) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono uppercase placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-700 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    Building & Floor Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Turing Block A, Floor 3"
                    value={formData.buildingLocation}
                    onChange={(e) => setFormData({ ...formData, buildingLocation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Est. Year
                  </label>
                  <input
                    type="number"
                    placeholder="1995"
                    value={formData.establishedYear}
                    onChange={(e) => setFormData({ ...formData, establishedYear: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* HOD Assignment Group */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <span className="text-xs uppercase tracking-wider text-blue-900 font-bold block">
                2. Head of Department (HOD) Assignment
              </span>

              {facultyOptions.length > 0 && (
                <div className="space-y-1">
                  <label className="text-slate-700 font-medium">Quick Select from Registered Faculty</label>
                  <select
                    value={selectedFacultyId}
                    onChange={handleFacultySelect}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium cursor-pointer"
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
                  <label className="text-slate-700 font-medium flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    HOD Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prof. Ramesh Kulkarni"
                    value={formData.headOfDepartment}
                    onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-medium">Designation / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Professor & HOD"
                    value={formData.hodDesignation}
                    onChange={(e) => setFormData({ ...formData, hodDesignation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    HOD Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="hod.cse@scholarcore.edu.in"
                    value={formData.hodEmail}
                    onChange={(e) => setFormData({ ...formData, hodEmail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    HOD Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 11001"
                    value={formData.hodPhone}
                    onChange={(e) => setFormData({ ...formData, hodPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Department Status & Description */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <span className="text-xs uppercase tracking-wider text-blue-900 font-bold block">
                3. Operational Status & Description
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-medium">Department Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium cursor-pointer"
                  >
                    <option value="Active">Active Intake</option>
                    <option value="Inactive">Inactive / Suspended</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-700 font-medium flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Overview & Key Focus Areas
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of academic vision, specialized labs, or degree programs offered..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 resize-none font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Submit Controls */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 font-medium">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
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
