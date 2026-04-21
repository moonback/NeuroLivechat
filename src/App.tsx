import { useState, useCallback, useEffect } from 'react';
import { useLiveAPI } from './hooks/useLiveAPI';
import { useCamera } from './hooks/useCamera';
import { useWaveform } from './hooks/useWaveform';
import { useMemory } from './hooks/useMemory';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainVisualizer } from './components/MainVisualizer';
import { ChatTranscript } from './components/ChatTranscript';
import { ControlFooter } from './components/ControlFooter';
import { SettingsModal } from './components/SettingsModal';

import { getSystemInstruction } from './constants/prompts';
import { taskService } from './utils/taskService';
import { loadSkills } from './utils/skillLoader';

export default function App() {
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [voiceName, setVoiceName] = useState('Puck');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showDevPanel, setShowDevPanel] = useState(true);
  const [skills, setSkills] = useState('');
  const [taskCount, setTaskCount] = useState(taskService.getPendingCount());
  const [isVisionContinue, setIsVisionContinue] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const apiKey = process.env.GEMINI_API_KEY || '';

  // Memory Hook
  const { store, search } = useMemory({ apiKey });

  // Load Skills on Mount
  useEffect(() => {
    loadSkills().then(setSkills);
  }, []);

  // Tool Handler
  const handleToolCall = useCallback(async (call: any) => {
    if (call.name === "get_weather") {
      return { temperature: "21°C", condition: "Pluvieux", location: call.args.location };
    } else if (call.name === "manage_tasks") {
      const { action, text } = call.args;
      if (action === "add" && text) {
        taskService.add(text);
      } else if (action === "remove" && text) {
        taskService.remove(text);
      }
      const tasks = taskService.getAll();
      setTaskCount(taskService.getPendingCount());
      return { status: "success", tasks: tasks.map(t => t.text) };
    } else if (call.name === "get_info") {
      return { 
        time: new Date().toLocaleTimeString(), 
        date: new Date().toLocaleDateString(),
        platform: navigator.platform,
        userAgent: navigator.userAgent
      };
    } else if (call.name === "save_memory") {
      return await store(call.args.text);
    } else if (call.name === "search_memory") {
      return await search(call.args.query);
    }
    return {};
  }, [store, search]);

  // Main API Hook
  const {
    isConnected,
    isConnecting,
    isReconnecting,
    isAssistantTalking,
    messages,
    connect,
    disconnect,
    sendRealtimeInput,
    analyser
  } = useLiveAPI({
    apiKey,
    voiceName,
    systemInstruction: getSystemInstruction(skills),
    onToolCall: handleToolCall
  });

  // Stabilize the onFrame handler
  const handleFrame = useCallback((data: string) => {
    sendRealtimeInput({ video: { mimeType: 'image/webp', data } });
  }, [sendRealtimeInput]);

  // Camera Hook
  const { videoRef } = useCamera({
    isCameraEnabled,
    isVisionContinue,
    onFrame: handleFrame
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
          isReconnecting={isReconnecting}
        />

        {/* Control Center (Sidebar) */}
        <Sidebar 
          isConnected={isConnected}
          isConnecting={isConnecting}
          isReconnecting={isReconnecting}
          isCameraEnabled={isCameraEnabled}
          setIsCameraEnabled={setIsCameraEnabled}
          isVisionContinue={isVisionContinue}
          setIsVisionContinue={setIsVisionContinue}
          voiceName={voiceName}
          setVoiceName={setVoiceName}
          onConnect={connect}
          onDisconnect={disconnect}
          videoRef={videoRef}
          showDevPanel={showDevPanel}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Primary Interaction Surface */}
        <main className="flex flex-col p-6 lg:p-10 gap-6 overflow-hidden">
          
          {/* Visual Resonance Area */}
          <MainVisualizer 
            isConnected={isConnected}
            isConnecting={isConnecting}
            isReconnecting={isReconnecting}
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
          taskCount={taskCount}
          messageCount={messages.length}
          isConnected={isConnected}
        />

      </div>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        voiceName={voiceName}
        setVoiceName={setVoiceName}
        isCameraEnabled={isCameraEnabled}
        setIsCameraEnabled={setIsCameraEnabled}
        isVisionContinue={isVisionContinue}
        setIsVisionContinue={setIsVisionContinue}
        isConnected={isConnected}
      />
    </div>
  );
}
