import {
  LoginCredentials,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
  AuthResponse,
  AuditLogItem
} from '../types/auth';
import { fetchWithAuth } from './httpClient';

class AuthApiClient {
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetchWithAuth('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed.');
    }
    return data;
  }

  public async refreshToken(refreshTokenStr: string): Promise<AuthResponse> {
    const response = await fetchWithAuth('/api/v1/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: refreshTokenStr })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Token refresh failed.');
    }
    return data;
  }

  public async logout(token?: string | null): Promise<{ success: boolean; message: string }> {
    const refreshToken = localStorage.getItem('sims_refresh_token');
    try {
      const response = await fetchWithAuth('/api/v1/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      }, token);
      return await response.json();
    } catch {
      return { success: true, message: 'Logged out locally.' };
    }
  }

  public async forgotPassword(payload: ForgotPasswordPayload): Promise<{ success: boolean; message: string; resetToken?: string }> {
    const response = await fetchWithAuth('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to process forgot password request.');
    }
    return data;
  }

  public async resetPassword(payload: ResetPasswordPayload): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithAuth('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Password reset failed.');
    }
    return data;
  }

  public async changePassword(payload: ChangePasswordPayload, token?: string | null): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithAuth('/api/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, token);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to change password.');
    }
    return data;
  }

  public async getMe(token?: string | null): Promise<AuthResponse> {
    const response = await fetchWithAuth('/api/v1/auth/me', {
      method: 'GET'
    }, token);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to rehydrate session profile.');
    }
    return data;
  }

  public async getAuditLogs(token?: string | null): Promise<{ success: boolean; data: AuditLogItem[] }> {
    const response = await fetchWithAuth('/api/v1/auth/audit-logs', {
      method: 'GET'
    }, token);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to retrieve audit logs.');
    }
    return data;
  }
}

export const authApi = new AuthApiClient();
