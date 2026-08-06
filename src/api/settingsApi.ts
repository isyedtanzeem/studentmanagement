import { fetchWithAuth } from './httpClient';

export interface UserProfileData {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    department?: string;
    employeeId?: string;
    studentId?: string;
    avatarUrl?: string;
    status: string;
    lastLogin?: string;
    createdAt: string;
  };
  preferences: {
    userId: string;
    theme: 'light' | 'dark' | 'system' | 'luxury_gold';
    language: string;
    emailAlerts: boolean;
    smsAlerts: boolean;
    desktopNotifs: boolean;
    compactView: boolean;
  };
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

export interface SystemUserItem {
  id: string;
  email: string;
  fullName: string;
  role: string;
  department?: string;
  employeeId?: string;
  studentId?: string;
  avatarUrl?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  lastLogin?: string;
  createdAt: string;
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

export const fetchUserProfile = async (token?: string): Promise<UserProfileData> => {
  const res = await fetchWithAuth('/api/v1/settings/profile', {}, token);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch profile');
  return data.data;
};

export const updateUserProfile = async (
  profileData: { fullName?: string; email?: string; phone?: string; department?: string; avatarUrl?: string },
  token?: string
) => {
  const res = await fetchWithAuth('/api/v1/settings/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }, token);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update profile');
  return data;
};

export const updateUserAvatar = async (avatarUrl: string, token?: string) => {
  const res = await fetchWithAuth('/api/v1/settings/avatar', {
    method: 'POST',
    body: JSON.stringify({ avatarUrl })
  }, token);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update avatar');
  return data;
};

export const changeUserPassword = async (
  passwords: { currentPassword: string; newPassword: string },
  token?: string
) => {
  const res = await fetchWithAuth('/api/v1/settings/change-password', {
    method: 'PUT',
    body: JSON.stringify(passwords)
  }, token);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to change password');
  return data;
};

export const fetchPreferences = async (token?: string) => {
  const res = await fetchWithAuth('/api/v1/settings/preferences', {}, token);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch preferences');
  return data.preferences;
};

export const updatePreferences = async (prefs: Partial<UserProfileData['preferences']>, token?: string) => {
  const res = await fetchWithAuth('/api/v1/settings/preferences', {
    method: 'PUT',
    body: JSON.stringify(prefs)
  }, token);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update preferences');
  return data.preferences;
};

export const fetchOrgSettings = async (token?: string): Promise<OrganizationSettings> => {
  const res = await fetchWithAuth('/api/v1/settings/org-settings', {}, token);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch org settings');
  return data.data;
};

export const updateOrgSettings = async (settings: Partial<OrganizationSettings>, token?: string) => {
  const res = await fetchWithAuth('/api/v1/settings/org-settings', {
    method: 'PUT',
    body: JSON.stringify(settings)
  }, token);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update org settings');
  return data.data;
};

export const fetchAllUsers = async (
  params?: { search?: string; role?: string; status?: string },
  token?: string
): Promise<SystemUserItem[]> => {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.role) query.append('role', params.role);
  if (params?.status) query.append('status', params.status);

  const res = await fetchWithAuth(`/api/v1/settings/users?${query.toString()}`, {}, token);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch users');
  return data.users;
};

export const createSystemUser = async (
  userData: {
    fullName: string;
    email: string;
    password?: string;
    role: string;
    department?: string;
    employeeId?: string;
    avatarUrl?: string;
  },
  token?: string
) => {
  const res = await fetchWithAuth('/api/v1/settings/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  }, token);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create user');
  return data;
};

export const updateUserStatus = async (userId: string, status: 'Active' | 'Inactive' | 'Suspended', token?: string) => {
  const res = await fetchWithAuth(`/api/v1/settings/users/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }, token);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update user status');
  return data;
};

export const updateUserRole = async (userId: string, role: string, token?: string) => {
  const res = await fetchWithAuth(`/api/v1/settings/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role })
  }, token);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update user role');
  return data;
};

export const adminResetUserPassword = async (userId: string, newPassword?: string, token?: string) => {
  const res = await fetchWithAuth(`/api/v1/settings/users/${userId}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ newPassword })
  }, token);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to reset user password');
  return data;
};

export const fetchRolePermissions = async (token?: string): Promise<RolePermissionDefinition[]> => {
  const res = await fetchWithAuth('/api/v1/settings/role-permissions', {}, token);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch role permissions');
  return data.roles;
};

export const updateRolePermissions = async (
  roleName: string,
  permissions: RolePermissionModule[],
  token?: string
) => {
  const res = await fetchWithAuth(`/api/v1/settings/role-permissions/${encodeURIComponent(roleName)}`, {
    method: 'PUT',
    body: JSON.stringify({ permissions })
  }, token);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update role permissions');
  return data;
};
