import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, Users, Eye, CheckSquare, MessageSquare, Bell, ArrowRight, 
  Sparkles, Shield, Zap, Layers, ChevronRight, Play, Check, Server, X,
  Plus, Calendar, Maximize2, Minimize2, Laptop, Tablet, Smartphone, Tag, Info, Trash2, HelpCircle
} from 'lucide-react';

interface LandingPageProps {
  onNavigateToAuth: (mode: 'login' | 'signup') => void;
}

interface MockTask {
  id: string;
  title: string;
  milestoneId: 'm1' | 'm2';
  role: 'developer' | 'client';
  status: 'backlog' | 'progress' | 'review' | 'completed';
  assignee: string;
}

interface MockMilestone {
  id: 'm1' | 'm2';
  name: string;
  dueDate: string;
  description: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAuth }) => {
  const [activeTab, setActiveTab] = useState<'developer' | 'client'>('developer');
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'support' | null>(null);
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  // Hero Interactive Feedback Simulator States
  const [demoReviewMode, setDemoReviewMode] = useState(false);
  const [demoPins, setDemoPins] = useState([
    { id: 'dp1', x: 25, y: 18, text: 'Top navigation bar font size looks tiny on responsive mobile sizes. Let\'s fix it!', category: 'UI/Design', priority: 'High', reporter: 'Sarah (Client)' },
    { id: 'dp2', x: 72, y: 55, text: 'The main interactive button click here needs a hover scale transition.', category: 'Suggestion', priority: 'Medium', reporter: 'Alex (Dev)' }
  ]);
  const [demoHoverCoords, setDemoHoverCoords] = useState<{ x: number; y: number } | null>(null);
  const [demoClickCoords, setDemoClickCoords] = useState<{ x: number; y: number } | null>(null);
  const [demoInputText, setDemoInputText] = useState('');
  const [demoCategory, setDemoCategory] = useState<'UI/Design' | 'Bug' | 'Suggestion' | 'Copy/Text'>('UI/Design');
  const [demoPriority, setDemoPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [demoSelectedPin, setDemoSelectedPin] = useState<string | null>(null);
  const [demoDeviceMode, setDemoDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [demoFullScreen, setDemoFullScreen] = useState(false);

  const demoContainerRef = useRef<HTMLDivElement>(null);

  // Interactive Live Tasks & Milestone Board States
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<'m1' | 'm2'>('m1');
  const [tasks, setTasks] = useState<MockTask[]>([
    { id: 't1', title: 'Implement secure OAuth client routes', milestoneId: 'm1', role: 'developer', status: 'completed', assignee: 'Alex K.' },
    { id: 't2', title: 'Design customizable feedback canvas overlay', milestoneId: 'm1', role: 'developer', status: 'review', assignee: 'Alex K.' },
    { id: 't3', title: 'Validate payment checkout integration with Stripe', milestoneId: 'm1', role: 'developer', status: 'progress', assignee: 'Alex K.' },
    { id: 't4', title: 'Check font sizes and color contrast alignments', milestoneId: 'm1', role: 'client', status: 'backlog', assignee: 'Sarah M.' },
    { id: 't5', title: 'Setup automatic staging deploys with webhook', milestoneId: 'm2', role: 'developer', status: 'progress', assignee: 'Alex K.' },
    { id: 't6', title: 'Integrate real-time workspace push notifications', milestoneId: 'm2', role: 'client', status: 'backlog', assignee: 'Sarah M.' },
    { id: 't7', title: 'Add multi-user cursor alignment indicators', milestoneId: 'm2', role: 'client', status: 'backlog', assignee: 'Sarah M.' },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskRole, setNewTaskRole] = useState<'developer' | 'client'>('developer');

  const handleDemoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!demoReviewMode || demoClickCoords || !demoContainerRef.current) return;
    const rect = demoContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDemoHoverCoords({ x, y });
  };

  const handleDemoClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!demoReviewMode || !demoContainerRef.current) return;
    if ((e.target as HTMLElement).closest('.demo-form-box')) return;

    if (demoClickCoords) {
      setDemoClickCoords(null);
      return;
    }

    const rect = demoContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDemoClickCoords({ x, y });
    setDemoHoverCoords(null);
    setDemoInputText('');
  };

  const handleDemoSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoClickCoords || !demoInputText.trim()) return;

    const newPin = {
      id: `dp-${Date.now()}`,
      x: Math.round(demoClickCoords.x * 100) / 100,
      y: Math.round(demoClickCoords.y * 100) / 100,
      text: demoInputText.trim(),
      category: demoCategory,
      priority: demoPriority,
      reporter: 'You (Guest Client)'
    };

    setDemoPins([...demoPins, newPin]);
    setDemoClickCoords(null);
    setDemoInputText('');
  };

  const handleDemoDeletePin = (pinId: string) => {
    setDemoPins(prev => prev.filter(p => p.id !== pinId));
  };

  const mockMilestones: MockMilestone[] = [
    { id: 'm1', name: 'Milestone 1: Core App & Staging Setup', dueDate: 'July 25, 2026', description: 'Deploy basic functional components, user authentication flows, and initial client portal access.' },
    { id: 'm2', name: 'Milestone 2: Real-time Feedback & Canvas Annotations', dueDate: 'August 18, 2026', description: 'Integrate canvas overlay annotation dots, team group chats, and real-time review signals.' },
  ];

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: MockTask = {
      id: `custom-${Date.now()}`,
      title: newTaskTitle.trim(),
      milestoneId: selectedMilestoneId,
      role: newTaskRole,
      status: 'backlog',
      assignee: newTaskRole === 'developer' ? 'Alex K. (Dev)' : 'Sarah M. (Client)'
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const handleNextStatus = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const statusOrder: Array<MockTask['status']> = ['backlog', 'progress', 'review', 'completed'];
      const currentIndex = statusOrder.indexOf(t.status);
      const nextIndex = (currentIndex + 1) % statusOrder.length;
      return { ...t, status: statusOrder[nextIndex] };
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="landing-page" className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Dynamic Navbar */}
      <nav id="landing-nav" className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">DevFlw</span>
              <span className="text-[10px] block font-semibold text-indigo-600 leading-none">Collaboration Platform</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#solutions" onClick={(e) => scrollToSection(e, 'solutions')} className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Solutions</a>
            <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#security" onClick={(e) => scrollToSection(e, 'security')} className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Privacy & Security</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="nav-login-btn"
              onClick={() => onNavigateToAuth('login')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 py-2 px-4 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              id="nav-signup-btn"
              onClick={() => onNavigateToAuth('signup')}
              className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg shadow-sm shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Header Banner */}
      <header className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-indigo-50/40 via-white to-slate-50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200/15 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-emerald-150/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Empowering Developer-Client Co-Creation
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none"
          >
            Bridge the gap between <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">
              Code and Client Feedback
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            DevFlw matches beautiful live deployment sandboxes with dynamic canvas annotation pins, team milestones Kanban board, and instant alignment chats. No more lost email chains or unclear requirements.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
          >
            <button
              id="hero-get-started-btn"
              onClick={() => onNavigateToAuth('signup')}
              className="w-full sm:w-auto py-3.5 px-7 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/15 hover:shadow-lg hover:shadow-indigo-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Get Started for Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="w-full sm:w-auto py-3.5 px-6 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm transition-all text-center cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-slate-600 text-slate-600" />
              Watch Demo
            </a>
          </motion.div>

          {/* Interactive visual mockup container */}
          <motion.div
            id="how-it-works"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-12"
          >
            <div className="relative bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-2xl shadow-indigo-950/10 max-w-4xl mx-auto space-y-4">
              {/* Simulator Toolbar Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 text-left">
                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-400 ml-2">sandbox://preview-mode</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Device toggle simulation */}
                  <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setDemoDeviceMode('desktop')}
                      className={`p-1 rounded-md transition-all cursor-pointer ${demoDeviceMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Simulate Desktop View"
                    >
                      <Laptop className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDemoDeviceMode('tablet')}
                      className={`p-1 rounded-md transition-all cursor-pointer ${demoDeviceMode === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Simulate Tablet View"
                    >
                      <Tablet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDemoDeviceMode('mobile')}
                      className={`p-1 rounded-md transition-all cursor-pointer ${demoDeviceMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Simulate Mobile View"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Review mode toggle */}
                  <button
                    onClick={() => {
                      setDemoReviewMode(!demoReviewMode);
                      setDemoClickCoords(null);
                      setDemoHoverCoords(null);
                    }}
                    className={`flex items-center gap-1.5 py-1 px-3 text-[11px] font-bold rounded-lg border cursor-pointer transition-all ${
                      demoReviewMode
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-sm ring-1 ring-rose-500/10'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {demoReviewMode ? 'Review Mode: Active' : 'Enable Review Mode'}
                  </button>

                  {/* Full screen toggle */}
                  <button
                    onClick={() => setDemoFullScreen(true)}
                    className="flex items-center gap-1 py-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3" />
                    Full Screen Simulator
                  </button>
                </div>
              </div>

              {/* Main Workspace Frame */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {/* Column 1: Interactive Canvas */}
                <div className="md:col-span-2 flex flex-col items-center justify-center bg-slate-950 rounded-xl overflow-hidden min-h-[300px] p-4 relative border border-slate-800">
                  
                  {/* Outer framework container for simulation widths */}
                  <div 
                    ref={demoContainerRef}
                    onMouseMove={handleDemoMouseMove}
                    onMouseLeave={() => setDemoHoverCoords(null)}
                    onClick={handleDemoClickCapture}
                    className={`bg-slate-900 rounded-lg p-5 border border-slate-800 select-none relative transition-all duration-300 ${
                      demoDeviceMode === 'mobile' ? 'w-full max-w-[280px]' : demoDeviceMode === 'tablet' ? 'w-full max-w-[420px]' : 'w-full'
                    }`}
                    style={{ minHeight: '260px' }}
                  >
                    {/* Mock Website Preview Design */}
                    <div className="space-y-4">
                      {/* Nav Mock */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-extrabold text-[9px] text-slate-300">ClientApp Mock</span>
                        <div className="flex gap-1">
                          <div className="w-6 h-1.5 bg-slate-800 rounded" />
                          <div className="w-6 h-1.5 bg-slate-800 rounded" />
                          <div className="w-6 h-1.5 bg-slate-800 rounded" />
                        </div>
                      </div>

                      {/* Content Mock */}
                      <div className="space-y-2">
                        <div className="h-4 bg-gradient-to-r from-indigo-500/20 to-indigo-500/5 rounded w-1/2" />
                        <div className="h-2 bg-slate-800 rounded w-5/6" />
                        <div className="h-2 bg-slate-800 rounded w-3/4" />
                      </div>

                      {/* Banner Mock */}
                      <div className="h-16 bg-slate-950/40 rounded border border-slate-800 p-3 flex flex-col justify-center">
                        <p className="text-[9px] text-slate-400">Interactive live viewport simulation. Click anywhere with Review Mode active to test client annotations.</p>
                      </div>

                      <div className="flex justify-end">
                        <div className="h-6 w-16 bg-indigo-600 rounded-md" />
                      </div>
                    </div>

                    {/* Capturing Layer */}
                    {demoReviewMode && (
                      <div className="absolute inset-0 bg-transparent cursor-crosshair z-10 hover:bg-indigo-600/[0.01]" />
                    )}

                    {/* Hover Floating Pin */}
                    {demoReviewMode && demoHoverCoords && !demoClickCoords && (
                      <div
                        className="absolute w-5 h-5 border border-dashed border-rose-500 bg-rose-500/10 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
                        style={{ left: `${demoHoverCoords.x}%`, top: `${demoHoverCoords.y}%` }}
                      >
                        <div className="w-1 h-1 bg-rose-500 rounded-full animate-ping" />
                      </div>
                    )}

                    {/* Plotted Pins */}
                    {demoPins.map((dp, idx) => {
                      const isSelected = demoSelectedPin === dp.id;
                      const bulletColor = dp.category === 'Bug' ? 'bg-rose-500' : dp.category === 'UI/Design' ? 'bg-violet-500' : 'bg-cyan-500';
                      return (
                        <button
                          key={dp.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDemoSelectedPin(isSelected ? null : dp.id);
                          }}
                          className={`absolute w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] text-white -translate-x-1/2 -translate-y-1/2 z-25 shadow-lg cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-rose-500 ring-2 ring-white scale-110' 
                              : `${bulletColor} hover:scale-110`
                          }`}
                          style={{ left: `${dp.x}%`, top: `${dp.y}%` }}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}

                    {/* Interactive Click placement Tooltip popup */}
                    {demoReviewMode && demoClickCoords && (
                      <div 
                        className="absolute z-30 demo-form-box -translate-x-1/2"
                        style={{ 
                          left: `${demoClickCoords.x}%`, 
                          top: `${demoClickCoords.y}%`,
                          transform: `translate(${demoClickCoords.x > 70 ? '-80%' : demoClickCoords.x < 30 ? '10%' : '-50%'}, 10px)`
                        }}
                      >
                        <div className="bg-white rounded-lg shadow-xl border border-slate-200 p-3 w-56 space-y-2 relative text-slate-800">
                          <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-wider text-indigo-600">
                            <span className="flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5" />
                              Add Pin
                            </span>
                            <span className="text-slate-400 font-mono">X:{Math.round(demoClickCoords.x)}% Y:{Math.round(demoClickCoords.y)}%</span>
                          </div>

                          <form onSubmit={handleDemoSubmitFeedback} className="space-y-2 text-left">
                            <div className="grid grid-cols-2 gap-1.5 text-[8px]">
                              <select
                                value={demoCategory}
                                onChange={(e) => setDemoCategory(e.target.value as any)}
                                className="w-full bg-slate-50 border border-slate-200 rounded p-1 outline-none text-[9px]"
                              >
                                <option value="UI/Design">UI/Design</option>
                                <option value="Bug">Bug</option>
                                <option value="Suggestion">Suggestion</option>
                                <option value="Copy/Text">Copy/Text</option>
                              </select>
                              <select
                                value={demoPriority}
                                onChange={(e) => setDemoPriority(e.target.value as any)}
                                className="w-full bg-slate-50 border border-slate-200 rounded p-1 outline-none text-[9px]"
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                              </select>
                            </div>

                            <input
                              type="text"
                              required
                              placeholder="e.g. Center this container"
                              value={demoInputText}
                              onChange={(e) => setDemoInputText(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-[9px] text-slate-800 placeholder:text-slate-400 outline-none"
                            />

                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setDemoClickCoords(null)}
                                className="px-1.5 py-0.5 bg-slate-100 text-[8px] rounded hover:bg-slate-200 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] rounded hover:bg-indigo-700 cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Feedback Log List */}
                <div className="space-y-2.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Live Sandbox Pins Log</span>
                  <div className="space-y-2 overflow-y-auto max-h-[260px] pr-1">
                    {demoPins.length === 0 ? (
                      <div className="text-center py-10 text-slate-500 text-[10px] flex flex-col justify-center items-center gap-2">
                        <HelpCircle className="w-8 h-8 text-slate-700" />
                        <p>No active pins. Enable Review Mode above and click coordinates to place pins!</p>
                      </div>
                    ) : (
                      demoPins.map((dp, idx) => {
                        const isSelected = demoSelectedPin === dp.id;
                        const catColor = dp.category === 'Bug' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : dp.category === 'UI/Design' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
                        const prioColor = dp.priority === 'High' ? 'text-rose-400 font-bold' : dp.priority === 'Medium' ? 'text-amber-400' : 'text-emerald-400';
                        return (
                          <div 
                            key={dp.id}
                            onClick={() => setDemoSelectedPin(isSelected ? null : dp.id)}
                            className={`p-2.5 bg-slate-900 border rounded-lg transition-all cursor-pointer space-y-1.5 ${
                              isSelected ? 'border-indigo-500/70 bg-indigo-950/20 shadow-md' : 'border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="w-4 h-4 bg-slate-800 text-slate-300 font-bold text-[9px] rounded-full flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <span className="text-[9px] text-slate-300 font-semibold">{dp.reporter}</span>
                              </div>

                              <span className={`text-[8px] border px-1.5 rounded uppercase tracking-wider font-extrabold ${catColor}`}>
                                {dp.category}
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-400 leading-relaxed break-words">{dp.text}</p>

                            <div className="flex justify-between items-center text-[8px] text-slate-500 font-mono pt-1 border-t border-slate-850">
                              <span>Coords: {Math.round(dp.x)}%, {Math.round(dp.y)}%</span>
                              <div className="flex items-center gap-2">
                                <span className={`flex items-center gap-0.5 ${prioColor}`}>
                                  <Info className="w-2 h-2" />
                                  {dp.priority}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDemoDeletePin(dp.id);
                                  }}
                                  className="text-slate-500 hover:text-rose-400 transition-colors p-0.5 rounded cursor-pointer"
                                  title="Delete Pin"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Immersive Sandbox Simulator Fullscreen modal */}
          <AnimatePresence>
            {demoFullScreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950 z-[100] flex flex-col p-4 md:p-8 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2.5 text-left">
                    <span className="p-2 bg-indigo-600/10 border border-indigo-500/25 text-indigo-400 rounded-lg">
                      <Layers className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">Interactive Sandbox Simulator (Immersive View)</h3>
                      <p className="text-xs text-slate-400">Click anywhere to leave visual comment pins. Test responsive device views on the fly.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setDemoFullScreen(false)}
                    className="p-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Minimize2 className="w-4 h-4" />
                    Close Sandbox
                  </button>
                </div>

                {/* Inner Simulator view */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 overflow-hidden">
                  {/* Canvas (3 cols) */}
                  <div className="md:col-span-3 flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-y-auto">
                    
                    {/* Device Selector on top */}
                    <div className="absolute top-4 right-4 flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 z-30">
                      <button
                        onClick={() => setDemoDeviceMode('desktop')}
                        className={`p-2 rounded-md transition-all cursor-pointer ${demoDeviceMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        title="Desktop view"
                      >
                        <Laptop className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDemoDeviceMode('tablet')}
                        className={`p-2 rounded-md transition-all cursor-pointer ${demoDeviceMode === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        title="Tablet view"
                      >
                        <Tablet className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDemoDeviceMode('mobile')}
                        className={`p-2 rounded-md transition-all cursor-pointer ${demoDeviceMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        title="Mobile view"
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Review mode state badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 z-30">
                      <button
                        onClick={() => {
                          setDemoReviewMode(!demoReviewMode);
                          setDemoClickCoords(null);
                          setDemoHoverCoords(null);
                        }}
                        className={`flex items-center gap-1.5 py-1.5 px-3.5 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                          demoReviewMode
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 ring-1 ring-rose-500/10'
                            : 'bg-slate-950 hover:bg-slate-950/80 text-slate-300 border-slate-800'
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                        {demoReviewMode ? 'Review Mode: Active' : 'Enable Review Mode'}
                      </button>
                    </div>

                    {/* Simulated webpage content area */}
                    <div 
                      ref={demoContainerRef}
                      onMouseMove={handleDemoMouseMove}
                      onMouseLeave={() => setDemoHoverCoords(null)}
                      onClick={handleDemoClickCapture}
                      className={`bg-slate-950 rounded-2xl p-8 border border-slate-800 select-none relative transition-all duration-300 flex flex-col justify-between ${
                        demoDeviceMode === 'mobile' ? 'w-full max-w-[340px] h-[520px]' : demoDeviceMode === 'tablet' ? 'w-full max-w-[580px] h-[520px]' : 'w-full h-[520px]'
                      }`}
                    >
                      {/* Nav */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <span className="font-extrabold text-xs text-slate-200">DevFlw Staging Sandbox</span>
                        <div className="flex gap-2">
                          <div className="w-12 h-2 bg-slate-800 rounded" />
                          <div className="w-12 h-2 bg-slate-800 rounded" />
                        </div>
                      </div>

                      {/* Main Section */}
                      <div className="space-y-4 my-auto">
                        <div className="h-6 bg-gradient-to-r from-indigo-500/40 to-indigo-500/5 rounded w-2/3" />
                        <div className="h-3 bg-slate-800 rounded w-full" />
                        <div className="h-3 bg-slate-800 rounded w-5/6" />
                        <div className="h-20 bg-slate-900 border border-slate-850 rounded-xl p-4 flex items-center text-slate-400 text-xs leading-relaxed">
                          This is a high-fidelity fully functional live canvas simulator. With DevFlw, developers deploy real-time previews, and clients can visually click anywhere on the interface to leave pinpoint design coordinates.
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-800 pt-3 text-[10px] text-slate-500">
                        <span>Powered by DevFlw engine</span>
                        <div className="h-8 w-24 bg-indigo-600 rounded-lg" />
                      </div>

                      {/* Review active cursor layer */}
                      {demoReviewMode && (
                        <div className="absolute inset-0 bg-transparent cursor-crosshair z-10" />
                      )}

                      {/* Hover Floating Pin */}
                      {demoReviewMode && demoHoverCoords && !demoClickCoords && (
                        <div
                          className="absolute w-6 h-6 border-2 border-dashed border-rose-500 bg-rose-500/10 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
                          style={{ left: `${demoHoverCoords.x}%`, top: `${demoHoverCoords.y}%` }}
                        >
                          <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                        </div>
                      )}

                      {/* Plotted Pins */}
                      {demoPins.map((dp, idx) => {
                        const isSelected = demoSelectedPin === dp.id;
                        const bulletColor = dp.category === 'Bug' ? 'bg-rose-500' : dp.category === 'UI/Design' ? 'bg-violet-500' : 'bg-cyan-500';
                        return (
                          <button
                            key={dp.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDemoSelectedPin(isSelected ? null : dp.id);
                            }}
                            className={`absolute w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-white -translate-x-1/2 -translate-y-1/2 z-25 shadow-xl cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-rose-500 ring-4 ring-rose-500/30 scale-110 animate-pulse' 
                                : `${bulletColor} hover:scale-110 ring-2 ring-white`
                            }`}
                            style={{ left: `${dp.x}%`, top: `${dp.y}%` }}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}

                      {/* Interactive click placement Tooltip popup */}
                      {demoReviewMode && demoClickCoords && (
                        <div 
                          className="absolute z-30 demo-form-box -translate-x-1/2"
                          style={{ 
                            left: `${demoClickCoords.x}%`, 
                            top: `${demoClickCoords.y}%`,
                            transform: `translate(${demoClickCoords.x > 70 ? '-80%' : demoClickCoords.x < 30 ? '10%' : '-50%'}, 10px)`
                          }}
                        >
                          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-4 w-64 space-y-3 text-slate-800">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                Add Mock Pin
                              </span>
                              <span className="text-slate-400 font-mono">X:{Math.round(demoClickCoords.x)}% Y:{Math.round(demoClickCoords.y)}%</span>
                            </div>

                            <form onSubmit={handleDemoSubmitFeedback} className="space-y-3 text-left">
                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div>
                                  <label className="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">Category</label>
                                  <select
                                    value={demoCategory}
                                    onChange={(e) => setDemoCategory(e.target.value as any)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded p-1 outline-none text-xs"
                                  >
                                    <option value="UI/Design">UI/Design</option>
                                    <option value="Bug">Bug</option>
                                    <option value="Suggestion">Suggestion</option>
                                    <option value="Copy/Text">Copy/Text</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">Priority</label>
                                  <select
                                    value={demoPriority}
                                    onChange={(e) => setDemoPriority(e.target.value as any)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded p-1 outline-none text-xs"
                                  >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">Remark</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="Explain request..."
                                  value={demoInputText}
                                  onChange={(e) => setDemoInputText(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-800 outline-none"
                                />
                              </div>

                              <div className="flex justify-end gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setDemoClickCoords(null)}
                                  className="px-2 py-0.5 bg-slate-100 text-[10px] rounded hover:bg-slate-200 cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-2.5 py-0.5 bg-indigo-600 text-white text-[10px] rounded hover:bg-indigo-700 cursor-pointer"
                                >
                                  Save
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sidebar Pins thread list (1 col) */}
                  <div className="bg-white rounded-2xl p-4 flex flex-col h-full overflow-hidden text-slate-800">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">
                      Interactive Pin Threads ({demoPins.length})
                    </h4>
                    
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                      {demoPins.map((dp, idx) => {
                        const isSelected = demoSelectedPin === dp.id;
                        const catColor = dp.category === 'Bug' ? 'bg-rose-50 text-rose-600 border-rose-100' : dp.category === 'UI/Design' ? 'bg-violet-50 text-violet-600 border-violet-100' : 'bg-cyan-50 text-cyan-600 border-cyan-100';
                        const prioColor = dp.priority === 'High' ? 'text-rose-600 font-bold' : dp.priority === 'Medium' ? 'text-amber-600' : 'text-emerald-600';
                        return (
                          <div
                            key={dp.id}
                            onClick={() => setDemoSelectedPin(isSelected ? null : dp.id)}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all space-y-1.5 ${
                              isSelected ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-100 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 font-mono">Pin #{idx + 1}</span>
                              <span className={`text-[8px] border px-1.5 rounded uppercase tracking-wider font-extrabold ${catColor}`}>
                                {dp.category}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-sans">{dp.text}</p>
                            <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono border-t border-slate-100 pt-1.5">
                              <span>Coords: {Math.round(dp.x)}%, {Math.round(dp.y)}%</span>
                              <span className={prioColor}>{dp.priority}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Features Grid Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block">Core Platform Modules</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Everything you need to deliver excellence.</h2>
            <p className="text-xs text-slate-500">Simple, single-view collaborative dashboard designed specifically to protect privacy and optimize product cycles.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/50 hover:border-indigo-200 hover:bg-indigo-50/10 transition-all space-y-4 group">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center transition-all group-hover:scale-110">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Pinpoint Feedback Canvas</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enable Review Mode to click anywhere directly on the prototype viewport and log location-aware comments. No more guess-work.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/50 hover:border-indigo-200 hover:bg-indigo-50/10 transition-all space-y-4 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center transition-all group-hover:scale-110">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Project Milestone Board</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Visual Kanban board designed to track developer tasks, backlog items, client review iterations, and completions instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/50 hover:border-indigo-200 hover:bg-indigo-50/10 transition-all space-y-4 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center transition-all group-hover:scale-110">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Team Workspace Chat</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct chat channels tied straight to the project context to ensure both developer and client can align in absolute clarity.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/50 hover:border-indigo-200 hover:bg-indigo-50/10 transition-all space-y-4 group">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center transition-all group-hover:scale-110">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Push Notification Center</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Interactive real-time notifications about team chat inputs, client review signals, or milestone status adjustments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Milestones & Kanban Tasks Board Simulator */}
      <section id="milestones-simulator" className="py-20 bg-slate-50 border-t border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block">Interactive Live Simulator</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Interactive Milestone & Tasks Board</h2>
            <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
              Experience the core workflow first-hand. Click on any milestone, add custom tasks, or click action tags on the cards below to dynamically move tasks across stages and watch the progress bars update in real time!
            </p>
          </div>

          {/* Milestone Selection Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockMilestones.map((ms) => {
                const milestoneTasks = tasks.filter(t => t.milestoneId === ms.id);
                const completedCount = milestoneTasks.filter(t => t.status === 'completed').length;
                const progressPct = milestoneTasks.length ? Math.round((completedCount / milestoneTasks.length) * 100) : 0;
                const isActive = selectedMilestoneId === ms.id;

                return (
                  <button
                    key={ms.id}
                    onClick={() => setSelectedMilestoneId(ms.id)}
                    className={`text-left p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                      isActive 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1.5">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-indigo-500 text-white border border-indigo-400/30' : 'bg-slate-200/70 text-slate-600'
                        }`}>
                          {ms.id === 'm1' ? 'Phase 1' : 'Phase 2'}
                        </span>
                        <h3 className="font-bold text-sm tracking-tight">{ms.name}</h3>
                        <p className={`text-[11px] leading-relaxed line-clamp-2 ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                          {ms.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar Inside Milestone Tab */}
                    <div className="mt-4 pt-3 border-t border-current/10 space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          Due: {ms.dueDate}
                        </span>
                        <span>{progressPct}% Completed ({completedCount}/{milestoneTasks.length} tasks)</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isActive ? 'bg-indigo-700/50' : 'bg-slate-200'}`}>
                        <div 
                          className={`h-full transition-all duration-500 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-indigo-600'}`} 
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Task Creation mini-form */}
            <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl">
              <form onSubmit={handleAddTask} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-grow space-y-1.5 w-full">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quick Add Simulator Task</label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Polish active viewport zoom controls..."
                    className="w-full text-xs py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 font-sans"
                  />
                </div>
                
                <div className="w-full md:w-48 space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Logged By Role</label>
                  <select
                    value={newTaskRole}
                    onChange={(e) => setNewTaskRole(e.target.value as 'developer' | 'client')}
                    className="w-full text-xs py-2 px-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 font-sans"
                  >
                    <option value="developer">Developer (Alex K.)</option>
                    <option value="client">Client Feedback (Sarah M.)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full md:w-auto py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/15 h-9"
                >
                  <Plus className="w-4 h-4" />
                  Add to Backlog
                </button>
              </form>
            </div>

            {/* Interactive Kanban Board Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              
              {/* Backlog Column */}
              <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-200/60 flex flex-col min-h-[300px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 mb-3">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">📋 Backlog</span>
                  <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                    {tasks.filter(t => t.milestoneId === selectedMilestoneId && t.status === 'backlog').length}
                  </span>
                </div>
                <div className="space-y-2.5 flex-grow overflow-y-auto max-h-[380px] pr-1">
                  {tasks.filter(t => t.milestoneId === selectedMilestoneId && t.status === 'backlog').map(task => (
                    <div key={task.id} className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3 shadow-xs space-y-2.5 transition-all group relative">
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          task.role === 'developer' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {task.role === 'developer' ? 'Dev Task' : 'Client Feedback'}
                        </span>
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-medium text-slate-800 leading-snug">{task.title}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                        <span className="font-semibold">By: {task.assignee}</span>
                        <button
                          onClick={() => handleNextStatus(task.id)}
                          className="py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-[9px] rounded-lg transition-colors cursor-pointer"
                        >
                          Start Work →
                        </button>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => t.milestoneId === selectedMilestoneId && t.status === 'backlog').length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
                      <p className="text-[10px]">No backlog tasks. Type in the input form above to add custom cards!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-200/60 flex flex-col min-h-[300px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 mb-3">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">⚡ In Progress</span>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    {tasks.filter(t => t.milestoneId === selectedMilestoneId && t.status === 'progress').length}
                  </span>
                </div>
                <div className="space-y-2.5 flex-grow overflow-y-auto max-h-[380px] pr-1">
                  {tasks.filter(t => t.milestoneId === selectedMilestoneId && t.status === 'progress').map(task => (
                    <div key={task.id} className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3 shadow-xs space-y-2.5 transition-all group relative">
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          task.role === 'developer' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {task.role === 'developer' ? 'Dev Task' : 'Client Feedback'}
                        </span>
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-medium text-slate-800 leading-snug">{task.title}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                        <span className="font-semibold">By: {task.assignee}</span>
                        <button
                          onClick={() => handleNextStatus(task.id)}
                          className="py-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[9px] rounded-lg transition-colors cursor-pointer"
                        >
                          Review →
                        </button>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => t.milestoneId === selectedMilestoneId && t.status === 'progress').length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
                      <p className="text-[10px]">No active work cards. Action backlog tasks to transition them here!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Client Review Column */}
              <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-200/60 flex flex-col min-h-[300px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 mb-3">
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">👀 Client Review</span>
                  <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                    {tasks.filter(t => t.milestoneId === selectedMilestoneId && t.status === 'review').length}
                  </span>
                </div>
                <div className="space-y-2.5 flex-grow overflow-y-auto max-h-[380px] pr-1">
                  {tasks.filter(t => t.milestoneId === selectedMilestoneId && t.status === 'review').map(task => (
                    <div key={task.id} className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3 shadow-xs space-y-2.5 transition-all group relative">
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          task.role === 'developer' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {task.role === 'developer' ? 'Dev Task' : 'Client Feedback'}
                        </span>
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-medium text-slate-800 leading-snug">{task.title}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                        <span className="font-semibold">By: {task.assignee}</span>
                        <button
                          onClick={() => handleNextStatus(task.id)}
                          className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold text-[9px] rounded-lg transition-colors cursor-pointer"
                        >
                          Approve ✓
                        </button>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => t.milestoneId === selectedMilestoneId && t.status === 'review').length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
                      <p className="text-[10px]">No cards pending review. Developers submit finished builds here for feedback.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Completed Column */}
              <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-200/60 flex flex-col min-h-[300px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 mb-3">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">✅ Completed</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    {tasks.filter(t => t.milestoneId === selectedMilestoneId && t.status === 'completed').length}
                  </span>
                </div>
                <div className="space-y-2.5 flex-grow overflow-y-auto max-h-[380px] pr-1">
                  {tasks.filter(t => t.milestoneId === selectedMilestoneId && t.status === 'completed').map(task => (
                    <div key={task.id} className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3 shadow-xs space-y-2.5 transition-all group relative">
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          task.role === 'developer' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {task.role === 'developer' ? 'Dev Task' : 'Client Feedback'}
                        </span>
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-medium text-slate-800 leading-snug line-through text-slate-500">{task.title}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                        <span className="font-semibold text-emerald-600 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Fully Approved
                        </span>
                        <button
                          onClick={() => handleNextStatus(task.id)}
                          className="py-1 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-[9px] rounded-lg transition-colors cursor-pointer"
                        >
                          Reset ↺
                        </button>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => t.milestoneId === selectedMilestoneId && t.status === 'completed').length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
                      <p className="text-[10px]">No completed tasks yet. Check and approve pending reviews to achieve milestone completion!</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Solutions Segment / Tabs */}
      <section id="solutions" className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block">Role-specific Workflows</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Designed for both sides of the product cycle.</h2>
            <p className="text-xs text-slate-500">Switch tabs below to see how DevFlw streamlines work for your specific role.</p>
          </div>

          <div className="flex justify-center">
            <div className="bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-1">
              <button
                onClick={() => setActiveTab('developer')}
                className={`flex items-center gap-2 py-2 px-6 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'developer'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Code className="w-4 h-4" />
                For Developers
              </button>
              <button
                onClick={() => setActiveTab('client')}
                className={`flex items-center gap-2 py-2 px-6 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'client'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                For Clients
              </button>
            </div>
          </div>

          {/* Tab content area */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {activeTab === 'developer' ? (
              <>
                <div className="space-y-6">
                  <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    <Zap className="w-3 h-3 animate-pulse" />
                    Frictionless Delivery
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">Stop deciphering vague customer screen clips.</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    As a software builder, linking your staging/demo URL provides clients with a real-time responsive staging site inside their secure portal. Clients pinpoint issues directly where they occur.
                  </p>
                  
                  <ul className="space-y-3">
                    {['Zero client installations or custom extensions required', 'Instantly track, categorize, and prioritize bug requests', 'Coordinate tasks on a clean milestone-focused backlog board'].map((text, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <span className="p-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded">
                          <Check className="w-3 h-3" />
                        </span>
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/50 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Server className="w-3.5 h-3.5 text-indigo-500" />
                      Live Link Configurations
                    </span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">Staging Active</span>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Linked Demo Address</label>
                    <div className="bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-mono text-slate-700 truncate shadow-inner">
                      https://devflw-demo-staging.web.app
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">Update this address at any stage during the project to sync new code features instantly for review.</p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-6">
                  <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    <Layers className="w-3 h-3" />
                    Crystal Clear Reviews
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">Visual feedback made as simple as clicking.</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Provide exact instructions to your engineering partner without sending separate doc files. Load the live portal, enable review mode, and place comments directly on the feature that needs adjustments.
                  </p>
                  
                  <ul className="space-y-3">
                    {['Direct spatial coordination points right on the screen layout', 'Track milestone backlogs without complicated technical software dashboards', 'Maintain a dedicated communication record for client review cycles'].map((text, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <span className="p-0.5 bg-rose-50 border border-rose-100 text-rose-600 rounded">
                          <Check className="w-3 h-3" />
                        </span>
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-rose-50/20 p-6 rounded-xl border border-rose-100/50 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-200/10 rounded-full blur-xl" />
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 uppercase tracking-wider inline-block">
                    Pinpoint Review Example
                  </span>
                  <p className="text-xs font-medium text-slate-700 leading-normal">
                    "This payment form needs a more expressive loading spinner or visual checkout success checkmark."
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-rose-100/30">
                    <span>X: 62% Y: 48% (Near Form Button)</span>
                    <span className="text-rose-500 font-bold">Unresolved Pin</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Security and Privacy Segment (Privacy system) */}
      <section id="security" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative z-10">
              <div className="md:col-span-2 space-y-4">
                <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5" />
                  Privacy & Access Controls Verified
                </span>
                <h3 className="text-2xl font-bold tracking-tight">Security-First Staging Environment</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  To safeguard intellectual property, workspace structures can only be accessed by authorized Developers and registered Clients. Strict workspace partition controls and invite-only protocols are enforced to ensure maximum developer-client privacy.
                </p>
              </div>

              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                  <Shield className="w-10 h-10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Join Banner */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-indigo-50/30 border-t border-slate-200/55">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
            Ready to experience frictionless development?
          </h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-lg mx-auto">
            Get started as a Builder to invite your first client, or log in using credentials provided by your team manager.
          </p>
          <div className="pt-4">
            <button
              id="cta-join-free-btn"
              onClick={() => onNavigateToAuth('signup')}
              className="py-3 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              Get Started for Free
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 px-6 border-t border-slate-900 text-xs">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Top segment with multi-column structure */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            
            {/* Branding Column */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  <Code className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-extrabold text-white text-base tracking-tight">DevFlw</span>
                  <span className="text-[10px] block font-semibold text-indigo-400 leading-none">Collaboration Platform</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Empowering world-class software builders and clients to collaborate dynamically with visual pinpointing, agile feedback tracking, and secure sandbox spaces.
              </p>
            </div>

            {/* Resources Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Features</h4>
              <ul className="space-y-2 text-[11px]">
                <li><a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-indigo-400 transition-colors cursor-pointer">Pinpoint Comments</a></li>
                <li><a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-indigo-400 transition-colors cursor-pointer">Milestone Kanban</a></li>
                <li><a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-indigo-400 transition-colors cursor-pointer">Direct Team Chat</a></li>
                <li><a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-indigo-400 transition-colors cursor-pointer">Sandbox Viewport</a></li>
              </ul>
            </div>

            {/* Platform Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Privacy & Trust</h4>
              <ul className="space-y-2 text-[11px]">
                <li><a href="#security" onClick={(e) => scrollToSection(e, 'security')} className="hover:text-indigo-400 transition-colors cursor-pointer">Invite-only Access</a></li>
                <li><a href="#security" onClick={(e) => scrollToSection(e, 'security')} className="hover:text-indigo-400 transition-colors cursor-pointer">Developer Verification</a></li>
                <li><a href="#security" onClick={(e) => scrollToSection(e, 'security')} className="hover:text-indigo-400 transition-colors cursor-pointer">Secure Sandboxing</a></li>
                <li><a href="#security" onClick={(e) => scrollToSection(e, 'security')} className="hover:text-indigo-400 transition-colors cursor-pointer">Workspace Isolation</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom copyright and legal links bar */}
          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-[10px] text-slate-500">
              &copy; {new Date().getFullYear()} DevFlw Platform. All rights reserved. Designed to elevate developer-client alignment.
            </p>

            <div className="flex gap-6 text-[10px]">
              <button onClick={() => { setActiveModal('privacy'); }} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-[10px]">Privacy Policy</button>
              <button onClick={() => { setActiveModal('terms'); }} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-[10px]">Terms of Service</button>
              <button onClick={() => { setActiveModal('support'); setSupportSubmitted(false); }} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-[10px]">Support Portal</button>
            </div>
          </div>

        </div>
      </footer>

      {/* Interactive Modal Overlays for Legal and Support */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200/80 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider">
                {activeModal === 'privacy' ? 'Privacy Policy' : activeModal === 'terms' ? 'Terms of Service' : 'Support Portal'}
              </h3>
              <button 
                onClick={() => { setActiveModal(null); setSupportSubmitted(false); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeModal === 'privacy' && (
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p className="font-bold text-slate-950 text-xs">Last Updated: July 2026</p>
                <p>At DevFlw, we prioritize your project confidentiality and source security above all else. This Privacy Policy details our commitment to securing sensitive developer code staging connections and client feedback data.</p>
                <h4 className="font-bold text-slate-950">1. Data Storage & Hosting</h4>
                <p>All active staging site URLs, annotation locations, message history, and milestone progress status coordinates are hosted securely within partitioned environments. We employ secure cloud sandboxes to prevent cross-account exposure.</p>
                <h4 className="font-bold text-slate-950">2. Staging Protection</h4>
                <p>Live sandbox prototypes are exclusively visible to authorized, logged-in project creators (Developers) and their direct invited client workspace partners.</p>
                <h4 className="font-bold text-slate-950">3. Contact and Queries</h4>
                <p>If you have questions about workspace isolation, database security measures, or data exports, please submit a ticket through our Support Portal.</p>
              </div>
            )}

            {activeModal === 'terms' && (
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p className="font-bold text-slate-950 text-xs">Last Updated: July 2026</p>
                <p>By entering and using the DevFlw workspace collaboration software, you agree to comply with the following standard platform guidelines:</p>
                <h4 className="font-bold text-slate-950">1. Workspace Usage & Invitations</h4>
                <p>Developers are authorized to invite clients to active projects. Both parties are fully responsible for maintaining strict access control of workspace authentication passwords and session tokens.</p>
                <h4 className="font-bold text-slate-950">2. Allowed Content & Links</h4>
                <p>Users must only link active staging, development, or design addresses that they have full ownership of or explicit build permission to use. Uploading malicious tracking scripts or copyrighted material is strictly prohibited.</p>
                <h4 className="font-bold text-slate-950">3. Workspace Limits</h4>
                <p>To preserve operational efficiency, standard accounts can host active viewport pin boards, chats, and task histories within reasonable usage metrics. DevFlw reserves the right to archive dormant projects.</p>
              </div>
            )}

            {activeModal === 'support' && (
              <div className="space-y-4">
                {supportSubmitted ? (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Ticket Submitted Successfully!</h4>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Thank you for reaching out! Our dedicated team will analyze your ticket and respond via email within 24 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setActiveModal(null); setSupportSubmitted(false); }}
                      className="mt-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (supportEmail.trim() && supportMessage.trim()) {
                      setSupportSubmitted(true);
                      setSupportEmail('');
                      setSupportMessage('');
                    }
                  }} className="space-y-4">
                    <p className="text-xs text-slate-500">
                      Have a question, feedback, or custom request? Send our core engineering team a direct ticket below!
                    </p>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Your Email Address</label>
                      <input
                        type="email"
                        required
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Describe Your Issue or Request</label>
                      <textarea
                        required
                        rows={4}
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        placeholder="Tell us what you need help with (e.g. project setup, invite issue, data export...)"
                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-sans resize-none"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="py-2 px-4 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-lg transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                      >
                        Submit Support Ticket
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
