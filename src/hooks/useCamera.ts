import { useState, useRef, useCallback, useEffect } from 'react';

interface UseCameraProps {
  isCameraEnabled: boolean;
  onFrame: (base64Frame: string) => void;
}

export const useCamera = ({ isCameraEnabled, onFrame }: UseCameraProps) => {
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

  const startCamera = useCallback(async () => {
    if (!isCameraEnabled) {
      stopCamera();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      frameIntervalRef.current = setInterval(() => {
        if (videoRef.current && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            const base64Str = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
            onFrame(base64Str);
          }
        }
      }, 2000);
    } catch (e) {
      console.error('Camera error', e);
    }
  }, [isCameraEnabled, onFrame, stopCamera]);

  useEffect(() => {
    if (isCameraEnabled) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isCameraEnabled, startCamera, stopCamera]);

  return {
    videoRef,
    canvasRef,
    isCameraActive: !!cameraStreamRef.current
  };
};
