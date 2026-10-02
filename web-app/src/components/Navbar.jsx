import React from 'react';
import { Camera, Image as ImageIcon, Video, LayoutDashboard, Settings, Activity, ShieldAlert, Cpu } from 'lucide-react';

export function Navbar({ activeTab, setActiveTab, onOpenSettings, isProcessing }) {
  const tabs = [
    { id: 'image', label: 'Image Inspector', icon: ImageIcon },
    { id: 'video', label: 'Video Analyzer', icon: Video },
    { id: 'webcam', label: 'Live Scanner', icon: Camera },
    { id: 'dashboard', label: 'Safety Dashboard', icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
              <ShieldAlert className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              {isProcessing && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">
                  PotholeVision <span className="text-cyan-400 font-extrabold">AI</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 rounded-full uppercase">
                  YOLO-v2
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <Cpu className="w-3 h-3 text-cyan-400" /> Automated Road Hazard Detection System
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 shadow-lg shadow-cyan-500/25 scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Actions & Status */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-medium">
              <span className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span>{isProcessing ? 'Analyzing Frame...' : 'AI Ready'}</span>
            </div>

            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all duration-200 hover:scale-105 active:scale-95"
              title="Settings & Model Parameters"
            >
              <Settings className="w-5 h-5 text-slate-300" />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden flex border-t border-slate-800/80 bg-slate-950/90 px-2 py-2 gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
