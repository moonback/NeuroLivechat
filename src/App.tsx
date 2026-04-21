import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SYSTEM_INSTRUCTION = "Tu es un assistant vocal utile, sympa et concis. Tu réponds toujours en français. Ton identité est Puck, un assistant technique.";

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAssistantTalking, setIsAssistantTalking] = useState(false);
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; text: string }[]>([]);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTimeRef = useRef<number>(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      handleDisconnect();
    };
  }, []);

  const appendMessage = (role: 'user' | 'assistant', text: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return [{ id: Date.now().toString(), role, text }];
      const last = prev[prev.length - 1];

      if (last.role === role) {
        if (text === last.text) return prev;
        if (text.startsWith(last.text)) {
          return [...prev.slice(0, -1), { ...last, text }];
        }
        // When it's not a snapshot update, treat it as a delta appending
        return [...prev.slice(0, -1), { ...last, text: last.text + text }];
      }
      return [...prev, { id: Date.now().toString(), role, text }];
    });
  };

  const playAudioChunk = (base64Audio: string) => {
    try {
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert 16-bit PCM (little endian) to Float32
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

      const currentTime = ctx.currentTime;
      if (nextPlayTimeRef.current < currentTime) {
        nextPlayTimeRef.current = currentTime;
      }
      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += audioBuffer.duration;

      activeSourcesRef.current.push(source);

      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
        if (activeSourcesRef.current.length === 0) {
          setIsAssistantTalking(false);
        }
      };
    } catch (err) {
      console.error('Audio playback error:', err);
    }
  };

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
      handleDisconnect();
    }
  };

  const handleMessage = (message: any) => {
    // Interruption logic
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

    // Audio playback wrapper
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      setIsAssistantTalking(true);
      playAudioChunk(base64Audio);
    }

    // Extract Assistant Transcriptions
    // The Live API docs specify checking parts[0].text or outputTranscription
    const assistantTxt =
      message.serverContent?.modelTurn?.parts?.[0]?.text ||
      message.outputTranscription?.text ||
      message.serverContent?.outputTranscription?.text ||
      message.serverContent?.turnComplete?.text; // Sometimes attached nearby

    if (assistantTxt) {
      appendMessage('assistant', assistantTxt);
    }

    // Extract User Transcriptions
    const userTxt =
      message.clientContent?.modelTurn?.parts?.[0]?.text ||
      message.inputTranscription?.text ||
      message.serverContent?.inputTranscription?.text ||
      message.clientContent?.turnComplete?.text;

    if (userTxt) {
      appendMessage('user', userTxt);
    }
  };

  const handleConnect = async () => {
    if (isConnected || isConnecting) {
      handleDisconnect();
      return;
    }

    setIsConnecting(true);
    setMessages([]);

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      nextPlayTimeRef.current = audioContextRef.current.currentTime;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const sessionPromise = ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
          systemInstruction: SYSTEM_INSTRUCTION,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
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
            handleDisconnect();
          },
          onerror: (error: any) => {
            console.error('Session error:', error);
            handleDisconnect();
          }
        },
      });

    } catch (e) {
      console.error(e);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
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
  };

  return (
    <div className="flex h-screen w-full items-center justify-center p-0 md:p-8 bg-[var(--color-hw-bg)] text-[var(--color-hw-text)] font-sans overflow-hidden">
      <div className="w-full h-full md:max-w-[1024px] md:max-h-[768px] grid grid-rows-[64px_1fr] md:grid-cols-[320px_1fr] md:grid-rows-[64px_1fr_100px] gap-[1px] bg-[var(--color-hw-panel-border)] md:border border-[var(--color-hw-panel-border)] rounded-none md:rounded-xl overflow-hidden md:shadow-2xl relative">
        
        {/* Header */}
        <header className="col-span-1 md:col-span-full bg-[var(--color-hw-panel)] flex items-center justify-between px-6 border-b border-[var(--color-hw-panel-border)]">
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-hw-accent)">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
            </svg>
            <span className="font-bold tracking-widest text-[var(--color-hw-text)]">
              GEMINI LIVE <span className="text-[var(--color-hw-text-dim)] font-normal">v3.1</span>
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[var(--color-hw-text-dim)]">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[var(--color-hw-accent)] shadow-[0_0_10px_var(--color-hw-accent)] animate-pulse' : 'bg-transparent'}`}></div>
            {isConnecting ? 'CONNECTING...' : isConnected ? 'LIVE CONNECTION ACTIVE' : 'OFFLINE'}
          </div>
        </header>

        {/* Sidebar */}
        <aside className="hidden md:flex flex-col gap-6 bg-[var(--color-hw-panel)] p-6 border-r border-[var(--color-hw-panel-border)]">
          <div className="bg-[var(--color-hw-panel-light)] border border-[var(--color-hw-panel-border)] rounded-lg p-4">
            <span className="font-mono text-[10px] text-[var(--color-hw-text-dim)] uppercase mb-2 block">Current Model</span>
            <div className="text-sm font-medium text-[var(--color-hw-text)]">gemini-3.1-flash-live-preview</div>
          </div>
          <div className="bg-[var(--color-hw-panel-light)] border border-[var(--color-hw-panel-border)] rounded-lg p-4">
            <span className="font-mono text-[10px] text-[var(--color-hw-text-dim)] uppercase mb-2 block">Voice Configuration</span>
            <div className="text-sm font-medium text-[var(--color-hw-text)]">Puck (Male / Energetic)</div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--color-hw-panel-light)] border border-[var(--color-hw-panel-border)] rounded-lg p-4">
              <span className="font-mono text-[10px] text-[var(--color-hw-text-dim)] uppercase mb-2 block">Input Rate</span>
              <div className="text-sm font-medium text-[var(--color-hw-text)]">16kHz</div>
            </div>
            <div className="bg-[var(--color-hw-panel-light)] border border-[var(--color-hw-panel-border)] rounded-lg p-4">
              <span className="font-mono text-[10px] text-[var(--color-hw-text-dim)] uppercase mb-2 block">Output Rate</span>
              <div className="text-sm font-medium text-[var(--color-hw-text)]">24kHz</div>
            </div>
          </div>

          <div className="bg-[var(--color-hw-panel-light)] border border-[var(--color-hw-panel-border)] rounded-lg p-4">
            <span className="font-mono text-[10px] text-[var(--color-hw-text-dim)] uppercase mb-2 block">Active Modality</span>
            <div className="text-sm font-medium text-[var(--color-hw-text)]">AUDIO (PCM_S16)</div>
          </div>

          <button
            onClick={isConnected ? handleDisconnect : handleConnect}
            disabled={isConnecting}
            className={`w-full p-4 rounded-[40px] font-bold uppercase tracking-widest mt-auto flex items-center justify-center gap-3 transition-colors ${
              isConnecting 
                ? 'bg-[var(--color-hw-panel-border)] text-[var(--color-hw-text-dim)] cursor-not-allowed'
                : isConnected
                ? 'bg-[var(--color-hw-error)] text-white border-none'
                : 'bg-[var(--color-hw-accent)] text-[#0F1012] border-none'
            }`}
          >
            {isConnecting ? (
               <Loader2 className="w-5 h-5 animate-spin" />
            ) : isConnected ? (
               <MicOff className="w-5 h-5" />
            ) : (
               <Mic className="w-5 h-5" />
            )}
            {isConnecting ? 'Connexion...' : isConnected ? 'End Session' : 'Start Session'}
          </button>
        </aside>

        {/* Main Display */}
        <main className="bg-[var(--color-hw-bg)] p-4 md:p-8 flex flex-col gap-5 relative overflow-hidden h-full">
          {/* Waveform Area */}
          <div className="flex-none h-48 md:h-auto md:flex-1 border border-dashed border-[#444] rounded-xl flex items-center justify-center relative overflow-hidden" 
               style={{ background: 'radial-gradient(circle at center, #16181b 0%, #0f1012 100%)' }}>
            
            {/* Waveform bars */}
            <div className="flex items-center justify-center h-full gap-1.5">
               {[40, 80, 120, 160, 200, 160, 120, 80, 40].map((baseHeight, i) => {
                  const isActive = isConnected && (isAssistantTalking || activeSourcesRef.current.length > 0);
                  const h = isActive ? `${baseHeight}px` : '40px';
                  const bg = (i > 2 && i < 6) ? 'white' : 'var(--color-hw-accent)';
                  return (
                    <div key={i} className="w-1 md:w-1.5 rounded-full transition-all duration-150 ease-out" 
                         style={{ height: h, background: bg, opacity: 0.8 }}></div>
                  );
               })}
            </div>

            <div className="absolute top-4 right-4 font-mono text-[10px] md:text-[11px] text-[var(--color-hw-text-dim)] uppercase tracking-widest flex items-center gap-2">
               <span className="opacity-70">
                 {isConnecting ? 'INITIATING...' : isConnected ? (isAssistantTalking ? 'RECEIVING' : 'LISTENING') : 'STANDBY'}
               </span>
            </div>
            
             <div className="absolute bottom-4 right-4 md:hidden">
               <button
                  onClick={isConnected ? handleDisconnect : handleConnect}
                  disabled={isConnecting}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                    isConnecting ? 'bg-[var(--color-hw-panel-border)] text-[var(--color-hw-text-dim)]' : isConnected ? 'bg-[var(--color-hw-error)] text-white' : 'bg-[var(--color-hw-accent)] text-[#0F1012]'
                  }`}
                >
                  {isConnecting ? <Loader2 className="w-6 h-6 animate-spin" /> : isConnected ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
             </div>
          </div>

          {/* Transcript Area */}
          <div className="flex-1 min-h-0 bg-black/20 border border-[var(--color-hw-panel-border)] rounded-xl p-4 overflow-y-auto flex flex-col gap-3 text-[13px] font-sans">
             <AnimatePresence>
                {messages.length === 0 && (
                   <div className="text-[var(--color-hw-text-dim)] font-mono text-center flex flex-col items-center justify-center h-full opacity-50">
                     <span>[SYSTEM STANDBY]</span>
                     <span>WAITING FOR AUDIO INPUT</span>
                   </div>
                )}
                {messages.map((m, i) => (
                   <motion.div
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     key={m.id}
                     className={`flex gap-2 leading-relaxed ${m.role === 'user' ? 'text-[var(--color-hw-text-dim)]' : 'text-[var(--color-hw-accent)]'}`}
                   >
                     <span className="opacity-40 shrink-0 font-mono text-[10px] md:text-xs mt-[3px]">[{new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                     <strong className="shrink-0 font-mono text-[11px] md:text-xs uppercase tracking-widest mt-[2px]">{m.role === 'user' ? 'USER:' : 'GEMINI:'}</strong>
                     <span className="whitespace-pre-wrap">{m.text}</span>
                   </motion.div>
                ))}
             </AnimatePresence>
             <div ref={chatEndRef} className="h-1" />
          </div>
        </main>

        {/* Footer */}
        <footer className="col-span-1 md:col-span-full hidden md:grid grid-cols-4 items-center bg-[var(--color-hw-panel)] border-t border-[var(--color-hw-panel-border)] px-6 font-mono text-[11px] text-[var(--color-hw-text-dim)]">
           <div className="flex gap-6">
             <div className="text-center">
               <div className="w-8 h-8 rounded-full border-2 border-[#444] relative flex justify-center before:content-[''] before:absolute before:top-[4px] before:w-[2px] before:h-[8px] before:bg-[#666]"></div>
               <span className="text-[8px] block mt-1 tracking-widest">GAIN</span>
             </div>
             <div className="text-center">
               <div className="w-8 h-8 rounded-full border-2 border-[#444] relative flex justify-center before:content-[''] before:absolute before:top-[4px] before:w-[2px] before:h-[8px] before:bg-[#666] rotate-[45deg]"></div>
               <span className="text-[8px] block mt-1 tracking-widest">THRES</span>
             </div>
           </div>
           
           <div className="border-l border-[var(--color-hw-panel-border)] pl-6 min-h-[40px] flex flex-col justify-center">
             <span className="font-mono text-[9px] text-[var(--color-hw-text-dim)] uppercase mb-0.5 tracking-widest block">Event Logs</span>
             <div className="text-[11px] text-[var(--color-hw-text)]">{messages.length * 2 + 13} sys ops</div>
           </div>
           
           <div className="border-l border-[var(--color-hw-panel-border)] pl-6 min-h-[40px] flex flex-col justify-center">
             <span className="font-mono text-[9px] text-[var(--color-hw-text-dim)] uppercase mb-0.5 tracking-widest block">System Status</span>
             <div className={`text-[11px] ${isConnected ? 'text-[var(--color-hw-accent)]' : 'text-[var(--color-hw-text-dim)]'}`}>{isConnected ? 'SECURE_LINK_ACTIVE' : 'IDLE_STATE'}</div>
           </div>
           
           <div className="border-l border-[var(--color-hw-panel-border)] pl-6 min-h-[40px] flex flex-col justify-center">
             <span className="font-mono text-[9px] text-[var(--color-hw-text-dim)] uppercase mb-0.5 tracking-widest block">SDK Version</span>
             <div className="text-[11px] text-[var(--color-hw-text)]">@google/genai</div>
           </div>
        </footer>

      </div>
    </div>
  );
}
