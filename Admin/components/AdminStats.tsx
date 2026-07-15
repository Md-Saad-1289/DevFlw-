import React from 'react';
import { Users, FolderGit2, CheckSquare, MessageSquare, ShieldAlert } from 'lucide-react';

interface StatsProps {
  stats: {
    totalUsers: number;
    totalProjects: number;
    totalTasks: number;
    totalFeedbacks: number;
    totalMessages: number;
    activeProjects: number;
    resolvedFeedbacks: number;
  } | null;
}

export const AdminStats: React.FC<StatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="flex justify-center items-center h-48">
        <span className="text-gray-400 font-medium">Loading metrics...</span>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      sub: 'All registered platform accounts',
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      title: 'Collaboration Workspaces',
      value: stats.totalProjects,
      sub: `${stats.activeProjects} active, ${stats.totalProjects - stats.activeProjects} archived`,
      icon: FolderGit2,
      color: 'bg-sky-50 text-sky-600 border-sky-100',
    },
    {
      title: 'Active Tasks',
      value: stats.totalTasks,
      sub: 'Across all active workspaces',
      icon: CheckSquare,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      title: 'Contextual Feedbacks',
      value: stats.totalFeedbacks,
      sub: `${stats.resolvedFeedbacks} resolved, ${stats.totalFeedbacks - stats.resolvedFeedbacks} pending`,
      icon: ShieldAlert,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
    },
    {
      title: 'System Messages',
      value: stats.totalMessages,
      sub: 'Total chat and collaboration messages',
      icon: MessageSquare,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.title}
              id={`metric-${m.title.toLowerCase().replace(/ /g, '-')}`}
              className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  {m.title}
                </span>
                <span className="text-3xl font-extrabold text-gray-900 tracking-tight block">
                  {m.value}
                </span>
                <span className="text-xs text-gray-500 font-medium mt-1 block">
                  {m.sub}
                </span>
              </div>
              <div className={`p-3 rounded-lg border ${m.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-4">Platform Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <span className="text-sm font-semibold text-gray-600 mb-2 block">Feedback Completion Rate</span>
            <div className="flex items-center gap-4">
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      stats.totalFeedbacks > 0
                        ? (stats.resolvedFeedbacks / stats.totalFeedbacks) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="text-sm font-bold text-gray-700 min-w-[45px] text-right">
                {stats.totalFeedbacks > 0
                  ? Math.round((stats.resolvedFeedbacks / stats.totalFeedbacks) * 100)
                  : 0}
                %
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Percentage of client-reported visual feedbacks that have been marked as resolved by developers.
            </p>
          </div>

          <div>
            <span className="text-sm font-semibold text-gray-600 mb-2 block">Workspace Density</span>
            <div className="flex items-center gap-4">
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      stats.totalProjects > 0
                        ? (stats.activeProjects / stats.totalProjects) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="text-sm font-bold text-gray-700 min-w-[45px] text-right">
                {stats.totalProjects > 0
                  ? Math.round((stats.activeProjects / stats.totalProjects) * 100)
                  : 0}
                %
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Percentage of workspaces currently active versus archived projects.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
