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

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAuth }) => {
  const [activeTab, setActiveTab] = useState<'developer' | 'client'>('developer');
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'support' | null>(null);
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  // Landing Page Interactive Lifecycles & Conversational Upgrades
  const [activeLifecycleStage, setActiveLifecycleStage] = useState<string>('Client Review');
  
  // Savings Calculator States
  const [calcProjects, setCalcProjects] = useState<number>(3);
  const [calcEmails, setCalcEmails] = useState<number>(15);
  const [calcHourlyRate, setCalcHourlyRate] = useState<number>(65);

  // Conversational Onboarding Assistant (Chat Widget)
  const [isBotOpen, setIsBotOpen] = useState<boolean>(false);
  const [botTyping, setBotTyping] = useState<boolean>(false);
  const [botCurrentOptions, setBotCurrentOptions] = useState<string[]>(['dev', 'client', 'how_emails', 'pricing']);
  const [botMessages, setBotMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    { 
      sender: 'bot', 
      text: "Hi there! 👋 I am the DevFlw Guide. I can help explain how we optimize client-developer collaboration and replace endless emails with visual staging pins. Are you a Developer or a Client?", 
      time: 'Just now' 
    }
  ]);
  const [showBotOptions, setShowBotOptions] = useState<boolean>(true);
  const [customBotInput, setCustomBotInput] = useState<string>('');

  const botPredefinedReplies: Record<string, { reply: string; nextOptions: string[] }> = {
    'dev': {
      reply: "Excellent! Developers love DevFlw because you can upload or link your staging server in 5 seconds. Your clients can click anywhere directly on the interactive layout to create spatial annotation pins. It's like having Figma comments directly on live HTML/CSS! This keeps all client suggestions fully organized on your Kanban board.",
      nextOptions: ['how_emails', 'pricing', 'reset']
    },
    'client': {
      reply: "Great to have you here! Reviewing live software builds is incredibly stress-free with DevFlw. Instead of drafting a long email describing where a layout element looks out-of-place, you just open the live preview sandbox, click the exact button or logo, and write your remark. Your developers will instantly see the precise location and coordinate details!",
      nextOptions: ['how_emails', 'pricing', 'reset']
    },
    'how_emails': {
      reply: "DevFlw links viewport comments directly to live threads and tasks. Instead of writing 'on page 2 of the invoice layout, that blue button needs to be shifted...', you just place a coordinate pin. This simple process reduces back-and-forth feedback emails by over 75% and speeds up project approval times by 40%!",
      nextOptions: ['dev', 'client', 'pricing', 'reset']
    },
    'pricing': {
      reply: "DevFlw is 100% free for up to 2 active collaboration projects! For larger software agencies or multi-member development teams, our Premium Plan is $29/month per workspace. This unlocks secure client invite seats, unlimited project archiving, priority support, and email push notifications.",
      nextOptions: ['dev', 'client', 'how_emails', 'reset']
    },
    'reset': {
      reply: "Let's start fresh! I can explain how we make developer-client co-creation clear and frictionless. What fits your role closest?",
      nextOptions: ['dev', 'client', 'how_emails', 'pricing']
    }
  };

  const handleBotSelectOption = (key: string, label: string) => {
    setShowBotOptions(false);
    const userMsg = { 
      sender: 'user' as const, 
      text: label, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    setBotMessages(prev => [...prev, userMsg]);
    setBotTyping(true);

    setTimeout(() => {
      const data = botPredefinedReplies[key] || botPredefinedReplies['reset'];
      const botMsg = { 
        sender: 'bot' as const, 
        text: data.reply, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setBotMessages(prev => [...prev, botMsg]);
      setBotTyping(false);
      setBotCurrentOptions(data.nextOptions);
      setShowBotOptions(true);
    }, 850);
  };

  const handleCustomBotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBotInput.trim()) return;
    
    const userText = customBotInput.trim();
    setCustomBotInput('');
    setShowBotOptions(false);

    const userMsg = { 
      sender: 'user' as const, 
      text: userText, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    setBotMessages(prev => [...prev, userMsg]);
    setBotTyping(true);

    setTimeout(() => {
      // Analyze text for keyword matches to reply intelligently
      const lowercaseText = userText.toLowerCase();
      let replyText = "That's an excellent question! DevFlw is built precisely to solve that. It couples high-fidelity staging sandboxes with visual feedback pins, context-rich discussions, and agile milestones.";
      let nextOpts = ['dev', 'client', 'pricing'];

      if (lowercaseText.includes('price') || lowercaseText.includes('cost') || lowercaseText.includes('free')) {
        replyText = botPredefinedReplies['pricing'].reply;
        nextOpts = botPredefinedReplies['pricing'].nextOptions;
      } else if (lowercaseText.includes('developer') || lowercaseText.includes('dev') || lowercaseText.includes('engineer')) {
        replyText = botPredefinedReplies['dev'].reply;
        nextOpts = botPredefinedReplies['dev'].nextOptions;
      } else if (lowercaseText.includes('client') || lowercaseText.includes('customer') || lowercaseText.includes('buyer')) {
        replyText = botPredefinedReplies['client'].reply;
        nextOpts = botPredefinedReplies['client'].nextOptions;
      } else if (lowercaseText.includes('email') || lowercaseText.includes('slow') || lowercaseText.includes('reduce')) {
        replyText = botPredefinedReplies['how_emails'].reply;
        nextOpts = botPredefinedReplies['how_emails'].nextOptions;
      }

      const botMsg = { 
        sender: 'bot' as const, 
        text: replyText, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setBotMessages(prev => [...prev, botMsg]);
      setBotTyping(false);
      setBotCurrentOptions(nextOpts);
      setShowBotOptions(true);
    }, 1000);
  };

  const optionLabels: Record<string, string> = {
    'dev': '💻 I am a Software Developer',
    'client': '🤝 I am a Client / Manager',
    'how_emails': '📧 How does it reduce emails?',
    'pricing': '💰 View Platform Pricing',
    'reset': '🔄 Back to Start'
  };

  // Hero Interactive Feedback Simulator States

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

  const handleDemoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!demoReviewMode || !demoContainerRef.current) return;
    const rect = demoContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDemoHoverCoords({ x, y });
  };

  const handleDemoClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!demoReviewMode || !demoContainerRef.current) return;
    const rect = demoContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDemoClickCoords({ x, y });
  };

  const handleDemoSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoInputText.trim() || !demoClickCoords) return;
    const newPin = {
      id: 'dp-' + Math.random().toString(36).substring(2, 11),
      x: demoClickCoords.x,
      y: demoClickCoords.y,
      text: demoInputText.trim(),
      category: demoCategory,
      priority: demoPriority,
      reporter: 'Guest User'
    };
    setDemoPins([...demoPins, newPin]);
    setDemoInputText('');
    setDemoClickCoords(null);
  };

  const handleDemoDeletePin = (id: string) => {
    setDemoPins(demoPins.filter(pin => pin.id !== id));
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

      {/* INTERACTIVE WORKFLOW LIFE-CYCLE STAGE TOUR */}
      <section id="interactive-lifecycle" className="py-20 bg-slate-900 text-white border-y border-slate-800 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              Interactive Workflow Tour
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Experience the 8 Stages of Frictionless Co-Creation
            </h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Click on any stage below to see how DevFlw automates discussions, coordinates tasks, and syncs sandbox environments in real time.
            </p>
          </div>

          {/* Stepper Pipeline (Horizontal scrollable on mobile, flex on desktop) */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 shadow-2xl overflow-x-auto scrollbar-none">
            <div className="flex items-center justify-between min-w-[950px] gap-2 py-2">
              {[
                { name: 'Planning', icon: Layers, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
                { name: 'In Progress', icon: Code, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
                { name: 'Ready for Review', icon: Eye, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                { name: 'Client Review', icon: Users, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
                { name: 'Changes Requested', icon: ChevronRight, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
                { name: 'Approved', icon: Check, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                { name: 'Completed', icon: Sparkles, color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20' },
                { name: 'Archived', icon: Shield, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' }
              ].map((stage, idx) => {
                const isSelected = activeLifecycleStage === stage.name;
                const StageIcon = stage.icon;
                return (
                  <React.Fragment key={stage.name}>
                    <button
                      onClick={() => setActiveLifecycleStage(stage.name)}
                      className={`flex flex-col items-center gap-2 group cursor-pointer relative z-10 transition-all ${
                        isSelected ? 'scale-105' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      {/* Step Circle */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                        isSelected 
                          ? `${stage.color} ring-4 ring-indigo-500/20 scale-110 shadow-lg shadow-indigo-500/10` 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}>
                        <StageIcon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isSelected ? 'text-white font-black' : 'text-slate-400'
                      }`}>
                        {stage.name}
                      </span>
                    </button>

                    {idx < 7 && (
                      <div className={`flex-1 h-0.5 min-w-[20px] transition-all ${
                        idx < ['Planning', 'In Progress', 'Ready for Review', 'Client Review', 'Changes Requested', 'Approved', 'Completed', 'Archived'].indexOf(activeLifecycleStage)
                          ? 'bg-indigo-500'
                          : 'bg-slate-800'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Interactive Workspace Live Showcase Device Grid */}
          {(() => {
            const tourMap: Record<string, {
              label: string;
              desc: string;
              badge: string;
              badgeColor: string;
              bubbleColor: string;
              previewTitle: string;
              previewDesc: string;
              tasks: string[];
              chat: Array<{ sender: 'dev' | 'client' | 'system'; text: string; time: string }>;
              accentColor: string;
            }> = {
              'Planning': {
                label: 'Planning',
                desc: 'Setting project scope, requirements, & deliverables.',
                badge: 'Phase 1: Spec Formulation',
                badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
                bubbleColor: 'bg-sky-500',
                accentColor: 'sky',
                previewTitle: '📄 Project Specs & Wireframes',
                previewDesc: 'Initialize workspace, draft requirements sheet, and share Figma layouts directly with clients inside DevFlw.',
                tasks: ['Draft functional spec document', 'Approve tech stack & core database model', 'Define design system presets'],
                chat: [
                  { sender: 'system', text: 'Project "Acme Redesign" created in DevFlw Workspace.', time: '10:00 AM' },
                  { sender: 'dev', text: 'Hi! I have uploaded our initial Figma wireframe and mapped the database diagram. Let me know if the user flows look good!', time: '10:15 AM' },
                  { sender: 'client', text: 'This looks incredibly thorough. Love the simple onboarding step. Let\'s proceed with coding.', time: '10:22 AM' }
                ]
              },
              'In Progress': {
                label: 'In Progress',
                desc: 'Active development, design styling, & code push.',
                badge: 'Phase 2: Coding & Iteration',
                badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                bubbleColor: 'bg-indigo-500',
                accentColor: 'indigo',
                previewTitle: '💻 Live Staging Code Sandbox',
                previewDesc: 'Our built-in build system bundles your code on push, deploying it live to our sandboxed hosting. Developers write code; clients inspect output.',
                tasks: ['Create responsive mobile navigation menu', 'Integrate AuthContext authentication', 'Configure database endpoints'],
                chat: [
                  { sender: 'dev', text: 'Just pushed the mobile navigation and auth system. The live preview has refreshed!', time: '1:40 PM' },
                  { sender: 'system', text: 'Build successfully deployed to staging://acme-staging', time: '1:41 PM' },
                  { sender: 'client', text: 'Wow, seeing the actual responsive menu render in real-time is amazing.', time: '1:55 PM' }
                ]
              },
              'Ready for Review': {
                label: 'Ready for Review',
                desc: 'Developer completes tasks & hands build to client.',
                badge: 'Phase 3: Inspection Prompt',
                badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                bubbleColor: 'bg-amber-500',
                accentColor: 'amber',
                previewTitle: '🔍 Staging Build Ready for Client',
                previewDesc: 'The developer toggles the stage trigger. A push alert notifies the client that the current workspace milestone is ready for interactive review.',
                tasks: ['Test checkout forms validation rules', 'Run cross-browser compatibility suite', 'Verify responsive breakpoints'],
                chat: [
                  { sender: 'dev', text: 'All sprint tasks are completed. Handing over to you for visual inspect and pin placement!', time: '3:10 PM' },
                  { sender: 'system', text: 'Milestone status set to: Ready for Review. Client invited to pin suggestions.', time: '3:11 PM' }
                ]
              },
              'Client Review': {
                label: 'Client Review',
                desc: 'Client places interactive pins on staging viewport.',
                badge: 'Phase 4: Pinpoint Annotation',
                badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
                bubbleColor: 'bg-violet-500',
                accentColor: 'violet',
                previewTitle: '🎯 Direct Spatial Review Canvas',
                previewDesc: 'Client clicks anywhere on the live viewport to leave comments. Each comment has precise pixel-level coords, a category, and a priority.',
                tasks: ['Client visual review session', 'Pin feedback on navigation and checkout button', 'Align on final details'],
                chat: [
                  { sender: 'client', text: 'The checkout form looks great! Just noticed a styling issue on the main call-to-action button.', time: '4:15 PM' },
                  { sender: 'system', text: 'Client logged visual Pin #1 on Button Component (Coords: X:68%, Y:42%)', time: '4:16 PM' },
                  { sender: 'client', text: 'I also placed a minor suggestion pin on the footer layout. Please adjust font size.', time: '4:18 PM' }
                ]
              },
              'Changes Requested': {
                label: 'Changes Requested',
                desc: 'Developer receives precise pinpoint bugs to resolve.',
                badge: 'Phase 5: Iteration & Correction',
                badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                bubbleColor: 'bg-rose-500',
                accentColor: 'rose',
                previewTitle: '🛠️ Feedback Resolution Pipeline',
                previewDesc: 'Visual pins turn automatically into structured tasks on the developer Kanban board. Developer resolves issues and commits code changes.',
                tasks: ['Fix checkout button hover scaling logic (Pin #1)', 'Increase footer font size on tablet (Pin #2)'],
                chat: [
                  { sender: 'dev', text: 'Got both pins! Commencing button transition fix and footer adjustment immediately.', time: '5:02 PM' },
                  { sender: 'dev', text: 'Done! Adjusted the hover scale and set the footer text-xs to text-sm. Let me know what you think.', time: '5:20 PM' },
                  { sender: 'system', text: 'Pin #1 set to RESOLVED. Staging updated.', time: '5:21 PM' }
                ]
              },
              'Approved': {
                label: 'Approved',
                desc: 'Client reviews fixes & officially approves milestone.',
                badge: 'Phase 6: Final Acceptance',
                badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                bubbleColor: 'bg-emerald-500',
                accentColor: 'emerald',
                previewTitle: '✅ Verified Build Approval',
                previewDesc: 'The client verifies that all change requests have been correctly addressed and officially signs off on the sprint milestones.',
                tasks: ['All client feedback pins resolved', 'Client issues digital design approval stamp'],
                chat: [
                  { sender: 'client', text: 'Looks absolutely flawless now! The transitions are incredibly smooth. I\'ve marked all pins as approved.', time: '6:10 PM' },
                  { sender: 'system', text: 'Workspace has been STAMPED and APPROVED by client Sarah.', time: '6:12 PM' },
                  { sender: 'dev', text: 'Fantastic! Readying final production deploy scripts.', time: '6:15 PM' }
                ]
              },
              'Completed': {
                label: 'Completed',
                desc: 'Milestone fully merged, deployed, & complete.',
                badge: 'Phase 7: Production Release',
                badgeColor: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
                bubbleColor: 'bg-fuchsia-500',
                accentColor: 'fuchsia',
                previewTitle: '🎉 Production Deployment Live',
                previewDesc: 'DevFlw deploys the approved build directly to the custom production domain. The client and developer celebrate a successful kickoff!',
                tasks: ['Merge staging to master branch', 'Launch custom domain routing', 'Perform production sanity check'],
                chat: [
                  { sender: 'system', text: 'Build production release successfully deployed. Project Acme Redesign is LIVE!', time: '7:30 PM' },
                  { sender: 'dev', text: 'We are live! Thank you so much for the clear and efficient feedback, Sarah. This was our fastest project yet!', time: '7:35 PM' },
                  { sender: 'client', text: 'I am so glad we used DevFlw. No lost emails, no screenshots, just pure progress. Thank you!', time: '7:42 PM' }
                ]
              },
              'Archived': {
                label: 'Archived',
                desc: 'Project securely locked & cataloged for reference.',
                badge: 'Phase 8: Project Safe Vault',
                badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
                bubbleColor: 'bg-slate-500',
                accentColor: 'slate',
                previewTitle: '🔒 Secure Workspace Archive',
                previewDesc: 'Workspace is archived. Staging servers are safely locked, discussion logs cataloged, and history stored for future reference.',
                tasks: ['Generate final deployment analytics report', 'Backup client-approved viewport pins log', 'Archive active staging servers'],
                chat: [
                  { sender: 'system', text: 'Project "Acme Redesign" successfully archived.', time: '8:00 PM' },
                  { sender: 'system', text: 'All files, discussions, and milestone logs locked in secure platform vault.', time: '8:01 PM' }
                ]
              }
            };

            const data = tourMap[activeLifecycleStage] || tourMap['Planning'];
            return (
              <motion.div 
                key={activeLifecycleStage}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left"
              >
                {/* Visual Viewport Simulation Column (7 columns) */}
                <div className="lg:col-span-7 flex flex-col bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4 relative overflow-hidden shadow-inner">
                  {/* Mock Device Header */}
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block" />
                      {activeLifecycleStage === 'Completed' ? 'production://acme-live.com' : 'staging://acme-staging.devflw.io'}
                    </span>
                    <span className={`text-[9px] px-2.5 py-0.5 border rounded-full font-bold uppercase tracking-wider ${data.badgeColor}`}>
                      {data.badge}
                    </span>
                  </div>

                  {/* Dynamic Staging Mock Graphics */}
                  <div className="flex-1 bg-slate-900 rounded-xl p-5 border border-slate-800/80 min-h-[220px] relative flex flex-col justify-between">
                    
                    {/* Background Visual representations based on stage */}
                    {activeLifecycleStage === 'Planning' && (
                      <div className="space-y-4 my-auto text-center opacity-70">
                        <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto text-lg font-bold">📄</div>
                        <div className="space-y-2">
                          <div className="h-2 bg-slate-800 rounded w-1/3 mx-auto" />
                          <div className="h-1.5 bg-slate-850 rounded w-2/3 mx-auto" />
                          <div className="h-1.5 bg-slate-850 rounded w-1/2 mx-auto" />
                        </div>
                      </div>
                    )}

                    {activeLifecycleStage === 'In Progress' && (
                      <div className="space-y-3 my-auto">
                        <div className="h-5 bg-indigo-500/10 border border-indigo-500/20 rounded-md w-1/2 flex items-center px-2 text-[10px] font-mono text-indigo-400">Loading modules...</div>
                        <div className="space-y-1.5">
                          <div className="h-2 bg-slate-800 rounded w-11/12 animate-pulse" />
                          <div className="h-2 bg-slate-800 rounded w-5/6" />
                          <div className="h-2 bg-slate-850 rounded w-4/5" />
                        </div>
                      </div>
                    )}

                    {activeLifecycleStage === 'Ready for Review' && (
                      <div className="space-y-3 my-auto">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">!</div>
                          <div className="h-3 bg-amber-500/10 rounded w-1/2" />
                        </div>
                        <div className="h-16 bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 flex items-center text-[10px] text-slate-400 leading-normal">
                          Ready for Client. Staging builds and responsive stylesheets deployed. Click review pins helper above or open chat threads below.
                        </div>
                      </div>
                    )}

                    {activeLifecycleStage === 'Client Review' && (
                      <div className="space-y-4 my-auto relative">
                        {/* Mock Button with visual Pin logged on it */}
                        <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">Hero Call-To-Action Button</span>
                          <div className="relative">
                            <button className="py-1.5 px-4 bg-indigo-600 rounded-md text-[9px] font-bold">Buy Software</button>
                            {/* Visual Pin */}
                            <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-violet-600 text-white border border-white font-bold text-[9px] flex items-center justify-center shadow-lg animate-bounce">
                              1
                            </div>
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-500 italic">Click coordinate sets a pin with direct pixel reference relative to container.</p>
                      </div>
                    )}

                    {activeLifecycleStage === 'Changes Requested' && (
                      <div className="space-y-3.5 my-auto">
                        <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 py-1.5 px-3 rounded-lg">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-rose-400">Task Auto-Generated: Adjust Button Scaling (High Priority)</span>
                        </div>
                        <div className="space-y-1">
                          <div className="h-2 bg-slate-800 rounded w-full" />
                          <div className="h-2 bg-slate-850 rounded w-11/12" />
                        </div>
                      </div>
                    )}

                    {activeLifecycleStage === 'Approved' && (
                      <div className="space-y-4 my-auto text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                        <h4 className="text-xs font-bold text-emerald-400">Milestone Approved by Client</h4>
                        <div className="h-1.5 bg-emerald-500/25 rounded w-1/3 mx-auto" />
                      </div>
                    )}

                    {activeLifecycleStage === 'Completed' && (
                      <div className="space-y-3 my-auto text-center py-4">
                        <div className="text-2xl">🎉🚀</div>
                        <h4 className="text-xs font-extrabold text-white">Acme Redesign is Live!</h4>
                        <p className="text-[10px] text-slate-400">Production environment synchronized and operating with custom subdomains.</p>
                      </div>
                    )}

                    {activeLifecycleStage === 'Archived' && (
                      <div className="space-y-3 my-auto text-center opacity-60">
                        <div className="text-xl">🔒</div>
                        <h4 className="text-[11px] font-bold text-slate-400">Workspace Safe Locked</h4>
                        <p className="text-[9px] text-slate-500 leading-normal">Discussions logs, client approvals, and code viewport records safely archived.</p>
                      </div>
                    )}

                    {/* Bottom static bar */}
                    <div className="flex justify-between items-center border-t border-slate-850 pt-3">
                      <div>
                        <h4 className="text-[11px] font-bold text-white leading-none">{data.previewTitle}</h4>
                        <p className="text-[9px] text-slate-500 leading-relaxed mt-1 max-w-sm">{data.previewDesc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tasks List Box */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Stage Milestone Tasks</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {data.tasks.map((task, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-900 border border-slate-850 p-2 rounded-lg">
                          <div className="w-3.5 h-3.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-md flex items-center justify-center text-[9px] font-bold">
                            {idx + 1}
                          </div>
                          <span className="text-[10px] text-slate-300 truncate font-medium">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Discussions & Alerts Logging Column (5 columns) */}
                <div className="lg:col-span-5 flex flex-col bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4 overflow-hidden h-full">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 uppercase tracking-wide font-bold">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      Workspace Chat Log
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">Real-time Feed</span>
                  </div>

                  {/* Simulated Chat Bubble Feed */}
                  <div className="flex-1 overflow-y-auto space-y-3 min-h-[260px] pr-1">
                    {data.chat.map((msg, i) => {
                      if (msg.sender === 'system') {
                        return (
                          <div key={i} className="flex justify-center">
                            <span className="text-[9px] bg-slate-900 border border-slate-850 text-slate-400 py-1 px-2.5 rounded-full font-mono text-center">
                              {msg.text}
                            </span>
                          </div>
                        );
                      }
                      
                      const isDev = msg.sender === 'dev';
                      const senderLabel = isDev ? 'Alex (Developer)' : 'Sarah (Client)';
                      const senderBadge = isDev ? 'bg-indigo-600/10 text-indigo-400' : 'bg-violet-600/10 text-violet-400';
                      
                      return (
                        <div key={i} className={`flex flex-col space-y-1 ${isDev ? 'items-start' : 'items-end'}`}>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-300 font-bold">{senderLabel}</span>
                            <span className={`text-[8px] font-bold uppercase tracking-wide px-1.5 rounded ${senderBadge}`}>
                              {isDev ? 'Dev' : 'Client'}
                            </span>
                          </div>
                          <div className={`p-3 rounded-xl max-w-[90%] text-[11px] leading-relaxed break-words ${
                            isDev 
                              ? 'bg-slate-900 border border-slate-850 rounded-tl-none' 
                              : 'bg-indigo-600 text-white rounded-tr-none'
                          }`}>
                            {msg.text}
                          </div>
                          <span className="text-[8px] text-slate-500 font-mono">{msg.time}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action prompt CTA */}
                  <div className="pt-3 border-t border-slate-900 flex justify-between items-center text-xs">
                    <span className="text-slate-500 text-[10px]">Ready to invite your partners?</span>
                    <button
                      onClick={() => onNavigateToAuth('signup')}
                      className="py-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 shadow-md shadow-indigo-600/10"
                    >
                      Kickoff Project
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </div>
      </section>

      {/* INTERACTIVE TIME & COST SAVINGS CALCULATOR (ROI ACCELERATOR) */}
      <section className="py-20 bg-white border-b border-slate-200/60 relative">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block">
              Cost & Alignment Calculator
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
              Calculate Your Feedback Savings
            </h2>
            <p className="text-xs text-slate-500">
              Vague emails and screen capturing chew up massive software budget. Slide the parameters to see your ROI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-50 border border-slate-200/60 p-6 md:p-10 rounded-3xl shadow-sm">
            
            {/* Column 1: Sliders Inputs (7 cols) */}
            <div className="md:col-span-7 space-y-6 text-left">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-indigo-600" />
                Your Project Parameters
              </h3>

              {/* Sliders 1 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Active Concurrent Projects</span>
                  <span className="font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 py-0.5 px-2.5 rounded-full">
                    {calcProjects} projects
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={calcProjects}
                  onChange={(e) => setCalcProjects(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1 Project</span>
                  <span>12 Projects</span>
                </div>
              </div>

              {/* Sliders 2 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Weekly Feedback Emails / Issues (per project)</span>
                  <span className="font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 py-0.5 px-2.5 rounded-full">
                    {calcEmails} back-and-forths
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={45}
                  value={calcEmails}
                  onChange={(e) => setCalcEmails(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>5 Exchanges</span>
                  <span>45 Exchanges</span>
                </div>
              </div>

              {/* Sliders 3 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Developer or Client Hourly Rate ($)</span>
                  <span className="font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 py-0.5 px-2.5 rounded-full">
                    ${calcHourlyRate} / hour
                  </span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={150}
                  value={calcHourlyRate}
                  onChange={(e) => setCalcHourlyRate(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>$25/hr</span>
                  <span>$150/hr</span>
                </div>
              </div>
            </div>

            {/* Column 2: Computations ROI Dashboard Outputs (5 cols) */}
            <div className="md:col-span-5 bg-indigo-900 text-white rounded-2xl p-6 border border-indigo-950 text-left space-y-4 shadow-lg shadow-indigo-950/10">
              <span className="text-[9px] font-mono text-indigo-200 uppercase tracking-widest block">
                Your Monthly Savings
              </span>

              {/* Computation logic block */}
              {(() => {
                // assume each email back and forth takes 15 minutes of dev/client time to read, formulate, reply, coordinate, adjust
                const hoursWastedWeekly = (calcEmails * 15 / 60) * calcProjects;
                const costWastedWeekly = hoursWastedWeekly * calcHourlyRate;
                const monthlyLoss = costWastedWeekly * 4.3;

                // DevFlw reduces visual revision times by 75%
                const monthlySaved = monthlyLoss * 0.75;
                const hoursSavedMonthly = hoursWastedWeekly * 4.3 * 0.75;

                return (
                  <div className="space-y-5">
                    {/* Big output display */}
                    <div className="space-y-1">
                      <h4 className="text-xs text-indigo-200 leading-none">Total Cash Saved</h4>
                      <div className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">
                        ${Math.round(monthlySaved).toLocaleString()} <span className="text-xs font-semibold text-indigo-200">/ mo</span>
                      </div>
                    </div>

                    <div className="border-t border-indigo-800 pt-4 space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-indigo-200">Feedback Hours Saved</span>
                        <span className="font-bold font-mono text-white">
                          {Math.round(hoursSavedMonthly)} hrs / mo
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-indigo-200">Email Back-and-forth Reduction</span>
                        <span className="font-bold text-emerald-400">
                          75% Less Noise
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-indigo-200">Project Velocity Increase</span>
                        <span className="font-bold text-amber-300">
                          40% Faster Approvals
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => onNavigateToAuth('signup')}
                        className="w-full py-3 bg-white hover:bg-indigo-50 text-indigo-900 font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        Start Saving Time Today
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-900" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>

        </div>
      </section>

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

      {/* FLOATING CONVERSATIONAL ASSISTANT BOT WIDGET (TEMPORARILY HIDDEN) */}
      {false && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          <AnimatePresence>
            {isBotOpen && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-80 md:w-96 overflow-hidden flex flex-col mb-4 max-h-[500px] text-slate-800"
              >
                {/* Header */}
                <div className="bg-indigo-900 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 font-bold border border-indigo-700">
                      <MessageSquare className="w-4 h-4 text-indigo-300" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold leading-none">DevFlw Assistant</h3>
                      <span className="text-[9px] text-emerald-400 font-medium flex items-center gap-1 mt-1 font-mono uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online & Ready
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsBotOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Chat Messages Log Container */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[280px] bg-slate-50">
                  {botMessages.map((msg, i) => {
                    const isBot = msg.sender === 'bot';
                    return (
                      <div key={i} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                        <div className={`p-3 rounded-2xl text-[11px] leading-relaxed max-w-[85%] ${
                          isBot 
                            ? 'bg-white border border-slate-200 rounded-tl-none text-slate-700 shadow-sm' 
                            : 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10'
                        }`}>
                          {msg.text}
                          <span className={`block text-[8px] mt-1 text-right font-mono ${isBot ? 'text-slate-400' : 'text-indigo-200'}`}>
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {botTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Interactive Quick-Options Selector */}
                {showBotOptions && botCurrentOptions.length > 0 && (
                  <div className="p-3 border-t border-slate-100 bg-white space-y-1.5 max-h-[140px] overflow-y-auto">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1 px-1">
                      Select an inquiry
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {botCurrentOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleBotSelectOption(opt, optionLabels[opt] || 'Inquire')}
                          className="py-1 px-2.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 text-[10px] font-bold rounded-full transition-all cursor-pointer text-left leading-none"
                        >
                          {optionLabels[opt] || opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual Question Input Bar */}
                <form onSubmit={handleCustomBotSubmit} className="border-t border-slate-100 p-3 bg-white flex gap-2">
                  <input
                    type="text"
                    value={customBotInput}
                    onChange={(e) => setCustomBotInput(e.target.value)}
                    placeholder="Ask a custom question..."
                    className="flex-1 text-xs py-1.5 px-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 bg-slate-50"
                  />
                  <button
                    type="submit"
                    disabled={!customBotInput.trim()}
                    className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center"
                  >
                    Ask
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Big Glow Floating Circle Trigger */}
          <button
            onClick={() => setIsBotOpen(!isBotOpen)}
            className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer relative group"
          >
            {/* Pulsing ring */}
            <span className="absolute -inset-1 rounded-full border-2 border-indigo-500/30 animate-ping opacity-75 group-hover:opacity-0" />
            
            <AnimatePresence mode="wait">
              {isBotOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="relative"
                >
                  <MessageSquare className="w-6 h-6" />
                  {/* Notification Badge Dot */}
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-indigo-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      )}

    </div>
  );
};
