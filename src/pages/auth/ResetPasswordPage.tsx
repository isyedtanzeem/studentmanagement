import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';

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
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Set New Account Password</p>
          </div>
        </div>

        <button
          onClick={onBackToLogin}
          className="text-xs text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2 font-medium bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
          <span>Back to Sign In</span>
        </button>
      </header>

      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="max-w-md w-full bg-white border border-slate-200/90 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
          <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-600 mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Set New Password</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter the reset token and specify a strong new account password.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Password Reset Completed!</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Your password has been securely updated. You can now log into the portal using your new credentials.
                </p>
              </div>

              <button
                onClick={onBackToLogin}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Back to Sign In Page</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reset Security Token</label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste security reset token..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs tracking-wide transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
              >
                <span>Save New Password</span>
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="h-10 border-t border-slate-200 px-6 sm:px-8 bg-white flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div>ScholarCore SIMS Auth Module • Password Reset</div>
        <div>256-Bit Encrypted Token Verification</div>
      </footer>
    </div>
  );
};
