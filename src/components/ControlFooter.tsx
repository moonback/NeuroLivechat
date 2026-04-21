import React from 'react';
import { Cpu, Wifi, Activity, Terminal, Shield } from 'lucide-react';

interface ControlFooterProps {
  taskCount: number;
  messageCount: number;
  isConnected: boolean;
}

export const ControlFooter: React.FC<ControlFooterProps> = ({ taskCount, messageCount, isConnected }) => {
  return (
    <footer className="col-span-full h-12 bg-brand-surface/60 backdrop-blur-md border-t border-white/[0.04] px-6 lg:px-8 hidden md:flex items-center justify-between z-10">

      {/* Left: Telemetry modules */}
      <div className="flex items-center gap-7">

        {/* Events */}
        <div className="flex items-center gap-2.5 group cursor-default">
          <Terminal className="w-3.5 h-3.5 text-white/25 group-hover:text-white/40 transition-colors" />
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-white/30">Events</span>
            <span className="text-[11px] font-semibold text-white/55 tabular-nums">
              {messageCount * 2 + 13}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-3.5 w-px bg-white/[0.06]" />

        {/* Status */}
        <div className="flex items-center gap-2.5 group cursor-default">
          <Activity className="w-3.5 h-3.5 text-white/25 group-hover:text-white/40 transition-colors" />
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-white/30">Status</span>
            <span className={`text-[11px] font-semibold ${isConnected ? 'text-emerald-400/70' : 'text-white/30'}`}>
              {isConnected ? 'Active' : 'Idle'}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-3.5 w-px bg-white/[0.06]" />

        {/* Tasks */}
        <div className="flex items-center gap-2.5 group cursor-default">
          {taskCount > 0 ? (
            <div className="w-4 h-4 rounded-md bg-brand-accent/20 text-brand-accent flex items-center justify-center">
              <span className="text-[9px] font-bold">{taskCount}</span>
            </div>
          ) : (
            <Cpu className="w-3.5 h-3.5 text-white/25 group-hover:text-white/40 transition-colors" />
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-white/30">Tasks</span>
            <span className="text-[11px] font-semibold text-white/55 tabular-nums">
              {taskCount} pending
            </span>
          </div>
        </div>
      </div>

      {/* Right: System info */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5 text-white/20 hover:text-white/35 transition-colors cursor-default">
          <Shield className="w-3 h-3" />
          <span className="text-[10px] font-medium tracking-wide">Encrypted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wifi className={`w-3 h-3 ${isConnected ? 'text-emerald-400/50' : 'text-white/20'} transition-colors`} />
          <span className="text-[10px] font-medium text-white/20 tracking-wide">WebSocket</span>
        </div>
      </div>
    </footer>
  );
};
