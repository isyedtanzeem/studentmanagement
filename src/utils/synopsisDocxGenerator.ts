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
import * as fs from 'fs';
import * as path from 'path';

export async function generateProjectSynopsisDocx(): Promise<Buffer> {
  const primaryColor = '1E3A8A'; // Deep Blue
  const secondaryColor = '0D9488'; // Teal
  const accentColor = '2563EB'; // Blue
  const darkTextColor = '1E293B'; // Slate 800
  const lightBgColor = 'F1F5F9'; // Slate 100
  const headerBgColor = '1E293B'; // Slate 800

  // Helper for Section Heading
  const createSectionHeader = (title: string, iconNumber: string) => {
    return [
      new Paragraph({
        spacing: { before: 360, after: 120 },
        children: [
          new TextRun({
            text: `${iconNumber}. ${title.toUpperCase()}`,
            bold: true,
            size: 26,
            color: primaryColor,
            font: 'Arial'
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 0, after: 180 },
        children: [
          new TextRun({
            text: '_________________________________________________________________________________',
            color: 'CBD5E1',
            size: 16
          })
        ]
      })
    ];
  };

  // Helper for Subheading
  const createSubheading = (title: string) => {
    return new Paragraph({
      spacing: { before: 240, after: 80 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 22,
          color: secondaryColor,
          font: 'Arial'
        })
      ]
    });
  };

  // Helper for Paragraph text
  const createBodyText = (text: string, isItalic = false) => {
    return new Paragraph({
      spacing: { before: 60, after: 100, line: 300 },
      children: [
        new TextRun({
          text,
          size: 20,
          color: darkTextColor,
          italics: isItalic,
          font: 'Arial'
        })
      ]
    });
  };

  // Helper for Bullet Point
  const createBulletItem = (boldPrefix: string, text: string) => {
    return new Paragraph({
      bullet: { level: 0 },
      spacing: { before: 40, after: 60, line: 280 },
      children: [
        new TextRun({
          text: `${boldPrefix}: `,
          bold: true,
          size: 20,
          color: primaryColor,
          font: 'Arial'
        }),
        new TextRun({
          text,
          size: 20,
          color: darkTextColor,
          font: 'Arial'
        })
      ]
    });
  };

  // Helper for Key-Value Table
  const createMetaTable = (rowsData: [string, string][]) => {
    const rows = rowsData.map(([key, val], idx) => {
      const isEven = idx % 2 === 0;
      return new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: isEven ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: key,
                    bold: true,
                    size: 19,
                    color: primaryColor,
                    font: 'Arial'
                  })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            shading: { fill: isEven ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: val,
                    size: 19,
                    color: darkTextColor,
                    font: 'Arial'
                  })
                ]
              })
            ]
          })
        ]
      });
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows
    });
  };

  // Helper for Modules Grid Table
  const createModuleTable = (modules: { name: string; desc: string; features: string }[]) => {
    const headerRow = new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          shading: { fill: primaryColor, type: ShadingType.CLEAR },
          margins: { top: 140, bottom: 140, left: 140, right: 140 },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'Module Name', bold: true, size: 20, color: 'FFFFFF', font: 'Arial' })
              ]
            })
          ]
        }),
        new TableCell({
          width: { size: 40, type: WidthType.PERCENTAGE },
          shading: { fill: primaryColor, type: ShadingType.CLEAR },
          margins: { top: 140, bottom: 140, left: 140, right: 140 },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'Functional Scope', bold: true, size: 20, color: 'FFFFFF', font: 'Arial' })
              ]
            })
          ]
        }),
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          shading: { fill: primaryColor, type: ShadingType.CLEAR },
          margins: { top: 140, bottom: 140, left: 140, right: 140 },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'Key Deliverables & Innovations', bold: true, size: 20, color: 'FFFFFF', font: 'Arial' })
              ]
            })
          ]
        })
      ]
    });

    const bodyRows = modules.map((m, idx) => {
      const bg = idx % 2 === 0 ? 'F8FAFC' : 'FFFFFF';
      return new TableRow({
        children: [
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            shading: { fill: bg, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: m.name, bold: true, size: 19, color: primaryColor, font: 'Arial' })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            shading: { fill: bg, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: m.desc, size: 18, color: darkTextColor, font: 'Arial' })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            shading: { fill: bg, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: m.features, size: 18, color: secondaryColor, font: 'Arial' })
                ]
              })
            ]
          })
        ]
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
            font: 'Arial',
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
            margin: {
              top: 1200,
              bottom: 1200,
              left: 1200,
              right: 1200
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'ScholarCore SIMS — Project Synopsis & Technical Specification',
                    size: 16,
                    color: '94A3B8',
                    font: 'Arial'
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
                    color: '94A3B8',
                    font: 'Arial'
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: '94A3B8',
                    font: 'Arial'
                  }),
                  new TextRun({
                    text: ' of ',
                    size: 16,
                    color: '94A3B8',
                    font: 'Arial'
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: '94A3B8',
                    font: 'Arial'
                  })
                ]
              })
            ]
          })
        },
        children: [
          // Cover Banner
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 120 },
            children: [
              new TextRun({
                text: 'PROJECT SYNOPSIS',
                bold: true,
                size: 36,
                color: primaryColor,
                font: 'Arial'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 80 },
            children: [
              new TextRun({
                text: 'SCHOLARCORE SIMS: ENTERPRISE STUDENT INFORMATION MANAGEMENT SYSTEM & ACADEMIC ERP',
                bold: true,
                size: 24,
                color: secondaryColor,
                font: 'Arial'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 300 },
            children: [
              new TextRun({
                text: 'Cloud-Native Institutional Governance, Multi-Semester Academic Tracking, Digital Fee Billing Ledger & Real-Time Attendance Engine with Audit Logging',
                italics: true,
                size: 20,
                color: '64748B',
                font: 'Arial'
              })
            ]
          }),

          // Metadata Table
          createMetaTable([
            ['Project Title', 'ScholarCore SIMS (Student Information Management System)'],
            ['Application Type', 'Full-Stack Enterprise Web Application & Institutional ERP'],
            ['Technology Stack', 'React 19, TypeScript, Tailwind CSS, Express.js, Node.js, Recharts, Vite'],
            ['Target Audience', 'Universities, Engineering Institutes, Colleges, Academic Administrators, Deans, HODs, Accounts & Faculty'],
            ['Primary Deployment', 'Containerized Cloud Platform (Cloud Run Architecture)'],
            ['Document Version', 'Version 2.4 (Production Specification)'],
            ['Generated Date', new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })]
          ]),

          new Paragraph({ spacing: { before: 200, after: 100 }, children: [] }),

          // SECTION 1: EXECUTIVE SUMMARY
          ...createSectionHeader('Executive Summary & Abstract', '1'),
          createBodyText(
            'ScholarCore SIMS is a state-of-the-art, cloud-native Student Information Management System (SIMS) and Academic ERP platform engineered to streamline institutional administration, academic governance, student lifecycle management, fee ledger processing, and semester-wise evaluation. Designed with a clean, high-contrast, responsive interface and an enterprise-grade backend architecture, ScholarCore bridges the operational divide between students, faculties, department heads, accounts desks, and institutional leadership.'
          ),
          createBodyText(
            'The platform delivers an end-to-end digital transformation ecosystem encompassing online admissions processing, student enrollment with roll number allocation, multi-semester academic progression (Semesters 1 through 8), course registration with credit hours and prerequisites, automated semester GPA/CGPA grading calculation, detailed semester fee structures with official receipt voucher generation, and an advanced semester-wise attendance engine equipped with mandatory audit trails and shortage warnings.'
          ),

          // SECTION 2: PROBLEM STATEMENT
          ...createSectionHeader('Problem Statement & Motivation', '2'),
          createBodyText(
            'Contemporary higher education institutions face critical operational bottlenecks due to disparate software silos, manual spreadsheet data tracking, error-prone fee reconciliation, and lack of auditable logs when student records or attendance data are altered. Key pain points include:'
          ),
          createBulletItem('Data Fragmentation', 'Student demographics, semester grades, fee vouchers, and admission documents are maintained across disconnected databases and paper files, resulting in high administrative latency.'),
          createBulletItem('Lack of Multi-Semester Visibility', 'Inability to track a student’s longitudinal academic trajectory across all 8 semesters, resulting in delayed detection of backlogs, low SGPA, or credit shortages.'),
          createBulletItem('Fee Ledger Discrepancies', 'Absence of real-time semester fee breakdown (tuition, examination, library, lab, hostel) and instant PDF/printable payment vouchers with verifiable transaction reference numbers.'),
          createBulletItem('Unaudited Attendance Modifications', 'Attendance records are frequently modified without tracking the editor identity, timestamp, or justification reason, compromising institutional accreditation and examination eligibility compliance.'),
          createBulletItem('Manual ID Card & Report Generation', 'Extensive manual labor required to issue student photo ID cards, student transcripts, department strength reports, and admission intake summaries.'),

          // SECTION 3: SYSTEM OBJECTIVES & SCOPE
          ...createSectionHeader('Project Objectives & Key Goals', '3'),
          createBodyText('ScholarCore SIMS was conceived and built to accomplish the following core technical and functional objectives:'),
          createBulletItem('Unified Academic Profile', 'Provide a comprehensive 360° student drawer consolidating personal biodata, guardian contacts, semester records, fee ledger, documents, and disciplinary standing.'),
          createBulletItem('Dynamic Semester Result Management', 'Enable department chairs and faculty to record SGPA, CGPA, letter grades, credit points, and promotion recommendations for Semesters 1 to 8.'),
          createBulletItem('Automated Institutional Fee Engine', 'Track course tuition, lab, exam, and hostel fees; record installment payments via UPI/NetBanking/Cards/Cash/DD; and generate instant printable official receipt vouchers with verification seals.'),
          createBulletItem('Audited Semester Attendance System', 'Record semester-wise class attendance percentages, enforce the 75% minimum examination eligibility threshold, and log every modification with previous vs. new values, editor name, timestamp, and mandatory reason.'),
          createBulletItem('Digital Identity Card Generation Studio', 'Provide real-time student ID card preview with customizable institutional branding, dynamic QR code/barcode encoding, and batch printing capabilities.'),
          createBulletItem('Automated Progression & Batch Promotion', 'Facilitate bulk promotion of student cohorts across semesters with prerequisite backlog checks and academic probation monitoring.'),
          createBulletItem('Comprehensive Analytics & Reports', 'Deliver interactive visual analytics (Recharts) covering enrollment trends, department distributions, gender ratios, fee collections, and academic GPA bell curves with instant export to PDF, CSV, and DOCX.'),

          // SECTION 4: SYSTEM ARCHITECTURE & DESIGN
          ...createSectionHeader('System Architecture & Technology Stack', '4'),
          createBodyText(
            'ScholarCore utilizes a modular, decoupled architecture adhering to modern TypeScript standards and strict separation of concerns.'
          ),
          createSubheading('4.1 Frontend Architecture (Client Layer)'),
          createBulletItem('Framework & Language', 'React 19 with TypeScript 5.8 for robust type safety, predictable state mutations, and component reusability.'),
          createBulletItem('Styling & Layout Engine', 'Tailwind CSS for responsive design, modern typography, optical spacing math, and light/dark theme adaptation.'),
          createBulletItem('Data Visualization', 'Recharts library for interactive SVG-rendered charts including multi-bar enrollment comparisons, radial gender metrics, and financial yield curves.'),
          createBulletItem('Iconography & Micro-interactions', 'Lucide React vector icon set coupled with Motion layout transitions for high tactile polish.'),
          createBulletItem('Document & Codec Tooling', 'Official DOCX generation library for programmatic Word document construction and QRCode encoder for student identity verification.'),

          createSubheading('4.2 Backend Architecture (Server & API Layer)'),
          createBulletItem('Runtime & Framework', 'Node.js with Express.js RESTful API handling structured endpoints under `/api/*`.'),
          createBulletItem('Architecture Pattern', 'Controller-Service-Repository multi-tier architectural pattern ensuring clear abstraction of routing, business validation, and data operations.'),
          createBulletItem('Security & Authentication', 'JSON Web Tokens (JWT) for stateless session handling and Bcrypt password hashing for multi-role security (Admin, Faculty, Registrar, Accounts).'),
          createBulletItem('Persistence & Data Stores', 'Structured in-memory and persistent schema collections for Students, Admissions, Faculty, Courses, Departments, Fee Structures, Attendance Audit Logs, and Promotions.'),

          // SECTION 5: FUNCTIONAL MODULES SPECIFICATION
          ...createSectionHeader('Detailed Functional Modules Specification', '5'),
          createBodyText(
            'The application is architected into 11 dedicated, cohesive functional modules designed for high institutional throughput:'
          ),
          createModuleTable([
            {
              name: '1. Executive Dashboard',
              desc: 'High-level executive overview presenting institutional KPIs, total active enrollments, revenue collection stats, average CGPA, and live event timeline.',
              features: 'Real-time KPI cards, Recharts admission intake charts, urgent alert notifications, and quick-action shortcuts.'
            },
            {
              name: '2. Student Management & Profile Drawer',
              desc: 'Complete student directory with multi-criteria filtering, search, pagination, bulk selection, CSV import/export, and modal views.',
              features: '360° slide-over profile drawer, document verification badges, academic status toggles, and instant PDF profile export.'
            },
            {
              name: '3. Semester Results & Grade Cards',
              desc: 'Detailed semester-wise academic ledger spanning Semesters 1 to 8, tracking SGPA, CGPA, credits registered/earned, and course grade items.',
              features: 'Grade-point conversion (10.0 scale), first class distinction tags, backlog flags, and printable official semester grade cards.'
            },
            {
              name: '4. Student Fee Billing & Receipts',
              desc: 'Institutional financial ledger managing 8-semester fee structures (tuition, examination, lab, hostel) and payment transactions.',
              features: 'Installment recording, UPI/Card/DD payment mode support, due balance calculation, and printable official receipt vouchers with QR seals.'
            },
            {
              name: '5. Semester Attendance & Audit Logs',
              desc: 'Comprehensive semester-by-semester attendance tracking engine with automatic 75% examination eligibility threshold compliance.',
              features: 'Class attendance percentage calculation, medical condonation workflow, and auditable edit history log tracking changes, editor, and reason.'
            },
            {
              name: '6. Online Admissions Portal',
              desc: 'Applicant intake pipeline managing online application submissions, document verification, quota validation, and admission offer letters.',
              features: 'Stage progression (Submitted -> Under Review -> Verified -> Approved), merit rank listing, and one-click student matriculation.'
            },
            {
              name: '7. Faculty & Staff Directory',
              desc: 'Faculty roster managing designations (Professor, Associate Prof, Asst Prof), department assignments, teaching workload, and contact profiles.',
              features: 'Department-wise faculty filtering, course assignment mapping, qualification tracking, and contact drawers.'
            },
            {
              name: '8. Course & Curriculum Catalog',
              desc: 'Institutional syllabus directory managing academic courses, credit hours, lecture/tutorial/practical breakdowns, and prerequisite courses.',
              features: 'Semester-wise course mapping, elective vs core tagging, syllabus outline viewer, and department curriculum exports.'
            },
            {
              name: '9. Digital ID Card Studio',
              desc: 'Automated student identity card designer with customizable institutional themes, portrait photo frames, and dynamic barcode/QR encoders.',
              features: 'Single and batch ID card generation, printable dual-sided layouts, security seal overlays, and high-resolution print rendering.'
            },
            {
              name: '10. Batch Promotion Engine',
              desc: 'Systematic progression utility promoting student batches across academic semesters and years while enforcing minimum CGPA and backlog criteria.',
              features: 'Cohort selection, prerequisite validation, conditional probation promotion, and historical batch migration audit records.'
            },
            {
              name: '11. Reports & Analytics Suite',
              desc: 'Institutional analytics generator providing cross-sectional reports on student demographics, admission yield, fee collection, and grade distributions.',
              features: 'Interactive chart visualizations, multi-filter query builder, and one-click export to PDF, Excel CSV, and complete Word DOCX synopsis.'
            }
          ]),

          // SECTION 6: DATA MODEL & ENTITY RELATIONSHIPS
          ...createSectionHeader('Data Modeling & Schema Definitions', '6'),
          createBodyText('ScholarCore SIMS models institutional entities using rich, strongly-typed TypeScript definitions:'),
          createBulletItem('Student Entity', 'Unique ID, Roll No / Student ID, Full Name, Email, Phone, Department, Current Semester (1-8), Enrollment Year, 10-point CGPA, Aggregate Attendance %, Category (General/OBC/SC/ST/EWS), Guardian details, and Status (Active/Graduated/Suspended/Inactive).'),
          createBulletItem('SemesterRecord Entity', 'Semester number, Academic Term, SGPA, CGPA, Credits Registered, Credits Earned, Attendance %, Backlogs count, CourseGradeItems (Subject code, name, credits, internal/external marks, grade letter), and Status.'),
          createBulletItem('StudentFeeStructure Entity', 'Semester ID, Academic Year, Tuition Fee, Exam Fee, Library/Lab Fee, Hostel Fee, Total Amount, Paid Amount, Due Amount, Due Date, and Status (Paid/Partially Paid/Unpaid).'),
          createBulletItem('FeePaymentTransaction Entity', 'Receipt No, Payment Date, Amount Paid, Payment Mode (UPI/NetBanking/Card/DD/Cash), Transaction UTR Reference, Fee Category, Semester, Collected By, and Verification Remarks.'),
          createBulletItem('AttendanceLogEntry Entity', 'Student ID, Semester, Old Attendance %, New Attendance %, Classes Attended, Total Classes, Edited By, Timestamp, and Mandatory Justification Reason.'),

          // SECTION 7: SECURITY, QUALITY ASSURANCE & AUDIT TRAIL
          ...createSectionHeader('Security, Role-Based Access Control & Quality Assurance', '7'),
          createBodyText(
            'Security and data integrity are fundamental pillars of ScholarCore SIMS. The platform integrates multilayered security practices:'
          ),
          createBulletItem('Role-Based Access Control (RBAC)', 'Segregated permissions for Super Admin, Academic Dean, Department HOD, Faculty, Registrar, and Accounts Officer to prevent unauthorized record modifications.'),
          createBulletItem('Immutable Financial & Academic Audit Trails', 'All payment transactions and attendance edits are permanently logged with editor credentials and timestamped historical snapshots.'),
          createBulletItem('Client-Side Input Sanitization & Type Validation', 'Rigorous schema validation, bounds checking on GPA (0.00-10.00), attendance percentages (0-100%), and fee currency amounts.'),
          createBulletItem('Continuous Quality Assurance', 'Zero compilation errors under strict TypeScript compiler (`tsc --noEmit`), responsive accessibility checks, and verified production container builds.'),

          // SECTION 8: HARDWARE & SOFTWARE REQUIREMENTS
          ...createSectionHeader('System Requirements & Deployment Specification', '8'),
          createMetaTable([
            ['Client Hardware', 'Standard PC, Mac, Tablet, or Mobile with minimum 2GB RAM and modern display resolution (1366x768 or higher).'],
            ['Client Web Browsers', 'Google Chrome 110+, Mozilla Firefox 115+, Apple Safari 16+, Microsoft Edge 110+.'],
            ['Server Runtime', 'Node.js version 20.x or higher, npm 10.x.'],
            ['Memory Footprint', 'Server requires 512MB to 1GB RAM; container cold start < 1.5 seconds.'],
            ['Network Protocols', 'HTTPS on standard web port (Port 3000 mapped via reverse proxy) with WebSocket support.'],
            ['Storage Requirements', 'Persistent database storage with cloud backup and JSON-compatible document store.']
          ]),

          // SECTION 9: FUTURE SCOPE & ENHANCEMENTS
          ...createSectionHeader('Future Scope & Roadmap Enhancements', '9'),
          createBodyText('The modular architecture of ScholarCore SIMS allows seamless expansion into advanced academic intelligence capabilities:'),
          createBulletItem('AI-Powered Predictive Academic Warning Engine', 'Integration of Gemini models to identify students at risk of course failure or attendance shortage and automatically generate personalized study intervention plans.'),
          createBulletItem('Biometric & RFID IoT Gateway', 'Direct hardware synchronization with campus turnstiles and classroom fingerprint/face-recognition readers for automated attendance ingestion.'),
          createBulletItem('Mobile Student & Parent Companion App', 'Cross-platform mobile application (React Native) enabling parents to view live attendance, instant fee payment receipts, and semester grade push notifications.'),
          createBulletItem('Automated SMS & WhatsApp Notification Dispatcher', 'Automated trigger system delivering instant fee dues reminders, attendance shortage warnings, and examination hall tickets.'),

          // SECTION 10: CONCLUSION
          ...createSectionHeader('Conclusion', '10'),
          createBodyText(
            'ScholarCore SIMS represents a modern, comprehensive, and scalable digital solution for higher education governance. By unifying student records, multi-semester grade management, transparent fee ledger tracking, auditable attendance logging, ID card generation, and real-time executive analytics into a single cohesive web application, the platform dramatically reduces institutional administrative overhead, enhances data transparency, and empowers academic leaders with actionable insights.'
          ),
          createBodyText(
            'This complete synopsis document serves as the formal technical and functional specification for the ScholarCore Student Information Management System.'
          ),

          // Signoff Box
          new Paragraph({ spacing: { before: 240, after: 100 }, children: [] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
                    margins: { top: 140, bottom: 140, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Prepared By:', bold: true, size: 19, color: primaryColor, font: 'Arial' }),
                          new TextRun({ text: '\nScholarCore Core Engineering & Academic Systems Group\nInstitutional ERP Solutions', size: 18, color: darkTextColor, font: 'Arial' })
                        ]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
                    margins: { top: 140, bottom: 140, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Status & Verification:', bold: true, size: 19, color: primaryColor, font: 'Arial' }),
                          new TextRun({ text: '\n✓ Verified Production Release (v2.4)\nAudited & Ready for Institutional Deployment', size: 18, color: secondaryColor, font: 'Arial' })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
