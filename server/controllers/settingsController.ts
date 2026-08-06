import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { SettingsService } from '../services/settingsService';

export class SettingsController {
  // Get Current Profile
  public static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const data = await SettingsService.getUserProfile(req.user.userId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  // Update Current Profile
  public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const updated = await SettingsService.updateUserProfile(req.user.userId, req.body);
      res.json({ success: true, message: 'Profile updated successfully', user: updated });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  // Update Avatar Picture
  public static async updateAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const { avatarUrl } = req.body;
      const updated = await SettingsService.updateAvatar(req.user.userId, avatarUrl);
      res.json({ success: true, message: 'Profile picture updated', user: updated });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  // Change Password
  public static async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const { currentPassword, newPassword } = req.body;
      const result = await SettingsService.changePassword(req.user.userId, currentPassword, newPassword);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  // Get Preferences / Theme
  public static async getPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const prefs = SettingsService.getUserPreferences(req.user.userId);
      res.json({ success: true, preferences: prefs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Update Preferences / Theme
  public static async updatePreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const updated = SettingsService.updateUserPreferences(req.user.userId, req.body);
      res.json({ success: true, message: 'Preferences updated', preferences: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get Organization Settings
  public static async getOrgSettings(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = SettingsService.getOrganizationSettings();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Update Organization Settings
  public static async updateOrgSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = SettingsService.updateOrganizationSettings(req.body);
      res.json({ success: true, message: 'Organization settings updated', data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // User Management: List
  public static async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { search, role, status } = req.query;
      const users = await SettingsService.getAllUsers(
        search as string,
        role as string,
        status as string
      );
      res.json({ success: true, count: users.length, users });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // User Management: Create User
  public static async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = await SettingsService.createUser(req.body);
      res.status(201).json({ success: true, message: 'User account created', user });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  // User Management: Update User Status
  public static async updateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { status } = req.body;
      const updated = await SettingsService.updateUserStatus(userId, status);
      res.json({ success: true, message: `User status updated to ${status}`, user: updated });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  // User Management: Update User Role
  public static async updateUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      const updated = await SettingsService.updateUserRole(userId, role);
      res.json({ success: true, message: `User role updated to ${role}`, user: updated });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  // User Management: Admin Reset Password
  public static async adminResetPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;
      const result = await SettingsService.adminResetPassword(userId, newPassword);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  // Role Permissions: List Matrix
  public static async getRolePermissions(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const roles = SettingsService.getRolePermissions();
      res.json({ success: true, roles });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Role Permissions: Update
  public static async updateRolePermissions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { roleName } = req.params;
      const { permissions } = req.body;
      const updated = SettingsService.updateRolePermissions(roleName, permissions);
      res.json({ success: true, message: `Permissions updated for role ${roleName}`, role: updated });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
}
