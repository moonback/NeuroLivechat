import React from 'react';
import { Mic, MicOff, Camera, CameraOff, Loader2, Settings2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  isConnected: boolean;
  isConnecting: boolean;
  isCameraEnabled: boolean;
  setIsCameraEnabled: (val: boolean) => void;
  voiceName: string;
  setVoiceName: (val: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  showDevPanel: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isConnected,
  isConnecting,
  isCameraEnabled,
  setIsCameraEnabled,
  voiceName,
  setVoiceName,
  onConnect,
  onDisconnect,
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
          className={`group relative overflow-hidden flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-sm transition-all duration-300 shadow-lg ${
            isConnecting 
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
            {isConnecting ? 'Initialising' : isConnected ? 'Terminate' : 'Initialize'}
          </span>
        </button>
      </div>

      {/* Model Context */}
      <div className="flex flex-col gap-2 p-4 rounded-2xl bg-black/30 border border-brand-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono text-brand-text-dim uppercase tracking-wider">Engine</span>
          <Info className="w-3 h-3 text-brand-text-dim opacity-50" />
        </div>
        <div className="text-xs font-semibold text-brand-primary flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_var(--color-brand-primary)]" />
          gemini-3.1-flash
        </div>
      </div>

      {/* Configuration */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <Settings2 className="w-3.5 h-3.5 text-brand-text-dim" />
          <span className="text-[10px] font-mono text-brand-text-dim uppercase tracking-widest font-bold">Parameters</span>
        </div>
        
        <div className="flex flex-col gap-3">
          {/* Voice Selector */}
          <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-black/30 border border-brand-border hover:border-brand-primary/30 transition-colors">
            <label className="text-[10px] text-brand-text-dim uppercase font-bold tracking-tight">Vocal Signature</label>
            <select 
              className="bg-transparent border-none outline-none text-sm font-medium text-brand-text cursor-pointer w-full appearance-none pr-6" 
              value={voiceName} 
              onChange={e => setVoiceName(e.target.value)} 
              disabled={isConnected}
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(148, 163, 184, 0.5)\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '16px' }}
            >
              <option value="Puck">Puck (Alto)</option>
              <option value="Charon">Charon (Bass)</option>
              <option value="Kore">Kore (Soprano)</option>
              <option value="Fenrir">Fenrir (Baritone)</option>
              <option value="Zephyr">Zephyr (Tenor)</option>
            </select>
          </div>

          {/* Optic Toggles */}
          <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-black/30 border border-brand-border overflow-hidden">
             <div className="flex items-center justify-between">
                <div className="flex flex-col">
                   <span className="text-[10px] text-brand-text-dim uppercase font-bold tracking-tight">Optic Sensor</span>
                   <span className="text-[9px] text-brand-primary/60 font-mono tracking-tighter">Real-time Vision</span>
                </div>
                <button 
                  onClick={() => !isConnected && setIsCameraEnabled(!isCameraEnabled)} 
                  disabled={isConnected} 
                  className={`p-2 rounded-xl transition-all ${isCameraEnabled ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/20' : 'bg-slate-800 text-slate-400 opacity-50'}`}
                >
                  {isCameraEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                </button>
             </div>

             <AnimatePresence>
                {isCameraEnabled && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="relative aspect-video bg-black rounded-xl border border-brand-border overflow-hidden shadow-inner flex items-center justify-center group"
                  >
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1]" />
                    <div className="absolute inset-0 border-[0.5px] border-brand-primary/20 pointer-events-none" />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                      <span className="text-[8px] font-mono text-brand-primary tracking-widest uppercase">REC</span>
                    </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Network Stats */}
      <div className="mt-auto grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 p-3 rounded-2xl bg-black/20 border border-brand-border">
          <span className="text-[9px] text-brand-text-dim uppercase font-mono">Capture</span>
          <span className="text-xs font-mono">16.0 kHz</span>
        </div>
        <div className="flex flex-col gap-1 p-3 rounded-2xl bg-black/20 border border-brand-border">
          <span className="text-[9px] text-brand-text-dim uppercase font-mono">Playback</span>
          <span className="text-xs font-mono">24.0 kHz</span>
        </div>
      </div>
    </aside>
  );
};
