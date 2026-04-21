import { useState, useRef, useEffect, useCallback } from 'react';

interface UseWaveformProps {
  analyser: AnalyserNode | null;
  barCount?: number;
}

export const useWaveform = ({ analyser, barCount = 9 }: UseWaveformProps) => {
  const [barHeights, setBarHeights] = useState<number[]>(new Array(barCount).fill(40));
  const [isHighVolume, setIsHighVolume] = useState<boolean[]>(new Array(barCount).fill(false));
  const animationRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (analyser) {
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    }
  }, [analyser]);

  const updateWaveform = useCallback(() => {
    if (!analyser || !dataArrayRef.current) return;
    
    analyser.getByteFrequencyData(dataArrayRef.current);
    
    const step = Math.floor(dataArrayRef.current.length / barCount);
    const newHeights = [];
    const newHighVolume = [];

    for (let i = 0; i < barCount; i++) {
      const value = dataArrayRef.current[i * step] || 0;
      const height = 40 + (value / 255) * 160;
      newHeights.push(height);
      newHighVolume.push(value > 200);
    }

    setBarHeights(newHeights);
    setIsHighVolume(newHighVolume);
    
    animationRef.current = requestAnimationFrame(updateWaveform);
  }, [analyser, barCount]);

  useEffect(() => {
    if (analyser) {
      animationRef.current = requestAnimationFrame(updateWaveform);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, updateWaveform]);

  return { barHeights, isHighVolume };
};
