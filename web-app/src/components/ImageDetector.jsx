import React, { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, SlidersHorizontal, AlertTriangle, DollarSign, Shield, ArrowRightLeft, Download, CheckCircle2 } from 'lucide-react';
import { detectorEngine } from '../utils/detectorEngine';

export function ImageDetector({ settings, setIsProcessing }) {
  const sampleImage = `${import.meta.env.BASE_URL}sample_pothole.jpg`;
  const [imageSrc, setImageSrc] = useState(sampleImage);
  const [isSample, setIsSample] = useState(true);
  const [results, setResults] = useState(null);
  const [splitPos, setSplitPos] = useState(50); // 50% split slider
  const [isComparing, setIsComparing] = useState(false);

  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  // Trigger analysis whenever image changes or settings change
  useEffect(() => {
    runDetection();
  }, [imageSrc, settings.confidenceThreshold, settings.iouThreshold, settings.boxTheme, settings.showHeatmap]);

  const runDetection = async () => {
    if (!imgRef.current) return;
    setIsProcessing(true);

    const img = imgRef.current;
    if (img.complete && img.naturalWidth !== 0) {
      processImage(img);
    } else {
      img.onload = () => processImage(img);
    }
  };

  const processImage = async (img) => {
    detectorEngine.setConfidenceThreshold(settings.confidenceThreshold);
    detectorEngine.iouThreshold = settings.iouThreshold;
    detectorEngine.boxColor = settings.boxTheme === 'severity' ? '#00f2fe' : settings.boxTheme;

    const res = await detectorEngine.detect(img, isSample);
    setResults(res);

    if (canvasRef.current) {
      canvasRef.current.width = img.naturalWidth || img.width;
      canvasRef.current.height = img.naturalHeight || img.height;
      detectorEngine.draw(canvasRef.current, img, res.boxes, {
        boxTheme: settings.boxTheme,
        showHeatmap: settings.showHeatmap
      });
    }

    setIsProcessing(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setIsSample(false);
    }
  };

  const loadSample = () => {
    setImageSrc(sampleImage);
    setIsSample(true);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner & Control Tools */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            Road Image Inspection Studio
            <span className="px-3 py-1 text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 rounded-full">
              AI Vision Model
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Upload custom road surface photos or analyze benchmark YOLO-v2 test samples.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={loadSample}
            className={`px-4 py-2.5 rounded-2xl font-semibold text-xs flex items-center gap-2 transition-all ${
              isSample
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Load Benchmark Image
          </button>

          <label className="px-4 py-2.5 rounded-2xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-white cursor-pointer flex items-center gap-2 border border-slate-700 transition-all hover:scale-105 active:scale-95">
            <Upload className="w-4 h-4 text-cyan-400" /> Upload Custom Photo
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => setIsComparing(!isComparing)}
            className={`px-4 py-2.5 rounded-2xl font-semibold text-xs flex items-center gap-2 border transition-all ${
              isComparing
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" /> {isComparing ? 'Exit Split View' : 'Compare Split View'}
          </button>
        </div>
      </div>

      {/* Main Canvas / Split Viewer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Canvas Display */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-3xl bg-slate-950 border border-slate-800/80 overflow-hidden shadow-2xl min-h-[420px] flex items-center justify-center group">
            
            {/* Hidden Source Image */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Road Inspection"
              className="hidden"
              onLoad={runDetection}
              crossOrigin="anonymous"
            />

            {!isComparing ? (
              /* Standard Canvas View */
              <div className="relative w-full h-auto flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto max-h-[600px] object-contain rounded-2xl shadow-lg"
                />
              </div>
            ) : (
              /* Split View Slider */
              <div className="relative w-full h-[520px] overflow-hidden select-none">
                {/* Detected Canvas Layer */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Original Unmodified Image Layer overlay clipped */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${splitPos}%` }}
                >
                  <img
                    src={imageSrc}
                    alt="Original Road"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ width: canvasRef.current ? canvasRef.current.clientWidth : '100%' }}
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 bg-slate-950/80 backdrop-blur-md text-slate-200 text-xs font-bold rounded-lg border border-slate-800">
                    Original Input
                  </span>
                </div>

                <span className="absolute top-4 right-4 px-3 py-1 bg-cyan-950/80 backdrop-blur-md text-cyan-400 text-xs font-bold rounded-lg border border-cyan-800">
                  AI Detection Overlay
                </span>

                {/* Split Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-cyan-400 cursor-ew-resize flex items-center justify-center shadow-2xl shadow-cyan-400"
                  style={{ left: `${splitPos}%` }}
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg font-bold text-xs">
                    ↔
                  </div>
                </div>

                {/* Range Controller */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splitPos}
                  onChange={(e) => setSplitPos(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Key Analytics & Detection Stats */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-4">
            
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Potholes Detected</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {results ? results.stats.totalPotholes : 0}
              </div>
              <p className="text-[11px] text-slate-500">
                Confidence Threshold: {Math.round(settings.confidenceThreshold * 100)}%
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Road Safety Score</span>
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400">
                {results ? results.stats.roadSafetyScore : 100} <span className="text-xs text-slate-400 font-normal">/100</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Status: {results ? results.stats.overallSeverity : 'Normal'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Avg Confidence</span>
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold text-cyan-400">
                {results ? results.stats.avgConfidence : '0%'}
              </div>
              <p className="text-[11px] text-slate-500">YOLO-v2 Model</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Repair Estimate</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-amber-400">
                {results ? results.stats.totalEstimatedCost : '$0'}
              </div>
              <p className="text-[11px] text-slate-500">Est. Asphalt Fix</p>
            </div>

          </div>

          {/* Detected Potholes Log Table */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Detected Hazard Breakdown</span>
              <span className="text-xs text-slate-400 font-normal">
                {results ? results.boxes.length : 0} items
              </span>
            </h3>

            {results && results.boxes.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {results.boxes.map((box, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-cyan-950 text-cyan-400 text-xs font-extrabold flex items-center justify-center border border-cyan-800">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-200">
                          Pothole Cavity ({box.areaSqM})
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Estimated Depth: {box.depth}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          box.severity === 'Critical'
                            ? 'bg-red-950/80 text-red-400 border border-red-800'
                            : box.severity === 'Moderate'
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                            : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {box.severity}
                      </span>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {Math.round(box.confidence * 100)}% Conf.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No potholes detected with current threshold settings.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
