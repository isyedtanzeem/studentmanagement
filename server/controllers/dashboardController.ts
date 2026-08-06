import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';

const dashboardService = new DashboardService();

export class DashboardController {
  public static getStats(req: Request, res: Response): void {
    try {
      const stats = dashboardService.getStats();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard stats',
        error: error.message
      });
    }
  }

  public static getChartData(req: Request, res: Response): void {
    try {
      const timeframe = (req.query.timeframe as 'year' | 'semester' | 'month') || 'year';
      const chartData = dashboardService.getChartData(timeframe);
      res.status(200).json({
        success: true,
        data: chartData
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve chart analytics',
        error: error.message
      });
    }
  }

  public static getActivities(req: Request, res: Response): void {
    try {
      const limit = Number(req.query.limit) || 10;
      const activities = dashboardService.getRecentActivities(limit);
      res.status(200).json({
        success: true,
        data: activities
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve recent activities',
        error: error.message
      });
    }
  }

  public static getNotifications(req: Request, res: Response): void {
    try {
      const notifications = dashboardService.getNotifications();
      res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notifications',
        error: error.message
      });
    }
  }

  public static markNotificationRead(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const result = dashboardService.markNotificationRead(id);
      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update notification status',
        error: error.message
      });
    }
  }

  public static markAllNotificationsRead(req: Request, res: Response): void {
    try {
      const result = dashboardService.markAllNotificationsRead();
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update notifications',
        error: error.message
      });
    }
  }

  public static quickAction(req: Request, res: Response): void {
    try {
      const { actionType, payload } = req.body;
      const user = (req as any).user;

      let result: any;
      if (actionType === 'ADD_ADMISSION') {
        result = dashboardService.quickAddAdmission(payload, user);
      } else if (actionType === 'ADD_DEPARTMENT') {
        result = dashboardService.quickAddDepartment(payload, user);
      } else if (actionType === 'ADD_COURSE') {
        result = dashboardService.quickAddCourse(payload, user);
      } else if (actionType === 'ISSUE_NOTIFICATION') {
        result = dashboardService.quickIssueNotification(payload, user);
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid or unsupported quick action type'
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Quick action executed successfully',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to execute quick action',
        error: error.message
      });
    }
  }
}
