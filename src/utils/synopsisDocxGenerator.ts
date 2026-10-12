import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  Header,
  Footer,
  PageNumber
} from 'docx';

export async function generateProjectSynopsisDocx(): Promise<Buffer> {
  const primaryColor = '1E3A8A'; // Deep Navy Blue (#1E3A8A)
  const secondaryColor = '0D9488'; // Deep Teal (#0D9488)
  const darkTextColor = '1E293B'; // Slate 800 (#1E293B)
  const mutedTextColor = '64748B'; // Slate 500 (#64748B)
  const altRowBg = 'F8FAFC'; // Slate 50 (#F8FAFC)
  const borderColor = 'CBD5E1'; // Slate 300 (#CBD5E1)

  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
    left: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
    right: { style: BorderStyle.SINGLE, size: 1, color: borderColor }
  };

  // Helper: Chapter / Major Section Title
  const createChapterTitle = (chapterNum: string, title: string) => {
    return [
      new Paragraph({
        spacing: { before: 360, after: 80 },
        children: [
          new TextRun({
            text: `CHAPTER ${chapterNum}: ${title.toUpperCase()}`,
            bold: true,
            size: 24,
            color: primaryColor,
            font: 'Poppins'
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 0, after: 160 },
        children: [
          new TextRun({
            text: '_________________________________________________________________________________',
            color: borderColor,
            size: 14
          })
        ]
      })
    ];
  };

  // Helper: Subheading Level 2
  const createSubheading = (sectionNum: string, title: string) => {
    return new Paragraph({
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({
          text: `${sectionNum} ${title}`,
          bold: true,
          size: 21,
          color: secondaryColor,
          font: 'Poppins'
        })
      ]
    });
  };

  // Helper: Standard Body Paragraph
  const createBodyParagraph = (text: string, isItalic = false) => {
    return new Paragraph({
      spacing: { before: 60, after: 80, line: 280 },
      children: [
        new TextRun({
          text,
          size: 20,
          color: darkTextColor,
          italics: isItalic,
          font: 'Poppins'
        })
      ]
    });
  };

  // Helper: Bullet list item
  const createBullet = (label: string, description: string) => {
    return new Paragraph({
      bullet: { level: 0 },
      spacing: { before: 40, after: 60, line: 270 },
      children: [
        new TextRun({
          text: `${label}: `,
          bold: true,
          size: 20,
          color: primaryColor,
          font: 'Poppins'
        }),
        new TextRun({
          text: description,
          size: 20,
          color: darkTextColor,
          font: 'Poppins'
        })
      ]
    });
  };

  // Helper: Code / Diagram / Text Block
  const createCodeBlock = (lines: string[]) => {
    return lines.map((line, idx) =>
      new Paragraph({
        spacing: { before: idx === 0 ? 80 : 20, after: idx === lines.length - 1 ? 80 : 20, line: 220 },
        shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
        children: [
          new TextRun({
            text: line.length > 0 ? line : ' ',
            font: 'Poppins',
            size: 17,
            color: '0F172A'
          })
        ]
      })
    );
  };

  // Helper: Clean Table Builder (splits multiline cells into separate clean paragraphs)
  const createCustomTable = (
    headers: string[],
    rowsData: string[][],
    colWidths: number[]
  ) => {
    const headerRow = new TableRow({
      tableHeader: true,
      children: headers.map((headerText, i) =>
        new TableCell({
          width: { size: colWidths[i] || 25, type: WidthType.PERCENTAGE },
          shading: { fill: primaryColor, type: ShadingType.CLEAR },
          borders: cellBorder,
          margins: { top: 120, bottom: 120, left: 120, right: 120 },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: headerText,
                  bold: true,
                  size: 18,
                  color: 'FFFFFF',
                  font: 'Poppins'
                })
              ]
            })
          ]
        })
      )
    });

    const bodyRows = rowsData.map((rowArr, rowIdx) => {
      const fillBg = rowIdx % 2 === 0 ? 'FFFFFF' : altRowBg;
      return new TableRow({
        children: rowArr.map((cellText, cellIdx) => {
          // Cleanly handle newlines by creating multiple Paragraphs inside cell
          const textLines = cellText.split('\n');
          const paragraphs = textLines.map((line) =>
            new Paragraph({
              spacing: { before: 20, after: 20 },
              children: [
                new TextRun({
                  text: line.length > 0 ? line : ' ',
                  bold: cellIdx === 0 && rowArr.length > 2,
                  size: 18,
                  color: cellIdx === 0 && rowArr.length > 2 ? primaryColor : darkTextColor,
                  font: 'Poppins'
                })
              ]
            })
          );

          return new TableCell({
            width: { size: colWidths[cellIdx] || 25, type: WidthType.PERCENTAGE },
            shading: { fill: fillBg, type: ShadingType.CLEAR },
            borders: cellBorder,
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: paragraphs
          });
        })
      });
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...bodyRows]
    });
  };

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Poppins',
            size: 20,
            color: darkTextColor
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'ScholarCore SIMS — Project Synopsis & Technical Specification Document',
                    size: 16,
                    color: mutedTextColor,
                    font: 'Poppins'
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Page ',
                    size: 16,
                    color: mutedTextColor,
                    font: 'Poppins'
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: mutedTextColor,
                    font: 'Poppins'
                  }),
                  new TextRun({
                    text: ' of ',
                    size: 16,
                    color: mutedTextColor,
                    font: 'Poppins'
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: mutedTextColor,
                    font: 'Poppins'
                  })
                ]
              })
            ]
          })
        },
        children: [
          // ==================== COVER / TITLE PAGE ====================
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 60 },
            children: [
              new TextRun({
                text: 'A COMPREHENSIVE PROJECT SYNOPSIS ON',
                bold: true,
                size: 22,
                color: mutedTextColor,
                font: 'Poppins'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 120 },
            children: [
              new TextRun({
                text: 'SCHOLARCORE SIMS: ENTERPRISE STUDENT INFORMATION MANAGEMENT SYSTEM & ACADEMIC ERP',
                bold: true,
                size: 28,
                color: primaryColor,
                font: 'Poppins'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 200 },
            children: [
              new TextRun({
                text: 'A Cloud-Native Institutional Governance Platform Featuring Multi-Semester Academic Progression, Dynamic Fee Ledgers, Audited Attendance Engines, and Executive Analytics',
                italics: true,
                size: 20,
                color: secondaryColor,
                font: 'Poppins'
              })
            ]
          }),

          // Metadata Grid Box
          createCustomTable(
            ['Project Attribute', 'Specification Details'],
            [
              ['Project Title', 'ScholarCore SIMS (Student Information Management System)'],
              ['System Classification', 'Enterprise Academic ERP & Student Lifecycle Management System'],
              ['Technology Architecture', 'Full-Stack TypeScript: React 19, Express.js REST API, Tailwind CSS, Recharts, Node.js'],
              ['Database & Storage', 'Relational & Structured In-Memory / Persistent Document Schema with JSON Store'],
              ['User Roles (RBAC)', 'Super Admin, Academic Dean, Department HOD, Faculty, Registrar, Accounts Officer'],
              ['Target Domain', 'Universities, Technical Institutes, Autonomous Colleges & Higher Education Bodies'],
              ['Software Version', 'Version 2.4 (Enterprise Production Release)'],
              ['Specification Date', new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })]
            ],
            [35, 65]
          ),

          new Paragraph({ spacing: { before: 240, after: 100 }, children: [] }),

          // ==================== TABLE OF CONTENTS ====================
          ...createChapterTitle('0', 'Table of Contents & Document Index'),
          createBodyParagraph('This project synopsis is structured into the following comprehensive chapters:'),

          createCustomTable(
            ['Index', 'Chapter / Section Heading', 'Key Topics & Deliverables Covered'],
            [
              ['1.0', 'Executive Summary & Abstract', 'System vision, core problem addressed, and strategic academic outcomes.'],
              ['2.0', 'Problem Statement & Motivation', 'Limitations of traditional manual spreadsheets, data silos, and unaudited record edits.'],
              ['3.0', 'Project Objectives & Scope', '11 core functional modules, multi-semester tracking, and 75% attendance compliance.'],
              ['4.0', 'System Architecture & Data Flow', '3-Tier architecture, Context Level 0 & Level 1 DFDs, and Technology Stack breakdown.'],
              ['5.0', 'Entity-Relationship (ER) Diagram & Schemas', 'Entities, relationships, primary/foreign keys, cardinality, and data dictionary.'],
              ['6.0', 'Detailed Functional Modules Specification', 'In-depth analysis of all 11 modules (Students, Fees, Attendance, Admissions, etc.).'],
              ['7.0', 'Security, RBAC & Audit Trail System', 'JWT auth, role-based permission matrix, and immutable attendance/fee edit logs.'],
              ['8.0', 'Hardware, Software & Runtime Environment', 'System prerequisites, browser matrix, server deployment, and network specs.'],
              ['9.0', 'Testing, Verification & Quality Assurance', 'TypeScript static typing, unit testing verification, and linter audits.'],
              ['10.0', 'Future Enhancements & Conclusion', 'AI predictive failure warning models, biometric IoT integration, and project summary.']
            ],
            [12, 40, 48]
          ),

          new Paragraph({ spacing: { before: 240, after: 100 }, children: [] }),

          // ==================== CHAPTER 1 ====================
          ...createChapterTitle('1', 'Executive Summary & Abstract'),
          createBodyParagraph(
            'ScholarCore SIMS is a state-of-the-art, cloud-native Student Information Management System (SIMS) and Academic ERP platform engineered to streamline institutional administration, academic governance, student lifecycle management, fee ledger processing, and semester-wise evaluation. Designed with a clean, high-contrast, responsive interface and an enterprise-grade backend architecture, ScholarCore bridges the operational divide between students, faculties, department heads, accounts desks, and institutional leadership.'
          ),
          createBodyParagraph(
            'The platform delivers an end-to-end digital transformation ecosystem encompassing online admissions processing, student enrollment with roll number allocation, multi-semester academic progression (Semesters 1 through 8), course registration with credit hours and prerequisites, automated semester GPA/CGPA grading calculation, detailed semester fee structures with official receipt voucher generation, and an advanced semester-wise attendance engine equipped with mandatory audit trails and shortage warnings.'
          ),

          // ==================== CHAPTER 2 ====================
          ...createChapterTitle('2', 'Problem Statement & Literature Survey'),
          createSubheading('2.1', 'Limitations of Conventional Institutional Systems'),
          createBodyParagraph('Modern educational institutions frequently encounter severe administrative hurdles resulting from legacy paper-based workflows or fragmented software tools:'),
          createBullet('Data Fragmentation & Silos', 'Student biodata, admissions forms, examination marks, and fee payment receipts reside in separate spreadsheets, resulting in data inconsistency and high retrieval latency.'),
          createBullet('Absence of Multi-Semester Longitudinal Tracking', 'Standard portals only store the current semester status, making it difficult for faculty and advisors to analyze a student’s historical performance (SGPA progression, backlogs, earned credits across Semesters 1 to 8).'),
          createBullet('Unverified Fee Payments & Lost Receipts', 'Manual cash or offline challan systems cause reconciliation delays between accounts and academic departments, leading to disputes during semester exam registration.'),
          createBullet('Unaudited Attendance Alterations', 'When attendance records are modified for medical condonation or event duty, traditional databases fail to record who made the change, when it occurred, or the justification reason.'),

          createSubheading('2.2', 'Proposed Solution: The ScholarCore SIMS Paradigm'),
          createBodyParagraph('ScholarCore SIMS resolves these bottlenecks by providing a single, authoritative, real-time database with role-based access control. Every modification to critical academic metrics (such as attendance percentages or fee balances) is backed by an automated, timestamped audit log ensuring regulatory compliance with accreditation bodies (such as NAAC, NBA, and ABET).'),

          // ==================== CHAPTER 3 ====================
          ...createChapterTitle('3', 'Project Objectives & Functional Scope'),
          createBodyParagraph('The system has been engineered to fulfill the following primary functional and operational objectives:'),
          createBullet('Comprehensive 360° Student Drawer', 'Centralize personal biodata, academic records, fee history, document attachments, and guardian contacts in an instant slide-over drawer.'),
          createBullet('8-Semester SGPA/CGPA Grading Engine', 'Support complete course registration, letter grade mapping (10-point scale), internal/external mark entry, and dynamic semester grade card printing.'),
          createBullet('Institutional Multi-Semester Fee Ledger', 'Maintain customized fee structures (Tuition, Lab, Exam, Library, Hostel) for each semester, record split installment payments, and print official verified receipts with QR verification codes.'),
          createBullet('Semester-Wise Attendance with Audit Trail', 'Track classes attended vs. total conducted, enforce the mandatory 75% examination eligibility rule, and log all manual adjustments with editor details and reasons.'),
          createBullet('Digital ID Card Studio', 'Generate barcode/QR-encoded student photo ID cards with customizable institutional branding and one-click bulk printing.'),
          createBullet('Batch Promotion & Migration Engine', 'Promote cohorts across academic years with automated prerequisite and backlog clearance checks.'),
          createBullet('Institutional Analytics & Reporting Suite', 'Deliver dynamic charts and exportable datasets (PDF, Excel CSV, DOCX) for demographic, admission yield, and academic distributions.'),

          // ==================== CHAPTER 4 ====================
          ...createChapterTitle('4', 'System Architecture & Data Flow Diagrams'),
          createSubheading('4.1', 'Multi-Tier System Architecture'),
          createBodyParagraph('ScholarCore SIMS adopts a decoupled 3-tier client-server architecture:'),
          createBullet('Presentation Tier (Client)', 'Built with React 19, TypeScript, and Tailwind CSS. Utilizes Recharts for dynamic visual analytics, Lucide Icons, and Motion transitions for optimal user experience.'),
          createBullet('Application Tier (Server)', 'Engineered with Node.js and Express.js RESTful API following the Controller-Service-Repository pattern. Employs JSON Web Tokens (JWT) for stateless session authorization and bcrypt for password security.'),
          createBullet('Data Tier (Storage)', 'Structured relational and JSON document storage maintaining ACID compliance, high throughput, and atomic ledger mutations.'),

          createSubheading('4.2', 'Data Flow Diagram (Level 0 - Context DFD)'),
          ...createCodeBlock([
            '+-----------------------------------------------------------------------------------+',
            '|                             SCHOLARCORE SIMS CONTEXT DFD (LEVEL 0)                |',
            '+-----------------------------------------------------------------------------------+',
            '',
            '  [ APPLICANT ] --------( Online Application / Upload Documents )---------> +-------------------+',
            '  [ STUDENT ] <---------( Grade Card / Fee Receipts / Attendance Ledger )-- |                   |',
            '                                                                            |                   |',
            '  [ FACULTY ] ---------( Course Marks / Attendance Entry / Reviews )------> |   SCHOLARCORE     |',
            '  [ HOD / DEAN ] <-----( Promotion Approvals / Department Analytics )------ |   SIMS CORE       |',
            '                                                                            |   ERP SYSTEM      |',
            '  [ ACCOUNTS ] --------( Fee Allocation / Payment Reconciliation )--------> |                   |',
            '  [ REGISTRAR ] <------( Audit Logs / ID Cards / Institutional Reports )--- +-------------------+',
            '+-----------------------------------------------------------------------------------+'
          ]),

          createSubheading('4.3', 'Data Flow Diagram (Level 1 - Core Subsystems)'),
          ...createCodeBlock([
            '+-----------------------------------------------------------------------------------+',
            '|                             LEVEL 1 DETAILED PROCESS DFD                          |',
            '+-----------------------------------------------------------------------------------+',
            '',
            '  (1.0 Auth & RBAC) --------> Validates User Credentials & Generates Signed JWT Tokens',
            '           |',
            '           v',
            '  (2.0 Student Subsystem) --> Manages Roll Numbers, 360 Profiles & Sem 1-8 Academic Progression',
            '           |',
            '           v',
            '  (3.0 Fee Ledger Engine) --> Computes Semester Dues, Records Installments & Generates Receipts',
            '           |',
            '           v',
            '  (4.0 Attendance Subsystem) -> Evaluates 75% Eligibility & Logs Edits into Audit Trail',
            '           |',
            '           v',
            '  (5.0 Report & Export) ----> Generates Visual Recharts, PDF Dossiers & DOCX Documents',
            '+-----------------------------------------------------------------------------------+'
          ]),

          // ==================== CHAPTER 5 ====================
          ...createChapterTitle('5', 'Entity-Relationship (ER) Diagram & Data Schemas'),
          createSubheading('5.1', 'System Entity-Relationship (ER) Model'),
          createBodyParagraph('The ER model defines strong relational integrity between institutional entities:'),
          ...createCodeBlock([
            '+-----------------------------------------------------------------------------------+',
            '|                       ENTITY RELATIONSHIP (ER) DIAGRAM                            |',
            '+-----------------------------------------------------------------------------------+',
            '',
            '    +------------------+          1:N          +--------------------+',
            '    |   DEPARTMENT     |---------------------> |      FACULTY       |',
            '    +------------------+                       +--------------------+',
            '             | 1:N                                       | 1:N',
            '             v                                           v',
            '    +------------------+          1:N          +--------------------+',
            '    |     STUDENT      |---------------------> |      COURSES       |',
            '    +------------------+                       +--------------------+',
            '       | 1:N        | 1:N                                |',
            '       |            +------------+                       | M:N',
            '       v                         v                       v',
            '+---------------+        +----------------+     +-------------------+',
            '| SEMESTER_REC  |        | FEE_STRUCTURE  |     | COURSE_GRADES     |',
            '+---------------+        +----------------+     +-------------------+',
            '       | 1:N                     | 1:N',
            '       v                         v',
            '+---------------+        +----------------+',
            '| ATTENDANCE_LOG|        | FEE_PAYMENTS   |',
            '+---------------+        +----------------+',
            '+-----------------------------------------------------------------------------------+'
          ]),

          createSubheading('5.2', 'Database Data Dictionary & Table Schemas'),
          createBodyParagraph('The core relational entities and their data attributes are defined as follows:'),

          createCustomTable(
            ['Entity Name', 'Primary Key', 'Foreign Keys', 'Key Attributes & Data Types', 'Cardinality'],
            [
              ['STUDENT', 'id (UUID)', 'department_id', 'studentId (VARCHAR), fullName, email, gpa (FLOAT), attendance (FLOAT), status', '1 : N with SemesterRecords, Fees'],
              ['SEMESTER_RECORD', 'id (UUID)', 'student_id', 'semester (INT 1-8), academicTerm, sgpa (FLOAT), cgpa, attendancePct, backlogs', 'N : 1 with Student'],
              ['COURSE_GRADE', 'id (UUID)', 'semester_id, course_id', 'courseCode, courseName, credits (INT), internalMarks, externalMarks, grade', 'N : 1 with SemesterRecord'],
              ['FEE_STRUCTURE', 'id (UUID)', 'student_id', 'semester (INT), tuitionFee, examFee, labFee, totalAmount, paidAmount, dueAmount', 'N : 1 with Student'],
              ['FEE_TRANSACTION', 'receipt_no', 'fee_structure_id', 'amountPaid, paymentMode (UPI/Card/Cash), transactionRef, paymentDate, collectedBy', 'N : 1 with FeeStructure'],
              ['ATTENDANCE_LOG', 'id (UUID)', 'student_id', 'semester (INT), oldPercentage, newPercentage, classesAttended, totalClasses, editedBy, reason, editedAt', 'N : 1 with Student'],
              ['DEPARTMENT', 'code (VARCHAR)', 'hod_id', 'name, capacity, enrolledCount, facultyCount, budget, labResources', '1 : N with Students, Courses'],
              ['FACULTY', 'id (UUID)', 'department_id', 'name, designation (Prof/Assoc/Asst), email, phone, workloadHours, coursesAssigned', 'N : 1 with Department'],
              ['ADMISSION_APP', 'id (UUID)', 'department_id', 'applicantName, email, score, category, documents, status (Approved/Review/Rejected)', '1 : 1 upon Enrollment']
            ],
            [16, 14, 16, 38, 16]
          ),

          // ==================== CHAPTER 6 ====================
          ...createChapterTitle('6', 'Detailed Functional Modules Specification'),
          createBodyParagraph('ScholarCore SIMS encompasses 11 fully integrated functional modules:'),

          createCustomTable(
            ['Module #', 'Module Name', 'Functional Scope & Operational Capabilities'],
            [
              ['Module 01', 'Executive Dashboard', 'Real-time KPI metrics (Total Students, Active Admissions, Average CGPA, Total Fees Collected), admission intake trends, department distribution donuts, and live administrative event feeds.'],
              ['Module 02', 'Student 360° Management', 'Full directory with advanced multi-filter search (Department, Year, Status), bulk CSV import/export, student profile slide-over drawer with 5 tabbed sections, and PDF profile dossier generation.'],
              ['Module 03', '8-Semester Results Ledger', 'Detailed semester-by-semester academic progression for Semesters 1 to 8, SGPA/CGPA evaluation, credit point accumulation, subject grade breakdown, and printable official semester grade cards.'],
              ['Module 04', 'Student Fee Management', 'Semester fee structure definition (Tuition, Examination, Library/Lab, Hostel), installment tracking, payment collection via UPI/NetBanking/Cards/Cash/DD, and official printable receipt vouchers.'],
              ['Module 05', 'Semester Attendance & Audit Logs', 'Semester attendance percentage tracking, automatic 75% examination threshold shortage alerts, medical condonation approval workflow, and an immutable edit history log with editor details and mandatory reasons.'],
              ['Module 06', 'Online Admissions Portal', 'End-to-end applicant lifecycle from online application submission, entrance exam score validation, document verification, quota classification, to automated matriculation into student directory.'],
              ['Module 07', 'Faculty Directory & Workload', 'Faculty member management, academic designations (Professor, Associate Professor, Assistant Professor), department assignments, teaching workload credit hours, and contact profiles.'],
              ['Module 08', 'Course & Curriculum Catalog', 'Institutional syllabus management, course codes, credit hours, lecture/tutorial/practical breakdown, prerequisite course mappings, and department syllabus export.'],
              ['Module 09', 'Digital ID Card Studio', 'Automated student identity card designer with customizable institutional themes, photo frames, barcode/QR encoders, single and batch ID card generation, and high-resolution print layouts.'],
              ['Module 10', 'Batch Promotion Engine', 'Cohort progression utility promoting student batches across academic semesters and years with automated backlog validation and probation criteria checks.'],
              ['Module 11', 'Reports & Analytics Suite', 'Comprehensive reporting suite across Student Demographics, Admissions, Departments, Gender Ratios, and Alumni Career Success with instant export to PDF, Excel CSV, and Word DOCX.']
            ],
            [12, 28, 60]
          ),

          // ==================== CHAPTER 7 ====================
          ...createChapterTitle('7', 'Security, RBAC & Audit Trail System'),
          createSubheading('7.1', 'Authentication & Role-Based Access Control (RBAC)'),
          createBodyParagraph('To guarantee institutional governance, ScholarCore SIMS enforces strict role boundaries:'),

          createCustomTable(
            ['User Role', 'Dashboard Access', 'Student Profile Edits', 'Grade / SGPA Entry', 'Fee Collection', 'Attendance Edits & Audit Logs', 'Admin Settings'],
            [
              ['Super Admin', 'Full Access', 'Full CRUD', 'Full Access', 'Full Access', 'Full Access & View All Logs', 'Full Access'],
              ['Academic Dean', 'Full Access', 'Read & Approve', 'Read & Approve', 'Read Only', 'Read & Approve Condonation', 'Restricted'],
              ['Department HOD', 'Department Only', 'Read & Edit Dept', 'Update Dept Grades', 'Read Only', 'Update & View Dept Logs', 'None'],
              ['Faculty / Advisor', 'Department Only', 'Read Dept Students', 'Enter Subject Marks', 'No Access', 'Mark Daily/Sem Attendance', 'None'],
              ['Accounts Officer', 'Financial Only', 'Read Basic Info', 'No Access', 'Collect Fee & Print Receipts', 'No Access', 'None'],
              ['Registrar Desk', 'Institutional', 'Full CRUD & ID Cards', 'Read Only', 'Read Ledger', 'View Audit Trail & Issue NOC', 'Restricted']
            ],
            [16, 14, 14, 14, 14, 14, 14]
          ),

          createSubheading('7.2', 'Immutable Audit Trail Mechanism'),
          createBodyParagraph('Whenever an attendance percentage is modified (for instance, granting attendance condonation for inter-college technical symposiums or medical leave), the system records an immutable audit log storing:'),
          createBullet('Log ID & Timestamp', 'Unique identifier and ISO-8601 millisecond-precision timestamp of the transaction.'),
          createBullet('Student & Semester Reference', 'Target student enrollment ID and exact academic semester (Sem 1 to 8).'),
          createBullet('Old Value vs. New Value', 'Previous attendance percentage and updated percentage with delta calculation.'),
          createBullet('Editor Identity & Designation', 'Full name and administrative role of the officer executing the change.'),
          createBullet('Mandatory Justification Reason', 'Compulsory textual justification (e.g., Medical certificate approved by Dean).'),

          // ==================== CHAPTER 8 ====================
          ...createChapterTitle('8', 'Hardware, Software & Runtime Environment'),
          createCustomTable(
            ['Environment Component', 'Specification Requirements'],
            [
              ['Operating System', 'Cross-platform: Linux (Ubuntu 22.04 LTS), macOS, or Windows 10/11 Server'],
              ['Server Runtime', 'Node.js runtime v20.x or higher, npm 10.x package manager'],
              ['Frontend Framework', 'React 19.x with TypeScript 5.8.x, Vite 6.x build bundler'],
              ['Styling Engine', 'Tailwind CSS v4.x utility-first styling architecture'],
              ['Client Web Browsers', 'Google Chrome 110+, Mozilla Firefox 115+, Apple Safari 16+, Microsoft Edge 110+'],
              ['Server Memory & CPU', 'Minimum 1 GB RAM, 1 vCPU; Recommended 2 GB RAM for high concurrent loads'],
              ['Network Protocol', 'HTTPS with TLS 1.3 encryption on Port 3000 (managed via reverse proxy)']
            ],
            [30, 70]
          ),

          // ==================== CHAPTER 9 ====================
          ...createChapterTitle('9', 'Testing, Verification & Quality Assurance'),
          createBodyParagraph('ScholarCore SIMS underwent rigorous quality assurance protocols:'),
          createBullet('TypeScript Static Type Verification', 'Compiled cleanly under strict mode (`tsc --noEmit`) with zero type errors, preventing runtime undefined errors and null pointer exceptions.'),
          createBullet('API Contract Testing', 'All endpoints under `/api/v1/*` were tested for valid JSON payload serialization, correct HTTP status codes (200, 201, 400, 401, 404, 500), and proper error handling.'),
          createBullet('Cross-Browser & Responsive Validation', 'Verified across desktop (1920x1080), laptop (1366x768), tablet, and mobile viewport sizes with touch-target ergonomics.'),
          createBullet('Document Generation Verification', 'Ensured that DOCX and PDF export engines construct well-formed OpenXML and HTML5 print buffers compliant with official office suites.'),

          // ==================== CHAPTER 10 ====================
          ...createChapterTitle('10', 'Future Scope & Project Conclusion'),
          createSubheading('10.1', 'Future Roadmap & Potential Enhancements'),
          createBullet('AI-Powered Predictive Academic Alerts', 'Integrating Gemini AI to identify students showing early trends of academic distress or attendance drop-offs, automatically proposing remediation workshops.'),
          createBullet('IoT Biometric Campus Integration', 'Connecting RFID smart turnstiles and biometric classroom readers directly into the attendance ingestion API.'),
          createBullet('Mobile Companion App for Parents & Students', 'Developing native iOS and Android apps for instant push notifications on grade card releases, fee dues, and daily attendance alerts.'),

          createSubheading('10.2', 'Project Conclusion'),
          createBodyParagraph(
            'ScholarCore SIMS demonstrates a complete, cohesive, and modern Student Information Management System & Academic ERP. By unifying student demographics, 8-semester academic evaluations, fee billing ledgers, audited attendance tracking, online admissions, ID card generation, and executive analytics into a single responsive web platform, the system significantly elevates institutional efficiency, transparency, and data governance.'
          ),
          createBodyParagraph(
            'This synopsis serves as the official project documentation and structural specification for ScholarCore SIMS.'
          ),

          // Signoff Box
          new Paragraph({ spacing: { before: 200, after: 100 }, children: [] }),
          createCustomTable(
            ['Project Prepared By', 'Verification & Approval'],
            [
              [
                'ScholarCore Core Engineering & Academic Systems Group\nInstitutional ERP Solutions',
                '✓ Verified Production Release (v2.4)\nApproved for Institutional Deployment & University Audits'
              ]
            ],
            [50, 50]
          )
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
