import React from 'react';
import { Sparkles, Mic, MicOff, Loader2 } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, isConnecting, isReconnecting, onConnect, onDisconnect }) => {
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
    <header className="col-span-full h-[66px] flex items-center justify-between px-6 lg:px-8 z-20 border-b border-white/[0.04] bg-brand-bg/80 backdrop-blur-xl">

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

      <div className="flex items-center gap-4">
        {/* Connection Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
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

        {/* ── Action Button: Connect / Disconnect ── */}
        <button
          onClick={isConnected ? onDisconnect : onConnect}
          disabled={isConnecting}
          className={`relative overflow-hidden flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-semibold text-[13px] tracking-wide transition-all duration-300 btn-press h-10 ${
            isConnecting
              ? 'bg-white/[0.06] text-white/40 cursor-not-allowed'
              : isConnected
                ? 'bg-red-500/10 text-red-400 border border-red-500/15 hover:bg-red-500/20 hover:text-red-300'
                : 'bg-white text-brand-bg hover:shadow-lg hover:shadow-white/10 hover:scale-[1.02]'
          }`}
        >
          {isConnecting ? (
            <Loader2 className="w-[15px] h-[15px] animate-spin" />
          ) : isConnected ? (
            <MicOff className="w-[15px] h-[15px]" />
          ) : (
            <Mic className="w-[15px] h-[15px]" />
          )}
          <span>
            {isReconnecting ? 'Retry' : isConnecting ? 'Waiting' : isConnected ? 'End' : 'Start'}
          </span>
          
          {!isConnected && !isConnecting && (
            <div className="absolute inset-0 animate-shimmer pointer-events-none" />
          )}
        </button>
      </div>
    </header>
  );
};
