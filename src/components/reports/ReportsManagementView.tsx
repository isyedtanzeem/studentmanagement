import React, { useState, useEffect } from 'react';
import {
  FileText,
  BarChart3,
  Users,
  GraduationCap,
  Building2,
  PieChart as PieChartIcon,
  Download,
  Printer,
  Filter,
  RefreshCw,
  TrendingUp,
  Award,
  BookOpen,
  DollarSign,
  CheckCircle2,
  Calendar,
  X,
  FileSpreadsheet,
  FileCode,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  StudentReportData,
  AdmissionReportData,
  DepartmentReportData,
  GenderReportData,
  AlumniReportData,
} from '../../types/report';
import { reportApi } from '../../api/reportApi';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6'];

export const ReportsManagementView: React.FC = () => {
  const [reportType, setReportType] = useState<
    'student' | 'admission' | 'department' | 'gender' | 'alumni' | 'synopsis'
  >('student');

  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [loading, setLoading] = useState<boolean>(true);
  const [downloadingDocx, setDownloadingDocx] = useState<boolean>(false);

  // Direct DOCX Synopsis Download Handler
  const handleDownloadSynopsisDocx = async () => {
    setDownloadingDocx(true);
    try {
      // First attempt: fetch from server endpoint
      const response = await fetch('/api/v1/reports/synopsis-docx');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ScholarCore_Project_Synopsis.docx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showBanner('success', 'ScholarCore Project Synopsis (.docx) downloaded successfully!');
      } else {
        // Fallback: direct link to static generated file
        const a = document.createElement('a');
        a.href = '/ScholarCore_Project_Synopsis.docx';
        a.download = 'ScholarCore_Project_Synopsis.docx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showBanner('success', 'ScholarCore Project Synopsis (.docx) downloaded successfully!');
      }
    } catch (err: any) {
      console.error('Error downloading DOCX:', err);
      // Fallback
      window.open('/ScholarCore_Project_Synopsis.docx', '_blank');
      showBanner('info', 'Opening ScholarCore Project Synopsis (.docx) download link.');
    } finally {
      setDownloadingDocx(false);
    }
  };

  // Report States
  const [studentReport, setStudentReport] = useState<StudentReportData | null>(null);
  const [admissionReport, setAdmissionReport] = useState<AdmissionReportData | null>(null);
  const [departmentReport, setDepartmentReport] = useState<DepartmentReportData | null>(null);
  const [genderReport, setGenderReport] = useState<GenderReportData | null>(null);
  const [alumniReport, setAlumniReport] = useState<AlumniReportData | null>(null);

  const [banner, setBanner] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showBanner = (type: 'success' | 'error' | 'info', message: string) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 4000);
  };

  // Load active report
  const loadReportData = async () => {
    setLoading(true);
    try {
      if (reportType === 'student') {
        const data = await reportApi.getStudentReport({
          department: departmentFilter,
          year: yearFilter,
          status: statusFilter,
        });
        setStudentReport(data);
      } else if (reportType === 'admission') {
        const data = await reportApi.getAdmissionReport({
          department: departmentFilter,
          status: statusFilter,
        });
        setAdmissionReport(data);
      } else if (reportType === 'department') {
        const data = await reportApi.getDepartmentReport();
        setDepartmentReport(data);
      } else if (reportType === 'gender') {
        const data = await reportApi.getGenderReport({
          department: departmentFilter,
        });
        setGenderReport(data);
      } else if (reportType === 'alumni') {
        const data = await reportApi.getAlumniReport({
          department: departmentFilter,
          year: yearFilter,
        });
        setAlumniReport(data);
      }
    } catch (err: any) {
      showBanner('error', err.message || 'Failed to generate requested report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [reportType, departmentFilter, yearFilter, statusFilter]);

  // Export to Excel (CSV formatted file)
  const handleExportExcel = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let fileName = `ScholarCore_${reportType.toUpperCase()}_REPORT_${new Date().toISOString().split('T')[0]}.csv`;

    if (reportType === 'student' && studentReport) {
      headers = ['Student ID', 'Full Name', 'Email', 'Department', 'Academic Year', 'Semester', 'Gender', 'CGPA', 'Fee Status', 'Status'];
      rows = studentReport.studentRecords.map(s => [
        `"${s.studentId}"`,
        `"${s.fullName}"`,
        `"${s.email}"`,
        `"${s.department}"`,
        `"${s.academicYear}"`,
        s.semester,
        s.gender,
        s.cgpa,
        s.feeStatus,
        s.status
      ]);
    } else if (reportType === 'admission' && admissionReport) {
      headers = ['Applicant ID', 'Applicant Name', 'Email', 'Department', 'Category', 'Entrance Score', 'Status', 'Date'];
      rows = admissionReport.admissionRecords.map(a => [
        `"${a.id}"`,
        `"${a.applicantName}"`,
        `"${a.email}"`,
        `"${a.department}"`,
        `"${a.category}"`,
        a.score,
        a.status,
        a.applicationDate
      ]);
    } else if (reportType === 'department' && departmentReport) {
      headers = ['Code', 'Department Name', 'Head of Department', 'Capacity', 'Enrolled Students', 'Fill Rate (%)', 'Faculty Count', 'Courses', 'Avg GPA'];
      rows = departmentReport.departments.map(d => [
        `"${d.code}"`,
        `"${d.name}"`,
        `"${d.headOfDepartment}"`,
        d.capacity,
        d.enrolledStudents,
        d.fillRate,
        d.facultyCount,
        d.courseCount,
        d.avgGpa
      ]);
    } else if (reportType === 'gender' && genderReport) {
      headers = ['Department', 'Total Enrolled', 'Male Count', 'Female Count', 'Other Count', 'Female Percentage (%)'];
      rows = genderReport.byDepartment.map(g => [
        `"${g.department}"`,
        g.total,
        g.male,
        g.female,
        g.other,
        g.femalePercentage
      ]);
    } else if (reportType === 'alumni' && alumniReport) {
      headers = ['Student ID', 'Full Name', 'Email', 'Graduation Year', 'Department', 'Employment Status', 'Company', 'Designation', 'Industry', 'Location'];
      rows = alumniReport.alumniRecords.map(a => [
        `"${a.studentId}"`,
        `"${a.fullName}"`,
        `"${a.email}"`,
        a.graduationYear,
        `"${a.department}"`,
        `"${a.employmentStatus}"`,
        `"${a.currentCompany}"`,
        `"${a.designation}"`,
        `"${a.industry}"`,
        `"${a.workLocation}"`
      ]);
    }

    if (headers.length === 0) return;

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showBanner('success', `Exported ${reportType.toUpperCase()} Report to Excel CSV format successfully.`);
  };

  // Export to PDF / Printable view
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showBanner('error', 'Pop-up blocked. Please allow pop-ups to view PDF report preview.');
      return;
    }

    const title = `${reportType.toUpperCase()} REPORT`;
    const dateStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let tableHtml = '';

    if (reportType === 'student' && studentReport) {
      tableHtml = `
        <h3>Student Roster & Metrics (${studentReport.totalStudents} Records)</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Department</th>
              <th>Year / Sem</th>
              <th>CGPA</th>
              <th>Fee Status</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${studentReport.studentRecords.map(s => `
              <tr>
                <td>${s.studentId}</td>
                <td><strong>${s.fullName}</strong><br><small>${s.email}</small></td>
                <td>${s.department}</td>
                <td>${s.academicYear} / ${s.semester}</td>
                <td><strong>${s.cgpa}</strong></td>
                <td>${s.feeStatus}</td>
                <td>${s.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (reportType === 'admission' && admissionReport) {
      tableHtml = `
        <h3>Admission Applications (${admissionReport.totalApplications} Total, Approval Rate: ${admissionReport.conversionRate}%)</h3>
        <table>
          <thead>
            <tr>
              <th>App ID</th>
              <th>Applicant Name</th>
              <th>Department</th>
              <th>Category</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${admissionReport.admissionRecords.map(a => `
              <tr>
                <td>${a.id}</td>
                <td><strong>${a.applicantName}</strong><br><small>${a.email}</small></td>
                <td>${a.department}</td>
                <td>${a.category}</td>
                <td>${a.score}</td>
                <td>${a.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (reportType === 'department' && departmentReport) {
      tableHtml = `
        <h3>Departmental Infrastructure & Capacity</h3>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Department</th>
              <th>HOD</th>
              <th>Capacity</th>
              <th>Enrolled</th>
              <th>Fill Rate</th>
              <th>Avg GPA</th>
            </tr>
          </thead>
          <tbody>
            ${departmentReport.departments.map(d => `
              <tr>
                <td>${d.code}</td>
                <td><strong>${d.name}</strong></td>
                <td>${d.headOfDepartment}</td>
                <td>${d.capacity}</td>
                <td>${d.enrolledStudents}</td>
                <td>${d.fillRate}%</td>
                <td>${d.avgGpa}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (reportType === 'gender' && genderReport) {
      tableHtml = `
        <h3>Gender Demographic Breakdown (${genderReport.totalStudents} Students)</h3>
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Total Students</th>
              <th>Male</th>
              <th>Female</th>
              <th>Other</th>
              <th>Female %</th>
            </tr>
          </thead>
          <tbody>
            ${genderReport.byDepartment.map(g => `
              <tr>
                <td><strong>${g.department}</strong></td>
                <td>${g.total}</td>
                <td>${g.male}</td>
                <td>${g.female}</td>
                <td>${g.other}</td>
                <td><strong>${g.femalePercentage}%</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (reportType === 'alumni' && alumniReport) {
      tableHtml = `
        <h3>Alumni Career & Placement Roster (${alumniReport.totalAlumni} Alumni, Placement Rate: ${alumniReport.careerSuccessRate}%)</h3>
        <table>
          <thead>
            <tr>
              <th>Roll ID</th>
              <th>Full Name</th>
              <th>Batch</th>
              <th>Department</th>
              <th>Status</th>
              <th>Current Company & Role</th>
            </tr>
          </thead>
          <tbody>
            ${alumniReport.alumniRecords.map(a => `
              <tr>
                <td>${a.studentId}</td>
                <td><strong>${a.fullName}</strong><br><small>${a.email}</small></td>
                <td>${a.graduationYear}</td>
                <td>${a.department}</td>
                <td>${a.employmentStatus}</td>
                <td><strong>${a.designation}</strong> @ ${a.currentCompany}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ScholarCore SIMS - ${title}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; background: #fff; }
            .header { border-bottom: 3px solid #6366f1; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 22px; font-weight: bold; color: #312e81; letter-spacing: -0.5px; }
            .sub { font-size: 11px; color: #64748b; margin-top: 2px; }
            .report-title { font-size: 18px; font-weight: bold; color: #1e1b4b; text-transform: uppercase; margin-bottom: 15px; background: #f8fafc; padding: 10px 15px; border-left: 4px solid #6366f1; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th { background-color: #f1f5f9; color: #334155; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; text-transform: uppercase; font-size: 10px; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #94a3b8; text-align: center; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">ScholarCore Institute of Technology & Sciences</div>
              <div class="sub">Office of Academic Affairs & Registrar • Institutional Report Generator</div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #64748b;">
              Generated: ${dateStr}<br>
              System ID: SCITS-SIMS-REPORTS
            </div>
          </div>

          <div class="report-title">${title}</div>

          ${tableHtml}

          <div class="footer">
            Confidential Academic Document • Generated by ScholarCore SIMS • Page 1 of 1
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Alert */}
      {banner && (
        <div
          className={`p-4 rounded-xl border shadow-sm flex items-start justify-between transition-all ${
            banner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : banner.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center space-x-3">
            {banner.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
            {banner.type === 'error' && <X className="w-5 h-5 text-red-600 flex-shrink-0" />}
            {banner.type === 'info' && <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />}
            <span className="text-sm font-medium">{banner.message}</span>
          </div>
          <button onClick={() => setBanner(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Module Intro */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Reports & Analytics</h1>
              <p className="text-slate-500 text-sm">
                Generate, analyze, and export comprehensive institutional data across Students, Admissions, Departments, Gender Demographics, and Alumni.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadSynopsisDocx}
              disabled={downloadingDocx}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-bold rounded-xl transition shadow-md hover:shadow-lg cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingDocx ? 'Generating DOCX...' : 'Download Project Synopsis (.DOCX)'}</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="inline-flex items-center space-x-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Excel (CSV)</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar for Reports */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-medium overflow-x-auto pb-1">
        <button
          onClick={() => setReportType('student')}
          className={`pb-3 px-1 border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            reportType === 'student'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Report</span>
        </button>

        <button
          onClick={() => setReportType('admission')}
          className={`pb-3 px-1 border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            reportType === 'admission'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Admission Report</span>
        </button>

        <button
          onClick={() => setReportType('department')}
          className={`pb-3 px-1 border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            reportType === 'department'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Department Report</span>
        </button>

        <button
          onClick={() => setReportType('gender')}
          className={`pb-3 px-1 border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            reportType === 'gender'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PieChartIcon className="w-4 h-4" />
          <span>Gender Report</span>
        </button>

        <button
          onClick={() => setReportType('alumni')}
          className={`pb-3 px-1 border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            reportType === 'alumni'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Alumni Report</span>
        </button>

        <button
          onClick={() => setReportType('synopsis')}
          className={`pb-3 px-1 border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            reportType === 'synopsis'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-blue-600 hover:text-blue-800 font-semibold'
          }`}
        >
          <Award className="w-4 h-4 text-blue-600" />
          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
            Project Synopsis (.DOCX)
          </span>
        </button>
      </div>

      {/* Global Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="Computer Science & Engineering">Computer Science & Engg</option>
            <option value="Electronics & Communication">Electronics & Comm</option>
            <option value="Electrical & Electronics">Electrical & Electronics</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Biotechnology & Life Sciences">Biotechnology</option>
            <option value="Department of Management Studies">Management Studies</option>
          </select>

          {(reportType === 'student' || reportType === 'alumni') && (
            <select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Batches / Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>
          )}

          {(reportType === 'student' || reportType === 'admission') && (
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              {reportType === 'student' ? (
                <>
                  <option value="Active">Active</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Suspended">Suspended</option>
                  <option value="On Leave">On Leave</option>
                </>
              ) : (
                <>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Rejected">Rejected</option>
                </>
              )}
            </select>
          )}
        </div>

        <button
          onClick={loadReportData}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* REPORT CONTENT BODY */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 mt-2">Generating institutional analytics and compiling metrics...</p>
        </div>
      ) : (
        <>
          {/* 1. STUDENT REPORT VIEW */}
          {reportType === 'student' && studentReport && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Total Enrolled Students</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{studentReport.totalStudents}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                    {studentReport.activeCount} Active Status
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Average CGPA</span>
                  <div className="text-2xl font-bold text-indigo-600 mt-1">{studentReport.avgCgpa}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {studentReport.topPerformers} High Performers (&ge;9.0)
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Fee Clearance Status</span>
                  <div className="text-2xl font-bold text-emerald-700 mt-1">{studentReport.feePaid} Paid</div>
                  <div className="text-[11px] text-amber-600 mt-0.5">
                    {studentReport.feePending} Pending • {studentReport.feePartial} Partial
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Graduation Rate</span>
                  <div className="text-2xl font-bold text-purple-700 mt-1">{studentReport.graduatedCount} Alumni</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Completed Program</div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Student Enrollment by Department</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={studentReport.byDepartment}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="department" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Students" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Academic Year Breakdown</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={studentReport.byAcademicYear}
                          dataKey="count"
                          nameKey="year"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={entry => `${entry.year}: ${entry.count}`}
                        >
                          {studentReport.byAcademicYear.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Detailed Roster Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-slate-800 text-xs">
                  Detailed Student Records ({studentReport.studentRecords.length} Filtered)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 font-semibold uppercase">
                        <th className="p-3">Student ID</th>
                        <th className="p-3">Full Name</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">Batch & Sem</th>
                        <th className="p-3">CGPA</th>
                        <th className="p-3">Fee Status</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentReport.studentRecords.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-900">{s.studentId}</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{s.fullName}</div>
                            <div className="text-[11px] text-slate-400">{s.email}</div>
                          </td>
                          <td className="p-3 font-medium text-slate-700">{s.department}</td>
                          <td className="p-3 font-semibold text-slate-800">{s.academicYear} (Sem {s.semester})</td>
                          <td className="p-3 font-bold text-indigo-600">{s.cgpa}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.feeStatus === 'Paid'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : s.feeStatus === 'Pending'
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {s.feeStatus}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-700">{s.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. ADMISSION REPORT VIEW */}
          {reportType === 'admission' && admissionReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Total Applications Received</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{admissionReport.totalApplications}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Current Season</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Approved Admissions</span>
                  <div className="text-2xl font-bold text-emerald-600 mt-1">{admissionReport.approvedCount}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                    {admissionReport.conversionRate}% Conversion Rate
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Pending & Under Review</span>
                  <div className="text-2xl font-bold text-amber-600 mt-1">
                    {admissionReport.pendingCount + admissionReport.reviewCount}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Awaiting Document Audit</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Rejected Applications</span>
                  <div className="text-2xl font-bold text-red-600 mt-1">{admissionReport.rejectedCount}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Ineligible / Incomplete</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Departmental Admission Funnel & Approvals</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={admissionReport.byDepartment}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="department" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" fill="#94a3b8" name="Total Applied" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="approved" fill="#10b981" name="Approved" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* 3. DEPARTMENT REPORT VIEW */}
          {reportType === 'department' && departmentReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Academic Departments</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{departmentReport.totalDepartments}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Active Programs</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Total Seat Capacity</span>
                  <div className="text-2xl font-bold text-indigo-600 mt-1">{departmentReport.totalCapacity} Seats</div>
                  <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                    {departmentReport.overallFillRate}% Overall Fill Rate
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Total Enrolled Students</span>
                  <div className="text-2xl font-bold text-emerald-600 mt-1">{departmentReport.totalEnrolled}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Across All Years</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Faculty Strength</span>
                  <div className="text-2xl font-bold text-purple-600 mt-1">
                    {departmentReport.departments.reduce((acc, d) => acc + d.facultyCount, 0)} Professors
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Full-Time Staff</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-slate-800 text-xs">
                  Departmental Metrics & Seat Occupancy
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 font-semibold uppercase">
                        <th className="p-3">Code</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">HOD</th>
                        <th className="p-3">Capacity</th>
                        <th className="p-3">Enrolled</th>
                        <th className="p-3">Seat Occupancy</th>
                        <th className="p-3">Faculty</th>
                        <th className="p-3">Avg GPA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {departmentReport.departments.map(d => (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-800">{d.code}</td>
                          <td className="p-3 font-bold text-slate-900">{d.name}</td>
                          <td className="p-3 font-medium text-slate-700">{d.headOfDepartment}</td>
                          <td className="p-3 text-slate-600">{d.capacity}</td>
                          <td className="p-3 font-bold text-slate-900">{d.enrolledStudents}</td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-indigo-600 text-xs">{d.fillRate}%</span>
                              <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${d.fillRate}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-slate-700">{d.facultyCount}</td>
                          <td className="p-3 font-bold text-emerald-600">{d.avgGpa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. GENDER REPORT VIEW */}
          {reportType === 'gender' && genderReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Total Student Strength</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{genderReport.totalStudents}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Demographics Breakdown</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Female Students</span>
                  <div className="text-2xl font-bold text-pink-600 mt-1">{genderReport.femaleCount}</div>
                  <div className="text-[11px] text-pink-600 font-bold mt-0.5">
                    {genderReport.femaleRatio}% Ratio
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Male Students</span>
                  <div className="text-2xl font-bold text-blue-600 mt-1">{genderReport.maleCount}</div>
                  <div className="text-[11px] text-blue-600 font-bold mt-0.5">
                    {genderReport.maleRatio}% Ratio
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Female Avg GPA</span>
                  <div className="text-2xl font-bold text-purple-600 mt-1">{genderReport.femaleAvgGpa}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Male Avg GPA: {genderReport.maleAvgGpa}</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Gender Ratio Across Departments</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={genderReport.byDepartment}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="department" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="female" fill="#ec4899" name="Female Students" stackId="a" />
                      <Bar dataKey="male" fill="#3b82f6" name="Male Students" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* 5. ALUMNI REPORT VIEW */}
          {reportType === 'alumni' && alumniReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Registered Alumni</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{alumniReport.totalAlumni}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Global Cohort</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Career Success Rate</span>
                  <div className="text-2xl font-bold text-emerald-600 mt-1">{alumniReport.careerSuccessRate}%</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                    {alumniReport.employed} Employed • {alumniReport.founders} Founders
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Higher Education Scholars</span>
                  <div className="text-2xl font-bold text-purple-600 mt-1">{alumniReport.higherEd} Scholars</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Cambridge, Oxford, IISc</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Total Alumni Donations</span>
                  <div className="text-2xl font-bold text-amber-600 mt-1">
                    ₹{alumniReport.totalDonations.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-amber-600 font-semibold mt-0.5">Research & Endowments</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-slate-800 text-xs">
                  Alumni Placement Roster
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 font-semibold uppercase">
                        <th className="p-3">Roll ID</th>
                        <th className="p-3">Full Name</th>
                        <th className="p-3">Graduation Year</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">Employment Status</th>
                        <th className="p-3">Company & Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {alumniReport.alumniRecords.map(a => (
                        <tr key={a.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-800">{a.studentId}</td>
                          <td className="p-3 font-bold text-slate-900">{a.fullName}</td>
                          <td className="p-3 font-semibold text-indigo-600">{a.graduationYear}</td>
                          <td className="p-3 text-slate-700">{a.department}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                a.employmentStatus === 'Employed'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : a.employmentStatus === 'Self-Employed / Founder'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-purple-50 text-purple-700'
                              }`}
                            >
                              {a.employmentStatus}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-800">
                            {a.designation} <span className="text-slate-400">@</span> {a.currentCompany}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SYNOPSIS TAB VIEW */}
          {reportType === 'synopsis' && (
            <div className="space-y-6">
              {/* Hero Banner with Download Trigger */}
              <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <div className="relative z-10 max-w-3xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wider uppercase">
                    <Award className="w-3.5 h-3.5" />
                    <span>Official Project Documentation & Technical Synopsis</span>
                  </div>

                  <h2 className="text-3xl font-black tracking-tight text-white">
                    ScholarCore SIMS — Project Synopsis (DOCX)
                  </h2>

                  <p className="text-slate-300 text-sm leading-relaxed">
                    A comprehensive, publication-ready project synopsis document formatted in Microsoft Word (.docx) format. Encompasses Executive Abstract, Problem Statement, System Objectives, Multi-Tier Architecture, 11 Detailed Functional Modules, TypeScript Data Schemas, RBAC Security Protocols, Hardware/Software Environment Specifications, and Future Scope.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      onClick={handleDownloadSynopsisDocx}
                      disabled={downloadingDocx}
                      className="px-6 py-3.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-lg hover:scale-105 flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-5 h-5" />
                      <span>{downloadingDocx ? 'Generating DOCX...' : 'Download Complete Synopsis (.docx)'}</span>
                    </button>

                    <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                      <span>• File Size: ~19 KB</span>
                      <span>• Format: Office Open XML (.docx)</span>
                      <span>• Ver: 2.4</span>
                    </div>
                  </div>
                </div>

                {/* Decorative background visual */}
                <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none">
                  <FileText className="w-72 h-72 text-white" />
                </div>
              </div>

              {/* Synopsis Outline Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                    01
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Executive Abstract & Problem Scope</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Explores institutional data fragmentation, multi-semester evaluation bottlenecks, unrecorded attendance changes, and manual billing reconciliation.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    02
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">11 Functional Modules Specification</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Details Student Management, 8-Semester Results (SGPA/CGPA), Fee Billing Ledgers, Attendance Engine with Audit Trail, Admissions, Faculty, ID Card Studio, and Promotions.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                    03
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Architecture & Data Schemas</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Documents React 19 + TypeScript + Express.js multi-tier architecture, JWT role-based access control, schema structures, and future AI enhancements.
                  </p>
                </div>
              </div>

              {/* Synopsis Table of Contents Preview */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Synopsis Table of Contents & Structure</h3>
                    <p className="text-xs text-slate-500">As formatted inside the generated Word (.docx) document</p>
                  </div>

                  <button
                    onClick={handleDownloadSynopsisDocx}
                    className="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .DOCX</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="font-bold text-blue-900 font-sans">Section 1 to 5: Core Conceptual Framework</div>
                    <div className="text-slate-700">1. Executive Summary & Abstract</div>
                    <div className="text-slate-700">2. Problem Statement & Institutional Motivation</div>
                    <div className="text-slate-700">3. Project Objectives & Key Technical Goals</div>
                    <div className="text-slate-700">4. System Architecture (Frontend & Backend Tiers)</div>
                    <div className="text-slate-700">5. 11 Detailed Functional Modules Specification</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="font-bold text-indigo-900 font-sans">Section 6 to 10: Technical Specifications</div>
                    <div className="text-slate-700">6. Data Modeling & TypeScript Entity Schemas</div>
                    <div className="text-slate-700">7. Security, RBAC & Immutable Audit Trails</div>
                    <div className="text-slate-700">8. Hardware, Software & Deployment Specs</div>
                    <div className="text-slate-700">9. Future Scope & Predictive AI Capabilities</div>
                    <div className="text-slate-700">10. Conclusion & Formal Verification Signoff</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
