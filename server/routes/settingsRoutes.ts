import { Router } from 'express';
import { SettingsController } from '../controllers/settingsController';
import { protect } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();

router.use(protect);

// Profile
router.get('/profile', SettingsController.getProfile);
router.put('/profile', SettingsController.updateProfile);
router.post('/avatar', SettingsController.updateAvatar);
router.put('/change-password', SettingsController.changePassword);

// Theme & Preferences
router.get('/preferences', SettingsController.getPreferences);
router.put('/preferences', SettingsController.updatePreferences);

// Organization Settings (Restricted to Super Admin & Admin)
router.get('/org-settings', SettingsController.getOrgSettings);
router.put('/org-settings', authorizeRoles('Super Admin', 'Admin') as any, SettingsController.updateOrgSettings);

// User Management (Restricted to Super Admin & Admin)
router.get('/users', authorizeRoles('Super Admin', 'Admin') as any, SettingsController.getUsers);
router.post('/users', authorizeRoles('Super Admin', 'Admin') as any, SettingsController.createUser);
router.put('/users/:userId/status', authorizeRoles('Super Admin', 'Admin') as any, SettingsController.updateUserStatus);
router.put('/users/:userId/role', authorizeRoles('Super Admin', 'Admin') as any, SettingsController.updateUserRole);
router.post('/users/:userId/reset-password', authorizeRoles('Super Admin', 'Admin') as any, SettingsController.adminResetPassword);

// Role Permissions (Restricted to Super Admin & Admin)
router.get('/role-permissions', authorizeRoles('Super Admin', 'Admin') as any, SettingsController.getRolePermissions);
router.put('/role-permissions/:roleName', authorizeRoles('Super Admin', 'Admin') as any, SettingsController.updateRolePermissions);

export default router;
