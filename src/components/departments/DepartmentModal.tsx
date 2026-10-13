import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Building2,
  AlertCircle,
  CheckCircle,
  MapPin,
  Calendar,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEditMode = Boolean(departmentToEdit);

  useEffect(() => {
    if (isOpen) {
      if (departmentToEdit) {
        setFormData({
          name: departmentToEdit.name || '',
          code: departmentToEdit.code || '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (!formData.name.trim() || !formData.code.trim()) {
        throw new Error('Department Name and Department Code are required.');
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-poppins">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-white border border-slate-200 rounded-[4px] shadow-xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[3px] bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isEditMode ? 'Edit Department Record' : 'Add New Academic Department'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isEditMode
                    ? `Updating details for ${departmentToEdit?.code}`
                    : 'Create a new department and configure location & intake status.'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-[3px] hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-[3px] flex items-center gap-2 text-rose-700">
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-[3px] px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-[3px] px-3 py-2 text-slate-900 uppercase placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-bold"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-[3px] px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-[3px] px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Department Status & Description */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <span className="text-xs uppercase tracking-wider text-blue-900 font-bold block">
                2. Operational Status & Description
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-medium">Department Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-[3px] px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium cursor-pointer"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-[3px] p-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 resize-none font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Submit Controls */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 font-medium">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-[3px] border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-[3px] transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
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
