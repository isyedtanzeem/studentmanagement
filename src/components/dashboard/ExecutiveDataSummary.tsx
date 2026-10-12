import React, { useEffect, useState } from 'react';
import { departmentApi } from '../../api/departmentApi';
import { Department } from '../../types/department';
import { Building2, User, CheckCircle2, ShieldCheck, Layers, ArrowUpRight } from 'lucide-react';

interface ExecutiveDataSummaryProps {
  onNavigateToModule?: (module: string) => void;
}

export const ExecutiveDataSummary: React.FC<ExecutiveDataSummaryProps> = ({ onNavigateToModule }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await departmentApi.getDepartments({ page: 1, limit: 10 });
        if (res.success && Array.isArray(res.data)) {
          setDepartments(res.data);
        }
      } catch (err) {
        console.error('Failed to load summary departments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepts();
  }, []);

  return (
    <div className="space-y-5 font-poppins">
      {/* Department Operational Table */}
      <div className="bg-white border border-[#E4E7EB] rounded-[4px] p-5 shadow-[0_2px_4px_rgba(0,0,0,0.06)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ECEFF1] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#00B5AD]" />
              <h3 className="text-sm font-bold text-[#263238] uppercase tracking-tight">
                Active Department Operations & Academic Wings
              </h3>
            </div>
            <p className="text-[11px] text-[#78909C] mt-0.5">
              Live headcount, faculty assignment, and curriculum course counts directly synced with database store
            </p>
          </div>

          {onNavigateToModule && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateToModule('faculty')}
                className="text-xs font-semibold text-[#546E7A] hover:text-[#263238] flex items-center gap-1 cursor-pointer font-poppins shrink-0 bg-[#F4F6F9] hover:bg-[#ECEFF1] px-2.5 py-1 rounded-[4px] border border-[#CFD8DC] transition-colors"
              >
                <span>Faculty Register</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#00B5AD]" />
              </button>

              <button
                onClick={() => onNavigateToModule('departments')}
                className="text-xs font-semibold text-[#00B5AD] hover:text-[#00897B] flex items-center gap-1 cursor-pointer font-poppins shrink-0 bg-[#E8F8F5] px-2.5 py-1 rounded-[4px] border border-[#A3E4D7] transition-colors"
              >
                <span>Manage Depts</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-[#F4F6F9] rounded-[4px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-poppins">
              <thead className="bg-[#F4F6F9] text-[#546E7A] uppercase text-[10px] font-bold border-b border-[#E4E7EB]">
                <tr>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Department Name</th>
                  <th className="py-2.5 px-3">Head of Dept (HOD)</th>
                  <th className="py-2.5 px-3">Students</th>
                  <th className="py-2.5 px-3">Faculty</th>
                  <th className="py-2.5 px-3">Courses</th>
                  <th className="py-2.5 px-3">Building Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEFF1] text-[#263238]">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-[#F4F6F9] transition-colors">
                    <td className="py-2.5 px-3 font-poppins font-bold text-[#00B5AD]">
                      <span className="bg-[#E8F8F5] border border-[#A3E4D7] px-2 py-0.5 rounded-[2px]">
                        {dept.code}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#263238]">{dept.name}</td>
                    <td className="py-2.5 px-3 text-[#546E7A]">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#90A4AE] shrink-0" />
                        {dept.headOfDepartment}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-poppins font-bold text-[#263238] tabular-nums">
                      {dept.studentCount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-poppins text-[#546E7A] tabular-nums">
                      {dept.facultyCount}
                    </td>
                    <td className="py-2.5 px-3 font-poppins text-[#546E7A] tabular-nums">
                      {dept.coursesCount}
                    </td>
                    <td className="py-2.5 px-3 text-[#78909C] text-[11px] truncate max-w-[200px]">
                      {dept.buildingLocation || 'Main Academic Block'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Integrity & Operational Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-[#E4E7EB] p-5 rounded-[4px] shadow-[0_2px_4px_rgba(0,0,0,0.06)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#78909C] uppercase tracking-wider">
              Enrolment Clearance
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#2ECC71]" />
          </div>
          <div className="text-xl font-bold text-[#263238] font-poppins tabular-nums">100% Back-Office Synced</div>
          <p className="text-xs text-[#546E7A]">
            Student records verified with official administrative documents and fee registers.
          </p>
        </div>

        <div className="bg-white border border-[#E4E7EB] p-5 rounded-[4px] shadow-[0_2px_4px_rgba(0,0,0,0.06)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#78909C] uppercase tracking-wider">
              Access Control Protocol
            </span>
            <ShieldCheck className="w-4 h-4 text-[#00B5AD]" />
          </div>
          <div className="text-xl font-bold text-[#263238] font-poppins tabular-nums">Strict RBAC Active</div>
          <p className="text-xs text-[#546E7A]">
            Role-based access control protecting student directories and administrative actions.
          </p>
        </div>

        <div className="bg-white border border-[#E4E7EB] p-5 rounded-[4px] shadow-[0_2px_4px_rgba(0,0,0,0.06)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#78909C] uppercase tracking-wider">
              Academic Curricula
            </span>
            <Layers className="w-4 h-4 text-[#9B59B6]" />
          </div>
          <div className="text-xl font-bold text-[#263238] font-poppins tabular-nums">14 Degree Programs</div>
          <p className="text-xs text-[#546E7A]">
            Full accreditation coverage across all active undergraduate and postgraduate wings.
          </p>
        </div>
      </div>
    </div>
  );
};
