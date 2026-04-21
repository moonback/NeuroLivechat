import React from 'react';
import { Cpu, Wifi, Activity, Terminal } from 'lucide-react';

interface ControlFooterProps {
  smartLight: string;
  messageCount: number;
  isConnected: boolean;
}

export const ControlFooter: React.FC<ControlFooterProps> = ({ smartLight, messageCount, isConnected }) => {
  return (
    <footer className="col-span-full h-14 glass border-t border-brand-border px-8 hidden md:flex items-center justify-between z-10">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-3">
          <Terminal className="w-3.5 h-3.5 text-brand-text-dim" />
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-brand-text-dim uppercase tracking-tighter">System Ops</span>
            <span className="text-[11px] font-mono font-bold">{messageCount * 2 + 13} LOGS</span>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-brand-border" />

        <div className="flex items-center gap-3">
          <Activity className="w-3.5 h-3.5 text-brand-text-dim" />
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-brand-text-dim uppercase tracking-tighter">Heartbeat</span>
            <span className={`text-[11px] font-mono font-bold ${isConnected ? 'text-brand-primary' : 'text-slate-600'}`}>
              {isConnected ? 'STABLE' : 'IDLE'}
            </span>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-brand-border" />

        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full border border-white/10 shadow-lg transition-all duration-700" 
            style={{ 
              backgroundColor: smartLight, 
              boxShadow: `0 0 15px ${smartLight}` 
            }} 
          />
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-brand-text-dim uppercase tracking-tighter">Env Sync</span>
            <span className="text-[11px] font-mono font-bold uppercase">{smartLight}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-help">
          <Cpu className="w-3.5 h-3.5 text-brand-text-dim" />
          <span className="text-[10px] font-mono uppercase">HPU Accelerator Active</span>
        </div>
        <div className="flex items-center gap-2">
          <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'text-brand-primary' : 'text-brand-text-dim'}`} />
          <span className="text-[11px] font-mono font-black italic tracking-widest text-brand-primary/40">SECURED_LINK</span>
        </div>
      </div>
    </footer>
  );
};
