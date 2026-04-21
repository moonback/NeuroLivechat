import React from 'react';

interface HeaderProps {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, isConnecting, isReconnecting }) => {
  return (
    <header className="col-span-full h-16 glass flex items-center justify-between px-8 border-b border-brand-border z-10">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center p-2 shadow-lg shadow-brand-primary/20">
          <svg viewBox="0 0 24 24" fill="black" className="w-full h-full">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-bold tracking-tighter text-lg leading-none">
            NEURO<span className="text-brand-primary">LIVE</span>
          </span>
          <span className="text-[10px] text-brand-text-dim font-mono tracking-widest uppercase opacity-70">
            Advanced AI Interface v3.1
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 bg-black/40 rounded-full px-4 py-1.5 border border-brand-border">
          <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
            isConnected ? 'bg-brand-primary status-glow' : isReconnecting || isConnecting ? 'bg-amber-400 animate-pulse' : 'bg-brand-text-dim'
          }`} />
          <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">
            {isReconnecting ? 'Re-establishing Link...' : isConnecting ? 'Establishing Link...' : isConnected ? 'Live Connection' : 'System Offline'}
          </span>
        </div>
        
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] text-brand-text-dim uppercase font-mono tracking-tighter">Latency</span>
          <span className="text-xs font-mono text-brand-primary">24ms</span>
        </div>
      </div>
    </header>
  );
};
