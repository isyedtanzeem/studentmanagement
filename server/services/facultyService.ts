import { dbStore, FacultyRecord } from '../config/db';
import { DashboardModel } from '../models/Dashboard';

export interface FacultyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  designation?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class FacultyService {
  public async getFacultyList(params: FacultyQueryParams = {}) {
    DashboardModel.seedDataIfEmpty();

    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const search = (params.search || '').trim().toLowerCase();
    const departmentFilter = (params.department || '').trim();
    const designationFilter = (params.designation || '').trim();
    const statusFilter = (params.status || '').trim();

    let facultyList = Array.from(dbStore.faculty.values());

    // Filtering
    if (search) {
      facultyList = facultyList.filter(f =>
        f.fullName.toLowerCase().includes(search) ||
        f.employeeId.toLowerCase().includes(search) ||
        f.email.toLowerCase().includes(search) ||
        f.department.toLowerCase().includes(search) ||
        f.designation.toLowerCase().includes(search)
      );
    }

    if (departmentFilter && departmentFilter !== 'All') {
      facultyList = facultyList.filter(f => f.department === departmentFilter);
    }

    if (designationFilter && designationFilter !== 'All') {
      facultyList = facultyList.filter(f =>
        f.designation.toLowerCase().includes(designationFilter.toLowerCase())
      );
    }

    if (statusFilter && statusFilter !== 'All') {
      facultyList = facultyList.filter(f => f.status === statusFilter);
    }

    // Stats calculation
    const allFaculty = Array.from(dbStore.faculty.values());
    const stats = {
      total: allFaculty.length,
      hodCount: allFaculty.filter(f => f.designation.toUpperCase().includes('HOD')).length,
      professorCount: allFaculty.filter(f => f.designation.toLowerCase().includes('professor') && !f.designation.toUpperCase().includes('HOD') && !f.designation.toLowerCase().includes('asst')).length,
      asstProfessorCount: allFaculty.filter(f => f.designation.toLowerCase().includes('asst') || f.designation.toLowerCase().includes('assistant')).length,
      activeCount: allFaculty.filter(f => f.status === 'Active').length
    };

    // Sorting
    const sortBy = params.sortBy || 'fullName';
    const sortOrder = params.sortOrder || 'asc';

    facultyList.sort((a, b) => {
      let valA: any = (a as any)[sortBy] || '';
      let valB: any = (b as any)[sortBy] || '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const totalItems = facultyList.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = facultyList.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: paginatedItems,
      stats,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit
      }
    };
  }

  public async getFacultyById(id: string) {
    DashboardModel.seedDataIfEmpty();
    const faculty = dbStore.faculty.get(id);
    if (!faculty) {
      throw new Error(`Faculty member with ID '${id}' not found.`);
    }

    // Find courses taught by this faculty if any
    const courses = Array.from(dbStore.courses.values()).filter(c =>
      c.instructorName && c.instructorName.toLowerCase().includes(faculty.fullName.toLowerCase())
    );

    return {
      success: true,
      data: {
        ...faculty,
        coursesTaught: courses
      }
    };
  }

  public async createFaculty(data: Partial<FacultyRecord>, actorName: string = 'System Admin') {
    DashboardModel.seedDataIfEmpty();

    if (!data.fullName || !data.fullName.trim()) {
      throw new Error('Faculty Full Name is required.');
    }
    if (!data.department || !data.department.trim()) {
      throw new Error('Department assignment is required.');
    }
    if (!data.designation || !data.designation.trim()) {
      throw new Error('Designation (HOD, Professor, Asst. Professor) is required.');
    }

    const id = `fac-${Date.now()}`;
    const deptPrefix = data.department.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3) || 'GEN';
    const randomNum = Math.floor(100 + Math.random() * 900);
    const employeeId = data.employeeId?.trim() || `FAC-${deptPrefix}-${randomNum}`;

    const newFaculty: FacultyRecord = {
      id,
      employeeId,
      fullName: data.fullName.trim(),
      email: data.email?.trim() || `${data.fullName.toLowerCase().replace(/[^a-z]/g, '')}@scholarcore.edu.in`,
      phone: data.phone?.trim() || '',
      department: data.department.trim(),
      designation: data.designation.trim(),
      qualification: data.qualification?.trim() || '',
      joiningDate: data.joiningDate || new Date().toISOString().split('T')[0],
      status: data.status || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dbStore.faculty.set(id, newFaculty);

    // Audit Log
    dbStore.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: 'admin-01',
      userEmail: 'admin@scholarcore.edu.in',
      userRole: 'Admin',
      action: 'FACULTY_REGISTERED',
      ipAddress: '127.0.0.1',
      details: `Registered new faculty: ${newFaculty.fullName} (${newFaculty.designation}) in ${newFaculty.department}`,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      message: `Faculty '${newFaculty.fullName}' registered successfully as ${newFaculty.designation}.`,
      data: newFaculty
    };
  }

  public async updateFaculty(id: string, data: Partial<FacultyRecord>, actorName: string = 'System Admin') {
    DashboardModel.seedDataIfEmpty();
    const existing = dbStore.faculty.get(id);

    if (!existing) {
      throw new Error(`Faculty member with ID '${id}' not found.`);
    }

    const updated: FacultyRecord = {
      ...existing,
      ...data,
      id: existing.id,
      updatedAt: new Date().toISOString()
    };

    dbStore.faculty.set(id, updated);

    // Audit Log
    dbStore.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: 'admin-01',
      userEmail: 'admin@scholarcore.edu.in',
      userRole: 'Admin',
      action: 'FACULTY_UPDATED',
      ipAddress: '127.0.0.1',
      details: `Updated faculty dossier for ${updated.fullName} (${updated.designation})`,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      message: `Faculty '${updated.fullName}' record updated successfully.`,
      data: updated
    };
  }

  public async deleteFaculty(id: string, actorName: string = 'System Admin') {
    DashboardModel.seedDataIfEmpty();
    const existing = dbStore.faculty.get(id);

    if (!existing) {
      throw new Error(`Faculty member with ID '${id}' not found.`);
    }

    dbStore.faculty.delete(id);

    // Audit Log
    dbStore.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: 'admin-01',
      userEmail: 'admin@scholarcore.edu.in',
      userRole: 'Admin',
      action: 'FACULTY_DELETED',
      ipAddress: '127.0.0.1',
      details: `Removed faculty member: ${existing.fullName} (${existing.employeeId})`,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      message: `Faculty '${existing.fullName}' deleted successfully.`
    };
  }
}

export const facultyService = new FacultyService();
