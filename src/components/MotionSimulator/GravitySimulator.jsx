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
  Info, 
  Zap,
  Globe,
  Sun as SunIcon,
  ChevronsRight
} from 'lucide-react';

// --- REAL-TIME CHART COMPONENT ---
function GravityGraph({ history, gravityMode }) {
  const width = 280;
  const height = 90;
  const padding = 15;

  const pointsCount = history.length;
  
  // Format numbers for graph
  const yVals = history.map(h => h.force);
  const maxForce = Math.max(...yVals, 1);
  const minForce = Math.min(...yVals, 0);
  const forceRange = maxForce - minForce || 1;

  const path = useMemo(() => {
    if (pointsCount === 0) return '';
    return history.map((pt, idx) => {
      const x = padding + (idx / Math.max(1, pointsCount - 1)) * (width - 2 * padding);
      const y = height - padding - ((pt.force - minForce) / forceRange) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' L ');
  }, [history, pointsCount, minForce, forceRange]);

  const latestVal = yVals[yVals.length - 1] || 0;

  return (
    <div className="glass-panel p-2.5 rounded-xl border-white/5 bg-[#090d1a]/55 flex flex-col gap-1.5 relative overflow-hidden w-full">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold text-gray-200 uppercase tracking-wider">Gravitational Force vs Time</span>
        <span className="text-[9px] text-brand-cyan font-mono font-bold">
          F = {gravityMode === 'real' 
            ? `${latestVal.toExponential(2)} N` 
            : `${latestVal.toFixed(1)} u`}
        </span>
      </div>
      <div className="w-full h-[90px] relative bg-black/20 rounded-lg overflow-hidden border border-white/5">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* Grid Lines */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" />
          <line x1={width - padding} y1={padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.02)" strokeDasharray="3,3" />

          {/* Plot path */}
          {path && (
            <path 
              d={`M ${path}`} 
              fill="none" 
              stroke="#06b6d4" 
              strokeWidth="2" 
              className="drop-shadow-[0_0_4px_rgba(6,182,212,0.5)]" 
            />
          )}
        </svg>
      </div>
    </div>
  );
}

// --- 3D SCENE COMPONENTS ---

// Starfield Background
function Starfield() {
  const starsCount = 800;
  const positions = useMemo(() => {
    const arr = [];
    for (let i = 0; i < starsCount; i++) {
      const x = (Math.random() - 0.5) * 80;
      const y = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      // Filter out points too close to Sun
      const dist = Math.sqrt(x*x + y*y + z*z);
      if (dist > 6) {
        arr.push(x, y, z);
      }
    }
    return new Float32Array(arr);
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial 
        color="#ffffff" 
        size={0.08} 
        sizeAttenuation={true} 
        transparent 
        opacity={0.8}
      />
    </points>
  );
}

// Sun component
function Sun({ mass, activePart }) {
  const isSelected = activePart === 'The Sun (Object 1)';
  const pulseRef = useRef();

  useFrame((state) => {
    if (pulseRef.current) {
      const t = state.clock.getElapsedTime();
      const scale = 1 + Math.sin(t * 1.5) * 0.03;
      pulseRef.current.scale.set(scale, scale, scale);
    }
  });

  // Visually scale Sun radius slightly with its mass
  const visualRadius = 1.0 + (mass - 50) / 450 * 0.4;

  return (
    <group position={[0, 0, 0]}>
      {/* Selection Glow */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[visualRadius + 0.3, 32, 32]} />
          <meshBasicMaterial color="#eab308" transparent opacity={0.15} wireframe />
        </mesh>
      )}

      {/* Sun Core */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[visualRadius, 32, 32]} />
        <meshBasicMaterial color="#ff9f1c" />
      </mesh>

      {/* Sun Corona Glow */}
      <mesh>
        <sphereGeometry args={[visualRadius * 1.08, 32, 32]} />
        <meshBasicMaterial color="#ff5400" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Earth and Moon system component
function EarthMoon({ earthPos, activePart, mass }) {
  const isEarthSelected = activePart === 'The Earth (Object 2)';
  const isMoonSelected = activePart === 'The Moon';

  // Scale Earth radius slightly with mass
  const earthRadius = 0.35 + (mass - 1) / 49 * 0.15;
  const moonOrbitRadius = 0.85;

  const moonRef = useRef();

  useFrame((state) => {
    if (moonRef.current) {
      const t = state.clock.getElapsedTime() * 1.8;
      moonRef.current.position.x = Math.cos(t) * moonOrbitRadius;
      moonRef.current.position.z = Math.sin(t) * moonOrbitRadius;
    }
  });

  return (
    <group position={earthPos}>
      {/* Earth Selection Glow */}
      {isEarthSelected && (
        <mesh>
          <sphereGeometry args={[earthRadius + 0.15, 32, 32]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.2} wireframe />
        </mesh>
      )}

      {/* Earth Sphere */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[earthRadius, 32, 32]} />
        <meshStandardMaterial 
          color="#0ea5e9" 
          roughness={0.4} 
          metalness={0.1}
          emissive="#0369a1"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Earth Atmosphere Shell */}
      <mesh>
        <sphereGeometry args={[earthRadius * 1.05, 32, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.15} />
      </mesh>

      {/* Moon Orbit Trajectory Line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[moonOrbitRadius - 0.01, moonOrbitRadius + 0.01, 64]} />
        <meshBasicMaterial color="rgba(255,255,255,0.06)" side={THREE.DoubleSide} />
      </mesh>

      {/* Moon */}
      <group ref={moonRef}>
        {isMoonSelected && (
          <mesh>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshBasicMaterial color="#a1a1aa" transparent opacity={0.3} wireframe />
          </mesh>
        )}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

// Orbit Path Line Loop
function OrbitPath({ radius, isVisible, activePart }) {
  const isSelected = activePart === 'Orbit Path';
  if (!isVisible) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <ringGeometry args={[radius - 0.02, radius + 0.02, 128]} />
      <meshBasicMaterial 
        color={isSelected ? "#00ffff" : "rgba(6,182,212,0.3)"} 
        transparent 
        opacity={isSelected ? 0.9 : 0.4} 
        side={THREE.DoubleSide} 
      />
    </mesh>
  );
}

// Dynamic sandbox trail points
function SandboxTrail({ trail }) {
  const points = useMemo(() => {
    return trail.map(pt => new THREE.Vector3(pt.x, 0, pt.z));
  }, [trail]);

  if (points.length < 2) return null;

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position"
          args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#ec4899" linewidth={2} transparent opacity={0.6} />
    </line>
  );
}

// Gravitational Force Vector Component
function GravityVector({ earthPos, force, isVisible, activePart }) {
  const isSelected = activePart === 'Gravitational Force Vector';
  if (!isVisible) return null;

  const dist = Math.sqrt(earthPos[0] ** 2 + earthPos[2] ** 2);
  if (dist < 1.0) return null;

  // Direction vector pointing from Earth to Sun (origin)
  const dirX = -earthPos[0] / dist;
  const dirZ = -earthPos[2] / dist;

  // Visual length of arrow (proportional to force magnitude, bounded)
  const arrowLength = Math.min(3.5, Math.max(0.6, force * 0.02));
  
  // Angle of arrow in X-Z plane
  const angle = Math.atan2(dirZ, dirX);

  return (
    <group>
      {/* Sun-to-Earth Pull Vector */}
      <group 
        position={earthPos} 
        rotation={[0, -angle, 0]}
      >
        <mesh position={[arrowLength / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, arrowLength, 8]} />
          <meshBasicMaterial color={isSelected ? "#22c55e" : "#eab308"} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.1, 0.25, 8]} />
          <meshBasicMaterial color={isSelected ? "#22c55e" : "#eab308"} />
        </mesh>

        <Html position={[arrowLength / 2, 0.4, 0]} center distanceFactor={10}>
          <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold text-white border whitespace-nowrap shadow-lg backdrop-blur-sm transition-all duration-200 ${
            isSelected ? 'bg-slate-900 border-green-400 scale-105' : 'bg-slate-950/70 border-slate-700'
          }`}>
            F₁₂ (Pull on Earth)
          </div>
        </Html>
      </group>

      {/* Earth-to-Sun Pull Vector (Newton's Third Law: Equal & Opposite!) */}
      <group 
        position={[0, 0, 0]} 
        rotation={[0, -angle + Math.PI, 0]}
      >
        <mesh position={[arrowLength / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, arrowLength, 8]} />
          <meshBasicMaterial color={isSelected ? "#22c55e" : "#eab308"} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.1, 0.25, 8]} />
          <meshBasicMaterial color={isSelected ? "#22c55e" : "#eab308"} />
        </mesh>

        <Html position={[arrowLength / 2, 0.4, 0]} center distanceFactor={10}>
          <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold text-white border whitespace-nowrap shadow-lg backdrop-blur-sm transition-all duration-200 ${
            isSelected ? 'bg-slate-900 border-green-400 scale-105' : 'bg-slate-950/70 border-slate-700'
          }`}>
            F₂₁ (Pull on Sun)
          </div>
        </Html>
      </group>
    </group>
  );
}

// Physics Loop runner
function GravitySimulationEngine({
  isPlaying,
  mass1,
  orbitMode,
  earthPosRef,
  earthVelRef,
  orbitRadiusRef,
  crashFlagRef,
  escapeFlagRef,
  trailPointsRef,
  setTrailUpdatedTrigger
}) {
  useFrame((state, delta) => {
    if (!isPlaying) return;

    // Cap delta to prevent crazy glitches on tab swaps
    const dt = Math.min(0.04, delta);

    const x = earthPosRef.current[0];
    const z = earthPosRef.current[2];
    const vx = earthVelRef.current[0];
    const vz = earthVelRef.current[2];

    const r = Math.sqrt(x*x + z*z);
    orbitRadiusRef.current = r;

    // Check boundary collisions
    if (r < 1.1) {
      crashFlagRef.current = true;
      return;
    }
    if (r > 22.0) {
      escapeFlagRef.current = true;
      return;
    }

    if (orbitMode === 'circular') {
      // Analytical stable circular orbit (G = 1)
      const omega = Math.sqrt(mass1 / (r * r * r));
      const newTheta = Math.atan2(z, x) + omega * dt;
      earthPosRef.current = [Math.cos(newTheta) * r, 0, Math.sin(newTheta) * r];
      
      const vMag = Math.sqrt(mass1 / r);
      earthVelRef.current = [-Math.sin(newTheta) * vMag, 0, Math.cos(newTheta) * vMag];
    } else {
      // Verlet integration for sandbox mode (G = 1)
      const ax = -mass1 * x / (r * r * r);
      const az = -mass1 * z / (r * r * r);

      // Simple Symplectic Euler
      const nextVx = vx + ax * dt;
      const nextVz = vz + az * dt;
      const nextX = x + nextVx * dt;
      const nextZ = z + nextVz * dt;

      earthPosRef.current = [nextX, 0, nextZ];
      earthVelRef.current = [nextVx, 0, nextVz];

      // Trail logging
      trailPointsRef.current.push({ x: nextX, z: nextZ });
      if (trailPointsRef.current.length > 300) {
        trailPointsRef.current.shift();
      }
      setTrailUpdatedTrigger(prev => prev + 1);
    }
  });

  return null;
}

// --- MAIN WRAPPER COMPONENT ---
export default function GravitySimulator({ selectedPart, onSelectPart, hoveredPart, onHoverPart }) {
  // State variables
  const [isPlaying, setIsPlaying] = useState(true);
  const [mass1, setMass1] = useState(200); // Sun
  const [mass2, setMass2] = useState(10); // Earth
  const [distance, setDistance] = useState(5.0); // radius
  const [gravityMode, setGravityMode] = useState('simulation'); // 'simulation' vs 'real'
  const [orbitMode, setOrbitMode] = useState('circular'); // 'circular' vs 'sandbox'
  
  // Custom launch velocity for Sandbox mode
  const stableVelVal = Math.sqrt(200 / 5.0); // ~6.32
  const [launchVel, setLaunchVel] = useState(stableVelVal); 

  const [currentDistance, setCurrentDistance] = useState(5.0);
  const [currentVelocity, setCurrentVelocity] = useState(stableVelVal);
  const [currentForce, setCurrentForce] = useState((200 * 10) / 25.0);
  const [earthPos, setEarthPos] = useState([5.0, 0, 0]);
  const [trail, setTrail] = useState([]);
  const [status, setStatus] = useState('orbiting'); // 'orbiting', 'crashed', 'escaped'
  const [graphHistory, setGraphHistory] = useState([]);

  // Simulation Refs
  const earthPosRef = useRef([5.0, 0, 0]);
  const earthVelRef = useRef([0, 0, stableVelVal]);
  const orbitRadiusRef = useRef(5.0);
  const crashFlagRef = useRef(false);
  const escapeFlagRef = useRef(false);
  const trailPointsRef = useRef([]);
  const [trailUpdatedTrigger, setTrailUpdatedTrigger] = useState(0);

  // Sync controls to simulation variables
  useEffect(() => {
    if (!isPlaying || status !== 'orbiting') {
      const vMag = orbitMode === 'circular' ? Math.sqrt(mass1 / distance) : launchVel;
      earthPosRef.current = [distance, 0, 0];
      earthVelRef.current = [0, 0, vMag];
      setEarthPos([distance, 0, 0]);
      orbitRadiusRef.current = distance;
      setCurrentDistance(distance);
      setCurrentVelocity(vMag);
      setCurrentForce((mass1 * mass2) / (distance * distance));
      crashFlagRef.current = false;
      escapeFlagRef.current = false;
      setStatus('orbiting');
      trailPointsRef.current = [];
      setTrail([]);
    }
  }, [distance, mass1, mass2, isPlaying, orbitMode, launchVel, status]);

  // Handle auto-calculated speed when mass/distance changes
  useEffect(() => {
    if (orbitMode === 'circular') {
      const vMag = Math.sqrt(mass1 / distance);
      setLaunchVel(vMag);
    }
  }, [mass1, distance, orbitMode]);

  // Main UI polling interval (updates graphs, dials at 20Hz)
  useEffect(() => {
    let timer = setInterval(() => {
      if (status !== 'orbiting') return;

      if (crashFlagRef.current) {
        setStatus('crashed');
        setIsPlaying(false);
        return;
      }
      if (escapeFlagRef.current) {
        setStatus('escaped');
        setIsPlaying(false);
        return;
      }

      const x = earthPosRef.current[0];
      const z = earthPosRef.current[2];
      const vx = earthVelRef.current[0];
      const vz = earthVelRef.current[2];

      const r = Math.sqrt(x*x + z*z);
      const v = Math.sqrt(vx*vx + vz*vz);
      const f = (mass1 * mass2) / (r * r);

      setEarthPos([x, 0, z]);
      setCurrentDistance(r);
      setCurrentVelocity(v);
      setCurrentForce(f);
      setTrail([...trailPointsRef.current]);

      setGraphHistory(prev => {
        const next = [...prev, { time: Date.now(), force: f }];
        if (next.length > 50) next.shift();
        return next;
      });

    }, 50);

    return () => clearInterval(timer);
  }, [mass1, mass2, status]);

  const handleReset = () => {
    setIsPlaying(false);
    crashFlagRef.current = false;
    escapeFlagRef.current = false;
    trailPointsRef.current = [];
    setTrail([]);
    setStatus('orbiting');
    setGraphHistory([]);
    
    const vMag = Math.sqrt(mass1 / distance);
    earthPosRef.current = [distance, 0, 0];
    earthVelRef.current = [0, 0, vMag];
    setEarthPos([distance, 0, 0]);
    orbitRadiusRef.current = distance;
    setCurrentDistance(distance);
    setCurrentVelocity(vMag);
    setCurrentForce((mass1 * mass2) / (distance * distance));
  };

  // Convert model scales to universal physics equivalents
  const physicalStats = useMemo(() => {
    // 1 simulator mass unit = 10^28 kg (Sun = 200 units = 2.0e30 kg)
    // 1 simulator earth mass unit = 6e23 kg (Earth = 10 units = 6.0e24 kg)
    // 1 simulator distance unit = 3e10 m (Earth orbit = 5 units = 1.5e11 m)
    const M1_kg = mass1 * 1.0e28;
    const M2_kg = mass2 * 6.0e23;
    const r_m = currentDistance * 3.0e10;
    
    // G = 6.6743e-11
    const G = 6.6743e-11;
    const F_N = (G * M1_kg * M2_kg) / (r_m * r_m);
    const v_ms = Math.sqrt((G * M1_kg) / r_m);

    return {
      M1: M1_kg,
      M2: M2_kg,
      r: r_m,
      F: F_N,
      v: v_ms
    };
  }, [mass1, mass2, currentDistance]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 3D Canvas Box */}
      <div className="relative w-full rounded-2xl border border-white/10 bg-[#02030a] overflow-hidden h-[340px] shadow-xl">
        <Canvas
          camera={{ position: [0, 8, 8], fov: 50 }}
          shadows
          className="h-full w-full"
        >
          <ambientLight intensity={0.15} />
          {/* Point light sitting inside the Sun core */}
          <pointLight position={[0, 0, 0]} intensity={3.0} distance={100} decay={1} color="#ffdf8f" />
          
          <Starfield />

          {/* Physics integrator element */}
          <GravitySimulationEngine 
            isPlaying={isPlaying}
            mass1={mass1}
            orbitMode={orbitMode}
            earthPosRef={earthPosRef}
            earthVelRef={earthVelRef}
            orbitRadiusRef={orbitRadiusRef}
            crashFlagRef={crashFlagRef}
            escapeFlagRef={escapeFlagRef}
            trailPointsRef={trailPointsRef}
            setTrailUpdatedTrigger={setTrailUpdatedTrigger}
          />

          {/* Sun */}
          <Sun mass={mass1} activePart={selectedPart} />

          {/* Earth-Moon System */}
          <EarthMoon earthPos={earthPos} activePart={selectedPart} mass={mass2} />

          {/* Force Vectors */}
          <GravityVector 
            earthPos={earthPos} 
            force={currentForce} 
            isVisible={true}
            activePart={selectedPart}
          />

          {/* Orbit paths */}
          <OrbitPath 
            radius={distance} 
            isVisible={orbitMode === 'circular'} 
            activePart={selectedPart}
          />
          <SandboxTrail trail={trail} />

          <OrbitControls 
            enableZoom={true} 
            enablePan={false}
            maxDistance={25}
            minDistance={3.5}
            makeDefault
          />
        </Canvas>

        {/* 3D Scene Badge Overlay */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div className="rounded-lg bg-[#050914]/80 border border-white/5 px-2.5 py-1 backdrop-blur-md text-[9px] font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
            Newtonian Gravity Space Canvas
          </div>
        </div>

        {/* Dynamic Collision Status Badge */}
        {status !== 'orbiting' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="text-center space-y-3 p-6 rounded-2xl glass-panel border-white/10 max-w-sm">
              <span className="text-4xl">
                {status === 'crashed' ? '💥' : '🌌'}
              </span>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                {status === 'crashed' ? 'Planet Collided!' : 'Orbit Escape!'}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {status === 'crashed' 
                  ? 'The planet spiraled inside the Roche limit and collided with the host star due to insufficient tangential speed.'
                  : 'The planet exceeded the local gravitational escape velocity (v_esc = sqrt(2GM/r)) and drifted out of orbit.'}
              </p>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 mx-auto rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan px-4 py-2 text-xs font-bold text-white transition-all hover:brightness-110 shadow-lg"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Re-Initialize Orbit
              </button>
            </div>
          </div>
        )}

        {/* Help tooltip */}
        <div className="absolute top-3 right-3 z-10">
          <div className="group relative">
            <button className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-[#050914]/80 text-gray-400 hover:text-white backdrop-blur-md transition-colors shadow">
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
            <div className="absolute right-0 top-7 w-52 scale-0 group-hover:scale-100 transition-all origin-top-right rounded-lg bg-slate-950/95 border border-slate-800 p-2.5 text-[9px] text-gray-300 leading-normal z-20 shadow-xl space-y-1.5">
              <p>● Drag canvas to rotate, scroll to zoom.</p>
              <p>● **Auto-Balanced** updates velocities dynamically for circular orbits.</p>
              <p>● **Sandbox** lets you set velocities to observe Keplerian ellipse shapes or decay.</p>
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
              Orbital Parameters
            </h3>
          </div>

          <div className="space-y-4 flex-1 mb-4">
            
            {/* Mode selection toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setOrbitMode('circular')}
                className={`flex-1 py-1 px-2.5 rounded-lg border text-[10px] font-bold transition-all ${
                  orbitMode === 'circular'
                    ? 'bg-brand-cyan/20 border-brand-cyan/40 text-brand-cyan font-extrabold'
                    : 'bg-white/5 border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Auto-Balanced Orbit
              </button>
              <button
                onClick={() => setOrbitMode('sandbox')}
                className={`flex-1 py-1 px-2.5 rounded-lg border text-[10px] font-bold transition-all ${
                  orbitMode === 'sandbox'
                    ? 'bg-brand-purple/20 border-brand-purple/40 text-brand-purple font-extrabold'
                    : 'bg-white/5 border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Interactive Sandbox
              </button>
            </div>

            {/* Mass 1 (Sun) Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-400 flex items-center gap-1">
                  <SunIcon className="h-3 w-3 text-amber-400" /> Star Mass (M₁)
                </span>
                <span className="text-brand-cyan font-mono">
                  {gravityMode === 'real'
                    ? `${(mass1 * 1e28).toExponential(2)} kg`
                    : `${mass1} u`}
                </span>
              </div>
              <input 
                type="range"
                min="50"
                max="500"
                step="10"
                value={mass1}
                onChange={(e) => setMass1(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
            </div>

            {/* Mass 2 (Earth) Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-400 flex items-center gap-1">
                  <Globe className="h-3 w-3 text-sky-400" /> Planet Mass (M₂)
                </span>
                <span className="text-brand-cyan font-mono">
                  {gravityMode === 'real'
                    ? `${(mass2 * 6.0e23).toExponential(2)} kg`
                    : `${mass2} u`}
                </span>
              </div>
              <input 
                type="range"
                min="1"
                max="50"
                step="1"
                value={mass2}
                onChange={(e) => setMass2(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
            </div>

            {/* Orbital Distance Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-400">Launch Distance (r)</span>
                <span className="text-brand-cyan font-mono">
                  {gravityMode === 'real'
                    ? `${(distance * 3e10).toExponential(2)} m`
                    : `${distance.toFixed(1)} u`}
                </span>
              </div>
              <input 
                type="range"
                min="3.0"
                max="8.0"
                step="0.1"
                value={distance}
                onChange={(e) => setDistance(parseFloat(e.target.value))}
                disabled={isPlaying && orbitMode === 'sandbox'}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan disabled:opacity-45"
              />
              {isPlaying && orbitMode === 'sandbox' && (
                <span className="text-[7.5px] text-red-400/80">Stop simulation to reposition orbits.</span>
              )}
            </div>

            {/* Tangential Launch Velocity Slider (Sandbox mode only) */}
            {orbitMode === 'sandbox' && (
              <div className="space-y-1 animate-fadeIn">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-gray-400">Tangential Launch Speed</span>
                  <span className="text-brand-purple font-mono">
                    {gravityMode === 'real'
                      ? `${(launchVel * 4730).toFixed(0)} m/s`
                      : `${launchVel.toFixed(2)} u/s`}
                  </span>
                </div>
                <input 
                  type="range"
                  min="2.0"
                  max="12.0"
                  step="0.1"
                  value={launchVel}
                  onChange={(e) => setLaunchVel(parseFloat(e.target.value))}
                  disabled={isPlaying}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-purple disabled:opacity-45"
                />
                <span className="text-[8px] text-gray-500 block">
                  Circular orbital velocity is **{Math.sqrt(mass1 / distance).toFixed(2)} u/s**.
                </span>
              </div>
            )}
          </div>

          {/* Action Row */}
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

            {/* Gravity Constant Toggle */}
            <button
              onClick={() => setGravityMode(prev => prev === 'simulation' ? 'real' : 'simulation')}
              className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-950/70 transition-all"
            >
              <Zap className="h-3.5 w-3.5 text-yellow-400" />
              {gravityMode === 'simulation' ? 'Switch to Universal G' : 'Switch to Sim scale'}
            </button>
          </div>
        </div>

        {/* TELEMETRY & GRAPH PANEL */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col gap-3.5 shadow-lg">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Activity className="h-4 w-4 text-brand-cyan" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Telemetry & Math
            </h3>
          </div>

          {/* Stats dials */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/35 rounded-xl border border-white/5 p-2.5">
              <span className="text-[8.5px] font-bold text-gray-400 uppercase tracking-wider">Gravitational Force (F_g)</span>
              <h4 className="text-sm font-extrabold text-white mt-0.5 truncate font-mono">
                {gravityMode === 'real'
                  ? `${physicalStats.F.toExponential(3)} N`
                  : `${currentForce.toFixed(2)} units`}
              </h4>
            </div>

            <div className="bg-black/35 rounded-xl border border-white/5 p-2.5">
              <span className="text-[8.5px] font-bold text-gray-400 uppercase tracking-wider">Orbital Velocity (v)</span>
              <h4 className="text-sm font-extrabold text-brand-cyan mt-0.5 truncate font-mono">
                {gravityMode === 'real'
                  ? `${(currentVelocity * 4730).toLocaleString(undefined, {maximumFractionDigits: 0})} m/s`
                  : `${currentVelocity.toFixed(2)} u/s`}
              </h4>
            </div>

            <div className="bg-black/35 rounded-xl border border-white/5 p-2.5">
              <span className="text-[8.5px] font-bold text-gray-400 uppercase tracking-wider">Current Distance (r)</span>
              <h4 className="text-sm font-extrabold text-white mt-0.5 truncate font-mono">
                {gravityMode === 'real'
                  ? `${(currentDistance * 3e10).toExponential(3)} m`
                  : `${currentDistance.toFixed(2)} units`}
              </h4>
            </div>

            <div className="bg-black/35 rounded-xl border border-white/5 p-2.5">
              <span className="text-[8.5px] font-bold text-gray-400 uppercase tracking-wider">Roche Limit (Safety bound)</span>
              <h4 className="text-sm font-extrabold text-red-400 mt-0.5 truncate font-mono">
                {gravityMode === 'real'
                  ? `${(1.1 * 3e10).toExponential(2)} m`
                  : `1.1 units`}
              </h4>
            </div>
          </div>

          {/* real-time graph */}
          <GravityGraph history={graphHistory} gravityMode={gravityMode} />
        </div>
        
      </div>
    </div>
  );
}
