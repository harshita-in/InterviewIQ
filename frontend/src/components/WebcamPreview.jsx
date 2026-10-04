import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Mic, MicOff, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WebcamPreview({ isListening }) {
  const videoRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  useEffect(() => {
    let localStream = null;

    async function setupCamera() {
      if (!cameraEnabled) {
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
        }
        setStreamActive(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
        localStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStreamActive(true);
        setCameraError(null);
      } catch (err) {
        console.warn("Camera access denied or not available:", err);
        setCameraError("Camera unavailable or permission denied");
        setStreamActive(false);
      }
    }

    setupCamera();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraEnabled]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl aspect-video flex items-center justify-center">
      {/* Video element */}
      {streamActive ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform -scale-x-100"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-3 text-slate-400">
            <CameraOff className="w-8 h-8" />
          </div>
          <p className="text-sm font-medium text-slate-300">
            {cameraError ? cameraError : "Camera is turned off"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Turn on camera for video analysis & eye contact tracking
          </p>
        </div>
      )}

      {/* Face guide bounding box overlay */}
      {streamActive && (
        <div className="absolute inset-8 pointer-events-none border-2 border-dashed border-emerald-500/30 rounded-2xl flex items-start justify-end p-3">
          <span className="bg-emerald-950/80 backdrop-blur-sm text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Face Centered & Focused
          </span>
        </div>
      )}

      {/* Floating Controls Overlay */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800/80 text-xs">
          <span className={`w-2 h-2 rounded-full ${streamActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
          <span className="text-slate-300 font-medium">Candidate Feed</span>
          {isListening && (
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider animate-pulse">
              MIC LIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCameraEnabled(!cameraEnabled)}
            className={`p-2 rounded-full border transition-all ${
              cameraEnabled 
                ? 'bg-slate-900/80 text-slate-200 border-slate-700 hover:bg-slate-800' 
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
            }`}
            title={cameraEnabled ? "Disable Camera" : "Enable Camera"}
          >
            {cameraEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
