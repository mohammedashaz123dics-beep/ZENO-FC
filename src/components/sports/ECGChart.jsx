import React, { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';
import { Heart, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ECGChart({ heartRate = 72 }) {
  const [ecgData, setEcgData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Calculate accurate ECG intervals based on heart rate
  const ecgParams = useMemo(() => {
    const rrInterval = 60000 / heartRate; // ms between beats
    const rrSeconds = rrInterval / 1000;
    
    // Standard ECG intervals (adjusted for heart rate)
    // PR interval: 120-200ms (relatively constant)
    const prInterval = Math.max(0.12, Math.min(0.20, 0.16));
    // QRS duration: 80-100ms (constant)
    const qrsDuration = 0.08 + (Math.random() * 0.02);
    // QT interval varies with heart rate (Bazett's formula approximation)
    const qtInterval = 0.40 * Math.sqrt(rrSeconds);
    
    return {
      rrInterval: rrSeconds,
      prInterval,
      qrsDuration,
      qtInterval,
      // Heart rate variability simulation
      hrv: Math.random() * 0.05 - 0.025
    };
  }, [heartRate]);

  // Determine rhythm status
  const rhythmStatus = useMemo(() => {
    if (heartRate < 60) return { status: 'bradycardia', color: 'text-amber-400', message: 'Bradycardia - Low heart rate' };
    if (heartRate > 100) return { status: 'tachycardia', color: 'text-amber-400', message: 'Tachycardia - Elevated heart rate' };
    if (heartRate >= 60 && heartRate <= 100) return { status: 'normal', color: 'text-green-400', message: 'Normal Sinus Rhythm' };
    return { status: 'unknown', color: 'text-slate-400', message: 'Analyzing...' };
  }, [heartRate]);
  
  // Generate medically accurate ECG waveform
  useEffect(() => {
    // Points per cardiac cycle based on heart rate
    const cycleMs = 60000 / heartRate;
    const samplingRate = 250; // 250 Hz like medical ECG
    const pointsPerCycle = Math.round((cycleMs / 1000) * samplingRate);
    
    const generateAccurateECGCycle = (offset, variation = 0) => {
      const cycle = [];
      
      for (let i = 0; i < pointsPerCycle; i++) {
        const t = i / pointsPerCycle; // Normalized time 0-1
        let value = 0;
        
        // Baseline with slight drift (respiratory variation)
        const baseline = Math.sin(offset * 0.01) * 0.02;
        
        // P wave (atrial depolarization) - 0.08-0.12s duration, 0.1-0.25mV amplitude
        const pStart = 0.10;
        const pEnd = 0.20;
        if (t >= pStart && t < pEnd) {
          const pT = (t - pStart) / (pEnd - pStart);
          // Smooth bell curve for P wave
          value = 0.15 * Math.exp(-Math.pow((pT - 0.5) * 4, 2));
        }
        
        // PR segment (isoelectric)
        // Already at baseline
        
        // QRS Complex (ventricular depolarization) - detailed modeling
        const qrsStart = 0.25;
        const qrsEnd = 0.35;
        
        if (t >= qrsStart && t < qrsEnd) {
          const qrsT = (t - qrsStart) / (qrsEnd - qrsStart);
          
          // Q wave (small negative deflection)
          if (qrsT < 0.15) {
            value = -0.1 * Math.sin(qrsT / 0.15 * Math.PI);
          }
          // R wave (large positive spike)
          else if (qrsT < 0.45) {
            const rT = (qrsT - 0.15) / 0.30;
            value = 1.2 * Math.sin(rT * Math.PI);
          }
          // S wave (negative deflection after R)
          else if (qrsT < 0.65) {
            const sT = (qrsT - 0.45) / 0.20;
            value = -0.3 * Math.sin(sT * Math.PI);
          }
          // Return to baseline
          else {
            const returnT = (qrsT - 0.65) / 0.35;
            value = -0.3 * (1 - returnT) * Math.sin((1 - returnT) * Math.PI / 2);
          }
        }
        
        // ST segment (should be isoelectric, slight elevation/depression possible)
        const stStart = qrsEnd;
        const stEnd = 0.45;
        if (t >= stStart && t < stEnd) {
          // Slight natural variation
          value = 0.02 * Math.sin((t - stStart) / (stEnd - stStart) * Math.PI);
        }
        
        // T wave (ventricular repolarization) - asymmetric
        const tStart = 0.45;
        const tEnd = 0.65;
        if (t >= tStart && t < tEnd) {
          const tT = (t - tStart) / (tEnd - tStart);
          // Asymmetric T wave (steeper upslope, gradual downslope)
          if (tT < 0.4) {
            value = 0.25 * Math.sin(tT / 0.4 * Math.PI / 2);
          } else {
            value = 0.25 * Math.cos((tT - 0.4) / 0.6 * Math.PI / 2);
          }
        }
        
        // U wave (small positive deflection, sometimes visible)
        const uStart = 0.68;
        const uEnd = 0.75;
        if (t >= uStart && t < uEnd && Math.random() > 0.7) {
          const uT = (t - uStart) / (uEnd - uStart);
          value = 0.05 * Math.sin(uT * Math.PI);
        }
        
        // Add realistic noise (60Hz interference simulation + random noise)
        const noise = (Math.random() * 0.015 - 0.0075) + Math.sin(i * 0.15) * 0.005;
        
        cycle.push({
          x: offset + i,
          y: value + baseline + noise + variation
        });
      }
      return cycle;
    };

    // Initialize with multiple cycles
    const initialData = [];
    const cyclesToShow = 4;
    for (let i = 0; i < cyclesToShow; i++) {
      const variation = (Math.random() * 0.04 - 0.02); // Heart rate variability
      initialData.push(...generateAccurateECGCycle(i * pointsPerCycle, variation));
    }
    setEcgData(initialData);

    // Animate ECG sweep
    const updateInterval = 1000 / samplingRate; // Match sampling rate
    let frameCount = 0;
    
    const interval = setInterval(() => {
      frameCount++;
      setEcgData(prev => {
        if (prev.length === 0) return prev;
        
        const newData = [...prev.slice(1)];
        const lastX = newData[newData.length - 1]?.x || 0;
        const cyclePosition = (lastX % pointsPerCycle) / pointsPerCycle;
        
        let value = 0;
        const baseline = Math.sin(lastX * 0.01) * 0.02;
        
        // Simplified real-time calculation
        if (cyclePosition >= 0.10 && cyclePosition < 0.20) {
          const pT = (cyclePosition - 0.10) / 0.10;
          value = 0.15 * Math.exp(-Math.pow((pT - 0.5) * 4, 2));
        } else if (cyclePosition >= 0.25 && cyclePosition < 0.35) {
          const qrsT = (cyclePosition - 0.25) / 0.10;
          if (qrsT < 0.15) value = -0.1 * Math.sin(qrsT / 0.15 * Math.PI);
          else if (qrsT < 0.45) value = 1.2 * Math.sin((qrsT - 0.15) / 0.30 * Math.PI);
          else if (qrsT < 0.65) value = -0.3 * Math.sin((qrsT - 0.45) / 0.20 * Math.PI);
          else value = -0.3 * (1 - (qrsT - 0.65) / 0.35);
        } else if (cyclePosition >= 0.45 && cyclePosition < 0.65) {
          const tT = (cyclePosition - 0.45) / 0.20;
          value = tT < 0.4 ? 0.25 * Math.sin(tT / 0.4 * Math.PI / 2) : 0.25 * Math.cos((tT - 0.4) / 0.6 * Math.PI / 2);
        }
        
        const noise = (Math.random() * 0.015 - 0.0075);
        newData.push({ x: lastX + 1, y: value + baseline + noise });
        
        return newData;
      });
      
      setCurrentIndex(prev => prev + 1);
    }, updateInterval);

    return () => clearInterval(interval);
  }, [heartRate]);

  // Calculate displayed intervals based on heart rate
  const displayedIntervals = useMemo(() => {
    const rr = 60 / heartRate;
    return {
      pr: `${(ecgParams.prInterval * 1000).toFixed(0)}ms`,
      qrs: `${(ecgParams.qrsDuration * 1000).toFixed(0)}ms`,
      qt: `${(ecgParams.qtInterval * 1000).toFixed(0)}ms`,
      qtc: `${(ecgParams.qtInterval / Math.sqrt(rr) * 1000).toFixed(0)}ms` // QTc corrected
    };
  }, [heartRate, ecgParams]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 border border-slate-700/50"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-xl">
            <Activity className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">ECG Monitor</h3>
            <p className="text-slate-400 text-xs">12-Lead Simulation • 250Hz</p>
          </div>
        </div>
        <motion.div 
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 60 / heartRate }}
          className="flex items-center gap-2 bg-red-500/20 px-3 py-2 rounded-xl"
        >
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          <span className="text-red-400 font-bold text-lg">{heartRate}</span>
          <span className="text-red-400/70 text-xs">BPM</span>
        </motion.div>
      </div>

      {/* Rhythm Status */}
      <div className={`flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg ${
        rhythmStatus.status === 'normal' ? 'bg-green-500/10' : 'bg-amber-500/10'
      }`}>
        {rhythmStatus.status === 'normal' ? (
          <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        )}
        <span className={`text-sm font-medium ${rhythmStatus.color}`}>{rhythmStatus.message}</span>
      </div>
      
      {/* ECG Display with grid */}
      <div className="h-36 bg-slate-950 rounded-xl p-2 border border-slate-700/30 relative overflow-hidden">
        {/* ECG Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="smallGrid" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#334155" strokeWidth="0.5"/>
              </pattern>
              <pattern id="largeGrid" width="25" height="25" patternUnits="userSpaceOnUse">
                <rect width="25" height="25" fill="url(#smallGrid)"/>
                <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#475569" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#largeGrid)" />
          </svg>
        </div>
        
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={ecgData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="ecgGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="70%" stopColor="#10B981" stopOpacity={1} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={1} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <ReferenceLine y={0} stroke="#334155" strokeWidth={1} />
            <YAxis domain={[-0.5, 1.4]} hide />
            <XAxis hide />
            <Line 
              type="monotone" 
              dataKey="y" 
              stroke="url(#ecgGradient)" 
              strokeWidth={1.5} 
              dot={false}
              isAnimationActive={false}
              filter="url(#glow)"
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Lead indicator */}
        <div className="absolute top-2 left-3 text-xs text-green-400/70 font-mono">Lead II</div>
        <div className="absolute bottom-2 right-3 text-xs text-slate-500 font-mono">25mm/s • 10mm/mV</div>
      </div>
      
      {/* ECG Intervals - Medical metrics */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-slate-500 text-xs">PR</p>
          <p className={`font-semibold text-sm ${
            parseInt(displayedIntervals.pr) > 200 ? 'text-amber-400' : 'text-green-400'
          }`}>{displayedIntervals.pr}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-slate-500 text-xs">QRS</p>
          <p className={`font-semibold text-sm ${
            parseInt(displayedIntervals.qrs) > 120 ? 'text-amber-400' : 'text-green-400'
          }`}>{displayedIntervals.qrs}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-slate-500 text-xs">QT</p>
          <p className="text-green-400 font-semibold text-sm">{displayedIntervals.qt}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-slate-500 text-xs">QTc</p>
          <p className={`font-semibold text-sm ${
            parseInt(displayedIntervals.qtc) > 450 ? 'text-amber-400' : 'text-green-400'
          }`}>{displayedIntervals.qtc}</p>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-slate-600 text-xs mt-3 text-center">
        Simulation only • Not for medical diagnosis
      </p>
    </motion.div>
  );
}