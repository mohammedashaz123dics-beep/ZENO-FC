import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Camera, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function HeartRateSensor({ onMeasurement }) {
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [instruction, setInstruction] = useState('Cover the camera with your fingertip');
  const [signalQuality, setSignalQuality] = useState(0);
  const [liveWaveform, setLiveWaveform] = useState([]);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const signalBufferRef = useRef([]);
  const peakTimesRef = useRef([]);
  const lastPeakTimeRef = useRef(0);
  const measurementDuration = 20000; // 20 seconds for accuracy
  const startTimeRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isMeasuring) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    canvas.width = 64;
    canvas.height = 64;
    
    ctx.drawImage(video, 0, 0, 64, 64);
    const imageData = ctx.getImageData(0, 0, 64, 64);
    const data = imageData.data;
    
    // Extract red channel average (PPG signal)
    let redSum = 0;
    let greenSum = 0;
    let pixelCount = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      redSum += data[i];     // Red channel
      greenSum += data[i + 1]; // Green channel
      pixelCount++;
    }
    
    const redAvg = redSum / pixelCount;
    const greenAvg = greenSum / pixelCount;
    
    // Check if finger is covering camera (high red, low variation)
    const isCovered = redAvg > 100 && greenAvg < redAvg * 0.8;
    
    if (!isCovered) {
      setSignalQuality(0);
      setInstruction('Cover camera completely with fingertip');
    } else {
      // Update signal buffer
      signalBufferRef.current.push(redAvg);
      
      // Keep buffer size manageable (last 5 seconds at ~30fps)
      if (signalBufferRef.current.length > 150) {
        signalBufferRef.current.shift();
      }
      
      // Calculate signal quality based on variation
      if (signalBufferRef.current.length > 30) {
        const recent = signalBufferRef.current.slice(-30);
        const min = Math.min(...recent);
        const max = Math.max(...recent);
        const range = max - min;
        
        // Good PPG signal has noticeable variation
        const quality = Math.min(100, Math.max(0, (range - 2) * 20));
        setSignalQuality(quality);
        
        if (quality < 30) {
          setInstruction('Press finger firmly, stay still');
        } else if (quality < 60) {
          setInstruction('Good signal, keep steady...');
        } else {
          setInstruction('Excellent signal, measuring...');
        }
        
        // Peak detection for heart rate
        detectPeaks();
        
        // Update live waveform for visualization
        updateWaveform();
      }
    }
    
    // Update progress
    if (startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min((elapsed / measurementDuration) * 100, 100));
      
      if (elapsed >= measurementDuration) {
        finishMeasurement();
        return;
      }
    }
    
    animationRef.current = requestAnimationFrame(processFrame);
  }, [isMeasuring]);

  const detectPeaks = useCallback(() => {
    const buffer = signalBufferRef.current;
    if (buffer.length < 60) return;
    
    // Apply simple moving average filter
    const filtered = [];
    const windowSize = 5;
    for (let i = windowSize; i < buffer.length - windowSize; i++) {
      let sum = 0;
      for (let j = -windowSize; j <= windowSize; j++) {
        sum += buffer[i + j];
      }
      filtered.push(sum / (windowSize * 2 + 1));
    }
    
    // Find local maxima (peaks)
    const now = Date.now();
    const minPeakDistance = 300; // Minimum 300ms between peaks (max 200 BPM)
    
    for (let i = 10; i < filtered.length - 10; i++) {
      const isPeak = filtered[i] > filtered[i - 1] && 
                     filtered[i] > filtered[i + 1] &&
                     filtered[i] > filtered[i - 5] &&
                     filtered[i] > filtered[i + 5];
      
      if (isPeak && (now - lastPeakTimeRef.current) > minPeakDistance) {
        // Calculate approximate time of this peak
        const peakTime = now - ((filtered.length - i) * 33); // ~30fps
        
        if (peakTime - lastPeakTimeRef.current > minPeakDistance) {
          peakTimesRef.current.push(peakTime);
          lastPeakTimeRef.current = peakTime;
          
          // Keep only recent peaks (last 30 seconds)
          const cutoff = now - 30000;
          peakTimesRef.current = peakTimesRef.current.filter(t => t > cutoff);
        }
      }
    }
  }, []);

  const updateWaveform = useCallback(() => {
    const buffer = signalBufferRef.current.slice(-100);
    if (buffer.length < 10) return;
    
    // Normalize for display
    const min = Math.min(...buffer);
    const max = Math.max(...buffer);
    const range = max - min || 1;
    
    const normalized = buffer.map(v => ((v - min) / range) * 100);
    setLiveWaveform(normalized);
  }, []);

  const finishMeasurement = useCallback(() => {
    stopCamera();
    setIsMeasuring(false);
    
    const peaks = peakTimesRef.current;
    
    if (peaks.length < 5) {
      setError('Not enough heartbeats detected. Ensure finger covers camera.');
      setInstruction('Try again');
      return;
    }
    
    // Calculate intervals between peaks
    const intervals = [];
    for (let i = 1; i < peaks.length; i++) {
      const interval = peaks[i] - peaks[i - 1];
      // Filter realistic intervals (30-200 BPM = 300-2000ms)
      if (interval >= 300 && interval <= 2000) {
        intervals.push(interval);
      }
    }
    
    if (intervals.length < 3) {
      setError('Could not calculate reliable BPM. Try again.');
      setInstruction('Try again');
      return;
    }
    
    // Remove outliers using IQR
    intervals.sort((a, b) => a - b);
    const q1 = intervals[Math.floor(intervals.length * 0.25)];
    const q3 = intervals[Math.floor(intervals.length * 0.75)];
    const iqr = q3 - q1;
    const validIntervals = intervals.filter(i => i >= q1 - 1.5 * iqr && i <= q3 + 1.5 * iqr);
    
    if (validIntervals.length < 3) {
      setError('Measurement too inconsistent. Keep finger steady.');
      setInstruction('Try again');
      return;
    }
    
    // Calculate BPM from average interval
    const avgInterval = validIntervals.reduce((a, b) => a + b, 0) / validIntervals.length;
    const bpm = Math.round(60000 / avgInterval);
    
    if (bpm < 40 || bpm > 200) {
      setError('Unusual reading. Please try again.');
      setInstruction('Try again');
      return;
    }
    
    setResult(bpm);
    setError(null);
    setInstruction('Measurement complete!');
    onMeasurement?.(bpm);
  }, [stopCamera, onMeasurement]);

  const startMeasurement = async () => {
    setError(null);
    setResult(null);
    setProgress(0);
    setSignalQuality(0);
    setLiveWaveform([]);
    signalBufferRef.current = [];
    peakTimesRef.current = [];
    lastPeakTimeRef.current = 0;
    
    try {
      // Request camera with torch/flash enabled
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 128 },
          height: { ideal: 128 },
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      // Try to enable torch/flash
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.();
      if (capabilities?.torch) {
        await track.applyConstraints({ advanced: [{ torch: true }] });
      }
      
      setIsMeasuring(true);
      startTimeRef.current = Date.now();
      setInstruction('Cover camera with fingertip, press firmly');
      
      // Start processing frames
      animationRef.current = requestAnimationFrame(processFrame);
      
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied. Please allow camera access.');
    }
  };

  const resetMeasurement = () => {
    stopCamera();
    setIsMeasuring(false);
    setProgress(0);
    setResult(null);
    setError(null);
    setSignalQuality(0);
    setLiveWaveform([]);
    signalBufferRef.current = [];
    peakTimesRef.current = [];
    setInstruction('Cover the camera with your fingertip');
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  useEffect(() => {
    if (isMeasuring && !animationRef.current) {
      animationRef.current = requestAnimationFrame(processFrame);
    }
  }, [isMeasuring, processFrame]);

  return (
    <div className="bg-gradient-to-br from-red-500/20 to-pink-500/10 rounded-2xl p-5 border border-red-500/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-500/20 rounded-xl">
          <Camera className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">PPG Heart Rate Sensor</h3>
          <p className="text-slate-400 text-xs">Camera-based pulse detection</p>
        </div>
      </div>

      {/* Hidden video and canvas for processing */}
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex flex-col items-center">
        {/* Live Waveform Display */}
        {isMeasuring && liveWaveform.length > 10 && (
          <div className="w-full h-16 bg-slate-900/50 rounded-xl mb-4 overflow-hidden relative">
            <svg className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <path
                d={`M ${liveWaveform.map((v, i) => `${(i / liveWaveform.length) * 100}%,${100 - v}%`).join(' L ')}`}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
              />
            </svg>
            <div className="absolute top-1 left-2 text-xs text-red-400">Live PPG Signal</div>
          </div>
        )}

        {/* Sensor Button */}
        <motion.button
          onClick={isMeasuring ? undefined : (result ? resetMeasurement : startMeasurement)}
          disabled={isMeasuring}
          className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all ${
            isMeasuring 
              ? 'bg-gradient-to-br from-red-600 to-pink-600' 
              : result 
                ? 'bg-gradient-to-br from-green-600 to-emerald-600 cursor-pointer'
                : error
                  ? 'bg-gradient-to-br from-amber-600 to-orange-600 cursor-pointer'
                  : 'bg-gradient-to-br from-red-500/50 to-pink-500/50 cursor-pointer active:scale-95'
          }`}
          animate={isMeasuring ? { scale: [1, 1.02, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            {isMeasuring && (
              <circle
                cx="64"
                cy="64"
                r="60"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 60}`}
                strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress / 100)}`}
                className="transition-all duration-100"
              />
            )}
          </svg>
          
          <div className="z-10 text-center">
            {result ? (
              <Check className="w-10 h-10 text-white mx-auto" />
            ) : error ? (
              <AlertCircle className="w-10 h-10 text-white mx-auto" />
            ) : isMeasuring ? (
              <Loader2 className="w-10 h-10 text-white mx-auto animate-spin" />
            ) : (
              <Heart className="w-10 h-10 text-white" />
            )}
          </div>
        </motion.button>

        {/* Signal Quality Indicator */}
        {isMeasuring && (
          <div className="w-full mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Signal Quality</span>
              <span className={signalQuality > 60 ? 'text-green-400' : signalQuality > 30 ? 'text-amber-400' : 'text-red-400'}>
                {signalQuality > 60 ? 'Excellent' : signalQuality > 30 ? 'Good' : 'Poor'}
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full rounded-full ${
                  signalQuality > 60 ? 'bg-green-500' : signalQuality > 30 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                animate={{ width: `${signalQuality}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Instructions */}
        <p className={`text-sm mt-4 text-center ${error ? 'text-amber-400' : 'text-slate-300'}`}>
          {error || instruction}
        </p>

        {/* Result Display */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-center"
            >
              <div className="flex items-baseline justify-center gap-2">
                <motion.span 
                  className="text-4xl font-bold text-white"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                >
                  {result}
                </motion.span>
                <span className="text-red-400 text-lg">BPM</span>
              </div>
              <p className="text-slate-500 text-xs mt-1">Based on {peakTimesRef.current.length} detected heartbeats</p>
              <button
                onClick={resetMeasurement}
                className="mt-3 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition-colors"
              >
                Measure Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How to use */}
        {!isMeasuring && !result && !error && (
          <div className="mt-4 bg-slate-800/50 rounded-xl p-3">
            <p className="text-slate-300 text-xs font-medium mb-2">How it works:</p>
            <ol className="text-slate-400 text-xs space-y-1 list-decimal list-inside">
              <li>Tap the button to start</li>
              <li>Cover the rear camera with your fingertip</li>
              <li>Press firmly and stay still for 20 seconds</li>
              <li>The flash illuminates blood flow for detection</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}