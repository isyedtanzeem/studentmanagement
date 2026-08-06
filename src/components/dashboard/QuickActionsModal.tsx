import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Building2,
  BookOpen,
  Send,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { QuickActionType } from '../../types/dashboard';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (type: QuickActionType, payload: any) => Promise<void>;
  userRole?: string;
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  isOpen,
  onClose,
  onExecute,
  userRole
}) => {
  const [activeAction, setActiveAction] = useState<QuickActionType>('ADD_ADMISSION');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form States
  const [admissionForm, setAdmissionForm] = useState({
    applicantName: '',
    email: '',
    department: 'Computer Science & Engineering',
    gender: 'Female' as 'Male' | 'Female' | 'Other',
    academicTerm: 'Fall 2026'
  });

  const [deptForm, setDeptForm] = useState({
    code: '',
    name: '',
    headOfDepartment: ''
  });

  const [courseForm, setCourseForm] = useState({
    code: '',
    title: '',
    department: 'Computer Science & Engineering',
    credits: 3
  });

  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    category: 'System' as 'Admission' | 'Academic' | 'Finance' | 'System'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      let payload: any = {};
      if (activeAction === 'ADD_ADMISSION') payload = admissionForm;
      if (activeAction === 'ADD_DEPARTMENT') payload = deptForm;
      if (activeAction === 'ADD_COURSE') payload = courseForm;
      if (activeAction === 'ISSUE_NOTIFICATION') payload = notifForm;

      await onExecute(activeAction, payload);
      setSuccessMsg('Action executed successfully! Real-time metrics updated.');

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to execute quick action.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-[#0f0f14] border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#14141c]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-base font-bold font-sans text-zinc-100">
              ScholarCore Executive Quick Actions
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Type Selector Bar */}
        <div className="p-3 bg-black/40 border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveAction('ADD_ADMISSION')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
              activeAction === 'ADD_ADMISSION'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-zinc-400 hover:bg-white/5'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Admission
          </button>

          <button
            type="button"
            onClick={() => setActiveAction('ADD_DEPARTMENT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
              activeAction === 'ADD_DEPARTMENT'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-zinc-400 hover:bg-white/5'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Add Department
          </button>

          <button
            type="button"
            onClick={() => setActiveAction('ADD_COURSE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
              activeAction === 'ADD_COURSE'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-zinc-400 hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Add Course
          </button>

          <button
            type="button"
            onClick={() => setActiveAction('ISSUE_NOTIFICATION')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
              activeAction === 'ISSUE_NOTIFICATION'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-zinc-400 hover:bg-white/5'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Broadcast Notification
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono animate-fade-in">
              {errorMsg}
            </div>
          )}

          {/* Form 1: Add Admission */}
          {activeAction === 'ADD_ADMISSION' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Applicant Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sophia Montgomery"
                  value={admissionForm.applicantName}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, applicantName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="sophia@example.com"
                    value={admissionForm.email}
                    onChange={(e) => setAdmissionForm({ ...admissionForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Department</label>
                  <select
                    value={admissionForm.department}
                    onChange={(e) => setAdmissionForm({ ...admissionForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Biotechnology & Life Sciences">Biotechnology & Life Sciences</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Gender</label>
                  <select
                    value={admissionForm.gender}
                    onChange={(e) => setAdmissionForm({ ...admissionForm, gender: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Academic Term</label>
                  <input
                    type="text"
                    value={admissionForm.academicTerm}
                    onChange={(e) => setAdmissionForm({ ...admissionForm, academicTerm: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form 2: Add Department */}
          {activeAction === 'ADD_DEPARTMENT' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Dept Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI, CS, BDA"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Head of Department</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Jane Doe"
                    value={deptForm.headOfDepartment}
                    onChange={(e) => setDeptForm({ ...deptForm, headOfDepartment: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="Artificial Intelligence & Cybernetics"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Form 3: Add Course */}
          {activeAction === 'ADD_COURSE' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS305"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({ ...courseForm, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="Advanced Machine Learning Engineering"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Department</label>
                <select
                  value={courseForm.department}
                  onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Biotechnology & Life Sciences">Biotechnology & Life Sciences</option>
                </select>
              </div>
            </div>
          )}

          {/* Form 4: Issue Notification */}
          {activeAction === 'ISSUE_NOTIFICATION' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Alert Title</label>
                <input
                  type="text"
                  required
                  placeholder="Important: Fall Term Registration Deadline"
                  value={notifForm.title}
                  onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Message Body</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Broadcast message to all students and faculty..."
                  value={notifForm.message}
                  onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Priority</label>
                  <select
                    value={notifForm.priority}
                    onChange={(e) => setNotifForm({ ...notifForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="medium">Medium</option>
                    <option value="high">High (Urgent)</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Category</label>
                  <select
                    value={notifForm.category}
                    onChange={(e) => setNotifForm({ ...notifForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="System">System</option>
                    <option value="Admission">Admission</option>
                    <option value="Academic">Academic</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/10 text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-amber-500 text-black hover:bg-amber-400 font-semibold text-xs font-mono transition-all disabled:opacity-50 flex items-center gap-2 shadow-md shadow-amber-500/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Execute Action</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
