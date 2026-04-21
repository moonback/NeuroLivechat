import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface UseLiveAPIProps {
  apiKey: string;
  voiceName: string;
  systemInstruction: string;
  onToolCall?: (call: any) => Promise<any>;
}

export const useLiveAPI = ({ apiKey, voiceName, systemInstruction, onToolCall }: UseLiveAPIProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAssistantTalking, setIsAssistantTalking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTimeRef = useRef<number>(0);
  
  const analyserRef = useRef<AnalyserNode | null>(null);

  const appendMessage = useCallback((role: 'user' | 'assistant', text: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return [{ id: Date.now().toString(), role, text }];
      const last = prev[prev.length - 1];

      if (last.role === role) {
        if (text === last.text) return prev;
        if (text.startsWith(last.text)) {
          return [...prev.slice(0, -1), { ...last, text }];
        }
        return [...prev.slice(0, -1), { ...last, text: last.text + text }];
      }
      return [...prev, { id: Date.now().toString(), role, text }];
    });
  }, []);

  const playAudioChunk = useCallback((base64Audio: string) => {
    try {
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const int16Buffer = new Int16Array(bytes.buffer);
      const float32Buffer = new Float32Array(int16Buffer.length);
      for (let i = 0; i < int16Buffer.length; i++) {
        float32Buffer[i] = int16Buffer[i] / 32768.0;
      }

      const ctx = audioContextRef.current;
      if (!ctx) return;

      const audioBuffer = ctx.createBuffer(1, float32Buffer.length, 24000);
      audioBuffer.getChannelData(0).set(float32Buffer);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      if (analyserRef.current) {
        source.connect(analyserRef.current);
      }

      const currentTime = ctx.currentTime;
      if (nextPlayTimeRef.current < currentTime) {
        nextPlayTimeRef.current = currentTime;
      }
      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += audioBuffer.duration;

      activeSourcesRef.current.push(source);

      setIsAssistantTalking(true);

      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
        if (activeSourcesRef.current.length === 0) {
          setIsAssistantTalking(false);
        }
      };
    } catch (err) {
      console.error('Audio playback error:', err);
    }
  }, []);

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const startRecording = async (session: any) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputContextRef.current = inputContext;

      const source = inputContext.createMediaStreamSource(stream);
      const processor = inputContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        const channelData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(channelData.length);
        for (let i = 0; i < channelData.length; i++) {
          const s = Math.max(-1, Math.min(1, channelData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        const base64Data = arrayBufferToBase64(pcm16.buffer);

        if (sessionRef.current) {
          session.sendRealtimeInput({
            audio: {
              data: base64Data,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        }
      };

      source.connect(processor);
      processor.connect(inputContext.destination);
    } catch (err) {
      console.error('Microphone error:', err);
      disconnect();
    }
  };

  const handleMessage = useCallback(async (message: any) => {
    if (message.toolCall) {
      const functionResponses = await Promise.all(message.toolCall.functionCalls.map(async (call: any) => {
        let res = {};
        if (onToolCall) {
          res = await onToolCall(call);
        }
        appendMessage('assistant', `[SYSTEM CALL] ${call.name} executed.`);
        return { id: call.id, name: call.name, response: res };
      }));
      
      if (sessionRef.current) {
        sessionRef.current.sendToolResponse({ functionResponses });
      }
    }

    if (message.serverContent?.interrupted) {
      activeSourcesRef.current.forEach((source) => {
        try { source.stop(); } catch (e) {}
      });
      activeSourcesRef.current = [];
      if (audioContextRef.current) {
        nextPlayTimeRef.current = audioContextRef.current.currentTime;
      }
      setIsAssistantTalking(false);
    }

    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      playAudioChunk(base64Audio);
    }

    const assistantTxt =
      message.serverContent?.modelTurn?.parts?.[0]?.text ||
      message.outputTranscription?.text ||
      message.serverContent?.outputTranscription?.text ||
      message.serverContent?.turnComplete?.text;

    if (assistantTxt) {
      appendMessage('assistant', assistantTxt);
    }

    const userTxt =
      message.clientContent?.modelTurn?.parts?.[0]?.text ||
      message.inputTranscription?.text ||
      message.serverContent?.inputTranscription?.text ||
      message.clientContent?.turnComplete?.text;

    if (userTxt) {
      appendMessage('user', userTxt);
    }
  }, [appendMessage, playAudioChunk, onToolCall]);

  const connect = async () => {
    if (isConnected || isConnecting) return;

    setIsConnecting(true);
    setMessages([]);

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      nextPlayTimeRef.current = audioContextRef.current.currentTime;

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;

      const ai = new GoogleGenAI({ apiKey });
      const sessionPromise = ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } },
          },
          systemInstruction: systemInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [{
            functionDeclarations: [
              {
                name: "get_weather",
                description: "Obtenir la météo locale",
                parameters: {
                  type: Type.OBJECT,
                  properties: { location: { type: Type.STRING, description: "Nom de la ville" } },
                  required: ["location"]
                }
              },
              {
                name: "manage_tasks",
                description: "Gérer la liste des tâches (ajouter, lister, supprimer)",
                parameters: {
                  type: Type.OBJECT,
                  properties: { 
                    action: { type: Type.STRING, enum: ["add", "list", "remove"], description: "Action à effectuer" },
                    text: { type: Type.STRING, description: "Le texte de la tâche (requis pour 'add' ou 'remove')" }
                  },
                  required: ["action"]
                }
              },
              {
                name: "get_info",
                description: "Obtenir des informations système (Heure, Date, Navigateur)",
                parameters: {
                  type: Type.OBJECT,
                  properties: {},
                  required: []
                }
              },
              {
                name: "save_memory",
                description: "Sauvegarder une information importante dans la mémoire à long terme pour s'en souvenir lors des prochaines sessions.",
                parameters: {
                  type: Type.OBJECT,
                  properties: { 
                    text: { type: Type.STRING, description: "L'information à mémoriser (sois précis)" } 
                  },
                  required: ["text"]
                }
              },
              {
                name: "search_memory",
                description: "Rechercher dans la mémoire à long terme des informations sur l'utilisateur ou des événements passés.",
                parameters: {
                  type: Type.OBJECT,
                  properties: { 
                    query: { type: Type.STRING, description: "La question ou le sujet à rechercher" } 
                  },
                  required: ["query"]
                }
              }
            ]
          }]
        },
        callbacks: {
          onopen: () => {
            sessionPromise.then((session: any) => {
              sessionRef.current = session;
              startRecording(session);
              setIsConnected(true);
              setIsConnecting(false);
            });
          },
          onmessage: (message: any) => {
            handleMessage(message);
          },
          onclose: () => {
            disconnect();
          },
          onerror: (error: any) => {
            console.error('Session error:', error);
            disconnect();
          }
        },
      });

    } catch (e) {
      console.error(e);
      setIsConnecting(false);
    }
  };

  const disconnect = useCallback(() => {
    if (sessionRef.current && typeof sessionRef.current.close === 'function') {
      try { sessionRef.current.close(); } catch (e) {}
    }
    sessionRef.current = null;

    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }

    if (inputContextRef.current) {
      try { inputContextRef.current.close(); } catch (e) {}
      inputContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setIsAssistantTalking(false);
    activeSourcesRef.current = [];
    nextPlayTimeRef.current = 0;
  }, []);

  const sendRealtimeInput = useCallback((data: any) => {
    if (sessionRef.current) {
      sessionRef.current.sendRealtimeInput(data);
    }
  }, []);

  return {
    isConnected,
    isConnecting,
    isAssistantTalking,
    messages,
    connect,
    disconnect,
    sendRealtimeInput,
    analyser: analyserRef.current
  };
};
