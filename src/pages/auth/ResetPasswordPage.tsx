import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface ResetPasswordPageProps {
  initialToken?: string;
  onBackToLogin: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  initialToken = '',
  onBackToLogin
}) => {
  const { resetPassword } = useAuth();
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
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
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Set New Account Password</p>
          </div>
        </div>

        <button
          onClick={onBackToLogin}
          className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Back to Sign In</span>
        </button>
      </header>

      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center p-6 my-auto">
        <div className="max-w-md w-full bg-card-dark border-glass p-8 rounded-xl shadow-2xl space-y-6">
          <div className="w-12 h-12 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl flex items-center justify-center text-[#D4AF37] mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-2xl font-light text-white serif-font tracking-tight">Set New Password</h2>
            <p className="text-xs text-gray-400 mt-1">
              Enter the reset token and specify a strong new account password.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Password Reset Completed!</span>
                </div>
                <p className="text-gray-300 leading-relaxed pt-1">
                  Your password has been successfully updated in the database. You can now log in using your new credentials.
                </p>
              </div>

              <button
                onClick={onBackToLogin}
                className="w-full py-3 bg-[#D4AF37] hover:bg-[#c2a032] text-black font-semibold rounded-lg text-xs transition-all"
              >
                Return to Login Page
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Reset Token</label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste 64-char reset token"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">New Password (min 8 chars)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-all"
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

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#D4AF37] hover:bg-[#c2a032] text-black font-semibold rounded-lg text-xs tracking-wide transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Security Credentials...</span>
                  </>
                ) : (
                  <span>Update Account Password</span>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="h-10 border-t border-white/10 px-8 bg-black flex items-center justify-center text-[10px] text-gray-500">
        ScholarCore Security Engine • Bcrypt Hash Cost Factor: 10
      </footer>
    </div>
  );
};
