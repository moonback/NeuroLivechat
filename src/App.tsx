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
import { taskService, Task } from './utils/taskService';
import { loadSkills } from './utils/skillLoader';

export default function App() {
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [voiceName, setVoiceName] = useState('Puck');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showDevPanel, setShowDevPanel] = useState(true);
  const [skills, setSkills] = useState('');
  const [tasks, setTasks] = useState(taskService.getAll());
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
      const updatedTasks = taskService.getAll();
      setTasks(updatedTasks);
      setTaskCount(taskService.getPendingCount());
      return { status: "success", tasks: updatedTasks.map(t => t.text) };
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
    } else if (call.name === "manage_vision") {
      const { action } = call.args;
      setIsCameraEnabled(action === "enable");
      return { status: "success", camera_enabled: action === "enable" };
    } else if (call.name === "web_search") {
      const { query } = call.args;
      try {
        // En conditions réelles, on utiliserait une API comme Google Custom Search ou SerpApi.
        // Pour la démo, on simule une recherche avec des résultats structurés.
        console.log(`[Web Search] Query: ${query}`);

        // Simulation d'un délai réseau
        await new Promise(resolve => setTimeout(resolve, 1500));

        return {
          results: [
            { title: `Résultats pour "${query}"`, snippet: `Ceci est une simulation de recherche internet pour "${query}". Dans une version de production, cet outil se connecterait à une API de recherche temps réel.` },
            { title: "NeuroLivechat Intelligence", snippet: "Le système NeuroLivechat intègre désormais des capacités de navigation web avancées pour enrichir les interactions." }
          ],
          context: "Recherche effectuée avec succès."
        };
      } catch (error) {
        return { error: "Échec de la recherche web" };
      }
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
    <div
      className="h-screen w-full flex items-center justify-center p-0 md:p-8 lg:p-10 overflow-hidden text-brand-text relative bg-brand-bg"
      style={{
        backgroundImage: `url('/back.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Background Overlay for better contrast */}
      <div className="absolute inset-0 bg-brand-bg/40 backdrop-blur-[2px]" />

      {/* Main Structural Shell */}
      <div className="w-full h-full max-w-[1480px] max-h-[920px] grid grid-rows-[auto_1fr_auto] lg:grid-cols-[340px_1fr] lg:grid-rows-[auto_1fr_auto] glass rounded-none md:rounded-[2rem] overflow-hidden shadow-premium relative z-10">

        {/* Top Navigation */}
        <Header
          isConnected={isConnected}
          isConnecting={isConnecting}
          isReconnecting={isReconnecting}
          onConnect={connect}
          onDisconnect={disconnect}
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
          tasks={tasks}
          onRemoveTask={(id) => {
            taskService.remove(id);
            const updated = taskService.getAll();
            setTasks(updated);
            setTaskCount(taskService.getPendingCount());
          }}
        />

        {/* Primary Interaction Surface */}
        <main className="flex flex-col p-5 lg:p-8 gap-5 overflow-hidden bg-brand-bg/40">

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
