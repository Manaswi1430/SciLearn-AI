import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  Compass, 
  HelpCircle, 
  Activity, 
  Zap,
  Gauge,
  Sparkles,
  ArrowRight
} from 'lucide-react';

// --- REAL-TIME CHART COMPONENT ---
function EnergyGraph({ history }) {
  const width = 280;
  const height = 90;
  const padding = 15;

  const pointsCount = history.length;
  
  // Find bounds for scaling
  const keVals = history.map(h => h.ke);
  const wNetVals = history.map(h => h.wNet);
  const allVals = [...keVals, ...wNetVals];
  
  const maxVal = Math.max(...allVals, 10);
  const minVal = Math.min(...allVals, -10);
  const range = maxVal - minVal || 1;

  const getX = (idx) => padding + (idx / Math.max(1, pointsCount - 1)) * (width - 2 * padding);
  const getY = (val) => height - padding - ((val - minVal) / range) * (height - 2 * padding);

  const kePath = useMemo(() => {
    if (pointsCount === 0) return '';
    return history.map((pt, idx) => `${getX(idx)},${getY(pt.ke)}`).join(' L ');
  }, [history, pointsCount, minVal, range]);

  const wNetPath = useMemo(() => {
    if (pointsCount === 0) return '';
    return history.map((pt, idx) => `${getX(idx)},${getY(pt.wNet)}`).join(' L ');
  }, [history, pointsCount, minVal, range]);

  const latestKE = keVals[keVals.length - 1] || 0;
  const latestWNet = wNetVals[wNetVals.length - 1] || 0;

  return (
    <div className="glass-panel p-2.5 rounded-xl border-white/5 bg-[#090d1a]/55 flex flex-col gap-1.5 relative overflow-hidden w-full">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold text-gray-200 uppercase tracking-wider">Energy & Work vs Time</span>
        <div className="flex gap-2.5 text-[8.5px] font-mono">
          <span className="text-brand-cyan">KE: {latestKE.toFixed(1)} J</span>
          <span className="text-brand-purple">W_net: {latestWNet.toFixed(1)} J</span>
        </div>
      </div>
      <div className="w-full h-[90px] relative bg-black/20 rounded-lg overflow-hidden border border-white/5">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* Zero line */}
          {minVal < 0 && maxVal > 0 && (
            <line 
              x1={padding} 
              y1={getY(0)} 
              x2={width - padding} 
              y2={getY(0)} 
              stroke="rgba(255,255,255,0.15)" 
              strokeDasharray="2,2" 
            />
          )}
          
          {/* Grid Lines */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" />

          {/* Plot W_net path */}
          {wNetPath && (
            <path 
              d={`M ${wNetPath}`} 
              fill="none" 
              stroke="#a855f7" 
              strokeWidth="2.5" 
              className="drop-shadow-[0_0_3px_rgba(168,85,247,0.4)]" 
            />
          )}

          {/* Plot KE path (dashed slightly to overlay nicely) */}
          {kePath && (
            <path 
              d={`M ${kePath}`} 
              fill="none" 
              stroke="#06b6d4" 
              strokeWidth="1.5" 
              strokeDasharray="3,2" 
              className="drop-shadow-[0_0_3px_rgba(6,182,212,0.6)]" 
            />
          )}
        </svg>
      </div>
    </div>
  );
}

// --- 3D SCENE SUB-COMPONENTS ---

// 3D Grid environment for scale reference
function SceneEnvironment() {
  return (
    <group position={[0, -0.01, 0]}>
      <gridHelper args={[30, 30, '#1e293b', '#0b132b']} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#04060f" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Inclined plane ramp with dynamically updating support pillar
function Ramp({ angle, length, activePart }) {
  const isSelected = activePart === 'Inclined Ramp';
  const thetaRad = (angle * Math.PI) / 180;
  
  // Pivot points
  const pillarX = length * Math.cos(thetaRad);
  const pillarHeight = length * Math.sin(thetaRad);

  return (
    <group>
      {/* Ramp Board */}
      <group rotation={[0, 0, thetaRad]}>
        <mesh position={[length / 2, -0.05, 0]} receiveShadow castShadow>
          <boxGeometry args={[length, 0.1, 1.8]} />
          <meshStandardMaterial 
            color={isSelected ? "#22d3ee" : "#1e293b"} 
            roughness={0.7} 
            metalness={0.1}
          />
        </mesh>
        
        {/* Selection highlights */}
        {isSelected && (
          <mesh position={[length / 2, 0, 0]}>
            <boxGeometry args={[length + 0.05, 0.12, 1.85]} />
            <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.4} />
          </mesh>
        )}
      </group>

      {/* Dynamic Support Pillar */}
      {pillarHeight > 0.05 && (
        <mesh position={[pillarX - 0.05, pillarHeight / 2 - 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, pillarHeight, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.2} />
        </mesh>
      )}

      {/* Ground stand connector */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <boxGeometry args={[0.4, 0.1, 2.0]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  );
}

// Movable block with size scaling for mass
function SlideBlock({ posAlongRamp, rampAngle, mass, activePart }) {
  const isSelected = activePart === 'Movable Block';
  const thetaRad = (rampAngle * Math.PI) / 180;

  // Block dimensions proportional to mass
  const baseSize = 0.5;
  const massScale = 1.0 + (mass - 1) / 9 * 0.35; // scales from 1.0x to 1.35x size
  const size = baseSize * massScale;

  const bx = posAlongRamp * Math.cos(thetaRad) - (size / 2) * Math.sin(thetaRad);
  const by = posAlongRamp * Math.sin(thetaRad) + (size / 2) * Math.cos(thetaRad);

  return (
    <group position={[bx, by, 0]} rotation={[0, 0, thetaRad]}>
      {/* Glow if selected */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[size + 0.08, size + 0.08, size + 0.08]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} wireframe />
        </mesh>
      )}

      {/* Solid Block */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial 
          color={isSelected ? "#22d3ee" : "#3b82f6"} 
          roughness={0.2} 
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}

// Vector arrows for FBD (Free-Body Diagram)
function ForceVectors({ posAlongRamp, rampAngle, appliedForce, gravityForce, frictionForce, normalForce, activePart }) {
  const isAppliedSelected = activePart === 'Applied Force Vector';
  const isFrictionSelected = activePart === 'Friction Force Vector';
  
  const thetaRad = (rampAngle * Math.PI) / 180;
  const size = 0.5;
  
  // Center coordinate of block
  const bx = posAlongRamp * Math.cos(thetaRad) - (size / 2) * Math.sin(thetaRad);
  const by = posAlongRamp * Math.sin(thetaRad) + (size / 2) * Math.cos(thetaRad);

  // Vector helper
  const renderArrow = (dirAngleRad, magnitude, color, label, isSel) => {
    const minLen = 0.4;
    const maxLen = 2.0;
    const len = minLen + (Math.abs(magnitude) / 50) * (maxLen - minLen);
    if (len < 0.1 || Math.abs(magnitude) < 0.1) return null;

    const arrowAngle = dirAngleRad;

    return (
      <group position={[bx, by, 0]} rotation={[0, 0, arrowAngle]}>
        <mesh position={[len / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, len, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh position={[len, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.09, 0.2, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
        
        <Html position={[len / 2, 0.3, 0.2]} center distanceFactor={10}>
          <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold text-white border whitespace-nowrap shadow-lg backdrop-blur-sm transition-all duration-200 ${
            isSel ? 'bg-slate-900 border-purple-400 scale-105' : 'bg-slate-950/70 border-slate-700'
          }`}>
            {label}: {Math.abs(magnitude).toFixed(1)} N
          </div>
        </Html>
      </group>
    );
  };

  return (
    <group>
      {/* 1. Gravity: straight down (angle = -90 degrees or -Math.PI/2) */}
      {renderArrow(-Math.PI / 2, gravityForce, "#ef4444", "Gravity (F_g)", false)}

      {/* 2. Normal Force: perpendicular to ramp (angle = theta + 90 degrees or theta + Math.PI/2) */}
      {renderArrow(thetaRad + Math.PI / 2, normalForce, "#10b981", "Normal (F_n)", false)}

      {/* 3. Applied Force: along ramp (angle = thetaRad for up, thetaRad + Math.PI for down) */}
      {appliedForce > 0 
        ? renderArrow(thetaRad, appliedForce, "#a855f7", "Applied (F_a)", isAppliedSelected)
        : renderArrow(thetaRad + Math.PI, -appliedForce, "#a855f7", "Applied (F_a)", isAppliedSelected)}

      {/* 4. Friction: opposite to movement (angle = thetaRad + Math.PI if moving up, thetaRad if moving down) */}
      {renderArrow(
        frictionForce >= 0 ? thetaRad : thetaRad + Math.PI, 
        Math.abs(frictionForce), 
        "#eab308", 
        "Friction (F_f)", 
        isFrictionSelected
      )}
    </group>
  );
}

// Simulation Integrator logic
function SimulationEngine({
  isPlaying,
  mass,
  rampAngle,
  appliedForce,
  frictionEnabled,
  blockPosRef,
  blockVelRef,
  wAppliedRef,
  wGravityRef,
  wFrictionRef,
  rampLength
}) {
  const g = 9.81;
  const mu_k = 0.20;
  const mu_s = 0.30;

  useFrame((state, delta) => {
    if (!isPlaying) return;

    const dt = Math.min(0.04, delta);
    const pos = blockPosRef.current;
    const vel = blockVelRef.current;

    const thetaRad = (rampAngle * Math.PI) / 180;
    
    // Forces calculations
    const Fg_parallel = -mass * g * Math.sin(thetaRad);
    const Fn = mass * g * Math.cos(thetaRad);
    
    let Ff = 0;
    let Fnet = Fg_parallel + appliedForce;

    if (frictionEnabled) {
      if (Math.abs(vel) > 0.01) {
        // Kinetic friction opposes direction of speed
        Ff = -mu_k * Fn * Math.sign(vel);
        Fnet += Ff;
      } else {
        // Static friction balances net force up to limit
        const limit = mu_s * Fn;
        if (Math.abs(Fnet) <= limit) {
          Ff = -Fnet;
          Fnet = 0;
        } else {
          Ff = -mu_k * Fn * Math.sign(Fnet);
          Fnet += Ff;
        }
      }
    }

    const accel = Fnet / mass;
    const newVel = vel + accel * dt;
    const ds = newVel * dt;
    let newPos = pos + ds;

    // Check ramp limits
    if (newPos <= 0) {
      newPos = 0;
      blockVelRef.current = 0;
    } else if (newPos >= rampLength) {
      newPos = rampLength;
      blockVelRef.current = 0;
    } else {
      blockVelRef.current = newVel;
    }

    // Accumulate Work
    const actualDs = newPos - pos;
    wAppliedRef.current += appliedForce * actualDs;
    wGravityRef.current += Fg_parallel * actualDs;
    wFrictionRef.current += Ff * actualDs;
    
    blockPosRef.current = newPos;
  });

  return null;
}

// --- MAIN SIMULATOR COMPONENT ---
export default function WorkEnergySimulator({ selectedPart, onSelectPart, hoveredPart, onHoverPart }) {
  // Simulator configuration states
  const [isPlaying, setIsPlaying] = useState(false);
  const [mass, setMass] = useState(3.0); // kg
  const [rampAngle, setRampAngle] = useState(20); // degrees
  const [appliedForce, setAppliedForce] = useState(25); // Newtons
  const [frictionEnabled, setFrictionEnabled] = useState(true);

  // Live telemetry metrics
  const [blockPos, setBlockPos] = useState(2.0); // distance along ramp
  const [velocity, setVelocity] = useState(0.0);
  const [ke, setKe] = useState(0.0);
  const [wApplied, setWApplied] = useState(0.0);
  const [wGravity, setWGravity] = useState(0.0);
  const [wFriction, setWFriction] = useState(0.0);
  const [wNet, setWNet] = useState(0.0);
  const [graphHistory, setGraphHistory] = useState([]);

  // Forces list for FBD visualization
  const [gravityForceVal, setGravityForceVal] = useState(3.0 * 9.81);
  const [normalForceVal, setNormalForceVal] = useState(3.0 * 9.81 * Math.cos(20 * Math.PI / 180));
  const [frictionForceVal, setFrictionForceVal] = useState(0.0);

  // Integrator Refs
  const blockPosRef = useRef(2.0);
  const blockVelRef = useRef(0.0);
  const wAppliedRef = useRef(0.0);
  const wGravityRef = useRef(0.0);
  const wFrictionRef = useRef(0.0);
  const rampLength = 8.0;

  // Initialize position and clear telemetry on reset or config change when paused
  useEffect(() => {
    if (!isPlaying) {
      blockPosRef.current = 2.0;
      blockVelRef.current = 0.0;
      wAppliedRef.current = 0.0;
      wGravityRef.current = 0.0;
      wFrictionRef.current = 0.0;

      setBlockPos(2.0);
      setVelocity(0.0);
      setKe(0.0);
      setWApplied(0.0);
      setWGravity(0.0);
      setWFriction(0.0);
      setWNet(0.0);
      setGraphHistory([]);
    }
  }, [mass, rampAngle, appliedForce, frictionEnabled, isPlaying]);

  // Compute live forces for diagram
  useEffect(() => {
    const thetaRad = (rampAngle * Math.PI) / 180;
    const g = 9.81;
    const Fg = mass * g;
    const Fn = Fg * Math.cos(thetaRad);
    const Fg_parallel = -Fg * Math.sin(thetaRad);

    let Ff = 0;
    if (frictionEnabled) {
      const Fnet_active = appliedForce + Fg_parallel;
      if (Math.abs(blockVelRef.current) > 0.01) {
        Ff = -0.20 * Fn * Math.sign(blockVelRef.current);
      } else {
        const limit = 0.30 * Fn;
        if (Math.abs(Fnet_active) <= limit) {
          Ff = -Fnet_active;
        } else {
          Ff = -0.20 * Fn * Math.sign(Fnet_active);
        }
      }
    }

    setGravityForceVal(Fg);
    setNormalForceVal(Fn);
    setFrictionForceVal(Ff);
  }, [mass, rampAngle, appliedForce, frictionEnabled, blockPos, velocity]);

  // Telemetry loop (runs at 20Hz / 50ms)
  useEffect(() => {
    let timer = setInterval(() => {
      if (!isPlaying) return;

      const p = blockPosRef.current;
      const v = blockVelRef.current;
      const currentKE = 0.5 * mass * v * v;
      const wa = wAppliedRef.current;
      const wg = wGravityRef.current;
      const wf = wFrictionRef.current;
      const wn = wa + wg + wf;

      setBlockPos(p);
      setVelocity(v);
      setKe(currentKE);
      setWApplied(wa);
      setWGravity(wg);
      setWFriction(wf);
      setWNet(wn);

      setGraphHistory(prev => {
        const next = [...prev, { time: Date.now(), ke: currentKE, wNet: wn }];
        if (next.length > 50) next.shift();
        return next;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [isPlaying, mass]);

  const handleReset = () => {
    setIsPlaying(false);
    blockPosRef.current = 2.0;
    blockVelRef.current = 0.0;
    wAppliedRef.current = 0.0;
    wGravityRef.current = 0.0;
    wFrictionRef.current = 0.0;

    setBlockPos(2.0);
    setVelocity(0.0);
    setKe(0.0);
    setWApplied(0.0);
    setWGravity(0.0);
    setWFriction(0.0);
    setWNet(0.0);
    setGraphHistory([]);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 3D Canvas Box */}
      <div className="relative w-full rounded-2xl border border-white/10 bg-[#02030a] overflow-hidden h-[300px] shadow-xl">
        <Canvas
          camera={{ position: [0, 3, 7], fov: 45 }}
          shadows
          className="h-full w-full"
        >
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
          <directionalLight position={[-10, 15, 5]} intensity={0.8} />

          <SceneEnvironment />

          {/* Physics integrators */}
          <SimulationEngine 
            isPlaying={isPlaying}
            mass={mass}
            rampAngle={rampAngle}
            appliedForce={appliedForce}
            frictionEnabled={frictionEnabled}
            blockPosRef={blockPosRef}
            blockVelRef={blockVelRef}
            wAppliedRef={wAppliedRef}
            wGravityRef={wGravityRef}
            wFrictionRef={wFrictionRef}
            rampLength={rampLength}
          />

          {/* Ramp */}
          <Ramp angle={rampAngle} length={rampLength} activePart={selectedPart} />

          {/* Sliding Block */}
          <SlideBlock 
            posAlongRamp={blockPos} 
            rampAngle={rampAngle} 
            mass={mass} 
            activePart={selectedPart} 
          />

          {/* Force Vectors FBD */}
          <ForceVectors 
            posAlongRamp={blockPos}
            rampAngle={rampAngle}
            appliedForce={appliedForce}
            gravityForce={gravityForceVal}
            frictionForce={frictionForceVal}
            normalForce={normalForceVal}
            activePart={selectedPart}
          />

          <OrbitControls 
            enableZoom={true} 
            enablePan={false}
            maxDistance={15}
            minDistance={3}
            target={[2.5, 1.0, 0]}
            makeDefault
          />
        </Canvas>

        {/* 3D Scene Badge Overlay */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div className="rounded-lg bg-[#050914]/80 border border-white/5 px-2.5 py-1 backdrop-blur-md text-[9px] font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
            Work-Energy inclined Ramp Lab
          </div>
        </div>

        {/* Help tooltip */}
        <div className="absolute top-3 right-3 z-10">
          <div className="group relative">
            <button className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-[#050914]/80 text-gray-400 hover:text-white backdrop-blur-md transition-colors shadow">
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
            <div className="absolute right-0 top-7 w-48 scale-0 group-hover:scale-100 transition-all origin-top-right rounded-lg bg-slate-950/95 border border-slate-800 p-2.5 text-[9px] text-gray-300 leading-normal z-20 shadow-xl space-y-1">
              <p>● Drag to orbit, scroll to zoom.</p>
              <p>● Work equals force times displacement.</p>
              <p>● Friction performs negative work, dissipating kinetic energy as thermal energy.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls & Live Telemetry Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        
        {/* CONTROLS PANEL */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
            <Compass className="h-4 w-4 text-brand-cyan" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Simulation Parameters
            </h3>
          </div>

          <div className="space-y-3 flex-1 mb-4">
            
            {/* Mass slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-400">Block Mass (m)</span>
                <span className="text-brand-cyan font-mono">{mass.toFixed(1)} kg</span>
              </div>
              <input 
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={mass}
                onChange={(e) => setMass(parseFloat(e.target.value))}
                disabled={isPlaying}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan disabled:opacity-45"
              />
            </div>

            {/* Ramp Angle Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-400">Ramp Angle (θ)</span>
                <span className="text-brand-cyan font-mono">{rampAngle}°</span>
              </div>
              <input 
                type="range"
                min="0"
                max="60"
                step="1"
                value={rampAngle}
                onChange={(e) => setRampAngle(parseInt(e.target.value))}
                disabled={isPlaying}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan disabled:opacity-45"
              />
            </div>

            {/* Applied Force Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-400">Applied Force (F_a)</span>
                <span className={`font-mono ${appliedForce >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {appliedForce > 0 ? '+' : ''}{appliedForce.toFixed(0)} N
                </span>
              </div>
              <input 
                type="range"
                min="-50"
                max="50"
                step="1"
                value={appliedForce}
                onChange={(e) => setAppliedForce(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-purple"
              />
              <span className="text-[7.5px] text-gray-500 block">Forces pushing up the ramp are positive, down are negative.</span>
            </div>

            {/* Friction toggle */}
            <div className="flex justify-between items-center bg-black/20 border border-white/5 px-3 py-2 rounded-xl">
              <div>
                <span className="text-[10px] font-bold text-gray-200 block">Surface Friction</span>
                <span className="text-[8px] text-gray-500 block">
                  {frictionEnabled ? 'Kinetic friction (μ = 0.20) enabled' : 'Frictionless ramp'}
                </span>
              </div>
              <button
                onClick={() => setFrictionEnabled(!frictionEnabled)}
                disabled={isPlaying}
                className={`text-[9px] font-bold uppercase tracking-wider py-1 px-3 rounded-lg border transition-all ${
                  frictionEnabled 
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-400' 
                    : 'bg-white/5 border-transparent text-gray-400'
                } disabled:opacity-45`}
              >
                {frictionEnabled ? 'Friction ON' : 'Friction OFF'}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5 mt-2 border-t border-white/5 pt-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
                isPlaying 
                  ? 'bg-slate-800 hover:bg-slate-700' 
                  : 'bg-gradient-to-r from-brand-purple to-brand-cyan hover:brightness-110'
              }`}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
              {isPlaying ? 'Pause' : 'Start Simulation'}
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* TELEMETRY & GRAPH PANEL */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col gap-3.5 shadow-lg">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Activity className="h-4 w-4 text-brand-cyan" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Telemetry & Energy Transfer
            </h3>
          </div>

          {/* Stats details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/35 rounded-xl border border-white/5 p-2">
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Velocity (v)</span>
              <h4 className="text-xs font-extrabold text-white mt-0.5 font-mono">
                {velocity.toFixed(2)} m/s
              </h4>
            </div>

            <div className="bg-black/35 rounded-xl border border-white/5 p-2">
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Distance Travelled (d)</span>
              <h4 className="text-xs font-extrabold text-white mt-0.5 font-mono">
                {(blockPos - 2.0).toFixed(2)} m
              </h4>
            </div>

            <div className="bg-black/35 rounded-xl border border-white/5 p-2">
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Kinetic Energy (KE)</span>
              <h4 className="text-xs font-extrabold text-brand-cyan mt-0.5 font-mono">
                {ke.toFixed(2)} Joules
              </h4>
            </div>

            <div className="bg-black/35 rounded-xl border border-white/5 p-2">
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Net Work Done (W_net)</span>
              <h4 className="text-xs font-extrabold text-brand-purple mt-0.5 font-mono">
                {wNet.toFixed(2)} Joules
              </h4>
            </div>
          </div>

          {/* Work Done breakdowns */}
          <div className="bg-black/20 rounded-xl border border-white/5 p-3 space-y-2 text-[8px] font-mono text-gray-300">
            <h5 className="text-[9px] font-bold text-gray-200 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Zap className="h-3 w-3 text-yellow-400" /> Work Breakdown (W = ∫ F ds)
            </h5>
            <div className="flex justify-between">
              <span>Applied Force Work (W_app):</span>
              <span className={wApplied >= 0 ? "text-emerald-400" : "text-red-400"}>
                {wApplied >= 0 ? '+' : ''}{wApplied.toFixed(1)} J
              </span>
            </div>
            <div className="flex justify-between">
              <span>Gravity Work (W_grav):</span>
              <span className={wGravity >= 0 ? "text-emerald-400" : "text-red-400"}>
                {wGravity >= 0 ? '+' : ''}{wGravity.toFixed(1)} J
              </span>
            </div>
            <div className="flex justify-between">
              <span>Friction Work (W_fric):</span>
              <span className="text-amber-400">
                {wFriction.toFixed(1)} J
              </span>
            </div>
            <div className="border-t border-white/5 pt-1 flex justify-between font-bold text-white text-[9px]">
              <span>Sum of Work (W_net):</span>
              <span className="text-brand-purple">
                {wNet.toFixed(1)} J
              </span>
            </div>
          </div>

          {/* real-time graph */}
          <EnergyGraph history={graphHistory} />
        </div>
        
      </div>
    </div>
  );
}
