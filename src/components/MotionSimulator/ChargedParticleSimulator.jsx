import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  HelpCircle, 
  Sparkles, 
  Compass, 
  Sliders,
  Eye,
  Info
} from 'lucide-react';

// --- PARTICLE TRAJECTORY INTEGRATOR ---
function PhysicsParticle({
  charge,
  initSpeed,
  initAngle, // degrees in XZ plane
  bFieldStrength,
  eFieldStrength,
  mass,
  isRunning,
  trailLimit = 200,
  onUpdateTelemetry
}) {
  const meshRef = useRef();
  const trailRef = useRef([]);
  const velRef = useRef(new THREE.Vector3());
  const posRef = useRef(new THREE.Vector3());
  const lineGeometryRef = useRef();

  // Reset particle state when parameters change
  useEffect(() => {
    const angleRad = (initAngle * Math.PI) / 180;
    velRef.current.set(Math.cos(angleRad) * initSpeed, 0, Math.sin(angleRad) * initSpeed);
    posRef.current.set(0, 0.1, 0); // start at origin, slightly above board
    trailRef.current = [];
    if (meshRef.current) {
      meshRef.current.position.copy(posRef.current);
    }
  }, [charge, initSpeed, initAngle, bFieldStrength, eFieldStrength, mass]);

  useFrame((state, delta) => {
    if (!isRunning) return;

    // Cap delta to prevent huge jumps when tab loses focus
    const dt = Math.min(delta, 0.03); 

    // Current state
    const p = posRef.current;
    const v = velRef.current;

    // Field vectors
    // B-field points straight up along Y-axis: (0, B_y, 0)
    // E-field points along X-axis: (E_x, 0, 0)
    const B = new THREE.Vector3(0, bFieldStrength, 0);
    const E = new THREE.Vector3(eFieldStrength, 0, 0);

    // Calculate forces: F = q * (E + v x B)
    // 1. Electric Force: Fe = q * E
    const Fe = E.clone().multiplyScalar(charge);

    // 2. Magnetic Force: Fm = q * (v x B)
    const vCrossB = new THREE.Vector3().crossVectors(v, B);
    const Fm = vCrossB.multiplyScalar(charge);

    // 3. Total Force: F = Fe + Fm
    const F = new THREE.Vector3().addVectors(Fe, Fm);

    // Acceleration: a = F / m
    const a = F.clone().divideScalar(mass);

    // Update velocity and position (Euler-Cromer)
    v.addScaledVector(a, dt);
    p.addScaledVector(v, dt);

    // Reset particle if it flies too far out of bounds
    const distFromOrigin = p.length();
    if (distFromOrigin > 4.5) {
      p.set(0, 0.1, 0);
      const angleRad = (initAngle * Math.PI) / 180;
      v.set(Math.cos(angleRad) * initSpeed, 0, Math.sin(angleRad) * initSpeed);
      trailRef.current = [];
    }

    // Update trail
    trailRef.current.push(p.clone());
    if (trailRef.current.length > trailLimit) {
      trailRef.current.shift();
    }

    // Apply to mesh
    if (meshRef.current) {
      meshRef.current.position.copy(p);
    }

    // Redraw trail line
    if (lineGeometryRef.current) {
      lineGeometryRef.current.setFromPoints(trailRef.current);
    }

    // Send telemetry back to React UI
    if (onUpdateTelemetry) {
      onUpdateTelemetry({
        posX: p.x,
        posZ: p.z,
        velX: v.x,
        velZ: v.z,
        feX: Fe.x,
        feZ: Fe.z,
        fmX: Fm.x,
        fmZ: Fm.z,
        fTotalX: F.x,
        fTotalZ: F.z
      });
    }
  });

  // Color based on charge
  const particleColor = charge > 0 ? "#ef4444" : charge < 0 ? "#22d3ee" : "#94a3b8";
  const glowIntensity = Math.abs(charge) > 0 ? 0.8 : 0;

  return (
    <group>
      {/* Particle Mesh */}
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color={particleColor} 
          emissive={particleColor} 
          emissiveIntensity={glowIntensity}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* Trajectory Trail */}
      <line castShadow>
        <bufferGeometry ref={lineGeometryRef} />
        <lineBasicMaterial color={particleColor} linewidth={2} transparent opacity={0.6} />
      </line>
    </group>
  );
}

// --- STATIC FIELD VISUALIZATIONS ---
function MagneticFieldLines({ bFieldStrength, visible }) {
  if (!visible || Math.abs(bFieldStrength) < 0.1) return null;

  const lines = [];
  const spacing = 1.2;
  const size = 3;

  for (let x = -size; x <= size; x += spacing) {
    for (let z = -size; z <= size; z += spacing) {
      // Don't draw exactly at origin to avoid clutter
      if (Math.abs(x) < 0.1 && Math.abs(z) < 0.1) continue;
      lines.push([x, z]);
    }
  }

  const color = bFieldStrength > 0 ? "#06b6d4" : "#ec4899";

  return (
    <group>
      {lines.map(([x, z], idx) => (
        <group position={[x, 0, z]} key={idx}>
          {/* Vertical field line cylinder */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 1.0, 4]} />
            <meshBasicMaterial color={color} transparent opacity={0.25} />
          </mesh>
          {/* Arrow cone representing direction */}
          <mesh 
            position={[0, bFieldStrength > 0 ? 0.8 : 0.2, 0]} 
            rotation={[bFieldStrength > 0 ? 0 : Math.PI, 0, 0]}
          >
            <coneGeometry args={[0.04, 0.12, 6]} />
            <meshBasicMaterial color={color} transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ElectricFieldLines({ eFieldStrength, visible }) {
  if (!visible || Math.abs(eFieldStrength) < 0.1) return null;

  const rows = [-2.0, -1.0, 0, 1.0, 2.0];
  const color = eFieldStrength > 0 ? "#a855f7" : "#eab308";

  return (
    <group position={[0, 0.02, 0]}>
      {rows.map((z, idx) => (
        <group position={[0, 0, z]} key={idx}>
          {/* Horizontal lines */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.006, 0.006, 6.0, 4]} />
            <meshBasicMaterial color={color} transparent opacity={0.2} />
          </mesh>
          {/* Arrow markers pointing left or right */}
          {[-2, 0, 2].map((x, aIdx) => (
            <mesh 
              key={aIdx}
              position={[x + (eFieldStrength > 0 ? 0.3 : -0.3), 0, 0]} 
              rotation={[0, 0, eFieldStrength > 0 ? -Math.PI / 2 : Math.PI / 2]}
            >
              <coneGeometry args={[0.03, 0.1, 6]} />
              <meshBasicMaterial color={color} transparent opacity={0.4} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// Vector force arrows
function VectorArrows({ telemetry, visible }) {
  if (!visible) return null;

  const { posX, posZ, velX, velZ, feX, feZ, fmX, fmZ, fTotalX, fTotalZ } = telemetry;
  
  // Origins
  const p = new THREE.Vector3(posX, 0.15, posZ);

  // Scaled vectors for presentation
  const vScale = 0.25;
  const fScale = 0.15;

  const vVec = new THREE.Vector3(velX * vScale, 0, velZ * vScale);
  const feVec = new THREE.Vector3(feX * fScale, 0, feZ * fScale);
  const fmVec = new THREE.Vector3(fmX * fScale, 0, fmZ * fScale);
  const fTotalVec = new THREE.Vector3(fTotalX * fScale, 0, fTotalZ * fScale);

  return (
    <group>
      {/* Velocity Arrow (Green) */}
      {vVec.length() > 0.05 && (
        <primitive 
          object={new THREE.ArrowHelper(vVec.clone().normalize(), p, vVec.length(), "#22c55e", 0.15, 0.08)} 
        />
      )}

      {/* Electric Force Arrow (Purple) */}
      {feVec.length() > 0.05 && (
        <primitive 
          object={new THREE.ArrowHelper(feVec.clone().normalize(), p, feVec.length(), "#a855f7", 0.15, 0.08)} 
        />
      )}

      {/* Magnetic Force Arrow (Orange) */}
      {fmVec.length() > 0.05 && (
        <primitive 
          object={new THREE.ArrowHelper(fmVec.clone().normalize(), p, fmVec.length(), "#f97316", 0.15, 0.08)} 
        />
      )}

      {/* Net Lorentz Force Arrow (Red) */}
      {fTotalVec.length() > 0.05 && (
        <primitive 
          object={new THREE.ArrowHelper(fTotalVec.clone().normalize(), p, fTotalVec.length(), "#ef4444", 0.18, 0.1)} 
        />
      )}
    </group>
  );
}

// Lab Sandbox Board
function LabBoard() {
  return (
    <group position={[0, -0.05, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[7.0, 0.1, 7.0]} />
        <meshStandardMaterial color="#080c16" roughness={0.8} />
      </mesh>
      <gridHelper args={[7, 7, '#1e293b', '#0f172a']} position={[0, 0.051, 0]} />
      
      {/* Visual outer bounding boundary ring */}
      <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.45, 4.5, 64]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// --- MAIN SIMULATOR EXPORT ---
export default function ChargedParticleSimulator({ selectedPart, onSelectPart, hoveredPart, onHoverPart }) {
  const [isRunning, setIsRunning] = useState(true);
  
  // Simulation Controls
  const [charge, setCharge] = useState(1.0); // Coulombs
  const [initSpeed, setInitSpeed] = useState(4.0); // m/s
  const [initAngle, setInitAngle] = useState(0.0); // Degrees
  const [bFieldStrength, setBFieldStrength] = useState(1.5); // Tesla
  const [eFieldStrength, setEFieldStrength] = useState(0.0); // N/C (along X)
  const [mass, setMass] = useState(1.0); // kg

  // View state
  const [showVectors, setShowVectors] = useState(true);
  const [showBField, setShowBField] = useState(true);
  const [showEField, setShowEField] = useState(true);

  // Telemetry updated from 3D animation loop
  const [telemetry, setTelemetry] = useState({
    posX: 0,
    posZ: 0,
    velX: 0,
    velZ: 0,
    feX: 0,
    feZ: 0,
    fmX: 0,
    fmZ: 0,
    fTotalX: 0,
    fTotalZ: 0
  });

  const handleReset = () => {
    setCharge(1.0);
    setInitSpeed(4.0);
    setInitAngle(0.0);
    setBFieldStrength(1.5);
    setEFieldStrength(0.0);
    setMass(1.0);
    setIsRunning(true);
  };

  // Calculate speed and forces magnitudes for telemetry panel
  const currentSpeed = Math.sqrt(telemetry.velX ** 2 + telemetry.velZ ** 2);
  const fmMag = Math.sqrt(telemetry.fmX ** 2 + telemetry.fmZ ** 2);
  const feMag = Math.sqrt(telemetry.feX ** 2 + telemetry.feZ ** 2);
  const fTotalMag = Math.sqrt(telemetry.fTotalX ** 2 + telemetry.fTotalZ ** 2);

  // Highlight selectors matching lesson outline parts
  const isPartSelected = (partId) => selectedPart === partId;

  return (
    <div className="w-full flex flex-col gap-4">
      
      {/* 3D Viewport */}
      <div className="relative w-full rounded-2xl border border-white/10 bg-[#02030a] overflow-hidden h-[320px] shadow-xl">
        <Canvas
          camera={{ position: [0, 6.0, 0.01], fov: 55 }} // orthographic-like top-down default but perspective
          shadows
          className="h-full w-full"
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[0, 10, 0]} intensity={1.5} castShadow />

          <LabBoard />

          {/* Fields */}
          <MagneticFieldLines bFieldStrength={bFieldStrength} visible={showBField} />
          <ElectricFieldLines eFieldStrength={eFieldStrength} visible={showEField} />

          {/* Vectors */}
          <VectorArrows telemetry={telemetry} visible={showVectors} />

          {/* Physics Particle */}
          <PhysicsParticle 
            charge={charge}
            initSpeed={initSpeed}
            initAngle={initAngle}
            bFieldStrength={bFieldStrength}
            eFieldStrength={eFieldStrength}
            mass={mass}
            isRunning={isRunning}
            onUpdateTelemetry={setTelemetry}
          />

          <OrbitControls 
            enableZoom={true} 
            enablePan={false}
            maxDistance={12}
            minDistance={3.5}
            target={[0, 0, 0]}
            makeDefault
          />
        </Canvas>

        {/* 3D Scene Badge Overlay */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div className="rounded-lg bg-[#050914]/85 border border-white/5 px-2.5 py-1 backdrop-blur-md text-[9px] font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5 shadow-md">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
            Electromagnetic Field Chamber
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

        {/* Visibility Toggle Overlay */}
        <div className="absolute bottom-3 left-3 z-10 flex gap-1.5">
          <button
            onClick={() => setShowBField(!showBField)}
            className={`px-2 py-1 rounded-lg border text-[8px] font-bold backdrop-blur-md transition-all ${
              showBField ? 'bg-cyan-950/80 border-cyan-500/30 text-cyan-300' : 'bg-slate-900/60 border-white/5 text-gray-500'
            }`}
          >
            B-Lines
          </button>
          <button
            onClick={() => setShowEField(!showEField)}
            className={`px-2 py-1 rounded-lg border text-[8px] font-bold backdrop-blur-md transition-all ${
              showEField ? 'bg-purple-950/80 border-purple-500/30 text-purple-300' : 'bg-slate-900/60 border-white/5 text-gray-500'
            }`}
          >
            E-Lines
          </button>
          <button
            onClick={() => setShowVectors(!showVectors)}
            className={`px-2 py-1 rounded-lg border text-[8px] font-bold backdrop-blur-md transition-all ${
              showVectors ? 'bg-green-950/80 border-green-500/30 text-green-300' : 'bg-slate-900/60 border-white/5 text-gray-500'
            }`}
          >
            Vectors
          </button>
        </div>
      </div>

      {/* Control sliders & Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        
        {/* SLIDERS & CONFIG PANEL */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
            <Sliders className="h-4 w-4 text-brand-cyan" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Simulation Parameters
            </h3>
          </div>

          <div className="space-y-3 flex-1 mb-2">
            {/* Charge q slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold">
                <span className="text-gray-400">Particle Charge (q)</span>
                <span className={`font-mono ${charge > 0 ? 'text-rose-400' : charge < 0 ? 'text-cyan-400' : 'text-gray-400'}`}>
                  {charge > 0 ? `+${charge.toFixed(1)}` : charge.toFixed(1)} C
                </span>
              </div>
              <input 
                type="range"
                min="-3.0"
                max="3.0"
                step="0.5"
                value={charge}
                onChange={(e) => setCharge(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
            </div>

            {/* Mass slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold">
                <span className="text-gray-400">Particle Mass (m)</span>
                <span className="text-brand-cyan font-mono">{mass.toFixed(1)} kg</span>
              </div>
              <input 
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={mass}
                onChange={(e) => setMass(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
            </div>

            {/* Initial Speed slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold">
                <span className="text-gray-400">Initial Velocity Magnitude (v_0)</span>
                <span className="text-brand-cyan font-mono">{initSpeed.toFixed(1)} m/s</span>
              </div>
              <input 
                type="range"
                min="1.0"
                max="8.0"
                step="0.5"
                value={initSpeed}
                onChange={(e) => setInitSpeed(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
            </div>

            {/* Initial Angle slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold">
                <span className="text-gray-400">Launch Angle</span>
                <span className="text-brand-cyan font-mono">{initAngle.toFixed(0)}°</span>
              </div>
              <input 
                type="range"
                min="0"
                max="360"
                step="15"
                value={initAngle}
                onChange={(e) => setInitAngle(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
            </div>

            {/* B Field Strength slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold">
                <span className="text-gray-400">Magnetic Field Strength (B_y)</span>
                <span className="text-brand-cyan font-mono">{bFieldStrength.toFixed(2)} Tesla</span>
              </div>
              <input 
                type="range"
                min="-3.0"
                max="3.0"
                step="0.25"
                value={bFieldStrength}
                onChange={(e) => setBFieldStrength(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
            </div>

            {/* E Field Strength slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold">
                <span className="text-gray-400">Electric Field Strength (E_x)</span>
                <span className="text-brand-cyan font-mono">{eFieldStrength.toFixed(1)} N/C</span>
              </div>
              <input 
                type="range"
                min="-5.0"
                max="5.0"
                step="0.5"
                value={eFieldStrength}
                onChange={(e) => setEFieldStrength(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
            </div>
          </div>
        </div>

        {/* TELEMETRY & VECTOR BREAKDOWNS */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col gap-3 shadow-lg justify-between">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Activity className="h-4 w-4 text-brand-cyan" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Lorentz Dynamics Telemetry
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
            {/* Position Box */}
            <div className="bg-slate-950/60 p-2 rounded border border-white/5">
              <span className="text-gray-400 block text-[7px] uppercase tracking-wider">Position Vector (r)</span>
              <span className="text-white">
                X: {telemetry.posX.toFixed(2)} m<br />
                Z: {telemetry.posZ.toFixed(2)} m
              </span>
            </div>

            {/* Velocity Box */}
            <div className="bg-slate-950/60 p-2 rounded border border-white/5">
              <span className="text-gray-400 block text-[7px] uppercase tracking-wider">Velocity Vector (v)</span>
              <span className="text-white">
                Vx: {telemetry.velX.toFixed(2)} m/s<br />
                Vz: {telemetry.velZ.toFixed(2)} m/s<br />
                <span className="text-green-400 text-[8px] font-bold">Speed: {currentSpeed.toFixed(2)} m/s</span>
              </span>
            </div>

            {/* Electric Force Box */}
            <div className={`p-2 rounded border transition-all ${
              isPartSelected('lorentz-efield') ? 'bg-purple-950/40 border-purple-500/40' : 'bg-slate-950/60 border-white/5'
            }`}>
              <span className="text-purple-400 block text-[7px] uppercase tracking-wider font-extrabold">Electric Force (qE)</span>
              <span className="text-white">
                Fx: {telemetry.feX.toFixed(2)} N<br />
                Fz: {telemetry.feZ.toFixed(2)} N<br />
                <span className="text-purple-300 text-[8px] font-bold">Mag: {feMag.toFixed(2)} N</span>
              </span>
            </div>

            {/* Magnetic Force Box */}
            <div className={`p-2 rounded border transition-all ${
              isPartSelected('lorentz-bfield') ? 'bg-orange-950/40 border-orange-500/40' : 'bg-slate-950/60 border-white/5'
            }`}>
              <span className="text-orange-400 block text-[7px] uppercase tracking-wider font-extrabold">Magnetic Force (qv×B)</span>
              <span className="text-white">
                Fx: {telemetry.fmX.toFixed(2)} N<br />
                Fz: {telemetry.fmZ.toFixed(2)} N<br />
                <span className="text-orange-300 text-[8px] font-bold">Mag: {fmMag.toFixed(2)} N</span>
              </span>
            </div>
          </div>

          {/* Lorentz Equation Summary */}
          <div className="bg-slate-950/80 rounded-xl border border-white/5 p-3 space-y-1.5">
            <div className="flex justify-between items-center text-[9px] font-extrabold text-gray-300 uppercase tracking-wider">
              <span>Lorentz Formula Verification</span>
              <span className="text-brand-cyan text-[8px] font-mono">F = Fe + Fm</span>
            </div>
            <div className="text-[10px] font-mono text-center text-white bg-black/40 py-1.5 rounded border border-white/5">
              Fe ({feMag.toFixed(2)} N) + Fm ({fmMag.toFixed(2)} N) = <span className="text-red-400 font-black">{fTotalMag.toFixed(2)} N</span>
            </div>
            
            {/* R3F Vector Legends */}
            <div className="flex justify-around items-center pt-1 text-[7.5px] font-bold text-gray-400">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]"></span>Velocity</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#a855f7]"></span>Fe</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#f97316]"></span>Fm</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]"></span>Net Force</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
