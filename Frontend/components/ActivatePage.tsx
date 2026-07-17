import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Code, Mail, Lock, User as UserIcon, Eye, EyeOff, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

interface ActivatePageProps {
  email: string;
  token: string;
  onSuccess?: () => void;
  onGoToHome?: () => void;
}

export const ActivatePage: React.FC<ActivatePageProps> = ({ email, token, onSuccess, onGoToHome }) => {
  const { activateClient, error, clearError, loading } = useAuth();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!name.trim()) {
      setValidationError('Please enter your full name to complete activation.');
      return;
    }

    if (!password.trim()) {
      setValidationError('Please set a password for your new account.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    const success = await activateClient(name.trim(), email, token, password);
    if (success) {
      setIsSuccess(true);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    }
  };

  return (
    <div id="activate-container" className="min-h-screen bg-slate-50 flex items-stretch font-sans">
      {/* Left Column: SaaS Billboard Info */}
      <div id="activate-billboard" className="hidden lg:flex lg:w-1/2 bg-slate-950 text-white flex-col justify-between p-16 relative overflow-hidden border-r border-slate-900">
        <img
          src="/Frontend/assets/images/devflw_collaboration_1784109748196.jpg"
          alt="DevFlw Collaboration"
          className="absolute inset-0 w-full h-full object-cover opacity-40 select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/45 pointer-events-none" />
        
        {/* Logo */}
        <div className="flex items-center gap-2 z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Code className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">DevFlw</span>
          <span className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700/50 backdrop-blur-sm">Client Portal</span>
        </div>

        <div className="max-w-md my-auto z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-indigo-300 text-xs font-medium backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Activate Account
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-100">
              Your developers invited you to collaborate.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Activate your client account today to view tasks, milestones, chat directly, and submit contextual live feedback on current development builds.
            </p>
          </div>

          <div className="space-y-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/50 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <CheckCircle className="w-3 h-3" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Interactive Task Checklists</h4>
                <p className="text-xs text-slate-400 mt-0.5">Approve, verify, or request adjustments on tasks and logs inside the workspace.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <CheckCircle className="w-3 h-3" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Visual Overlay Review Mode</h4>
                <p className="text-xs text-slate-400 mt-0.5">Provide real-time pinpointed feedback screenshots directly on live demos.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 z-10">
          <span>© 2026 DevFlw SaaS Inc.</span>
        </div>
      </div>

      {/* Right Column: Activation Form Panel */}
      <div id="activate-panel" className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-12 relative bg-white">
        {onGoToHome && (
          <button
            type="button"
            onClick={onGoToHome}
            className="absolute top-8 right-8 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:bg-slate-100 py-1.5 px-3 rounded-lg transition-all cursor-pointer"
          >
            ← Back to Home
          </button>
        )}

        <div className="max-w-md w-full mx-auto space-y-8">
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Account Activated!</h2>
              <p className="text-sm text-slate-500">
                Your client profile has been fully activated. We are setting up your workspace dashboard. Please wait...
              </p>
              <div className="w-6 h-6 border-2 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto mt-6" />
            </motion.div>
          ) : (
            <>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Activate Workspace</h2>
                <p className="text-sm text-slate-500 mt-2">
                  Complete your details below to activate collaboration with your development team.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Address (Disabled/Read-only) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                </div>

                {/* Client Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Set Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Set Account Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Alert feedback */}
                {(validationError || error) && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>{validationError || error}</span>
                  </motion.div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-950 hover:bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-950/50 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-slate-950/10"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Activate & Join Workspace'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
