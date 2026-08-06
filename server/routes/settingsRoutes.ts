import { Router } from 'express';
import { SettingsController } from '../controllers/settingsController';
import { protect } from '../middlewares/authMiddleware';

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

// Organization Settings
router.get('/org-settings', SettingsController.getOrgSettings);
router.put('/org-settings', SettingsController.updateOrgSettings);

// User Management
router.get('/users', SettingsController.getUsers);
router.post('/users', SettingsController.createUser);
router.put('/users/:userId/status', SettingsController.updateUserStatus);
router.put('/users/:userId/role', SettingsController.updateUserRole);
router.post('/users/:userId/reset-password', SettingsController.adminResetPassword);

// Role Permissions
router.get('/role-permissions', SettingsController.getRolePermissions);
router.put('/role-permissions/:roleName', SettingsController.updateRolePermissions);

export default router;
