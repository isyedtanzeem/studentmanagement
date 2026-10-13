import { dbStore, CourseRecord } from '../config/db';
import { saveDoc, deleteDoc } from '../config/mongo';

export interface CourseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  level?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class CourseService {
  constructor() {}

  public async getCourses(params: CourseQueryParams, user?: any) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 9));
    const search = (params.search || '').trim().toLowerCase();
    const department = params.department || 'ALL';
    const level = params.level || 'ALL';
    const status = params.status || 'ALL';
    const sortBy = params.sortBy || 'title';
    const sortOrder = params.sortOrder || 'asc';

    let list = Array.from(dbStore.courses.values());
    const studentsArr = Array.from(dbStore.students.values());

    // Strict Student Scope Isolation: If request is from a Student, restrict to that student's department
    if (user && user.role === 'Student') {
      const userEmail = (user.email || '').toLowerCase().trim();
      const student = studentsArr.find(
        s => s.email.toLowerCase().trim() === userEmail ||
             (user.studentId && s.studentId === user.studentId) ||
             (user.employeeId && s.studentId === user.employeeId)
      );
      const studentDept = student?.department || user.department || 'Computer Science & Engineering';
      list = list.filter(c => c.department === studentDept);
    }

    // Dynamically update enrolled student counts based on active student records
    list = list.map(course => {
      const realEnrolled = studentsArr.filter(
        s => s.department === course.department || (s as any).courseCode === course.code
      ).length;

      return {
        ...course,
        enrolledStudents: realEnrolled > 0 ? realEnrolled : (course.enrolledStudents || 0)
      };
    });

    // Compute Overall Stats before filters
    const totalCourses = list.length;
    const activeCourses = list.filter(c => c.status === 'Active').length;
    const totalCredits = list.reduce((acc, c) => acc + (c.credits || 0), 0);
    const totalEnrolled = list.reduce((acc, c) => acc + (c.enrolledStudents || 0), 0);

    // Apply Department Filter
    if (department !== 'ALL') {
      list = list.filter(c => c.department === department);
    }

    // Apply Level Filter
    if (level !== 'ALL') {
      list = list.filter(c => c.level === level);
    }

    // Apply Status Filter
    if (status !== 'ALL') {
      list = list.filter(c => c.status === status);
    }

    // Apply Search Filter
    if (search) {
      list = list.filter(
        c =>
          c.title.toLowerCase().includes(search) ||
          c.code.toLowerCase().includes(search) ||
          c.department.toLowerCase().includes(search) ||
          (c.instructorName && c.instructorName.toLowerCase().includes(search))
      );
    }

    // Sort
    list.sort((a, b) => {
      let fieldA: any = a[sortBy as keyof CourseRecord] ?? '';
      let fieldB: any = b[sortBy as keyof CourseRecord] ?? '';

      if (typeof fieldA === 'string') fieldA = fieldA.toLowerCase();
      if (typeof fieldB === 'string') fieldB = fieldB.toLowerCase();

      if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const totalItems = list.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedCourses = list.slice(startIndex, startIndex + limit);

    return {
      courses: paginatedCourses,
      stats: {
        totalCourses,
        activeCourses,
        totalCredits,
        totalEnrolled
      },
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit
      }
    };
  }

  public async getCourseById(id: string) {
    const course = dbStore.courses.get(id);
    if (!course) return null;

    // Find enrolled students matching department or course code
    const studentsArr = Array.from(dbStore.students.values());
    const enrolledStudents = studentsArr.filter(
      s => s.department === course.department || (s as any).courseCode === course.code
    );

    // Find department record
    const depts = Array.from(dbStore.departments.values());
    const deptInfo = depts.find(d => d.name === course.department);

    return {
      ...course,
      totalFee: (course.courseFee || 0) + (course.labFee || 0),
      enrolledStudentsCount: enrolledStudents.length || course.enrolledStudents,
      enrolledStudentsList: enrolledStudents.slice(0, 10),
      departmentInfo: deptInfo
    };
  }

  public async createCourse(data: Partial<CourseRecord>, actorName: string) {
    if (!data.code || !data.title || !data.department) {
      throw new Error('Course Code, Title, and Department mapping are required.');
    }

    const rawDept = (data.department || '').trim();
    const matchingDept = Array.from(dbStore.departments.values()).find(
      d => (data.departmentId && d.id === data.departmentId) ||
           d.name.toLowerCase() === rawDept.toLowerCase() ||
           d.code.toLowerCase() === rawDept.toLowerCase()
    );

    if (!matchingDept) {
      const activeDepts = Array.from(dbStore.departments.values()).map(d => `${d.name} (${d.code})`);
      if (activeDepts.length === 0) {
        throw new Error('Cannot create course: No academic departments exist in the database. Please create a department first.');
      }
      throw new Error(`Cannot create course without a valid registered department. Department "${rawDept}" was not found. Available: ${activeDepts.join(', ')}`);
    }

    const cleanCode = data.code.trim().toUpperCase();

    // Check duplicate code
    const existing = Array.from(dbStore.courses.values()).find(
      c => c.code.toUpperCase() === cleanCode
    );
    if (existing) {
      throw new Error(`A course with code '${cleanCode}' already exists.`);
    }

    const newId = `crs-${Date.now().toString().slice(-6)}`;
    const courseFee = Number(data.courseFee) || 0;
    const labFee = Number(data.labFee) || 0;
    const totalFee = courseFee + labFee;

    const newCourse: CourseRecord = {
      id: newId,
      code: cleanCode,
      title: data.title.trim(),
      department: matchingDept.name,
      departmentId: matchingDept.id,
      degreeProgram: data.degreeProgram ? data.degreeProgram.trim() : 'B.Tech',
      level: (data.level as any) || 'Undergraduate',
      duration: data.duration ? data.duration.trim() : '4 Years / 8 Semesters',
      credits: Number(data.credits) || 3,
      courseFee,
      labFee,
      totalFee,
      status: data.status || 'Active',
      description: data.description ? data.description.trim() : '',
      prerequisites: data.prerequisites ? data.prerequisites.trim() : '',
      instructorName: data.instructorName ? data.instructorName.trim() : 'Faculty Chair',
      maxCapacity: Number(data.maxCapacity) || 120,
      enrolledStudents: Number(data.enrolledStudents) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dbStore.courses.set(newId, newCourse);
    await saveDoc('courses', newId, newCourse);

    // Update course count on the parent department
    matchingDept.coursesCount = Array.from(dbStore.courses.values()).filter(c => c.department === matchingDept.name || c.departmentId === matchingDept.id).length;
    matchingDept.updatedAt = new Date().toISOString();
    dbStore.departments.set(matchingDept.id, matchingDept);
    await saveDoc('departments', matchingDept.id, matchingDept);

    // Log Activity
    const actId = `act-${Date.now()}`;
    const act = {
      id: actId,
      title: `New Course Created: ${newCourse.code}`,
      description: `${newCourse.title} mapped to department '${matchingDept.name}' (${matchingDept.code}) by ${actorName}. Fee: ₹${totalFee.toLocaleString('en-IN')}`,
      category: 'Academic' as const,
      actorName,
      actorRole: 'Administrator',
      timestamp: new Date().toISOString(),
      badgeType: 'gold' as const
    };
    dbStore.activities.unshift(act);
    saveDoc('activities', actId, act);

    return newCourse;
  }

  public async updateCourse(id: string, data: Partial<CourseRecord>, actorName: string) {
    const existing = dbStore.courses.get(id);
    if (!existing) {
      throw new Error('Course record not found.');
    }

    if (data.code) {
      const cleanCode = data.code.trim().toUpperCase();
      const duplicate = Array.from(dbStore.courses.values()).find(
        c => c.id !== id && c.code.toUpperCase() === cleanCode
      );
      if (duplicate) {
        throw new Error(`Another course with code '${cleanCode}' already exists.`);
      }
      existing.code = cleanCode;
    }

    if (data.title) existing.title = data.title.trim();
    if (data.department) {
      const rawDept = data.department.trim();
      const matchingDept = Array.from(dbStore.departments.values()).find(
        d => (data.departmentId && d.id === data.departmentId) ||
             d.name.toLowerCase() === rawDept.toLowerCase() ||
             d.code.toLowerCase() === rawDept.toLowerCase()
      );
      if (!matchingDept) {
        throw new Error(`Cannot map course to department "${rawDept}". Department does not exist in the database.`);
      }
      const previousDeptName = existing.department;
      existing.department = matchingDept.name;
      existing.departmentId = matchingDept.id;

      // Update course count on new department
      matchingDept.coursesCount = Array.from(dbStore.courses.values()).filter(c => c.department === matchingDept.name || c.departmentId === matchingDept.id).length;
      dbStore.departments.set(matchingDept.id, matchingDept);
      await saveDoc('departments', matchingDept.id, matchingDept);

      // If department changed, update old department count too
      if (previousDeptName !== matchingDept.name) {
        const prevDept = Array.from(dbStore.departments.values()).find(d => d.name === previousDeptName);
        if (prevDept) {
          prevDept.coursesCount = Array.from(dbStore.courses.values()).filter(c => c.id !== id && (c.department === prevDept.name || c.departmentId === prevDept.id)).length;
          dbStore.departments.set(prevDept.id, prevDept);
          await saveDoc('departments', prevDept.id, prevDept);
        }
      }
    }
    if (data.degreeProgram !== undefined) existing.degreeProgram = data.degreeProgram.trim();
    if (data.level) existing.level = data.level as any;
    if (data.duration !== undefined) existing.duration = data.duration.trim();
    if (data.credits !== undefined) existing.credits = Number(data.credits);
    
    if (data.courseFee !== undefined) existing.courseFee = Number(data.courseFee);
    if (data.labFee !== undefined) existing.labFee = Number(data.labFee);
    existing.totalFee = (existing.courseFee || 0) + (existing.labFee || 0);

    if (data.status) existing.status = data.status as any;
    if (data.description !== undefined) existing.description = data.description.trim();
    if (data.prerequisites !== undefined) existing.prerequisites = data.prerequisites.trim();
    if (data.instructorName !== undefined) existing.instructorName = data.instructorName.trim();
    if (data.maxCapacity !== undefined) existing.maxCapacity = Number(data.maxCapacity);

    existing.updatedAt = new Date().toISOString();
    dbStore.courses.set(id, existing);
    await saveDoc('courses', id, existing);

    // Log Activity
    const actId = `act-${Date.now()}`;
    const act = {
      id: actId,
      title: `Course Updated: ${existing.code}`,
      description: `Course details for '${existing.title}' updated by ${actorName}.`,
      category: 'Academic' as const,
      actorName,
      actorRole: 'Administrator',
      timestamp: new Date().toISOString(),
      badgeType: 'info' as const
    };
    dbStore.activities.unshift(act);
    saveDoc('activities', actId, act);

    return existing;
  }

  public async deleteCourse(id: string, actorName: string) {
    const existing = dbStore.courses.get(id);
    if (!existing) {
      throw new Error('Course record not found.');
    }

    // Safety check: Prevent deletion if active students are registered
    const studentsArr = Array.from(dbStore.students.values());
    const enrolledStudents = studentsArr.filter(
      s => (s as any).courseCode === existing.code
    );

    if (enrolledStudents.length > 0) {
      throw new Error(
        `Cannot delete course '${existing.code}' because ${enrolledStudents.length} active students are currently enrolled.`
      );
    }

    dbStore.courses.delete(id);
    await deleteDoc('courses', id);

    // Update parent department course count
    const parentDept = Array.from(dbStore.departments.values()).find(
      d => (existing.departmentId && d.id === existing.departmentId) || d.name === existing.department
    );
    if (parentDept) {
      parentDept.coursesCount = Array.from(dbStore.courses.values()).filter(c => c.department === parentDept.name || c.departmentId === parentDept.id).length;
      parentDept.updatedAt = new Date().toISOString();
      dbStore.departments.set(parentDept.id, parentDept);
      await saveDoc('departments', parentDept.id, parentDept);
    }

    // Log Activity
    const actId = `act-${Date.now()}`;
    const act = {
      id: actId,
      title: `Course Deleted: ${existing.code}`,
      description: `Course '${existing.title}' deleted from academic system by ${actorName}.`,
      category: 'Academic' as const,
      actorName,
      actorRole: 'Administrator',
      timestamp: new Date().toISOString(),
      badgeType: 'danger' as const
    };
    dbStore.activities.unshift(act);
    saveDoc('activities', actId, act);

    return { message: `Course '${existing.code}' deleted successfully.` };
  }

  public async getDepartmentOptions() {
    const depts = Array.from(dbStore.departments.values()).filter(d => !d.status || d.status === 'Active');
    return depts.map(d => ({
      id: d.id,
      code: d.code,
      name: d.name
    }));
  }
}

export const courseService = new CourseService();
