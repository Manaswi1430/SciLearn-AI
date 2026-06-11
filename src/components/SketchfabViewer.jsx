import React, { useState, useEffect, useRef } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function SketchfabViewer({ sketchfabId, title, lessonName }) {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const timeoutRef = useRef(null);

  // Default fallback to an Bohr Atom model if no ID is passed
  const modelId = sketchfabId || "2cc716075e7a469fa77884d6b67ad7f5";
  const embedUrl = `https://sketchfab.com/models/${modelId}/embed?ui_theme=dark&dnt=1&preload=1&autostart=1&annotations_visible=1`;

  // Reset states and set up loading timeout fallback
  useEffect(() => {
    setLoading(true);
    setHasError(false);

    // If the iframe doesn't call onLoad in 30s, show error state (e.g. offline, rate-limits, blocked script)
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      setHasError(true);
    }, 30000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [modelId, retryCount]);

  const handleLoad = () => {
    setLoading(false);
    setHasError(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return (
    <div className="relative w-full rounded-2xl border border-white/10 bg-[#02050f] overflow-hidden h-[400px] md:h-[600px] shadow-2xl">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#02050f]/95 z-20 space-y-4">
          <Loader2 className="h-10 w-10 text-brand-cyan animate-spin" />
          <div className="text-center">
            <p className="text-sm font-extrabold text-white uppercase tracking-wider">Loading 3D Space</p>
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Sketchfab Engine Connecting</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#040815] z-30 p-6 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-amber-500 animate-bounce" />
          <div className="space-y-1.5 max-w-xs">
            <h4 className="text-base font-extrabold text-white">Failed to Load 3D model</h4>
            <p className="text-xs text-gray-400">
              The 3D server could not be reached or the model ID is invalid. Verify your network or proxy settings.
            </p>
          </div>
          <button
            onClick={() => {
              setRetryCount(prev => prev + 1);
            }}
            className="rounded-lg bg-gradient-to-r from-brand-purple to-brand-cyan px-4 py-2 text-xs font-bold text-white transition-all shadow-lg hover:brightness-115"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Embedded Iframe */}
      <iframe
        key={`${modelId}-${retryCount}`}
        title={title || lessonName || "Sketchfab 3D Model"}
        className="w-full h-full border-0 relative z-10"
        src={embedUrl}
        allow="autoplay; fullscreen; xr-spatial-tracking"
        xr-spatial-tracking="true"
        execution-while-out-of-viewport="true"
        execution-while-not-rendered="true"
        web-share="true"
        onLoad={handleLoad}
      ></iframe>

      {/* Badge label */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none select-none">
        <div className="rounded-lg bg-[#090d1a]/85 border border-white/10 px-2.5 py-1.5 backdrop-blur-md text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
          Sketchfab Interactive Embed
        </div>
      </div>
    </div>
  );
}
