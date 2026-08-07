import { dbStore, SystemUser } from '../config/db';
import { UserModel } from '../models/User';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { AppError } from '../middlewares/errorMiddleware';

export interface UserProfileUpdate {
  fullName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  department?: string;
  bio?: string;
}

export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'system' | 'luxury_gold';
  language: string;
  emailAlerts: boolean;
  smsAlerts: boolean;
  desktopNotifs: boolean;
  compactView: boolean;
}

export interface OrganizationSettings {
  institutionName: string;
  tagline: string;
  establishmentYear: string;
  affiliationBody: string;
  accreditationGrade: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  logoUrl: string;
  currencySymbol: string;
  academicYearFormat: string;
  defaultTimezone: string;
  gradingSystem: string;
}

export interface RolePermissionModule {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
}

export interface RolePermissionDefinition {
  role: string;
  description: string;
  permissions: RolePermissionModule[];
}

export class SettingsService {
  private static userPreferencesStore = new Map<string, UserPreferences>();

  private static orgSettings: OrganizationSettings = {
    institutionName: 'ScholarCore Institute of Technology & Research',
    tagline: 'Excellence in Higher Education & Academic Innovation',
    establishmentYear: '1984',
    affiliationBody: 'Central Board of Technical Education (CBTE)',
    accreditationGrade: 'NAAC A++ Grade Accredited',
    address: 'Campus Grounds, Tech Corridor, Sector 62, Academic Hill, City - 560012',
    contactEmail: 'admin@scholarcore.edu.in',
    contactPhone: '+91 (080) 4123-9000',
    website: 'https://scholarcore.edu.in',
    logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=200',
    currencySymbol: '₹',
    academicYearFormat: '2026-2027',
    defaultTimezone: 'Asia/Kolkata (IST)',
    gradingSystem: '10-Point CGPA Relative Grading'
  };

  private static rolePermissionsStore: RolePermissionDefinition[] = [
    {
      role: 'Super Admin',
      description: 'Unrestricted full administrative access across all system modules & security configs.',
      permissions: [
        { module: 'Admissions', view: true, create: true, edit: true, delete: true, export: true },
        { module: 'Students', view: true, create: true, edit: true, delete: true, export: true },
        { module: 'Departments', view: true, create: true, edit: true, delete: true, export: true },
        { module: 'Courses', view: true, create: true, edit: true, delete: true, export: true },
        { module: 'Documents', view: true, create: true, edit: true, delete: true, export: true },
        { module: 'ID Cards', view: true, create: true, edit: true, delete: true, export: true },
        { module: 'Promotions', view: true, create: true, edit: true, delete: true, export: true },
        { module: 'Alumni', view: true, create: true, edit: true, delete: true, export: true },
        { module: 'Reports', view: true, create: true, edit: true, delete: true, export: true },
        { module: 'Notifications', view: true, create: true, edit: true, delete: true, export: true },
        { module: 'Settings', view: true, create: true, edit: true, delete: true, export: true }
      ]
    },
    {
      role: 'Admin',
      description: 'Comprehensive academic administration and student life operations control.',
      permissions: [
        { module: 'Admissions', view: true, create: true, edit: true, delete: false, export: true },
        { module: 'Students', view: true, create: true, edit: true, delete: false, export: true },
        { module: 'Departments', view: true, create: true, edit: true, delete: false, export: true },
        { module: 'Courses', view: true, create: true, edit: true, delete: false, export: true },
        { module: 'Documents', view: true, create: true, edit: true, delete: false, export: true },
        { module: 'ID Cards', view: true, create: true, edit: true, delete: false, export: true },
        { module: 'Promotions', view: true, create: true, edit: true, delete: false, export: true },
        { module: 'Alumni', view: true, create: true, edit: true, delete: false, export: true },
        { module: 'Reports', view: true, create: false, edit: false, delete: false, export: true },
        { module: 'Notifications', view: true, create: true, edit: true, delete: false, export: true },
        { module: 'Settings', view: true, create: false, edit: false, delete: false, export: false }
      ]
    },
    {
      role: 'Admission Officer',
      description: 'Handles new applicant registrations, verification workflows, and seat confirmations.',
      permissions: [
        { module: 'Admissions', view: true, create: true, edit: true, delete: false, export: true },
        { module: 'Students', view: true, create: true, edit: false, delete: false, export: true },
        { module: 'Documents', view: true, create: true, edit: true, delete: false, export: true },
        { module: 'Notifications', view: true, create: true, edit: false, delete: false, export: false }
      ]
    }
  ];

  // --- 1. User Profile Management ---
  public static async getUserProfile(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const prefs = this.getUserPreferences(userId);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        studentId: user.studentId,
        avatarUrl: user.avatarUrl,
        status: user.status,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },
      preferences: prefs
    };
  }

  public static async updateUserProfile(userId: string, data: UserProfileUpdate) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    // Check if email is being changed and if it already exists
    if (data.email && data.email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = await UserModel.findByEmail(data.email);
      if (existing && existing.id !== userId) {
        throw new AppError('Email is already registered by another account.', 400);
      }
    }

    const updated = await UserModel.update(userId, {
      fullName: data.fullName || user.fullName,
      email: data.email || user.email,
      avatarUrl: data.avatarUrl || user.avatarUrl,
      department: data.department || user.department
    });

    return updated;
  }

  public static async updateAvatar(userId: string, avatarUrl: string) {
    if (!avatarUrl) {
      throw new AppError('Avatar URL or data string is required.', 400);
    }
    const updated = await UserModel.update(userId, { avatarUrl });
    return updated;
  }

  public static async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const isMatch = await comparePassword(currentPass, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Current password provided is incorrect.', 400);
    }

    if (!newPass || newPass.length < 8) {
      throw new AppError('New password must be at least 8 characters long.', 400);
    }

    const newHash = await hashPassword(newPass);
    await UserModel.update(userId, { passwordHash: newHash });

    return { success: true, message: 'Password changed successfully.' };
  }

  // --- 2. User Theme & Preferences ---
  public static getUserPreferences(userId: string): UserPreferences {
    if (!this.userPreferencesStore.has(userId)) {
      this.userPreferencesStore.set(userId, {
        userId,
        theme: 'light',
        language: 'English (US)',
        emailAlerts: true,
        smsAlerts: true,
        desktopNotifs: true,
        compactView: false
      });
    }
    return this.userPreferencesStore.get(userId)!;
  }

  public static updateUserPreferences(userId: string, prefs: Partial<UserPreferences>): UserPreferences {
    const current = this.getUserPreferences(userId);
    const updated: UserPreferences = { ...current, ...prefs };
    this.userPreferencesStore.set(userId, updated);
    return updated;
  }

  // --- 3. Organization Settings ---
  public static getOrganizationSettings(): OrganizationSettings {
    return { ...this.orgSettings };
  }

  public static updateOrganizationSettings(updates: Partial<OrganizationSettings>): OrganizationSettings {
    this.orgSettings = { ...this.orgSettings, ...updates };
    return { ...this.orgSettings };
  }

  // --- 4. User Management (Admin) ---
  public static async getAllUsers(search?: string, role?: string, status?: string) {
    await UserModel.seedDefaultUsers();
    let users = Array.from(dbStore.users.values()).map(u => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      department: u.department,
      employeeId: u.employeeId,
      studentId: u.studentId,
      avatarUrl: u.avatarUrl,
      status: u.status,
      lastLogin: u.lastLogin,
      createdAt: u.createdAt
    }));

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(
        u =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.employeeId && u.employeeId.toLowerCase().includes(q))
      );
    }

    if (role && role !== 'ALL') {
      users = users.filter(u => u.role.toLowerCase() === role.toLowerCase());
    }

    if (status && status !== 'ALL') {
      users = users.filter(u => u.status === status);
    }

    return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static async createUser(data: {
    fullName: string;
    email: string;
    password?: string;
    role: string;
    department?: string;
    employeeId?: string;
    studentId?: string;
    avatarUrl?: string;
  }) {
    const existing = await UserModel.findByEmail(data.email);
    if (existing) {
      throw new AppError('User with this email already exists.', 400);
    }

    const defaultPass = data.password || 'ScholarCore2026!';
    const passwordHash = await hashPassword(defaultPass);

    const newUser: SystemUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      role: (data.role || 'Faculty') as any,
      department: data.department || 'General Academics',
      employeeId: data.employeeId || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      studentId: data.studentId,
      avatarUrl:
        data.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    dbStore.users.set(newUser.id, newUser);

    return {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      department: newUser.department,
      employeeId: newUser.employeeId,
      studentId: newUser.studentId,
      status: newUser.status,
      createdAt: newUser.createdAt
    };
  }

  public static async updateUserStatus(userId: string, status: 'Active' | 'Inactive' | 'Suspended') {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const mappedStatus = status === 'Inactive' ? 'Suspended' : status;
    const updated = await UserModel.update(userId, { status: mappedStatus as any });
    return updated;
  }

  public static async updateUserRole(userId: string, role: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const updated = await UserModel.update(userId, { role: role as any });
    return updated;
  }

  public static async adminResetPassword(userId: string, newPassword?: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const passToSet = newPassword || 'ScholarReset2026!';
    const passwordHash = await hashPassword(passToSet);

    await UserModel.update(userId, { passwordHash });

    return {
      success: true,
      message: `Password reset successfully for ${user.fullName}.`,
      temporaryPassword: passToSet
    };
  }

  // --- 5. Role Permissions Matrix ---
  public static getRolePermissions() {
    return [...this.rolePermissionsStore];
  }

  public static updateRolePermissions(roleName: string, permissions: RolePermissionModule[]) {
    const roleDef = this.rolePermissionsStore.find(r => r.role.toLowerCase() === roleName.toLowerCase());
    if (!roleDef) {
      throw new AppError('Role not found.', 404);
    }

    roleDef.permissions = permissions;
    return roleDef;
  }
}
