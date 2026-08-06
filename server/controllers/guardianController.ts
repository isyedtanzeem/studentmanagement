import { Request, Response, NextFunction } from 'express';
import { guardianService } from '../services/guardianService';

export class GuardianController {
  public static async getGuardians(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await guardianService.getGuardians(req.query);
      res.json({
        success: true,
        data: result.guardians,
        stats: result.stats,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getGuardianById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const guardian = await guardianService.getGuardianById(id);

      if (!guardian) {
        return res.status(404).json({
          success: false,
          error: { message: 'Guardian profile record not found.' }
        });
      }

      res.json({
        success: true,
        data: guardian
      });
    } catch (err) {
      next(err);
    }
  }

  public static async createGuardian(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const actorName = user?.fullName || 'System Admin';
      const created = await guardianService.createGuardian(req.body, actorName);

      res.status(201).json({
        success: true,
        data: created,
        message: `Guardian '${created.guardianId} - ${created.guardianName}' created successfully.`
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: { message: err.message || 'Failed to create guardian profile.' }
      });
    }
  }

  public static async updateGuardian(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const actorName = user?.fullName || 'System Admin';

      const updated = await guardianService.updateGuardian(id, req.body, actorName);

      res.json({
        success: true,
        data: updated,
        message: `Guardian '${updated.guardianId}' updated successfully.`
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: { message: err.message || 'Failed to update guardian profile.' }
      });
    }
  }

  public static async deleteGuardian(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const actorName = user?.fullName || 'System Admin';

      const result = await guardianService.deleteGuardian(id, actorName);

      res.json({
        success: true,
        message: result.message
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: { message: err.message || 'Failed to delete guardian record.' }
      });
    }
  }

  public static async getStudentOptions(req: Request, res: Response, next: NextFunction) {
    try {
      const students = await guardianService.getStudentOptions();
      res.json({
        success: true,
        data: students
      });
    } catch (err) {
      next(err);
    }
  }
}
