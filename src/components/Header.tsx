import React from 'react';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, isConnecting, isReconnecting }) => {
  const statusLabel = isReconnecting
    ? 'Reconnecting'
    : isConnecting
      ? 'Connecting'
      : isConnected
        ? 'Live'
        : 'Offline';

  const statusColor = isConnected
    ? 'bg-emerald-400'
    : isReconnecting || isConnecting
      ? 'bg-amber-400'
      : 'bg-white/20';

  return (
    <header className="col-span-full h-[60px] flex items-center justify-between px-6 lg:px-8 z-10 border-b border-white/[0.04] bg-brand-bg/80 backdrop-blur-xl">

      {/* Logo + Brand */}
      <div className="flex items-center gap-3.5">
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-brand-accent to-purple-500 flex items-center justify-center shadow-lg shadow-brand-accent/20">
          <Sparkles className="w-[18px] h-[18px] text-white" />
          <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
        </div>
        <div className="flex flex-col -space-y-0.5">
          <span className="font-semibold text-[15px] text-white tracking-tight">
            NeuroLive
          </span>
          <span className="text-[11px] text-white/35 font-medium tracking-wide">
            Advanced Voice AI
          </span>
        </div>
      </div>

      {/* Connection Status Pill */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
          <div className="relative flex items-center justify-center">
            <div className={`w-[7px] h-[7px] rounded-full ${statusColor} transition-colors duration-500`} />
            {(isConnected || isConnecting || isReconnecting) && (
              <div className={`absolute w-[7px] h-[7px] rounded-full ${statusColor} animate-status-ping`} />
            )}
          </div>
          <span className="text-[12px] font-medium text-white/50 tracking-wide">
            {statusLabel}
          </span>
        </div>
      </div>
    </header>
  );
};
