import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Volume2, VolumeX, ShieldAlert, Activity, AlertTriangle } from 'lucide-react';
import { detectorEngine } from '../utils/detectorEngine';

export function WebcamDetector({ settings, setIsProcessing }) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [hazardAlert, setHazardAlert] = useState(false);
  const [liveStats, setLiveStats] = useState(null);
  const [fps, setFps] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const audioCtxRef = useRef(null);

  // Play hazard beep synthesizer using Web Audio API
  const triggerAudioBeep = () => {
    if (!settings.audioAlert) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  const startCamera = async () => {
    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setErrorMsg('Camera access denied or device unavailable. Please allow webcam permissions in browser.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }
  };

  const loopDetection = async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === 4) {
      // Calculate FPS
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      if (delta > 0) {
        setFps(Math.round(1000 / delta));
      }
      lastTimeRef.current = now;

      if (canvas.width !== video.videoWidth && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      detectorEngine.setConfidenceThreshold(settings.confidenceThreshold);
      detectorEngine.iouThreshold = settings.iouThreshold;
      const res = await detectorEngine.detect(video, false);

      setLiveStats(res);

      if (res.stats.criticalCount > 0 || res.stats.totalPotholes >= 2) {
        setHazardAlert(true);
        triggerAudioBeep();
      } else {
        setHazardAlert(false);
      }

      detectorEngine.draw(canvas, video, res.boxes, {
        boxTheme: settings.boxTheme,
        showHeatmap: settings.showHeatmap
      });
    }

    animRef.current = requestAnimationFrame(loopDetection);
  };

  useEffect(() => {
    if (isCameraActive) {
      animRef.current = requestAnimationFrame(loopDetection);
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isCameraActive, settings]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Controls Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            Live Road Camera Stream Scanner
            <span className="px-3 py-1 text-xs font-bold text-red-400 bg-red-950/80 border border-red-800/80 rounded-full animate-pulse">
              LIVE STREAM
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time optical road hazard scanner with instant audio hazard warning alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="px-6 py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 hover:from-emerald-400 hover:to-emerald-500 flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Camera className="w-4 h-4" /> Start Camera Feed
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="px-6 py-3 rounded-2xl font-bold text-xs bg-red-950 border border-red-800 text-red-400 hover:bg-red-900 flex items-center gap-2 transition-all"
            >
              <CameraOff className="w-4 h-4" /> Stop Stream
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800 text-red-200 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Camera View & HUD Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Camera Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-3xl bg-slate-950 border border-slate-800/80 overflow-hidden shadow-2xl min-h-[440px] flex items-center justify-center">
            
            <video ref={videoRef} className="hidden" playsInline muted />

            {isCameraActive ? (
              <div className="relative w-full h-auto flex items-center justify-center">
                <canvas ref={canvasRef} className="w-full h-auto max-h-[580px] object-contain rounded-2xl" />

                {/* HUD Overlay */}
                <div className="absolute top-4 left-4 flex items-center gap-3">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-red-950/80 backdrop-blur-md text-red-400 text-xs font-mono font-bold rounded-lg border border-red-800">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" /> SCANNING
                  </span>
                  <span className="px-3 py-1 bg-slate-950/80 backdrop-blur-md text-cyan-400 text-xs font-mono font-bold rounded-lg border border-slate-800">
                    {fps} FPS
                  </span>
                </div>

                {hazardAlert && (
                  <div className="absolute top-4 right-4 animate-bounce px-4 py-2 bg-red-600 text-white font-extrabold text-xs rounded-xl shadow-xl flex items-center gap-2 border border-white/20">
                    <AlertTriangle className="w-4 h-4" /> CRITICAL POTHOLE HAZARD
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Live Camera Offline</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click 'Start Camera Feed' to connect your computer or mobile camera for real-time pothole scanning.
                </p>
                <button
                  onClick={startCamera}
                  className="inline-flex px-6 py-3 rounded-2xl font-bold text-xs bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                >
                  Enable Camera
                </button>
              </div>
            )}

          </div>
        </div>

        {/* HUD Live Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Scanner HUD Telemetry</span>
              <Activity className="w-5 h-5 text-emerald-400" />
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">Live Potholes Detected</span>
                <span className="text-2xl font-extrabold text-amber-400">
                  {liveStats ? liveStats.stats.totalPotholes : 0}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">Overall Road Condition</span>
                <span className="text-lg font-extrabold text-emerald-400">
                  {liveStats ? liveStats.stats.overallSeverity : 'Ready'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
