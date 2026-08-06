export interface HigherEducationRecord {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  completionYear?: number;
  country?: string;
}

export interface AlumniGivingRecord {
  id: string;
  amount: number;
  currency: string;
  purpose: string;
  date: string;
  receiptNumber?: string;
}

export interface AlumniRecord {
  id: string;
  studentDbId?: string;
  studentId: string;
  fullName: string;
  email: string;
  phone: string;
  graduationYear: number;
  department: string;
  degree: string;
  cgpa: number;
  photoUrl?: string;
  gender: 'Male' | 'Female' | 'Other';
  employmentStatus: 'Employed' | 'Self-Employed / Founder' | 'Higher Studies' | 'Seeking Opportunities' | 'Other';
  currentCompany?: string;
  designation?: string;
  industry?: string;
  salaryBand?: string;
  workLocation?: string;
  higherEducation?: HigherEducationRecord;
  linkedinUrl?: string;
  githubUrl?: string;
  personalWebsite?: string;
  currentCity?: string;
  currentCountry?: string;
  permanentAddress?: string;
  givingHistory?: AlumniGivingRecord[];
  networkingOptIn: boolean;
  achievements?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlumniAnalyticsReport {
  totalAlumni: number;
  employedCount: number;
  entrepreneurCount: number;
  higherStudiesCount: number;
  seekingCount: number;
  employmentRate: number;
  totalDonationsRaised: number;
  byGraduationYear: Array<{
    year: number;
    total: number;
    employed: number;
    higherStudies: number;
    placementRate: number;
  }>;
  byDepartment: Array<{
    department: string;
    count: number;
    percentage: number;
  }>;
  byIndustry: Array<{
    industry: string;
    count: number;
  }>;
  topCompanies: Array<{
    company: string;
    count: number;
  }>;
  salaryBands: Array<{
    band: string;
    count: number;
  }>;
}
