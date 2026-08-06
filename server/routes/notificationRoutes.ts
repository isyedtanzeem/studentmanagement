import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Apply auth middleware to all notification routes
router.use(protect);

// In-App Notifications
router.get('/', NotificationController.getInAppNotifications);
router.patch('/read-all', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);
router.delete('/clear-all', NotificationController.clearAll);
router.delete('/:id', NotificationController.deleteNotification);

// Stats & Summaries
router.get('/stats', NotificationController.getStats);

// Broadcast Messages
router.post('/broadcast', NotificationController.sendBroadcast);
router.get('/broadcasts', NotificationController.getBroadcasts);

// Specific Alert Triggers
router.post('/trigger/admission', NotificationController.triggerAdmissionAlert);
router.post('/trigger/student', NotificationController.triggerStudentAlert);
router.post('/trigger/document', NotificationController.triggerDocumentAlert);

// Email Logs & Direct Dispatch
router.get('/email-logs', NotificationController.getEmailLogs);
router.post('/send-email', NotificationController.sendCustomEmail);

export default router;
