import React from 'react';
import { Mic, MicOff, Camera, CameraOff, Loader2, Settings2, Database, Scan, Cpu } from 'lucide-react';
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
  return (
    <aside className="hidden lg:flex flex-col gap-6 p-6 h-full overflow-y-auto w-[320px] bg-black border-r border-white/5">
      
      {/* Settings / Profile Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-white/80 tracking-wide">Assistant</span>
        <button 
          onClick={onOpenSettings}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main Connection Session Control */}
      <div className="flex flex-col gap-4">
        <button
          onClick={isConnected ? onDisconnect : onConnect}
          disabled={isConnecting}
          className={`relative overflow-hidden flex items-center justify-center gap-3 w-full py-4 rounded-full font-medium text-sm transition-all duration-300 ${
            isConnecting
              ? 'bg-white/10 text-white/50 cursor-not-allowed'
              : isConnected
                ? 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'
                : 'bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
          }`}
        >
          {isConnecting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isConnected ? (
            <MicOff className="w-5 h-5 transition-transform" />
          ) : (
            <Mic className="w-5 h-5 transition-transform" />
          )}
          <span>
            {isReconnecting ? 'Reconnecting...' : isConnecting ? 'Connecting...' : isConnected ? 'End conversation' : 'Start conversation'}
          </span>
        </button>
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-3 mt-2">
        
        {/* Camera Toggle Button */}
        <button
          onClick={() => setIsCameraEnabled(!isCameraEnabled)}
          className={`flex items-center justify-between w-full p-4 rounded-3xl transition-all duration-300 ${
            isCameraEnabled 
              ? 'bg-white/10 text-white border border-white/5' 
              : 'hover:bg-white/5 border border-transparent text-white/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-full transition-colors ${isCameraEnabled ? 'bg-white text-black' : 'bg-transparent text-current'}`}>
              {isCameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">Vision</span>
              <span className="text-xs text-white/40">
                {isCameraEnabled ? 'Camera is on' : 'Camera is off'}
              </span>
            </div>
          </div>
        </button>

        {/* Live Optic Preview (If Active) */}
        <AnimatePresence>
          {isCameraEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="flex flex-col origin-top px-1 mt-2"
            >
              <div className="relative aspect-video bg-white/5 rounded-3xl overflow-hidden border border-white/10">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl pointer-events-none" />
                
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] font-medium tracking-wide bg-black/40 backdrop-blur-xl text-white px-3 py-1.5 rounded-full border border-white/10">
                    {isVisionContinue ? 'Continuous Mode' : 'Standard Mode'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Active Modules (Subtle footer) */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <span className="text-xs font-medium text-white/40 px-3 mb-3 block">Integrations</span>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-default">
            <Database className="w-4 h-4" />
            <span className="text-sm font-medium">Web Search</span>
          </div>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-default">
            <Scan className="w-4 h-4" />
            <span className="text-sm font-medium">Vision Processing</span>
          </div>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-default">
            <Cpu className="w-4 h-4" />
            <span className="text-sm font-medium">Long-term Memory</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
