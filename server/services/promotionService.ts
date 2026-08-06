import { dbStore, StudentRecord, PromotionRecord, RecentActivityRecord } from '../config/db';
import { DashboardModel } from '../models/Dashboard';

export interface ValidationRules {
  minAttendance: number; // e.g. 75
  maxBacklogs: number; // e.g. 2
  requireFeePaid: boolean; // true
  requireDisciplineClearance: boolean; // true
}

export interface PromotionStudentItem {
  student: StudentRecord;
  validation: {
    eligible: boolean;
    attendanceOk: boolean;
    attendanceVal: number;
    backlogsOk: boolean;
    backlogsVal: number;
    feeOk: boolean;
    feeVal: string;
    disciplineOk: boolean;
    reasons: string[];
  };
  nextSemester: number;
  nextYear: number;
  isGraduating: boolean;
}

export interface PromoteIndividualPayload {
  studentDbId: string;
  promotionType: 'Semester Promotion' | 'Year Promotion' | 'Graduation' | 'Conditional Promotion';
  targetSemester: number;
  targetYear: number;
  academicSession: string;
  promotedBy: string;
  remarks?: string;
  allowOverride?: boolean;
  validationRules?: Partial<ValidationRules>;
}

export interface PromoteBulkPayload {
  studentDbIds: string[];
  promotionType: 'Semester Promotion' | 'Year Promotion';
  academicSession: string;
  promotedBy: string;
  remarks?: string;
  allowOverride?: boolean;
  validationRules?: Partial<ValidationRules>;
}

export class PromotionService {
  private static defaultRules: ValidationRules = {
    minAttendance: 75,
    maxBacklogs: 2,
    requireFeePaid: true,
    requireDisciplineClearance: true,
  };

  private static validateStudent(student: StudentRecord, rulesInput?: Partial<ValidationRules>) {
    const rules = { ...this.defaultRules, ...rulesInput };
    const attendanceVal = student.attendancePercentage ?? 100;
    const backlogsVal = student.backlogsCount ?? 0;
    const feeVal = student.feeStatus ?? 'Paid';
    const disciplineVal = student.disciplinaryClearance ?? true;

    const attendanceOk = attendanceVal >= rules.minAttendance;
    const backlogsOk = backlogsVal <= rules.maxBacklogs;
    const feeOk = rules.requireFeePaid ? (feeVal === 'Paid' || feeVal === 'Exempt') : true;
    const disciplineOk = rules.requireDisciplineClearance ? disciplineVal === true : true;

    const reasons: string[] = [];
    if (!attendanceOk) {
      reasons.push(`Attendance (${attendanceVal}%) is below minimum required (${rules.minAttendance}%).`);
    }
    if (!backlogsOk) {
      reasons.push(`Backlogs count (${backlogsVal}) exceeds maximum allowed (${rules.maxBacklogs}).`);
    }
    if (!feeOk) {
      reasons.push(`Fee status is '${feeVal}'. Fees must be Paid or Exempt.`);
    }
    if (!disciplineOk) {
      reasons.push(`Disciplinary clearance pending or flagged.`);
    }
    if (student.status !== 'Active') {
      reasons.push(`Student status is '${student.status}'. Only Active students can be promoted.`);
    }

    const eligible = reasons.length === 0;

    return {
      eligible,
      attendanceOk,
      attendanceVal,
      backlogsOk,
      backlogsVal,
      feeOk,
      feeVal,
      disciplineOk,
      reasons,
    };
  }

  public static getEligibleStudents(params: {
    department?: string;
    currentSemester?: number;
    currentYear?: number;
    academicBatch?: string;
    search?: string;
    status?: string;
    validationRules?: Partial<ValidationRules>;
  }) {
    DashboardModel.seedDataIfEmpty();

    let list = Array.from(dbStore.students.values());

    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        s =>
          s.fullName.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    if (params.department && params.department !== 'ALL') {
      list = list.filter(s => s.department === params.department);
    }

    if (params.currentSemester && !isNaN(Number(params.currentSemester))) {
      list = list.filter(s => (s.currentSemester ?? 1) === Number(params.currentSemester));
    }

    if (params.currentYear && !isNaN(Number(params.currentYear))) {
      list = list.filter(s => (s.currentYear ?? 1) === Number(params.currentYear));
    }

    if (params.academicBatch && params.academicBatch !== 'ALL') {
      list = list.filter(s => s.academicBatch === params.academicBatch);
    }

    if (params.status && params.status !== 'ALL') {
      list = list.filter(s => s.status === params.status);
    } else {
      // Default to Active students for promotion workflow if not specified
      list = list.filter(s => s.status === 'Active');
    }

    const items: PromotionStudentItem[] = list.map(student => {
      const val = this.validateStudent(student, params.validationRules);
      const currSem = student.currentSemester ?? 1;
      const currYr = student.currentYear ?? Math.ceil(currSem / 2);
      
      let nextSem = currSem + 1;
      let nextYr = Math.ceil(nextSem / 2);
      const isGraduating = currSem >= 8;

      if (isGraduating) {
        nextSem = 8;
        nextYr = 4;
      }

      return {
        student,
        validation: val,
        nextSemester: nextSem,
        nextYear: nextYr,
        isGraduating,
      };
    });

    const eligibleCount = items.filter(i => i.validation.eligible).length;
    const warningCount = items.filter(i => !i.validation.eligible).length;

    return {
      students: items,
      totalCount: items.length,
      eligibleCount,
      warningCount,
      validationRulesApplied: { ...this.defaultRules, ...params.validationRules },
    };
  }

  public static promoteIndividual(payload: PromoteIndividualPayload): PromotionRecord {
    DashboardModel.seedDataIfEmpty();

    const student = dbStore.students.get(payload.studentDbId);
    if (!student) {
      throw new Error(`Student not found with ID ${payload.studentDbId}`);
    }

    const val = this.validateStudent(student, payload.validationRules);

    if (!val.eligible && !payload.allowOverride) {
      throw new Error(`Promotion validation failed: ${val.reasons.join(' ')}`);
    }

    const prevSem = student.currentSemester ?? 1;
    const prevYr = student.currentYear ?? Math.ceil(prevSem / 2);

    let newSem = payload.targetSemester;
    let newYr = payload.targetYear;
    let actualType = payload.promotionType;

    if (!val.eligible && payload.allowOverride) {
      actualType = 'Conditional Promotion';
    }

    // Update student state
    if (actualType === 'Graduation' || newSem > 8) {
      student.status = 'Graduated';
      student.currentSemester = 8;
      student.currentYear = 4;
    } else {
      student.currentSemester = newSem;
      student.currentYear = newYr;
    }

    dbStore.students.set(student.id, student);

    const promotionRecord: PromotionRecord = {
      id: `prm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentDbId: student.id,
      studentId: student.studentId,
      studentName: student.fullName,
      department: student.department,
      promotionType: actualType,
      previousSemester: prevSem,
      newSemester: student.currentSemester ?? newSem,
      previousYear: prevYr,
      newYear: student.currentYear ?? newYr,
      promotedBy: payload.promotedBy || 'Academic Admin',
      promotedAt: new Date().toISOString(),
      academicSession: payload.academicSession || '2026-2027 Session',
      status: actualType === 'Conditional Promotion' ? 'Conditional' : 'Promoted',
      remarks: payload.remarks || (val.eligible ? 'Promoted successfully upon passing academic requirements.' : `Conditional promotion granted with override. Warnings: ${val.reasons.join('; ')}`),
      validationPassed: val.eligible,
      validationCheckSummary: {
        attendanceOk: val.attendanceOk,
        attendanceVal: val.attendanceVal,
        backlogsOk: val.backlogsOk,
        backlogsVal: val.backlogsVal,
        feeOk: val.feeOk,
        feeVal: val.feeVal,
        disciplineOk: val.disciplineOk,
      },
    };

    dbStore.promotionHistory.set(promotionRecord.id, promotionRecord);

    // Audit Log
    dbStore.activities.unshift({
      id: `act-${Date.now()}`,
      title: `Student Promotion (${actualType})`,
      description: `Promoted ${student.fullName} (${student.studentId}) from Sem ${prevSem} to Sem ${student.currentSemester}`,
      category: 'Academic',
      actorName: payload.promotedBy || 'Academic Admin',
      actorRole: 'Registrar',
      timestamp: new Date().toISOString(),
      badgeType: actualType === 'Conditional Promotion' ? 'warning' : 'success',
    });

    return promotionRecord;
  }

  public static promoteBulk(payload: PromoteBulkPayload) {
    DashboardModel.seedDataIfEmpty();

    let successCount = 0;
    let conditionalCount = 0;
    let failedCount = 0;
    const failures: { studentId: string; studentName: string; reasons: string[] }[] = [];
    const createdRecords: PromotionRecord[] = [];

    for (const studentDbId of payload.studentDbIds) {
      const student = dbStore.students.get(studentDbId);
      if (!student) {
        failedCount++;
        failures.push({
          studentId: studentDbId,
          studentName: 'Unknown',
          reasons: ['Student record not found in database.'],
        });
        continue;
      }

      const val = this.validateStudent(student, payload.validationRules);

      if (!val.eligible && !payload.allowOverride) {
        failedCount++;
        failures.push({
          studentId: student.studentId,
          studentName: student.fullName,
          reasons: val.reasons,
        });
        continue;
      }

      const prevSem = student.currentSemester ?? 1;
      const prevYr = student.currentYear ?? Math.ceil(prevSem / 2);

      let newSem = prevSem;
      let newYr = prevYr;
      let promotionType: 'Semester Promotion' | 'Year Promotion' | 'Graduation' | 'Conditional Promotion' = payload.promotionType;

      if (payload.promotionType === 'Semester Promotion') {
        newSem = prevSem + 1;
        newYr = Math.ceil(newSem / 2);
      } else if (payload.promotionType === 'Year Promotion') {
        newYr = prevYr + 1;
        newSem = (newYr - 1) * 2 + 1; // e.g. Year 2 -> Sem 3
      }

      if (!val.eligible && payload.allowOverride) {
        promotionType = 'Conditional Promotion';
      }

      if (newSem > 8) {
        promotionType = 'Graduation';
      }

      // Update student
      if (promotionType === 'Graduation') {
        student.status = 'Graduated';
        student.currentSemester = 8;
        student.currentYear = 4;
      } else {
        student.currentSemester = newSem;
        student.currentYear = newYr;
      }

      dbStore.students.set(student.id, student);

      const record: PromotionRecord = {
        id: `prm-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        studentDbId: student.id,
        studentId: student.studentId,
        studentName: student.fullName,
        department: student.department,
        promotionType,
        previousSemester: prevSem,
        newSemester: student.currentSemester ?? newSem,
        previousYear: prevYr,
        newYear: student.currentYear ?? newYr,
        promotedBy: payload.promotedBy || 'Academic Admin',
        promotedAt: new Date().toISOString(),
        academicSession: payload.academicSession || '2026-2027 Session',
        status: promotionType === 'Conditional Promotion' ? 'Conditional' : 'Promoted',
        remarks: payload.remarks || (val.eligible ? `Bulk ${payload.promotionType} processed successfully.` : `Bulk conditional promotion granted. Warnings: ${val.reasons.join('; ')}`),
        validationPassed: val.eligible,
        validationCheckSummary: {
          attendanceOk: val.attendanceOk,
          attendanceVal: val.attendanceVal,
          backlogsOk: val.backlogsOk,
          backlogsVal: val.backlogsVal,
          feeOk: val.feeOk,
          feeVal: val.feeVal,
          disciplineOk: val.disciplineOk,
        },
      };

      dbStore.promotionHistory.set(record.id, record);
      createdRecords.push(record);

      if (promotionType === 'Conditional Promotion') {
        conditionalCount++;
      } else {
        successCount++;
      }
    }

    // Log recent activity
    dbStore.activities.unshift({
      id: `act-${Date.now()}`,
      title: `Bulk Promotion Executed`,
      description: `Bulk promotion completed for ${successCount + conditionalCount} students (${successCount} passed, ${conditionalCount} conditional, ${failedCount} skipped).`,
      category: 'Academic',
      actorName: payload.promotedBy || 'Academic Admin',
      actorRole: 'Registrar',
      timestamp: new Date().toISOString(),
      badgeType: failedCount > 0 ? 'warning' : 'success',
    });

    return {
      totalProcessed: payload.studentDbIds.length,
      successCount,
      conditionalCount,
      failedCount,
      failures,
      createdRecords,
    };
  }

  public static getHistory(params: {
    search?: string;
    department?: string;
    promotionType?: string;
    status?: string;
  }) {
    DashboardModel.seedDataIfEmpty();

    let list = Array.from(dbStore.promotionHistory.values());

    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        p =>
          p.studentName.toLowerCase().includes(q) ||
          p.studentId.toLowerCase().includes(q) ||
          p.promotedBy.toLowerCase().includes(q) ||
          (p.remarks && p.remarks.toLowerCase().includes(q))
      );
    }

    if (params.department && params.department !== 'ALL') {
      list = list.filter(p => p.department === params.department);
    }

    if (params.promotionType && params.promotionType !== 'ALL') {
      list = list.filter(p => p.promotionType === params.promotionType);
    }

    if (params.status && params.status !== 'ALL') {
      list = list.filter(p => p.status === params.status);
    }

    // Sort descending by date
    list.sort((a, b) => new Date(b.promotedAt).getTime() - new Date(a.promotedAt).getTime());

    const totalCount = dbStore.promotionHistory.size;
    const promotedCount = Array.from(dbStore.promotionHistory.values()).filter(p => p.status === 'Promoted').length;
    const conditionalCount = Array.from(dbStore.promotionHistory.values()).filter(p => p.status === 'Conditional').length;
    const rolledBackCount = Array.from(dbStore.promotionHistory.values()).filter(p => p.status === 'Rolled Back').length;

    return {
      history: list,
      stats: {
        total: totalCount,
        promoted: promotedCount,
        conditional: conditionalCount,
        rolledBack: rolledBackCount,
      },
    };
  }

  public static rollbackPromotion(promotionId: string, rollbackReason: string, rolledBackBy: string): PromotionRecord {
    DashboardModel.seedDataIfEmpty();

    const record = dbStore.promotionHistory.get(promotionId);
    if (!record) {
      throw new Error(`Promotion record not found with ID ${promotionId}`);
    }

    if (record.status === 'Rolled Back') {
      throw new Error(`This promotion record has already been rolled back on ${record.rolledBackAt}`);
    }

    const student = dbStore.students.get(record.studentDbId);
    if (student) {
      student.currentSemester = record.previousSemester;
      student.currentYear = record.previousYear;
      if (student.status === 'Graduated' && record.promotionType === 'Graduation') {
        student.status = 'Active';
      }
      dbStore.students.set(student.id, student);
    }

    record.status = 'Rolled Back';
    record.rollbackReason = rollbackReason || 'Rolled back by administrator action.';
    record.rolledBackBy = rolledBackBy || 'Academic Admin';
    record.rolledBackAt = new Date().toISOString();

    dbStore.promotionHistory.set(record.id, record);

    // Audit Log
    dbStore.activities.unshift({
      id: `act-${Date.now()}`,
      title: `Promotion Rolled Back`,
      description: `Rolled back promotion for ${record.studentName} (${record.studentId}) back to Semester ${record.previousSemester}`,
      category: 'Academic',
      actorName: rolledBackBy || 'Academic Admin',
      actorRole: 'Registrar',
      timestamp: new Date().toISOString(),
      badgeType: 'warning',
    });

    return record;
  }
}
