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
  const startingRef = useRef(false);
  const onFrameRef = useRef(onFrame);

  // Keep onFrameRef up to date without triggering re-renders
  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  const stopCamera = useCallback(() => {
    startingRef.current = false;
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startInterval = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
    }

    // Ensure we have a canvas for processing even if not rendered
    if (!canvasRef.current && typeof document !== 'undefined') {
       (canvasRef as any).current = document.createElement('canvas');
       canvasRef.current!.width = 640;
       canvasRef.current!.height = 480;
    }

    const delay = isVisionContinue ? 500 : 2000;
    console.log(`[Camera] Starting frame capture: ${delay}ms`);

    frameIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && isCameraEnabled) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          // WebP is more efficient for Gemini Vision
          const base64Str = canvasRef.current.toDataURL('image/webp', 0.6).split(',')[1];
          onFrameRef.current(base64Str);
        }
      }
    }, delay);
  }, [isVisionContinue, isCameraEnabled]);

  const startCamera = useCallback(async () => {
    if (!isCameraEnabled || startingRef.current) return;

    startingRef.current = true;
    try {
      console.log('[Camera] Initializing sensor...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });

      if (!isCameraEnabled) {
        stream.getTracks().forEach(t => t.stop());
        startingRef.current = false;
        return;
      }

      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      startingRef.current = false;
      startInterval();
    } catch (e: any) {
      startingRef.current = false;
      console.error('[Camera] Link failed:', e);
    }
  }, [isCameraEnabled, startInterval]);

  useEffect(() => {
    if (isCameraEnabled) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isCameraEnabled, startCamera, stopCamera]);

  // Handle mode switches while camera is running
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
