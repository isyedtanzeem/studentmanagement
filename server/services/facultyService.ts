import { dbStore, FacultyRecord } from '../config/db';
import { saveDoc, deleteDoc } from '../config/mongo';

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

    // Sorting
    const sortBy = params.sortBy || 'fullName';
    const sortOrder = params.sortOrder === 'desc' ? -1 : 1;

    facultyList.sort((a: any, b: any) => {
      const valA = (a[sortBy] || '').toString().toLowerCase();
      const valB = (b[sortBy] || '').toString().toLowerCase();
      if (valA < valB) return -1 * sortOrder;
      if (valA > valB) return 1 * sortOrder;
      return 0;
    });

    const totalItems = facultyList.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedList = facultyList.slice(startIndex, startIndex + limit);

    // Compute stats
    const allFaculty = Array.from(dbStore.faculty.values());
    const stats = {
      total: allFaculty.length,
      active: allFaculty.filter(f => f.status === 'Active').length,
      onLeave: allFaculty.filter(f => f.status === 'On Leave').length,
      hodCount: allFaculty.filter(f => f.designation.toUpperCase().includes('HOD')).length,
      professorsCount: allFaculty.filter(f => f.designation.toUpperCase().includes('PROFESSOR') && !f.designation.toUpperCase().includes('ASST')).length,
      asstProfessorsCount: allFaculty.filter(f => f.designation.toUpperCase().includes('ASST')).length
    };

    return {
      success: true,
      data: paginatedList,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      },
      stats
    };
  }

  public async getFacultyById(id: string) {
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
    await saveDoc('faculty', id, newFaculty);

    // Audit Log
    const audit = {
      id: `audit-${Date.now()}`,
      userId: 'admin-01',
      userEmail: 'admin@scholarcore.edu.in',
      userRole: 'Admin',
      action: 'FACULTY_REGISTERED',
      ipAddress: '127.0.0.1',
      details: `Registered new faculty: ${newFaculty.fullName} (${newFaculty.designation}) in ${newFaculty.department}`,
      timestamp: new Date().toISOString()
    };
    dbStore.auditLogs.unshift(audit);
    saveDoc('audit_logs', audit.id, audit);

    return {
      success: true,
      message: `Faculty '${newFaculty.fullName}' registered successfully as ${newFaculty.designation}.`,
      data: newFaculty
    };
  }

  public async updateFaculty(id: string, data: Partial<FacultyRecord>, actorName: string = 'System Admin') {
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
    await saveDoc('faculty', id, updated);

    // Audit Log
    const audit = {
      id: `audit-${Date.now()}`,
      userId: 'admin-01',
      userEmail: 'admin@scholarcore.edu.in',
      userRole: 'Admin',
      action: 'FACULTY_UPDATED',
      ipAddress: '127.0.0.1',
      details: `Updated faculty dossier for ${updated.fullName} (${updated.designation})`,
      timestamp: new Date().toISOString()
    };
    dbStore.auditLogs.unshift(audit);
    saveDoc('audit_logs', audit.id, audit);

    return {
      success: true,
      message: `Faculty '${updated.fullName}' record updated successfully.`,
      data: updated
    };
  }

  public async deleteFaculty(id: string, actorName: string = 'System Admin') {
    const existing = dbStore.faculty.get(id);

    if (!existing) {
      throw new Error(`Faculty member with ID '${id}' not found.`);
    }

    dbStore.faculty.delete(id);
    await deleteDoc('faculty', id);

    // Audit Log
    const audit = {
      id: `audit-${Date.now()}`,
      userId: 'admin-01',
      userEmail: 'admin@scholarcore.edu.in',
      userRole: 'Admin',
      action: 'FACULTY_DELETED',
      ipAddress: '127.0.0.1',
      details: `Removed faculty member: ${existing.fullName} (${existing.employeeId})`,
      timestamp: new Date().toISOString()
    };
    dbStore.auditLogs.unshift(audit);
    saveDoc('audit_logs', audit.id, audit);

    return {
      success: true,
      message: `Faculty '${existing.fullName}' deleted successfully.`
    };
  }
}

export const facultyService = new FacultyService();
