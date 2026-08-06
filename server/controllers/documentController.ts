import { Request, Response, NextFunction } from 'express';
import { documentService } from '../services/documentService';

export class DocumentController {
  public static async getDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await documentService.getDocuments(req.query);
      res.json({
        success: true,
        data: result.documents,
        stats: result.stats,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getDocumentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const doc = await documentService.getDocumentById(id);

      if (!doc) {
        return res.status(404).json({
          success: false,
          error: { message: 'Document record not found.' }
        });
      }

      res.json({
        success: true,
        data: doc
      });
    } catch (err) {
      next(err);
    }
  }

  public static async createDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const actorName = user?.fullName || 'Registrar Admin';
      const created = await documentService.createDocument(req.body, actorName);

      res.status(201).json({
        success: true,
        data: created,
        message: `Document '${created.title}' uploaded successfully.`
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: { message: err.message || 'Failed to upload document.' }
      });
    }
  }

  public static async updateDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const actorName = user?.fullName || 'Registrar Admin';
      const updated = await documentService.updateDocument(id, req.body, actorName);

      res.json({
        success: true,
        data: updated,
        message: `Document '${updated.documentId}' updated successfully.`
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: { message: err.message || 'Failed to update document.' }
      });
    }
  }

  public static async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const actorName = user?.fullName || 'Super Admin';
      await documentService.deleteDocument(id, actorName);

      res.json({
        success: true,
        message: 'Document record deleted successfully.'
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: { message: err.message || 'Failed to delete document.' }
      });
    }
  }
}
