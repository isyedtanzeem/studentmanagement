import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, CheckCircle2, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
  onNavigateToResetPassword: (token: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onBackToLogin,
  onNavigateToResetPassword
}) => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('superadmin@scholarcore.edu.in');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ message: string; resetToken?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setSuccessResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch password reset email.');
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
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Password Recovery Service</p>
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

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="max-w-md w-full bg-white border border-slate-200/90 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
          <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-600 mb-2">
            <KeyRound className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recover Password</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your registered institutional email address. We will issue an encrypted reset link.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successResult ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Reset Request Issued</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{successResult.message}</p>
              </div>

              {successResult.resetToken && (
                <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl text-xs space-y-2">
                  <p className="text-blue-700 font-bold text-[11px] uppercase tracking-wider font-mono">
                    Dev Test Helper Token
                  </p>
                  <p className="font-mono text-[10px] text-slate-700 break-all bg-white p-2.5 rounded-lg border border-slate-200 select-all">
                    {successResult.resetToken}
                  </p>
                  <button
                    onClick={() => onNavigateToResetPassword(successResult.resetToken!)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>Proceed to Reset Password Form</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Institutional Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@scholarcore.edu.in"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs tracking-wide transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <span>Send Password Reset Link</span>
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="h-10 border-t border-slate-200 px-6 sm:px-8 bg-white flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div>ScholarCore SIMS Auth Module • Password Service</div>
        <div>256-Bit TLS Security</div>
      </footer>
    </div>
  );
};
