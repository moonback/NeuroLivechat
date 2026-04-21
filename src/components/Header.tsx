import React from 'react';

interface HeaderProps {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, isConnecting, isReconnecting }) => {
  return (
    <header className="col-span-full h-16 bg-black border-b border-white/10 flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 opacity-90">
          <svg viewBox="0 0 24 24" fill="black" className="w-full h-full">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-white/90 text-sm tracking-wide">
            NeuroLive
          </span>
          <span className="text-[10px] text-white/40 tracking-wider">
            Advanced Voice
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isConnected ? 'bg-white' : isReconnecting || isConnecting ? 'bg-white/50 animate-pulse' : 'bg-white/20'
            }`} />
          <span className="text-xs font-medium text-white/60">
            {isReconnecting ? 'Reconnecting' : isConnecting ? 'Connecting' : isConnected ? 'Connected' : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  );
};
