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
    <div className="flex-1 min-h-0 bg-white/5 rounded-[2.5rem] p-6 lg:p-8 overflow-hidden flex flex-col relative">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pr-4 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center gap-3 text-white/40"
            >
              <span className="text-sm tracking-wide">Waiting for conversation to start...</span>
            </motion.div>
          )}

          {messages.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex flex-col gap-2 max-w-[85%] ${
                m.role === 'user' 
                  ? 'self-end items-end' 
                  : 'self-start items-start'
              }`}
            >
              <div 
                className={`py-3 px-5 rounded-3xl ${
                  m.role === 'user'
                    ? 'bg-white text-black rounded-tr-md'
                    : 'bg-white/10 text-white rounded-tl-md'
                }`}
              >
                <p className="text-[15px] leading-relaxed.5 whitespace-pre-wrap">
                  {m.text}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Fade at top */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
    </div>
  );
};
