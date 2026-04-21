import React from 'react';
import { X, Mic, Camera, CameraOff, Settings2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceName: string;
  setVoiceName: (val: string) => void;
  isCameraEnabled: boolean;
  setIsCameraEnabled: (val: boolean) => void;
  isVisionContinue: boolean;
  setIsVisionContinue: (val: boolean) => void;
  isConnected: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  voiceName,
  setVoiceName,
  isCameraEnabled,
  setIsCameraEnabled,
  isVisionContinue,
  setIsVisionContinue,
  isConnected
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-brand-bg/90 glass border border-brand-border rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-brand-border/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold tracking-tight">System Parameters</h2>
                  <span className="text-[10px] text-brand-text-dim uppercase font-mono tracking-[0.2em]">Configuration Console</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/5 transition-colors text-brand-text-dim hover:text-brand-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col gap-8">
              {/* Voice Selection */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-brand-primary" />
                  <h3 className="text-xs uppercase font-mono tracking-widest text-brand-text-dim font-bold">Vocal Signature</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].map((voice) => (
                    <button
                      key={voice}
                      onClick={() => !isConnected && setVoiceName(voice)}
                      disabled={isConnected}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        voiceName === voice
                          ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-[0_0_15px_rgba(var(--color-brand-primary-rgb),0.1)]'
                          : 'bg-black/20 border-brand-border text-brand-text-dim hover:border-white/10 hover:bg-black/30'
                      } ${isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="text-sm font-bold tracking-tight">{voice}</span>
                      {voiceName === voice && <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />}
                    </button>
                  ))}
                </div>
                {isConnected && (
                  <p className="text-[10px] text-brand-error flex items-center gap-1.5 px-1 font-medium italic">
                    <Info className="w-3 h-3" />
                    Cannot change voice during an active session.
                  </p>
                )}
              </section>

              {/* Optic Toggles */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-brand-primary" />
                  <h3 className="text-xs uppercase font-mono tracking-widest text-brand-text-dim font-bold">Optic Processing</h3>
                </div>
                
                <div className="flex flex-col gap-3">
                  {/* Camera Main Toggle */}
                  <div className="flex items-center justify-between p-5 rounded-2xl bg-black/20 border border-brand-border">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold">Main Optic Sensor</span>
                      <span className="text-[10px] text-brand-text-dim font-mono tracking-tight lowercase italic">Enable real-time vision processing</span>
                    </div>
                    <button
                      onClick={() => !isConnected && setIsCameraEnabled(!isCameraEnabled)}
                      disabled={isConnected}
                      className={`w-12 h-6 rounded-full transition-all relative ${isCameraEnabled ? 'bg-brand-primary' : 'bg-slate-800'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${isCameraEnabled ? 'left-7 bg-black' : 'left-1 bg-slate-400'}`} />
                    </button>
                  </div>

                  {/* Vision Continue Toggle */}
                  <AnimatePresence>
                    {isCameraEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center justify-between p-5 rounded-2xl bg-brand-primary/5 border border-brand-primary/20">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold text-brand-primary">Continuous Analysis</span>
                            <span className="text-[10px] text-brand-primary/60 font-mono tracking-tight lowercase italic">Higher refresh rate for deeper intelligence</span>
                          </div>
                          <button
                            onClick={() => setIsVisionContinue(!isVisionContinue)}
                            className={`w-12 h-6 rounded-full transition-all relative ${isVisionContinue ? 'bg-brand-primary shadow-[0_0_10px_rgba(var(--color-brand-primary-rgb),0.3)]' : 'bg-black/30 border border-brand-primary/30'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${isVisionContinue ? 'left-7 bg-black' : 'left-1 bg-brand-primary/50'}`} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="p-8 bg-black/40 border-t border-brand-border/30 text-center">
               <span className="text-[9px] font-mono text-brand-text-dim tracking-widest uppercase opacity-50">NeuroLink Core Config v3.1.2</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
