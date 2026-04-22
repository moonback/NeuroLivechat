import React from 'react';
import { X, Mic, Camera, Settings2, Info, ChevronRight, Sparkles } from 'lucide-react';
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
  const voices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[480px] glass rounded-[2.5rem] shadow-premium overflow-hidden noise-overlay"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 pt-8 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/50">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-xl font-semibold tracking-tight text-white">System Settings</h2>
                  <span className="text-[11px] text-white/30 font-medium uppercase tracking-widest">Configuration Engine</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-white/[0.06] transition-all duration-200 text-white/30 hover:text-white/80 flex items-center justify-center btn-press"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Scroller */}
            <div className="px-8 pb-10 flex flex-col gap-9 overflow-y-auto max-h-[70vh]">

              {/* ── Section: Voice ── */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-2 px-1">
                  <Mic className="w-3.5 h-3.5 text-brand-accent/60" />
                  <h3 className="text-[11px] uppercase font-bold tracking-[0.15em] text-white/25">Vocal Signature</h3>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {voices.map((voice) => (
                    <button
                      key={voice}
                      onClick={() => !isConnected && setVoiceName(voice)}
                      disabled={isConnected}
                      className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 btn-press group ${voiceName === voice
                        ? 'bg-brand-accent/15 border border-brand-accent/20 text-white'
                        : 'bg-white/[0.03] border border-white/[0.05] text-white/40 hover:border-white/[0.08] hover:bg-white/[0.05]'
                        } ${isConnected ? 'opacity-40 cursor-not-allowed border-dashed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${voiceName === voice ? 'bg-brand-accent text-white scale-110 shadow-lg shadow-brand-accent/20' : 'bg-white/[0.02] text-transparent group-hover:text-white/10'
                          }`}>
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[14px] font-semibold tracking-tight">{voice}</span>
                      </div>

                      {voiceName === voice ? (
                        <div className="w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center shadow-lg shadow-brand-accent/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                      ) : (
                        <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0 transition-all" />
                      )}
                    </button>
                  ))}
                </div>

                {isConnected && (
                  <div className="flex items-start gap-2.5 px-2 py-3 rounded-xl bg-red-500/5 border border-red-500/10">
                    <Info className="w-3.5 h-3.5 text-red-400/70 mt-0.5" />
                    <p className="text-[11px] text-red-400/60 font-medium leading-relaxed">
                      Voice profile is locked during active sessions. End the current conversation to modify.
                    </p>
                  </div>
                )}
              </section>

              {/* ── Section: Vision ── */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-2 px-1">
                  <Camera className="w-3.5 h-3.5 text-brand-accent/60" />
                  <h3 className="text-[11px] uppercase font-bold tracking-[0.15em] text-white/25">Optic Processing</h3>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Camera Enable Toggle */}
                  <button
                    onClick={() => !isConnected && setIsCameraEnabled(!isCameraEnabled)}
                    disabled={isConnected}
                    className={`flex items-center justify-between p-5 rounded-2xl transition-all duration-300 btn-press group ${isCameraEnabled
                      ? 'bg-brand-accent/10 border border-brand-accent/20'
                      : 'bg-white/[0.03] border border-white/[0.05]'
                      } ${isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      <span className={`text-[14px] font-semibold ${isCameraEnabled ? 'text-white' : 'text-white/60'}`}>Primary Optical Sensor</span>
                      <span className="text-[11px] text-white/20 font-medium group-hover:text-white/30 transition-colors">Route video feed into model context</span>
                    </div>

                    <div className={`w-11 h-6 rounded-full transition-all duration-300 relative ${isCameraEnabled ? 'bg-brand-accent' : 'bg-white/10'
                      }`}>
                      <div className={`absolute top-[3px] w-[18px] h-[18px] rounded-full transition-all duration-300 shadow-sm ${isCameraEnabled ? 'left-[23px] bg-white' : 'left-[3px] bg-white/40'
                        }`} />
                    </div>
                  </button>

                  {/* Vision Continuous Toggle */}
                  <AnimatePresence>
                    {isCameraEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="overflow-hidden"
                      >
                        <button
                          onClick={() => setIsVisionContinue(!isVisionContinue)}
                          className={`flex items-center justify-between w-full p-5 rounded-2xl transition-all duration-300 btn-press group ${isVisionContinue
                            ? 'bg-purple-500/10 border border-purple-500/20'
                            : 'bg-white/[0.03] border border-white/[0.05]'
                            }`}
                        >
                          <div className="flex flex-col items-start gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className={`text-[14px] font-semibold ${isVisionContinue ? 'text-purple-300' : 'text-white/60'}`}>High Frequency Analysis</span>
                              {isVisionContinue && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />}
                            </div>
                            <span className="text-[11px] text-white/20 font-medium group-hover:text-white/30 transition-colors">Deep visual understanding (Continuous mode)</span>
                          </div>

                          <div className={`w-11 h-6 rounded-full transition-all duration-300 relative ${isVisionContinue ? 'bg-purple-500' : 'bg-white/10'
                            }`}>
                            <div className={`absolute top-[3px] w-[18px] h-[18px] rounded-full transition-all duration-300 shadow-sm ${isVisionContinue ? 'left-[23px] bg-white' : 'left-[3px] bg-white/40'
                              }`} />
                          </div>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>
            </div>

            {/* Footer Information */}
            <div className="mt-auto px-8 py-6 bg-white/[0.02] border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/10 tracking-[0.2em] uppercase">Core Unit v4.0.0</span>
              <div className="flex items-center gap-1.5 opacity-20">
                <div className="w-1 h-1 rounded-full bg-white" />
                <div className="w-1 h-1 rounded-full bg-white" />
                <div className="w-1 h-1 rounded-full bg-white" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
