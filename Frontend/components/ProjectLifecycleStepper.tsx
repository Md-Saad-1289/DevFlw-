import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Cpu, ClipboardCheck, Users, RefreshCw, 
  CheckCircle2, Sparkles, Archive, Check, ArrowRight, Info
} from 'lucide-react';
import { Project } from '../types';

export const LIFECYCLE_STAGES = [
  'Planning',
  'In Progress',
  'Ready for Review',
  'Client Review',
  'Changes Requested',
  'Approved',
  'Completed',
  'Archived'
] as const;

export type LifecycleStage = typeof LIFECYCLE_STAGES[number];

interface ProjectLifecycleStepperProps {
  currentStage?: LifecycleStage;
  onStageChange: (stage: LifecycleStage) => Promise<void>;
  userRole: 'developer' | 'client' | 'admin';
}

const STAGE_DETAILS: Record<LifecycleStage, { 
  label: string; 
  desc: string; 
  icon: React.ComponentType<any>; 
  color: string;
  activeColor: string;
}> = {
  'Planning': {
    label: 'Planning',
    desc: 'Scope definitions, user journeys, & spec drafting.',
    icon: Compass,
    color: 'text-sky-500 bg-sky-50 border-sky-100',
    activeColor: 'bg-sky-600 text-white ring-sky-500/35'
  },
  'In Progress': {
    label: 'In Progress',
    desc: 'Active development, design iteration, & coding.',
    icon: Cpu,
    color: 'text-indigo-500 bg-indigo-50 border-indigo-100',
    activeColor: 'bg-indigo-600 text-white ring-indigo-500/35'
  },
  'Ready for Review': {
    label: 'Ready for Review',
    desc: 'Developer marked builds ready for initial inspect.',
    icon: ClipboardCheck,
    color: 'text-amber-500 bg-amber-50 border-amber-100',
    activeColor: 'bg-amber-500 text-white ring-amber-500/35'
  },
  'Client Review': {
    label: 'Client Review',
    desc: 'Interactive demo review & collaborative pin logging.',
    icon: Users,
    color: 'text-violet-500 bg-violet-50 border-violet-100',
    activeColor: 'bg-violet-600 text-white ring-violet-500/35'
  },
  'Changes Requested': {
    label: 'Changes Requested',
    desc: 'Client logged revision requests or feature edits.',
    icon: RefreshCw,
    color: 'text-rose-500 bg-rose-50 border-rose-100',
    activeColor: 'bg-rose-500 text-white ring-rose-500/35'
  },
  'Approved': {
    label: 'Approved',
    desc: 'Client approved active builds as fully compliant.',
    icon: CheckCircle2,
    color: 'text-emerald-500 bg-emerald-50 border-emerald-100',
    activeColor: 'bg-emerald-600 text-white ring-emerald-500/35'
  },
  'Completed': {
    label: 'Completed',
    desc: 'All milestone items fully deployed & accepted.',
    icon: Sparkles,
    color: 'text-fuchsia-500 bg-fuchsia-50 border-fuchsia-100',
    activeColor: 'bg-fuchsia-600 text-white ring-fuchsia-500/35'
  },
  'Archived': {
    label: 'Archived',
    desc: 'Project successfully locked & cataloged.',
    icon: Archive,
    color: 'text-slate-500 bg-slate-50 border-slate-100',
    activeColor: 'bg-slate-700 text-white ring-slate-500/35'
  }
};

export const ProjectLifecycleStepper: React.FC<ProjectLifecycleStepperProps> = ({
  currentStage = 'Planning',
  onStageChange,
  userRole
}) => {
  const currentIndex = LIFECYCLE_STAGES.indexOf(currentStage);
  const [hoveredStage, setHoveredStage] = useState<LifecycleStage | null>(null);
  const [updatingStage, setUpdatingStage] = useState<LifecycleStage | null>(null);
  const [confirmStage, setConfirmStage] = useState<LifecycleStage | null>(null);

  const handleStageClick = (stage: LifecycleStage) => {
    if (stage === currentStage) return;
    setConfirmStage(stage);
  };

  const proceedWithStageChange = async () => {
    if (!confirmStage) return;
    const stageToSet = confirmStage;
    setConfirmStage(null);
    setUpdatingStage(stageToSet);
    try {
      await onStageChange(stageToSet);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingStage(null);
    }
  };

  return (
    <div id="lifecycle-stepper-box" className="w-full bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Stepper Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
            Project Lifecycle Status
          </h3>
          <p className="text-[11px] text-slate-500">
            Interactive workflow pipeline. Click any milestone state below to progress the project.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] bg-slate-50 border border-slate-100 text-slate-600 py-1 px-2.5 rounded-lg">
          <Info className="w-3.5 h-3.5 text-indigo-500" />
          <span>Authorized as: <strong className="uppercase font-bold text-indigo-700">{userRole}</strong></span>
        </div>
      </div>

      {/* Stepper Flow Grid (Desktop Row / Mobile Scroll) */}
      <div className="relative overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center justify-between min-w-[900px] gap-2 py-3 px-1">
          {LIFECYCLE_STAGES.map((stage, idx) => {
            const details = STAGE_DETAILS[stage];
            const IconComponent = details.icon;
            
            const isCurrent = stage === currentStage;
            const isCompleted = idx < currentIndex;
            const isPending = idx > currentIndex;

            // Determine border and connector colors
            let stepStateColor = 'border-slate-200 bg-white text-slate-400';
            let lineStateColor = 'bg-slate-200';

            if (isCurrent) {
              stepStateColor = details.activeColor + ' ring-4 animate-none scale-110';
              lineStateColor = 'bg-indigo-500';
            } else if (isCompleted) {
              stepStateColor = 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100/50';
              lineStateColor = 'bg-emerald-500';
            } else {
              stepStateColor = 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600';
            }

            const isLast = idx === LIFECYCLE_STAGES.length - 1;

            return (
              <React.Fragment key={stage}>
                {/* Node representation */}
                <div 
                  className="flex flex-col items-center flex-1 min-w-[100px] relative group"
                  onMouseEnter={() => setHoveredStage(stage)}
                  onMouseLeave={() => setHoveredStage(null)}
                >
                  {/* Circle Button */}
                  <button
                    id={`lifecycle-step-btn-${stage.replace(/\s+/g, '-').toLowerCase()}`}
                    type="button"
                    onClick={() => handleStageClick(stage)}
                    disabled={updatingStage !== null}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer shadow-sm relative ${stepStateColor} ${
                      updatingStage === stage ? 'animate-pulse opacity-50' : ''
                    }`}
                    title={`Click to set stage to ${stage}`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <IconComponent className="w-4 h-4" />
                    )}

                    {/* Ping accent for active */}
                    {isCurrent && (
                      <span className="absolute -inset-1 rounded-full border-2 border-indigo-500/40 animate-ping opacity-70 pointer-events-none" />
                    )}
                  </button>

                  {/* Stage Label */}
                  <span className={`text-[11px] font-bold mt-2.5 transition-colors ${
                    isCurrent 
                      ? 'text-indigo-600 scale-105' 
                      : isCompleted 
                        ? 'text-emerald-700' 
                        : 'text-slate-500'
                  }`}>
                    {stage}
                  </span>

                  {/* Quick summary hover tooltip */}
                  <AnimatePresence>
                    {hoveredStage === stage && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full mb-3 z-50 bg-slate-900 text-white rounded-xl p-3 w-56 text-left shadow-xl border border-slate-800 text-xs pointer-events-none"
                      >
                        <div className="flex items-center gap-1.5 font-bold mb-1 text-indigo-400">
                          <IconComponent className="w-3.5 h-3.5" />
                          {stage}
                        </div>
                        <p className="text-[10px] text-slate-300 leading-normal">{details.desc}</p>
                        <div className="mt-2 text-[8px] uppercase tracking-wider font-extrabold text-slate-400 border-t border-slate-800 pt-1">
                          {isCurrent ? 'Current Phase' : isCompleted ? 'Completed' : 'Click to Set'}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Connecting Line */}
                {!isLast && (
                  <div className="flex-1 h-0.5 min-w-[20px] max-w-[80px] relative">
                    <div className={`absolute inset-0 rounded-full transition-colors ${lineStateColor}`} />
                    {isCompleted && (
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        className="absolute top-0 bottom-0 left-0 bg-emerald-500 rounded-full"
                        transition={{ duration: 0.4 }}
                      />
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Confirmation Dialog overlay */}
      <AnimatePresence>
        {confirmStage && (
          <div id="lifecycle-confirm-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmStage(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl p-5 max-w-sm w-full relative z-10 space-y-4"
            >
              <div className="flex items-center gap-2.5 text-slate-900">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${STAGE_DETAILS[confirmStage].color}`}>
                  {React.createElement(STAGE_DETAILS[confirmStage].icon, { className: 'w-4 h-4' })}
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Transition Workspace</h4>
                  <h3 className="text-sm font-bold text-slate-900">Change phase to "{confirmStage}"?</h3>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] text-slate-500 leading-normal">
                  You are setting the active project stage to <strong>{confirmStage}</strong>. 
                  This will update the project board and instantly notify all connected participants.
                </p>
                <div className="bg-slate-50 p-2.5 rounded-lg border text-[10px] text-slate-400 leading-normal flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <span>
                    A notification message will automatically be published to the workspace discussions timeline.
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  id="confirm-lifecycle-cancel"
                  onClick={() => setConfirmStage(null)}
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                >
                  Keep "{currentStage}"
                </button>
                <button
                  type="button"
                  id="confirm-lifecycle-submit"
                  onClick={proceedWithStageChange}
                  className="py-1.5 px-4.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-colors"
                >
                  Set Phase
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Description display of current phase */}
      <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 mt-0.5">
            {React.createElement(STAGE_DETAILS[currentStage].icon, { className: 'w-4 h-4' })}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Pipeline Position</span>
            <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
              {currentStage}
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-500 font-normal">{STAGE_DETAILS[currentStage].desc}</span>
            </h4>
          </div>
        </div>
      </div>

    </div>
  );
};
