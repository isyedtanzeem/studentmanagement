import React, { useState, useEffect } from 'react';
import { X, UserPlus, Award, Mail, Phone, Building2, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import { Faculty } from '../../types/faculty';

interface FacultyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (facultyData: Partial<Faculty>) => Promise<void>;
  initialData?: Faculty | null;
  departmentsList?: string[];
}

const DEFAULT_DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Department of Management Studies',
  'Biotechnology & Life Sciences',
  'Civil Engineering',
  'Information Technology'
];

export const FacultyFormModal: React.FC<FacultyFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  departmentsList = DEFAULT_DEPARTMENTS
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    phone: '',
    department: departmentsList[0] || 'Computer Science & Engineering',
    designation: 'HOD', // default HOD
    qualification: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active' as 'Active' | 'On Leave' | 'Inactive'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || '',
        employeeId: initialData.employeeId || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        department: initialData.department || departmentsList[0] || '',
        designation: initialData.designation || 'HOD',
        qualification: initialData.qualification || '',
        joiningDate: initialData.joiningDate || new Date().toISOString().split('T')[0],
        status: (initialData.status as any) || 'Active'
      });
    } else {
      setFormData({
        fullName: '',
        employeeId: '',
        email: '',
        phone: '',
        department: departmentsList[0] || 'Computer Science & Engineering',
        designation: 'HOD',
        qualification: '',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'Active'
      });
    }
    setError(null);
  }, [initialData, isOpen, departmentsList]);

  if (!isOpen) return null;

  const handleAutoGenerateId = () => {
    const deptPrefix = (formData.department || 'CSE')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
    const rand = Math.floor(100 + Math.random() * 900);
    setFormData((prev) => ({ ...prev, employeeId: `FAC-${deptPrefix}-${rand}` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError('Please provide faculty full name.');
      return;
    }
    if (!formData.department) {
      setError('Please select a department.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save faculty record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {initialData ? 'Edit Faculty Record' : 'Faculty Member Registration'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {initialData ? 'Update official designation and academic dossier' : 'Register HODs, Professors, and Asst. Professors into institutional store'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <span className="text-[11px] uppercase tracking-wider text-blue-900 font-bold block">
              1. Personal & Employment Identity
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-700 font-medium flex items-center gap-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Vardhan"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-medium">Employee ID</label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateId}
                    className="text-[10px] text-blue-600 hover:underline font-mono flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-ID
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="FAC-CSE-012"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono uppercase focus:bg-white focus:outline-none focus:border-blue-600 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-700 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Official Email
                </label>
                <input
                  type="email"
                  placeholder="rajesh.v@scholarcore.edu.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Department & Designation */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <span className="text-[11px] uppercase tracking-wider text-blue-900 font-bold block">
              2. Academic Role & Department Designation
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-700 font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" /> Department Assignment *
                </label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium cursor-pointer"
                >
                  {departmentsList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-600" /> Faculty Type / Designation *
                </label>
                <select
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="HOD">HOD (Head of Department)</option>
                  <option value="Professor">Professor</option>
                  <option value="Asst. Professor">Asst. Professor (Assistant Professor)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-700 font-medium">Highest Academic Qualification</label>
                <input
                  type="text"
                  placeholder="e.g. Ph.D. in Artificial Intelligence (IIT Bombay)"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date of Joining
                </label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Status
              </label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="radio"
                    name="status"
                    value="Active"
                    checked={formData.status === 'Active'}
                    onChange={() => setFormData({ ...formData, status: 'Active' })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  Active Duty
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="radio"
                    name="status"
                    value="On Leave"
                    checked={formData.status === 'On Leave'}
                    onChange={() => setFormData({ ...formData, status: 'On Leave' })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  On Leave
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="radio"
                    name="status"
                    value="Inactive"
                    checked={formData.status === 'Inactive'}
                    onChange={() => setFormData({ ...formData, status: 'Inactive' })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  Inactive
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-sm flex items-center gap-2"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{initialData ? 'Update Faculty' : 'Register Faculty'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
