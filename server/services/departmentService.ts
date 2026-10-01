import { dbStore, DepartmentRecord } from '../config/db';
import { DashboardModel } from '../models/Dashboard';

export interface DepartmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class DepartmentService {
  constructor() {
    DashboardModel.seedDataIfEmpty();
  }

  public async getDepartments(params: DepartmentQueryParams) {
    DashboardModel.seedDataIfEmpty();
    this.reconcileHodAssignments();

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const search = (params.search || '').trim().toLowerCase();
    const status = params.status || 'ALL';
    const sortBy = params.sortBy || 'name';
    const sortOrder = params.sortOrder || 'asc';

    let list = Array.from(dbStore.departments.values());

    // Dynamically update counts if data exists in memory
    const studentsArr = Array.from(dbStore.students.values());
    const facultyArr = Array.from(dbStore.faculty.values());
    const coursesArr = Array.from(dbStore.courses.values());

    list = list.map(dept => {
      const realStudentCount = studentsArr.filter(s => s.department === dept.name).length;
      const realFacultyCount = facultyArr.filter(f => f.department === dept.name).length;
      const realCoursesCount = coursesArr.filter(c => c.department === dept.name).length;

      return {
        ...dept,
        status: dept.status || 'Active',
        studentCount: realStudentCount > 0 ? realStudentCount : (dept.studentCount || 0),
        facultyCount: realFacultyCount > 0 ? realFacultyCount : (dept.facultyCount || 0),
        coursesCount: realCoursesCount > 0 ? realCoursesCount : (dept.coursesCount || 0)
      };
    });

    // Compute Overall Stats before search filtering
    const total = list.length;
    const active = list.filter(d => d.status === 'Active').length;
    const inactive = list.filter(d => d.status === 'Inactive').length;
    const totalStudents = list.reduce((sum, d) => sum + d.studentCount, 0);
    const totalFaculty = list.reduce((sum, d) => sum + d.facultyCount, 0);
    const totalCourses = list.reduce((sum, d) => sum + d.coursesCount, 0);

    // Search filter
    if (search) {
      list = list.filter(d =>
        d.name.toLowerCase().includes(search) ||
        d.code.toLowerCase().includes(search) ||
        d.headOfDepartment.toLowerCase().includes(search) ||
        (d.buildingLocation && d.buildingLocation.toLowerCase().includes(search)) ||
        (d.description && d.description.toLowerCase().includes(search))
      );
    }

    // Status filter
    if (status !== 'ALL') {
      list = list.filter(d => d.status === status);
    }

    // Sorting
    list.sort((a, b) => {
      let aVal: any = (a as any)[sortBy] ?? '';
      let bVal: any = (b as any)[sortBy] ?? '';

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const totalItems = list.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = list.slice(startIndex, startIndex + limit);

    return {
      departments: paginatedItems,
      stats: {
        total,
        active,
        inactive,
        totalStudents,
        totalFaculty,
        totalCourses
      },
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit
      }
    };
  }

  public async getDepartmentById(id: string) {
    DashboardModel.seedDataIfEmpty();
    const dept = dbStore.departments.get(id);

    if (!dept) {
      return null;
    }

    // Related courses & faculty
    const courses = Array.from(dbStore.courses.values()).filter(c => c.department === dept.name);
    const facultyMembers = Array.from(dbStore.faculty.values()).filter(f => f.department === dept.name);
    const students = Array.from(dbStore.students.values()).filter(s => s.department === dept.name);

    return {
      ...dept,
      status: dept.status || 'Active',
      studentCount: students.length > 0 ? students.length : dept.studentCount,
      facultyCount: facultyMembers.length > 0 ? facultyMembers.length : dept.facultyCount,
      coursesCount: courses.length > 0 ? courses.length : dept.coursesCount,
      coursesList: courses,
      facultyList: facultyMembers
    };
  }

  public async createDepartment(data: Partial<DepartmentRecord>, actorName = 'System Admin') {
    DashboardModel.seedDataIfEmpty();

    if (!data.code || !data.name || !data.headOfDepartment) {
      throw new Error('Department Code, Name, and Head of Department are required.');
    }

    const codeUpper = data.code.trim().toUpperCase();
    const nameTrimmed = data.name.trim();

    // Check duplicate code or name
    const existingCode = Array.from(dbStore.departments.values()).find(
      d => d.code.toUpperCase() === codeUpper
    );

    if (existingCode) {
      throw new Error(`Department with code '${codeUpper}' already exists.`);
    }

    const newId = `dept-${Date.now()}`;
    const now = new Date().toISOString();

    const newDepartment: DepartmentRecord = {
      id: newId,
      code: codeUpper,
      name: nameTrimmed,
      headOfDepartment: data.headOfDepartment.trim(),
      hodEmail: data.hodEmail?.trim() || '',
      hodPhone: data.hodPhone?.trim() || '',
      hodDesignation: data.hodDesignation?.trim() || 'Head of Department',
      studentCount: Number(data.studentCount) || 0,
      facultyCount: Number(data.facultyCount) || 0,
      coursesCount: Number(data.coursesCount) || 0,
      establishedYear: Number(data.establishedYear) || new Date().getFullYear(),
      buildingLocation: data.buildingLocation?.trim() || 'Main Campus Block',
      status: data.status || 'Active',
      description: data.description?.trim() || '',
      createdAt: now,
      updatedAt: now
    };

    this.syncDepartmentHod(nameTrimmed, data);

    dbStore.departments.set(newId, newDepartment);

    // Audit Activity
    dbStore.activities.unshift({
      id: `act-${Date.now()}`,
      title: 'New Department Created',
      description: `Department '${newDepartment.name}' (${newDepartment.code}) was created under HOD ${newDepartment.headOfDepartment}.`,
      category: 'Academic',
      actorName,
      actorRole: 'Registrar',
      timestamp: now,
      badgeType: 'gold'
    });

    return newDepartment;
  }

  public async updateDepartment(id: string, data: Partial<DepartmentRecord>, actorName = 'System Admin') {
    DashboardModel.seedDataIfEmpty();

    const existing = dbStore.departments.get(id);
    if (!existing) {
      throw new Error('Department not found.');
    }

    if (data.code) {
      const codeUpper = data.code.trim().toUpperCase();
      const duplicate = Array.from(dbStore.departments.values()).find(
        d => d.id !== id && d.code.toUpperCase() === codeUpper
      );
      if (duplicate) {
        throw new Error(`Department with code '${codeUpper}' already exists.`);
      }
      existing.code = codeUpper;
    }

    if (data.name) existing.name = data.name.trim();
    if (data.headOfDepartment) {
      existing.headOfDepartment = data.headOfDepartment.trim();
      this.syncDepartmentHod(existing.name, data, id);
    }
    if (data.hodEmail !== undefined) existing.hodEmail = data.hodEmail.trim();
    if (data.hodPhone !== undefined) existing.hodPhone = data.hodPhone.trim();
    if (data.hodDesignation !== undefined) existing.hodDesignation = data.hodDesignation.trim();
    if (data.establishedYear !== undefined) existing.establishedYear = Number(data.establishedYear);
    if (data.buildingLocation !== undefined) existing.buildingLocation = data.buildingLocation.trim();
    if (data.status) existing.status = data.status;
    if (data.description !== undefined) existing.description = data.description.trim();

    existing.updatedAt = new Date().toISOString();

    dbStore.departments.set(id, existing);

    // Audit Activity
    dbStore.activities.unshift({
      id: `act-${Date.now()}`,
      title: 'Department Details Updated',
      description: `Department '${existing.name}' (${existing.code}) record was updated by ${actorName}.`,
      category: 'Academic',
      actorName,
      actorRole: 'Registrar',
      timestamp: new Date().toISOString(),
      badgeType: 'info'
    });

    return existing;
  }

  private syncDepartmentHod(
    departmentName: string,
    data: Partial<DepartmentRecord> & { facultyId?: string },
    departmentId?: string
  ) {
    const selectedFaculty = data.facultyId
      ? dbStore.faculty.get(data.facultyId)
      : Array.from(dbStore.faculty.values()).find(f =>
          f.department === departmentName && f.fullName === data.headOfDepartment?.trim()
        );

    if (!selectedFaculty) return;

    dbStore.faculty.set(selectedFaculty.id, {
      ...selectedFaculty,
      department: departmentName,
      designation: 'HOD',
      updatedAt: new Date().toISOString()
    });

    for (const department of dbStore.departments.values()) {
      if (
        department.id === departmentId ||
        department.headOfDepartment !== selectedFaculty.fullName
      ) continue;

      dbStore.departments.set(department.id, {
        ...department,
        headOfDepartment: 'Not Assigned',
        hodEmail: '',
        hodPhone: '',
        hodDesignation: 'Vacant',
        updatedAt: new Date().toISOString()
      });
    }

    for (const faculty of dbStore.faculty.values()) {
      if (faculty.id === selectedFaculty.id || faculty.department !== departmentName) continue;

      const isCurrentHod = faculty.designation.toUpperCase().includes('HOD');

      if (isCurrentHod) {
        dbStore.faculty.set(faculty.id, {
          ...faculty,
          designation: 'Professor',
          updatedAt: new Date().toISOString()
        });
      }
    }
  }

  private reconcileHodAssignments() {
    for (const faculty of dbStore.faculty.values()) {
      if (!faculty.designation.toUpperCase().includes('HOD')) continue;

      const matchingDepartments = Array.from(dbStore.departments.values()).filter(
        department => department.headOfDepartment === faculty.fullName
      );
      const departmentForFaculty = matchingDepartments.find(
        department => department.name === faculty.department
      );

      for (const department of matchingDepartments) {
        if (department === departmentForFaculty) continue;

        dbStore.departments.set(department.id, {
          ...department,
          headOfDepartment: 'Not Assigned',
          hodEmail: '',
          hodPhone: '',
          hodDesignation: 'Vacant',
          updatedAt: new Date().toISOString()
        });
      }
    }
  }

  public async deleteDepartment(id: string, actorName = 'System Admin') {
    DashboardModel.seedDataIfEmpty();

    const existing = dbStore.departments.get(id);
    if (!existing) {
      throw new Error('Department not found.');
    }

    // Check associated students
    const associatedStudents = Array.from(dbStore.students.values()).filter(
      s => s.department === existing.name
    );

    if (associatedStudents.length > 0) {
      throw new Error(
        `Cannot delete department '${existing.name}'. There are ${associatedStudents.length} students enrolled under this department.`
      );
    }

    dbStore.departments.delete(id);

    // Audit Activity
    dbStore.activities.unshift({
      id: `act-${Date.now()}`,
      title: 'Department Removed',
      description: `Department '${existing.name}' (${existing.code}) was deleted from system records.`,
      category: 'Academic',
      actorName,
      actorRole: 'Registrar',
      timestamp: new Date().toISOString(),
      badgeType: 'danger'
    });

    return { success: true, message: `Department '${existing.name}' deleted successfully.` };
  }

  public async getFacultyOptions() {
    DashboardModel.seedDataIfEmpty();
    const faculty = Array.from(dbStore.faculty.values());

    return faculty.map(f => ({
      id: f.id,
      employeeId: f.employeeId,
      fullName: f.fullName,
      email: f.email,
      phone: f.phone || '',
      designation: f.designation,
      department: f.department,
      qualification: f.qualification || '',
      status: f.status
    }));
  }
}

export const departmentService = new DepartmentService();
