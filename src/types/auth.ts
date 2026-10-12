export type UserRole = 'Super Admin' | 'Admin' | 'Admission Officer' | 'Faculty' | 'Student';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  studentId?: string;
  employeeId?: string;
  avatarUrl?: string;
  status: 'Active' | 'Suspended' | 'Pending';
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  action: string;
  ipAddress: string;
  timestamp: string;
  details?: string;
}
