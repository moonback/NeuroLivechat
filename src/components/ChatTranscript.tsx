import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Message } from '../hooks/useLiveAPI';
import { MessageCircle } from 'lucide-react';

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
    <div className="flex-1 min-h-0 rounded-2xl overflow-hidden flex flex-col relative bg-white/[0.02] border border-white/[0.04]">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 p-5 lg:p-6 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center gap-4 py-12"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white/20" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-medium text-white/30">No messages yet</span>
                <span className="text-[11px] text-white/15 font-medium">Start a session to begin the conversation</span>
              </div>
            </motion.div>
          )}

          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className={`flex flex-col gap-1.5 max-w-[80%] ${
                m.role === 'user'
                  ? 'self-end items-end'
                  : 'self-start items-start'
              }`}
            >
              {/* Role label */}
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25 px-1">
                {m.role === 'user' ? 'You' : 'Neuro'}
              </span>

              <div
                className={`py-3 px-4 transition-colors ${
                  m.role === 'user'
                    ? 'bg-brand-accent/15 text-white/90 rounded-2xl rounded-tr-lg border border-brand-accent/10'
                    : 'bg-white/[0.05] text-white/80 rounded-2xl rounded-tl-lg border border-white/[0.06]'
                }`}
              >
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap font-[400]">
                  {m.text}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Fades */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-brand-bg/30 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-brand-bg/20 to-transparent pointer-events-none" />
    </div>
  );
};
