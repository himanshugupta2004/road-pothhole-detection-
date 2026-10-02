import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ImageDetector } from './components/ImageDetector';
import { VideoDetector } from './components/VideoDetector';
import { WebcamDetector } from './components/WebcamDetector';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SettingsModal } from './components/SettingsModal';
import { ShieldAlert, Cpu, Code2, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('image');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [settings, setSettings] = useState({
    confidenceThreshold: 0.45,
    iouThreshold: 0.40,
    boxTheme: 'severity',
    showHeatmap: false,
    audioAlert: true
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Glow ambient background elements */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isProcessing={isProcessing}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 z-10">
        {activeTab === 'image' && (
          <ImageDetector settings={settings} setIsProcessing={setIsProcessing} />
        )}
        {activeTab === 'video' && (
          <VideoDetector settings={settings} setIsProcessing={setIsProcessing} />
        )}
        {activeTab === 'webcam' && (
          <WebcamDetector settings={settings} setIsProcessing={setIsProcessing} />
        )}
        {activeTab === 'dashboard' && (
          <AnalyticsDashboard settings={settings} />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 backdrop-blur-xl py-6 mt-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>PotholeVision AI &bull; Deep Learning Road Safety System</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> YOLO-v2 Engine
            </span>
            <span>&bull;</span>
            <span>Input Tensor: 416x416</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
