import React from 'react';
import { Student } from '../../types/student';
import { X, Printer, GraduationCap, ShieldCheck, Download, QrCode } from 'lucide-react';

interface StudentPDFReportModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentPDFReportModal: React.FC<StudentPDFReportModalProps> = ({
  student,
  isOpen,
  onClose
}) => {
  if (!isOpen || !student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0a0a0e] border border-white/10 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* Header toolbar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/60 print:hidden">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-base font-semibold text-white serif-font">
              Official Academic Transcript & Dossier
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c49f27] text-black font-semibold rounded-xl text-xs transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Transcript Document Container */}
        <div id="printable-transcript" className="p-8 overflow-y-auto space-y-6 text-xs bg-white text-black font-sans print:p-0">
          {/* Official Letterhead */}
          <div className="border-b-2 border-black/80 pb-6 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-900/10 border-2 border-amber-600/40 flex items-center justify-center text-amber-700 font-bold text-2xl serif-font">
                S
              </div>
              <div>
                <h1 className="text-xl font-bold text-black uppercase tracking-wider serif-font">
                  Bharatiya National University
                </h1>
                <p className="text-[10px] text-gray-600 tracking-wide font-mono">
                  Office of the Academic Registrar • ScholarCore SIMS Portal
                </p>
                <p className="text-[10px] text-gray-500 italic mt-0.5">
                  Official Academic Transcript & Enrollment Dossier (NEP 2020 Compliant)
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-[10px] text-gray-600 space-y-1">
              <div className="font-bold text-black">Doc Ref: SCU-TR-{student.studentId}</div>
              <div>Issued Date: {new Date().toLocaleDateString()}</div>
              <div className="text-emerald-700 font-semibold uppercase">● Digitally Verified</div>
            </div>
          </div>

          {/* Student Profile Overview */}
          <div className="grid grid-cols-3 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-4 col-span-2">
              <img
                src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                alt={student.fullName}
                className="w-16 h-16 rounded-lg object-cover border border-gray-300 shadow-sm"
              />
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-black serif-font">{student.fullName}</h2>
                <p className="text-xs font-mono text-gray-700">Student ID: {student.studentId}</p>
                <p className="text-xs text-gray-600">{student.department}</p>
              </div>
            </div>

            <div className="border-l border-gray-300 pl-4 space-y-1 text-[11px] font-mono">
              <div><span className="text-gray-500">Cumulative CGPA:</span> <strong className="text-black">{student.gpa.toFixed(2)} / 10.00</strong></div>
              <div><span className="text-gray-500">Status:</span> <strong className="text-emerald-700 uppercase">{student.status}</strong></div>
              <div><span className="text-gray-500">Enrollment Year:</span> <strong className="text-black">{student.enrollmentYear}</strong></div>
              <div><span className="text-gray-500">Gender:</span> <strong className="text-black">{student.gender}</strong></div>
            </div>
          </div>

          {/* Academic Records Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-black uppercase text-[11px] tracking-wider border-b border-black pb-1">
              Official Course Work & Grade Ledger
            </h3>
            <table className="w-full text-left border-collapse font-mono text-[11px]">
              <thead>
                <tr className="bg-gray-100 text-gray-700 border-b border-gray-300 uppercase text-[10px]">
                  <th className="p-2">Course Code</th>
                  <th className="p-2">Course Title</th>
                  <th className="p-2">Credits</th>
                  <th className="p-2">Grade</th>
                  <th className="p-2 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                <tr>
                  <td className="p-2 font-bold">CS-101</td>
                  <td className="p-2">Introduction to Computer Science</td>
                  <td className="p-2">4.0</td>
                  <td className="p-2 font-bold text-emerald-800">A</td>
                  <td className="p-2 text-right font-bold">16.0</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">MATH-201</td>
                  <td className="p-2">Linear Algebra & Vector Calculus</td>
                  <td className="p-2">3.0</td>
                  <td className="p-2 font-bold text-emerald-800">A-</td>
                  <td className="p-2 text-right font-bold">11.1</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">CS-301</td>
                  <td className="p-2">Data Structures & Algorithms</td>
                  <td className="p-2">4.0</td>
                  <td className="p-2 font-bold text-emerald-800">A</td>
                  <td className="p-2 text-right font-bold">16.0</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">ENG-204</td>
                  <td className="p-2">Software Testing & Quality Assurance</td>
                  <td className="p-2">3.0</td>
                  <td className="p-2 font-bold text-blue-800">B+</td>
                  <td className="p-2 text-right font-bold">9.9</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Contact & Guardian Details */}
          <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 font-mono text-[11px]">
            <div>
              <span className="text-gray-500 block uppercase text-[9px] font-bold">Student Contact</span>
              <div>Email: {student.email}</div>
              <div>Phone: {student.phone || 'N/A'}</div>
              <div>Address: {student.address || 'On File'}</div>
            </div>

            <div>
              <span className="text-gray-500 block uppercase text-[9px] font-bold">Guardian Contact</span>
              <div>Name: {student.guardianName || 'N/A'}</div>
              <div>Phone: {student.guardianPhone || 'N/A'}</div>
            </div>
          </div>

          {/* Validation Seal Footer */}
          <div className="border-t-2 border-gray-300 pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-8 border-b border-gray-400 w-48" />
              <p className="text-[10px] text-gray-600 font-serif italic">Registrar Signature & Official Seal</p>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
              <QrCode className="w-10 h-10 text-gray-800" />
              <div className="text-[9px] font-mono text-gray-600 leading-tight">
                <div>SCU Cryptographic Seal</div>
                <div>Hash: 8f9a2b4e...1c3d</div>
                <div className="text-emerald-700 font-bold">STATUS: VALID</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
