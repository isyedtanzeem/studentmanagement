import { dbStore, DepartmentRecord } from '../config/db';
import { saveDoc, deleteDoc } from '../config/mongo';

export interface DepartmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class DepartmentService {
  constructor() {}

  public async getDepartments(params: DepartmentQueryParams) {
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
    const totalDepartments = list.length;
    const activeDepartments = list.filter(d => d.status === 'Active').length;
    const totalStudentsInDepts = list.reduce((acc, d) => acc + (d.studentCount || 0), 0);
    const totalFacultyInDepts = list.reduce((acc, d) => acc + (d.facultyCount || 0), 0);
    const totalCoursesInDepts = list.reduce((acc, d) => acc + (d.coursesCount || 0), 0);

    // Apply Status Filter
    if (status !== 'ALL') {
      list = list.filter(d => d.status === status);
    }

    // Apply Search Filter
    if (search) {
      list = list.filter(
        d =>
          d.name.toLowerCase().includes(search) ||
          d.code.toLowerCase().includes(search) ||
          d.headOfDepartment.toLowerCase().includes(search) ||
          d.buildingLocation.toLowerCase().includes(search)
      );
    }

    // Sorting
    list.sort((a, b) => {
      let fieldA: any = a[sortBy as keyof DepartmentRecord] ?? '';
      let fieldB: any = b[sortBy as keyof DepartmentRecord] ?? '';

      if (typeof fieldA === 'string') fieldA = fieldA.toLowerCase();
      if (typeof fieldB === 'string') fieldB = fieldB.toLowerCase();

      if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const totalFiltered = list.length;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedDepartments = list.slice(startIndex, startIndex + limit);

    return {
      departments: paginatedDepartments,
      stats: {
        total: totalDepartments,
        active: activeDepartments,
        totalStudents: totalStudentsInDepts,
        totalFaculty: totalFacultyInDepts,
        totalCourses: totalCoursesInDepts
      },
      pagination: {
        page,
        limit,
        totalItems: totalFiltered,
        totalPages
      }
    };
  }

  public async getDepartmentById(id: string) {
    const dept = dbStore.departments.get(id);
    if (!dept) return null;

    const students = Array.from(dbStore.students.values()).filter(s => s.department === dept.name);
    const faculty = Array.from(dbStore.faculty.values()).filter(f => f.department === dept.name);
    const courses = Array.from(dbStore.courses.values()).filter(c => c.department === dept.name);

    return {
      ...dept,
      studentCount: students.length > 0 ? students.length : dept.studentCount,
      facultyCount: faculty.length > 0 ? faculty.length : dept.facultyCount,
      coursesCount: courses.length > 0 ? courses.length : dept.coursesCount,
      associatedStudents: students.slice(0, 5).map(s => ({ id: s.id, studentId: s.studentId, fullName: s.fullName, status: s.status })),
      associatedFaculty: faculty.slice(0, 5).map(f => ({ id: f.id, fullName: f.fullName, designation: f.designation, email: f.email })),
      associatedCourses: courses.slice(0, 5).map(c => ({ id: c.id, code: c.code, title: c.title, credits: c.credits }))
    };
  }

  public async createDepartment(data: Partial<DepartmentRecord>, actorName = 'System Admin') {
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
    await saveDoc('departments', newId, newDepartment);

    // Audit Activity
    const act = {
      id: `act-${Date.now()}`,
      title: 'New Department Created',
      description: `Department '${newDepartment.name}' (${newDepartment.code}) was created under HOD ${newDepartment.headOfDepartment}.`,
      category: 'Academic' as const,
      actorName,
      actorRole: 'Registrar',
      timestamp: now,
      badgeType: 'gold' as const
    };
    dbStore.activities.unshift(act);
    saveDoc('activities', act.id, act);

    return newDepartment;
  }

  public async updateDepartment(id: string, data: Partial<DepartmentRecord>, actorName = 'System Admin') {
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
    if (data.buildingLocation) existing.buildingLocation = data.buildingLocation.trim();
    if (data.status) existing.status = data.status;
    if (data.description !== undefined) existing.description = data.description.trim();
    if (data.establishedYear) existing.establishedYear = Number(data.establishedYear);
    existing.updatedAt = new Date().toISOString();

    dbStore.departments.set(id, existing);
    await saveDoc('departments', id, existing);

    // Audit Activity
    const act = {
      id: `act-${Date.now()}`,
      title: 'Department Details Updated',
      description: `Department '${existing.name}' (${existing.code}) record was updated by ${actorName}.`,
      category: 'Academic' as const,
      actorName,
      actorRole: 'Registrar',
      timestamp: new Date().toISOString(),
      badgeType: 'info' as const
    };
    dbStore.activities.unshift(act);
    saveDoc('activities', act.id, act);

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

    const updatedFaculty = {
      ...selectedFaculty,
      department: departmentName,
      designation: 'HOD',
      updatedAt: new Date().toISOString()
    };
    dbStore.faculty.set(selectedFaculty.id, updatedFaculty);
    saveDoc('faculty', selectedFaculty.id, updatedFaculty);

    for (const department of dbStore.departments.values()) {
      if (
        department.id === departmentId ||
        department.headOfDepartment !== selectedFaculty.fullName
      ) continue;

      const vacantDept = {
        ...department,
        headOfDepartment: 'Not Assigned',
        hodEmail: '',
        hodPhone: '',
        hodDesignation: 'Vacant',
        updatedAt: new Date().toISOString()
      };
      dbStore.departments.set(department.id, vacantDept);
      saveDoc('departments', department.id, vacantDept);
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

        const vacantDept = {
          ...department,
          headOfDepartment: 'Not Assigned',
          hodEmail: '',
          hodPhone: '',
          hodDesignation: 'Vacant',
          updatedAt: new Date().toISOString()
        };
        dbStore.departments.set(department.id, vacantDept);
        saveDoc('departments', department.id, vacantDept);
      }
    }
  }

  public async deleteDepartment(id: string, actorName = 'System Admin') {
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
    await deleteDoc('departments', id);

    // Audit Activity
    const act = {
      id: `act-${Date.now()}`,
      title: 'Department Removed',
      description: `Department '${existing.name}' (${existing.code}) was deleted from system records.`,
      category: 'Academic' as const,
      actorName,
      actorRole: 'Registrar',
      timestamp: new Date().toISOString(),
      badgeType: 'danger' as const
    };
    dbStore.activities.unshift(act);
    saveDoc('activities', act.id, act);

    return { success: true, message: `Department '${existing.name}' deleted successfully.` };
  }

  public async getFacultyOptions() {
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
