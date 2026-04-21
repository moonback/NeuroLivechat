import React from 'react';
import { Mic, MicOff, Camera, CameraOff, Loader2, Settings2, Globe, Scan, Brain, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

        {/* ── Primary CTA: Connect / Disconnect ── */}
        <button
          onClick={isConnected ? onDisconnect : onConnect}
          disabled={isConnecting}
          className={`relative overflow-hidden flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-semibold text-[14px] tracking-wide transition-all duration-300 btn-press ${
            isConnecting
              ? 'bg-white/[0.06] text-white/40 cursor-not-allowed'
              : isConnected
                ? 'bg-red-500/10 text-red-400 border border-red-500/15 hover:bg-red-500/20 hover:text-red-300'
                : 'bg-white text-brand-bg hover:shadow-lg hover:shadow-white/10 hover:scale-[1.01]'
          }`}
        >
          {isConnecting ? (
            <Loader2 className="w-[18px] h-[18px] animate-spin" />
          ) : isConnected ? (
            <MicOff className="w-[18px] h-[18px]" />
          ) : (
            <Mic className="w-[18px] h-[18px]" />
          )}
          <span>
            {isReconnecting ? 'Reconnecting...' : isConnecting ? 'Connecting...' : isConnected ? 'End Session' : 'Start Session'}
          </span>

          {/* Subtle shimmer on idle CTA */}
          {!isConnected && !isConnecting && (
            <div className="absolute inset-0 animate-shimmer rounded-2xl pointer-events-none" />
          )}
        </button>

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

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Integrations ── */}
        <div className="border-t border-white/[0.04] pt-5 pb-2">
          <span className="text-[11px] font-semibold text-white/30 uppercase tracking-widest px-1 mb-3 block">
            Integrations
          </span>

          <div className="flex flex-col gap-1">
            {integrations.map(({ icon: Icon, label, desc, active }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-200 cursor-default group"
              >
                <div className={`p-1.5 rounded-lg ${active ? 'bg-white/[0.06]' : 'bg-transparent'} transition-colors`}>
                  <Icon className="w-[15px] h-[15px]" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[13px] font-medium truncate">{label}</span>
                  <span className="text-[10px] text-white/25 font-medium">{desc}</span>
                </div>
                {active && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
