import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, RotateCcw, Video, Activity, ShieldAlert, Sparkles } from 'lucide-react';
import { detectorEngine } from '../utils/detectorEngine';

export function VideoDetector({ settings, setIsProcessing }) {
  const [videoSrc, setVideoSrc] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStats, setCurrentStats] = useState(null);
  const [fps, setFps] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastTimeRef = useRef(performance.now());

  // Handle Video Upload
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setIsPlaying(true);
    }
  };

  // Process Video Frame Loop
  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.paused && !video.ended) {
      // Calculate FPS
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      if (delta > 0) {
        setFps(Math.round(1000 / delta));
      }
      lastTimeRef.current = now;

      // Adjust canvas dimensions to match video
      if (canvas.width !== video.videoWidth && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Run computer vision detection on current frame
      detectorEngine.setConfidenceThreshold(settings.confidenceThreshold);
      detectorEngine.iouThreshold = settings.iouThreshold;
      const res = await detectorEngine.detect(video, false);

      setCurrentStats(res);

      // Draw onto canvas
      detectorEngine.draw(canvas, video, res.boxes, {
        boxTheme: settings.boxTheme,
        showHeatmap: settings.showHeatmap
      });

      animFrameIdRef.current = requestAnimationFrame(processFrame);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
      animFrameIdRef.current = requestAnimationFrame(processFrame);
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    }

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, settings]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            Video Frame Analyzer
            <span className="px-3 py-1 text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 rounded-full">
              Real-time Video Feed
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Upload MP4 or WebM road inspection recordings to scan frame-by-frame for potholes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="px-5 py-2.5 rounded-2xl font-semibold text-xs bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 cursor-pointer flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95">
            <Upload className="w-4 h-4" /> Upload Road Video
            <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Video View & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Video Canvas Container */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-3xl bg-slate-950 border border-slate-800/80 overflow-hidden shadow-2xl min-h-[420px] flex items-center justify-center">
            
            {videoSrc ? (
              <>
                <video
                  ref={videoRef}
                  src={videoSrc}
                  className="hidden"
                  loop
                  playsInline
                  muted
                />

                <canvas
                  ref={canvasRef}
                  className="w-full h-auto max-h-[560px] object-contain rounded-2xl shadow-xl"
                />

                {/* Video Play Overlay Controller */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="p-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-transform active:scale-95"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>
                    <span className="text-xs font-semibold text-slate-200">
                      {isPlaying ? 'Analyzing Stream...' : 'Paused'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <Activity className="w-4 h-4" /> {fps} FPS
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-cyan-400 shadow-xl">
                  <Video className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">No Video Loaded</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select an MP4 road video file from your computer to run automated frame-by-frame hazard detection with bounding box visualizers.
                </p>
                <label className="inline-flex px-5 py-2.5 rounded-2xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer border border-slate-700 transition-all">
                  Browse Files...
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                </label>
              </div>
            )}

          </div>
        </div>

        {/* Right Stats Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Live Frame Metrics</span>
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">Potholes in Current Frame</span>
                <span className="text-2xl font-extrabold text-amber-400">
                  {currentStats ? currentStats.stats.totalPotholes : 0}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">Frame Detection Confidence</span>
                <span className="text-2xl font-extrabold text-cyan-400">
                  {currentStats ? currentStats.stats.avgConfidence : '0%'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">Road Safety Index</span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  {currentStats ? currentStats.stats.roadSafetyScore : 100} / 100
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center italic">
              Confidence threshold is dynamically filtered at {Math.round(settings.confidenceThreshold * 100)}%
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
