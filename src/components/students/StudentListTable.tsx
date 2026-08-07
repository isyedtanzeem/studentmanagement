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
  FileText
} from 'lucide-react';

interface StudentListTableProps {
  students: Student[];
  selectedIds: string[];
  onSelectToggle: (id: string) => void;
  onSelectAllToggle: () => void;
  onView: (student: Student) => void;
  onViewDocs?: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onOpenPDF: (student: Student) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (column: string) => void;
}

export const StudentListTable: React.FC<StudentListTableProps> = ({
  students,
  selectedIds,
  onSelectToggle,
  onSelectAllToggle,
  onView,
  onViewDocs,
  onEdit,
  onDelete,
  onOpenPDF,
  sortBy,
  sortOrder,
  onSortChange
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
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold tracking-wider">
            <tr>
              <th className="p-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAllToggle}
                  className="rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th
                onClick={() => onSortChange('fullName')}
                className="p-3.5 cursor-pointer hover:text-blue-600 transition-colors"
              >
                Student Name {renderSortIndicator('fullName')}
              </th>
              <th
                onClick={() => onSortChange('studentId')}
                className="p-3.5 cursor-pointer hover:text-blue-600 transition-colors"
              >
                Roll / Enrollment No {renderSortIndicator('studentId')}
              </th>
              <th
                onClick={() => onSortChange('department')}
                className="p-3.5 cursor-pointer hover:text-blue-600 transition-colors"
              >
                Department / Stream {renderSortIndicator('department')}
              </th>
              <th
                onClick={() => onSortChange('gpa')}
                className="p-3.5 cursor-pointer hover:text-blue-600 transition-colors"
              >
                CGPA (10.0) {renderSortIndicator('gpa')}
              </th>
              <th
                onClick={() => onSortChange('status')}
                className="p-3.5 cursor-pointer hover:text-blue-600 transition-colors"
              >
                Status {renderSortIndicator('status')}
              </th>
              <th
                onClick={() => onSortChange('enrollmentYear')}
                className="p-3.5 cursor-pointer hover:text-blue-600 transition-colors"
              >
                Year {renderSortIndicator('enrollmentYear')}
              </th>
              <th className="p-3.5 text-right pr-6">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {students.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 font-mono">
                  No student records found matching your filters.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const isSelected = selectedIds.includes(student.id);

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-blue-50/50 transition-colors group ${
                      isSelected ? 'bg-blue-50/70' : ''
                    }`}
                  >
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectToggle(student.id)}
                        className="rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            student.photoUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                          }
                          alt={student.fullName}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div>
                          <span
                            onClick={() => onView(student)}
                            className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors block"
                          >
                            {student.fullName}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {student.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-800 font-semibold">
                      {student.studentId}
                    </td>

                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 inline-block truncate max-w-[180px]">
                        {student.department}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono">
                      <span className="font-bold text-blue-700">{student.gpa.toFixed(2)}</span>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold uppercase font-mono ${getStatusBadgeClass(
                          student.status
                        )}`}
                      >
                        {student.status}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-slate-600">
                      {student.enrollmentYear}
                    </td>

                    <td className="p-3.5 text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onView(student)}
                          title="View Profile Dossier"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>

                        {onViewDocs && (
                          <button
                            onClick={() => onViewDocs(student)}
                            title="View Student Documents & Certificates"
                            className="px-2 py-1 rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all flex items-center gap-1 text-[10px] font-bold font-mono"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Docs</span>
                          </button>
                        )}

                        <button
                          onClick={() => onEdit(student)}
                          title="Edit Student"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        >
                          <Edit className="w-4 h-4 text-slate-600" />
                        </button>

                        <button
                          onClick={() => onOpenPDF(student)}
                          title="Print Transcript"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        >
                          <Printer className="w-4 h-4 text-blue-600" />
                        </button>

                        <button
                          onClick={() => onDelete(student)}
                          title="Delete Student"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </button>
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
