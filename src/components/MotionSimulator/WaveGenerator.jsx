import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  HelpCircle, 
  Sliders, 
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

// --- WAVE MACHINE RODS ---
function WaveMachine({
  amplitude,
  frequency,
  wavelength,
  isRunning,
  selectedPart,
  hoveredPart,
  onCrestsFound
}) {
  const count = 50;
  const spacing = 0.12;
  const rodsRef = useRef([]);

  // Setup initial rods
  if (rodsRef.current.length === 0) {
    for (let i = 0; i < count; i++) {
      rodsRef.current.push({
        x: (i - count / 2) * spacing,
        meshRef: React.createRef()
      });
    }
  }

  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (isRunning) {
      timeRef.current += delta;
    }

    const t = timeRef.current;
    const A = amplitude;
    const f = frequency;
    const L = wavelength;

    // wave parameters:
    // k = 2pi / L
    // omega = 2pi * f
    const k = (2 * Math.PI) / L;
    const omega = 2 * Math.PI * f;

    let highestIdx = -1;
    let highestY = -999;
    let crestsList = [];

    // Update position of each rod
    rodsRef.current.forEach((rod, idx) => {
      const x = rod.x;
      // Transverse wave formula: y = A * cos(k*x - omega*t)
      const phase = k * x - omega * t;
      const y = A * Math.cos(phase);

      if (rod.meshRef.current) {
        rod.meshRef.current.position.y = y;
        
        // Scale rod cylinder height to touch base plate
        const rodScaleY = (y + 1.8) / 2;
        const scaleGroup = rod.meshRef.current.children[0];
        if (scaleGroup) {
          scaleGroup.scale.set(1, Math.max(0.01, rodScaleY), 1);
          // position cylinder base half height
          const cylinderMesh = scaleGroup.children[0];
          if (cylinderMesh) {
            cylinderMesh.position.y = -y - 1.8 + rodScaleY;
          }
        }
      }

      // Detect crests: cosine phase is close to 2*n*pi (cos(phase) near 1)
      const cosVal = Math.cos(phase);
      if (cosVal > 0.985) {
        crestsList.push({ x, y });
      }
    });

    // Send detected crest coordinates back to parent for drawing the lambda ruler
    if (onCrestsFound && crestsList.length >= 2) {
      // Sort crests left-to-right
      crestsList.sort((a, b) => a.x - b.x);
      onCrestsFound(crestsList);
    }
  });

  const A = amplitude;
  const f = frequency;
  const L = wavelength;

  return (
    <group position={[0, -0.2, 0]}>
      {/* Wave beads / rods */}
      {rodsRef.current.map((rod, idx) => {
        return (
          <group key={idx} position={[rod.x, 0, 0]} ref={rod.meshRef}>
            {/* Rod Cylinder (stretching down to base plate at y = -1.8) */}
            <group>
              <mesh castShadow>
                <cylinderGeometry args={[0.012, 0.012, 2.0, 6]} />
                <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
              </mesh>
            </group>

            {/* Glowing bead on top */}
            <mesh castShadow>
              <sphereGeometry args={[0.065, 12, 12]} />
              <meshStandardMaterial 
                color={
                  selectedPart === 'wave-crest' 
                    ? "#22c55e" 
                    : selectedPart === 'wave-trough'
                    ? "#ec4899"
                    : "#38bdf8"
                } 
                emissive={
                  selectedPart === 'wave-crest' 
                    ? "#22c55e" 
                    : selectedPart === 'wave-trough'
                    ? "#ec4899"
                    : "#0ea5e9"
                }
                emissiveIntensity={0.6}
                roughness={0.1}
              />
            </mesh>
          </group>
        );
      })}

      {/* Wave machine base plate */}
      <mesh receiveShadow position={[0, -1.8, 0]}>
        <boxGeometry args={[7.0, 0.1, 1.2]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.8} />
      </mesh>
    </group>
  );
}

// --- WAVELENGTH DIMENSION BRACKET ---
function WavelengthRuler({ crests, wavelength, visible }) {
  if (!visible || crests.length < 2) return null;

  // Let's find two adjacent crests near center
  let leftCrest = crests[0];
  let rightCrest = crests[1];

  // If there are more than 2, pick a pair that spans nicely in view
  for (let i = 0; i < crests.length - 1; i++) {
    if (crests[i].x >= -1.8) {
      leftCrest = crests[i];
      rightCrest = crests[i + 1];
      break;
    }
  }

  const rulerY = Math.max(leftCrest.y, rightCrest.y) + 0.3;

  // Create points for ruler line
  const pts = [
    new THREE.Vector3(leftCrest.x, rulerY - 0.2, 0),
    new THREE.Vector3(leftCrest.x, rulerY, 0),
    new THREE.Vector3(rightCrest.x, rulerY, 0),
    new THREE.Vector3(rightCrest.x, rulerY - 0.2, 0)
  ];

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(pts);

  return (
    <group position={[0, -0.2, 0]}>
      {/* Dimension line */}
      <line>
        <bufferGeometry attach="geometry" {...lineGeometry} />
        <lineBasicMaterial attach="material" color="#10b981" linewidth={2.5} toneMapped={false} />
      </line>

      {/* Left indicator dot */}
      <mesh position={[leftCrest.x, rulerY, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#10b981" toneMapped={false} />
      </mesh>

      {/* Right indicator dot */}
      <mesh position={[rightCrest.x, rulerY, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#10b981" toneMapped={false} />
      </mesh>

      {/* Floating Wavelength HTML label */}
      <Html position={[(leftCrest.x + rightCrest.x) / 2, rulerY + 0.15, 0]} center>
        <div className="bg-emerald-950/95 border border-emerald-500/40 px-2 py-0.5 rounded-md text-[8.5px] font-black text-emerald-400 font-mono shadow-lg whitespace-nowrap">
          λ = {wavelength.toFixed(2)}m
        </div>
      </Html>
    </group>
  );
}

// --- MAIN CONTROLLER COMPONENT ---
export default function WaveGenerator({ selectedPart, onSelectPart, hoveredPart, onHoverPart }) {
  const [isRunning, setIsRunning] = useState(true);

  // User Wave Sliders
  const [amplitude, setAmplitude] = useState(0.6); // meters
  const [frequency, setFrequency] = useState(1.2); // Hz (cycles/sec)
  const [wavelength, setWavelength] = useState(2.2); // meters

  // Coordinates of crests populated by the Canvas frame loop
  const [crests, setCrests] = useState([]);

  // Wave speed formula: v = f * λ
  const waveSpeed = useMemo(() => frequency * wavelength, [frequency, wavelength]);
  // Wave period formula: T = 1 / f
  const period = useMemo(() => (frequency > 0 ? 1 / frequency : Infinity), [frequency]);

  const handleReset = () => {
    setAmplitude(0.6);
    setFrequency(1.2);
    setWavelength(2.2);
    setIsRunning(true);
  };

  const isWavelengthSelected = selectedPart === 'wave-wavelength';

  return (
    <div className="w-full flex flex-col gap-4">
      
      {/* 3D Viewport */}
      <div className="relative w-full rounded-2xl border border-white/10 bg-[#02030a] overflow-hidden h-[300px] shadow-xl">
        <Canvas
          camera={{ position: [0, 0.4, 4.5], fov: 45 }}
          shadows
          className="h-full w-full"
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 6, 4]} intensity={1.5} castShadow />

          {/* Dynamic Wave Rods machine */}
          <WaveMachine 
            amplitude={amplitude}
            frequency={frequency}
            wavelength={wavelength}
            isRunning={isRunning}
            selectedPart={selectedPart}
            hoveredPart={hoveredPart}
            onCrestsFound={setCrests}
          />

          {/* Dynamic dimension line helper */}
          <WavelengthRuler 
            crests={crests}
            wavelength={wavelength}
            visible={isWavelengthSelected || selectedPart === 'wave-crest'}
          />

          <OrbitControls 
            enableZoom={true} 
            enablePan={false}
            maxDistance={8}
            minDistance={2.5}
            target={[0, -0.4, 0]}
            makeDefault
          />
        </Canvas>

        {/* 3D Scene Badge Overlay */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div className="rounded-lg bg-[#050914]/85 border border-white/5 px-2.5 py-1 backdrop-blur-md text-[9px] font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5 shadow-md">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
            3D Transverse Wave Tank
          </div>
        </div>

        {/* Controls Overlay inside viewport */}
        <div className="absolute bottom-3 right-3 z-10 flex gap-2">
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={`flex h-8 px-3 items-center justify-center gap-1.5 rounded-xl border border-white/10 text-[10px] font-bold backdrop-blur-md transition-all shadow-md ${
              isRunning ? 'bg-amber-950/80 text-amber-300' : 'bg-emerald-950/80 text-emerald-300'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                Resume
              </>
            )}
          </button>
          <button 
            onClick={handleReset}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#050914]/80 text-gray-300 hover:text-white backdrop-blur-md transition-all shadow-md"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Selected Part helper hints */}
        {selectedPart && (
          <div className="absolute bottom-3 left-3 z-10 pointer-events-none max-w-[200px]">
            <div className="bg-[#050914]/90 border border-[#0ea5e9]/20 rounded-xl p-2.5 backdrop-blur-md text-[9px] text-gray-300 space-y-1 shadow-lg">
              <span className="text-brand-cyan font-bold block uppercase tracking-wider text-[8px]">
                Active Element Helper
              </span>
              {selectedPart === 'wave-crest' && "Crests represent peaks of maximum upward displacement (+Amplitude)."}
              {selectedPart === 'wave-trough' && "Troughs represent peaks of maximum downward displacement (-Amplitude)."}
              {selectedPart === 'wave-wavelength' && "Wavelength (λ) is the distance from one crest/trough to the next."}
            </div>
          </div>
        )}
      </div>

      {/* Control sliders & Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        
        {/* WAVE CONTROLS PANEL */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
            <Sliders className="h-4 w-4 text-brand-cyan" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Wave Machine Controls
            </h3>
          </div>

          <div className="space-y-4 flex-1 mb-2">
            {/* Amplitude slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold">
                <span className="text-gray-400">Wave Amplitude (A)</span>
                <span className="text-brand-cyan font-mono">{amplitude.toFixed(2)} m</span>
              </div>
              <input 
                type="range"
                min="0.1"
                max="1.2"
                step="0.05"
                value={amplitude}
                onChange={(e) => setAmplitude(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
            </div>

            {/* Frequency slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold">
                <span className="text-gray-400">Frequency (f)</span>
                <span className="text-brand-cyan font-mono">{frequency.toFixed(2)} Hz</span>
              </div>
              <input 
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={frequency}
                onChange={(e) => setFrequency(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
            </div>

            {/* Wavelength slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold">
                <span className="text-gray-400">Wavelength (λ)</span>
                <span className="text-brand-cyan font-mono">{wavelength.toFixed(2)} m</span>
              </div>
              <input 
                type="range"
                min="0.8"
                max="4.0"
                step="0.1"
                value={wavelength}
                onChange={(e) => setWavelength(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
            </div>
          </div>
        </div>

        {/* TELEMETRY & RELATIONSHIP PANELS */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col gap-3 shadow-lg justify-between">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Activity className="h-4 w-4 text-brand-cyan" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Wave Telemetry & math
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
            {/* Period Box */}
            <div className="bg-slate-950/60 p-2 rounded border border-white/5">
              <span className="text-gray-400 block text-[7px] uppercase tracking-wider">Wave Period (T = 1/f)</span>
              <span className="text-white font-bold">
                {period.toFixed(3)} seconds
              </span>
            </div>

            {/* Wave Speed Box */}
            <div className="bg-slate-950/60 p-2 rounded border border-white/5">
              <span className="text-gray-400 block text-[7px] uppercase tracking-wider">Wave Speed (v = f * λ)</span>
              <span className="text-emerald-400 font-bold">
                {waveSpeed.toFixed(3)} m/s
              </span>
            </div>
          </div>

          {/* Relationship explanatory note */}
          <div className="bg-slate-950/80 rounded-xl border border-white/5 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-gray-300 uppercase tracking-wider">
              <Info className="h-3.5 w-3.5 text-brand-cyan" />
              <span>Wave Property Observations</span>
            </div>
            <div className="text-[8.5px] text-gray-300 leading-relaxed space-y-1">
              <p>● **Frequency & Period** are inverses. Doubling frequency cuts the wave cycle time in half.</p>
              <p>● **Wavelength** controls peak-to-peak distance. Select **Wavelength** in the checklist to see the live measurement bracket above!</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
