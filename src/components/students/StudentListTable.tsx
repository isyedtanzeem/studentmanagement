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
  GraduationCap
} from 'lucide-react';

interface StudentListTableProps {
  students: Student[];
  selectedIds: string[];
  onSelectToggle: (id: string) => void;
  onSelectAllToggle: () => void;
  onView: (student: Student) => void;
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
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Graduated':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Inactive':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Suspended':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30';
    }
  };

  const renderSortIndicator = (column: string) => {
    if (sortBy !== column) return null;
    return <span className="text-[#D4AF37] ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="bg-[#0d0d12]/90 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-white/5 border-b border-white/10 text-zinc-400 uppercase text-[10px] font-mono tracking-wider">
            <tr>
              <th className="p-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAllToggle}
                  className="rounded border-white/20 bg-black text-[#D4AF37] focus:ring-0 cursor-pointer"
                />
              </th>
              <th
                onClick={() => onSortChange('fullName')}
                className="p-3.5 cursor-pointer hover:text-white transition-colors"
              >
                Student Name {renderSortIndicator('fullName')}
              </th>
              <th
                onClick={() => onSortChange('studentId')}
                className="p-3.5 cursor-pointer hover:text-white transition-colors"
              >
                Roll / Enrollment No {renderSortIndicator('studentId')}
              </th>
              <th
                onClick={() => onSortChange('department')}
                className="p-3.5 cursor-pointer hover:text-white transition-colors"
              >
                Department / Stream {renderSortIndicator('department')}
              </th>
              <th
                onClick={() => onSortChange('gpa')}
                className="p-3.5 cursor-pointer hover:text-white transition-colors"
              >
                CGPA (10.0) {renderSortIndicator('gpa')}
              </th>
              <th
                onClick={() => onSortChange('status')}
                className="p-3.5 cursor-pointer hover:text-white transition-colors"
              >
                Status {renderSortIndicator('status')}
              </th>
              <th
                onClick={() => onSortChange('enrollmentYear')}
                className="p-3.5 cursor-pointer hover:text-white transition-colors"
              >
                Year {renderSortIndicator('enrollmentYear')}
              </th>
              <th className="p-3.5 text-right pr-6">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5 text-zinc-300">
            {students.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-zinc-500 font-mono">
                  No student records found matching your filters.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const isSelected = selectedIds.includes(student.id);

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-white/5 transition-colors group ${
                      isSelected ? 'bg-[#D4AF37]/5' : ''
                    }`}
                  >
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectToggle(student.id)}
                        className="rounded border-white/20 bg-black text-[#D4AF37] focus:ring-0 cursor-pointer"
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
                          className="w-9 h-9 rounded-xl object-cover border border-white/10 flex-shrink-0"
                        />
                        <div>
                          <span
                            onClick={() => onView(student)}
                            className="font-medium text-white hover:text-[#D4AF37] cursor-pointer transition-colors block"
                          >
                            {student.fullName}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                            <Mail className="w-3 h-3 text-zinc-600" />
                            {student.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-zinc-300 font-semibold">
                      {student.studentId}
                    </td>

                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300 inline-block truncate max-w-[180px]">
                        {student.department}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono">
                      <span className="font-bold text-[#D4AF37]">{student.gpa.toFixed(2)}</span>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full border text-[10px] font-medium uppercase font-mono ${getStatusBadgeClass(
                          student.status
                        )}`}
                      >
                        {student.status}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-zinc-400">
                      {student.enrollmentYear}
                    </td>

                    <td className="p-3.5 text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onView(student)}
                          title="View Profile Dossier"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Eye className="w-4 h-4 text-[#D4AF37]" />
                        </button>

                        <button
                          onClick={() => onEdit(student)}
                          title="Edit Student"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Edit className="w-4 h-4 text-blue-400" />
                        </button>

                        <button
                          onClick={() => onOpenPDF(student)}
                          title="Print Transcript"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Printer className="w-4 h-4 text-amber-400" />
                        </button>

                        <button
                          onClick={() => onDelete(student)}
                          title="Delete Student"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" />
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
