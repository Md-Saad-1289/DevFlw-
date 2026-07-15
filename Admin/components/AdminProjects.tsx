import React, { useState } from 'react';
import { Search, Trash2, FolderGit2, AlertCircle } from 'lucide-react';

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  developerName: string;
  developerEmail: string;
  clients: string[];
  liveDemoUrl: string;
  status: 'active' | 'archived';
  createdAt?: string;
  tasksCount: number;
  feedbacksCount: number;
}

interface AdminProjectsProps {
  projects: ProjectItem[];
  onDeleteProject: (id: string) => Promise<boolean>;
}

export const AdminProjects: React.FC<AdminProjectsProps> = ({ projects, onDeleteProject }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.developerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.developerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteClick = async (project: ProjectItem) => {
    if (confirm(`Are you sure you want to permanently delete project "${project.name}"?\nThis will erase all of its tasks, chat messages, and contextual visual feedbacks! This action is irreversible.`)) {
      setDeletingId(project.id);
      await onDeleteProject(project.id);
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">Collaboration Workspaces</h3>
          <p className="text-xs text-gray-500 mt-1">
            Moderate all developer collaboration spaces, demo channels, feedback threads, and task logs.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by project or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 w-52"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Workspaces</option>
            <option value="archived">Archived Workspaces</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase bg-gray-50/50">
              <th className="py-3 px-4">Workspace Name</th>
              <th className="py-3 px-4">Developer (Owner)</th>
              <th className="py-3 px-4">Clients</th>
              <th className="py-3 px-4 text-center">Tasks</th>
              <th className="py-3 px-4 text-center">Feedbacks</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-sm text-gray-400 font-medium">
                  No collaboration workspaces found matching your filters.
                </td>
              </tr>
            ) : (
              filteredProjects.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/30 text-xs">
                  <td className="py-4 px-4 font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div>
                        <span className="block font-extrabold text-gray-800">{p.name}</span>
                        {p.liveDemoUrl && (
                          <a
                            href={p.liveDemoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-indigo-500 hover:underline font-bold"
                          >
                            Live Demo Link
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="block font-bold text-gray-700">{p.developerName}</span>
                    <span className="block text-[10px] text-gray-400 font-semibold">{p.developerEmail}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-extrabold text-gray-800 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded text-[10px]">
                      {p.clients.length} Registered
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-extrabold text-gray-700">{p.tasksCount}</td>
                  <td className="py-4 px-4 text-center font-extrabold text-gray-700">{p.feedbacksCount}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                        p.status === 'active'
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                          : 'bg-gray-100 border-gray-200 text-gray-500'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      disabled={deletingId === p.id}
                      onClick={() => handleDeleteClick(p)}
                      className="p-2 rounded-lg border border-gray-100 text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-colors"
                      title="Permanently Delete Workspace"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
