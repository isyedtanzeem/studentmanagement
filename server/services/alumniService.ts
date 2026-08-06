import { dbStore, AlumniRecord, AlumniGivingRecord } from '../config/db';
import { DashboardModel } from '../models/Dashboard';

export interface AlumniFilters {
  search?: string;
  graduationYear?: number;
  department?: string;
  employmentStatus?: string;
  industry?: string;
  networkingOptIn?: boolean;
}

export class AlumniService {
  private static ensureSeeded() {
    DashboardModel.seedDataIfEmpty();
  }

  public static getAll(filters: AlumniFilters = {}) {
    this.ensureSeeded();
    let records = Array.from(dbStore.alumni.values());

    // Search query match
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      records = records.filter(a =>
        a.fullName.toLowerCase().includes(q) ||
        a.studentId.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.currentCompany && a.currentCompany.toLowerCase().includes(q)) ||
        (a.designation && a.designation.toLowerCase().includes(q)) ||
        (a.workLocation && a.workLocation.toLowerCase().includes(q)) ||
        (a.currentCity && a.currentCity.toLowerCase().includes(q)) ||
        (a.currentCountry && a.currentCountry.toLowerCase().includes(q))
      );
    }

    // Graduation Year filter
    if (filters.graduationYear) {
      records = records.filter(a => Number(a.graduationYear) === Number(filters.graduationYear));
    }

    // Department filter
    if (filters.department && filters.department !== 'ALL') {
      records = records.filter(a => a.department === filters.department);
    }

    // Employment status filter
    if (filters.employmentStatus && filters.employmentStatus !== 'ALL') {
      records = records.filter(a => a.employmentStatus === filters.employmentStatus);
    }

    // Industry filter
    if (filters.industry && filters.industry !== 'ALL') {
      records = records.filter(a => a.industry === filters.industry);
    }

    // Networking consent filter
    if (filters.networkingOptIn !== undefined) {
      records = records.filter(a => a.networkingOptIn === filters.networkingOptIn);
    }

    // Sort by graduation year desc, then full name asc
    records.sort((a, b) => b.graduationYear - a.graduationYear || a.fullName.localeCompare(b.fullName));

    return records;
  }

  public static getById(id: string): AlumniRecord | null {
    this.ensureSeeded();
    return dbStore.alumni.get(id) || null;
  }

  public static create(data: Partial<AlumniRecord>): AlumniRecord {
    this.ensureSeeded();
    const id = `alm-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    const record: AlumniRecord = {
      id,
      studentId: data.studentId || `ALM${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: data.fullName || 'Anonymous Alumni',
      email: data.email || 'alumni@scholarcore.edu',
      phone: data.phone || '+91 90000 00000',
      graduationYear: Number(data.graduationYear) || new Date().getFullYear(),
      department: data.department || 'Computer Science & Engineering',
      degree: data.degree || 'B.Tech',
      cgpa: Number(data.cgpa) || 8.0,
      photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      gender: data.gender || 'Male',
      employmentStatus: data.employmentStatus || 'Employed',
      currentCompany: data.currentCompany || '',
      designation: data.designation || '',
      industry: data.industry || '',
      salaryBand: data.salaryBand || '',
      workLocation: data.workLocation || '',
      higherEducation: data.higherEducation,
      linkedinUrl: data.linkedinUrl || '',
      githubUrl: data.githubUrl || '',
      personalWebsite: data.personalWebsite || '',
      currentCity: data.currentCity || '',
      currentCountry: data.currentCountry || '',
      permanentAddress: data.permanentAddress || '',
      givingHistory: data.givingHistory || [],
      networkingOptIn: Boolean(data.networkingOptIn ?? true),
      achievements: data.achievements || [],
      notes: data.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    dbStore.alumni.set(id, record);

    // Audit log
    dbStore.activities.unshift({
      id: `act-${Date.now()}`,
      title: 'Alumni Profile Created',
      description: `Created new alumni profile for ${record.fullName} (Class of ${record.graduationYear})`,
      category: 'Academic',
      actorName: 'Admin Registrar',
      actorRole: 'Super Admin',
      timestamp: new Date().toISOString(),
      badgeType: 'gold'
    });

    return record;
  }

  public static update(id: string, updates: Partial<AlumniRecord>): AlumniRecord {
    this.ensureSeeded();
    const existing = dbStore.alumni.get(id);
    if (!existing) {
      throw new Error(`Alumni record with ID ${id} not found.`);
    }

    const updated: AlumniRecord = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    dbStore.alumni.set(id, updated);
    return updated;
  }

  public static delete(id: string): boolean {
    this.ensureSeeded();
    return dbStore.alumni.delete(id);
  }

  public static addGiving(id: string, givingData: { amount: number; currency?: string; purpose: string; date?: string }): AlumniRecord {
    this.ensureSeeded();
    const alumni = dbStore.alumni.get(id);
    if (!alumni) {
      throw new Error(`Alumni record with ID ${id} not found.`);
    }

    const newGiving: AlumniGivingRecord = {
      id: `g-${Date.now()}`,
      amount: Number(givingData.amount),
      currency: givingData.currency || 'INR',
      purpose: givingData.purpose || 'General College Alumni Endowment Fund',
      date: givingData.date || new Date().toISOString().split('T')[0],
      receiptNumber: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    };

    const updatedHistory = [...(alumni.givingHistory || []), newGiving];
    const updated = {
      ...alumni,
      givingHistory: updatedHistory,
      updatedAt: new Date().toISOString()
    };

    dbStore.alumni.set(id, updated);
    return updated;
  }

  public static getReportsAndAnalytics() {
    this.ensureSeeded();
    const all = Array.from(dbStore.alumni.values());
    const total = all.length;

    if (total === 0) {
      return {
        totalAlumni: 0,
        employedCount: 0,
        entrepreneurCount: 0,
        higherStudiesCount: 0,
        seekingCount: 0,
        employmentRate: 0,
        totalDonationsRaised: 0,
        byGraduationYear: [],
        byDepartment: [],
        byIndustry: [],
        topCompanies: [],
        salaryBands: [],
      };
    }

    const employedCount = all.filter(a => a.employmentStatus === 'Employed').length;
    const entrepreneurCount = all.filter(a => a.employmentStatus === 'Self-Employed / Founder').length;
    const higherStudiesCount = all.filter(a => a.employmentStatus === 'Higher Studies').length;
    const seekingCount = all.filter(a => a.employmentStatus === 'Seeking Opportunities').length;

    const employedOrFounder = employedCount + entrepreneurCount + higherStudiesCount;
    const employmentRate = Number(((employedOrFounder / total) * 100).toFixed(1));

    // Calculate total giving
    let totalDonationsRaised = 0;
    all.forEach(a => {
      if (a.givingHistory) {
        a.givingHistory.forEach(g => {
          totalDonationsRaised += g.amount;
        });
      }
    });

    // Breakdown by Graduation Year
    const yearMap = new Map<number, { count: number; employed: number; higherStudies: number }>();
    all.forEach(a => {
      const yr = a.graduationYear;
      const curr = yearMap.get(yr) || { count: 0, employed: 0, higherStudies: 0 };
      curr.count += 1;
      if (a.employmentStatus === 'Employed' || a.employmentStatus === 'Self-Employed / Founder') {
        curr.employed += 1;
      }
      if (a.employmentStatus === 'Higher Studies') {
        curr.higherStudies += 1;
      }
      yearMap.set(yr, curr);
    });

    const byGraduationYear = Array.from(yearMap.entries())
      .map(([year, data]) => ({
        year,
        total: data.count,
        employed: data.employed,
        higherStudies: data.higherStudies,
        placementRate: Number((((data.employed + data.higherStudies) / data.count) * 100).toFixed(1))
      }))
      .sort((a, b) => b.year - a.year);

    // Breakdown by Department
    const deptMap = new Map<string, number>();
    all.forEach(a => {
      const dept = a.department || 'Other';
      deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
    });
    const byDepartment = Array.from(deptMap.entries()).map(([department, count]) => ({
      department,
      count,
      percentage: Number(((count / total) * 100).toFixed(1))
    }));

    // Breakdown by Industry
    const indMap = new Map<string, number>();
    all.forEach(a => {
      if (a.industry) {
        indMap.set(a.industry, (indMap.get(a.industry) || 0) + 1);
      }
    });
    const byIndustry = Array.from(indMap.entries()).map(([industry, count]) => ({
      industry,
      count,
    })).sort((a, b) => b.count - a.count);

    // Top Companies
    const companyMap = new Map<string, number>();
    all.forEach(a => {
      if (a.currentCompany && a.currentCompany.trim()) {
        companyMap.set(a.currentCompany.trim(), (companyMap.get(a.currentCompany.trim()) || 0) + 1);
      }
    });
    const topCompanies = Array.from(companyMap.entries())
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Salary Bands
    const salaryMap = new Map<string, number>();
    all.forEach(a => {
      if (a.salaryBand) {
        salaryMap.set(a.salaryBand, (salaryMap.get(a.salaryBand) || 0) + 1);
      }
    });
    const salaryBands = Array.from(salaryMap.entries()).map(([band, count]) => ({
      band,
      count
    }));

    return {
      totalAlumni: total,
      employedCount,
      entrepreneurCount,
      higherStudiesCount,
      seekingCount,
      employmentRate,
      totalDonationsRaised,
      byGraduationYear,
      byDepartment,
      byIndustry,
      topCompanies,
      salaryBands,
    };
  }
}
