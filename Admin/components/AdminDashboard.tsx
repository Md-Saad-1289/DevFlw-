import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Frontend/context/AuthContext';
import { AdminStats } from './AdminStats';
import { AdminUsers } from './AdminUsers';
import { AdminProjects } from './AdminProjects';
import { AdminNotifications } from './AdminNotifications';
import { Shield, Users, FolderGit2, Megaphone, BarChart3, LogOut, ArrowLeft } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'projects' | 'notifications'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
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

  const loadData = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchStats(), fetchUsers(), fetchProjects()]);
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

  const handleBackToWorkspace = () => {
    // Force a reload to switch views back to the main portal cleanly
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Admin Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white h-16 shrink-0 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-600 rounded-lg shadow-sm">
            <Shield className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight">DevFlw Administrative Console</h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Control Panel & System Supervision
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToWorkspace}
            className="flex items-center gap-2 px-3.5 py-1.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Collaboration Portal
          </button>
          
          <div className="h-6 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-3">
            <div className="text-right">
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
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-64 bg-white border-r border-slate-200/80 shrink-0 p-5 flex flex-col justify-between">
          <div className="space-y-6">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block px-3">
              Supervision Categories
            </span>

            <nav className="space-y-1.5">
              <button
                id="admin-nav-stats"
                onClick={() => setActiveTab('stats')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'projects'
                    ? 'bg-rose-50 text-rose-600 border border-rose-100/50 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                }`}
              >
                <FolderGit2 className="w-4 h-4" />
                Workspaces ({projects.length})
              </button>

              <button
                id="admin-nav-broadcast"
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'notifications'
                    ? 'bg-rose-50 text-rose-600 border border-rose-100/50 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                }`}
              >
                <Megaphone className="w-4 h-4" />
                Global Announcement
              </button>
            </nav>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-lg">
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
                />
              )}
              {activeTab === 'projects' && (
                <AdminProjects projects={projects} onDeleteProject={handleDeleteProject} />
              )}
              {activeTab === 'notifications' && (
                <AdminNotifications onBroadcast={handleBroadcast} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
