import { dbStore } from '../config/db';
import { DashboardModel } from '../models/Dashboard';

export interface ReportFilterOptions {
  department?: string;
  year?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export class ReportService {
  private static ensureSeeded() {
    DashboardModel.seedDataIfEmpty();
  }

  // 1. Student Report
  public static getStudentReport(filters: ReportFilterOptions = {}) {
    this.ensureSeeded();
    let students = Array.from(dbStore.students.values());

    if (filters.department && filters.department !== 'ALL') {
      students = students.filter(s => s.department === filters.department);
    }
    if (filters.year && filters.year !== 'ALL') {
      students = students.filter(s => String(s.enrollmentYear) === String(filters.year) || s.academicBatch?.includes(filters.year));
    }
    if (filters.status && filters.status !== 'ALL') {
      students = students.filter(s => s.status === filters.status);
    }

    const totalStudents = students.length;
    const activeCount = students.filter(s => s.status === 'Active').length;
    const graduatedCount = students.filter(s => s.status === 'Graduated').length;
    const suspendedCount = students.filter(s => s.status === 'Suspended').length;
    const inactiveCount = students.filter(s => s.status === 'Inactive').length;

    // Fee clearance
    const feePaid = students.filter(s => s.feeStatus === 'Paid').length;
    const feePending = students.filter(s => s.feeStatus === 'Due').length;
    const feePartial = students.filter(s => s.feeStatus === 'Partial').length;

    // GPA Statistics
    const gpas = students.map(s => s.gpa || 0);
    const avgCgpa = gpas.length > 0 ? Number((gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2)) : 0;
    const topPerformers = students.filter(s => (s.gpa || 0) >= 3.5 || (s.gpa || 0) >= 8.5).length;

    // Department breakdown
    const deptMap = new Map<string, number>();
    students.forEach(s => {
      deptMap.set(s.department, (deptMap.get(s.department) || 0) + 1);
    });
    const byDepartment = Array.from(deptMap.entries()).map(([department, count]) => ({
      department,
      count,
      percentage: totalStudents > 0 ? Number(((count / totalStudents) * 100).toFixed(1)) : 0
    }));

    // Academic Year / Enrollment Year breakdown
    const yearMap = new Map<string, number>();
    students.forEach(s => {
      const yearStr = s.enrollmentYear ? String(s.enrollmentYear) : 'Unknown';
      yearMap.set(yearStr, (yearMap.get(yearStr) || 0) + 1);
    });
    const byAcademicYear = Array.from(yearMap.entries()).map(([year, count]) => ({
      year,
      count
    }));

    return {
      totalStudents,
      activeCount,
      graduatedCount,
      suspendedCount,
      onLeaveCount: inactiveCount,
      feePaid,
      feePending,
      feePartial,
      avgCgpa,
      topPerformers,
      byDepartment,
      byAcademicYear,
      studentRecords: students.map(s => ({
        id: s.id,
        studentId: s.studentId,
        fullName: s.fullName,
        email: s.email,
        department: s.department,
        academicYear: s.enrollmentYear ? String(s.enrollmentYear) : '2024',
        semester: s.currentSemester ? String(s.currentSemester) : '1',
        gender: s.gender,
        cgpa: s.gpa || 0,
        feeStatus: s.feeStatus || 'Paid',
        status: s.status,
        enrollmentDate: s.createdAt
      }))
    };
  }

  // 2. Admission Report
  public static getAdmissionReport(filters: ReportFilterOptions = {}) {
    this.ensureSeeded();
    let admissions = Array.from(dbStore.admissions.values());

    if (filters.department && filters.department !== 'ALL') {
      admissions = admissions.filter(a => a.department === filters.department);
    }
    if (filters.status && filters.status !== 'ALL') {
      admissions = admissions.filter(a => a.status === filters.status);
    }

    const totalApplications = admissions.length;
    const approvedCount = admissions.filter(a => a.status === 'Approved').length;
    const pendingCount = admissions.filter(a => a.status === 'Pending').length;
    const reviewCount = admissions.filter(a => a.status === 'Under Review' || a.status === 'Document Verification').length;
    const rejectedCount = admissions.filter(a => a.status === 'Rejected').length;

    const conversionRate = totalApplications > 0
      ? Number(((approvedCount / totalApplications) * 100).toFixed(1))
      : 0;

    // By Department
    const deptMap = new Map<string, { total: number; approved: number; pending: number }>();
    admissions.forEach(a => {
      const curr = deptMap.get(a.department) || { total: 0, approved: 0, pending: 0 };
      curr.total += 1;
      if (a.status === 'Approved') curr.approved += 1;
      if (a.status === 'Pending' || a.status === 'Under Review' || a.status === 'Document Verification') curr.pending += 1;
      deptMap.set(a.department, curr);
    });

    const byDepartment = Array.from(deptMap.entries()).map(([department, data]) => ({
      department,
      total: data.total,
      approved: data.approved,
      pending: data.pending,
      approvalRate: data.total > 0 ? Number(((data.approved / data.total) * 100).toFixed(1)) : 0
    }));

    // By Quota / Category
    const categoryMap = new Map<string, number>();
    admissions.forEach(a => {
      const cat = a.category || 'General';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });
    const byCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count
    }));

    return {
      totalApplications,
      approvedCount,
      pendingCount,
      reviewCount,
      rejectedCount,
      conversionRate,
      byDepartment,
      byCategory,
      admissionRecords: admissions.map(a => ({
        id: a.id,
        applicantName: a.applicantName,
        email: a.email,
        department: a.department,
        category: a.category || 'General',
        score: a.entranceExamScore || a.classXIIPercentage || 85,
        status: a.status,
        applicationDate: a.appliedDate
      }))
    };
  }

  // 3. Department Report
  public static getDepartmentReport() {
    this.ensureSeeded();
    const departments = Array.from(dbStore.departments.values());
    const students = Array.from(dbStore.students.values());
    const faculty = Array.from(dbStore.faculty.values());
    const courses = Array.from(dbStore.courses.values());

    const reportData = departments.map(d => {
      const deptStudents = students.filter(s => s.department === d.name);
      const deptFaculty = faculty.filter(f => f.department === d.name);
      const deptCourses = courses.filter(c => c.department === d.name);

      const capacity = 120;
      const enrolled = deptStudents.length || d.studentCount || 0;
      const fillRate = capacity > 0 ? Number(((enrolled / capacity) * 100).toFixed(1)) : 0;

      const avgGpa = deptStudents.length > 0
        ? Number((deptStudents.reduce((acc, s) => acc + (s.gpa || 0), 0) / deptStudents.length).toFixed(2))
        : 3.5;

      return {
        id: d.id,
        code: d.code,
        name: d.name,
        headOfDepartment: d.headOfDepartment,
        capacity,
        enrolledStudents: enrolled,
        facultyCount: deptFaculty.length || d.facultyCount || 10,
        courseCount: deptCourses.length || d.coursesCount || 5,
        fillRate,
        avgGpa,
        establishedYear: d.establishedYear || 2005
      };
    });

    const totalCapacity = reportData.reduce((acc, d) => acc + d.capacity, 0);
    const totalEnrolled = reportData.reduce((acc, d) => acc + d.enrolledStudents, 0);
    const overallFillRate = totalCapacity > 0 ? Number(((totalEnrolled / totalCapacity) * 100).toFixed(1)) : 0;

    return {
      totalDepartments: departments.length,
      totalCapacity,
      totalEnrolled,
      overallFillRate,
      departments: reportData
    };
  }

  // 4. Gender Report
  public static getGenderReport(filters: ReportFilterOptions = {}) {
    this.ensureSeeded();
    let students = Array.from(dbStore.students.values());

    if (filters.department && filters.department !== 'ALL') {
      students = students.filter(s => s.department === filters.department);
    }

    const total = students.length;
    const maleCount = students.filter(s => s.gender === 'Male').length;
    const femaleCount = students.filter(s => s.gender === 'Female').length;
    const otherCount = students.filter(s => s.gender === 'Other').length;

    const maleRatio = total > 0 ? Number(((maleCount / total) * 100).toFixed(1)) : 0;
    const femaleRatio = total > 0 ? Number(((femaleCount / total) * 100).toFixed(1)) : 0;
    const otherRatio = total > 0 ? Number(((otherCount / total) * 100).toFixed(1)) : 0;

    // Academic Performance by Gender
    const maleStudents = students.filter(s => s.gender === 'Male');
    const femaleStudents = students.filter(s => s.gender === 'Female');

    const maleAvgGpa = maleStudents.length > 0
      ? Number((maleStudents.reduce((acc, s) => acc + (s.gpa || 0), 0) / maleStudents.length).toFixed(2))
      : 3.4;
    const femaleAvgGpa = femaleStudents.length > 0
      ? Number((femaleStudents.reduce((acc, s) => acc + (s.gpa || 0), 0) / femaleStudents.length).toFixed(2))
      : 3.6;

    // Gender Distribution per Department
    const deptMap = new Map<string, { male: number; female: number; other: number; total: number }>();
    students.forEach(s => {
      const curr = deptMap.get(s.department) || { male: 0, female: 0, other: 0, total: 0 };
      curr.total += 1;
      if (s.gender === 'Male') curr.male += 1;
      else if (s.gender === 'Female') curr.female += 1;
      else curr.other += 1;
      deptMap.set(s.department, curr);
    });

    const byDepartment = Array.from(deptMap.entries()).map(([department, data]) => ({
      department,
      total: data.total,
      male: data.male,
      female: data.female,
      other: data.other,
      femalePercentage: data.total > 0 ? Number(((data.female / data.total) * 100).toFixed(1)) : 0
    }));

    return {
      totalStudents: total,
      maleCount,
      femaleCount,
      otherCount,
      maleRatio,
      femaleRatio,
      otherRatio,
      maleAvgGpa,
      femaleAvgGpa,
      byDepartment
    };
  }

  // 5. Alumni Report
  public static getAlumniReport(filters: ReportFilterOptions = {}) {
    this.ensureSeeded();
    let alumni = Array.from(dbStore.alumni.values());

    if (filters.department && filters.department !== 'ALL') {
      alumni = alumni.filter(a => a.department === filters.department);
    }
    if (filters.year && filters.year !== 'ALL') {
      alumni = alumni.filter(a => Number(a.graduationYear) === Number(filters.year));
    }

    const totalAlumni = alumni.length;
    const employed = alumni.filter(a => a.employmentStatus === 'Employed').length;
    const founders = alumni.filter(a => a.employmentStatus === 'Self-Employed / Founder').length;
    const higherEd = alumni.filter(a => a.employmentStatus === 'Higher Studies').length;
    const seeking = alumni.filter(a => a.employmentStatus === 'Seeking Opportunities').length;

    const careerSuccessRate = totalAlumni > 0
      ? Number((((employed + founders + higherEd) / totalAlumni) * 100).toFixed(1))
      : 0;

    // Total donations
    let totalDonations = 0;
    alumni.forEach(a => {
      if (a.givingHistory) {
        a.givingHistory.forEach(g => {
          totalDonations += g.amount;
        });
      }
    });

    // Industry Breakdown
    const indMap = new Map<string, number>();
    alumni.forEach(a => {
      if (a.industry) indMap.set(a.industry, (indMap.get(a.industry) || 0) + 1);
    });
    const byIndustry = Array.from(indMap.entries()).map(([industry, count]) => ({
      industry,
      count
    }));

    // Cohorts by Year
    const yearMap = new Map<number, number>();
    alumni.forEach(a => {
      yearMap.set(a.graduationYear, (yearMap.get(a.graduationYear) || 0) + 1);
    });
    const byGraduationYear = Array.from(yearMap.entries()).map(([year, count]) => ({
      year,
      count
    })).sort((a, b) => b.year - a.year);

    return {
      totalAlumni,
      employed,
      founders,
      higherEd,
      seeking,
      careerSuccessRate,
      totalDonations,
      byIndustry,
      byGraduationYear,
      alumniRecords: alumni.map(a => ({
        id: a.id,
        studentId: a.studentId,
        fullName: a.fullName,
        email: a.email,
        graduationYear: a.graduationYear,
        department: a.department,
        employmentStatus: a.employmentStatus,
        currentCompany: a.currentCompany || 'N/A',
        designation: a.designation || 'N/A',
        industry: a.industry || 'N/A',
        workLocation: a.workLocation || `${a.currentCity || ''}, ${a.currentCountry || ''}`
      }))
    };
  }
}
