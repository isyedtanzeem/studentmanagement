import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { dbStore } from '../config/db';

const router = Router();

router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', protect as any, AuthController.logout as any);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Protected Auth routes
router.post('/change-password', protect as any, AuthController.changePassword as any);
router.get('/me', protect as any, AuthController.getMe as any);

// Protected Audit log route for Admins
router.get(
  '/audit-logs',
  protect as any,
  authorizeRoles('Super Admin', 'Admin') as any,
  (req, res) => {
    res.status(200).json({
      success: true,
      data: dbStore.auditLogs
    });
  }
);

export default router;
