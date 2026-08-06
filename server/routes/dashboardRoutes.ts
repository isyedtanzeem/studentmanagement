import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { protect } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();

// Protect all dashboard routes
router.use(protect);

// Dashboard Metrics & Charts
router.get('/stats', DashboardController.getStats);
router.get('/charts', DashboardController.getChartData);
router.get('/activities', DashboardController.getActivities);

// Dashboard Notifications
router.get('/notifications', DashboardController.getNotifications);
router.patch('/notifications/read-all', DashboardController.markAllNotificationsRead);
router.patch('/notifications/:id/read', DashboardController.markNotificationRead);

// Quick Actions (RBAC: Staff, Admins, Faculty)
router.post(
  '/quick-action',
  authorizeRoles('Super Admin', 'Admin', 'Admission Officer', 'Faculty'),
  DashboardController.quickAction
);

export default router;
