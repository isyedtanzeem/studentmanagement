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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0f0f15] border border-white/10 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white serif-font">Bulk Import Students</h3>
              <p className="text-xs text-zinc-400">Upload CSV file or paste formatted CSV student records</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {importResult ? (
            <div className="space-y-4 text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl text-white font-semibold serif-font">Bulk Import Completed</h4>
              <p className="text-zinc-300 font-mono text-sm">
                Successfully imported <strong className="text-emerald-400">{importResult.successCount}</strong> student records.
              </p>

              {importResult.errors.length > 0 && (
                <div className="text-left bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl space-y-2 text-rose-300 font-mono">
                  <p className="font-semibold text-rose-400">Warnings / Skipped Records ({importResult.failedCount}):</p>
                  <ul className="list-disc list-inside space-y-1">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f27] text-black font-semibold transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* File Drop & Template Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <span className="text-white font-semibold block">Upload CSV File</span>
                    <span className="text-zinc-400">Drag & drop or browse your local system</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white cursor-pointer transition-all flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#D4AF37]" />
                    <span>Choose CSV File</span>
                    <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <button
                    onClick={handleDownloadSample}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Sample Template</span>
                  </button>
                </div>
              </div>

              {/* Paste Text Area */}
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Or Paste CSV Data Directly:</label>
                <textarea
                  rows={5}
                  value={csvText}
                  onChange={handleTextChange}
                  placeholder={`Full Name,Email,Phone,Department,Gender,Enrollment Year,GPA,Status\nJane Doe,jane.d@scholarcore.edu,+1 (555) 123-4567,Computer Science & Engineering,Female,2024,3.90,Active`}
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {parseError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Validation Preview Table */}
              {parsedStudents.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold">
                      Validation Preview ({parsedStudents.length} Students Detected)
                    </h4>
                    <span className="text-emerald-400 font-mono text-[11px]">Ready for import</span>
                  </div>

                  <div className="border border-white/10 rounded-xl overflow-hidden max-h-48 overflow-y-auto font-mono text-[11px]">
                    <table className="w-full text-left">
                      <thead className="bg-white/5 text-zinc-400 uppercase text-[10px]">
                        <tr>
                          <th className="p-2">#</th>
                          <th className="p-2">Full Name</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">Department</th>
                          <th className="p-2">Year</th>
                          <th className="p-2">GPA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-zinc-300">
                        {parsedStudents.map((s, idx) => (
                          <tr key={idx} className="hover:bg-white/5">
                            <td className="p-2 text-zinc-500">{idx + 1}</td>
                            <td className="p-2 text-white font-medium">{s.fullName}</td>
                            <td className="p-2 text-zinc-400">{s.email}</td>
                            <td className="p-2 text-zinc-400 truncate max-w-[150px]">{s.department}</td>
                            <td className="p-2 text-white">{s.enrollmentYear}</td>
                            <td className="p-2 text-[#D4AF37]">{s.gpa}</td>
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
          <div className="p-6 border-t border-white/10 bg-black/60 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-medium transition-all"
            >
              Cancel
            </button>

            <button
              onClick={handleExecuteImport}
              disabled={loading || parsedStudents.length === 0}
              className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c49f27] text-black font-semibold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
