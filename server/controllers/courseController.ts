import { Request, Response, NextFunction } from 'express';
import { courseService } from '../services/courseService';

export class CourseController {
  public static async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await courseService.getCourses(req.query);
      res.json({
        success: true,
        data: result.courses,
        stats: result.stats,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getCourseById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const course = await courseService.getCourseById(id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      res.json({
        success: true,
        data: course
      });
    } catch (err) {
      next(err);
    }
  }

  public static async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const actorName = user?.fullName || 'System Admin';
      const created = await courseService.createCourse(req.body, actorName);

      res.status(201).json({
        success: true,
        data: created,
        message: `Course '${created.code} - ${created.title}' created successfully.`
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: { message: err.message || 'Failed to create course' }
      });
    }
  }

  public static async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const actorName = user?.fullName || 'System Admin';

      const updated = await courseService.updateCourse(id, req.body, actorName);

      res.json({
        success: true,
        data: updated,
        message: `Course '${updated.code}' updated successfully.`
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: { message: err.message || 'Failed to update course' }
      });
    }
  }

  public static async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const actorName = user?.fullName || 'System Admin';

      const result = await courseService.deleteCourse(id, actorName);

      res.json({
        success: true,
        message: result.message
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: { message: err.message || 'Failed to delete course' }
      });
    }
  }

  public static async getDepartmentOptions(req: Request, res: Response, next: NextFunction) {
    try {
      const departments = await courseService.getDepartmentOptions();
      res.json({
        success: true,
        data: departments
      });
    } catch (err) {
      next(err);
    }
  }
}
