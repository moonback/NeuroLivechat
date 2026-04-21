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
  const orbScale = isConnected ? 1 + avgVolume * 0.5 : 0.6;

  return (
    <div className="relative flex-none h-64 lg:h-auto lg:flex-1 rounded-[2.5rem] overflow-hidden bg-black flex items-center justify-center transition-all duration-700">
      
      {/* Central Minimalist Orb */}
      <div className="relative flex items-center justify-center w-full h-full">
        {isConnected ? (
          <div 
            className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white animate-orb mix-blend-screen"
            style={{ 
              transform: `scale(${orbScale})`,
              transition: 'transform 100ms cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: `
                0 0 ${20 + avgVolume * 30}px rgba(255, 255, 255, ${0.4 + avgVolume * 0.2}),
                inset 0 0 20px rgba(255, 255, 255, 0.8)
              `,
              opacity: isAssistantTalking ? 1 : 0.8
            }}
          />
        ) : isConnecting ? (
          <div className="w-16 h-16 rounded-full border-[1.5px] border-white/20 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-white/5 blur-sm" />
        )}
      </div>

      {/* Mobile Interaction Button (Minimal Outline) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 lg:hidden">
        <button
          onClick={isConnected ? onDisconnect : onConnect}
          disabled={isConnecting}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 border ${
            isConnected 
              ? 'border-white/10 text-white/50 hover:bg-white/10 hover:text-white' 
              : 'border-white/20 text-white/80 hover:bg-white text-black'
          }`}
        >
          {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : isConnected ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
