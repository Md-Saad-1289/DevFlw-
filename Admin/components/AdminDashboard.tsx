import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Frontend/context/AuthContext';
import { AdminStats } from './AdminStats';
import { AdminUsers } from './AdminUsers';
import { AdminProjects } from './AdminProjects';
import { AdminNotifications } from './AdminNotifications';
import { AdminPlans } from './AdminPlans';
import { Shield, Users, FolderGit2, Megaphone, BarChart3, LogOut, ArrowLeft, Layers } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'projects' | 'notifications' | 'plans'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = () => {
    const token = localStorage.getItem('devflw_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to load system stats');
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to load user list');
      const data = await res.json();
      setUsers(data.users);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/admin/projects', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to load project list');
      const data = await res.json();
      setProjects(data.projects);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/admin/plans', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to load pricing plans');
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchStats(), fetchUsers(), fetchProjects(), fetchPlans()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete user');
      }
      await loadData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Error occurred while deleting user');
      return false;
    }
  };

  const handleUpdatePlan = async (userId: string, plan: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/plan`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update user plan');
      }
      await loadData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Error occurred while updating user plan');
      return false;
    }
  };

  const handleDeleteProject = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete project');
      }
      await loadData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Error occurred while deleting project');
      return false;
    }
  };

  const handleBroadcast = async (text: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to broadcast announcement');
      }
      return true;
    } catch (err: any) {
      alert(err.message || 'Error occurred while broadcasting announcement');
      return false;
    }
  };

  const handleAddPlan = async (planData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(planData),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create plan');
      }
      await fetchPlans();
      return true;
    } catch (err: any) {
      alert(err.message || 'Error occurred while creating plan');
      return false;
    }
  };

  const handleUpdatePlanDetails = async (id: string, updates: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/plans/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update plan');
      }
      await fetchPlans();
      return true;
    } catch (err: any) {
      alert(err.message || 'Error occurred while updating plan');
      return false;
    }
  };

  const handleDeletePlan = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/plans/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete plan');
      }
      await fetchPlans();
      return true;
    } catch (err: any) {
      alert(err.message || 'Error occurred while deleting plan');
      return false;
    }
  };

  const handleBackToWorkspace = () => {
    // Force a reload to switch views back to the main portal cleanly
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Admin Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white min-h-16 shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:px-6 shadow-sm gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-600 rounded-lg shadow-sm shrink-0">
            <Shield className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight">DevFlw Administrative Console</h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Control Panel & System Supervision
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={handleBackToWorkspace}
            className="flex items-center gap-2 px-3.5 py-1.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Collaboration Portal
          </button>
          
          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <span className="block text-xs font-bold text-slate-200">{user?.name}</span>
              <span className="block text-[10px] text-rose-500 font-extrabold uppercase tracking-wide">
                SYSTEM ADMIN
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2 border border-slate-800 hover:border-slate-700 bg-slate-800/40 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200/80 shrink-0 p-4 lg:p-5 flex flex-row lg:flex-col justify-between items-center lg:items-stretch overflow-x-auto lg:overflow-x-visible gap-4 lg:gap-6">
          <div className="space-y-0 lg:space-y-6 flex flex-row lg:flex-col items-center lg:items-stretch gap-3 lg:gap-0 w-full">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden lg:block px-3">
              Supervision Categories
            </span>

            <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0 w-full">
              <button
                id="admin-nav-stats"
                onClick={() => setActiveTab('stats')}
                className={`flex items-center gap-2 lg:gap-3 px-3 py-2 lg:px-3.5 lg:py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'stats'
                    ? 'bg-rose-50 text-rose-600 border border-rose-100/50 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                System Analytics
              </button>

              <button
                id="admin-nav-users"
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 lg:gap-3 px-3 py-2 lg:px-3.5 lg:py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'bg-rose-50 text-rose-600 border border-rose-100/50 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                }`}
              >
                <Users className="w-4 h-4" />
                User Accounts ({users.length})
              </button>

              <button
                id="admin-nav-projects"
                onClick={() => setActiveTab('projects')}
                className={`flex items-center gap-2 lg:gap-3 px-3 py-2 lg:px-3.5 lg:py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'projects'
                    ? 'bg-rose-50 text-rose-600 border border-rose-100/50 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                }`}
              >
                <FolderGit2 className="w-4 h-4" />
                Workspaces ({projects.length})
              </button>

              <button
                id="admin-nav-plans"
                onClick={() => setActiveTab('plans')}
                className={`flex items-center gap-2 lg:gap-3 px-3 py-2 lg:px-3.5 lg:py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'plans'
                    ? 'bg-rose-50 text-rose-600 border border-rose-100/50 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                }`}
              >
                <Layers className="w-4 h-4" />
                Pricing Plans ({plans.length})
              </button>

              <button
                id="admin-nav-broadcast"
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-2 lg:gap-3 px-3 py-2 lg:px-3.5 lg:py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'notifications'
                    ? 'bg-rose-50 text-rose-600 border border-rose-100/50 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                }`}
              >
                <Megaphone className="w-4 h-4" />
                Announcement
              </button>
            </nav>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-lg hidden lg:block shrink-0">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Mongoose Database
            </span>
            <span className="block text-xs font-medium text-slate-400 mt-0.5">
              Connected & Synchronized
            </span>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-600 text-xs font-semibold mb-6 flex items-center justify-between">
              <span>Error loading administrative panel: {error}</span>
              <button onClick={loadData} className="px-3 py-1.5 bg-rose-600 text-white rounded font-bold cursor-pointer">
                Retry Connection
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-3">
              <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider animate-pulse">
                Fetching Supervisor Datastore...
              </span>
            </div>
          ) : (
            <div>
              {activeTab === 'stats' && <AdminStats stats={stats} />}
              {activeTab === 'users' && (
                <AdminUsers
                  users={users}
                  currentUserEmail={user?.email || ''}
                  onDeleteUser={handleDeleteUser}
                  onUpdatePlan={handleUpdatePlan}
                  availablePlans={plans}
                />
              )}
              {activeTab === 'projects' && (
                <AdminProjects projects={projects} onDeleteProject={handleDeleteProject} />
              )}
              {activeTab === 'notifications' && (
                <AdminNotifications onBroadcast={handleBroadcast} />
              )}
              {activeTab === 'plans' && (
                <AdminPlans
                  plans={plans}
                  onAddPlan={handleAddPlan}
                  onUpdatePlan={handleUpdatePlanDetails}
                  onDeletePlan={handleDeletePlan}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
