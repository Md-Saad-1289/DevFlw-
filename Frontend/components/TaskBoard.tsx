import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, CheckSquare, Clock, ArrowRight, ArrowLeft, Trash2, Tag, AlertCircle, 
  UserCheck, Calendar, Check, MoreVertical
} from 'lucide-react';
import { Task, User } from '../types';

interface TaskBoardProps {
  tasks: Task[];
  user: User;
  onAddTask: (taskData: Partial<Task>) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  clients: string[];
  currentLifecycleStage?: string;
}

const COLUMNS = [
  { id: 'pending', title: 'To Do / Backlog', color: 'border-t-slate-400 bg-slate-50 text-slate-800' },
  { id: 'in_progress', title: 'In Progress', color: 'border-t-indigo-500 bg-indigo-50/20 text-indigo-900' },
  { id: 'in_review', title: 'Client Review', color: 'border-t-amber-500 bg-amber-50/20 text-amber-900' },
  { id: 'completed', title: 'Completed', color: 'border-t-emerald-500 bg-emerald-50/20 text-emerald-900' }
];

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  user,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  clients,
  currentLifecycleStage
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick State Dropdown tracker
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await onAddTask({
        title,
        description,
        priority,
        status: 'pending' as any, // initial status is pending (To Do)
        assignedTo,
        dueDate
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setAssignedTo('');
      setDueDate('');
      setShowAddForm(false);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const moveTask = async (taskId: string, currentStatus: string, direction: 'forward' | 'backward') => {
    const statuses = ['pending', 'in_progress', 'in_review', 'completed'];
    const curIdx = statuses.indexOf(currentStatus);
    let nextIdx = curIdx + (direction === 'forward' ? 1 : -1);
    
    if (nextIdx >= 0 && nextIdx < statuses.length) {
      const nextStatus = statuses[nextIdx];
      await onUpdateTask(taskId, { status: nextStatus as any });
    }
  };

  return (
    <div id="taskboard-container" className="space-y-6">
      {/* Header and Add Task Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg font-bold text-slate-900">Project Milestone Board</h2>
            {currentLifecycleStage && (
              <span className="text-[10px] font-extrabold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-none">
                Pipeline: {currentLifecycleStage}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">Track and progress developer tasks, backlog milestones, and client feedback requests.</p>
        </div>
        
        {user.role === 'developer' && (
          <button
            id="open-add-task-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Milestone Task
          </button>
        )}
      </div>

      {/* Task Creation Form Dropdown */}
      {showAddForm && (
        <motion.div
          id="task-form-panel"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white rounded-xl border border-indigo-100 p-5 shadow-md shadow-indigo-50/20 overflow-hidden space-y-4"
        >
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-indigo-600" />
            Create Milestone Task
          </h3>

          <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Task Title *</label>
                <input
                  id="task-title"
                  type="text"
                  required
                  placeholder="e.g. Integrate user settings design"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  id="task-description"
                  placeholder="Detail the scope, specifications, or link to design references..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Priority Level</label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs text-slate-700 outline-none cursor-pointer"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assignee Partner</label>
                <select
                  id="task-assignee"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs text-slate-700 outline-none cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  <option value={user.email}>{user.name} (Dev)</option>
                  {clients.map(c => (
                    <option key={c} value={c}>{c} (Client)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Due Date</label>
                <input
                  id="task-duedate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs text-slate-700 outline-none cursor-pointer"
                />
              </div>
            </div>

            {error && (
              <div className="md:col-span-3 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                id="cancel-task-form-btn"
                onClick={() => setShowAddForm(false)}
                className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="submit-task-form-btn"
                disabled={loading}
                className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Save Task'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Kanban Board Grid */}
      <div id="kanban-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => (t.status || 'pending') === col.id);

          return (
            <div
              id={`kanban-column-${col.id}`}
              key={col.id}
              className="bg-slate-100/50 rounded-2xl p-4 border border-slate-200/40 flex flex-col min-h-[450px]"
            >
              {/* Column Header */}
              <div className={`border-t-4 ${col.color.split(' ')[0]} pt-2 pb-4 flex items-center justify-between`}>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{col.title}</span>
                <span className="text-[10px] bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  {colTasks.length}
                </span>
              </div>

              {/* Card List container */}
              <div id={`kanban-cardlist-${col.id}`} className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
                {colTasks.length === 0 ? (
                  <div className="h-28 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                    <CheckSquare className="w-5 h-5 text-slate-300 mb-1" />
                    <p className="text-[10px] font-semibold">No tasks here</p>
                  </div>
                ) : (
                  colTasks.map(task => {
                    const id = task._id || task.id;
                    const priorityColors = {
                      low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                      medium: 'bg-indigo-50 text-indigo-700 border-indigo-100',
                      high: 'bg-rose-50 text-rose-700 border-rose-100'
                    };

                    return (
                      <motion.div
                        id={`task-card-${id}`}
                        key={id}
                        layout
                        className="bg-white rounded-xl border border-slate-200/70 p-4 shadow-sm hover:shadow-md transition-all space-y-3.5 relative"
                      >
                        {/* Title & Actions */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-800 leading-normal">{task.title}</h4>
                          
                          {user.role === 'developer' && (
                            <button
                              id={`delete-task-btn-${id}`}
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this milestone task?')) {
                                  onDeleteTask(id);
                                }
                              }}
                              className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer"
                              title="Delete Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Description */}
                        {task.description && (
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">
                            {task.description}
                          </p>
                        )}

                        {/* Badges / Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${priorityColors[task.priority || 'medium']}`}>
                            <Tag className="w-2.5 h-2.5" />
                            {task.priority}
                          </span>

                          {task.assignedTo && (
                            <span className="inline-flex items-center gap-1 text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200/60 max-w-[120px] truncate">
                              <UserCheck className="w-2.5 h-2.5 text-slate-500 flex-shrink-0" />
                              <span className="truncate">{task.assignedTo === user.email ? 'You' : task.assignedTo.split('@')[0]}</span>
                            </span>
                          )}

                          {task.dueDate && (
                            <span className="inline-flex items-center gap-1 text-[9px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200/50">
                              <Calendar className="w-2.5 h-2.5" />
                              {task.dueDate}
                            </span>
                          )}
                        </div>

                        {/* Progress controls (Satisfies click-based iframe safe progression) */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-2">
                          {/* Back Button */}
                          {col.id !== 'pending' ? (
                            <button
                              id={`move-task-back-${id}`}
                              onClick={() => moveTask(id, col.id, 'backward')}
                              className="flex items-center gap-0.5 text-[10px] font-semibold text-slate-500 hover:text-slate-800 p-1 hover:bg-slate-50 rounded cursor-pointer transition-colors"
                            >
                              <ArrowLeft className="w-3 h-3" />
                              Back
                            </button>
                          ) : (
                            <div className="w-1" />
                          )}

                          <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                            {col.id === 'pending' ? 'To Do' : col.id === 'in_progress' ? 'Running' : col.id === 'in_review' ? 'Reviewing' : 'Completed'}
                          </span>

                          {/* Forward Button */}
                          {col.id !== 'completed' ? (
                            <button
                              id={`move-task-forward-${id}`}
                              onClick={() => moveTask(id, col.id, 'forward')}
                              className="flex items-center gap-0.5 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded cursor-pointer transition-colors"
                            >
                              Next
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                              <Check className="w-3 h-3" />
                              Done
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
