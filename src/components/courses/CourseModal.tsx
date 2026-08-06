import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, AlertCircle, Save, DollarSign, Clock, Layers, Building2, User, Award } from 'lucide-react';
import { Course, CourseFormData, DepartmentOption } from '../../types/course';
import { courseApi } from '../../api/courseApi';

interface CourseModalProps {
  isOpen: boolean;
  courseToEdit?: Course | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_FORM: CourseFormData = {
  code: '',
  title: '',
  department: 'Computer Science & Engineering',
  degreeProgram: 'B.Tech CSE',
  level: 'Undergraduate',
  duration: '4 Years / 8 Semesters',
  credits: 4,
  courseFee: 85000,
  labFee: 15000,
  status: 'Active',
  instructorName: '',
  maxCapacity: 120,
  prerequisites: '',
  description: ''
};

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  courseToEdit,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CourseFormData>(DEFAULT_FORM);
  const [departmentOptions, setDepartmentOptions] = useState<DepartmentOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEditing = Boolean(courseToEdit);

  useEffect(() => {
    if (isOpen) {
      fetchDepartmentOptions();
      if (courseToEdit) {
        setFormData({
          code: courseToEdit.code || '',
          title: courseToEdit.title || '',
          department: courseToEdit.department || 'Computer Science & Engineering',
          degreeProgram: courseToEdit.degreeProgram || 'B.Tech',
          level: courseToEdit.level || 'Undergraduate',
          duration: courseToEdit.duration || '4 Years / 8 Semesters',
          credits: courseToEdit.credits || 3,
          courseFee: courseToEdit.courseFee || 0,
          labFee: courseToEdit.labFee || 0,
          status: courseToEdit.status === 'Inactive' ? 'Inactive' : 'Active',
          instructorName: courseToEdit.instructorName || '',
          maxCapacity: courseToEdit.maxCapacity || 120,
          prerequisites: courseToEdit.prerequisites || '',
          description: courseToEdit.description || ''
        });
      } else {
        setFormData(DEFAULT_FORM);
      }
      setErrorMessage(null);
    }
  }, [isOpen, courseToEdit]);

  const fetchDepartmentOptions = async () => {
    try {
      const res = await courseApi.getDepartmentOptions();
      if (res.success && res.data.length > 0) {
        setDepartmentOptions(res.data);
      }
    } catch (err) {
      console.error('Failed to load department options for courses', err);
    }
  };

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (!formData.code || !formData.title || !formData.department) {
        throw new Error('Course Code, Title, and Department Mapping are required fields.');
      }

      if (isEditing && courseToEdit) {
        await courseApi.updateCourse(courseToEdit.id, formData);
      } else {
        await courseApi.createCourse(formData);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving the course record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedTotalFee = (Number(formData.courseFee) || 0) + (Number(formData.labFee) || 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl bg-[#0d0d12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-mono">
                  {isEditing ? `Edit Course: ${courseToEdit?.code}` : 'Add New Academic Course'}
                </h2>
                <p className="text-xs text-zinc-400 font-sans">
                  Define curriculum duration, fee structure, academic credits & department mapping
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs font-sans">
            {errorMessage && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Basic Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-zinc-400 font-mono text-[11px] mb-1">
                  Course Code *
                </label>
                <input
                  type="text"
                  name="code"
                  placeholder="e.g. CS101, EC201"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37] font-mono text-xs uppercase"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-zinc-400 font-mono text-[11px] mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Data Structures & Algorithms in C++"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37] text-xs"
                />
              </div>
            </div>

            {/* Department Mapping & Program Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-zinc-400 font-mono text-[11px] mb-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-[#D4AF37]" />
                  Department Mapping *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs cursor-pointer"
                >
                  {departmentOptions.length > 0 ? (
                    departmentOptions.map((d) => (
                      <option key={d.id} value={d.name} className="bg-zinc-900 text-white">
                        {d.name} ({d.code})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Computer Science & Engineering" className="bg-zinc-900 text-white">
                        Computer Science & Engineering
                      </option>
                      <option value="Electronics & Communication" className="bg-zinc-900 text-white">
                        Electronics & Communication
                      </option>
                      <option value="Electrical & Electronics" className="bg-zinc-900 text-white">
                        Electrical & Electronics
                      </option>
                      <option value="Department of Management Studies" className="bg-zinc-900 text-white">
                        Department of Management Studies
                      </option>
                      <option value="Biotechnology & Life Sciences" className="bg-zinc-900 text-white">
                        Biotechnology & Life Sciences
                      </option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-mono text-[11px] mb-1">
                  Degree Program
                </label>
                <input
                  type="text"
                  name="degreeProgram"
                  placeholder="e.g. B.Tech CSE, MBA, M.Tech"
                  value={formData.degreeProgram}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37] text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-mono text-[11px] mb-1">
                  Academic Level
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs cursor-pointer font-mono"
                >
                  <option value="Undergraduate" className="bg-zinc-900 text-white">Undergraduate</option>
                  <option value="Postgraduate" className="bg-zinc-900 text-white">Postgraduate</option>
                  <option value="Diploma" className="bg-zinc-900 text-white">Diploma</option>
                  <option value="Doctoral" className="bg-zinc-900 text-white">Doctoral</option>
                </select>
              </div>
            </div>

            {/* Course Duration & Credits Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/40 border border-white/5 p-3.5 rounded-xl font-mono">
              <div>
                <label className="block text-zinc-400 text-[11px] mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Course Duration *
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full bg-black/80 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs cursor-pointer"
                >
                  <option value="4 Years / 8 Semesters" className="bg-zinc-900 text-white">4 Years / 8 Semesters</option>
                  <option value="3 Years / 6 Semesters" className="bg-zinc-900 text-white">3 Years / 6 Semesters</option>
                  <option value="2 Years / 4 Semesters" className="bg-zinc-900 text-white">2 Years / 4 Semesters</option>
                  <option value="1 Year / 2 Semesters" className="bg-zinc-900 text-white">1 Year / 2 Semesters</option>
                  <option value="1 Semester (Elective)" className="bg-zinc-900 text-white">1 Semester (Elective)</option>
                  <option value="6 Months Certificate" className="bg-zinc-900 text-white">6 Months Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">
                  Academic Credits
                </label>
                <input
                  type="number"
                  name="credits"
                  min="1"
                  max="30"
                  value={formData.credits}
                  onChange={handleChange}
                  className="w-full bg-black/80 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">
                  Max Batch Capacity
                </label>
                <input
                  type="number"
                  name="maxCapacity"
                  min="10"
                  max="1000"
                  value={formData.maxCapacity}
                  onChange={handleChange}
                  className="w-full bg-black/80 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                />
              </div>
            </div>

            {/* Course Fee Structure Section */}
            <div className="bg-gradient-to-r from-[#D4AF37]/10 via-black to-black border border-[#D4AF37]/30 p-4 rounded-xl space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[11px] text-[#D4AF37] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  Course Fee Structure (INR ₹ / Semester)
                </span>
                <span className="text-white font-bold text-xs bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-2 py-0.5 rounded">
                  Total Fee: ₹{calculatedTotalFee.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">
                    Tuition / Semester Fee (₹)
                  </label>
                  <input
                    type="number"
                    name="courseFee"
                    min="0"
                    step="1000"
                    value={formData.courseFee}
                    onChange={handleChange}
                    className="w-full bg-black/80 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">
                    Lab & Examination Fee (₹)
                  </label>
                  <input
                    type="number"
                    name="labFee"
                    min="0"
                    step="500"
                    value={formData.labFee}
                    onChange={handleChange}
                    className="w-full bg-black/80 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Instructor & Prerequisites */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 font-mono text-[11px] mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-sky-400" />
                  Primary Instructor / Faculty Lead
                </label>
                <input
                  type="text"
                  name="instructorName"
                  placeholder="e.g. Prof. Ramesh Kulkarni"
                  value={formData.instructorName}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37] text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-mono text-[11px] mb-1">
                  Course Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs cursor-pointer font-mono"
                >
                  <option value="Active" className="bg-zinc-900 text-white">Active (Offering Intake)</option>
                  <option value="Inactive" className="bg-zinc-900 text-white">Inactive (Suspended)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 font-mono text-[11px] mb-1">
                Prerequisites & Recommended Knowledge
              </label>
              <input
                type="text"
                name="prerequisites"
                placeholder="e.g. Basic Mathematics, Linear Algebra, Object-Oriented Programming"
                value={formData.prerequisites}
                onChange={handleChange}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37] text-xs"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-mono text-[11px] mb-1">
                Course Syllabus & Description
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Brief summary of modules, academic goals, and learning outcomes..."
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37] text-xs resize-none"
              />
            </div>

            {/* Submit Action Bar */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 font-mono">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/5 transition-colors text-xs"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c49f27] text-black font-semibold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-lg shadow-[#D4AF37]/10 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Course' : 'Save New Course'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
