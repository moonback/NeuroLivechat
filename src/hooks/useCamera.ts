import { useState, useRef, useCallback, useEffect } from 'react';

interface UseCameraProps {
  isCameraEnabled: boolean;
  isVisionContinue?: boolean;
  onFrame: (base64Frame: string) => void;
}

export const useCamera = ({ isCameraEnabled, isVisionContinue = false, onFrame }: UseCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopCamera = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
  }, []);

  const startInterval = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
    }

    const delay = isVisionContinue ? 500 : 2000;
    console.log(`[Camera] Starting frame capture interval: ${delay}ms`);

    frameIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          // Keep internal resolution low for performance/latency
          ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          const base64Str = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
          onFrame(base64Str);
        }
      }
    }, delay);
  }, [isVisionContinue, onFrame]);

  const startCamera = useCallback(async () => {
    if (!isCameraEnabled) {
      stopCamera();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      startInterval();
    } catch (e) {
      console.error('Camera error', e);
    }
  }, [isCameraEnabled, stopCamera, startInterval]);

  useEffect(() => {
    if (isCameraEnabled) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isCameraEnabled, startCamera, stopCamera]);

  // Restart interval if Vision Continue mode changes while camera is active
  useEffect(() => {
    if (isCameraEnabled && cameraStreamRef.current) {
      startInterval();
    }
  }, [isVisionContinue, isCameraEnabled, startInterval]);

  return {
    videoRef,
    canvasRef,
    isCameraActive: !!cameraStreamRef.current
  };
};
