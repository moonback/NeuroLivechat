import { useState, useCallback } from 'react';
import { useLiveAPI } from './hooks/useLiveAPI';
import { useCamera } from './hooks/useCamera';
import { useWaveform } from './hooks/useWaveform';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainVisualizer } from './components/MainVisualizer';
import { ChatTranscript } from './components/ChatTranscript';
import { ControlFooter } from './components/ControlFooter';

const SYSTEM_INSTRUCTION = "Tu es un assistant vocal utile, sympa et concis. Tu réponds toujours en français. Ton identité technique est IA. Tu as accès à des capteurs: tu peux voir l'utilisateur (via webcam), tu peux récupérer la météo locale avec get_weather, et tu peux contrôler l'éclairage de la salle via set_light_color (donne des couleurs sympas Hexa ou HTML codenames).";

export default function App() {
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [voiceName, setVoiceName] = useState('Puck');
  const [smartLight, setSmartLight] = useState('#00FF9C');
  const [showDevPanel, setShowDevPanel] = useState(true);

  // Tool Handler
  const handleToolCall = useCallback(async (call: any) => {
    if (call.name === "get_weather") {
      return { temperature: "21°C", condition: "Pluvieux", location: call.args.location };
    } else if (call.name === "set_light_color") {
      const color = call.args.color || '#00FF9C';
      setSmartLight(color);
      return { status: "success", applied_color: color };
    }
    return {};
  }, []);

  // Main API Hook
  const {
    isConnected,
    isConnecting,
    isAssistantTalking,
    messages,
    connect,
    disconnect,
    sendRealtimeInput,
    analyser
  } = useLiveAPI({
    apiKey: process.env.GEMINI_API_KEY || '',
    voiceName,
    systemInstruction: SYSTEM_INSTRUCTION,
    onToolCall: handleToolCall
  });

  // Camera Hook
  const { videoRef } = useCamera({
    isCameraEnabled,
    onFrame: (data) => sendRealtimeInput({ video: { mimeType: 'image/jpeg', data } })
  });

  // Waveform Hook
  const { barHeights, isHighVolume } = useWaveform({ analyser });

  return (
    <div className="h-screen w-full flex items-center justify-center p-0 md:p-12 overflow-hidden bg-brand-bg text-brand-text">
      {/* Main Structural Shell */}
      <div className="w-full h-full max-w-[1440px] max-h-[900px] grid grid-rows-[auto_1fr_auto] lg:grid-cols-[380px_1fr] lg:grid-rows-[auto_1fr_auto] gap-[1px] glass rounded-none md:rounded-[3rem] overflow-hidden shadow-premium relative">
        
        {/* Top Navigation */}
        <Header 
          isConnected={isConnected} 
          isConnecting={isConnecting} 
        />

        {/* Control Center (Sidebar) */}
        <Sidebar 
          isConnected={isConnected}
          isConnecting={isConnecting}
          isCameraEnabled={isCameraEnabled}
          setIsCameraEnabled={setIsCameraEnabled}
          voiceName={voiceName}
          setVoiceName={setVoiceName}
          onConnect={connect}
          onDisconnect={disconnect}
          videoRef={videoRef}
          showDevPanel={showDevPanel}
        />

        {/* Primary Interaction Surface */}
        <main className="flex flex-col p-6 lg:p-10 gap-6 overflow-hidden">
          
          {/* Visual Resonance Area */}
          <MainVisualizer 
            isConnected={isConnected}
            isConnecting={isConnecting}
            isAssistantTalking={isAssistantTalking}
            barHeights={barHeights}
            isHighVolume={isHighVolume}
            onConnect={connect}
            onDisconnect={disconnect}
          />

          {/* Semantic Thread (Transcript) */}
          <ChatTranscript messages={messages} />

        </main>

        {/* Global Telemetry Bar */}
        <ControlFooter 
          smartLight={smartLight}
          messageCount={messages.length}
          isConnected={isConnected}
        />

      </div>
    </div>
  );
}
