import { dbStore, GuardianRecord, StudentRecord } from '../config/db';
import { DashboardModel } from '../models/Dashboard';

export interface GuardianQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  relationship?: string;
  status?: string;
  city?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class GuardianService {
  constructor() {
    DashboardModel.seedDataIfEmpty();
  }

  public async getGuardians(params: GuardianQueryParams) {
    DashboardModel.seedDataIfEmpty();

    let list = Array.from(dbStore.guardians.values());

    // Search filter across guardian names, parent details, phone, city, mapped students
    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase().trim();
      list = list.filter(g => {
        const primaryMatch =
          (g.guardianName && g.guardianName.toLowerCase().includes(q)) ||
          (g.guardianId && g.guardianId.toLowerCase().includes(q)) ||
          (g.fatherName && g.fatherName.toLowerCase().includes(q)) ||
          (g.motherName && g.motherName.toLowerCase().includes(q)) ||
          (g.primaryPhone && g.primaryPhone.toLowerCase().includes(q)) ||
          (g.email && g.email.toLowerCase().includes(q)) ||
          (g.city && g.city.toLowerCase().includes(q)) ||
          (g.emergencyContactName && g.emergencyContactName.toLowerCase().includes(q));

        if (primaryMatch) return true;

        // Check mapped student names/roll numbers
        if (g.mappedStudentIds && g.mappedStudentIds.length > 0) {
          return g.mappedStudentIds.some(stdId => {
            const student = dbStore.students.get(stdId);
            if (!student) return false;
            return (
              student.fullName.toLowerCase().includes(q) ||
              student.studentId.toLowerCase().includes(q)
            );
          });
        }

        return false;
      });
    }

    // Filter by Relationship
    if (params.relationship && params.relationship !== 'ALL') {
      list = list.filter(g => g.relationship === params.relationship);
    }

    // Filter by Status
    if (params.status && params.status !== 'ALL') {
      list = list.filter(g => g.status === params.status);
    }

    // Filter by City
    if (params.city && params.city !== 'ALL') {
      list = list.filter(g => g.city.toLowerCase() === params.city.toLowerCase());
    }

    // Sorting
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    list.sort((a: any, b: any) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return -1 * sortOrder;
      if (valA > valB) return 1 * sortOrder;
      return 0;
    });

    // Hydrate mapped student details
    const hydratedList = list.map(g => {
      const mappedStudents = (g.mappedStudentIds || [])
        .map(sId => {
          const s = dbStore.students.get(sId);
          if (!s) return null;
          return {
            id: s.id,
            studentId: s.studentId,
            fullName: s.fullName,
            department: s.department
          };
        })
        .filter(Boolean);

      return {
        ...g,
        mappedStudents
      };
    });

    // Compute Stats
    const total = hydratedList.length;
    const active = hydratedList.filter(g => g.status === 'Active').length;
    const inactive = hydratedList.filter(g => g.status === 'Inactive').length;
    const totalMappedStudents = hydratedList.reduce(
      (acc, g) => acc + (g.mappedStudentIds ? g.mappedStudentIds.length : 0),
      0
    );
    const emergencyContactsCount = hydratedList.filter(
      g => g.emergencyContactName && g.emergencyContactPhone
    ).length;

    // Pagination
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 9);
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedGuardians = hydratedList.slice(startIndex, startIndex + limit);

    return {
      guardians: paginatedGuardians,
      stats: {
        total,
        active,
        inactive,
        totalMappedStudents,
        emergencyContactsCount
      },
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        limit
      }
    };
  }

  public async getGuardianById(id: string) {
    DashboardModel.seedDataIfEmpty();
    const g = dbStore.guardians.get(id);
    if (!g) return null;

    const mappedStudents = (g.mappedStudentIds || [])
      .map(sId => {
        const s = dbStore.students.get(sId);
        if (!s) return null;
        return {
          id: s.id,
          studentId: s.studentId,
          fullName: s.fullName,
          department: s.department,
          email: s.email,
          phone: s.phone,
          status: s.status
        };
      })
      .filter(Boolean);

    return {
      ...g,
      mappedStudents
    };
  }

  public async createGuardian(data: Partial<GuardianRecord>, actorName: string = 'System Admin') {
    DashboardModel.seedDataIfEmpty();

    if (!data.guardianName || !data.primaryPhone || !data.relationship) {
      throw new Error('Primary Guardian Name, Relationship, and Phone Number are required.');
    }

    const count = dbStore.guardians.size + 1;
    const id = `grd-${Date.now()}`;
    const guardianId = `GRD-2026-${String(count).padStart(3, '0')}`;

    const newGuardian: GuardianRecord = {
      id,
      guardianId,
      fatherName: data.fatherName || data.guardianName,
      fatherOccupation: data.fatherOccupation || '',
      fatherPhone: data.fatherPhone || '',
      fatherEmail: data.fatherEmail || '',
      motherName: data.motherName || '',
      motherOccupation: data.motherOccupation || '',
      motherPhone: data.motherPhone || '',
      motherEmail: data.motherEmail || '',
      guardianName: data.guardianName,
      relationship: data.relationship || 'Father',
      occupation: data.occupation || data.fatherOccupation || '',
      primaryPhone: data.primaryPhone,
      email: data.email || data.fatherEmail || '',
      annualIncome: Number(data.annualIncome) || 0,
      emergencyContactName: data.emergencyContactName || data.guardianName,
      emergencyContactPhone: data.emergencyContactPhone || data.primaryPhone,
      emergencyContactAltPhone: data.emergencyContactAltPhone || '',
      emergencyRelationship: data.emergencyRelationship || data.relationship || 'Primary Guardian',
      emergencyAddress: data.emergencyAddress || data.residentialAddress || '',
      residentialAddress: data.residentialAddress || '',
      city: data.city || 'Delhi',
      state: data.state || 'Delhi',
      zipCode: data.zipCode || '110001',
      country: data.country || 'India',
      mappedStudentIds: data.mappedStudentIds || [],
      status: data.status || 'Active',
      createdAt: new Date().toISOString()
    };

    dbStore.guardians.set(id, newGuardian);

    // Log Activity
    const actId = `act-${Date.now()}`;
    dbStore.activities.unshift({
      id: actId,
      title: `Guardian Profile Registered: ${newGuardian.guardianId}`,
      description: `Guardian '${newGuardian.guardianName}' (${newGuardian.relationship}) registered by ${actorName}. Phone: ${newGuardian.primaryPhone}`,
      category: 'System',
      actorName,
      actorRole: 'Administrator',
      timestamp: new Date().toISOString(),
      badgeType: 'gold'
    });

    return newGuardian;
  }

  public async updateGuardian(id: string, data: Partial<GuardianRecord>, actorName: string = 'System Admin') {
    DashboardModel.seedDataIfEmpty();

    const existing = dbStore.guardians.get(id);
    if (!existing) {
      throw new Error('Guardian profile record not found.');
    }

    const updated: GuardianRecord = {
      ...existing,
      ...data,
      annualIncome: data.annualIncome !== undefined ? Number(data.annualIncome) : existing.annualIncome,
      mappedStudentIds: data.mappedStudentIds || existing.mappedStudentIds,
      updatedAt: new Date().toISOString()
    };

    dbStore.guardians.set(id, updated);

    // Log Activity
    const actId = `act-${Date.now()}`;
    dbStore.activities.unshift({
      id: actId,
      title: `Guardian Profile Updated: ${updated.guardianId}`,
      description: `Updated profile details for '${updated.guardianName}' by ${actorName}.`,
      category: 'System',
      actorName,
      actorRole: 'Administrator',
      timestamp: new Date().toISOString(),
      badgeType: 'info'
    });

    return updated;
  }

  public async deleteGuardian(id: string, actorName: string = 'System Admin') {
    DashboardModel.seedDataIfEmpty();

    const existing = dbStore.guardians.get(id);
    if (!existing) {
      throw new Error('Guardian profile record not found.');
    }

    dbStore.guardians.delete(id);

    // Log Activity
    const actId = `act-${Date.now()}`;
    dbStore.activities.unshift({
      id: actId,
      title: `Guardian Record Deleted: ${existing.guardianId}`,
      description: `Guardian '${existing.guardianName}' permanently removed from system by ${actorName}.`,
      category: 'System',
      actorName,
      actorRole: 'Administrator',
      timestamp: new Date().toISOString(),
      badgeType: 'danger'
    });

    return { message: `Guardian profile '${existing.guardianId}' deleted successfully.` };
  }

  public async getStudentOptions() {
    DashboardModel.seedDataIfEmpty();
    const activeStudents = Array.from(dbStore.students.values()).map(s => ({
      id: s.id,
      studentId: s.studentId,
      fullName: s.fullName,
      department: s.department
    }));

    return activeStudents;
  }
}

export const guardianService = new GuardianService();
