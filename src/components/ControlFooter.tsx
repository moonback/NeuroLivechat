import React from 'react';
import { Cpu, Wifi, Activity, Terminal } from 'lucide-react';

interface ControlFooterProps {
  taskCount: number;
  messageCount: number;
  isConnected: boolean;
}

export const ControlFooter: React.FC<ControlFooterProps> = ({ taskCount, messageCount, isConnected }) => {
  return (
    <footer className="col-span-full h-14 bg-black border-t border-white/10 px-8 hidden md:flex items-center justify-between z-10 text-white/50">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-3">
          <Terminal className="w-3.5 h-3.5" />
          <div className="flex flex-col">
            <span className="text-[10px] font-medium tracking-wide">System Logs</span>
            <span className="text-xs font-semibold text-white/80">{messageCount * 2 + 13} events</span>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-white/10" />

        <div className="flex items-center gap-3">
          <Activity className="w-3.5 h-3.5" />
          <div className="flex flex-col">
            <span className="text-[10px] font-medium tracking-wide">Status</span>
            <span className={`text-xs font-semibold ${isConnected ? 'text-white' : 'text-white/40'}`}>
              {isConnected ? 'Active' : 'Idle'}
            </span>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-white/10" />

        <div className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${taskCount > 0 ? 'bg-white text-black' : 'bg-white/10 text-white/40'}`}>
            {taskCount}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium tracking-wide">Tasks</span>
            <span className="text-xs font-semibold text-white/80">{taskCount} pending</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-help">
          <Cpu className="w-3.5 h-3.5" />
          <span className="text-[10px] font-medium">Core operations</span>
        </div>
        <div className="flex items-center gap-2">
          <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'text-white' : 'text-white/40'}`} />
          <span className="text-[10px] font-medium tracking-wide">Secured</span>
        </div>
      </div>
    </footer>
  );
};
