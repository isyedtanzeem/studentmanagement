import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  BookOpen,
  Layers,
  Database,
  ShieldCheck,
  Cpu,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Table as TableIcon
} from 'lucide-react';

interface SynopsisReaderViewProps {
  onDownloadDocx: () => void;
  isDownloading: boolean;
}

export const SynopsisReaderView: React.FC<SynopsisReaderViewProps> = ({
  onDownloadDocx,
  isDownloading
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');

  const handlePrintSynopsis = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Hero Action Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Official Academic ERP & SIMS Specification</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            ScholarCore SIMS — Project Synopsis & Technical Specification
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Complete institutional project documentation comprising Project Index, Executive Abstract, Literature Survey, System Objectives, 3-Tier Architecture, Context & Level 1 DFDs, ER Diagram & Relational Schemas, 11 Detailed Functional Modules, Security/RBAC Matrices, and System Deployment Specifications.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onDownloadDocx}
              disabled={isDownloading}
              className="px-6 py-3.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-lg hover:scale-105 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>{isDownloading ? 'Preparing Word DOCX...' : 'Download Word Document (.docx)'}</span>
            </button>

            <button
              onClick={handlePrintSynopsis}
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl transition flex items-center gap-2 border border-white/20 cursor-pointer"
            >
              <Printer className="w-5 h-5 text-slate-300" />
              <span>Print / PDF View</span>
            </button>

            <div className="text-xs text-slate-400 font-mono flex items-center gap-2 pl-2">
              <span>• Version 2.4</span>
              <span>• 10 Chapters</span>
              <span>• Strict OpenXML Format</span>
            </div>
          </div>
        </div>

        <div className="absolute right-4 bottom-2 opacity-5 pointer-events-none hidden lg:block">
          <BookOpen className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Chapter Filter Quick Navigation */}
      <div className="flex flex-wrap gap-2 p-2 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs font-semibold">
        {[
          { id: 'all', label: 'Complete Document (All Chapters)' },
          { id: 'cover', label: '1. Cover & Index' },
          { id: 'arch', label: '2. Architecture & DFDs' },
          { id: 'er', label: '3. ER Diagram & Schema' },
          { id: 'modules', label: '4. 11 Modules' },
          { id: 'rbac', label: '5. Security & RBAC' },
          { id: 'specs', label: '6. System Specs' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
              activeTab === item.id
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* MAIN SYNOPSIS DOCUMENT CONTENT CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-10 text-slate-800">
        {/* ================= CHAPTER 0: COVER & INDEX ================= */}
        {(activeTab === 'all' || activeTab === 'cover') && (
          <section className="space-y-6">
            <div className="text-center border-b border-slate-200 pb-8 space-y-2">
              <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                ACADEMIC ERP & STUDENT INFORMATION MANAGEMENT SYSTEM
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-blue-950">
                SCHOLARCORE SIMS: PROJECT SYNOPSIS
              </h2>
              <p className="text-sm text-teal-700 font-medium max-w-2xl mx-auto">
                Comprehensive Engineering & Functional Specification Document for Higher Education Governance
              </p>

              <div className="pt-4 max-w-xl mx-auto">
                <div className="grid grid-cols-2 text-left text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 gap-2">
                  <div>
                    <span className="font-bold text-slate-600">Software Classification:</span>
                    <p className="text-slate-900 font-medium">Enterprise Institutional ERP</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">Technology Architecture:</span>
                    <p className="text-slate-900 font-medium">React 19 + TypeScript + Express.js</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">Target Environment:</span>
                    <p className="text-slate-900 font-medium">Universities & Colleges</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">Audit Status:</span>
                    <p className="text-emerald-700 font-bold">✓ Verified Release v2.4</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Index Table */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-base">
                <TableIcon className="w-4 h-4 text-blue-600" />
                <h3>Document Index & Table of Contents</h3>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-blue-950 text-white font-semibold">
                    <tr>
                      <th className="p-3 w-16">Index</th>
                      <th className="p-3 w-1/3">Chapter / Section</th>
                      <th className="p-3">Deliverables & Technical Scope Covered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { idx: '1.0', title: 'Executive Summary & Abstract', desc: 'Institutional background, core problem addressed, and strategic academic outcomes.' },
                      { idx: '2.0', title: 'Problem Statement & Motivation', desc: 'Bottlenecks of manual spreadsheets, fragmented fee records, and unaudited attendance updates.' },
                      { idx: '3.0', title: 'Project Objectives & Scope', desc: 'Unified 360° student drawer, 8-semester SGPA/CGPA evaluation, and digital ID card studio.' },
                      { idx: '4.0', title: 'System Architecture & Data Flow', desc: 'Decoupled 3-Tier architecture, Context Level 0 & Level 1 Process DFDs.' },
                      { idx: '5.0', title: 'Entity-Relationship (ER) Model & Schemas', desc: 'Relational diagrams, primary/foreign keys, cardinality mappings, and data dictionary.' },
                      { idx: '6.0', title: '11 Detailed Functional Modules', desc: 'Comprehensive functional breakdown of all 11 core application subsystems.' },
                      { idx: '7.0', title: 'Security, RBAC & Audit Trails', desc: 'JWT authentication, 6-role permission matrix, and immutable attendance/fee change logs.' },
                      { idx: '8.0', title: 'Hardware, Software & Runtime Environment', desc: 'Browser matrix, server runtime, container memory, and network protocol specifications.' },
                      { idx: '9.0', title: 'Testing, Quality Assurance & Verification', desc: 'TypeScript compiler type safety, unit verification, and responsive viewport checks.' },
                      { idx: '10.0', title: 'Future Scope & Project Conclusion', desc: 'AI-driven predictive failure warning models, RFID biometric sync, and final release signoff.' }
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="p-3 font-mono font-bold text-blue-900">{row.idx}</td>
                        <td className="p-3 font-bold text-slate-900">{row.title}</td>
                        <td className="p-3 text-slate-600">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ================= CHAPTER 1 & 2 & 3: ABSTRACT & OBJECTIVES ================= */}
        {(activeTab === 'all' || activeTab === 'cover') && (
          <section className="space-y-6 border-t border-slate-200 pt-8">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-blue-950">
                1.0 Executive Summary & Institutional Abstract
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                ScholarCore SIMS is a cloud-native Student Information Management System & Academic ERP platform engineered to streamline institutional administration, academic governance, student lifecycle management, fee ledger processing, and semester-wise evaluation. Designed with a high-contrast responsive interface and an enterprise-grade backend architecture, ScholarCore bridges the operational divide between students, faculties, department heads, accounts desks, and institutional leadership.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-blue-950">
                2.0 Problem Statement & Critical Bottlenecks
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Conventional educational institutions struggle with severe administrative friction due to disjointed tools and manual record-keeping:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl space-y-1">
                  <span className="font-bold text-red-900">Data Fragmentation & Silos</span>
                  <p className="text-red-800 leading-relaxed">Demographics, grades, fee vouchers, and admission forms live in disparate sheets with high synchronization latency.</p>
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                  <span className="font-bold text-amber-900">Lack of Multi-Semester History</span>
                  <p className="text-amber-800 leading-relaxed">Advisors cannot easily view a student's full 8-semester progression, backlog accumulation, or historical SGPA trends.</p>
                </div>
                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1">
                  <span className="font-bold text-indigo-900">Fee Reconciliation Delays</span>
                  <p className="text-indigo-800 leading-relaxed">Manual receipting leads to disputes between accounts and registrar desks during exam hall ticket clearance.</p>
                </div>
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
                  <span className="font-bold text-purple-900">Unaudited Attendance Adjustments</span>
                  <p className="text-purple-800 leading-relaxed">Attendance overrides for sports or medical leave lack immutable logs tracking who edited the percentage and why.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-blue-950">
                3.0 Core Project Objectives
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-blue-900">360° Student Drawer</div>
                  <p className="text-slate-600">Instant slide-over consolidating biodata, Sem 1-8 grades, fee ledger, documents, and guardian details.</p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-blue-900">8-Semester SGPA/CGPA Ledger</div>
                  <p className="text-slate-600">Automated credit accumulation, 10-point grade conversions, and printable semester grade cards.</p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-blue-900">Audited Attendance Engine</div>
                  <p className="text-slate-600">Enforces 75% exam eligibility threshold and permanently records all percentage modifications in an audit trail.</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= CHAPTER 4: ARCHITECTURE & DFDS ================= */}
        {(activeTab === 'all' || activeTab === 'arch') && (
          <section className="space-y-6 border-t border-slate-200 pt-8">
            <div className="flex items-center gap-2 text-blue-950">
              <Layers className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-bold">4.0 System Architecture & Data Flow Diagrams (DFD)</h3>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              ScholarCore SIMS is architected on a decoupled 3-tier model separating presentation logic, business services, and durable data persistence:
            </p>

            {/* Level 0 Context DFD */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-slate-900">4.1 Context Data Flow Diagram (Level 0 DFD)</h4>
              <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl overflow-x-auto shadow-inner">
                <pre>{`+-----------------------------------------------------------------------------------+
|                             SCHOLARCORE SIMS CONTEXT DFD (LEVEL 0)                |
+-----------------------------------------------------------------------------------+

  [ APPLICANT ] --------( Online Application / Upload Documents )---------> +-------------------+
  [ STUDENT ] <---------( Grade Card / Fee Receipts / Attendance Ledger )-- |                   |
                                                                            |                   |
  [ FACULTY ] ---------( Course Marks / Attendance Entry / Reviews )------> |   SCHOLARCORE     |
  [ HOD / DEAN ] <-----( Promotion Approvals / Department Analytics )------ |   SIMS CORE       |
                                                                            |   ERP SYSTEM      |
  [ ACCOUNTS ] --------( Fee Allocation / Payment Reconciliation )--------> |                   |
  [ REGISTRAR ] <------( Audit Logs / ID Cards / Institutional Reports )--- +-------------------+
+-----------------------------------------------------------------------------------+`}</pre>
              </div>
            </div>

            {/* Level 1 Process DFD */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-slate-900">4.2 Detailed Subsystem Process DFD (Level 1 DFD)</h4>
              <div className="p-4 bg-slate-900 text-cyan-300 font-mono text-xs rounded-2xl overflow-x-auto shadow-inner">
                <pre>{`+-----------------------------------------------------------------------------------+
|                             LEVEL 1 DETAILED PROCESS DFD                          |
+-----------------------------------------------------------------------------------+

  (1.0 Auth & RBAC) --------> Validates User Credentials & Generates Signed JWT Tokens
           |
           v
  (2.0 Student Subsystem) --> Manages Roll Numbers, 360 Profiles & Sem 1-8 Academic Progression
           |
           v
  (3.0 Fee Ledger Engine) --> Computes Semester Dues, Records Installments & Generates Receipts
           |
           v
  (4.0 Attendance Subsystem) -> Evaluates 75% Eligibility & Logs Edits into Audit Trail
           |
           v
  (5.0 Report & Export) ----> Generates Visual Recharts, PDF Dossiers & DOCX Documents
+-----------------------------------------------------------------------------------+`}</pre>
              </div>
            </div>
          </section>
        )}

        {/* ================= CHAPTER 5: ER DIAGRAM & SCHEMA ================= */}
        {(activeTab === 'all' || activeTab === 'er') && (
          <section className="space-y-6 border-t border-slate-200 pt-8">
            <div className="flex items-center gap-2 text-blue-950">
              <Database className="w-5 h-5 text-teal-600" />
              <h3 className="text-xl font-bold">5.0 Entity-Relationship (ER) Diagram & Data Dictionary</h3>
            </div>

            {/* ER Diagram ASCII Graphic */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-slate-900">5.1 Entity-Relationship (ER) Diagram</h4>
              <div className="p-4 bg-slate-900 text-amber-300 font-mono text-xs rounded-2xl overflow-x-auto shadow-inner">
                <pre>{`+-----------------------------------------------------------------------------------+
|                       ENTITY RELATIONSHIP (ER) DIAGRAM                            |
+-----------------------------------------------------------------------------------+

    +------------------+          1:N          +--------------------+
    |   DEPARTMENT     |---------------------> |      FACULTY       |
    +------------------+                       +--------------------+
             | 1:N                                       | 1:N
             v                                           v
    +------------------+          1:N          +--------------------+
    |     STUDENT      |---------------------> |      COURSES       |
    +------------------+                       +--------------------+
       | 1:N        | 1:N                                |
       |            +------------+                       | M:N
       v                         v                       v
+---------------+        +----------------+     +-------------------+
| SEMESTER_REC  |        | FEE_STRUCTURE  |     | COURSE_GRADES     |
+---------------+        +----------------+     +-------------------+
       | 1:N                     | 1:N
       v                         v
+---------------+        +----------------+
| ATTENDANCE_LOG|        | FEE_PAYMENTS   |
+---------------+        +----------------+
+-----------------------------------------------------------------------------------+`}</pre>
              </div>
            </div>

            {/* Data Dictionary Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900">5.2 Relational Data Dictionary & Schema Definitions</h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-semibold">
                    <tr>
                      <th className="p-3">Entity Name</th>
                      <th className="p-3">Primary Key</th>
                      <th className="p-3">Foreign Keys</th>
                      <th className="p-3">Key Attributes & Data Types</th>
                      <th className="p-3">Cardinality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { name: 'STUDENT', pk: 'id (UUID)', fk: 'department_id', attrs: 'studentId (VARCHAR), fullName, email, gpa (FLOAT), attendance (FLOAT), status', card: '1 : N with SemesterRecords, Fees' },
                      { name: 'SEMESTER_RECORD', pk: 'id (UUID)', fk: 'student_id', attrs: 'semester (INT 1-8), academicTerm, sgpa (FLOAT), cgpa, attendancePct, backlogs', card: 'N : 1 with Student' },
                      { name: 'COURSE_GRADE', pk: 'id (UUID)', fk: 'semester_id, course_id', attrs: 'courseCode, courseName, credits (INT), internalMarks, externalMarks, grade', card: 'N : 1 with SemesterRecord' },
                      { name: 'FEE_STRUCTURE', pk: 'id (UUID)', fk: 'student_id', attrs: 'semester (INT), tuitionFee, examFee, labFee, totalAmount, paidAmount, dueAmount', card: 'N : 1 with Student' },
                      { name: 'FEE_TRANSACTION', pk: 'receipt_no', fk: 'fee_structure_id', attrs: 'amountPaid, paymentMode (UPI/Card/Cash), transactionRef, paymentDate, collectedBy', card: 'N : 1 with FeeStructure' },
                      { name: 'ATTENDANCE_LOG', pk: 'id (UUID)', fk: 'student_id', attrs: 'semester (INT), oldPercentage, newPercentage, classesAttended, totalClasses, editedBy, reason, editedAt', card: 'N : 1 with Student' },
                      { name: 'DEPARTMENT', pk: 'code (VARCHAR)', fk: 'hod_id', attrs: 'name, capacity, enrolledCount, facultyCount, budget, labResources', card: '1 : N with Students, Courses' },
                      { name: 'FACULTY', pk: 'id (UUID)', fk: 'department_id', attrs: 'name, designation (Prof/Assoc/Asst), email, phone, workloadHours, coursesAssigned', card: 'N : 1 with Department' },
                      { name: 'ADMISSION_APP', pk: 'id (UUID)', fk: 'department_id', attrs: 'applicantName, email, score, category, documents, status (Approved/Review/Rejected)', card: '1 : 1 upon Enrollment' }
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="p-3 font-bold text-blue-900">{row.name}</td>
                        <td className="p-3 font-mono font-bold text-slate-800">{row.pk}</td>
                        <td className="p-3 font-mono text-slate-600">{row.fk}</td>
                        <td className="p-3 text-slate-700">{row.attrs}</td>
                        <td className="p-3 font-semibold text-teal-700">{row.card}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ================= CHAPTER 6: 11 FUNCTIONAL MODULES ================= */}
        {(activeTab === 'all' || activeTab === 'modules') && (
          <section className="space-y-6 border-t border-slate-200 pt-8">
            <div className="flex items-center gap-2 text-blue-950">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xl font-bold">6.0 Comprehensive 11 Functional Modules Specification</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { num: '01', title: 'Executive Analytics Dashboard', scope: 'High-level executive overview presenting institutional KPIs, total active enrollments, revenue collection stats, average CGPA, and live event timeline.', feat: 'Real-time KPI cards, Recharts admission intake charts, urgent alert notifications, and quick-action shortcuts.' },
                { num: '02', title: 'Student Management & 360° Profile', scope: 'Complete student directory with multi-criteria filtering, search, pagination, bulk selection, CSV import/export, and modal views.', feat: '360° slide-over profile drawer, document verification badges, academic status toggles, and instant PDF profile export.' },
                { num: '03', title: '8-Semester Results Ledger & Grade Cards', scope: 'Detailed semester-wise academic ledger spanning Semesters 1 to 8, tracking SGPA, CGPA, credits registered/earned, and course grade items.', feat: 'Grade-point conversion (10.0 scale), first class distinction tags, backlog flags, and printable official semester grade cards.' },
                { num: '04', title: 'Student Fee Billing & Receipt Vouchers', scope: 'Institutional financial ledger managing 8-semester fee structures (tuition, examination, lab, hostel) and payment transactions.', feat: 'Installment recording, UPI/Card/DD payment mode support, due balance calculation, and printable official receipt vouchers with QR seals.' },
                { num: '05', title: 'Semester Attendance Engine & Audit Logs', scope: 'Comprehensive semester-by-semester attendance tracking engine with automatic 75% examination eligibility threshold compliance.', feat: 'Class attendance percentage calculation, medical condonation workflow, and auditable edit history log tracking changes, editor, and reason.' },
                { num: '06', title: 'Online Admissions & Applicant Pipeline', scope: 'Applicant intake pipeline managing online application submissions, document verification, quota validation, and admission offer letters.', feat: 'Stage progression (Submitted -> Under Review -> Verified -> Approved), merit rank listing, and one-click student matriculation.' },
                { num: '07', title: 'Faculty Directory & Workload Management', scope: 'Faculty roster managing designations (Professor, Associate Prof, Asst Prof), department assignments, teaching workload, and contact profiles.', feat: 'Department-wise faculty filtering, course assignment mapping, qualification tracking, and contact drawers.' },
                { num: '08', title: 'Course Catalog & Curriculum Mapping', scope: 'Institutional syllabus directory managing academic courses, credit hours, lecture/tutorial/practical breakdowns, and prerequisite courses.', feat: 'Semester-wise course mapping, elective vs core tagging, syllabus outline viewer, and department curriculum exports.' },
                { num: '09', title: 'Digital ID Card Generation Studio', scope: 'Automated student identity card designer with customizable institutional themes, portrait photo frames, and dynamic barcode/QR encoders.', feat: 'Single and batch ID card generation, printable dual-sided layouts, security seal overlays, and high-resolution print rendering.' },
                { num: '10', title: 'Batch Promotion & Progression Engine', scope: 'Systematic progression utility promoting student batches across academic semesters and years while enforcing minimum CGPA and backlog criteria.', feat: 'Cohort selection, prerequisite validation, conditional probation promotion, and historical batch migration audit records.' },
                { num: '11', title: 'Reports, Analytics & Multi-Format Exporter', scope: 'Institutional analytics generator providing cross-sectional reports on student demographics, admission yield, fee collection, and grade distributions.', feat: 'Interactive chart visualizations, multi-filter query builder, and one-click export to PDF, Excel CSV, and complete Word DOCX synopsis.' }
              ].map((m, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {m.num}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">{m.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{m.scope}</p>
                    <p className="text-xs text-teal-800 font-semibold pt-1">
                      <span className="text-slate-500 font-normal">Key Innovations: </span>{m.feat}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= CHAPTER 7 & 8: SECURITY & SPECS ================= */}
        {(activeTab === 'all' || activeTab === 'rbac' || activeTab === 'specs') && (
          <section className="space-y-6 border-t border-slate-200 pt-8">
            <div className="flex items-center gap-2 text-blue-950">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-xl font-bold">7.0 Security Architecture & Role-Based Access Control (RBAC)</h3>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-blue-950 text-white font-semibold">
                  <tr>
                    <th className="p-3">User Role</th>
                    <th className="p-3">Dashboard</th>
                    <th className="p-3">Student Profiles</th>
                    <th className="p-3">Grades / SGPA</th>
                    <th className="p-3">Fee Collection</th>
                    <th className="p-3">Attendance & Audit Logs</th>
                    <th className="p-3">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { role: 'Super Admin', dash: 'Full Access', st: 'Full CRUD', gr: 'Full Access', fee: 'Full Access', att: 'Full Access & View All Logs', set: 'Full Access' },
                    { role: 'Academic Dean', dash: 'Full Access', st: 'Read & Approve', gr: 'Read & Approve', fee: 'Read Only', att: 'Read & Approve Condonation', set: 'Restricted' },
                    { role: 'Department HOD', dash: 'Dept Only', st: 'Read & Edit Dept', gr: 'Update Dept Grades', fee: 'Read Only', att: 'Update & View Dept Logs', set: 'None' },
                    { role: 'Faculty / Advisor', dash: 'Dept Only', st: 'Read Dept Students', gr: 'Enter Subject Marks', fee: 'No Access', att: 'Mark Daily/Sem Attendance', set: 'None' },
                    { role: 'Accounts Officer', dash: 'Finance Only', st: 'Read Basic Info', gr: 'No Access', fee: 'Collect Fee & Print Receipts', att: 'No Access', set: 'None' },
                    { role: 'Registrar Desk', dash: 'Institutional', st: 'Full CRUD & ID Cards', gr: 'Read Only', fee: 'Read Ledger', att: 'View Audit Trail & Issue NOC', set: 'Restricted' }
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="p-3 font-bold text-blue-900">{row.role}</td>
                      <td className="p-3 text-slate-700">{row.dash}</td>
                      <td className="p-3 text-slate-700">{row.st}</td>
                      <td className="p-3 text-slate-700">{row.gr}</td>
                      <td className="p-3 text-slate-700">{row.fee}</td>
                      <td className="p-3 font-medium text-emerald-700">{row.att}</td>
                      <td className="p-3 text-slate-500">{row.set}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* System Specs */}
            <div className="space-y-3 pt-4">
              <h3 className="text-xl font-bold text-blue-950">8.0 Hardware & Runtime Environment Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800">Client Compatibility</span>
                  <p className="text-slate-600">Chrome 110+, Firefox 115+, Safari 16+, Edge 110+. Responsive on mobile, tablet, and widescreen 4K displays.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800">Server & Container Runtime</span>
                  <p className="text-slate-600">Node.js 20+, Express.js REST server, Vite 6, containerized deployment on Cloud Run with &lt;1.5s cold-start.</p>
                </div>
              </div>
            </div>

            {/* Signoff Box */}
            <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="font-bold text-blue-950 text-sm">ScholarCore Engineering & Academic Systems Group</div>
                <div className="text-xs text-slate-600">Official Institutional ERP Release • Version 2.4 Production Specification</div>
              </div>

              <button
                onClick={onDownloadDocx}
                disabled={isDownloading}
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download .DOCX</span>
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
