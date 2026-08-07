import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  GraduationCap,
  KeyRound
} from 'lucide-react';

interface LoginPageProps {
  onNavigateToForgotPassword: () => void;
  onNavigateToApplicantPortal?: () => void;
}

const DEMO_PRESETS: {
  role: UserRole;
  email: string;
  name: string;
  dept: string;
}[] = [
  {
    role: 'Super Admin',
    email: 'superadmin@scholarcore.edu.in',
    name: 'Dr. Rajeshwar Sharma',
    dept: 'Vice Chancellor Office'
  },
  {
    role: 'Admin',
    email: 'admin@scholarcore.edu.in',
    name: 'Sunita Deshmukh',
    dept: 'Academic Registrar'
  },
  {
    role: 'Admission Officer',
    email: 'admission@scholarcore.edu.in',
    name: 'Amit Vikram Singh',
    dept: 'Central Admissions Cell'
  }
];

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToForgotPassword,
  onNavigateToApplicantPortal
}) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('superadmin@scholarcore.edu.in');
  const [password, setPassword] = useState('Password123!');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<UserRole>('Super Admin');

  const handlePresetSelect = (preset: (typeof DEMO_PRESETS)[0]) => {
    setEmail(preset.email);
    setPassword('Password123!');
    setSelectedPreset(preset.role);
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password, rememberMe });
    } catch {
      // Error handled in AuthContext state
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-blue-600/20 selection:text-blue-900">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between bg-white/95 backdrop-blur-md shadow-xs sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm shadow-blue-500/20">
            <span className="serif-font">S</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>ScholarCore</span>
              <span className="text-blue-600 font-semibold text-xs bg-blue-50 border border-blue-200/80 px-1.5 py-0.5 rounded font-mono">ERP</span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Enterprise Auth System v1.0</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateToApplicantPortal && (
            <button
              onClick={onNavigateToApplicantPortal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Student Applicant Portal (2026-27)</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 font-medium bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-700 text-[11px] font-semibold">Authentication Active</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Quick Role Presets & Architecture Info */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 text-blue-600 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Demo Role Quick Switcher</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
                Back-Office Administrative Roles
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Select an authorized staff credential below to access university operations, student management, and admissions.
              </p>

              <div className="space-y-2">
                {DEMO_PRESETS.map((preset) => (
                  <button
                    key={preset.role}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      selectedPreset === preset.role
                        ? 'bg-blue-50/80 border-blue-500 text-blue-900 shadow-sm shadow-blue-500/10'
                        : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100/80 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold flex items-center gap-1.5">
                        <span className={selectedPreset === preset.role ? 'text-blue-700 font-bold' : 'text-slate-800'}>
                          {preset.role}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{preset.name} • {preset.dept}</p>
                    </div>
                    <ArrowRight className={`w-4 h-4 shrink-0 ${selectedPreset === preset.role ? 'text-blue-600' : 'text-slate-400'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-mono font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-blue-600" /> Default Demo Password
                </span>
                <span className="text-[10px] text-slate-400">Bcrypt Salted</span>
              </div>
              <p className="font-mono text-slate-900 font-bold text-xs bg-white px-2.5 py-1 rounded border border-slate-200">
                Password123!
              </p>
            </div>
          </div>

          {/* Right Column: Login Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Account Authentication</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your credentials to access the Student Information System.
                </p>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-700 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) clearError();
                      }}
                      placeholder="user@scholarcore.edu.in"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={onNavigateToForgotPassword}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) clearError();
                      }}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 w-4 h-4"
                    />
                    <span className="text-xs font-medium">Keep me logged in for 7 days</span>
                  </label>
                  <span className="text-slate-400 text-[10px] font-mono">JWT + HttpOnly Cookie</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl text-xs tracking-wide transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>Sign In to Portal</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6 flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                ScholarCore Enterprise Instance
              </span>
              <span>256-bit AES Encryption</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-10 border-t border-slate-200 px-6 sm:px-8 bg-white flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div>ScholarCore SIMS Auth Module • JWT + Bcrypt Engine</div>
        <div className="hidden sm:block">Session Timeout: 15m (AccessToken) / 7d (RefreshToken)</div>
      </footer>
    </div>
  );
};
