import React from 'react';
import { Mic, MicOff, Camera, CameraOff, Loader2, Settings2, Globe, Scan, Brain, ListCheck, Trash2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../utils/taskService';

interface SidebarProps {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  isCameraEnabled: boolean;
  setIsCameraEnabled: (val: boolean) => void;
  isVisionContinue: boolean;
  setIsVisionContinue: (val: boolean) => void;
  voiceName: string;
  setVoiceName: (val: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onOpenSettings: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  showDevPanel: boolean;
  tasks: Task[];
  onRemoveTask: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isConnected,
  isConnecting,
  isReconnecting,
  isCameraEnabled,
  setIsCameraEnabled,
  isVisionContinue,
  onConnect,
  onDisconnect,
  onOpenSettings,
  videoRef,
  tasks,
  onRemoveTask
}) => {
  const integrations = [
    { icon: Globe, label: 'Web Search', desc: 'Real-time results', active: true },
    { icon: Scan, label: 'Vision Processing', desc: 'Image analysis', active: isCameraEnabled },
    { icon: Brain, label: 'Long-term Memory', desc: 'Context recall', active: true },
  ];

  return (
    <aside className="hidden lg:flex flex-col h-full overflow-y-auto w-[340px] bg-brand-surface/50 border-r border-white/[0.04]">

      {/* Top: Settings Row */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <span className="text-[13px] font-semibold text-white/50 uppercase tracking-widest">
          Controls
        </span>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl hover:bg-white/[0.06] transition-all duration-200 text-white/40 hover:text-white/80 btn-press"
          aria-label="Open settings"
        >
          <Settings2 className="w-[18px] h-[18px]" />
        </button>
      </div>

      <div className="flex flex-col gap-3 px-5 pt-4 flex-1">

        {/* ── Camera Toggle ── */}
        <button
          onClick={() => setIsCameraEnabled(!isCameraEnabled)}
          className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all duration-300 btn-press group ${
            isCameraEnabled
              ? 'glass-card !bg-brand-accent-soft border-brand-accent/20'
              : 'glass-card'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`p-2.5 rounded-xl transition-all duration-300 ${
              isCameraEnabled
                ? 'bg-brand-accent text-white shadow-md shadow-brand-accent/25'
                : 'bg-white/[0.06] text-white/50 group-hover:text-white/70'
            }`}>
              {isCameraEnabled ? <Camera className="w-[18px] h-[18px]" /> : <CameraOff className="w-[18px] h-[18px]" />}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[13px] font-semibold text-white/90">Vision</span>
              <span className="text-[11px] text-white/35 font-medium">
                {isCameraEnabled ? 'Camera active' : 'Camera disabled'}
              </span>
            </div>
          </div>

          {/* Toggle indicator */}
          <div className={`w-10 h-[22px] rounded-full transition-all duration-300 relative ${
            isCameraEnabled ? 'bg-brand-accent' : 'bg-white/10'
          }`}>
            <div className={`w-[18px] h-[18px] rounded-full bg-white absolute top-[2px] transition-all duration-300 shadow-sm ${
              isCameraEnabled ? 'left-[20px]' : 'left-[2px]'
            }`} />
          </div>
        </button>

        {/* ── Camera Preview ── */}
        <AnimatePresence>
          {isCameraEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.97 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col origin-top"
            >
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/[0.06]">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/[0.06] rounded-2xl pointer-events-none" />

                {/* Mode badge */}
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] font-semibold tracking-wider uppercase bg-black/50 backdrop-blur-xl text-white/70 px-3 py-1.5 rounded-lg border border-white/[0.08]">
                    {isVisionContinue ? '● Continuous' : '○ Standard'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Current Tasks ── */}
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">
              Current Tasks
            </span>
            {tasks.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-white/[0.05] text-[10px] font-bold text-white/40">
                {tasks.length}
              </span>
            )}
          </div>

          <AnimatePresence mode="popLayout" initial={false}>
            {tasks.length > 0 ? (
              <div className="flex flex-col gap-2">
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    className="glass-card p-3 rounded-xl flex items-start gap-3 group relative overflow-hidden"
                  >
                    <div className="p-2 rounded-lg bg-white/[0.03] text-white/30 group-hover:text-brand-accent transition-colors mt-0.5">
                      <ListCheck className="w-[14px] h-[14px]" />
                    </div>
                    <div className="flex flex-col gap-1 flex-1 pr-6">
                      <span className="text-[12px] text-white/80 font-medium leading-tight">{task.text}</span>
                      <div className="flex items-center gap-1.5 text-[10px] text-white/20 font-medium italic">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Just now</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveTask(task.id)}
                      className="absolute right-2 top-2 p-1.5 rounded-lg text-white/10 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-[14px] h-[14px]" />
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 px-4 rounded-2xl border border-dashed border-white/[0.05] bg-white/[0.01]"
              >
                <div className="w-10 h-10 rounded-full bg-white/[0.02] flex items-center justify-center mb-3">
                  <ListCheck className="w-5 h-5 text-white/10" />
                </div>
                <span className="text-[11px] text-white/20 font-medium text-center">No tasks in progress</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Spacer ── */}
        <div className="flex-1 min-h-[40px]" />

        {/* ── Integrations ── */}
        <div className="border-t border-white/[0.04] pt-4 pb-2 mt-auto">
          <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest px-1 mb-2 block">
            Integrations
          </span>

          <div className="flex flex-col gap-0.5">
            {integrations.map(({ icon: Icon, label, desc, active }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/[0.03] transition-all duration-200 cursor-default group"
              >
                <div className={`p-1.5 rounded-lg ${active ? 'bg-white/[0.05]' : 'bg-transparent'} transition-colors`}>
                  <Icon className="w-[14px] h-[14px]" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[12px] font-medium truncate leading-tight">{label}</span>
                  <span className="text-[9px] text-white/20 font-medium leading-tight">{desc}</span>
                </div>
                {active && (
                  <div className="w-1 h-1 rounded-full bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
