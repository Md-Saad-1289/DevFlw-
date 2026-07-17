import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types';
import { 
  User, Mail, Lock, Shield, Folder, Activity, CheckCircle2, 
  Calendar, Sparkles, Key, Save, AlertCircle, CheckCircle,
  Pencil, Plus, Tag, FileText, X
} from 'lucide-react';
import { motion } from 'motion/react';

// Configure axial base client with authorization header
const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('devflw_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface ProfilePageProps {
  projects: Project[];
  onBackToWorkspaces?: () => void;
  availablePlans?: any[];
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ projects, onBackToWorkspaces, availablePlans = [] }) => {
  const { user, updateProfile, updatePlan } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Plans state synchronization & editing fields
  const [localPlans, setLocalPlans] = useState<any[]>(availablePlans);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);

  const [planForm, setPlanForm] = useState({
    id: '',
    name: '',
    key: '',
    price: '',
    beforePrice: '',
    maxProjects: 2,
    featuresText: '',
    discount: '',
    note: '',
    isActive: true
  });
  
  const [planActionLoading, setPlanActionLoading] = useState(false);
  const [planActionError, setPlanActionError] = useState<string | null>(null);

  React.useEffect(() => {
    setLocalPlans(availablePlans);
  }, [availablePlans]);

  const handleEditPlanClick = (plan: any) => {
    setPlanForm({
      id: plan._id || plan.id,
      name: plan.name,
      key: plan.key,
      price: plan.price ? plan.price.replace('$', '').replace('/month', '').trim() : '',
      beforePrice: plan.beforePrice ? plan.beforePrice.replace('$', '').replace('/month', '').trim() : '',
      maxProjects: plan.maxProjects || 2,
      featuresText: (plan.features || []).join(', '),
      discount: plan.discount || '',
      note: plan.note || '',
      isActive: plan.isActive !== undefined ? plan.isActive : true
    });
    setEditingPlan(plan);
    setShowEditPlanModal(true);
    setPlanActionError(null);
  };

  const handleCreatePlanClick = () => {
    setPlanForm({
      id: '',
      name: '',
      key: '',
      price: '',
      beforePrice: '',
      maxProjects: 5,
      featuresText: 'Up to 5 projects, Premium access',
      discount: '',
      note: '',
      isActive: true
    });
    setEditingPlan(null);
    setShowCreatePlanModal(true);
    setPlanActionError(null);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanActionError(null);
    setPlanActionLoading(true);

    const priceFormatted = planForm.price.startsWith('$') ? planForm.price : `$${planForm.price}/month`;
    const beforePriceFormatted = planForm.beforePrice 
      ? (planForm.beforePrice.startsWith('$') ? planForm.beforePrice : `$${planForm.beforePrice}/month`)
      : '';

    const payload = {
      name: planForm.name,
      price: priceFormatted,
      beforePrice: beforePriceFormatted,
      maxProjects: Number(planForm.maxProjects) || 2,
      features: planForm.featuresText.split(',').map(f => f.trim()).filter(Boolean),
      discount: planForm.discount,
      note: planForm.note,
      isActive: planForm.isActive
    };

    try {
      if (editingPlan) {
        const planId = planForm.id;
        await api.put(`/api/auth/plans/${planId}`, payload);
        setLocalPlans(prev => prev.map(p => (p._id || p.id) === planId ? { ...p, ...payload } : p));
        setShowEditPlanModal(false);
        setEditingPlan(null);
        setMsg({ type: 'success', text: 'Plan updated successfully! It may take a brief moment to sync completely across workspaces.' });
      } else {
        const res = await api.post('/api/auth/plans', {
          ...payload,
          key: planForm.key.toLowerCase().trim()
        });
        setLocalPlans(prev => [...prev, res.data.plan]);
        setShowCreatePlanModal(false);
        setMsg({ type: 'success', text: 'New plan established successfully!' });
      }
    } catch (err: any) {
      console.error(err);
      setPlanActionError(err.response?.data?.error || 'Failed to save subscription plan.');
    } finally {
      setPlanActionLoading(false);
    }
  };

  // Calculate dynamic stats
  const activeProjectsCount = projects.length;
  
  let totalTasksCount = 0;
  let completedTasksCount = 0;
  let feedbacksCount = 0;

  projects.forEach(p => {
    if (p.tasks) {
      totalTasksCount += p.tasks.length;
      completedTasksCount += p.tasks.filter(t => t.status === 'completed' || t.status === 'done').length;
    }
    if (p.feedbacks) {
      feedbacksCount += p.feedbacks.length;
    }
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (password && password !== confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateProfile(name, password || undefined);
      if (result.success) {
        setMsg({ type: 'success', text: result.message || 'Profile updated successfully!' });
        setPassword('');
        setConfirmPassword('');
      } else {
        setMsg({ type: 'error', text: result.error || 'Failed to update profile.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Recently';

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto px-1 sm:px-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Your Profile & Account</h2>
          <p className="text-xs text-slate-500 mt-1">Manage personal parameters, workspace authentication, and billing credentials.</p>
        </div>
        {onBackToWorkspaces && (
          <button
            onClick={onBackToWorkspaces}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
          >
            ← Back to Workspaces
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Profile overview card & statistics bento */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile overview card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 text-center space-y-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="pt-4 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/20 relative">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DF'}
                <div className="absolute bottom-0 right-0 bg-emerald-500 border-2 border-white w-4.5 h-4.5 rounded-full" title="Active session" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email}
              </p>
              <div className="pt-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                  user?.role === 'developer' 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                    : user?.role === 'admin'
                    ? 'bg-rose-50 text-rose-700 border-rose-100'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}>
                  <Shield className="w-3 h-3" />
                  {user?.role}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-left text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined On
              </span>
              <span className="font-semibold text-slate-700">{formattedDate}</span>
            </div>
          </div>

          {/* Quick stats bento box */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-5 shadow-md border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-400" />
              Collaboration Pulse
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/55 p-3.5 rounded-xl border border-slate-800 text-left">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Workspaces</span>
                <span className="text-xl font-extrabold text-white mt-1 block">{activeProjectsCount}</span>
              </div>

              <div className="bg-slate-800/55 p-3.5 rounded-xl border border-slate-800 text-left">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Feedbacks</span>
                <span className="text-xl font-extrabold text-indigo-400 mt-1 block">{feedbacksCount}</span>
              </div>

              <div className="bg-slate-800/55 p-3.5 rounded-xl border border-slate-800 text-left">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Total Tasks</span>
                <span className="text-xl font-extrabold text-white mt-1 block">{totalTasksCount}</span>
              </div>

              <div className="bg-slate-800/55 p-3.5 rounded-xl border border-slate-800 text-left">
                <span className="text-[10px] font-bold text-emerald-400 block uppercase tracking-wider">Done Tasks</span>
                <span className="text-xl font-extrabold text-emerald-400 mt-1 block">{completedTasksCount}</span>
              </div>
            </div>

            {(user?.role === 'developer' || user?.role === 'admin') && (
              <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/20 p-4 rounded-xl border border-indigo-500/20 flex items-center justify-between gap-3 text-left">
                <div>
                  <span className="text-[9px] font-extrabold text-indigo-300 uppercase tracking-widest block">Active Plan Tier</span>
                  <span className="text-xs font-bold text-slate-100 mt-0.5 block capitalize">{user?.plan || 'free'} Account</span>
                </div>
                <div className="flex gap-1.5">
                  {user?.plan !== 'pro' && (
                    <button
                      onClick={() => updatePlan('pro')}
                      className="py-1 px-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-[9px] font-extrabold text-white transition-all shadow-sm cursor-pointer"
                    >
                      ★ Go Pro
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Edit details form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-indigo-600" />
                Change Personal Parameters
              </h3>
              <p className="text-xs text-slate-500 mt-1">Configure your login credentials and name displays inside project collaboration logs.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-400 font-medium select-none">
                    <Mail className="w-4 h-4 text-slate-300 shrink-0" />
                    <span>{user?.email}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">Email address cannot be modified as it's the primary system login.</span>
                </div>

                <div className="space-y-1 text-left">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">This name is visible to invited clients and team leads.</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Change Login Password</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
                <span className="text-[9px] text-slate-400 block mt-1.5">Leave blank if you do not want to alter your current account password.</span>
              </div>

              {msg && (
                <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                  msg.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                    : 'bg-rose-50 border-rose-100 text-rose-800'
                }`}>
                  {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{msg.text}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving Changes...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

      {/* Simulated Plans & Subscription Card */}
      {(user?.role === 'developer' || user?.role === 'admin') && (
        <div id="developer-plans-management" className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6 mt-2 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                Workspace Subscription Slots & Billing
              </h3>
              <p className="text-xs text-slate-500 mt-1">Monitor your collaboration workspace slots and manage simulated billing tiers.</p>
            </div>
            
            {user?.role === 'admin' && (
              <button
                id="btn-add-custom-plan"
                onClick={handleCreatePlanClick}
                className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Custom Plan
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(localPlans && localPlans.length > 0 ? localPlans : availablePlans).map((p: any) => {
              const isActive = (user?.plan || 'free').toLowerCase() === p.key.toLowerCase();
              const isPlanLive = p.isActive !== false;
              return (
                <div 
                  key={p.key} 
                  id={`plan-card-${p.key}`}
                  className={`p-5 rounded-xl border transition-all flex flex-col justify-between relative group ${
                    isActive 
                      ? 'border-indigo-600 bg-indigo-50/10 ring-2 ring-indigo-600/10' 
                      : isPlanLive 
                        ? 'border-slate-200 bg-slate-50/40 hover:border-slate-300'
                        : 'border-slate-200 bg-slate-100/50 opacity-60'
                  }`}
                >
                  {/* Edit plan details button */}
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleEditPlanClick(p)}
                      className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Edit plan details, discount, or note"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="pr-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                          {p.key === 'free' ? 'Basic Starter' : p.key === 'pro' ? 'Agency Scale' : 'Special Tier'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                          {p.name}
                          {!isPlanLive && (
                            <span className="text-[8px] font-extrabold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded border border-slate-300 uppercase tracking-tight">
                              Inactive
                            </span>
                          )}
                        </h4>
                      </div>
                    </div>
                    
                    {isActive && (
                      <span className="inline-block mt-1 text-[8px] font-extrabold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                        ACTIVE PLAN
                      </span>
                    )}

                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      {p.description || `Pricing option including up to ${p.maxProjects} project slots with direct collaborative client feedback loops.`}
                    </p>
                    
                    {p.features && p.features.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {p.features.map((feat: string, i: number) => (
                          <li key={i} className="text-[10px] text-slate-500 flex items-center gap-1.5">
                            <span className="text-indigo-500 font-extrabold text-[8px]">✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-4 border-t border-dashed border-slate-200/60 pt-3 text-left">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-slate-950 block">{p.maxProjects} Active Workspaces</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Core taskboard & pin boards</span>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        {p.beforePrice && (
                          <span className="text-[9px] text-rose-500 line-through font-semibold leading-none mb-0.5">
                            {p.beforePrice.startsWith('$') ? p.beforePrice : `$${p.beforePrice}`}
                            {!p.beforePrice.includes('/') && <span className="text-[8px] font-normal text-slate-400">/mo</span>}
                          </span>
                        )}
                        <span className="text-xs font-extrabold text-slate-900 leading-none">
                          {p.price && p.price.startsWith('$') ? p.price : `$${p.price}`}
                          {!p.price?.includes('/') && <span className="text-[9px] font-normal text-slate-400"> / mo</span>}
                        </span>
                      </div>
                    </div>

                    {/* DISCOUNT & NOTE SECTION (prise er nise show hobe) */}
                    {(p.discount || p.note) && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        {p.discount ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-100 uppercase tracking-wide">
                            <Tag className="w-2.5 h-2.5 text-rose-500" />
                            {p.discount}
                          </span>
                        ) : <div />}
                        {p.note && (
                          <span className="text-[10px] text-slate-400 italic flex items-center gap-1 max-w-[170px] truncate" title={p.note}>
                            <FileText className="w-2.5 h-2.5 text-slate-300" />
                            {p.note}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Toggler button for simulated payment flow */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Local Billing Simulator</span>
              <span className="text-xs text-slate-600 font-medium">
                {user?.plan === 'pro' 
                  ? 'You have access to 15 project workspace slots.' 
                  : `Instantly upgrade your account to configure slot allocation settings.`}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {(localPlans && localPlans.length > 0 
                ? localPlans 
                : [{key: 'free', name: 'Free'}, {key: 'pro', name: 'Pro'}]
              ).map((p: any) => {
                const isActive = (user?.plan || 'free').toLowerCase() === p.key.toLowerCase();
                const isPlanLive = p.isActive !== false;
                const isButtonDisabled = isActive || !isPlanLive;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={async () => {
                      if (isButtonDisabled) return;
                      await updatePlan(p.key);
                    }}
                    disabled={isButtonDisabled}
                    className={`py-1.5 px-3 rounded-lg text-[10px] font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : !isPlanLive
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isActive ? `Active ${p.name}` : !isPlanLive ? `${p.name} (Inactive)` : `Upgrade to ${p.name}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CREATE / EDIT PLAN MODAL */}
          {(showEditPlanModal || showCreatePlanModal) && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-300 scale-100">
                
                {/* Modal Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      {showEditPlanModal ? `Edit Subscription: ${editingPlan?.name}` : 'Establish Custom Subscription Plan'}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Define slots, features, price, discount and sub-note.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowEditPlanModal(false);
                      setShowCreatePlanModal(false);
                      setEditingPlan(null);
                    }} 
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSavePlan} className="p-6 space-y-4">
                  {planActionError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      <span>{planActionError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Plan Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Agency Pro"
                        value={planForm.name}
                        onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Plan Unique Key</label>
                      <input
                        type="text"
                        required
                        disabled={showEditPlanModal}
                        placeholder="e.g. agency_pro"
                        value={planForm.key}
                        onChange={(e) => setPlanForm({ ...planForm, key: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Price ($) / mo</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 29"
                        value={planForm.price}
                        onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Before Price ($) [Opt]</label>
                      <input
                        type="text"
                        placeholder="e.g. 39"
                        value={planForm.beforePrice}
                        onChange={(e) => setPlanForm({ ...planForm, beforePrice: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Max active slots</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 15"
                        value={planForm.maxProjects}
                        onChange={(e) => setPlanForm({ ...planForm, maxProjects: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Plan Active/Inactive Status Switch */}
                  <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-slate-800">Plan Visibility Status</label>
                      <span className="text-[10px] text-slate-500 block">Deactivated plans cannot be selected by workspace developers.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${planForm.isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {planForm.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPlanForm({ ...planForm, isActive: !planForm.isActive })}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-all cursor-pointer ${
                          planForm.isActive ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                        }`}
                      >
                        <span className="bg-white w-4 h-4 rounded-full shadow-md" />
                      </button>
                    </div>
                  </div>

                  {/* DISCOUNT & NOTE (prise er nise show hobe) */}
                  <div className="grid grid-cols-2 gap-4 p-3 bg-indigo-50/20 border border-indigo-100/50 rounded-xl">
                    <div>
                      <label className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-indigo-500" />
                        Optional Discount Tag
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 20% OFF, SAVE $10"
                        value={planForm.discount}
                        onChange={(e) => setPlanForm({ ...planForm, discount: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-indigo-500" />
                        Optional Sub-Note
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Billed annually, Best value"
                        value={planForm.note}
                        onChange={(e) => setPlanForm({ ...planForm, note: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Features (comma-separated list)</label>
                    <textarea
                      placeholder="e.g. Custom domain, High Priority Syncing, 24/7 Premium Support"
                      value={planForm.featuresText}
                      onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                    />
                  </div>

                  {/* Actions buttons */}
                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditPlanModal(false);
                        setShowCreatePlanModal(false);
                        setEditingPlan(null);
                      }}
                      className="py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={planActionLoading}
                      className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1"
                    >
                      {planActionLoading ? 'Saving Plan...' : 'Save Plan Parameters'}
                    </button>
                  </div>

                </form>

              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
