import React, { useMemo } from 'react';
import { Loader2, Mic, MicOff } from 'lucide-react';

interface MainVisualizerProps {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  isAssistantTalking: boolean;
  barHeights: number[];
  isHighVolume: boolean[];
  onConnect: () => void;
  onDisconnect: () => void;
}

export const MainVisualizer: React.FC<MainVisualizerProps> = ({
  isConnected,
  isConnecting,
  isAssistantTalking,
  barHeights,
  onConnect,
  onDisconnect
}) => {
  // Ultra-smooth dampened volume calculation
  const avgVolume = useMemo(() => {
    if (!barHeights.length) return 0;
    const sum = barHeights.reduce((a, b) => a + b, 0);
    return Math.min(sum / barHeights.length / 40, 1.2);
  }, [barHeights]);

  // Subtle organic scaling
  const orbScale = isConnected ? 1 + avgVolume * 0.45 : 0.55;

  return (
    <div className="relative flex-none h-56 lg:h-auto lg:flex-1 rounded-3xl overflow-hidden bg-brand-bg flex items-center justify-center transition-all duration-700 noise-overlay">

      {/* Ambient background rings */}
      {isConnected && (
        <>
          <div
            className="absolute rounded-full border border-white/[0.02] transition-all duration-1000"
            style={{
              width: `${180 + avgVolume * 60}px`,
              height: `${180 + avgVolume * 60}px`,
              opacity: 0.5 + avgVolume * 0.3
            }}
          />
          <div
            className="absolute rounded-full border border-white/[0.015] transition-all duration-1000"
            style={{
              width: `${260 + avgVolume * 80}px`,
              height: `${260 + avgVolume * 80}px`,
              opacity: 0.3 + avgVolume * 0.2
            }}
          />
          <div
            className="absolute rounded-full border border-white/[0.01] transition-all duration-1000"
            style={{
              width: `${340 + avgVolume * 100}px`,
              height: `${340 + avgVolume * 100}px`,
              opacity: 0.2 + avgVolume * 0.1
            }}
          />
        </>
      )}

      {/* Central Orb */}
      <div className="relative flex items-center justify-center w-full h-full z-10">
        {isConnected ? (
          <div
            className="rounded-full animate-orb"
            style={{
              width: '120px',
              height: '120px',
              transform: `scale(${orbScale})`,
              transition: 'transform 120ms cubic-bezier(0.4, 0, 0.2, 1)',
              background: isAssistantTalking
                ? 'radial-gradient(circle at 35% 35%, #a78bfa, #818CF8 40%, #6366F1 70%, #4F46E5)'
                : 'radial-gradient(circle at 35% 35%, #E0E7FF, #C7D2FE 40%, #A5B4FC 70%, #818CF8)',
              boxShadow: `
                0 0 ${30 + avgVolume * 40}px rgba(129, 140, 248, ${0.25 + avgVolume * 0.2}),
                0 0 ${60 + avgVolume * 60}px rgba(129, 140, 248, ${0.1 + avgVolume * 0.1}),
                inset 0 -4px 12px rgba(0,0,0,0.2),
                inset 0 2px 8px rgba(255,255,255,0.3)
              `,
              opacity: isAssistantTalking ? 1 : 0.9
            }}
          />
        ) : isConnecting ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full border border-white/[0.08] flex items-center justify-center bg-white/[0.02]">
              <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
            </div>
            <span className="text-[12px] text-white/30 font-medium tracking-wider uppercase">
              Initializing
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.05]" />
            <span className="text-[12px] text-white/20 font-medium tracking-wider uppercase">
              Standby
            </span>
          </div>
        )}
      </div>

      {/* Mobile CTA */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:hidden z-20">
        <button
          onClick={isConnected ? onDisconnect : onConnect}
          disabled={isConnecting}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 btn-press shadow-lg ${
            isConnected
              ? 'bg-white/[0.08] border border-white/[0.08] text-white/60 hover:bg-white/[0.12]'
              : 'bg-white text-brand-bg hover:shadow-white/20'
          }`}
        >
          {isConnecting
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : isConnected
              ? <MicOff className="w-5 h-5" />
              : <Mic className="w-5 h-5" />
          }
        </button>
      </div>
    </div>
  );
};
