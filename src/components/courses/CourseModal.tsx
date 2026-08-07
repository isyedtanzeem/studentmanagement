import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, AlertCircle, Save, DollarSign, Clock, Building2, User } from 'lucide-react';
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {isEditing ? `Edit Course: ${courseToEdit?.code}` : 'Add New Academic Course'}
                </h2>
                <p className="text-xs text-slate-500 font-sans">
                  Define curriculum duration, fee structure, academic credits & department mapping
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs font-sans">
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Basic Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-medium text-[11px] mb-1">
                  Course Code *
                </label>
                <input
                  type="text"
                  name="code"
                  placeholder="e.g. CS101, EC201"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-mono text-xs uppercase"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-700 font-medium text-[11px] mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Data Structures & Algorithms in C++"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 text-xs font-medium"
                />
              </div>
            </div>

            {/* Department Mapping & Program Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-medium text-[11px] mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  Department Mapping *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 text-xs cursor-pointer font-medium"
                >
                  {departmentOptions.length > 0 ? (
                    departmentOptions.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.code})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Computer Science & Engineering">
                        Computer Science & Engineering
                      </option>
                      <option value="Electronics & Communication">
                        Electronics & Communication
                      </option>
                      <option value="Electrical & Electronics">
                        Electrical & Electronics
                      </option>
                      <option value="Department of Management Studies">
                        Department of Management Studies
                      </option>
                      <option value="Biotechnology & Life Sciences">
                        Biotechnology & Life Sciences
                      </option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium text-[11px] mb-1">
                  Degree Program
                </label>
                <input
                  type="text"
                  name="degreeProgram"
                  placeholder="e.g. B.Tech CSE, MBA, M.Tech"
                  value={formData.degreeProgram}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium text-[11px] mb-1">
                  Academic Level
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 text-xs cursor-pointer font-medium"
                >
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Doctoral">Doctoral</option>
                </select>
              </div>
            </div>

            {/* Course Duration & Credits Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-sans">
              <div>
                <label className="block text-slate-700 text-[11px] mb-1 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Course Duration *
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 text-xs cursor-pointer font-medium"
                >
                  <option value="4 Years / 8 Semesters">4 Years / 8 Semesters</option>
                  <option value="3 Years / 6 Semesters">3 Years / 6 Semesters</option>
                  <option value="2 Years / 4 Semesters">2 Years / 4 Semesters</option>
                  <option value="1 Year / 2 Semesters">1 Year / 2 Semesters</option>
                  <option value="1 Semester (Elective)">1 Semester (Elective)</option>
                  <option value="6 Months Certificate">6 Months Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 text-[11px] mb-1 font-medium">
                  Academic Credits
                </label>
                <input
                  type="number"
                  name="credits"
                  min="1"
                  max="30"
                  value={formData.credits}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 text-xs font-medium font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-[11px] mb-1 font-medium">
                  Max Batch Capacity
                </label>
                <input
                  type="number"
                  name="maxCapacity"
                  min="10"
                  max="1000"
                  value={formData.maxCapacity}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 text-xs font-medium font-mono"
                />
              </div>
            </div>

            {/* Course Fee Structure Section */}
            <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-xl space-y-3 font-sans">
              <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                <span className="text-xs text-blue-900 font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  Course Fee Structure (INR ₹ / Semester)
                </span>
                <span className="text-blue-900 font-bold text-xs bg-white border border-blue-200 px-2 py-0.5 rounded font-mono">
                  Total Fee: ₹{calculatedTotalFee.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-[11px] mb-1 font-medium">
                    Tuition / Semester Fee (₹)
                  </label>
                  <input
                    type="number"
                    name="courseFee"
                    min="0"
                    step="1000"
                    value={formData.courseFee}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 text-xs font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-[11px] mb-1 font-medium">
                    Lab & Examination Fee (₹)
                  </label>
                  <input
                    type="number"
                    name="labFee"
                    min="0"
                    step="500"
                    value={formData.labFee}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 text-xs font-mono font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Instructor & Prerequisites */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-medium text-[11px] mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Primary Instructor / Faculty Lead
                </label>
                <input
                  type="text"
                  name="instructorName"
                  placeholder="e.g. Prof. Ramesh Kulkarni"
                  value={formData.instructorName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium text-[11px] mb-1">
                  Course Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 text-xs cursor-pointer font-medium"
                >
                  <option value="Active">Active (Offering Intake)</option>
                  <option value="Inactive">Inactive (Suspended)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium text-[11px] mb-1">
                Prerequisites & Recommended Knowledge
              </label>
              <input
                type="text"
                name="prerequisites"
                placeholder="e.g. Basic Mathematics, Linear Algebra, Object-Oriented Programming"
                value={formData.prerequisites}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium text-[11px] mb-1">
                Course Syllabus & Description
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Brief summary of modules, academic goals, and learning outcomes..."
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 text-xs resize-none font-medium"
              />
            </div>

            {/* Submit Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 font-medium">
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
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
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
