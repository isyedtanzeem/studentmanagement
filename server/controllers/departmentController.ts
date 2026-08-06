import { Request, Response, NextFunction } from 'express';
import { departmentService } from '../services/departmentService';

export class DepartmentController {
  public static async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await departmentService.getDepartments(req.query);
      res.json({
        success: true,
        data: result.departments,
        stats: result.stats,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getDepartmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const dept = await departmentService.getDepartmentById(id);

      if (!dept) {
        return res.status(404).json({
          success: false,
          error: { message: 'Department not found' }
        });
      }

      res.json({
        success: true,
        data: dept
      });
    } catch (err) {
      next(err);
    }
  }

  public static async createDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const actorName = user?.fullName || 'System Admin';
      const created = await departmentService.createDepartment(req.body, actorName);

      res.status(201).json({
        success: true,
        data: created,
        message: `Department '${created.name}' created successfully.`
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: { message: err.message || 'Failed to create department' }
      });
    }
  }

  public static async updateDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const actorName = user?.fullName || 'System Admin';

      const updated = await departmentService.updateDepartment(id, req.body, actorName);

      res.json({
        success: true,
        data: updated,
        message: `Department '${updated.name}' updated successfully.`
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: { message: err.message || 'Failed to update department' }
      });
    }
  }

  public static async deleteDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const actorName = user?.fullName || 'System Admin';

      const result = await departmentService.deleteDepartment(id, actorName);

      res.json({
        success: true,
        message: result.message
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: { message: err.message || 'Failed to delete department' }
      });
    }
  }

  public static async getFacultyOptions(req: Request, res: Response, next: NextFunction) {
    try {
      const faculty = await departmentService.getFacultyOptions();
      res.json({
        success: true,
        data: faculty
      });
    } catch (err) {
      next(err);
    }
  }
}
