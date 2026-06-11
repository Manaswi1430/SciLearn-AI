import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useProgress } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import GLBLoader from './GLBLoader';
import LabelPopup from './LabelPopup';
import LoadingScreen from './LoadingScreen';

// Helper to overlay LoadingScreen when useProgress indicates active loads
function LoaderOverlay() {
  const { active } = useProgress();
  if (!active) return null;
  return <LoadingScreen />;
}

export default function ModelViewer({ 
  modelPath, 
  lessonId, 
  selectedPart, 
  onSelectPart, 
  hoveredPart, 
  onHoverPart, 
  clickPosition, 
  onClickPosition 
}) {
  const containerRef = useRef();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync fullscreen state when user exits via Escape key
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Toggle HTML5 Fullscreen API
  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error("Fullscreen error:", err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => console.error("Exit fullscreen error:", err));
    }
  };

  // Reset OrbitControls camera view
  const controlsRef = useRef();
  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    // Clear selection
    onSelectPart(null);
    onClickPosition(null);
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full rounded-2xl border border-white/10 bg-[#02050f] overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'h-screen w-screen' : 'h-[360px] sm:h-[460px]'
      }`}
    >
      {/* 3D Canvas */}
      <Canvas 
        camera={{ position: [0, 0, 3.2], fov: 45 }} 
        shadows
        className="h-full w-full"
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.2} castShadow />
        <directionalLight position={[-5, 8, 5]} intensity={0.8} />
        
        <Suspense fallback={null}>
          <GLBLoader
            modelPath={modelPath}
            lessonId={lessonId}
            hoveredPart={hoveredPart}
            selectedPart={selectedPart}
            onPointerOver={onHoverPart}
            onPointerOut={() => onHoverPart(null)}
            onClick={(name, point) => {
              onSelectPart(name);
              onClickPosition(point);
            }}
          />
          {selectedPart && clickPosition && (
            <LabelPopup activePart={selectedPart} position={clickPosition} />
          )}
        </Suspense>

        <OrbitControls 
          ref={controlsRef}
          enableZoom={true} 
          enablePan={true} 
          enableRotate={true}
          maxDistance={6}
          minDistance={1.2}
          makeDefault
        />
        
        <Suspense fallback={null}>
          <EffectComposer>
            <Bloom 
              luminanceThreshold={0.4} 
              luminanceSmoothing={0.9} 
              intensity={0.3} 
            />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* Loading Overlay */}
      <LoaderOverlay />

      {/* Controls Overlay UI */}
      <div className="absolute bottom-4 right-4 z-20 flex gap-2">
        <button
          onClick={handleResetCamera}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#090d1a]/85 text-gray-400 hover:text-white hover:border-brand-purple backdrop-blur-md transition-all shadow-lg"
          title="Reset Camera"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={handleFullscreen}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#090d1a]/85 text-gray-400 hover:text-white hover:border-brand-purple backdrop-blur-md transition-all shadow-lg"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Instructional Badge */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none select-none">
        <div className="rounded-lg bg-[#090d1a]/80 border border-white/10 px-3 py-1.5 backdrop-blur-md text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
          Drag to Orbit • Scroll to Zoom • Click Parts
        </div>
      </div>
    </div>
  );
}
