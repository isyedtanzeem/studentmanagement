import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService';
import { AppError } from '../middlewares/errorMiddleware';

export class NotificationController {
  public static getInAppNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as string;
      const priority = req.query.priority as string;
      const unreadOnly = req.query.unreadOnly === 'true';

      const data = NotificationService.getInAppNotifications({ category, priority, unreadOnly });
      const stats = NotificationService.getStats();

      return res.status(200).json({
        success: true,
        data,
        stats
      });
    } catch (error) {
      return next(error);
    }
  }

  public static markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const item = NotificationService.markAsRead(id);
      if (!item) {
        throw new AppError('Notification not found.', 404);
      }
      return res.status(200).json({
        success: true,
        data: item,
        message: 'Marked notification as read.'
      });
    } catch (error) {
      return next(error);
    }
  }

  public static markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = NotificationService.markAllAsRead();
      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read.',
        data: result
      });
    } catch (error) {
      return next(error);
    }
  }

  public static deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      NotificationService.deleteNotification(id);
      return res.status(200).json({
        success: true,
        message: 'Notification deleted successfully.'
      });
    } catch (error) {
      return next(error);
    }
  }

  public static clearAll(req: Request, res: Response, next: NextFunction) {
    try {
      NotificationService.clearAllNotifications();
      return res.status(200).json({
        success: true,
        message: 'All notifications cleared.'
      });
    } catch (error) {
      return next(error);
    }
  }

  public static sendBroadcast(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, message, senderName, senderRole, targetGroup, departmentFilter, priority, sendEmailCopy } = req.body;

      if (!title || !message || !targetGroup) {
        throw new AppError('Title, message, and target audience are required for broadcast.', 400);
      }

      const broadcast = NotificationService.sendBroadcastMessage({
        title,
        message,
        senderName,
        senderRole,
        targetGroup,
        departmentFilter,
        priority: priority || 'medium',
        sendEmailCopy: !!sendEmailCopy
      });

      return res.status(201).json({
        success: true,
        data: broadcast,
        message: `Broadcast message dispatched to ${broadcast.totalRecipientsCount} recipients.`
      });
    } catch (error) {
      return next(error);
    }
  }

  public static getBroadcasts(req: Request, res: Response, next: NextFunction) {
    try {
      const broadcasts = NotificationService.getBroadcasts();
      return res.status(200).json({
        success: true,
        data: broadcasts
      });
    } catch (error) {
      return next(error);
    }
  }

  public static triggerAdmissionAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const { alertType, applicantName, email, department, applicationId, customMessage } = req.body;

      if (!alertType || !applicantName || !email || !department) {
        throw new AppError('alertType, applicantName, email, and department are required.', 400);
      }

      const result = NotificationService.triggerAdmissionAlert(alertType, {
        applicantName,
        email,
        department,
        applicationId,
        customMessage
      });

      return res.status(201).json({
        success: true,
        data: result,
        message: `Admission alert '${alertType}' dispatched to ${email}.`
      });
    } catch (error) {
      return next(error);
    }
  }

  public static triggerStudentAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const { alertType, studentId, fullName, email, department, attendance, gpa, amountDue, customNote } = req.body;

      if (!alertType || !studentId || !fullName || !email) {
        throw new AppError('alertType, studentId, fullName, and email are required.', 400);
      }

      const result = NotificationService.triggerStudentAlert(alertType, {
        studentId,
        fullName,
        email,
        department: department || 'General',
        attendance,
        gpa,
        amountDue,
        customNote
      });

      return res.status(201).json({
        success: true,
        data: result,
        message: `Student alert '${alertType}' triggered for ${fullName}.`
      });
    } catch (error) {
      return next(error);
    }
  }

  public static triggerDocumentAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const { alertType, studentId, studentName, email, documentType, reason } = req.body;

      if (!alertType || !studentId || !studentName || !email) {
        throw new AppError('alertType, studentId, studentName, and email are required.', 400);
      }

      const result = NotificationService.triggerDocumentAlert(alertType, {
        studentId,
        studentName,
        email,
        documentType,
        reason
      });

      return res.status(201).json({
        success: true,
        data: result,
        message: `Document alert '${alertType}' triggered for ${studentName}.`
      });
    } catch (error) {
      return next(error);
    }
  }

  public static getEmailLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as string;
      const logs = NotificationService.getEmailLogs(category);
      return res.status(200).json({
        success: true,
        data: logs
      });
    } catch (error) {
      return next(error);
    }
  }

  public static sendCustomEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { recipientEmail, recipientName, subject, templateName, messageBody, category } = req.body;

      if (!recipientEmail || !subject || !messageBody) {
        throw new AppError('recipientEmail, subject, and messageBody are required.', 400);
      }

      const emailLog = NotificationService.sendCustomEmail({
        recipientEmail,
        recipientName: recipientName || recipientEmail,
        subject,
        templateName: templateName || 'Custom Direct Email',
        messageBody,
        category
      });

      return res.status(201).json({
        success: true,
        data: emailLog,
        message: `Email successfully dispatched to ${recipientEmail}.`
      });
    } catch (error) {
      return next(error);
    }
  }

  public static getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = NotificationService.getStats();
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      return next(error);
    }
  }
}
