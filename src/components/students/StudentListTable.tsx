import React from 'react';
import { Student } from '../../types/student';
import {
  Eye,
  Edit,
  Trash2,
  Printer,
  MoreVertical,
  Check,
  Building2,
  Mail,
  GraduationCap,
  FileText,
  CreditCard,
  BookOpen,
  CalendarCheck
} from 'lucide-react';

interface StudentListTableProps {
  students: Student[];
  selectedIds: string[];
  onSelectToggle: (id: string) => void;
  onSelectAllToggle: () => void;
  onView: (student: Student) => void;
  onViewDocs?: (student: Student) => void;
  onViewSemesters?: (student: Student) => void;
  onViewFees?: (student: Student) => void;
  onViewAttendance?: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onOpenPDF: (student: Student) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (column: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const StudentListTable: React.FC<StudentListTableProps> = ({
  students,
  selectedIds,
  onSelectToggle,
  onSelectAllToggle,
  onView,
  onViewDocs,
  onViewSemesters,
  onViewFees,
  onViewAttendance,
  onEdit,
  onDelete,
  onOpenPDF,
  sortBy,
  sortOrder,
  onSortChange,
  canEdit = true,
  canDelete = true
}) => {
  const allSelected = students.length > 0 && students.every(s => selectedIds.includes(s.id));

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Graduated':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Inactive':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Suspended':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const renderSortIndicator = (column: string) => {
    if (sortBy !== column) return null;
    return <span className="text-blue-600 ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="bg-white border border-[#D2D6DE] rounded-[3px] overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#F4F6F9] border-b-2 border-[#D2D6DE] text-[#4B646F] uppercase text-[11px] font-bold tracking-wider">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAllToggle}
                  className="rounded-[2px] border-slate-300 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th
                onClick={() => onSortChange('fullName')}
                className="py-2.5 px-3 cursor-pointer hover:text-blue-700 transition-colors"
              >
                Student Name {renderSortIndicator('fullName')}
              </th>
              <th
                onClick={() => onSortChange('studentId')}
                className="py-2.5 px-3 cursor-pointer hover:text-blue-700 transition-colors"
              >
                Roll / Enrollment No {renderSortIndicator('studentId')}
              </th>
              <th
                onClick={() => onSortChange('department')}
                className="py-2.5 px-3 cursor-pointer hover:text-blue-700 transition-colors"
              >
                Department / Stream {renderSortIndicator('department')}
              </th>
              <th
                onClick={() => onSortChange('gpa')}
                className="py-2.5 px-3 cursor-pointer hover:text-blue-700 transition-colors"
              >
                CGPA (10.0) {renderSortIndicator('gpa')}
              </th>
              <th
                onClick={() => onSortChange('attendance')}
                className="py-2.5 px-3 cursor-pointer hover:text-blue-700 transition-colors"
              >
                Attendance % {renderSortIndicator('attendance')}
              </th>
              <th
                onClick={() => onSortChange('status')}
                className="py-2.5 px-3 cursor-pointer hover:text-blue-700 transition-colors"
              >
                Status {renderSortIndicator('status')}
              </th>
              <th
                onClick={() => onSortChange('enrollmentYear')}
                className="py-2.5 px-3 cursor-pointer hover:text-blue-700 transition-colors"
              >
                Year {renderSortIndicator('enrollmentYear')}
              </th>
              <th className="py-2.5 px-3 text-right pr-4">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E4E7EB] text-[#263238]">
            {students.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500 font-mono">
                  No student records found matching your filters.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const isSelected = selectedIds.includes(student.id);

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-[#EBF5FB] transition-colors group odd:bg-white even:bg-[#F9FAFC] ${
                      isSelected ? 'bg-[#D4E6F1]' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectToggle(student.id)}
                        className="rounded-[2px] border-slate-300 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            student.photoUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                          }
                          alt={student.fullName}
                          className="w-8 h-8 rounded-[3px] object-cover border border-[#D2D6DE] flex-shrink-0"
                        />
                        <div>
                          <span
                            onClick={() => onView(student)}
                            className="font-bold text-[#1F2D3D] hover:text-blue-700 cursor-pointer transition-colors block text-xs"
                          >
                            {student.fullName}
                          </span>
                          <span className="text-[11px] text-[#546E7A] font-mono flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[#90A4AE]" />
                            {student.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2 px-3 font-mono text-[#2C3E50] font-bold">
                      {student.studentId}
                    </td>

                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-[2px] bg-[#ECEFF1] border border-[#CFD8DC] text-[#37474F] inline-block truncate max-w-[180px] font-medium text-[11px]">
                        {student.department}
                      </span>
                    </td>

                    <td className="py-2 px-3 font-mono">
                      <span className="font-bold text-blue-800">{student.gpa.toFixed(2)}</span>
                    </td>

                    <td className="py-2 px-3 font-mono">
                      {(() => {
                        const att = student.attendance !== undefined ? student.attendance : 88.5;
                        const isLow = att < 75;
                        return (
                          <button
                            onClick={() => onViewAttendance && onViewAttendance(student)}
                            title="View/Edit Semester Attendance & Logs"
                            className={`px-2 py-0.5 rounded-[2px] border font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                              isLow
                                ? 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100'
                                : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                            }`}
                          >
                            <CalendarCheck className="w-3.5 h-3.5" />
                            <span>{att.toFixed(1)}%</span>
                            {isLow && <span className="text-[9px] font-sans bg-rose-200 text-rose-900 px-1 rounded-[2px] font-black">!</span>}
                          </button>
                        );
                      })()}
                    </td>

                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-[2px] border text-[10px] font-bold uppercase font-mono ${getStatusBadgeClass(
                          student.status
                        )}`}
                      >
                        {student.status}
                      </span>
                    </td>

                    <td className="py-2 px-3 font-mono text-slate-600 font-medium">
                      {student.enrollmentYear}
                    </td>

                    <td className="py-2 px-3 text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onView(student)}
                          title="View Profile Dossier"
                          className="p-1 rounded-[2px] border border-slate-300 text-slate-600 hover:text-blue-700 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-700" />
                        </button>

                        {onViewSemesters && (
                          <button
                            onClick={() => onViewSemesters(student)}
                            title="Manage Semester Results & Academic Progress"
                            className="px-2 py-0.5 rounded-[2px] text-blue-800 bg-[#EBF5FB] hover:bg-[#D4E6F1] border border-[#A9CCE3] transition-colors flex items-center gap-1 text-[10px] font-bold font-mono"
                          >
                            <BookOpen className="w-3 h-3 text-blue-700" />
                            <span>Sem {student.semester || student.currentSemester || 4}</span>
                          </button>
                        )}

                        {onViewFees && (
                          <button
                            onClick={() => onViewFees(student)}
                            title="Manage Student Fees & Ledger"
                            className="px-2 py-0.5 rounded-[2px] text-emerald-800 bg-[#E8F8F5] hover:bg-[#D1F2EB] border border-[#A3E4D7] transition-colors flex items-center gap-1 text-[10px] font-bold font-mono"
                          >
                            <CreditCard className="w-3 h-3 text-emerald-700" />
                            <span>Fees</span>
                          </button>
                        )}

                        {onViewAttendance && (
                          <button
                            onClick={() => onViewAttendance(student)}
                            title="Manage Semester Attendance & Edit Audit Logs"
                            className="px-2 py-0.5 rounded-[2px] text-amber-900 bg-[#FEF9E7] hover:bg-[#FCF3CF] border border-[#F9E79F] transition-colors flex items-center gap-1 text-[10px] font-bold font-mono"
                          >
                            <CalendarCheck className="w-3 h-3 text-amber-700" />
                            <span>Att</span>
                          </button>
                        )}

                        {onViewDocs && (
                          <button
                            onClick={() => onViewDocs(student)}
                            title="View Student Documents & Certificates"
                            className="px-2 py-0.5 rounded-[2px] text-indigo-800 bg-[#EEF2FF] hover:bg-[#E0E7FF] border border-[#C7D2FE] transition-colors flex items-center gap-1 text-[10px] font-bold font-mono"
                          >
                            <FileText className="w-3 h-3 text-indigo-700" />
                            <span>Docs</span>
                          </button>
                        )}

                        {canEdit && (
                          <button
                            onClick={() => onEdit(student)}
                            title="Edit Student"
                            className="p-1 rounded-[2px] border border-slate-300 text-slate-600 hover:text-blue-700 hover:bg-slate-100 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5 text-slate-600" />
                          </button>
                        )}

                        <button
                          onClick={() => onOpenPDF(student)}
                          title="Print Transcript"
                          className="p-1 rounded-[2px] border border-slate-300 text-slate-600 hover:text-blue-700 hover:bg-slate-100 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-700" />
                        </button>

                        {canDelete && (
                          <button
                            onClick={() => onDelete(student)}
                            title="Delete Student"
                            className="p-1 rounded-[2px] border border-rose-300 text-rose-700 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
