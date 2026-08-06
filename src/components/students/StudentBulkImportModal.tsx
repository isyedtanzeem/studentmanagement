import React, { useState } from 'react';
import { Student } from '../../types/student';
import { X, FileSpreadsheet, Upload, Download, CheckCircle2, AlertTriangle, Sparkles, FileText } from 'lucide-react';

interface StudentBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (students: Partial<Student>[]) => Promise<{ successCount: number; failedCount: number; errors: string[] }>;
}

const SAMPLE_CSV = `Full Name,Email,Phone,Department,Gender,Enrollment Year,GPA,Status
Liam Neeson,liam.n@scholarcore.edu,+1 (555) 111-2222,Computer Science & Engineering,Male,2024,3.85,Active
Sophia Chen,sophia.c@scholarcore.edu,+1 (555) 333-4444,Business Administration,Female,2023,3.92,Active
Marcus Vance,marcus.v@scholarcore.edu,+1 (555) 555-6666,Electrical Engineering,Male,2024,3.60,Active
Amara Okafor,amara.o@scholarcore.edu,+1 (555) 777-8888,Biotechnology & Life Sciences,Female,2022,3.98,Active`;

export const StudentBulkImportModal: React.FC<StudentBulkImportModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [csvText, setCsvText] = useState('');
  const [parsedStudents, setParsedStudents] = useState<Partial<Student>[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ successCount: number; failedCount: number; errors: string[] } | null>(null);

  if (!isOpen) return null;

  const parseCSV = (text: string) => {
    try {
      setParseError(null);
      const lines = text.trim().split('\n').filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        setParseError('CSV must contain a header row and at least one student data row.');
        setParsedStudents([]);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const parsed: Partial<Student>[] = [];

      for (let i = 1; i < lines.length; i++) {
        // Handle quoted CSV split
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        if (values.length >= 2) {
          const student: Partial<Student> = {
            fullName: values[0] || `Student ${i}`,
            email: values[1] || `student${i}@scholarcore.edu`,
            phone: values[2] || '',
            department: values[3] || 'Computer Science & Engineering',
            gender: (values[4] as any) || 'Male',
            enrollmentYear: Number(values[5]) || 2024,
            gpa: Number(values[6]) || 3.50,
            status: (values[7] as any) || 'Active'
          };
          parsed.push(student);
        }
      }

      setParsedStudents(parsed);
    } catch (err: any) {
      setParseError('Failed to parse CSV format. Please ensure valid comma-separated format.');
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCsvText(val);
    parseCSV(val);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCsvText(content);
        parseCSV(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scholarcore_student_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExecuteImport = async () => {
    if (parsedStudents.length === 0) return;
    setLoading(true);
    try {
      const res = await onImport(parsedStudents);
      setImportResult(res);
    } catch (err: any) {
      setParseError(err.message || 'Import execution failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Bulk Import Students</h3>
              <p className="text-xs text-slate-500">Upload CSV file or paste formatted CSV student records</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {importResult ? (
            <div className="space-y-4 text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl text-slate-900 font-bold">Bulk Import Completed</h4>
              <p className="text-slate-600 font-mono text-sm">
                Successfully imported <strong className="text-emerald-600">{importResult.successCount}</strong> student records.
              </p>

              {importResult.errors.length > 0 && (
                <div className="text-left bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-2 text-rose-700 font-mono">
                  <p className="font-semibold text-rose-800">Warnings / Skipped Records ({importResult.failedCount}):</p>
                  <ul className="list-disc list-inside space-y-1">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* File Drop & Template Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="text-slate-900 font-semibold block">Upload CSV File</span>
                    <span className="text-slate-500">Drag & drop or browse your local system</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-700 cursor-pointer transition-all flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Choose CSV File</span>
                    <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <button
                    onClick={handleDownloadSample}
                    className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-700 hover:text-slate-900 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Sample Template</span>
                  </button>
                </div>
              </div>

              {/* Paste Text Area */}
              <div>
                <label className="block text-slate-700 mb-1 font-medium">Or Paste CSV Data Directly:</label>
                <textarea
                  rows={5}
                  value={csvText}
                  onChange={handleTextChange}
                  placeholder={`Full Name,Email,Phone,Department,Gender,Enrollment Year,GPA,Status\nJane Doe,jane.d@scholarcore.edu,+1 (555) 123-4567,Computer Science & Engineering,Female,2024,3.90,Active`}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-mono placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {parseError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Validation Preview Table */}
              {parsedStudents.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-slate-900 font-bold">
                      Validation Preview ({parsedStudents.length} Students Detected)
                    </h4>
                    <span className="text-emerald-700 font-mono text-[11px] font-semibold">Ready for import</span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto font-mono text-[11px]">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                        <tr>
                          <th className="p-2">#</th>
                          <th className="p-2">Full Name</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">Department</th>
                          <th className="p-2">Year</th>
                          <th className="p-2">GPA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                        {parsedStudents.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 text-slate-400">{idx + 1}</td>
                            <td className="p-2 text-slate-900 font-medium">{s.fullName}</td>
                            <td className="p-2 text-slate-500">{s.email}</td>
                            <td className="p-2 text-slate-500 truncate max-w-[150px]">{s.department}</td>
                            <td className="p-2 text-slate-900">{s.enrollmentYear}</td>
                            <td className="p-2 text-blue-700 font-semibold">{s.gpa}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!importResult && (
          <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-medium transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleExecuteImport}
              disabled={loading || parsedStudents.length === 0}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Import {parsedStudents.length} Students</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
