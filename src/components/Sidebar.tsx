import React from 'react';
import { Mic, MicOff, Camera, CameraOff, Loader2, Settings2, Info } from 'lucide-react';
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
  setIsVisionContinue,
  voiceName,
  setVoiceName,
  onConnect,
  onDisconnect,
  onOpenSettings,
  videoRef,
  showDevPanel
}) => {
  return (
    <aside className="hidden lg:flex flex-col gap-6 p-6 glass-light border-r border-brand-border h-full overflow-y-auto">
      {/* Session Control */}
      <div className="flex flex-col gap-4">
        <button
          onClick={isConnected ? onDisconnect : onConnect}
          disabled={isConnecting}
          className={`group relative overflow-hidden flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-sm transition-all duration-300 shadow-lg ${isConnecting
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : isConnected
              ? 'bg-brand-error/10 text-brand-error border border-brand-error/20 hover:bg-brand-error hover:text-white'
              : 'bg-brand-primary text-black hover:scale-[1.02] active:scale-95 shadow-brand-primary/20'
            }`}
        >
          {isConnecting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isConnected ? (
            <MicOff className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          ) : (
            <Mic className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
          )}
          <span className="relative z-10">
            {isReconnecting ? 'Réessayer' : isConnecting ? 'Initialisation' : isConnected ? 'Terminer' : 'Commencer'}
          </span>
        </button>
      </div>



      {/* Configuration & Controls */}
      <div className="flex flex-col gap-4">
        {/* Camera Toggle Button */}
        <button
          onClick={() => setIsCameraEnabled(!isCameraEnabled)}
          className={`flex items-center justify-between w-full p-4 rounded-2xl border transition-all duration-300 group ${
            isCameraEnabled 
              ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary' 
              : 'bg-black/30 border-brand-border hover:border-brand-primary/40 text-brand-text-dim hover:text-brand-text'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl transition-colors ${isCameraEnabled ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/20' : 'bg-slate-800'}`}>
              {isCameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold font-mono tracking-tight lowercase">Visual Sensor</span>
              <span className="text-[10px] uppercase tracking-widest font-black opacity-50">
                {isCameraEnabled ? 'Active' : 'Offline'}
              </span>
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full ${isCameraEnabled ? 'bg-brand-primary animate-pulse shadow-[0_0_8px_var(--color-brand-primary)]' : 'bg-slate-700'}`} />
        </button>

        <button
          onClick={onOpenSettings}
          className="flex items-center justify-between w-full p-4 rounded-2xl bg-black/30 border border-brand-border hover:border-brand-primary/40 group transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-brand-text-dim group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-colors">
              <Settings2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold font-mono tracking-tight group-hover:text-brand-text">Config Console</span>
              <span className="text-[10px] text-brand-text-dim uppercase tracking-widest font-black opacity-50">Parameters</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full border border-brand-border flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
            <div className="w-1.5 h-1.5 border-t-2 border-r-2 border-brand-primary rotate-45" />
          </div>
        </button>

        {/* Live Optic Preview (If Active) */}
        <AnimatePresence>
          {isCameraEnabled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col gap-3 p-4 rounded-3xl bg-black/40 border border-brand-border overflow-hidden"
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse shadow-[0_0_8px_var(--color-brand-primary)]" />
                  <span className="text-[10px] font-mono text-brand-primary uppercase tracking-[0.2em] font-black">Live Feed</span>
                </div>
                <button
                  onClick={() => setIsCameraEnabled(false)}
                  className="text-[10px] font-mono text-brand-text-dim hover:text-brand-error transition-colors uppercase tracking-widest"
                >
                  Kill
                </button>
              </div>

              <div className="relative aspect-video bg-black rounded-2xl border border-brand-border overflow-hidden shadow-2xl group/camera">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1] brightness-[1.1]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 border-[0.5px] border-brand-primary/10 pointer-events-none" />

                {/* Viewport Marks */}
                <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-brand-primary/40 rounded-tl" />
                <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-brand-primary/40 rounded-tr" />
                <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-brand-primary/40 rounded-bl" />
                <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-brand-primary/40 rounded-br" />

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/camera:opacity-100 transition-opacity">
                  <span className="text-[8px] font-mono bg-black/60 backdrop-blur px-2 py-1 rounded border border-white/5 tracking-widest uppercase">
                    {isVisionContinue ? 'HI_RES_SYNC' : 'STD_OPTIC'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


    </aside>
  );
};
