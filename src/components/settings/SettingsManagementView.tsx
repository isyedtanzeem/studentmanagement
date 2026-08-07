import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  fetchUserProfile,
  updateUserProfile,
  updateUserAvatar,
  changeUserPassword,
  fetchPreferences,
  updatePreferences,
  fetchOrgSettings,
  updateOrgSettings,
  fetchAllUsers,
  createSystemUser,
  updateUserStatus,
  updateUserRole,
  adminResetUserPassword,
  fetchRolePermissions,
  updateRolePermissions,
  UserProfileData,
  OrganizationSettings,
  SystemUserItem,
  RolePermissionDefinition
} from '../../api/settingsApi';
import {
  User,
  KeyRound,
  Palette,
  Building2,
  Users,
  ShieldCheck,
  Camera,
  CheckCircle2,
  AlertCircle,
  Save,
  Plus,
  RefreshCw,
  Search,
  Lock,
  X,
  Sparkles,
  Layers
} from 'lucide-react';

export const SettingsManagementView: React.FC = () => {
  const { accessToken, user: authUser } = useAuth();
  const { theme: currentGlobalTheme, setTheme } = useTheme();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'profile' | 'password' | 'theme' | 'organization' | 'users' | 'roles'
  >('profile');

  // Loading & Messages
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- 1. Profile State ---
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Preset Avatars
  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250'
  ];

  // --- 2. Change Password State ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- 3. Preferences / Theme State ---
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system' | 'luxury_gold'>('light');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [desktopNotifs, setDesktopNotifs] = useState(true);

  // --- 4. Organization Settings State ---
  const [orgForm, setOrgForm] = useState<OrganizationSettings | null>(null);

  // --- 5. User Management State ---
  const [usersList, setUsersList] = useState<SystemUserItem[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Faculty',
    department: 'Computer Science',
    employeeId: ''
  });
  const [resetModalUser, setResetModalUser] = useState<SystemUserItem | null>(null);
  const [generatedPassResult, setGeneratedPassResult] = useState<string | null>(null);

  // --- 6. Role Permissions Matrix State ---
  const [rolePermissions, setRolePermissions] = useState<RolePermissionDefinition[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('Super Admin');

  // Load Data on Tab Switch
  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      if (activeTab === 'profile') {
        const data = await fetchUserProfile(accessToken || undefined);
        setProfile(data);
        setEditName(data.user.fullName);
        setEditEmail(data.user.email);
        setEditDept(data.user.department || '');
        setEditAvatarUrl(data.user.avatarUrl || '');
      } else if (activeTab === 'theme') {
        const prefs = await fetchPreferences(accessToken || undefined);
        setThemeMode('light');
        setTheme('light');
        setEmailAlerts(prefs.emailAlerts ?? true);
        setSmsAlerts(prefs.smsAlerts ?? true);
        setDesktopNotifs(prefs.desktopNotifs ?? true);
      } else if (activeTab === 'organization') {
        const orgData = await fetchOrgSettings(accessToken || undefined);
        setOrgForm(orgData);
      } else if (activeTab === 'users') {
        const list = await fetchAllUsers(
          { search: userSearch, role: userRoleFilter, status: userStatusFilter },
          accessToken || undefined
        );
        setUsersList(list);
      } else if (activeTab === 'roles') {
        const rolesData = await fetchRolePermissions(accessToken || undefined);
        setRolePermissions(rolesData);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load tab settings data' });
    } finally {
      setLoading(false);
    }
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const updated = await updateUserProfile(
        { fullName: editName, email: editEmail, department: editDept, avatarUrl: editAvatarUrl },
        accessToken || undefined
      );
      setProfile(prev => (prev ? { ...prev, user: updated } : null));
      setMessage({ type: 'success', text: 'Profile information updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  // Avatar Select Helper
  const handleSelectAvatar = async (url: string) => {
    setEditAvatarUrl(url);
    try {
      await updateUserAvatar(url, accessToken || undefined);
      if (profile) {
        setProfile({ ...profile, user: { ...profile.user, avatarUrl: url } });
      }
      setShowAvatarPicker(false);
      setMessage({ type: 'success', text: 'Avatar image updated!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to update avatar image' });
    }
  };

  // Password Submit
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await changeUserPassword({ currentPassword, newPassword }, accessToken || undefined);
      setMessage({ type: 'success', text: 'Password changed successfully! Keep it safe.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  // Select Theme Helper
  const handleSelectThemePreset = (mode: any) => {
    setThemeMode(mode);
    setTheme('light');
  };

  // Save Preferences
  const handleSaveTheme = async () => {
    setLoading(true);
    setMessage(null);
    try {
      setTheme('light');
      await updatePreferences(
        { theme: 'light', emailAlerts, smsAlerts, desktopNotifs },
        accessToken || undefined
      );
      setMessage({ type: 'success', text: 'Notification preferences saved successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save preferences' });
    } finally {
      setLoading(false);
    }
  };

  // Save Organization Settings
  const handleSaveOrgSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgForm) return;
    setLoading(true);
    setMessage(null);
    try {
      await updateOrgSettings(orgForm, accessToken || undefined);
      setMessage({ type: 'success', text: 'Organization settings updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update organization settings' });
    } finally {
      setLoading(false);
    }
  };

  // User Management Search/Filter Reload
  const handleFilterUsers = async () => {
    setLoading(true);
    try {
      const list = await fetchAllUsers(
        { search: userSearch, role: userRoleFilter, status: userStatusFilter },
        accessToken || undefined
      );
      setUsersList(list);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to filter users' });
    } finally {
      setLoading(false);
    }
  };

  // Add User Submit
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await createSystemUser(newUserForm, accessToken || undefined);
      setMessage({ type: 'success', text: `User ${newUserForm.fullName} created successfully!` });
      setIsAddUserOpen(false);
      setNewUserForm({
        fullName: '',
        email: '',
        password: '',
        role: 'Faculty',
        department: 'Computer Science',
        employeeId: ''
      });
      await handleFilterUsers();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create user' });
    } finally {
      setLoading(false);
    }
  };

  // Toggle User Status
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateUserStatus(userId, nextStatus as any, accessToken || undefined);
      setMessage({ type: 'success', text: `User status changed to ${nextStatus}` });
      await handleFilterUsers();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update status' });
    }
  };

  // Change User Role
  const handleChangeUserRole = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole, accessToken || undefined);
      setMessage({ type: 'success', text: `User role changed to ${newRole}` });
      await handleFilterUsers();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update role' });
    }
  };

  // Admin Reset Password Submit
  const handleAdminResetPassword = async () => {
    if (!resetModalUser) return;
    setLoading(true);
    try {
      const res = await adminResetUserPassword(resetModalUser.id, undefined, accessToken || undefined);
      setGeneratedPassResult(res.temporaryPassword || 'ScholarReset2026!');
      setMessage({ type: 'success', text: `Password reset for ${resetModalUser.fullName}` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to reset password' });
    } finally {
      setLoading(false);
    }
  };

  // Toggle Role Permission Matrix Checkbox
  const handleTogglePermission = (
    roleName: string,
    moduleName: string,
    action: 'view' | 'create' | 'edit' | 'delete' | 'export'
  ) => {
    setRolePermissions(prev =>
      prev.map(roleItem => {
        if (roleItem.role.toLowerCase() === roleName.toLowerCase()) {
          const updatedPerms = roleItem.permissions.map(p => {
            if (p.module === moduleName) {
              return { ...p, [action]: !p[action] };
            }
            return p;
          });
          return { ...roleItem, permissions: updatedPerms };
        }
        return roleItem;
      })
    );
  };

  // Save Role Permissions
  const handleSaveRolePermissions = async (roleName: string) => {
    const roleDef = rolePermissions.find(r => r.role.toLowerCase() === roleName.toLowerCase());
    if (!roleDef) return;

    setLoading(true);
    setMessage(null);
    try {
      await updateRolePermissions(roleName, roleDef.permissions, accessToken || undefined);
      setMessage({ type: 'success', text: `Permissions updated for ${roleName}!` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save permissions' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              System Settings & Administration
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Control Center & User Governance
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl">
            Manage your personal profile, security credentials, visual theme preferences, institutional metadata, system users, and security role access matrix.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadTabData}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-2 text-sm font-medium cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Settings</span>
          </button>
        </div>
      </div>

      {/* Global Toast Message */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile & Picture</span>
        </button>

        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'password'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Security & Password</span>
        </button>

        <button
          onClick={() => setActiveTab('organization')}
          className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'organization'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Organization Info</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'roles'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Role Permissions</span>
        </button>
      </div>

      {/* --- TAB 1: PROFILE & PICTURE --- */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center space-y-4 shadow-sm">
            <div className="relative group">
              <img
                src={
                  editAvatarUrl ||
                  profile?.user.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                }
                alt="User Profile Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-md"
              />
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute bottom-1 right-1 p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md cursor-pointer"
                title="Change Avatar"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {profile?.user.fullName || authUser?.fullName || 'User Account'}
              </h3>
              <p className="text-sm text-blue-600 font-semibold">
                {profile?.user.role || authUser?.role || 'System Member'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {profile?.user.department || 'Academic Department'}
              </p>
            </div>

            <div className="w-full pt-4 border-t border-slate-200 text-xs text-slate-600 space-y-2 text-left">
              <div className="flex justify-between">
                <span>Employee / Student ID:</span>
                <span className="text-slate-900 font-mono font-semibold">
                  {profile?.user.employeeId || profile?.user.studentId || 'EMP-VC-001'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Account Status:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase border border-emerald-200">
                  {profile?.user.status || 'Active'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>System Member Since:</span>
                <span className="text-slate-700 font-medium">
                  {profile?.user.createdAt
                    ? new Date(profile.user.createdAt).toLocaleDateString()
                    : '06/08/2026'}
                </span>
              </div>
            </div>

            {/* Avatar Picker Modal Popup */}
            {showAvatarPicker && (
              <div className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 mt-4 text-left shadow-sm">
                <p className="text-xs font-semibold text-blue-600">Select Preset Avatar:</p>
                <div className="grid grid-cols-3 gap-2">
                  {presetAvatars.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Avatar option ${idx + 1}`}
                      onClick={() => handleSelectAvatar(url)}
                      className="w-14 h-14 rounded-full object-cover cursor-pointer hover:scale-105 border-2 border-transparent hover:border-blue-500 transition-all"
                    />
                  ))}
                </div>
                <div className="pt-2">
                  <label className="text-[11px] text-slate-500 block mb-1">
                    Or enter Custom Image URL:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editAvatarUrl}
                      onChange={e => setEditAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleSelectAvatar(editAvatarUrl)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs cursor-pointer hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Edit Profile Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Personal Profile & Contact Information</span>
              </h3>
              <p className="text-xs text-slate-500">
                Update your account display name, official email address, and departmental affiliation.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Department / Cell
                  </label>
                  <input
                    type="text"
                    value={editDept}
                    onChange={e => setEditDept(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Assigned System Role
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile?.user.role || 'Super Admin'}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Avatar Image URL
                </label>
                <input
                  type="text"
                  value={editAvatarUrl}
                  onChange={e => setEditAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-mono text-xs"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TAB 2: CHANGE PASSWORD & SECURITY --- */}
      {activeTab === 'password' && (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-600" />
              <span>Change Security Password</span>
            </h3>
            <p className="text-xs text-slate-500">
              Update your secret login password. Strong passwords contain uppercase letters, numbers, and special symbols.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  placeholder="Min 8 characters"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-blue-800">
                <Lock className="w-3.5 h-3.5 text-blue-600" /> Password Requirements Check:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                <li>Minimum length of 8 characters</li>
                <li>At least one number or special character</li>
                <li>Different from default demo credentials</li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm flex items-center gap-2 text-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Updating...' : 'Update Security Password'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- TAB 3: THEME & PREFERENCES --- */}
      {activeTab === 'theme' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                <span>Interface Theme & Styling Preset</span>
              </h3>
              <p className="text-xs text-slate-500">
                Choose your preferred visual atmosphere and color balance across the portal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Light Theme */}
              <div
                onClick={() => handleSelectThemePreset('light')}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-3 relative overflow-hidden ${
                  themeMode === 'light'
                    ? 'bg-blue-50/50 border-blue-600 shadow-md ring-2 ring-blue-500/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900">Academic Light</span>
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="h-16 rounded-lg bg-slate-100 border border-slate-300 p-2 flex flex-col justify-between">
                  <div className="w-12 h-2 rounded bg-blue-600" />
                  <div className="w-full h-2 rounded bg-slate-300" />
                </div>
              </div>
            </div>

            {/* Notification & Alert Toggles */}
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Notification Channels
              </h4>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <span className="text-sm text-slate-800 font-medium">Official Email Alert Summaries</span>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={e => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <span className="text-sm text-slate-800 font-medium">SMS Urgent Gateway Dispatch</span>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={e => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <span className="text-sm text-slate-800 font-medium">Desktop Push Notifications</span>
                  <input
                    type="checkbox"
                    checked={desktopNotifs}
                    onChange={e => setDesktopNotifs(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveTheme}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm flex items-center gap-2 text-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: ORGANIZATION SETTINGS --- */}
      {activeTab === 'organization' && orgForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Institutional Organization Profile</span>
            </h3>
            <p className="text-xs text-slate-500">
              Configure institution branding, registration details, academic year defaults, contact channels, and currency formats.
            </p>
          </div>

          <form onSubmit={handleSaveOrgSettings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Institution Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={orgForm.institutionName}
                  onChange={e => setOrgForm({ ...orgForm, institutionName: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Official Tagline / Motto
                </label>
                <input
                  type="text"
                  value={orgForm.tagline}
                  onChange={e => setOrgForm({ ...orgForm, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Affiliation / University Board
                </label>
                <input
                  type="text"
                  value={orgForm.affiliationBody}
                  onChange={e => setOrgForm({ ...orgForm, affiliationBody: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Accreditation Grade
                </label>
                <input
                  type="text"
                  value={orgForm.accreditationGrade}
                  onChange={e => setOrgForm({ ...orgForm, accreditationGrade: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Contact Email Address
                </label>
                <input
                  type="email"
                  value={orgForm.contactEmail}
                  onChange={e => setOrgForm({ ...orgForm, contactEmail: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={orgForm.contactPhone}
                  onChange={e => setOrgForm({ ...orgForm, contactPhone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Academic Year Format
                </label>
                <input
                  type="text"
                  value={orgForm.academicYearFormat}
                  onChange={e => setOrgForm({ ...orgForm, academicYearFormat: e.target.value })}
                  placeholder="e.g., 2026-2027"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Default Currency Symbol
                </label>
                <input
                  type="text"
                  value={orgForm.currencySymbol}
                  onChange={e => setOrgForm({ ...orgForm, currencySymbol: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Campus Address
              </label>
              <textarea
                value={orgForm.address}
                onChange={e => setOrgForm({ ...orgForm, address: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm flex items-center gap-2 text-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Organization Details</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- TAB 5: USER MANAGEMENT --- */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User List Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3 w-full md:w-auto flex-1">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search user name, email, ID..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="ALL">All Roles</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Admission Officer">Admission Officer</option>
              </select>

              <select
                value={userStatusFilter}
                onChange={e => setUserStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="ALL">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <button
                onClick={handleFilterUsers}
                className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 hover:bg-slate-200 cursor-pointer font-medium"
              >
                Filter
              </button>
            </div>

            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm flex items-center gap-2 text-sm shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add System User</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No system users found matching filters.
                      </td>
                    </tr>
                  ) : (
                    usersList.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={
                              u.avatarUrl ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                            }
                            alt={u.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-semibold text-slate-900">{u.fullName}</p>
                            <p className="text-xs text-slate-500 font-mono">
                              {u.employeeId || u.studentId || u.id}
                            </p>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-xs text-slate-600">{u.email}</td>

                        <td className="py-3 px-4">
                          <select
                            value={u.role}
                            onChange={e => handleChangeUserRole(u.id, e.target.value)}
                            className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-blue-700 font-semibold focus:outline-none cursor-pointer"
                          >
                            <option value="Super Admin">Super Admin</option>
                            <option value="Admin">Admin</option>
                            <option value="Admission Officer">Admission Officer</option>
                          </select>
                        </td>

                        <td className="py-3 px-4 text-xs text-slate-600">{u.department || 'N/A'}</td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.status)}
                            className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border transition-all cursor-pointer ${
                              u.status === 'Active'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-rose-50 border-rose-200 text-rose-800'
                            }`}
                          >
                            {u.status}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setResetModalUser(u);
                              setGeneratedPassResult(null);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1.5 ml-auto cursor-pointer"
                            title="Reset Password"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Reset Pass</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add User Modal */}
          {isAddUserOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 shadow-xl relative">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Create New System User Account</span>
                  </h3>
                  <button
                    onClick={() => setIsAddUserOpen(false)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateUserSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newUserForm.fullName}
                      onChange={e => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                      placeholder="e.g., Dr. Ananya Sharma"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={newUserForm.email}
                      onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      placeholder="user@scholarcore.edu.in"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        System Role *
                      </label>
                      <select
                        value={newUserForm.role}
                        onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="Super Admin">Super Admin</option>
                        <option value="Admin">Admin</option>
                        <option value="Admission Officer">Admission Officer</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        value={newUserForm.employeeId}
                        onChange={e => setNewUserForm({ ...newUserForm, employeeId: e.target.value })}
                        placeholder="EMP-202"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={newUserForm.department}
                      onChange={e => setNewUserForm({ ...newUserForm, department: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Initial Password (Optional)
                    </label>
                    <input
                      type="password"
                      value={newUserForm.password}
                      onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      placeholder="Default: ScholarCore2026!"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddUserOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                    >
                      Create Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Admin Reset Password Modal */}
          {resetModalUser && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 shadow-xl relative">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span>Reset User Password</span>
                  </h3>
                  <button
                    onClick={() => {
                      setResetModalUser(null);
                      setGeneratedPassResult(null);
                    }}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-slate-600">
                  Reset login credentials for <strong className="text-blue-700">{resetModalUser.fullName}</strong> ({resetModalUser.email}).
                </p>

                {generatedPassResult ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-center">
                    <p className="text-xs text-emerald-800 font-semibold">
                      Password Reset Complete!
                    </p>
                    <p className="text-xs text-slate-600">Temporary Password Generated:</p>
                    <div className="p-2 bg-slate-100 rounded-lg text-blue-700 font-mono font-bold text-lg select-all border border-blue-200">
                      {generatedPassResult}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Provide this temporary password securely to the user.
                    </p>
                  </div>
                ) : (
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setResetModalUser(null)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAdminResetPassword}
                      disabled={loading}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                    >
                      Confirm Reset
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 6: ROLE PERMISSIONS MATRIX --- */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span>Role-Based Access Control (RBAC) Matrix</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Define modular permissions across View, Create, Edit, Delete, and Export capabilities per system role.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600 font-medium">Select Role:</label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-blue-700 font-bold focus:outline-none cursor-pointer"
                >
                  {rolePermissions.map(r => (
                    <option key={r.role} value={r.role}>
                      {r.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Role Description Banner */}
            {rolePermissions.find(r => r.role === selectedRole) && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex justify-between items-center gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-blue-900">{selectedRole} Role</h4>
                  <p className="text-xs text-slate-600">
                    {rolePermissions.find(r => r.role === selectedRole)?.description}
                  </p>
                </div>
                <button
                  onClick={() => handleSaveRolePermissions(selectedRole)}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Role Matrix</span>
                </button>
              </div>
            )}

            {/* Matrix Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">System Module</th>
                    <th className="py-3.5 px-4 text-center">View</th>
                    <th className="py-3.5 px-4 text-center">Create</th>
                    <th className="py-3.5 px-4 text-center">Edit</th>
                    <th className="py-3.5 px-4 text-center">Delete</th>
                    <th className="py-3.5 px-4 text-center">Export</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {rolePermissions
                    .find(r => r.role === selectedRole)
                    ?.permissions.map(p => (
                      <tr key={p.module} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>{p.module} Module</span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={p.view}
                            onChange={() => handleTogglePermission(selectedRole, p.module, 'view')}
                            className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                          />
                        </td>

                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={p.create}
                            onChange={() => handleTogglePermission(selectedRole, p.module, 'create')}
                            className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                          />
                        </td>

                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={p.edit}
                            onChange={() => handleTogglePermission(selectedRole, p.module, 'edit')}
                            className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                          />
                        </td>

                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={p.delete}
                            onChange={() => handleTogglePermission(selectedRole, p.module, 'delete')}
                            className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                          />
                        </td>

                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={p.export}
                            onChange={() => handleTogglePermission(selectedRole, p.module, 'export')}
                            className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
