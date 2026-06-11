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
  ToggleLeft,
  ToggleRight,
  Lightbulb,
  Cpu
} from 'lucide-react';

// --- ELECTRON FLOW PARTICLES ---
function ElectronFlow({ current, switchClosed }) {
  const particlesCount = 20;
  const particles = useRef([]);

  // Wire corner points forming a square circuit
  // Corner 0: (-2, 0, -2) -> Corner 1: (2, 0, -2) -> Corner 2: (2, 0, 2) -> Corner 3: (-2, 0, 2) -> Corner 0
  const path = [
    new THREE.Vector3(-2, 0.05, -2),
    new THREE.Vector3(2, 0.05, -2),
    new THREE.Vector3(2, 0.05, 2),
    new THREE.Vector3(-2, 0.05, 2)
  ];

  // Calculate length of each segment
  const segmentLength = 4.0;
  const totalPathLength = segmentLength * 4;

  // Initialize particle offsets
  if (particles.current.length === 0) {
    for (let i = 0; i < particlesCount; i++) {
      particles.current.push({
        progress: (i / particlesCount) * totalPathLength,
        meshRef: React.createRef()
      });
    }
  }

  useFrame((state, delta) => {
    if (!switchClosed || current <= 0.01) return;

    // Speed of electrons scales with current
    const speed = current * 2.0; 

    particles.current.forEach(pt => {
      pt.progress = (pt.progress + speed * delta) % totalPathLength;
      
      // Map progress to 3D position along loop
      let segment = Math.floor(pt.progress / segmentLength);
      let t = (pt.progress % segmentLength) / segmentLength;
      
      let start = path[segment];
      let end = path[(segment + 1) % 4];

      if (pt.meshRef.current) {
        pt.meshRef.current.position.lerpVectors(start, end, t);
      }
    });
  });

  return (
    <group>
      {particles.current.map((pt, idx) => (
        <mesh ref={pt.meshRef} key={idx}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#38bdf8" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// --- 3D COMPONENT MESHES ---

// 1. DC Battery Mesh
function Battery3D({ isSelected }) {
  return (
    <group position={[-2, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
      {/* Battery body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.22, 0.22, 1.2, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* Positive terminal cap */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Positive Ring Marker */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.23, 0.23, 0.1, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      {/* Glow selection */}
      {isSelected && (
        <mesh>
          <cylinderGeometry args={[0.26, 0.26, 1.4, 16]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} wireframe />
        </mesh>
      )}
    </group>
  );
}

// 2. Resistor Mesh
function Resistor3D({ isSelected, resistance }) {
  return (
    <group position={[2, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
      {/* Ceramic body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.16, 0.16, 1.0, 16]} />
        <meshStandardMaterial color="#d97706" roughness={0.8} />
      </mesh>

      {/* Wire leads */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </mesh>
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </mesh>

      {/* Color bands based on resistance */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.08, 16]} />
        <meshStandardMaterial color={resistance > 50 ? "#4f46e5" : "#b91c1c"} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.08, 16]} />
        <meshStandardMaterial color={resistance > 20 ? "#15803d" : "#7c2d12"} />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.08, 16]} />
        <meshStandardMaterial color="#d97706" />
      </mesh>

      {/* Glow selection */}
      {isSelected && (
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 1.4, 16]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} wireframe />
        </mesh>
      )}
    </group>
  );
}

// 3. Bulb Mesh
function Bulb3D({ isSelected, current, switchClosed }) {
  // Glow brightness scales with power
  const brightness = switchClosed ? Math.min(2.5, current * 0.8) : 0;

  return (
    <group position={[0, 0.05, 2]}>
      {/* Metal Socket base */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.25, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Glass Bulb Globe */}
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={brightness > 0 ? "#fef08a" : "#cbd5e1"} 
          emissive="#eab308" 
          emissiveIntensity={brightness}
          transparent
          opacity={0.7}
          roughness={0.1}
        />
      </mesh>

      {/* Dynamic Light source inside R3F */}
      {brightness > 0.05 && (
        <pointLight color="#fef08a" intensity={brightness * 2.0} distance={5} />
      )}

      {/* Selection Glow */}
      {isSelected && (
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.65, 0.8, 0.65]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} wireframe />
        </mesh>
      )}
    </group>
  );
}

// 4. Switch Mesh
function Switch3D({ isSelected, isOpen, onClick }) {
  // Lever rotation
  const leverAngle = isOpen ? -Math.PI / 4 : 0;

  return (
    <group position={[0, 0.05, -2]} onClick={onClick}>
      {/* Plastic base */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.1, 0.3]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      {/* Support posts */}
      <mesh position={[-0.2, 0.15, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>
      <mesh position={[0.2, 0.15, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>

      {/* Metal Lever pivot */}
      <group position={[-0.2, 0.2, 0]} rotation={[0, 0, leverAngle]}>
        <mesh position={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.42, 0.04, 0.08]} />
          <meshStandardMaterial color="#eab308" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Selection Glow */}
      {isSelected && (
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.7, 0.4, 0.4]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} wireframe />
        </mesh>
      )}
    </group>
  );
}

// Connecting circuit wires
function CircuitWires() {
  const wireMaterial = new THREE.MeshStandardMaterial({ 
    color: "#334155", 
    roughness: 0.6, 
    metalness: 0.8 
  });

  return (
    <group position={[0, 0.03, 0]}>
      {/* Top wire */}
      <mesh position={[0, 0, -2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 4.0, 8]} />
        <mesh ref={el => el && (el.material = wireMaterial)} />
      </mesh>
      {/* Bottom wire */}
      <mesh position={[0, 0, 2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 4.0, 8]} />
        <mesh ref={el => el && (el.material = wireMaterial)} />
      </mesh>
      {/* Left wire */}
      <mesh position={[-2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 4.0, 8]} />
        <mesh ref={el => el && (el.material = wireMaterial)} />
      </mesh>
      {/* Right wire */}
      <mesh position={[2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 4.0, 8]} />
        <mesh ref={el => el && (el.material = wireMaterial)} />
      </mesh>
    </group>
  );
}

// Circuit board platform
function CircuitBoard() {
  return (
    <group position={[0, -0.05, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[6.0, 0.1, 6.0]} />
        <meshStandardMaterial color="#0b1329" roughness={0.7} />
      </mesh>
      <gridHelper args={[6, 6, '#1e293b', '#0f172a']} position={[0, 0.051, 0]} />
    </group>
  );
}

// --- MAIN SIMULATOR COMPONENT ---
export default function CircuitSimulator({ selectedPart, onSelectPart, hoveredPart, onHoverPart }) {
  // Controls state
  const [voltage, setVoltage] = useState(9.0); // Volts
  const [resistance, setResistance] = useState(20.0); // Ohms
  const [switchClosed, setSwitchClosed] = useState(true);

  // Constants
  const bulbResistance = 10.0; // Ohms (fixed)

  // Calculations
  const totalResistance = switchClosed ? (resistance + bulbResistance) : Infinity;
  const current = switchClosed ? (voltage / totalResistance) : 0.0;
  
  // Voltages drops
  const resistorVoltDrop = current * resistance;
  const bulbVoltDrop = current * bulbResistance;

  const handleReset = () => {
    setVoltage(9.0);
    setResistance(20.0);
    setSwitchClosed(true);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 3D Lab Canvas Box */}
      <div className="relative w-full rounded-2xl border border-white/10 bg-[#02030a] overflow-hidden h-[300px] shadow-xl">
        <Canvas
          camera={{ position: [0, 4.5, 5], fov: 45 }}
          shadows
          className="h-full w-full"
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
          <pointLight position={[-4, 5, -2]} intensity={0.5} />

          <CircuitBoard />
          <CircuitWires />

          {/* Electron flows */}
          <ElectronFlow current={current} switchClosed={switchClosed} />

          {/* Interactive components */}
          <group>
            {/* Battery */}
            <Battery3D isSelected={selectedPart === 'DC Battery'} />
            
            {/* Resistor */}
            <Resistor3D isSelected={selectedPart === 'Resistor'} resistance={resistance} />

            {/* Bulb */}
            <Bulb3D 
              isSelected={selectedPart === 'Light Bulb'} 
              current={current} 
              switchClosed={switchClosed} 
            />

            {/* Switch */}
            <Switch3D 
              isSelected={selectedPart === 'Circuit Switch'} 
              isOpen={!switchClosed}
              onClick={() => setSwitchClosed(!switchClosed)}
            />
          </group>

          <OrbitControls 
            enableZoom={true} 
            enablePan={false}
            maxDistance={10}
            minDistance={3}
            target={[0, 0.2, 0]}
            makeDefault
          />
        </Canvas>

        {/* 3D Scene Badge Overlay */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div className="rounded-lg bg-[#050914]/80 border border-white/5 px-2.5 py-1 backdrop-blur-md text-[9px] font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
            Ohm's Law Circuit board
          </div>
        </div>

        {/* Toggle overlay hint */}
        <div className="absolute bottom-3 left-3 z-10">
          <button
            onClick={() => setSwitchClosed(!switchClosed)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-[#050914]/80 text-[10px] font-bold text-white backdrop-blur-md hover:bg-white/10 transition-colors shadow-lg"
          >
            {switchClosed ? <ToggleRight className="h-4 w-4 text-emerald-400" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
            {switchClosed ? 'CLOSE SWITCH' : 'OPEN SWITCH'}
          </button>
        </div>

        {/* Help tooltip */}
        <div className="absolute top-3 right-3 z-10">
          <div className="group relative">
            <button className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-[#050914]/80 text-gray-400 hover:text-white backdrop-blur-md transition-colors shadow">
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
            <div className="absolute right-0 top-7 w-48 scale-0 group-hover:scale-100 transition-all origin-top-right rounded-lg bg-slate-950/95 border border-slate-800 p-2.5 text-[9px] text-gray-300 leading-normal z-20 shadow-xl space-y-1.5">
              <p>● Drag to rotate board, scroll to zoom.</p>
              <p>● Click components on board or choose structures checklist to highlight details.</p>
              <p>● Click Switch directly to open or close path.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls & Live Telemetry Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        
        {/* CONTROLS PANEL */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
            <Cpu className="h-4 w-4 text-brand-cyan" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Circuit Variables
            </h3>
          </div>

          <div className="space-y-4 flex-1 mb-4">
            
            {/* Voltage slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-400 font-medium">Battery Voltage (V)</span>
                <span className="text-brand-cyan font-mono">{voltage.toFixed(1)} Volts</span>
              </div>
              <input 
                type="range"
                min="1.5"
                max="24.0"
                step="0.5"
                value={voltage}
                onChange={(e) => setVoltage(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
            </div>

            {/* Resistance slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-400 font-medium">Resistor Resistance (R_res)</span>
                <span className="text-brand-cyan font-mono">{resistance.toFixed(0)} Ω</span>
              </div>
              <input 
                type="range"
                min="1"
                max="100"
                step="1"
                value={resistance}
                onChange={(e) => setResistance(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
            </div>

            {/* Bulb resistance descriptor */}
            <div className="bg-black/20 border border-white/5 px-3 py-2 rounded-xl flex justify-between items-center text-[9px]">
              <div>
                <span className="text-gray-200 font-bold block">Light Bulb Load</span>
                <span className="text-gray-500 block">Fixed load resistance</span>
              </div>
              <span className="text-brand-purple font-mono font-bold">{bulbResistance.toFixed(0)} Ω</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex gap-2.5 mt-2 border-t border-white/5 pt-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Circuit
            </button>
          </div>
        </div>

        {/* TELEMETRY & OHM'S LAW EQUATION PANEL */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col gap-3.5 shadow-lg">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Activity className="h-4 w-4 text-brand-cyan" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Circuit Schematics Telemetry
            </h3>
          </div>

          {/* Equation box */}
          <div className="bg-slate-950/70 border border-brand-cyan/20 rounded-xl p-3 text-center flex flex-col gap-1">
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Ohm's Law Equation</span>
            <div className="text-sm font-extrabold text-white font-mono flex items-center justify-center gap-2">
              <span className="text-brand-cyan">I</span> = <span className="text-brand-purple">V</span> / <span className="text-amber-400">R</span>
            </div>
            <div className="text-[9px] font-mono text-gray-300 mt-1 flex items-center justify-center gap-1">
              <span>{current.toFixed(3)} A</span> = <span>{voltage.toFixed(1)} V</span> / <span>{switchClosed ? totalResistance.toFixed(0) : '∞'} Ω</span>
            </div>
          </div>

          {/* Stats details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/35 rounded-xl border border-white/5 p-2">
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Battery Voltage (V)</span>
              <h4 className="text-xs font-extrabold text-brand-purple mt-0.5 font-mono">
                {voltage.toFixed(1)} V
              </h4>
            </div>

            <div className="bg-black/35 rounded-xl border border-white/5 p-2">
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Circuit Current (I)</span>
              <h4 className="text-xs font-extrabold text-brand-cyan mt-0.5 font-mono">
                {current.toFixed(3)} A
              </h4>
            </div>

            <div className="bg-black/35 rounded-xl border border-white/5 p-2">
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Total Resistance (R)</span>
              <h4 className="text-xs font-extrabold text-amber-400 mt-0.5 font-mono">
                {switchClosed ? `${totalResistance.toFixed(0)} Ω` : 'Open Path (∞)'}
              </h4>
            </div>

            <div className="bg-black/35 rounded-xl border border-white/5 p-2">
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Bulb Brightness Power</span>
              <h4 className="text-xs font-extrabold text-yellow-400 mt-0.5 font-mono">
                {(current * current * bulbResistance).toFixed(1)} W
              </h4>
            </div>
          </div>

          {/* Voltage Division detail */}
          <div className="bg-black/20 rounded-xl border border-white/5 p-3 space-y-1.5 text-[8px] font-mono text-gray-400">
            <h5 className="text-[9px] font-bold text-gray-200 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Lightbulb className="h-3.5 w-3.5 text-yellow-400" /> Voltage Division (Kirchhoff's Loop Rule)
            </h5>
            <div className="flex justify-between">
              <span>Resistor Voltage Drop (V_res):</span>
              <span className="text-white font-bold">{resistorVoltDrop.toFixed(2)} V</span>
            </div>
            <div className="flex justify-between">
              <span>Bulb Voltage Drop (V_bulb):</span>
              <span className="text-white font-bold">{bulbVoltDrop.toFixed(2)} V</span>
            </div>
            <div className="border-t border-white/5 pt-1 flex justify-between text-brand-purple font-bold text-[9px]">
              <span>Sum of Drops (V_total):</span>
              <span>{(resistorVoltDrop + bulbVoltDrop).toFixed(1)} V</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
