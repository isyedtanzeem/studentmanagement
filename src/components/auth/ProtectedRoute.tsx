import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { ShieldAlert, Lock, RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallbackLogin?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallbackLogin
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-gray-200">
        <div className="flex flex-col items-center gap-4 p-8 bg-card-dark border-glass rounded-xl shadow-2xl">
          <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin" />
          <p className="text-xs text-gray-400 font-mono tracking-wide">
            Verifying JWT Token & Authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return fallbackLogin ? <>{fallbackLogin}</> : null;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-gray-200">
        <div className="max-w-md w-full bg-card-dark border-glass p-8 rounded-xl space-y-6 text-center shadow-2xl">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-light text-white serif-font">Access Denied (RBAC Restricted)</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your account role <span className="text-[#D4AF37] font-semibold">'{user.role}'</span> is not granted permissions to access this view module.
            </p>
          </div>

          <div className="p-4 bg-black/50 border border-white/5 rounded-lg text-left text-xs font-mono space-y-1">
            <p className="text-gray-500 text-[10px] uppercase tracking-wider font-sans">Required Role Permission</p>
            <p className="text-emerald-400 font-semibold">{allowedRoles.join(' OR ')}</p>
            <p className="text-gray-400 text-[11px] pt-1">User ID: {user.id}</p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-[#D4AF37]" />
            <span>Switch Role or Re-authenticate</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
