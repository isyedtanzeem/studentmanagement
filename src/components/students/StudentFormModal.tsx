import React, { useState, useEffect } from 'react';
import { Student } from '../../types/student';
import { X, Upload, Camera, Sparkles, User, Mail, Phone, Building2, Calendar, MapPin, Shield, BookOpen } from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentData: Partial<Student>) => Promise<void>;
  initialData?: Student | null;
  isEditing?: boolean;
}

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Biotechnology & Life Sciences',
  'Department of Management Studies',
  'Civil Engineering'
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250'
];

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    fullName: '',
    email: '',
    phone: '',
    department: DEPARTMENTS[0],
    gender: 'Male',
    status: 'Active',
    enrollmentYear: new Date().getFullYear(),
    gpa: 3.5,
    photoUrl: PRESET_AVATARS[0],
    dateOfBirth: '2004-01-01',
    address: '',
    guardianName: '',
    guardianPhone: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoMode, setPhotoMode] = useState<'preset' | 'custom'>('preset');
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData
      });
      if (initialData.photoUrl) {
        setCustomPhotoUrl(initialData.photoUrl);
      }
    } else {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        department: DEPARTMENTS[0],
        gender: 'Male',
        status: 'Active',
        enrollmentYear: new Date().getFullYear(),
        gpa: 3.5,
        photoUrl: PRESET_AVATARS[0],
        dateOfBirth: '2004-01-01',
        address: '',
        guardianName: '',
        guardianPhone: ''
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'gpa' || name === 'enrollmentYear' ? Number(value) : value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomPhotoUrl(result);
        setFormData(prev => ({ ...prev, photoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      setError('Full Name and Email Address are required fields.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save student record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0f0f15] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 relative flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white serif-font">
                {isEditing ? 'Edit Student Record' : 'Register New Student'}
              </h3>
              <p className="text-xs text-zinc-400">
                {isEditing ? `Updating profile ID: ${initialData?.studentId}` : 'Enter student credentials & academic info'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 font-mono">
              {error}
            </div>
          )}

          {/* Photo Upload Section */}
          <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
            <label className="text-zinc-300 font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#D4AF37]" />
                Student Profile Photo
              </span>
              <div className="flex items-center gap-2 font-normal text-[11px]">
                <button
                  type="button"
                  onClick={() => setPhotoMode('preset')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    photoMode === 'preset' ? 'bg-[#D4AF37] text-black font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode('custom')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    photoMode === 'custom' ? 'bg-[#D4AF37] text-black font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Custom Upload
                </button>
              </div>
            </label>

            {photoMode === 'preset' ? (
              <div className="flex items-center gap-3 overflow-x-auto py-1">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, photoUrl: url }))}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      formData.photoUrl === url ? 'border-[#D4AF37] scale-105 shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="preset avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl border border-white/20 overflow-hidden flex-shrink-0 bg-black">
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 m-3 text-zinc-600" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    placeholder="Enter Image URL (e.g. https://...)"
                    value={formData.photoUrl || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="photo-file-input"
                    />
                    <label
                      htmlFor="photo-file-input"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-zinc-300 hover:text-white cursor-pointer transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                      Upload Local File
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Basic Personal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={formData.fullName || ''}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="e.g. aarav.sharma@scholarcore.edu.in"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Mobile Number (+91)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Date of Birth</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth || ''}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* Academic Profile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Academic Department</label>
              <select
                name="department"
                value={formData.department || DEPARTMENTS[0]}
                onChange={handleChange}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept} className="bg-zinc-900 text-white">
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Enrollment Year</label>
              <input
                type="number"
                name="enrollmentYear"
                min="2018"
                max="2026"
                value={formData.enrollmentYear || 2024}
                onChange={handleChange}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">CGPA (0.00 - 10.00 Scale)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="gpa"
                value={formData.gpa ?? 8.5}
                onChange={handleChange}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Gender</label>
              <select
                name="gender"
                value={formData.gender || 'Male'}
                onChange={handleChange}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Male" className="bg-zinc-900">Male</option>
                <option value="Female" className="bg-zinc-900">Female</option>
                <option value="Other" className="bg-zinc-900">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Status</label>
              <select
                name="status"
                value={formData.status || 'Active'}
                onChange={handleChange}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Active" className="bg-zinc-900">Active</option>
                <option value="Inactive" className="bg-zinc-900">Inactive</option>
                <option value="Graduated" className="bg-zinc-900">Graduated</option>
                <option value="Suspended" className="bg-zinc-900">Suspended</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-zinc-400 mb-1 font-medium">Residential Address</label>
              <input
                type="text"
                name="address"
                placeholder="e.g. 100 University Drive, Campus Housing Apt 4B"
                value={formData.address || ''}
                onChange={handleChange}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Guardian Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Guardian Full Name</label>
              <input
                type="text"
                name="guardianName"
                placeholder="e.g. Robert Vance"
                value={formData.guardianName || ''}
                onChange={handleChange}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Guardian Phone</label>
              <input
                type="text"
                name="guardianPhone"
                placeholder="+1 (555) 999-8888"
                value={formData.guardianPhone || ''}
                onChange={handleChange}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-medium transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c49f27] text-black font-semibold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isEditing ? 'Save Changes' : 'Register Student'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
