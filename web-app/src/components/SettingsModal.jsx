import React from 'react';
import { X, Sliders, Palette, Volume2, Flame, ShieldAlert } from 'lucide-react';

export function SettingsModal({ isOpen, onClose, settings, setSettings }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-100 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Detection Settings</h3>
              <p className="text-xs text-slate-400">Configure YOLO-v2 inference parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confidence Threshold */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-semibold">
            <label className="text-slate-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" /> Minimum Confidence Threshold
            </label>
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-lg">
              {Math.round(settings.confidenceThreshold * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.95"
            step="0.05"
            value={settings.confidenceThreshold}
            onChange={(e) => setSettings({ ...settings, confidenceThreshold: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <p className="text-xs text-slate-400">
            Detections below this probability score will be filtered out.
          </p>
        </div>

        {/* NMS IoU Threshold */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-semibold">
            <label className="text-slate-300">NMS IoU Threshold</label>
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-800 text-slate-300 rounded-lg">
              {settings.iouThreshold}
            </span>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.80"
            step="0.05"
            value={settings.iouThreshold}
            onChange={(e) => setSettings({ ...settings, iouThreshold: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400"
          />
          <p className="text-xs text-slate-400">
            Controls bounding box overlap suppression during candidate selection.
          </p>
        </div>

        {/* Color Theme Selector */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Palette className="w-4 h-4 text-cyan-400" /> Bounding Box Theme
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'severity', label: 'Dynamic Severity', color: 'bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400' },
              { id: '#00f2fe', label: 'Neon Cyan', color: 'bg-cyan-400' },
              { id: '#10b981', label: 'Emerald', color: 'bg-emerald-400' },
              { id: '#f59e0b', label: 'Amber', color: 'bg-amber-400' },
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSettings({ ...settings, boxTheme: theme.id })}
                className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                  settings.boxTheme === theme.id
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 ring-2 ring-cyan-400/20'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full ${theme.color}`} />
                <span className="text-[11px] font-medium text-center">{theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Heatmap & Sound Options */}
        <div className="space-y-3 border-t border-slate-800 pt-4">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <Flame className="w-4 h-4 text-amber-400" /> Pothole Heatmap Overlay
            </span>
            <input
              type="checkbox"
              checked={settings.showHeatmap}
              onChange={(e) => setSettings({ ...settings, showHeatmap: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-400 focus:ring-cyan-400"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <Volume2 className="w-4 h-4 text-emerald-400" /> Audio Hazard Alert Sound
            </span>
            <input
              type="checkbox"
              checked={settings.audioAlert}
              onChange={(e) => setSettings({ ...settings, audioAlert: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-400 focus:ring-cyan-400"
            />
          </label>
        </div>

        {/* Close button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 hover:from-cyan-400 hover:to-cyan-500 transition-all shadow-lg shadow-cyan-500/20"
          >
            Apply Settings
          </button>
        </div>

      </div>
    </div>
  );
}
