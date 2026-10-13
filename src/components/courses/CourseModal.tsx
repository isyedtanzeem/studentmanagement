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
  department: '',
  departmentId: '',
  degreeProgram: 'B.Tech',
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
      setErrorMessage(null);
    }
  }, [isOpen, courseToEdit]);

  const fetchDepartmentOptions = async () => {
    try {
      const res = await courseApi.getDepartmentOptions();
      if (res.success && res.data) {
        setDepartmentOptions(res.data);
        if (courseToEdit) {
          const matchedDept = res.data.find(d => d.name === courseToEdit.department || d.id === (courseToEdit as any).departmentId);
          setFormData({
            code: courseToEdit.code || '',
            title: courseToEdit.title || '',
            department: matchedDept ? matchedDept.name : (courseToEdit.department || ''),
            departmentId: matchedDept ? matchedDept.id : ((courseToEdit as any).departmentId || ''),
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
          setFormData({
            ...DEFAULT_FORM,
            department: res.data.length > 0 ? res.data[0].name : '',
            departmentId: res.data.length > 0 ? res.data[0].id : ''
          });
        }
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
    if (name === 'department') {
      const selectedDept = departmentOptions.find(d => d.name === value || d.id === value);
      setFormData(prev => ({
        ...prev,
        department: selectedDept ? selectedDept.name : value,
        departmentId: selectedDept ? selectedDept.id : ''
      }));
    } else if (type === 'number') {
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
      if (!formData.code || !formData.title) {
        throw new Error('Course Code and Course Title are required.');
      }

      if (!formData.department || !formData.department.trim()) {
        throw new Error('Cannot create course without selecting a department. Courses must be linked to an existing department.');
      }

      if (departmentOptions.length === 0) {
        throw new Error('No departments available. Courses cannot be created without a department in the database.');
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
          className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-[4px] shadow-xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[3px] bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {isEditing ? `Edit Course: ${courseToEdit?.code}` : 'Add New Academic Course'}
                </h2>
                <p className="text-xs text-slate-500 font-poppins">
                  Define curriculum duration, fee structure, academic credits & department mapping
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-[3px] hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs font-poppins">
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-[3px] flex items-center gap-3 text-rose-700 font-poppins">
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-[3px] px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-poppins text-xs uppercase"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-[3px] px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 text-xs font-medium"
                />
              </div>
            </div>

            {/* Department Mapping & Program Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-medium text-[11px] mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  Department Mapping <span className="text-rose-500">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  disabled={departmentOptions.length === 0}
                  className="w-full bg-slate-50 border border-slate-300 rounded-[3px] px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 text-xs cursor-pointer font-medium disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  {departmentOptions.length === 0 ? (
                    <option value="">No departments found in database</option>
                  ) : (
                    departmentOptions.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.code})
                      </option>
                    ))
                  )}
                </select>
                {departmentOptions.length === 0 && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    ⚠️ Cannot create course: Please register a Department first.
                  </p>
                )}
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-[3px] px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 text-xs font-medium"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-[3px] px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 text-xs cursor-pointer font-medium"
                >
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Doctoral">Doctoral</option>
                </select>
              </div>
            </div>

            {/* Course Duration & Credits Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 p-3.5 rounded-[3px] font-poppins">
              <div>
                <label className="block text-slate-700 text-[11px] mb-1 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Course Duration *
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-300 rounded-[3px] px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 text-xs cursor-pointer font-medium"
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
                  className="w-full bg-white border border-slate-300 rounded-[3px] px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 text-xs font-medium font-poppins"
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
                  className="w-full bg-white border border-slate-300 rounded-[3px] px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 text-xs font-medium font-poppins"
                />
              </div>
            </div>

            {/* Course Fee Structure Section */}
            <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-[3px] space-y-3 font-poppins">
              <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                <span className="text-xs text-blue-900 font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  Course Fee Structure (INR ₹ / Semester)
                </span>
                <span className="text-blue-900 font-bold text-xs bg-white border border-blue-200 px-2 py-0.5 rounded font-poppins">
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
                    className="w-full bg-white border border-slate-300 rounded-[3px] px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 text-xs font-poppins font-medium"
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
                    className="w-full bg-white border border-slate-300 rounded-[3px] px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 text-xs font-poppins font-medium"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-[3px] px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 text-xs font-medium"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-[3px] px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 text-xs cursor-pointer font-medium"
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
                className="w-full bg-slate-50 border border-slate-300 rounded-[3px] px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 text-xs font-medium"
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
                className="w-full bg-slate-50 border border-slate-300 rounded-[3px] px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 text-xs resize-none font-medium"
              />
            </div>

            {/* Submit Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 font-medium">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-[3px] border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-[3px] text-xs transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
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
