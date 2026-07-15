import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, Mail, Lock, User as UserIcon, Code, Users, ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
  onBackToLanding?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login', onBackToLanding }) => {
  const { login, registerDeveloper, registerClient, registerAdmin, error, clearError, loading } = useAuth();

  // Mode: 'login' or 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  // Role: 'developer' or 'client'
  const [role, setRole] = useState<'developer' | 'client'>('developer');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!email.trim() || !password.trim()) {
      setValidationError('Please fill in all fields.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    let success = false;
    if (mode === 'login') {
      success = await login(email.trim(), password);
    } else {
      if (role === 'developer') {
        success = await registerDeveloper(name.trim(), email.trim(), password);
      } else {
        success = await registerClient(name.trim(), email.trim(), password);
      }
    }

    if (success) {
      console.log('Authentication successful');
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setValidationError(null);
    clearError();
  };

  const handleRoleChange = (selectedRole: 'developer' | 'client') => {
    setRole(selectedRole);
    setValidationError(null);
    clearError();
  };

  return (
    <div id="auth-container" className="min-h-screen bg-slate-50 flex items-stretch font-sans">
      {/* Left Column: Premium SaaS Billboard (Hidden on mobile) */}
      <div id="auth-billboard" className="hidden lg:flex lg:w-1/2 bg-slate-950 text-white flex-col justify-between p-16 relative overflow-hidden border-r border-slate-900">
        {/* Beautiful high-end background image generated for DevFlw */}
        <img
          src="/Frontend/assets/images/devflw_collaboration_1784109748196.jpg"
          alt="DevFlw Collaboration Hub"
          className="absolute inset-0 w-full h-full object-cover opacity-40 select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />
        {/* Elegant overlay gradients for rich legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/45 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/30 to-transparent pointer-events-none" />

        {/* Logo/Header */}
        <div className="flex items-center gap-2 z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Code className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-sans">DevFlw</span>
          <span className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700/50 backdrop-blur-sm">MVP</span>
        </div>

        {/* Feature Carousel Illustration */}
        <div className="max-w-md my-auto z-10 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-indigo-300 text-xs font-medium backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Unified Development Sync
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              A single workspace for developer and client.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ditch fragmented chat apps, lost attachments, and chaotic feedback loops. DevFlw brings project overview, tasks, and live demos together.
            </p>
          </motion.div>

          {/* Quick core feature value list with beautiful backdrop card layout */}
          <div className="space-y-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/50 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <CheckCircle className="w-3 h-3" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Review-Mode Live Feedback</h4>
                <p className="text-xs text-slate-400 mt-0.5">Clients click on live demos to report contextual feedback directly into tasks.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <CheckCircle className="w-3 h-3" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Developer Dashboard Control</h4>
                <p className="text-xs text-slate-400 mt-0.5">Manage tasks, milestones, and client accounts in a clean, professional timeline.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-500 z-10 flex justify-between">
          <span>© 2026 DevFlw SaaS Inc.</span>
          <span>Security & Performance First</span>
        </div>
      </div>

      {/* Right Column: Authentication Form Panel */}
      <div id="auth-panel" className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-12 relative bg-white">
        {onBackToLanding && (
          <button
            type="button"
            onClick={onBackToLanding}
            className="absolute top-8 right-8 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:bg-slate-100 py-1.5 px-3 rounded-lg transition-all cursor-pointer"
          >
            ← Back to Home
          </button>
        )}

        <div className="max-w-md w-full mx-auto space-y-8">
          {/* Header & Title (Centered Logo above Form) */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/15">
                <Code className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 block">DevFlw Workspace</span>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                {mode === 'login' ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {mode === 'login' 
                  ? 'Access your software collaborative projects' 
                  : 'Get started with a dedicated workspace for developers and clients'}
              </p>
            </div>
          </div>

          {/* Role selection tab (Only during sign up to specify standard workspace creation or joining as client) */}
          {mode === 'signup' && (
            <div className="p-1 bg-slate-100 rounded-lg flex gap-1">
              <button
                type="button"
                id="role-dev-btn"
                onClick={() => handleRoleChange('developer')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 text-xs font-semibold rounded-md transition-all ${
                  role === 'developer'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Developer
              </button>
              <button
                type="button"
                id="role-client-btn"
                onClick={() => handleRoleChange('client')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 text-xs font-semibold rounded-md transition-all ${
                  role === 'client'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Client
              </button>
            </div>
          )}

          {/* Form validation and backend errors */}
          <AnimatePresence mode="wait">
            {(error || validationError) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-2.5 text-xs text-rose-600 font-medium"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>{validationError || error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Standard Login & Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700" htmlFor="name">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700" htmlFor="password">Password</label>
                {mode === 'login' && (
                  <a href="#" className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline">Forgot password?</a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                />
                <button
                  type="button"
                  id="toggle-password-visibility-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-1 rounded-md hover:bg-slate-100 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="auth-submit-btn"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer select-none transition-all mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign in' : `Join as ${role === 'developer' ? 'Developer' : 'Client'}`}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switch Toggle */}
          <div className="text-center text-sm text-slate-500 mt-6 pt-2">
            <span>{mode === 'login' ? "Don't have an account? " : "Already have an account? "}</span>
            <button
              type="button"
              id="toggle-mode-btn"
              onClick={toggleMode}
              className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
