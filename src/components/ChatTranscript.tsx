import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Message } from '../hooks/useLiveAPI';

interface ChatTranscriptProps {
  messages: Message[];
}

export const ChatTranscript: React.FC<ChatTranscriptProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 min-h-0 glass-light rounded-[2rem] border border-brand-border p-6 overflow-hidden flex flex-col relative">
      <div className="absolute top-4 right-8 flex items-center gap-2">
         <span className="text-[10px] font-mono text-brand-text-dim uppercase tracking-widest font-black opacity-30">Transcript log</span>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-4 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              className="h-full flex flex-col items-center justify-center text-center gap-2 font-mono"
            >
              <div className="w-12 h-[1px] bg-brand-text-dim" />
              <span className="text-[10px] uppercase tracking-[0.4em]">Listening for Neural Sync</span>
              <div className="w-12 h-[1px] bg-brand-text-dim" />
            </motion.div>
          )}

          {messages.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex flex-col gap-1.5 p-4 rounded-2xl border transition-all duration-500 ${
                m.role === 'user' 
                  ? 'bg-slate-800/10 border-white/5 self-end max-w-[85%] text-slate-400' 
                  : 'bg-brand-primary/5 border-brand-primary/10 self-start max-w-[85%] text-brand-primary/90'
              }`}
            >
              <div className="flex items-center gap-2 opacity-40">
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-black">
                  {m.role === 'user' ? 'Transmission' : 'Synthesis'}
                </span>
                <div className="w-1 h-1 rounded-full bg-current" />
                <span className="text-[9px] font-mono">
                  {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed font-medium whitespace-pre-wrap">
                {m.text}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Fade at top */}
      <div className="absolute top-4 left-6 right-6 h-12 bg-gradient-to-b from-[var(--color-brand-panel-light)] to-transparent pointer-events-none" />
    </div>
  );
};
