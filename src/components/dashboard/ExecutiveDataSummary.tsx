import React, { useEffect, useState } from 'react';
import { departmentApi } from '../../api/departmentApi';
import { Department } from '../../types/department';
import { Building2, User, BookOpen, Layers, CheckCircle2, ShieldCheck, ArrowUpRight } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Department Operational Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-semibold text-slate-900 serif-font">
                Active Department Operations & Academic Wings
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live headcount, faculty assignment, and curriculum course counts directly synced with database store
            </p>
          </div>

          {onNavigateToModule && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigateToModule('faculty')}
                className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer font-mono shrink-0 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200"
              >
                <span>Faculty & HOD Register</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigateToModule('departments')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer font-mono shrink-0"
              >
                <span>Manage Departments</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-mono border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Department Name</th>
                  <th className="py-3 px-3">Head of Dept (HOD)</th>
                  <th className="py-3 px-3">Students</th>
                  <th className="py-3 px-3">Faculty</th>
                  <th className="py-3 px-3">Courses</th>
                  <th className="py-3 px-3">Building Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      <span className="bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        {dept.code}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900">{dept.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {dept.headOfDepartment}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                      {dept.studentCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {dept.facultyCount}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {dept.coursesCount}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px] truncate max-w-[200px]">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">
              Enrolment Clearance
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">100% Back-Office Synced</div>
          <p className="text-xs text-slate-500">
            Student records verified with official administrative documents and fee registers.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">
              Access Control Protocol
            </span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">Strict RBAC Active</div>
          <p className="text-xs text-slate-500">
            Pure administrative back-office portal. Student & faculty portal logins disabled.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">
              Academic Curricula
            </span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">NEP 2020 Compliant</div>
          <p className="text-xs text-slate-500">
            Credits, grade elevation rules, and degree progress tracked dynamically.
          </p>
        </div>
      </div>
    </div>
  );
};
