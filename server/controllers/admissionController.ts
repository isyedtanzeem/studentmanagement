import { Request, Response, NextFunction } from 'express';
import { AdmissionService } from '../services/admissionService';

export class AdmissionController {
  public static async getApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = (req.query.search as string) || '';
      const status = (req.query.status as string) || 'ALL';
      const department = (req.query.department as string) || 'ALL';
      const category = (req.query.category as string) || 'ALL';
      const sortBy = (req.query.sortBy as string) || 'appliedDate';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

      const result = AdmissionService.getAllApplications({
        page,
        limit,
        search,
        status,
        department,
        category,
        sortBy,
        sortOrder
      });

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        stats: result.stats
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getApplicationById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const app = AdmissionService.getApplicationById(id);

      if (!app) {
        res.status(404).json({
          success: false,
          message: 'Admission application not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: app
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { applicantName, email, department } = req.body;

      if (!applicantName || !email || !department) {
        res.status(400).json({
          success: false,
          message: 'Applicant Name, Email, and Department are required fields.'
        });
        return;
      }

      const newApp = AdmissionService.createApplication(req.body);

      res.status(201).json({
        success: true,
        data: newApp,
        message: 'Admission Application submitted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, remarks } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          message: 'Status is required'
        });
        return;
      }

      const updated = AdmissionService.updateApplicationStatus(id, status, remarks);

      if (!updated) {
        res.status(404).json({
          success: false,
          message: 'Admission application not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updated,
        message: `Application status updated to ${status}`
      });
    } catch (error) {
      next(error);
    }
  }

  public static async verifyDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { checklist, verifiedBy } = req.body;

      const updated = AdmissionService.verifyDocuments(id, checklist || {}, verifiedBy);

      if (!updated) {
        res.status(404).json({
          success: false,
          message: 'Admission application not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updated,
        message: 'Document verification checklist updated'
      });
    } catch (error) {
      next(error);
    }
  }

  public static async approveAndEnroll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { customRollNumber, approvedBy } = req.body;

      const result = AdmissionService.approveAndEnrollStudent(id, customRollNumber, approvedBy);

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Admission application not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
        message: `Admission Approved! Student enrolled with Roll No: ${result.application.generatedStudentId}`
      });
    } catch (error) {
      next(error);
    }
  }

  public static async rejectApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { rejectionReason, rejectedBy } = req.body;

      if (!rejectionReason) {
        res.status(400).json({
          success: false,
          message: 'Rejection reason is required'
        });
        return;
      }

      const updated = AdmissionService.rejectApplication(id, rejectionReason, rejectedBy);

      if (!updated) {
        res.status(404).json({
          success: false,
          message: 'Admission application not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updated,
        message: 'Admission application rejected'
      });
    } catch (error) {
      next(error);
    }
  }

  public static async generateRollNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const department = (req.query.department as string) || 'Computer Science & Engineering';
      const rollNumber = AdmissionService.generateAdmissionRollNumber(department, 2026);

      res.status(200).json({
        success: true,
        rollNumber
      });
    } catch (error) {
      next(error);
    }
  }

  public static async publicLookupByPhone(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone } = req.body;
      if (!phone) {
        res.status(400).json({
          success: false,
          message: 'Phone number is required.'
        });
        return;
      }

      const list = AdmissionService.getApplicationsByPhone(phone);
      res.status(200).json({
        success: true,
        data: list,
        count: list.length
      });
    } catch (error) {
      next(error);
    }
  }

  public static async publicCreateApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { applicantName, email, department, phone } = req.body;

      if (!applicantName || !email || !department || !phone) {
        res.status(400).json({
          success: false,
          message: 'Applicant Name, Mobile Number, Email, and Department are required.'
        });
        return;
      }

      const newApp = AdmissionService.createApplication(req.body);

      res.status(201).json({
        success: true,
        data: newApp,
        message: 'Admission Application submitted successfully! Use your mobile number to track status.'
      });
    } catch (error) {
      next(error);
    }
  }
}
