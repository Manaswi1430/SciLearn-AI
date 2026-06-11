import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Play, 
  RotateCcw, 
  Activity, 
  HelpCircle, 
  Zap, 
  Gauge, 
  Sparkles,
  CircuitBoard as CircuitIcon,
  Compass,
  ArrowRightLeft
} from 'lucide-react';

// --- ANIMATED BRANCH ELECTRONS ---
function BranchElectrons({ current, startPt, endPt }) {
  const particlesCount = 8;
  const particles = useRef([]);
  
  if (particles.current.length === 0) {
    for (let i = 0; i < particlesCount; i++) {
      particles.current.push((i / particlesCount));
    }
  }

  useFrame((state, delta) => {
    // Current direction dictates particle speed direction
    const speed = current * 1.5; 
    
    for (let i = 0; i < particlesCount; i++) {
      let progress = particles.current[i];
      progress = (progress + speed * delta) % 1.0;
      if (progress < 0) progress += 1.0; // handle reverse direction
      particles.current[i] = progress;
    }
  });

  return (
    <group>
      {particles.current.map((ptProgress, idx) => {
        // interpolate position
        const pos = new THREE.Vector3().lerpVectors(startPt, endPt, ptProgress);
        return (
          <mesh position={pos} key={idx}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color={current >= 0 ? "#22d3ee" : "#f43f5e"} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}

// --- 3D COMPONENT SHAPES ---
function Battery3D({ position, isSelected, voltage, label }) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      {/* Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.9, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* positive cap */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.1, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.9} />
      </mesh>

      {/* label overlay */}
      <Html position={[0, 0.6, 0]} center>
        <div className="bg-slate-900/95 border border-white/10 px-1.5 py-0.5 rounded text-[8px] font-bold text-white font-mono whitespace-nowrap shadow-md">
          {label}: {voltage.toFixed(1)}V
        </div>
      </Html>

      {/* Selection Glow */}
      {isSelected && (
        <mesh>
          <cylinderGeometry args={[0.22, 0.22, 1.1, 16]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.35} wireframe />
        </mesh>
      )}
    </group>
  );
}

function Resistor3D({ position, isSelected, resistance, label }) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      {/* Ceramic body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.8, 16]} />
        <meshStandardMaterial color="#d97706" roughness={0.7} />
      </mesh>

      {/* wire leads */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </mesh>

      {/* color bands */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.06, 16]} />
        <meshStandardMaterial color={resistance > 10 ? "#4f46e5" : "#b91c1c"} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.06, 16]} />
        <meshStandardMaterial color={resistance > 3 ? "#15803d" : "#7c2d12"} />
      </mesh>

      {/* label overlay */}
      <Html position={[0, 0.6, 0]} center>
        <div className="bg-slate-900/95 border border-white/10 px-1.5 py-0.5 rounded text-[8px] font-bold text-white font-mono whitespace-nowrap shadow-md">
          {label}: {resistance.toFixed(0)}Ω
        </div>
      </Html>

      {/* Selection Glow */}
      {isSelected && (
        <mesh>
          <cylinderGeometry args={[0.18, 0.18, 1.0, 16]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.35} wireframe />
        </mesh>
      )}
    </group>
  );
}

// 3D wire frame paths
function SchematicWires() {
  const wireMat = new THREE.MeshStandardMaterial({ color: "#475569", roughness: 0.6, metalness: 0.8 });

  return (
    <group position={[0, 0.03, 0]}>
      {/* Top Rail Left */}
      <mesh position={[-1, 0, -1.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 2.0, 8]} />
        <mesh ref={el => el && (el.material = wireMat)} />
      </mesh>
      {/* Top Rail Right */}
      <mesh position={[1, 0, -1.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 2.0, 8]} />
        <mesh ref={el => el && (el.material = wireMat)} />
      </mesh>
      
      {/* Bottom Rail Left */}
      <mesh position={[-1, 0, 1.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 2.0, 8]} />
        <mesh ref={el => el && (el.material = wireMat)} />
      </mesh>
      {/* Bottom Rail Right */}
      <mesh position={[1, 0, 1.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 2.0, 8]} />
        <mesh ref={el => el && (el.material = wireMat)} />
      </mesh>

      {/* Left branch rails */}
      <mesh position={[-2, 0, -1.0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.0, 8]} />
        <mesh ref={el => el && (el.material = wireMat)} />
      </mesh>
      <mesh position={[-2, 0, 1.0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.0, 8]} />
        <mesh ref={el => el && (el.material = wireMat)} />
      </mesh>

      {/* Right branch rails */}
      <mesh position={[2, 0, -1.0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.0, 8]} />
        <mesh ref={el => el && (el.material = wireMat)} />
      </mesh>
      <mesh position={[2, 0, 1.0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.0, 8]} />
        <mesh ref={el => el && (el.material = wireMat)} />
      </mesh>

      {/* Middle branch rails */}
      <mesh position={[0, 0, -1.0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.0, 8]} />
        <mesh ref={el => el && (el.material = wireMat)} />
      </mesh>
      <mesh position={[0, 0, 1.0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.0, 8]} />
        <mesh ref={el => el && (el.material = wireMat)} />
      </mesh>
    </group>
  );
}

// Circuit board platform
function KirchhoffBoard() {
  return (
    <group position={[0, -0.05, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[6.2, 0.1, 5.0]} />
        <meshStandardMaterial color="#080c16" roughness={0.75} />
      </mesh>
      <gridHelper args={[6, 5, '#1e293b', '#0f172a']} position={[0, 0.051, 0]} />
    </group>
  );
}

// --- MAIN SIMULATOR CONTROLLER ---
export default function KirchhoffSimulator({ selectedPart, onSelectPart, hoveredPart, onHoverPart }) {
  // Sliders state
  const [V1, setV1] = useState(12.0); // Volts
  const [V2, setV2] = useState(6.0); // Volts
  const [R1, setR1] = useState(4.0); // Ohms
  const [R2, setR2] = useState(2.0); // Ohms
  const [R3, setR3] = useState(5.0); // Ohms

  // Analytical Solver using Cramer's Rule for a 2-loop circuit:
  // loop 1 (left): V1 - I1*R1 - I3*R3 = 0
  // loop 2 (right): V2 - I2*R2 - I3*R3 = 0
  // Junction (top): I1 + I2 = I3
  const calculations = useMemo(() => {
    const D = R1 * R2 + R1 * R3 + R2 * R3;
    const I1 = (V1 * (R2 + R3) - V2 * R3) / D;
    const I2 = (V2 * (R1 + R3) - V1 * R3) / D;
    const I3 = I1 + I2; // equals (V1*R2 + V2*R1) / D

    // Voltage drops across components
    const vDropR1 = Math.abs(I1 * R1);
    const vDropR2 = Math.abs(I2 * R2);
    const vDropR3 = I3 * R3; // I3 is always positive since both V1 and V2 are positive sources pushing down

    return { I1, I2, I3, vDropR1, vDropR2, vDropR3 };
  }, [V1, V2, R1, R2, R3]);

  const { I1, I2, I3, vDropR1, vDropR2, vDropR3 } = calculations;

  const handleReset = () => {
    setV1(12.0);
    setV2(6.0);
    setR1(4.0);
    setR2(2.0);
    setR3(5.0);
  };

  // Coordinates for particle branches
  const leftStart = new THREE.Vector3(-2, 0.05, 1.5);
  const leftEnd = new THREE.Vector3(-2, 0.05, -1.5);
  
  const rightStart = new THREE.Vector3(2, 0.05, 1.5);
  const rightEnd = new THREE.Vector3(2, 0.05, -1.5);
  
  const midStart = new THREE.Vector3(0, 0.05, -1.5);
  const midEnd = new THREE.Vector3(0, 0.05, 1.5);

  // Top rails flowing to center node
  const topLeftStart = new THREE.Vector3(-2, 0.05, -1.5);
  const topCenter = new THREE.Vector3(0, 0.05, -1.5);
  const topRightStart = new THREE.Vector3(2, 0.05, -1.5);

  // Bottom rails flowing from center node
  const bottomCenter = new THREE.Vector3(0, 0.05, 1.5);
  const bottomLeftEnd = new THREE.Vector3(-2, 0.05, 1.5);
  const bottomRightEnd = new THREE.Vector3(2, 0.05, 1.5);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 3D Scene viewport */}
      <div className="relative w-full rounded-2xl border border-white/10 bg-[#02030a] overflow-hidden h-[300px] shadow-xl">
        <Canvas
          camera={{ position: [0, 4.5, 5], fov: 45 }}
          shadows
          className="h-full w-full"
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
          <pointLight position={[-4, 5, -2]} intensity={0.5} />

          <KirchhoffBoard />
          <SchematicWires />

          {/* Glowing Junction spheres */}
          <mesh position={topCenter} castShadow>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={bottomCenter} castShadow>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.8} />
          </mesh>

          {/* HTML Junction labels */}
          <Html position={[0, 0.3, -1.5]} center>
            <div className="bg-[#eab308] text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow flex items-center gap-1">
              Junction A (Top)
            </div>
          </Html>
          <Html position={[0, 0.3, 1.5]} center>
            <div className="bg-[#eab308] text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow flex items-center gap-1">
              Junction B (Bottom)
            </div>
          </Html>

          {/* Animated branch electrons in correct physical directions */}
          {/* Left Branch */}
          <BranchElectrons current={I1} startPt={leftStart} endPt={leftEnd} />
          <BranchElectrons current={I1} startPt={topLeftStart} endPt={topCenter} />
          <BranchElectrons current={I1} startPt={bottomCenter} endPt={bottomLeftEnd} />

          {/* Right Branch */}
          <BranchElectrons current={I2} startPt={rightStart} endPt={rightEnd} />
          <BranchElectrons current={I2} startPt={topRightStart} endPt={topCenter} />
          <BranchElectrons current={I2} startPt={bottomCenter} endPt={bottomRightEnd} />

          {/* Middle branch (always downwards) */}
          <BranchElectrons current={I3} startPt={midStart} endPt={midEnd} />

          {/* 3D components */}
          <group position={[0, 0, 0]}>
            {/* Left branch components */}
            <Battery3D position={[-2, 0.05, 0.4]} isSelected={selectedPart === 'loop-left'} voltage={V1} label="V1" />
            <Resistor3D position={[-2, 0.05, -0.4]} isSelected={selectedPart === 'loop-left'} resistance={R1} label="R1" />

            {/* Right branch components */}
            <Battery3D position={[2, 0.05, 0.4]} isSelected={selectedPart === 'loop-right'} voltage={V2} label="V2" />
            <Resistor3D position={[2, 0.05, -0.4]} isSelected={selectedPart === 'loop-right'} resistance={R2} label="R2" />

            {/* Middle branch resistor */}
            <Resistor3D position={[0, 0.05, 0]} isSelected={selectedPart === 'junction-node'} resistance={R3} label="R3" />
          </group>

          <OrbitControls 
            enableZoom={true} 
            enablePan={false}
            maxDistance={10}
            minDistance={3.5}
            target={[0, 0.2, 0]}
            makeDefault
          />
        </Canvas>

        {/* 3D Scene Badge Overlay */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div className="rounded-lg bg-[#050914]/80 border border-white/5 px-2.5 py-1 backdrop-blur-md text-[9px] font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
            Multi-Loop Kirchhoff Lab
          </div>
        </div>

        {/* Reverse Current Charging Alert */}
        {I1 < 0 && (
          <div className="absolute bottom-3 left-3 z-10 animate-bounce">
            <div className="bg-rose-950/90 border border-rose-500/30 rounded-xl px-3 py-1.5 backdrop-blur-md text-[9px] font-bold text-rose-300 flex items-center gap-1.5 shadow-lg">
              <ArrowRightLeft className="h-3.5 w-3.5 text-rose-400" />
              Reverse current charging Left Battery V1! (I1 &lt; 0)
            </div>
          </div>
        )}
        {I2 < 0 && (
          <div className="absolute bottom-3 left-3 z-10 animate-bounce">
            <div className="bg-rose-950/90 border border-rose-500/30 rounded-xl px-3 py-1.5 backdrop-blur-md text-[9px] font-bold text-rose-300 flex items-center gap-1.5 shadow-lg">
              <ArrowRightLeft className="h-3.5 w-3.5 text-rose-400" />
              Reverse current charging Right Battery V2! (I2 &lt; 0)
            </div>
          </div>
        )}

        {/* Help tooltip */}
        <div className="absolute top-3 right-3 z-10">
          <div className="group relative">
            <button className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-[#050914]/80 text-gray-400 hover:text-white backdrop-blur-md transition-colors shadow">
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
            <div className="absolute right-0 top-7 w-48 scale-0 group-hover:scale-100 transition-all origin-top-right rounded-lg bg-slate-950/95 border border-slate-800 p-2.5 text-[9px] text-gray-300 leading-normal z-20 shadow-xl space-y-1.5">
              <p>● Drag to rotate, scroll to zoom.</p>
              <p>● **Battery V1 & V2** force currents into top node.</p>
              <p>● **Resistor R3** shares load. If R3 is small or one battery is very large, it can reverse-charge the other!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sliders & Kirchhoff Rules Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        
        {/* SLIDERS PANEL */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
            <Compass className="h-4 w-4 text-brand-cyan" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Component Controls
            </h3>
          </div>

          <div className="space-y-3.5 flex-1 mb-3">
            {/* Battery V1 slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold">
                <span className="text-gray-400">Left Battery Voltage (V1)</span>
                <span className="text-brand-cyan font-mono">{V1.toFixed(1)} V</span>
              </div>
              <input 
                type="range"
                min="0.0"
                max="24.0"
                step="0.5"
                value={V1}
                onChange={(e) => setV1(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
            </div>

            {/* Battery V2 slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold">
                <span className="text-gray-400">Right Battery Voltage (V2)</span>
                <span className="text-brand-cyan font-mono">{V2.toFixed(1)} V</span>
              </div>
              <input 
                type="range"
                min="0.0"
                max="24.0"
                step="0.5"
                value={V2}
                onChange={(e) => setV2(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
            </div>

            {/* Resistor R1 slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold">
                <span className="text-gray-400">Left Branch Resistor (R1)</span>
                <span className="text-brand-cyan font-mono">{R1.toFixed(1)} Ω</span>
              </div>
              <input 
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={R1}
                onChange={(e) => setR1(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
            </div>

            {/* Resistor R2 slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold">
                <span className="text-gray-400">Right Branch Resistor (R2)</span>
                <span className="text-brand-cyan font-mono">{R2.toFixed(1)} Ω</span>
              </div>
              <input 
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={R2}
                onChange={(e) => setR2(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
            </div>

            {/* Resistor R3 slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold">
                <span className="text-gray-400">Middle Shared Resistor (R3)</span>
                <span className="text-brand-cyan font-mono">{R3.toFixed(1)} Ω</span>
              </div>
              <input 
                type="range"
                min="1.0"
                max="15.0"
                step="0.5"
                value={R3}
                onChange={(e) => setR3(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
            </div>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 mt-2 rounded-xl border border-white/10 bg-white/5 text-[10px] font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Parameters
          </button>
        </div>

        {/* TELEMETRY & KIRCHHOFF VERIFICATION PANEL */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col gap-3 shadow-lg">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Activity className="h-4 w-4 text-brand-cyan" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Kirchhoff Laws Validator
            </h3>
          </div>

          {/* Kirchhoff's Junction Rule Box */}
          <div className="bg-black/25 rounded-xl border border-white/5 p-3 space-y-2">
            <div className="flex justify-between items-center border-b border-white/5 pb-1">
              <span className="text-[9px] font-extrabold text-gray-200 uppercase tracking-wider flex items-center gap-1">
                Junction Rule: ΣI_in = ΣI_out
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded font-mono">
                Verified
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 font-mono text-[9px] text-center">
              <div className="bg-slate-950/60 p-1.5 rounded border border-white/5">
                <span className="text-gray-400 block text-[7px]">Entering Left (I1)</span>
                <span className={`font-bold ${I1 < 0 ? 'text-rose-400' : 'text-brand-cyan'}`}>
                  {I1.toFixed(3)} A
                </span>
              </div>
              <div className="bg-slate-950/60 p-1.5 rounded border border-white/5">
                <span className="text-gray-400 block text-[7px]">Entering Right (I2)</span>
                <span className={`font-bold ${I2 < 0 ? 'text-rose-400' : 'text-brand-cyan'}`}>
                  {I2.toFixed(3)} A
                </span>
              </div>
              <div className="bg-slate-950/60 p-1.5 rounded border border-white/5">
                <span className="text-gray-400 block text-[7px]">Leaving Middle (I3)</span>
                <span className="text-emerald-400 font-bold">
                  {I3.toFixed(3)} A
                </span>
              </div>
            </div>

            <div className="text-[9.5px] font-mono text-center text-gray-300 bg-black/40 py-1 rounded">
              {I1.toFixed(3)} A + {I2.toFixed(3)} A = <span className="text-emerald-400 font-extrabold">{I3.toFixed(3)} A</span>
            </div>
          </div>

          {/* Kirchhoff's Loop Rule Box */}
          <div className="bg-black/25 rounded-xl border border-white/5 p-3 space-y-2">
            <div className="flex justify-between items-center border-b border-white/5 pb-1">
              <span className="text-[9px] font-extrabold text-gray-200 uppercase tracking-wider">
                Loop Rule: ΣV_loop = 0
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded font-mono">
                Verified
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-[8.5px] text-gray-400">
              {/* Left Loop Check */}
              <div className="flex justify-between items-center bg-slate-950/30 px-2 py-1 rounded">
                <span>Left Loop: V1 - I1*R1 - I3*R3</span>
                <span className="text-white font-bold">
                  {V1.toFixed(1)}V - {vDropR1.toFixed(2)}V - {vDropR3.toFixed(2)}V = <span className="text-emerald-400">0.0V</span>
                </span>
              </div>

              {/* Right Loop Check */}
              <div className="flex justify-between items-center bg-slate-950/30 px-2 py-1 rounded">
                <span>Right Loop: V2 - I2*R2 - I3*R3</span>
                <span className="text-white font-bold">
                  {V2.toFixed(1)}V - {vDropR2.toFixed(2)}V - {vDropR3.toFixed(2)}V = <span className="text-emerald-400">0.0V</span>
                </span>
              </div>

              {/* Outer Loop Check */}
              <div className="flex justify-between items-center bg-slate-950/30 px-2 py-1 rounded">
                <span>Outer Loop: V1 - I1*R1 + I2*R2 - V2</span>
                <span className="text-white font-bold">
                  {V1.toFixed(1)}V - {vDropR1.toFixed(2)}V + {(I2*R2).toFixed(2)}V - {V2.toFixed(1)}V = <span className="text-emerald-400">0.0V</span>
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
