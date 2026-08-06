import { Router, Request, Response } from 'express';
import { ReportService } from '../services/reportService';

const router = Router();

// GET /api/v1/reports/student
router.get('/student', (req: Request, res: Response) => {
  try {
    const { department, year, status } = req.query;
    const report = ReportService.getStudentReport({
      department: department as string,
      year: year as string,
      status: status as string,
    });
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch student report.' });
  }
});

// GET /api/v1/reports/admission
router.get('/admission', (req: Request, res: Response) => {
  try {
    const { department, status } = req.query;
    const report = ReportService.getAdmissionReport({
      department: department as string,
      status: status as string,
    });
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch admission report.' });
  }
});

// GET /api/v1/reports/department
router.get('/department', (req: Request, res: Response) => {
  try {
    const report = ReportService.getDepartmentReport();
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch department report.' });
  }
});

// GET /api/v1/reports/gender
router.get('/gender', (req: Request, res: Response) => {
  try {
    const { department } = req.query;
    const report = ReportService.getGenderReport({
      department: department as string,
    });
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch gender report.' });
  }
});

// GET /api/v1/reports/alumni
router.get('/alumni', (req: Request, res: Response) => {
  try {
    const { department, year } = req.query;
    const report = ReportService.getAlumniReport({
      department: department as string,
      year: year as string,
    });
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch alumni report.' });
  }
});

export default router;
