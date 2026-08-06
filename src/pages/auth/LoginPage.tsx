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
  GraduationCap
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
  },
  {
    role: 'Faculty',
    email: 'faculty@scholarcore.edu.in',
    name: 'Prof. Ramesh Kulkarni',
    dept: 'Computer Science & Engineering'
  },
  {
    role: 'Student',
    email: 'student@scholarcore.edu.in',
    name: 'Aarav Sharma',
    dept: 'B.Tech CSE (NEP 2020)'
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
    <div className="min-h-screen bg-[#050505] text-gray-200 flex flex-col justify-between selection:bg-[#D4AF37]/30 selection:text-[#D4AF37]">
      {/* Top Header */}
      <header className="h-16 border-b border-white/10 px-8 flex items-center justify-between bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg flex items-center justify-center">
            <span className="text-[#D4AF37] font-bold text-lg serif-font">S</span>
          </div>
          <div>
            <h1 className="text-base font-semibold serif-font text-white">
              ScholarCore <span className="text-[#D4AF37] italic font-light">ERP</span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Enterprise Auth v1.0</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {onNavigateToApplicantPortal && (
            <button
              onClick={onNavigateToApplicantPortal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-600 border border-blue-500/50 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-blue-200" />
              <span>Student Applicant Portal (2026-27)</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            <span>Authentication Active</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 my-auto">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Quick Role Presets & Architecture Info */}
          <div className="lg:col-span-5 bg-card-dark border-glass p-6 rounded-xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-mono uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Demo Role Quick Switcher</span>
              </div>
              <h2 className="text-xl font-light text-white serif-font mb-2">
                Simulate Commercial RBAC Roles
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Select a pre-configured role below to populate authorized credentials and experience role-based permission routing.
              </p>

              <div className="space-y-2">
                {DEMO_PRESETS.map((preset) => (
                  <button
                    key={preset.role}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                      selectedPreset === preset.role
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                        : 'bg-black/40 border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold flex items-center gap-1.5">
                        <span className={selectedPreset === preset.role ? 'text-[#D4AF37]' : 'text-gray-400'}>
                          {preset.role}
                        </span>
                      </p>
                      <p className="text-[10px] text-gray-500">{preset.name} ({preset.dept})</p>
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 ${selectedPreset === preset.role ? 'text-[#D4AF37]' : 'text-gray-600'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-black/50 border border-white/5 rounded-lg text-[11px] text-gray-400 space-y-1">
              <p className="text-[#D4AF37] font-mono font-semibold text-[10px] uppercase">Default Demo Password</p>
              <p className="font-mono text-white">Password123!</p>
              <p className="text-[10px] text-gray-500 pt-1">Bcrypt salted & hashed in backend engine.</p>
            </div>
          </div>

          {/* Right Column: Login Form */}
          <div className="lg:col-span-7 bg-card-dark border-glass p-8 rounded-xl flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-light text-white serif-font tracking-tight">Account Authentication</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Enter your credentials to access the Student Information System.
                </p>
              </div>

              {error && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) clearError();
                      }}
                      placeholder="user@scholarcore.edu"
                      className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-medium text-gray-300">Password</label>
                    <button
                      type="button"
                      onClick={onNavigateToForgotPassword}
                      className="text-[11px] text-[#D4AF37] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) clearError();
                      }}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-black border-white/20 text-[#D4AF37] focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Keep me logged in for 7 days</span>
                  </label>
                  <span className="text-gray-500 text-[10px]">JWT + HttpOnly Cookie</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#D4AF37] hover:bg-[#c2a032] text-black font-semibold rounded-lg text-xs tracking-wide transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-black" />
                      <span>Sign In to Portal</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="pt-6 border-t border-white/10 mt-6 flex justify-between items-center text-[10px] text-gray-500">
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-gray-600" />
                ScholarCore Enterprise Instance
              </span>
              <span>256-bit AES Encryption</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-10 border-t border-white/10 px-8 bg-black flex items-center justify-between text-[10px] text-gray-500">
        <div>ScholarCore SIMS Auth Module • JWT + Bcrypt Engine</div>
        <div>Session Timeout: 15m (AccessToken) / 7d (RefreshToken)</div>
      </footer>
    </div>
  );
};
