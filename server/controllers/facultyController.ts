import { Request, Response } from 'express';
import { facultyService } from '../services/facultyService';

export class FacultyController {
  public static async getFacultyList(req: Request, res: Response) {
    try {
      const result = await facultyService.getFacultyList(req.query as any);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch faculty list.' }
      });
    }
  }

  public static async getFacultyById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await facultyService.getFacultyById(id);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: { message: error.message || 'Faculty member not found.' }
      });
    }
  }

  public static async createFaculty(req: Request, res: Response) {
    try {
      const actorName = (req as any).user?.fullName || 'System Admin';
      const result = await facultyService.createFaculty(req.body, actorName);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { message: error.message || 'Failed to create faculty record.' }
      });
    }
  }

  public static async updateFaculty(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const actorName = (req as any).user?.fullName || 'System Admin';
      const result = await facultyService.updateFaculty(id, req.body, actorName);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { message: error.message || 'Failed to update faculty record.' }
      });
    }
  }

  public static async deleteFaculty(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const actorName = (req as any).user?.fullName || 'System Admin';
      const result = await facultyService.deleteFaculty(id, actorName);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { message: error.message || 'Failed to delete faculty record.' }
      });
    }
  }
}
