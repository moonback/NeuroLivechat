import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { Mic, MicOff, Loader2, Camera, CameraOff, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SYSTEM_INSTRUCTION = "Tu es un assistant vocal utile, sympa et concis. Tu réponds toujours en français. Ton identité technique est IA. Tu as accès à des capteurs: tu peux voir l'utilisateur (via webcam), tu peux récupérer la météo locale avec get_weather, et tu peux contrôler l'éclairage de la salle via set_light_color (donne des couleurs sympas Hexa ou HTML codenames).";

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

  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [voiceName, setVoiceName] = useState('Puck');
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [smartLight, setSmartLight] = useState('#16181b');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      handleDisconnect();
    };
  }, []);

  const drawWaveform = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    animationRef.current = requestAnimationFrame(drawWaveform);
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    const step = Math.floor(dataArrayRef.current.length / 9);
    for (let i = 0; i < 9; i++) {
       const bar = barsRef.current[i];
       if (bar) {
          const value = dataArrayRef.current[i * step] || 0;
          const height = 40 + (value / 255) * 160;
          bar.style.height = `${height}px`;
          if (i > 2 && i < 6) {
             bar.style.backgroundColor = value > 200 ? 'var(--color-hw-error)' : 'white';
          } else {
             bar.style.backgroundColor = value > 200 ? 'white' : 'var(--color-hw-accent)';
          }
       }
    }
  };

  const startCamera = async (session: any) => {
    if (!isCameraEnabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      cameraStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      frameIntervalRef.current = setInterval(() => {
        if (videoRef.current && canvasRef.current && session) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            const base64Str = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
            session.sendRealtimeInput({
              video: {
                mimeType: 'image/jpeg',
                data: base64Str
              }
            });
          }
        }
      }, 2000);
    } catch (e) { console.error('Camera error', e); }
  };

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
    if (message.toolCall) {
      const functionResponses = message.toolCall.functionCalls.map((call: any) => {
        let res = {};
        if (call.name === "get_weather") {
          res = { temperature: "21°C", condition: "Pluvieux", location: call.args.location };
        } else if (call.name === "set_light_color") {
          setSmartLight(call.args.color || '#00FF9C');
          res = { status: "success", applied_color: call.args.color };
        }
        appendMessage('assistant', `[SYSTEM CALL] ${call.name} executed.`);
        return { id: call.id, name: call.name, response: res };
      });
      if (sessionRef.current) {
        sessionRef.current.sendToolResponse({ functionResponses });
      }
    }

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

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      drawWaveform();

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const sessionPromise = ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } },
          },
          systemInstruction: SYSTEM_INSTRUCTION,
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
                name: "set_light_color",
                description: "Changer la couleur domotique RVB",
                parameters: {
                  type: Type.OBJECT,
                  properties: { color: { type: Type.STRING, description: "Couleur (code hexa ou nom anglais)" } },
                  required: ["color"]
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
              startCamera(session);
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

    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    if (cameraStreamRef.current) cameraStreamRef.current.getTracks().forEach((t) => t.stop());
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    
    frameIntervalRef.current = null;
    cameraStreamRef.current = null;
    animationRef.current = null;

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
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[10px] text-[var(--color-hw-text-dim)] uppercase">Voice Config</span>
              {showDevPanel && <Settings2 className="w-3 h-3 text-[var(--color-hw-accent)]" />}
            </div>
            <div className="text-sm font-medium text-[var(--color-hw-text)]">
              {showDevPanel ? (
                <select className="bg-transparent border-b border-[var(--color-hw-panel-border)] outline-none text-[var(--color-hw-accent)] w-full pb-1" value={voiceName} onChange={e => setVoiceName(e.target.value)} disabled={isConnected}>
                  <option value="Puck">Puck</option>
                  <option value="Charon">Charon</option>
                  <option value="Kore">Kore</option>
                  <option value="Fenrir">Fenrir</option>
                  <option value="Zephyr">Zephyr</option>
                </select>
              ) : (
                <span className="capitalize">{voiceName} (Active)</span>
              )}
            </div>
          </div>

          <AnimatePresence>
             {showDevPanel && (
               <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="bg-[var(--color-hw-panel-light)] border border-[var(--color-hw-panel-border)] rounded-lg p-4 overflow-hidden overflow-visible relative">
                 <div className="flex justify-between items-center mb-3">
                   <span className="font-mono text-[10px] text-[var(--color-hw-text-dim)] uppercase">Optic Sensor</span>
                   <button onClick={() => !isConnected && setIsCameraEnabled(!isCameraEnabled)} disabled={isConnected} className={`p-1.5 rounded disabled:opacity-50 ${isCameraEnabled ? 'bg-[var(--color-hw-accent)] text-black' : 'bg-[#333] text-white'}`}>
                     {isCameraEnabled ? <Camera className="w-3 h-3" /> : <CameraOff className="w-3 h-3" />}
                   </button>
                 </div>
                 <div className="w-full aspect-video bg-black rounded relative border border-[#333] overflow-hidden flex items-center justify-center">
                    {isCameraEnabled && <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>}
                    <canvas ref={canvasRef} width={320} height={240} className="hidden" />
                    {!isCameraEnabled && <div className="text-[10px] font-mono text-[#555] absolute">OFFLINE</div>}
                 </div>
               </motion.div>
             )}
          </AnimatePresence>
          
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
            
            {/* Waveform bars connected to FFT */}
            <div className="flex items-center justify-center h-full gap-1.5">
               {[0,1,2,3,4,5,6,7,8].map((i) => {
                  return (
                    <div key={i} 
                         ref={(el) => { barsRef.current[i] = el; }}
                         className="w-1 md:w-1.5 rounded-full transition-all duration-[50ms]" 
                         style={{ height: '40px', backgroundColor: 'var(--color-hw-accent)', opacity: 0.8 }}></div>
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
           
           <div className="border-l border-[var(--color-hw-panel-border)] pl-6 min-h-[40px] flex flex-col justify-center min-w-[120px]">
             <span className="font-mono text-[9px] text-[var(--color-hw-text-dim)] uppercase mb-0.5 tracking-widest block">Environment</span>
             <div className="flex items-center gap-2 text-[11px]">
                <div className="w-3 h-3 rounded-full border border-[#333] shadow-[inset_0_0_5px_rgba(0,0,0,0.5)] transition-colors duration-500" style={{ backgroundColor: smartLight, boxShadow: `0 0 10px ${smartLight}` }}></div>
                <span className="opacity-80">{smartLight}</span>
             </div>
           </div>
           
           <div 
             className="border-l border-[var(--color-hw-panel-border)] pl-6 min-h-[40px] flex flex-col justify-center cursor-crosshair select-none"
             onClick={() => {
               setClickCount(c => {
                 if (c + 1 >= 4) { setShowDevPanel(true); return 0; }
                 return c + 1;
               })
             }}
           >
             <span className="font-mono text-[9px] text-[var(--color-hw-text-dim)] uppercase mb-0.5 tracking-widest block">SDK Version</span>
             <div className="text-[11px] text-[var(--color-hw-text)]">@google/genai {clickCount > 0 ? `(${clickCount})` : ''}</div>
           </div>
        </footer>

      </div>
    </div>
  );
}
