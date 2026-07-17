import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { 
  Folder, Plus, Users, Globe, LogOut, CheckCircle2, ListTodo, 
  MessageSquare, Settings, Sparkles, LogIn, Code, User, ChevronRight, AlertCircle, Menu, X
} from 'lucide-react';
import { Project, Task, Feedback, Message, Notification } from '../types';
import { TaskBoard } from './TaskBoard';
import { FeedbackOverlay } from './FeedbackOverlay';
import { ProjectChat } from './ProjectChat';
import { NotificationCenter } from './NotificationCenter';
import { ProjectLifecycleStepper } from './ProjectLifecycleStepper';
import { ProfilePage } from './ProfilePage';

// Configure axial base client with authorization header
const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('devflw_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Configure response interceptor to handle authentication failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Authentication failure detected, clearing session.');
      localStorage.removeItem('devflw_token');
      localStorage.removeItem('devflw_user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const Dashboard: React.FC = () => {
  const { user, logout, updatePlan } = useAuth();
  
  // State variables
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/api/auth/plans');
      setAvailablePlans(res.data.plans || []);
    } catch (err) {
      console.error('Error fetching dynamic plans:', err);
    }
  };

  // Page level loads
  const [loading, setLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'tasks' | 'feedback' | 'chat' | 'settings' | 'profile'>('tasks');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // New Project Form Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjDemo, setNewProjDemo] = useState('');
  const [newProjClient, setNewProjClient] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Invite Client state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const [lastActivationLink, setLastActivationLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // Fetch initial list of projects
  const fetchProjects = async (selectFirst = false) => {
    try {
      setProjectsError(null);
      const res = await api.get('/api/projects');
      const list = res.data.projects || [];
      setProjects(list);
      
      if (list.length > 0) {
        if (selectFirst || !activeProject) {
          setActiveProject(list[0]);
        } else {
          // Keep current active project up-to-date with any changes
          const updated = list.find((p: any) => (p._id || p.id) === (activeProject._id || activeProject.id));
          if (updated) {
            setActiveProject(updated);
          }
        }
      } else {
        setActiveProject(null);
      }
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setProjectsError('Failed to fetch collaboration workspaces.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch active project's sub-data (tasks, feedbacks, chats, notifications)
  const fetchActiveProjectData = async () => {
    if (!activeProject) return;
    const projectId = activeProject._id || activeProject.id;
    try {
      const res = await api.get(`/api/projects/${projectId}`);
      setTasks(res.data.tasks || []);
      setFeedbacks(res.data.feedbacks || []);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Error loading project sub-data:', err);
    }
  };

  // Fetch unread notification counts
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  // Fetch initial list of projects on mount
  useEffect(() => {
    fetchProjects(true);
    fetchPlans();
  }, []);

  // Poll for collaborative updates safely using setTimeout to avoid overlapping requests
  useEffect(() => {
    let isMounted = true;
    let timerId: any;

    const poll = async () => {
      if (!isMounted) return;

      try {
        if (activeProject) {
          await fetchActiveProjectData();
        }
        await fetchNotifications();
      } catch (err) {
        console.error('Polling error:', err);
      }

      if (isMounted) {
        // Schedule the next poll only after this one completes/fails
        timerId = setTimeout(poll, 10000); // 10s non-overlapping interval
      }
    };

    // Immediately fetch when activeProject changes
    if (activeProject) {
      fetchActiveProjectData();
    }
    fetchNotifications();

    // Start background polling
    timerId = setTimeout(poll, 10000);

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [activeProject]);

  // Handle Project Creation
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    setCreateLoading(true);
    setCreateError(null);
    try {
      const res = await api.post('/api/projects', {
        name: newProjName.trim(),
        description: newProjDesc.trim(),
        liveDemoUrl: newProjDemo.trim(),
        clientEmail: newProjClient.trim()
      });
      
      setNewProjName('');
      setNewProjDesc('');
      setNewProjDemo('');
      setNewProjClient('');
      setShowCreateModal(false);
      
      // Reload projects list and set newly created project as active
      const createdProj = res.data.project;
      await fetchProjects();
      setActiveProject(createdProj);
      setActiveTab('tasks');
    } catch (err: any) {
      setCreateError(err.response?.data?.error || 'Failed to establish workspace project.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle tasks operations
  const handleAddTask = async (taskData: Partial<Task>) => {
    if (!activeProject) return;
    const projectId = activeProject._id || activeProject.id;
    await api.post('/api/tasks', { projectId, ...taskData });
    await fetchActiveProjectData();
  };

  // Handle updates tasks
  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    await api.patch(`/api/tasks/${id}`, updates);
    await fetchActiveProjectData();
  };

  // Handle deleting tasks
  const handleDeleteTask = async (id: string) => {
    await api.delete(`/api/tasks/${id}`);
    await fetchActiveProjectData();
  };

  // Handle Feedback operations
  const handleAddFeedback = async (feedbackData: Partial<Feedback>) => {
    await api.post('/api/feedbacks', feedbackData);
    await fetchActiveProjectData();
  };

  // Handle resolving feedback
  const handleResolveFeedback = async (id: string, resolved: boolean) => {
    await api.patch(`/api/feedbacks/${id}`, { resolved });
    await fetchActiveProjectData();
  };

  // Handle updating feedback status
  const handleUpdateFeedbackStatus = async (id: string, status: 'open' | 'in_progress' | 'resolved' | 'rejected') => {
    await api.patch(`/api/feedbacks/${id}`, { status });
    await fetchActiveProjectData();
  };

  // Handle deleting feedback
  const handleDeleteFeedback = async (id: string) => {
    await api.delete(`/api/feedbacks/${id}`);
    await fetchActiveProjectData();
  };

  // Chat sender
  const handleSendMessage = async (text: string) => {
    if (!activeProject) return;
    const projectId = activeProject._id || activeProject.id;
    await api.post('/api/messages', { projectId, text });
    await fetchActiveProjectData();
  };

  // Update Live Demo Link (Settings / Iframe overlay)
  const handleUpdateDemoUrl = async (url: string) => {
    if (!activeProject) return;
    const id = activeProject._id || activeProject.id;
    const res = await api.patch(`/api/projects/${id}`, { liveDemoUrl: url });
    setActiveProject(res.data.project);
    await fetchProjects();
  };

  // Update Project Lifecycle Stage
  const handleUpdateLifecycleStage = async (stage: string) => {
    if (!activeProject) return;
    const id = activeProject._id || activeProject.id;
    try {
      const res = await api.patch(`/api/projects/${id}`, { lifecycleStage: stage });
      setActiveProject(res.data.project);
      setProjects(prev => prev.map(p => (p._id || p.id) === id ? res.data.project : p));
      
      // Post system announcement to Discussion log
      try {
        await api.post('/api/messages', { 
          projectId: id, 
          text: `📢 System Status: Workspace lifecycle stage has progressed to "${stage}".` 
        });
        await fetchActiveProjectData();
      } catch (e) {
        console.error('Failed to post system milestone log:', e);
      }
    } catch (err) {
      console.error('Failed to update project lifecycle:', err);
    }
  };

  // Invite Client to current active project
  const handleInviteClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !inviteEmail.trim()) return;

    setInviteLoading(true);
    setInviteMsg('');
    setLastActivationLink('');
    setLinkCopied(false);
    const id = activeProject._id || activeProject.id;
    try {
      const res = await api.post(`/api/projects/${id}/invite`, { email: inviteEmail.trim() });
      if (res.data.isNewClient && res.data.activationLink) {
        setInviteMsg('Client invited successfully! Since they do not have a registered account yet, a temporary workspace client account has been created. Copy the unique activation link below and share it with your client so they can set their password and start working instantly!');
        setLastActivationLink(res.data.activationLink);
      } else {
        setInviteMsg('Client invited successfully! Since they already have a registered DevFlw account, they can log in normally to access the workspace.');
      }
      setInviteEmail('');
      await fetchProjects();
    } catch (err: any) {
      setInviteMsg(err.response?.data?.error || 'Failed to send invite.');
    } finally {
      setInviteLoading(false);
    }
  };

  // Mark single notification read
  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => (n._id || n.id) === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all notifications read
  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.post('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div id="dashboard-loading" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 animate-pulse font-sans">Booting DevFlw collaboration engine...</p>
      </div>
    );
  }

  return (
    <div id="portal-frame" className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800">
      
      {/* Top Application Header Bar */}
      <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          {/* Mobile Workspaces Toggler Button */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 hover:bg-slate-100 rounded-lg lg:hidden text-slate-500 hover:text-slate-800 transition-colors mr-1 cursor-pointer"
            title="Toggle workspaces menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/10 shrink-0">
            <Code className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">DevFlw</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200/80 font-bold hidden xs:inline-block">Workspace v1.0</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium hidden sm:block">SaaS Developer-Client Context Collaboration</p>
          </div>
        </div>

        {/* Header Right Widgets */}
        <div className="flex items-center gap-3">
          {/* Unread system notifications dropdown */}
          <NotificationCenter
            notifications={notifications}
            onMarkRead={handleMarkNotificationRead}
            onMarkAllRead={handleMarkAllNotificationsRead}
          />

          {/* User profile identifier block */}
          <button
            id="header-profile-btn"
            onClick={() => {
              setActiveTab('profile');
              setMobileSidebarOpen(false);
            }}
            className={`hidden sm:flex items-center gap-2.5 bg-slate-50 border py-1.5 pl-3 pr-4 rounded-xl text-left transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 ring-1 ring-indigo-500/20'
                : 'border-slate-100 hover:border-indigo-100 hover:bg-slate-100/50'
            }`}
            title="View profile settings"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left leading-none">
              <div className="text-xs font-bold text-slate-800">{user?.name}</div>
              <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-wider">{user?.role}</span>
            </div>
          </button>

          <button
            id="header-signout-btn"
            onClick={logout}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Panel Frame: Dual-column workspace dashboard */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch relative">
        
        {/* Mobile Sidebar Overlay Backdrop */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-35 lg:hidden transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* LEFT NAV BAR: Projects List & workspace switch */}
        <aside 
          id="projects-sidebar" 
          className={`
            fixed lg:static inset-y-0 left-0 z-40 w-72 max-w-[85vw] sm:max-w-xs bg-white border-r border-slate-100 p-6 flex flex-col gap-6 flex-shrink-0 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:shadow-none shadow-2xl h-screen lg:h-auto
            ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Workspaces</span>
            <div className="flex items-center gap-2">
              {(user?.role === 'developer' || user?.role === 'admin') && (
                <button
                  id="sidebar-create-project-btn"
                  onClick={() => setShowCreateModal(true)}
                  className="p-1 text-indigo-600 hover:bg-indigo-50 border border-indigo-100 rounded-md transition-all cursor-pointer"
                  title="Establish New Workspace"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              {/* Close button inside sidebar on mobile */}
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md lg:hidden transition-all cursor-pointer"
                title="Close workspaces menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List of projects */}
          <div id="projects-list-box" className="space-y-1.5 overflow-y-auto max-h-[300px] lg:max-h-none flex-1">
            {projects.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-3">
                <Folder className="w-8 h-8 mx-auto text-slate-300" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold">No active workspaces</p>
                  <p className="text-[10px] text-slate-400 px-4 leading-normal">
                    {(user?.role === 'developer' || user?.role === 'admin') 
                      ? 'Establish a collaboration project space to invite clients!' 
                      : 'Waiting to be added by your developer via email.'}
                  </p>
                </div>
                {(user?.role === 'developer' || user?.role === 'admin') && (
                  <button
                    id="sidebar-create-init-proj-btn"
                    onClick={() => setShowCreateModal(true)}
                    className="py-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-colors"
                  >
                    Create Project
                  </button>
                )}
              </div>
            ) : (
              projects.map(p => {
                const isActive = activeProject && (p._id || p.id) === (activeProject._id || activeProject.id);
                return (
                  <button
                    id={`project-tab-${p._id || p.id}`}
                    key={p._id || p.id}
                    onClick={() => {
                      setActiveProject(p);
                      setActiveTab('tasks');
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl flex items-center justify-between group transition-all border cursor-pointer ${
                      isActive 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10' 
                        : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Folder className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{p.name}</div>
                        <span className={`text-[8px] font-bold tracking-wider uppercase ${isActive ? 'text-indigo-300' : 'text-slate-400'}`}>
                          {p.clients?.length || 0} Clients Invited
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isActive ? 'text-indigo-400 translate-x-0.5' : 'text-slate-300 group-hover:translate-x-0.5'}`} />
                  </button>
                );
              })
            )}
          </div>

          {/* Developer Subscription Plan & Slots Usage */}
          {(user?.role === 'developer' || user?.role === 'admin') && (() => {
            const currentPlanObj = availablePlans.find(p => p.key === (user?.plan || 'free').toLowerCase());
            const maxSlots = currentPlanObj ? currentPlanObj.maxProjects : (user?.plan === 'pro' ? 15 : 2);
            const planName = currentPlanObj ? currentPlanObj.name : (user?.plan === 'pro' ? 'Pro Plan' : 'Free Plan');
            const isProColor = user?.plan === 'pro' || (currentPlanObj && currentPlanObj.key !== 'free');
            return (
              <div className="p-4 bg-indigo-50/40 border border-indigo-100/70 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-wider">Plan & Usage</span>
                  <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full border ${
                    isProColor 
                      ? 'bg-purple-50 text-purple-700 border-purple-200' 
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  } uppercase tracking-wide`}>
                    {planName}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-600">
                    <span>Workspace Slots</span>
                    <span>{projects.filter(p => p.status !== 'archived').length} / {maxSlots} used</span>
                  </div>
                  <div className="w-full bg-slate-100/80 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isProColor ? 'bg-purple-600' : 'bg-indigo-600'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (projects.filter(p => p.status !== 'archived').length / maxSlots) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
                <button
                  id="sidebar-upgrade-btn"
                  onClick={() => {
                    setActiveTab('profile');
                  }}
                  className="w-full text-center py-1.5 bg-white hover:bg-slate-50 text-indigo-600 text-[10px] font-extrabold rounded-lg border border-indigo-200 cursor-pointer shadow-xs transition-colors"
                >
                  {user?.plan === 'pro' ? 'Manage Subscription' : 'Upgrade Slots'}
                </button>
              </div>
            );
          })()}

          {/* Account Profile button for both Desktop & Mobile */}
          <button
            id="sidebar-profile-btn"
            onClick={() => {
              setActiveTab('profile');
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer text-left ${
              activeTab === 'profile'
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <User className={`w-4 h-4 flex-shrink-0 ${activeTab === 'profile' ? 'text-white' : 'text-slate-400'}`} />
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">My Account Profile</div>
                <span className={`text-[8px] font-bold tracking-wider uppercase ${activeTab === 'profile' ? 'text-indigo-200' : 'text-slate-400'}`}>
                  Manage Credentials
                </span>
              </div>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${activeTab === 'profile' ? 'text-white translate-x-0.5' : 'text-slate-300'}`} />
          </button>

          {/* Quick instructions panel */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 mt-auto">
            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              DevFlw Playbook
            </h5>
            <p className="text-[10px] text-slate-400 leading-normal">
              Clients can toggle <strong>Review Mode</strong> inside the Live Preview frame to instantly click any spot and log visual coordinate feedbacks.
            </p>
          </div>
        </aside>

        {/* RIGHT MAIN PANEL: Active workspace details and interactive sub-modules */}
        <main id="main-workspace-portal" className="flex-1 p-6 md:p-8 space-y-6">
          {activeTab === 'profile' ? (
            <ProfilePage
              projects={projects}
              onBackToWorkspaces={activeProject ? () => setActiveTab('tasks') : undefined}
              availablePlans={availablePlans}
            />
          ) : activeProject ? (
            <>
              {/* Workspace Title, Metadata, and Sub-Tab Toggle */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{activeProject.name}</h1>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Active Workspace
                      </span>
                    </div>
                    {activeProject.description && (
                      <p className="text-xs text-slate-500 max-w-2xl">{activeProject.description}</p>
                    )}
                  </div>

                  {/* Collaboration list summary badge indicators */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>{activeProject.clients?.join(', ') || 'No clients invited yet'}</span>
                    </div>
                    {activeProject.liveDemoUrl && (
                      <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                        <Globe className="w-4 h-4 text-indigo-500" />
                        <a 
                          href={activeProject.liveDemoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-indigo-600 hover:underline font-semibold"
                        >
                          Launch App
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Lifecycle Stepper */}
                <ProjectLifecycleStepper
                  currentStage={activeProject.lifecycleStage || 'Planning'}
                  onStageChange={handleUpdateLifecycleStage}
                  userRole={user!.role}
                />

                {/* Sub Tab selection bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 pb-2">
                  <button
                    id="tab-btn-tasks"
                    onClick={() => setActiveTab('tasks')}
                    className={`flex items-center gap-2 py-2 px-4 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                      activeTab === 'tasks' 
                        ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600 font-extrabold' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ListTodo className="w-4 h-4" />
                    Tasks & Milestones
                  </button>

                  <button
                    id="tab-btn-feedback"
                    onClick={() => setActiveTab('feedback')}
                    className={`flex items-center gap-2 py-2 px-4 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                      activeTab === 'feedback' 
                        ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600 font-extrabold' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    Live Demo & Pins
                  </button>

                  <button
                    id="tab-btn-chat"
                    onClick={() => setActiveTab('chat')}
                    className={`flex items-center gap-2 py-2 px-4 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                      activeTab === 'chat' 
                        ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600 font-extrabold' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Discussions
                  </button>

                  <button
                    id="tab-btn-settings"
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-2 py-2 px-4 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                      activeTab === 'settings' 
                        ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600 font-extrabold' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    Settings & Invite
                  </button>
                </div>
              </div>

              {/* Rendering selected Sub-Tab Workspace */}
              <div id="sub-tab-workspace" className="min-h-[400px]">
                {activeTab === 'tasks' && (
                  <TaskBoard
                    tasks={tasks}
                    user={user!}
                    onAddTask={handleAddTask}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                    clients={activeProject.clients || []}
                    currentLifecycleStage={activeProject.lifecycleStage || 'Planning'}
                  />
                )}

                {activeTab === 'feedback' && (
                  <FeedbackOverlay
                    project={activeProject}
                    feedbacks={feedbacks}
                    user={user!}
                    onAddFeedback={handleAddFeedback}
                    onResolveFeedback={handleResolveFeedback}
                    onUpdateFeedbackStatus={handleUpdateFeedbackStatus}
                    onDeleteFeedback={handleDeleteFeedback}
                    onUpdateDemoUrl={handleUpdateDemoUrl}
                  />
                )}

                {activeTab === 'chat' && (
                  <ProjectChat
                    messages={messages}
                    user={user!}
                    onSendMessage={handleSendMessage}
                  />
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6 max-w-2xl">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm space-y-6">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Project Settings & Client Invite</h3>
                        <p className="text-xs text-slate-500 mt-1">Manage external invites, live prototype builds, and metadata configurations.</p>
                      </div>

                      <form onSubmit={handleInviteClient} className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <Users className="w-4 h-4 text-indigo-600" />
                          Invite Clients via Email
                        </h4>
                        <p className="text-[11px] text-slate-400">Add client email to instantly sync tasks and let them access this workspace.</p>
                        
                        <div className="flex gap-2">
                          <input
                            id="invite-email-input"
                            type="email"
                            required
                            placeholder="client@company.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="flex-1 bg-slate-50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                          />
                          <button
                            type="submit"
                            id="send-invite-btn"
                            disabled={inviteLoading}
                            className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {inviteLoading ? 'Sending...' : 'Invite Partner'}
                          </button>
                        </div>
                        {inviteMsg && (
                          <p className={`text-xs font-semibold ${inviteMsg.includes('successfully') ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {inviteMsg}
                          </p>
                        )}

                        {lastActivationLink && (
                          <div className="mt-3 bg-emerald-50/70 border border-emerald-100 p-3.5 rounded-xl space-y-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                                Client Activation Link Generated
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-normal">
                              Send this secure, direct access link to your client. They can click it to set their custom password and start co-design feedback loops instantly.
                            </p>
                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                readOnly
                                value={lastActivationLink}
                                className="flex-1 bg-white border border-emerald-200 rounded-lg py-1.5 px-2.5 text-xs text-slate-800 outline-none select-all"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(lastActivationLink);
                                  setLinkCopied(true);
                                  setTimeout(() => setLinkCopied(false), 2000);
                                }}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer min-w-[80px]"
                              >
                                {linkCopied ? 'Copied!' : 'Copy Link'}
                              </button>
                            </div>
                          </div>
                        )}
                      </form>

                      <div className="border-t border-slate-100 pt-6 space-y-4">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Workspace Users</h4>
                        <div className="divide-y divide-slate-100">
                          {activeProject.clients.length === 0 ? (
                            <p className="text-xs text-slate-400 py-3">No clients have been invited yet. Send invitations to start co-design feedback loops!</p>
                          ) : (
                            activeProject.clients.map(email => (
                              <div key={email} className="py-3 flex items-center justify-between text-xs text-slate-600">
                                <span className="font-semibold">{email}</span>
                                <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border">CLIENT PARTNER</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* NO WORKSPACE SELECTED YET (OR EMPTY SCREEN) */
            <div id="no-workspace-selected" className="bg-white rounded-2xl border border-slate-200/50 shadow-sm p-12 text-center max-w-xl mx-auto space-y-6">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm text-indigo-500">
                <Folder className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900">Establish Collaborative Workspace</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {(user?.role === 'developer' || user?.role === 'admin') 
                    ? 'Start co-design loops with clients. Build a project space, link your build url, and collaborate in context.'
                    : 'We could not locate any active project workspaces invited to your email. Please contact your developer to add your email to their DevFlw dashboard!'}
                </p>
              </div>

              {(user?.role === 'developer' || user?.role === 'admin') && (
                <button
                  id="empty-create-project-btn"
                  onClick={() => setShowCreateModal(true)}
                  className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                >
                  Establish First Project
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* CREATE PROJECT MODAL (DEVELOPER ONLY) */}
      {showCreateModal && (
        <div id="create-modal-container" className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Modal Backdrop */}
          <div 
            id="create-modal-backdrop" 
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm"
            onClick={() => {
              if (!createLoading) setShowCreateModal(false);
            }}
          />

          {/* Modal Card content */}
          <motion.div
            id="create-modal-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-lg relative z-10 space-y-5"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-indigo-600" />
                Establish Collaboration Workspace
              </h3>
              <p className="text-xs text-slate-500 mt-1">Configure project specifications and associate active clients.</p>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Project Name *</label>
                  <input
                    id="new-project-name"
                    type="text"
                    required
                    placeholder="e.g. Acme Ecommerce Store"
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    id="new-project-desc"
                    placeholder="Summary of the build milestone scope..."
                    rows={3}
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Live Demo / Prototype URL</label>
                  <input
                    id="new-project-demo"
                    type="url"
                    placeholder="https://acme-stage.web.app (Optional)"
                    value={newProjDemo}
                    onChange={(e) => setNewProjDemo(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Associate Client (Email)</label>
                  <input
                    id="new-project-client"
                    type="email"
                    placeholder="partner@client.com (Optional)"
                    value={newProjClient}
                    onChange={(e) => setNewProjClient(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              {createError && (
                <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  {createError}
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  id="cancel-create-modal-btn"
                  onClick={() => setShowCreateModal(false)}
                  disabled={createLoading}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-create-modal-btn"
                  disabled={createLoading}
                  className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {createLoading ? 'Establishing...' : 'Establish Workspace'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
