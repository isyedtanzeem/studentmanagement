import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, KeyRound } from 'lucide-react';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
  onNavigateToResetPassword: (token: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onBackToLogin,
  onNavigateToResetPassword
}) => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('superadmin@scholarcore.edu');
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
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Password Recovery Service</p>
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

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 my-auto">
        <div className="max-w-md w-full bg-card-dark border-glass p-8 rounded-xl shadow-2xl space-y-6">
          <div className="w-12 h-12 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl flex items-center justify-center text-[#D4AF37] mb-2">
            <KeyRound className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-2xl font-light text-white serif-font tracking-tight">Recover Password</h2>
            <p className="text-xs text-gray-400 mt-1">
              Enter your registered institutional email address. We will issue an encrypted reset link.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successResult ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Reset Request Issued</span>
                </div>
                <p className="text-gray-300 leading-relaxed">{successResult.message}</p>
              </div>

              {successResult.resetToken && (
                <div className="p-4 bg-black/60 border border-[#D4AF37]/30 rounded-lg text-xs space-y-2">
                  <p className="text-[#D4AF37] font-semibold text-[11px] uppercase tracking-wider">
                    Dev Test Helper Token
                  </p>
                  <p className="font-mono text-[10px] text-gray-400 break-all bg-black/80 p-2 rounded border border-white/5">
                    {successResult.resetToken}
                  </p>
                  <button
                    onClick={() => onNavigateToResetPassword(successResult.resetToken!)}
                    className="w-full py-2 bg-[#D4AF37] hover:bg-[#c2a032] text-black font-semibold rounded text-xs transition-all mt-1"
                  >
                    Proceed to Reset Form with Token
                  </button>
                </div>
              )}

              <button
                onClick={onBackToLogin}
                className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-medium transition-all"
              >
                Return to Login Screen
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Registered Institutional Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@scholarcore.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-all"
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
                    <span>Processing Reset Link...</span>
                  </>
                ) : (
                  <span>Send Reset Request</span>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="h-10 border-t border-white/10 px-8 bg-black flex items-center justify-center text-[10px] text-gray-500">
        ScholarCore Password Service • Encrypted Token Validity: 60 Minutes
      </footer>
    </div>
  );
};
