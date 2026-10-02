import React from 'react';
import { ShieldCheck, Download, BarChart2, DollarSign, AlertTriangle, FileText, Cpu, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

export function AnalyticsDashboard({ settings }) {
  
  // Export PDF Report
  const exportPDFReport = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42);
      doc.text('PotholeVision AI - Road Inspection Report', 14, 22);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Model Architecture: YOLO-v2 (Input size: 416x416)`, 14, 36);

      doc.setLineWidth(0.5);
      doc.setDrawColor(203, 213, 225);
      doc.line(14, 42, 196, 42);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Inspection Summary Metrics', 14, 52);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('• Benchmark Potholes Detected: 4 Cavities', 20, 62);
      doc.text('• Overall Road Safety Index: 45 / 100 (Critical Hazard)', 20, 70);
      doc.text('• Average Detection Confidence: 91.8%', 20, 78);
      doc.text('• Total Estimated Asphalt Repair Cost: $1,190', 20, 86);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Hazard Breakdown', 14, 100);

      const tableData = [
        ['Hazard ID', 'Severity', 'Est. Depth', 'Confidence', 'Repair Cost'],
        ['Pothole #1', 'Critical', '8.5 cm', '94%', '$350'],
        ['Pothole #2', 'Moderate', '5.2 cm', '89%', '$220'],
        ['Pothole #3', 'Critical', '11.0 cm', '96%', '$500'],
        ['Pothole #4', 'Minor', '2.8 cm', '78%', '$120'],
      ];

      let startY = 110;
      tableData.forEach((row, i) => {
        if (i === 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFillColor(241, 245, 249);
          doc.rect(14, startY - 5, 182, 8, 'F');
        } else {
          doc.setFont('helvetica', 'normal');
        }
        doc.text(row[0], 16, startY);
        doc.text(row[1], 55, startY);
        doc.text(row[2], 95, startY);
        doc.text(row[3], 135, startY);
        doc.text(row[4], 175, startY);
        startY += 10;
      });

      doc.save('Pothole_Inspection_Report.pdf');

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error('PDF Export Error:', e);
    }
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      timestamp: new Date().toISOString(),
      model: "YOLO-v2 Potholes Detection",
      confidenceThreshold: settings.confidenceThreshold,
      benchmarkDetections: [
        { id: 1, severity: 'Critical', depth: '8.5 cm', confidence: 0.94, cost: 350 },
        { id: 2, severity: 'Moderate', depth: '5.2 cm', confidence: 0.89, cost: 220 },
        { id: 3, severity: 'Critical', depth: '11.0 cm', confidence: 0.96, cost: 500 },
        { id: 4, severity: 'Minor', depth: '2.8 cm', confidence: 0.78, cost: 120 },
      ]
    }, null, 2));

    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "potholes_dataset.json");
    dlAnchorElem.click();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            Road Safety & Inspection Analytics
            <span className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 rounded-full">
              Automated Reports
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Export official road repair documentation, severity distribution charts, and JSON datasets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportJSON}
            className="px-4 py-2.5 rounded-2xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" /> Export JSON
          </button>
          
          <button
            onClick={exportPDFReport}
            className="px-5 py-2.5 rounded-2xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <FileText className="w-4 h-4" /> Download PDF Inspection Report
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Cards & Model Tech Specs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>Critical Hazards</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-3xl font-extrabold text-red-400">2 Potholes</div>
              <p className="text-xs text-slate-500">Requires immediate asphalt filling</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>Est. Repair Budget</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-amber-400">$1,190</div>
              <p className="text-xs text-slate-500">4 total road surface patches</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>Road Safety Rating</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400">45 / 100</div>
              <p className="text-xs text-slate-500">Status: Poor (Action Needed)</p>
            </div>
          </div>

          {/* Model Architecture Specs */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" /> YOLO-v2 Deep Learning Architecture Specs
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400">Model Framework</div>
                <div className="text-sm font-bold text-slate-200 mt-1">YOLO-v2 Keras</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400">Input Resolution</div>
                <div className="text-sm font-bold text-slate-200 mt-1">416 x 416 px</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400">Training Samples</div>
                <div className="text-sm font-bold text-slate-200 mt-1">150 Images / 568 Labels</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400">Anchor Boxes</div>
                <div className="text-sm font-bold text-slate-200 mt-1">5 Anchor Pairs</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Distribution Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-cyan-400" /> Severity Breakdown
            </h3>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span className="text-red-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400" /> Critical (2)
                  </span>
                  <span>50%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '50%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> Moderate (1)
                  </span>
                  <span>25%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Minor (1)
                  </span>
                  <span>25%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Ready for municipal dispatch export</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
