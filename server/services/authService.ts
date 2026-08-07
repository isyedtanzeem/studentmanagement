import crypto from 'crypto';
import { dbStore, RefreshTokenRecord, AuditLogRecord } from '../config/db';
import { UserModel } from '../models/User';
import { comparePassword, hashPassword } from '../utils/passwordUtils';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload
} from '../utils/jwtUtils';
import { AppError } from '../middlewares/errorMiddleware';

export class AuthService {
  public static async login(
    email: string,
    password: string,
    userAgent: string = 'Browser',
    ipAddress: string = '127.0.0.1'
  ) {
    await UserModel.seedDefaultUsers();

    const user = await UserModel.findByEmail(email);

    if (!user) {
      throw new AppError('Invalid credentials. Please check your email and password.', 401);
    }

    if (user.status !== 'Active') {
      throw new AppError('Your account has been suspended or is pending approval.', 403);
    }

    if ((user.role as string) === 'Student' || (user.role as string) === 'Faculty') {
      throw new AppError('Portal access is strictly restricted to back-office administrative staff. Student and Faculty portal logins are disabled.', 403);
    }

    const isMatch = await comparePassword(password, user.passwordHash);

    if (!isMatch) {
      throw new AppError('Invalid credentials. Please check your email and password.', 401);
    }

    // Update lastLogin
    const nowIso = new Date().toISOString();
    await UserModel.update(user.id, { lastLogin: nowIso });

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Record refresh token
    const refreshTokenRecord: RefreshTokenRecord = {
      id: `rt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: user.id,
      token: refreshToken,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      createdAt: nowIso,
      revoked: false,
      userAgent,
      ipAddress
    };

    dbStore.refreshTokens.set(refreshTokenRecord.token, refreshTokenRecord);

    // Audit log
    const log: AuditLogRecord = {
      id: `log_${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'USER_LOGIN_SUCCESS',
      ipAddress,
      timestamp: nowIso,
      details: `Successful login via ${userAgent}`
    };
    dbStore.auditLogs.unshift(log);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
        employeeId: user.employeeId,
        avatarUrl: user.avatarUrl,
        lastLogin: nowIso
      }
    };
  }

  public static async refreshAccessToken(refreshTokenStr: string) {
    if (!refreshTokenStr) {
      throw new AppError('Refresh token required.', 400);
    }

    let decoded: TokenPayload;
    try {
      decoded = verifyRefreshToken(refreshTokenStr);
    } catch (err) {
      throw new AppError('Invalid or expired refresh token. Please login again.', 401);
    }

    const tokenRecord = dbStore.refreshTokens.get(refreshTokenStr);

    if (tokenRecord && tokenRecord.revoked) {
      throw new AppError('Invalid or expired refresh token. Please login again.', 401);
    }

    const user = await UserModel.findById(decoded.userId);

    if (!user || user.status !== 'Active') {
      throw new AppError('User account not active.', 401);
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    if (tokenRecord) {
      tokenRecord.revoked = true;
    }

    const newRecord: RefreshTokenRecord = {
      id: `rt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: user.id,
      token: newRefreshToken,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      createdAt: new Date().toISOString(),
      revoked: false
    };
    dbStore.refreshTokens.set(newRefreshToken, newRecord);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
        employeeId: user.employeeId,
        avatarUrl: user.avatarUrl,
        lastLogin: user.lastLogin
      }
    };
  }

  public static async logout(refreshTokenStr: string, userId?: string) {
    if (refreshTokenStr) {
      const tokenRecord = dbStore.refreshTokens.get(refreshTokenStr);
      if (tokenRecord) {
        tokenRecord.revoked = true;
      }
    }

    if (userId) {
      const user = await UserModel.findById(userId);
      if (user) {
        dbStore.auditLogs.unshift({
          id: `log_${Date.now()}`,
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          action: 'USER_LOGOUT',
          ipAddress: '127.0.0.1',
          timestamp: new Date().toISOString(),
          details: 'User explicitly logged out'
        });
      }
    }

    return { success: true };
  }

  public static async forgotPassword(email: string) {
    await UserModel.seedDefaultUsers();
    const user = await UserModel.findByEmail(email);

    if (!user) {
      // Return success message anyway for security prevention of user enumeration
      return {
        message: 'If an account with that email exists, a reset link has been dispatched.'
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    await UserModel.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: expiresAt
    });

    dbStore.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'PASSWORD_RESET_REQUESTED',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
      details: `Reset token generated: ${resetToken}`
    });

    return {
      message: 'Password reset link generated successfully.',
      resetToken // Returned in development response for easy testing
    };
  }

  public static async resetPassword(token: string, newPassword: string) {
    const user = await UserModel.findByResetToken(token);

    if (!user) {
      throw new AppError('Password reset token is invalid or has expired.', 400);
    }

    if (newPassword.length < 8) {
      throw new AppError('Password must be at least 8 characters long.', 400);
    }

    const newHash = await hashPassword(newPassword);

    await UserModel.update(user.id, {
      passwordHash: newHash,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined
    });

    dbStore.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'PASSWORD_RESET_COMPLETED',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
      details: 'Password successfully reset with valid token'
    });

    return { message: 'Password updated successfully. You can now log in.' };
  }

  public static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const isMatch = await comparePassword(currentPassword, user.passwordHash);

    if (!isMatch) {
      throw new AppError('Current password is incorrect.', 400);
    }

    if (newPassword.length < 8) {
      throw new AppError('New password must be at least 8 characters long.', 400);
    }

    const newHash = await hashPassword(newPassword);
    await UserModel.update(user.id, { passwordHash: newHash });

    dbStore.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'PASSWORD_CHANGED',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
      details: 'User changed password from profile settings'
    });

    return { message: 'Password changed successfully.' };
  }

  public static async getProfile(userId: string) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('User profile not found.', 404);
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      studentId: user.studentId,
      employeeId: user.employeeId,
      avatarUrl: user.avatarUrl,
      lastLogin: user.lastLogin,
      status: user.status
    };
  }
}
