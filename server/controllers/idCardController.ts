import { Request, Response } from 'express';
import { IdCardService } from '../services/idCardService';

const idCardService = new IdCardService();

export class IdCardController {
  public static getIdCards = async (req: Request, res: Response) => {
    try {
      const { page, limit, search, department, status, layoutTemplate } = req.query;

      const result = idCardService.getIdCards({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        department: department as string,
        status: status as string,
        layoutTemplate: layoutTemplate as string
      });

      return res.status(200).json({
        success: true,
        data: result.cards,
        pagination: result.pagination,
        stats: result.stats,
        branding: result.branding
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch student ID cards list.'
      });
    }
  };

  public static getIdCardById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const card = idCardService.getIdCardById(id);
      return res.status(200).json({
        success: true,
        data: card
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || 'ID Card record not found.'
      });
    }
  };

  public static generateCard = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user || { id: 'usr-100', fullName: 'System Administrator', email: 'admin@scholarcore.edu', role: 'SuperAdmin' };
      const card = await idCardService.generateCard(req.body, user);
      return res.status(201).json({
        success: true,
        data: card,
        message: 'Student ID card generated successfully.'
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to generate ID card.'
      });
    }
  };

  public static batchGenerateCards = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user || { id: 'usr-100', fullName: 'System Administrator', email: 'admin@scholarcore.edu', role: 'SuperAdmin' };
      const { studentDbIds, layoutTemplate } = req.body;
      const result = await idCardService.batchGenerateCards(studentDbIds || [], layoutTemplate, user);
      return res.status(200).json({
        success: true,
        data: result,
        message: `Batch ID cards generated for ${result.generatedCount} students.`
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to execute batch ID card generation.'
      });
    }
  };

  public static updateCard = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user || { id: 'usr-100', fullName: 'System Administrator', email: 'admin@scholarcore.edu', role: 'SuperAdmin' };
      const updated = idCardService.updateCard(id, req.body, user);
      return res.status(200).json({
        success: true,
        data: updated,
        message: 'ID Card profile updated successfully.'
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update ID card profile.'
      });
    }
  };

  public static revokeCard = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const user = (req as any).user || { id: 'usr-100', fullName: 'System Administrator', email: 'admin@scholarcore.edu', role: 'SuperAdmin' };
      const revoked = idCardService.revokeCard(id, reason || 'Administrative action', user);
      return res.status(200).json({
        success: true,
        data: revoked,
        message: 'ID Card revoked successfully.'
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to revoke ID card.'
      });
    }
  };

  public static recordPrint = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const card = idCardService.recordPrint(id);
      return res.status(200).json({
        success: true,
        data: card
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to record print action.'
      });
    }
  };

  public static getBranding = async (req: Request, res: Response) => {
    try {
      const branding = idCardService.getBrandingConfig();
      return res.status(200).json({
        success: true,
        data: branding
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch college branding config.'
      });
    }
  };

  public static updateBranding = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user || { id: 'usr-100', fullName: 'System Administrator', email: 'admin@scholarcore.edu', role: 'SuperAdmin' };
      const updated = idCardService.updateBrandingConfig(req.body, user);
      return res.status(200).json({
        success: true,
        data: updated,
        message: 'College branding configuration updated successfully.'
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update college branding.'
      });
    }
  };
}
