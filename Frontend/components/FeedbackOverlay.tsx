import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, ToggleLeft, MessageSquare, Check, Trash2, HelpCircle, 
  Sparkles, CheckCircle2, ChevronRight, AlertCircle, RefreshCw, Layers,
  Maximize2, Minimize2, Laptop, Tablet, Smartphone, Search, Filter, Tag, Info
} from 'lucide-react';
import { Feedback, User, Project } from '../types';

interface FeedbackOverlayProps {
  project: Project;
  feedbacks: Feedback[];
  user: User;
  onAddFeedback: (feedbackData: Partial<Feedback>) => Promise<void>;
  onResolveFeedback: (id: string, resolved: boolean) => Promise<void>;
  onUpdateFeedbackStatus: (id: string, status: 'open' | 'in_progress' | 'resolved' | 'rejected') => Promise<void>;
  onDeleteFeedback: (id: string) => Promise<void>;
  onUpdateDemoUrl?: (url: string) => Promise<void>;
}

// Advanced category structures
type FeedbackCategory = 'UI/Design' | 'Bug' | 'Suggestion' | 'Copy/Text' | 'General';
type FeedbackPriority = 'Low' | 'Medium' | 'High';
type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const CATEGORIES: { name: FeedbackCategory; color: string; bg: string; border: string; bullet: string }[] = [
  { name: 'Bug', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', bullet: 'bg-rose-500' },
  { name: 'UI/Design', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', bullet: 'bg-violet-500' },
  { name: 'Suggestion', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', bullet: 'bg-cyan-500' },
  { name: 'Copy/Text', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', bullet: 'bg-amber-500' },
  { name: 'General', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200', bullet: 'bg-slate-400' }
];

const PRIORITIES: { name: FeedbackPriority; color: string; bg: string; border: string }[] = [
  { name: 'High', color: 'text-rose-700 bg-rose-50 border-rose-150', bg: 'bg-rose-500', border: 'border-rose-600' },
  { name: 'Medium', color: 'text-amber-700 bg-amber-50 border-amber-150', bg: 'bg-amber-500', border: 'border-amber-600' },
  { name: 'Low', color: 'text-emerald-700 bg-emerald-50 border-emerald-150', bg: 'bg-emerald-500', border: 'border-emerald-600' }
];

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({
  project,
  feedbacks,
  user,
  onAddFeedback,
  onResolveFeedback,
  onUpdateFeedbackStatus,
  onDeleteFeedback,
  onUpdateDemoUrl
}) => {
  const [reviewMode, setReviewMode] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);
  const [clickCoords, setClickCoords] = useState<{ x: number; y: number } | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  
  // Advanced pin logging dropdown states
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory>('UI/Design');
  const [selectedPriority, setSelectedPriority] = useState<FeedbackPriority>('Medium');

  // Multi-parameter filtering states
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDevice, setFilterDevice] = useState<string>('all');
  
  // Real-time Page/URL Path simulation tracking
  const [activePath, setActivePath] = useState<string>('/');
  const [pathInput, setPathInput] = useState<string>('/');
  const [filterPage, setFilterPage] = useState<string>('current');

  // Local states for updating the live demo link
  const [demoUrlInput, setDemoUrlInput] = useState(project.liveDemoUrl || '');
  const [updatingUrl, setUpdatingUrl] = useState(false);
  const [urlMessage, setUrlMessage] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Synchronize input when project changes
  useEffect(() => {
    setDemoUrlInput(project.liveDemoUrl || '');
  }, [project.liveDemoUrl]);

  // Handle ESC key to exit full screen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  // Helper function to parse prefix tags out of feedback text
  const parseFeedback = (text: string) => {
    const categoryMatch = text.match(/\[Category:\s*([^\]]+)\]/i);
    const priorityMatch = text.match(/\[Priority:\s*([^\]]+)\]/i);
    const deviceMatch = text.match(/\[Device:\s*([^\]]+)\]/i);

    const category = (categoryMatch ? categoryMatch[1].trim() : 'UI/Design') as FeedbackCategory;
    const priority = (priorityMatch ? priorityMatch[1].trim() : 'Medium') as FeedbackPriority;
    const device = deviceMatch ? deviceMatch[1].trim() : 'Desktop';

    // Strips tags for human display text
    let cleanText = text
      .replace(/\[Category:\s*[^\]]+\]/gi, '')
      .replace(/\[Priority:\s*[^\]]+\]/gi, '')
      .replace(/\[Device:\s*[^\]]+\]/gi, '')
      .trim();

    return { category, priority, device, cleanText };
  };

  const handleUpdateUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateDemoUrl) return;
    setUpdatingUrl(true);
    setUrlMessage('');
    try {
      await onUpdateDemoUrl(demoUrlInput);
      setUrlMessage('Demo URL updated successfully!');
      setTimeout(() => setUrlMessage(''), 3000);
    } catch (err) {
      setUrlMessage('Failed to update URL.');
    } finally {
      setUpdatingUrl(false);
    }
  };

  // Click & mouse calculations mapped accurately to current layout size
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!reviewMode || clickCoords) return;
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    const rect = currentContainer.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setHoverCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setHoverCoords(null);
  };

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!reviewMode) return;
    
    // Ignore clicks inside form popovers or menus
    if ((e.target as HTMLElement).closest('.feedback-form-box')) {
      return;
    }

    if (clickCoords) {
      setClickCoords(null);
      return;
    }

    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    const rect = currentContainer.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setClickCoords({ x, y });
    setHoverCoords(null);
    setFeedbackText('');
    setSelectedCategory('UI/Design');
    setSelectedPriority('Medium');
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clickCoords || !feedbackText.trim()) return;

    setSubmitting(true);
    // Format text with system tags for bulletproof multi-database schema persistence
    const formattedText = `[Category: ${selectedCategory}] [Priority: ${selectedPriority}] [Device: ${deviceMode.toUpperCase()}] ${feedbackText.trim()}`;

    try {
      await onAddFeedback({
        projectId: project._id || project.id,
        text: formattedText,
        x: Math.round(clickCoords.x * 100) / 100, // round to 2 decimals
        y: Math.round(clickCoords.y * 100) / 100,
        pagePath: activePath,
        resolved: false
      });
      setClickCoords(null);
      setFeedbackText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filters the feedbacks based on user filters
  const filteredFeedbacks = feedbacks.filter(f => {
    const parsed = parseFeedback(f.text);
    const statusVal = f.status || (f.resolved ? 'resolved' : 'open');
    
    const matchesSearch = parsed.cleanText.toLowerCase().includes(searchText.toLowerCase()) || 
                          f.reporterEmail.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || parsed.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesPriority = filterPriority === 'all' || parsed.priority.toLowerCase() === filterPriority.toLowerCase();
    const matchesStatus = filterStatus === 'all' || statusVal === filterStatus;
    const matchesDevice = filterDevice === 'all' || parsed.device.toLowerCase() === filterDevice.toLowerCase();
    
    const matchesPage = filterPage === 'all' || (f.pagePath || '/') === activePath;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesDevice && matchesPage;
  });

  const getCategoryColorInfo = (category: FeedbackCategory) => {
    return CATEGORIES.find(c => c.name === category) || CATEGORIES[4];
  };

  const getPriorityColorInfo = (priority: FeedbackPriority) => {
    return PRIORITIES.find(p => p.name === priority) || PRIORITIES[1];
  };

  const getStatusBadgeInfo = (status: string) => {
    switch (status) {
      case 'in_progress':
        return { label: 'In Progress', bg: 'bg-blue-50 border-blue-200 text-blue-700', dot: 'bg-blue-500' };
      case 'resolved':
        return { label: 'Resolved', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', dot: 'bg-emerald-500' };
      case 'rejected':
        return { label: 'Declined', bg: 'bg-slate-100 border-slate-300 text-slate-600', dot: 'bg-slate-400' };
      case 'open':
      default:
        return { label: 'Open', bg: 'bg-amber-50 border-amber-200 text-amber-700', dot: 'bg-amber-500' };
    }
  };

  const hasDemoUrl = !!project.liveDemoUrl && project.liveDemoUrl.trim() !== '';

  // Get responsive width classes for device frame simulation
  const getDeviceWidthClass = () => {
    if (deviceMode === 'tablet') return 'max-w-[768px] border-x-[12px] border-t-[12px] border-b-[24px] border-slate-800 rounded-3xl shadow-2xl';
    if (deviceMode === 'mobile') return 'max-w-[375px] border-x-[12px] border-t-[16px] border-b-[32px] border-slate-800 rounded-3xl shadow-2xl';
    return 'w-full';
  };

  // Helper component to render the simulation viewport itself
  const renderSandboxViewport = (isFS: boolean) => {
    return (
      <div className="flex flex-col flex-1 h-full min-h-[500px]">
        {/* Device simulation menu & frame actions */}
        <div className="bg-slate-900 px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-400 ml-2 hidden lg:inline font-bold">Browser Simulator</span>
          </div>

          {/* Dynamic Staging URL & Sub-page Navigation Input */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 flex-1 min-w-[240px] max-w-md">
            <span className="text-[9px] font-extrabold text-indigo-400 select-none">STAGING:</span>
            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline truncate max-w-[100px]">
              {project.liveDemoUrl ? project.liveDemoUrl.replace(/https?:\/\//i, '').replace(/\/$/, '') : 'sandbox://'}
            </span>
            <div className="flex items-center gap-0.5 flex-1 border-l border-slate-800 pl-1.5">
              <span className="text-slate-600 font-mono text-[10px] select-none">/</span>
              <input
                type="text"
                value={pathInput.startsWith('/') ? pathInput.slice(1) : pathInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setPathInput(val.startsWith('/') ? val : '/' + val);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    let finalP = pathInput.trim();
                    if (!finalP.startsWith('/')) finalP = '/' + finalP;
                    setActivePath(finalP);
                  }
                }}
                placeholder="path (e.g. about, dashboard)"
                className="bg-transparent border-none outline-none text-white font-mono text-[10px] w-full focus:ring-0 p-0 placeholder:text-slate-600"
              />
              {pathInput !== activePath && (
                <button
                  onClick={() => {
                    let finalP = pathInput.trim();
                    if (!finalP.startsWith('/')) finalP = '/' + finalP;
                    setActivePath(finalP);
                  }}
                  className="text-[9px] bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-2 py-0.5 rounded cursor-pointer transition-colors shrink-0"
                >
                  GO
                </button>
              )}
            </div>
            
            {/* Quick dropdown select for main pages */}
            <select
              value={activePath}
              onChange={(e) => {
                const val = e.target.value;
                setActivePath(val);
                setPathInput(val);
              }}
              className="bg-slate-900 border border-slate-700 text-slate-300 rounded text-[9px] font-semibold py-0.5 px-1 outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500"
            >
              <option value="/">Home ( / )</option>
              <option value="/about">About ( /about )</option>
              <option value="/pricing">Pricing ( /pricing )</option>
              <option value="/dashboard">Dashboard ( /dashboard )</option>
              <option value="/checkout">Checkout ( /checkout )</option>
              <option value="/contact">Contact ( /contact )</option>
            </select>
          </div>

          {/* Interactive responsive device toggle bar */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1.5 rounded-md transition-all ${
                deviceMode === 'desktop' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              title="Desktop View (100%)"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`p-1.5 rounded-md transition-all ${
                deviceMode === 'tablet' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              title="Tablet view (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1.5 rounded-md transition-all ${
                deviceMode === 'mobile' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-400 capitalize hidden md:inline bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/30">
              Active: {activePath}
            </span>
            <button
              onClick={() => setIsFullScreen(!isFS)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              title={isFS ? "Exit Immersive View" : "Immersive Full Screen"}
            >
              {isFS ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Viewport frame canvas */}
        <div className="flex-1 bg-slate-950 p-4 overflow-auto flex items-center justify-center relative">
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClickCapture}
            className={`relative bg-white h-full min-h-[460px] flex flex-col items-stretch overflow-hidden transition-all duration-300 ${getDeviceWidthClass()}`}
          >
            {hasDemoUrl ? (
              <iframe
                id="live-demo-iframe"
                ref={iframeRef}
                src={`${project.liveDemoUrl.replace(/\/$/, '')}${activePath}`}
                title="SaaS Live Prototype"
                className="w-full h-full border-none min-h-[440px] bg-white select-none flex-1"
                referrerPolicy="no-referrer"
              />
            ) : (
              /* Interactive Mock Blueprint Fallback if URL is missing */
              <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-slate-400 select-none">
                <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-slate-300 shadow-lg mb-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                </div>
                <h4 className="text-xs font-bold text-slate-200">Simulation Workspace Canvas</h4>
                <p className="text-[10px] text-slate-400 max-w-xs mt-1 mb-4 leading-normal">
                  {user.role === 'developer' 
                    ? `Enter your live deployment URL in settings to stream the live app. Place mock pins directly on route "${activePath}" on this visual canvas!` 
                    : `Your developer is connecting the live server build. Click any coordinate spot on route "${activePath}" to save mockup feedback annotations!`}
                </p>
                
                {/* Visual Sandbox template layout for placement mapping */}
                <div className="w-full max-w-[280px] bg-slate-950 rounded-lg border border-slate-800 p-4 text-left space-y-3 pointer-events-none">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-[10px] text-indigo-400 font-mono">Route: {activePath}</span>
                    <span className="text-[8px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-full border border-indigo-500/10">Active View</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 bg-slate-800 rounded w-2/3" />
                    <div className="h-2 bg-slate-800 rounded w-1/2" />
                  </div>
                  <div className="h-12 bg-slate-900/40 rounded border border-slate-800 p-2 flex items-center justify-center">
                    <span className="text-[8px] text-slate-500 font-mono">Template: {activePath === '/' ? 'Home View Content' : `${activePath.slice(1).toUpperCase()} Section`}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Shield click capturing overlay */}
            {reviewMode && (
              <div
                id="review-click-overlay"
                className={`absolute inset-0 z-20 cursor-crosshair transition-all ${
                  clickCoords ? 'bg-black/30' : 'bg-transparent hover:bg-indigo-600/[0.01]'
                }`}
              />
            )}

            {/* Hover floating coordinate pin */}
            {reviewMode && hoverCoords && !clickCoords && (
              <div
                id="floating-hover-pin"
                className="absolute w-7 h-7 border-2 border-dashed border-rose-500 bg-rose-500/15 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 shadow-lg"
                style={{ left: `${hoverCoords.x}%`, top: `${hoverCoords.y}%` }}
              >
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              </div>
            )}

            {/* Plotted visual pinpoint coordinate indicators */}
            {filteredFeedbacks
              .filter((f) => (f.pagePath || '/') === activePath)
              .map((f) => {
              const id = f._id || f.id;
              if (f.x === undefined || f.y === undefined) return null;

              const isSelected = selectedPinId === id;
              const parsed = parseFeedback(f.text);
              const categoryColor = getCategoryColorInfo(parsed.category);
              const statusVal = f.status || (f.resolved ? 'resolved' : 'open');

              // Find feedback overall sequence index from the parent feedbacks list
              const originalIndex = feedbacks.findIndex(orig => (orig._id || orig.id) === id);

              let statusPinClass = '';
              if (statusVal === 'resolved') {
                statusPinClass = 'bg-emerald-500 text-white hover:bg-emerald-600 ring-2 ring-emerald-200';
              } else if (statusVal === 'in_progress') {
                statusPinClass = 'bg-blue-500 text-white hover:bg-blue-600 ring-2 ring-blue-200 animate-pulse';
              } else if (statusVal === 'rejected') {
                statusPinClass = 'bg-slate-400 text-white hover:bg-slate-500 ring-2 ring-slate-200';
              } else {
                statusPinClass = isSelected 
                  ? 'bg-rose-500 text-white ring-4 ring-rose-500/30 scale-125 animate-pulse' 
                  : `${categoryColor.bullet} text-white hover:scale-110 ring-2 ring-white`;
              }

              return (
                <button
                  id={`placed-pin-${id}`}
                  key={id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPinId(isSelected ? null : id);
                  }}
                  className={`absolute w-7 h-7 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shadow-xl cursor-pointer -translate-x-1/2 -translate-y-1/2 z-30 transition-all ${statusPinClass}`}
                  style={{ left: `${f.x}%`, top: `${f.y}%` }}
                  title={`[Status: ${statusVal.toUpperCase()}] [${parsed.category}] ${parsed.cleanText}`}
                >
                  {originalIndex !== -1 ? originalIndex + 1 : '?'}
                </button>
              );
            })}

            {/* Popover form inside exact click coordinate area */}
            {reviewMode && clickCoords && (
              <div
                id="feedback-form-overlay"
                className="absolute z-40 feedback-form-box -translate-x-1/2 mt-4"
                style={{ 
                  left: `${clickCoords.x}%`, 
                  top: `${clickCoords.y}%`,
                  // Intelligently keep viewport form on screen
                  transform: `translate(${clickCoords.x > 75 ? '-85%' : clickCoords.x < 25 ? '15%' : '-50%'}, 12px)`
                }}
              >
                <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-4 w-80 space-y-3 relative ring-4 ring-slate-900/5">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-3.5 h-3.5 bg-white rotate-45 border-t border-l border-slate-200" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Add Review Pin
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                      X:{Math.round(clickCoords.x)}% Y:{Math.round(clickCoords.y)}%
                    </span>
                  </div>

                  <form onSubmit={handleSubmitFeedback} className="space-y-3">
                    {/* Select Category */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Category</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value as FeedbackCategory)}
                          className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-1 text-[11px] text-slate-800 outline-none transition-all"
                        >
                          {CATEGORIES.map(c => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Priority</label>
                        <select
                          value={selectedPriority}
                          onChange={(e) => setSelectedPriority(e.target.value as FeedbackPriority)}
                          className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-1 text-[11px] text-slate-800 outline-none transition-all"
                        >
                          <option value="Low">Low Priority</option>
                          <option value="Medium">Medium Priority</option>
                          <option value="High">High Priority</option>
                        </select>
                      </div>
                    </div>

                    {/* Textarea */}
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Your Remark</label>
                      <textarea
                        id="pin-feedback-input"
                        required
                        rows={2}
                        placeholder="Explain the layout issue or fix requested here..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="w-full bg-slate-50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setClickCoords(null)}
                        className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold rounded cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || !feedbackText.trim()}
                        className="py-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold rounded shadow-sm cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1"
                      >
                        {submitting ? 'Adding...' : 'Place Pin'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Helper component to render the feedback thread sidebar list
  const renderFeedbackThreadList = () => {
    return (
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm flex flex-col h-full min-h-[400px]">
        {/* Header summary */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40 rounded-t-xl">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            Feedback Threads
          </span>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100 font-bold">
            {filteredFeedbacks.length} pins found
          </span>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3 bg-slate-50/50 border-b border-slate-100 space-y-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search comments, clients..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Filtering Dropdowns */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="col-span-2">
              <select
                value={filterPage}
                onChange={(e) => setFilterPage(e.target.value)}
                className="w-full bg-indigo-50 border border-indigo-150 rounded px-1.5 py-1 text-[10px] font-bold text-indigo-700 outline-none cursor-pointer"
              >
                <option value="current">Current Page Only ({activePath})</option>
                <option value="all">All Pages Across Prototype</option>
              </select>
            </div>

            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] text-slate-600 outline-none"
              >
                <option value="all">Category: All</option>
                <option value="Bug">Bug</option>
                <option value="UI/Design">UI/Design</option>
                <option value="Suggestion">Suggestion</option>
                <option value="Copy/Text">Copy/Text</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] text-slate-600 outline-none"
              >
                <option value="all">Priority: All</option>
                <option value="High">High Only</option>
                <option value="Medium">Medium Only</option>
                <option value="Low">Low Only</option>
              </select>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] text-slate-600 outline-none"
              >
                <option value="all">Status: All</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Declined</option>
              </select>
            </div>

            <div>
              <select
                value={filterDevice}
                onChange={(e) => setFilterDevice(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] text-slate-600 outline-none"
              >
                <option value="all">Device: All</option>
                <option value="desktop">Desktop</option>
                <option value="tablet">Tablet</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>
          </div>
        </div>

        {/* List of comments */}
        <div id="feedback-list-scroller" className="p-4 overflow-y-auto max-h-[480px] divide-y divide-slate-100 flex-1 space-y-3 bg-slate-50/10">
          {filteredFeedbacks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2 h-full flex flex-col justify-center items-center">
              <HelpCircle className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No matching comments</p>
              <p className="text-[10px] text-slate-400 leading-normal max-w-[200px]">
                {feedbacks.length === 0 
                  ? 'Toggle "Review Mode" on the left and click coordinates to place pinpoint cards!'
                  : 'Adjust filters or search keyword terms to display matching pin cards.'}
              </p>
            </div>
          ) : (
            filteredFeedbacks.map((f) => {
              const id = f._id || f.id;
              const isSelected = selectedPinId === id;
              const parsed = parseFeedback(f.text);
              const catColor = getCategoryColorInfo(parsed.category);
              const prioColor = getPriorityColorInfo(parsed.priority);
              const statusVal = f.status || (f.resolved ? 'resolved' : 'open');
              const statusInfo = getStatusBadgeInfo(statusVal);

              // Find overall index in full array
              const originalIndex = feedbacks.findIndex(orig => (orig._id || orig.id) === id);

              let statusDotBg = 'bg-amber-500';
              if (statusVal === 'resolved') statusDotBg = 'bg-emerald-500';
              else if (statusVal === 'in_progress') statusDotBg = 'bg-blue-500';
              else if (statusVal === 'rejected') statusDotBg = 'bg-slate-500';

              return (
                <div
                  id={`feedback-card-item-${id}`}
                  key={id}
                  className={`pt-3 pb-3 px-3 space-y-2.5 transition-all rounded-xl border cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-50/30 border-indigo-200 shadow-md ring-1 ring-indigo-100' 
                      : 'hover:bg-slate-50/60 border-transparent'
                  }`}
                  onClick={() => {
                    setSelectedPinId(isSelected ? null : id);
                    if (f.pagePath) {
                      setActivePath(f.pagePath);
                      setPathInput(f.pagePath);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white ${statusDotBg}`}>
                        {originalIndex !== -1 ? originalIndex + 1 : '?'}
                      </span>
                      <div>
                        <div className="text-[10px] font-bold text-slate-700 truncate max-w-[120px]" title={f.reporterEmail}>
                          {f.reporterEmail.split('@')[0]}
                        </div>
                        <div className="text-[8px] text-slate-400">
                          {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'Staged'}
                        </div>
                      </div>
                    </div>

                    {/* Category & Status badges */}
                    <div className="flex items-center gap-1">
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${catColor.bg} ${catColor.color} ${catColor.border}`}>
                        {parsed.category}
                      </span>
                      <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded border ${statusInfo.bg}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-sans pl-7 break-words whitespace-pre-wrap">
                    {parsed.cleanText}
                  </p>

                  {/* Metadata and Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-dashed border-slate-100 pl-7">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[8px] font-mono text-slate-400 bg-slate-50 px-1 py-0.5 rounded">
                        Coords: {Math.round(f.x || 0)}%, {Math.round(f.y || 0)}%
                      </span>
                      <span className="text-[8px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-1 py-0.5 rounded font-bold truncate max-w-[120px]" title={`Placed on page path: ${f.pagePath || '/'}`}>
                        Path: {f.pagePath || '/'}
                      </span>
                      <span className={`text-[8px] font-semibold px-1 py-0.5 rounded border flex items-center gap-0.5 ${prioColor.color}`}>
                        <Info className="w-2.5 h-2.5" />
                        {parsed.priority}
                      </span>
                      <span className="text-[8px] font-medium text-slate-500 bg-slate-100 px-1 py-0.5 rounded uppercase">
                        {parsed.device}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {/* Developer only remove button */}
                      {user.role === 'developer' && (
                        <button
                          onClick={() => {
                            if (confirm('Delete this feedback pin permanently?')) {
                              onDeleteFeedback(id);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove Pin"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Interactive Status Update Panel (renders when card is selected) */}
                  {isSelected && (
                    <div 
                      className="mt-3 pt-2.5 border-t border-slate-150 bg-slate-50/80 p-2.5 rounded-lg flex flex-col gap-2" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
                          Update Tracking Status
                        </span>
                        <span className="text-[8px] font-medium text-slate-400">
                          Syncs immediately
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['open', 'in_progress', 'resolved', 'rejected'] as const).map((statusKey) => {
                          const isCurrent = statusVal === statusKey;
                          const info = getStatusBadgeInfo(statusKey);
                          return (
                            <button
                              key={statusKey}
                              type="button"
                              onClick={async () => {
                                if (isCurrent) return;
                                await onUpdateFeedbackStatus(id, statusKey);
                              }}
                              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                                isCurrent 
                                  ? `${info.bg} ring-2 ring-indigo-500/10 font-extrabold` 
                                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${info.dot}`} />
                                {info.label}
                              </span>
                              {isCurrent && (
                                <span className="text-[8px] font-extrabold text-indigo-600 bg-indigo-50/50 px-1 rounded">✓</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div id="feedback-sandbox" className="space-y-6">
      
      {/* 1. TOP BAR Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg">
            <Layers className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live Viewport Canvas</h3>
            <p className="text-[10px] text-slate-500">Enable Review Mode to pinpoint category comments on the prototype.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="toggle-review-mode-btn"
            onClick={() => {
              setReviewMode(!reviewMode);
              setClickCoords(null);
              setHoverCoords(null);
            }}
            className={`flex items-center gap-1.5 py-1.5 px-3.5 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
              reviewMode
                ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm ring-2 ring-rose-50'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            {reviewMode ? 'Review Mode: Active' : 'Enable Review Mode'}
          </button>

          <button
            onClick={() => setIsFullScreen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Full Screen
          </button>
        </div>
      </div>

      {/* 2. MAIN GRID (When not in fullscreen mode) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Interactive Live Sandbox (2 columns) */}
        <div className="xl:col-span-2">
          {renderSandboxViewport(false)}
        </div>

        {/* Right Feedback Log Checklist & URL Settings (1 column) */}
        <div className="space-y-4">
          {/* Link configuration card for developer */}
          {user.role === 'developer' && onUpdateDemoUrl && (
            <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin-slow" />
                Live Demo Configuration
              </h4>
              <form onSubmit={handleUpdateUrlSubmit} className="space-y-2">
                <input
                  id="demo-url-input-field"
                  type="url"
                  required
                  placeholder="https://your-live-deployment.web.app"
                  value={demoUrlInput}
                  onChange={(e) => setDemoUrlInput(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-1.5 px-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                />
                <button
                  type="submit"
                  id="update-demo-url-btn"
                  disabled={updatingUrl}
                  className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {updatingUrl ? 'Updating...' : 'Link Live Prototype'}
                </button>
                {urlMessage && (
                  <p className="text-[10px] text-emerald-600 font-semibold">{urlMessage}</p>
                )}
              </form>
            </div>
          )}

          {renderFeedbackThreadList()}
        </div>
      </div>

      {/* 3. IMMERSIVE FULL SCREEN OVERLAY PORTAL */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950 z-50 flex flex-col md:flex-row p-4 md:p-6 gap-6 overflow-hidden"
          >
            {/* Immersive Viewport Pane */}
            <div className="flex-1 flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative">
              {/* Escape instruction notice */}
              <div className="absolute bottom-4 left-4 z-40 bg-slate-950/80 backdrop-blur border border-slate-800 text-slate-400 text-[9px] px-3 py-1.5 rounded-lg pointer-events-none">
                Press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white text-[8px]">ESC</kbd> or click minimize to return
              </div>

              {renderSandboxViewport(true)}
            </div>

            {/* Immersive Right-Hand Pin Checklist Sidebar (collapsible / beautifully layouted) */}
            <div className="w-full md:w-[360px] h-full flex-shrink-0 flex flex-col overflow-hidden bg-white rounded-2xl">
              {renderFeedbackThreadList()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
