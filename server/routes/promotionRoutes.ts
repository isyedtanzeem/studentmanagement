import { Router, Request, Response } from 'express';
import { PromotionService } from '../services/promotionService';

const router = Router();

// GET /api/v1/promotions/students - Get students eligible for promotion with validation status
router.get('/students', (req: Request, res: Response) => {
  try {
    const {
      department,
      currentSemester,
      currentYear,
      academicBatch,
      search,
      status,
      minAttendance,
      maxBacklogs,
      requireFeePaid,
      requireDisciplineClearance,
    } = req.query;

    const validationRules = {
      ...(minAttendance ? { minAttendance: Number(minAttendance) } : {}),
      ...(maxBacklogs ? { maxBacklogs: Number(maxBacklogs) } : {}),
      ...(requireFeePaid !== undefined ? { requireFeePaid: requireFeePaid === 'true' } : {}),
      ...(requireDisciplineClearance !== undefined ? { requireDisciplineClearance: requireDisciplineClearance === 'true' } : {}),
    };

    const result = PromotionService.getEligibleStudents({
      department: department as string,
      currentSemester: currentSemester ? Number(currentSemester) : undefined,
      currentYear: currentYear ? Number(currentYear) : undefined,
      academicBatch: academicBatch as string,
      search: search as string,
      status: status as string,
      validationRules,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch eligible students for promotion.',
    });
  }
});

// POST /api/v1/promotions/promote-individual - Promote a single student
router.post('/promote-individual', (req: Request, res: Response) => {
  try {
    const {
      studentDbId,
      promotionType,
      targetSemester,
      targetYear,
      academicSession,
      promotedBy,
      remarks,
      allowOverride,
      validationRules,
    } = req.body;

    if (!studentDbId || !targetSemester || !targetYear) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: studentDbId, targetSemester, targetYear',
      });
    }

    const record = PromotionService.promoteIndividual({
      studentDbId,
      promotionType: promotionType || 'Semester Promotion',
      targetSemester: Number(targetSemester),
      targetYear: Number(targetYear),
      academicSession: academicSession || '2026-2027 Session',
      promotedBy: promotedBy || 'Academic Officer',
      remarks,
      allowOverride: Boolean(allowOverride),
      validationRules,
    });

    res.json({
      success: true,
      message: `Successfully promoted student to Semester ${record.newSemester}`,
      data: record,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to promote student.',
    });
  }
});

// POST /api/v1/promotions/promote-bulk - Perform bulk promotion on selected students
router.post('/promote-bulk', (req: Request, res: Response) => {
  try {
    const {
      studentDbIds,
      promotionType,
      academicSession,
      promotedBy,
      remarks,
      allowOverride,
      validationRules,
    } = req.body;

    if (!Array.isArray(studentDbIds) || studentDbIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of studentDbIds to promote.',
      });
    }

    const summary = PromotionService.promoteBulk({
      studentDbIds,
      promotionType: promotionType || 'Semester Promotion',
      academicSession: academicSession || '2026-2027 Session',
      promotedBy: promotedBy || 'Academic Registrar',
      remarks,
      allowOverride: Boolean(allowOverride),
      validationRules,
    });

    res.json({
      success: true,
      message: `Bulk promotion completed. ${summary.successCount + summary.conditionalCount} promoted, ${summary.failedCount} skipped.`,
      data: summary,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process bulk promotion.',
    });
  }
});

// GET /api/v1/promotions/history - Retrieve promotion audit history logs
router.get('/history', (req: Request, res: Response) => {
  try {
    const { search, department, promotionType, status } = req.query;

    const historyData = PromotionService.getHistory({
      search: search as string,
      department: department as string,
      promotionType: promotionType as string,
      status: status as string,
    });

    res.json({
      success: true,
      data: historyData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch promotion history.',
    });
  }
});

// POST /api/v1/promotions/rollback/:id - Roll back a previously executed promotion
router.post('/rollback/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rollbackReason, rolledBackBy } = req.body;

    const updatedRecord = PromotionService.rollbackPromotion(
      id,
      rollbackReason,
      rolledBackBy || 'Academic Admin'
    );

    res.json({
      success: true,
      message: `Successfully rolled back promotion for ${updatedRecord.studentName}.`,
      data: updatedRecord,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to rollback promotion record.',
    });
  }
});

export default router;
