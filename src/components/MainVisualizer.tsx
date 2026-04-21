import React from 'react';
import { Loader2, Mic, MicOff } from 'lucide-react';

interface MainVisualizerProps {
  isConnected: boolean;
  isConnecting: boolean;
  isAssistantTalking: boolean;
  barHeights: number[];
  isHighVolume: boolean[];
  onConnect: () => void;
  onDisconnect: () => void;
}

export const MainVisualizer: React.FC<MainVisualizerProps> = ({
  isConnected,
  isConnecting,
  isAssistantTalking,
  barHeights,
  isHighVolume,
  onConnect,
  onDisconnect
}) => {
  return (
    <div className="relative flex-none h-64 lg:h-auto lg:flex-1 rounded-[2.5rem] overflow-hidden border border-brand-border bg-black group transition-all duration-700">
      {/* Background Ambience */}
      <div className={`absolute inset-0 opacity-20 transition-opacity duration-1000 ${isConnected ? 'opacity-30' : 'opacity-10'}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square bg-radial-gradient from-brand-primary/20 via-transparent to-transparent animate-slow-pulse" />
      </div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(var(--color-brand-border) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Waveform Central */}
      <div className="absolute inset-0 flex items-center justify-center gap-2 md:gap-3">
        {barHeights.map((height, i) => (
          <div
            key={i}
            className="w-1.5 md:w-2 rounded-full transition-all duration-75"
            style={{
              height: `${height}px`,
              backgroundColor: isHighVolume[i] 
                ? (i > 2 && i < 6 ? 'var(--color-brand-error)' : 'white') 
                : 'var(--color-brand-primary)',
              boxShadow: isHighVolume[i] ? '0 0 20px rgba(255, 255, 255, 0.5)' : 'none',
              opacity: isConnected ? (isAssistantTalking ? 1 : 0.6) : 0.2
            }}
          />
        ))}
      </div>

      {/* Status Overlay Labels */}
      <div className="absolute top-8 left-8 flex flex-col gap-1">
        <span className="text-[10px] font-mono text-brand-text-dim uppercase tracking-[0.3em] font-black">Link Status</span>
        <div className="flex items-center gap-2">
           <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-brand-primary shadow-[0_0_8px_var(--color-brand-primary)]' : 'bg-brand-text-dim'}`} />
           <span className="text-xs font-mono font-bold tracking-tighter">
             {isConnecting ? 'INITIATING_SEQUENCE' : isConnected ? 'STABLE_UPLINK' : 'SYSTEM_IDLE'}
           </span>
        </div>
      </div>

      <div className="absolute top-8 right-8 text-right flex flex-col gap-1">
        <span className="text-[10px] font-mono text-brand-text-dim uppercase tracking-[0.3em] font-black">Process Mode</span>
        <span className={`text-xs font-mono font-bold ${isAssistantTalking ? 'text-brand-primary' : 'text-brand-text-dim'}`}>
          {isConnecting ? 'DATA_SYNC...' : isConnected ? (isAssistantTalking ? 'OUTPUT_STREAM' : 'WAITING_VOICE') : 'STANDBY'}
        </span>
      </div>

      {/* Mobile Interaction Button */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:hidden">
        <button
          onClick={isConnected ? onDisconnect : onConnect}
          disabled={isConnecting}
          className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl transition-all active:scale-90 border border-white/10 ${
            isConnecting ? 'bg-slate-800' : isConnected ? 'bg-brand-error shadow-brand-error/20' : 'bg-brand-primary shadow-brand-primary/20 text-black'
          }`}
        >
          {isConnecting ? <Loader2 className="w-7 h-7 animate-spin" /> : isConnected ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
        </button>
      </div>

      {/* Visual Accents (Corners) */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-brand-primary/20 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-brand-primary/20 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-brand-primary/20 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-brand-primary/20 rounded-br-lg" />
    </div>
  );
};
