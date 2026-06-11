import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { 
  Play, Pause, RotateCcw, Activity, HelpCircle, 
  ChevronRight, Compass, ShieldAlert, Sparkles, Zap, Lightbulb
} from 'lucide-react';

// --- ELEMENT DATA ---
const ELEMENTS = {
  hydrogen: { name: 'Hydrogen', symbol: 'H', Z: 1, N: 0, distribution: [1], config: '1s¹' },
  helium: { name: 'Helium', symbol: 'He', Z: 2, N: 2, distribution: [2], config: '1s²' },
  lithium: { name: 'Lithium', symbol: 'Li', Z: 3, N: 4, distribution: [2, 1], config: '1s² 2s¹' },
  carbon: { name: 'Carbon', symbol: 'C', Z: 6, N: 6, distribution: [2, 4], config: '1s² 2s² 2p²' },
  oxygen: { name: 'Oxygen', symbol: 'O', Z: 8, N: 8, distribution: [2, 6], config: '1s² 2s² 2p⁴' },
  neon: { name: 'Neon', symbol: 'Ne', Z: 10, N: 10, distribution: [2, 8], config: '1s² 2s² 2p⁶' },
  sodium: { name: 'Sodium', symbol: 'Na', Z: 11, N: 12, distribution: [2, 8, 1], config: '1s² 2s² 2p⁶ 3s¹' },
  chlorine: { name: 'Chlorine', symbol: 'Cl', Z: 17, N: 18, distribution: [2, 8, 7], config: '1s² 2s² 2p⁶ 3s² 3p⁵' }
};

// --- PRE-DETERMINED NUCLEUS CLUSTER CALCULATIONS ---
function getNucleusParticles(Z, N) {
  const particles = [];
  const total = Z + N;
  
  // Seeded random number generator
  let seed = 25;
  function random() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  let protonsLeft = Z;
  let neutronsLeft = N;

  for (let i = 0; i < total; i++) {
    // Clustered spherical coordinates
    const r = 0.42 * Math.pow(random(), 0.4); 
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    let type = 'proton';
    if (protonsLeft > 0 && neutronsLeft > 0) {
      if (random() > 0.45) {
        type = 'neutron';
        neutronsLeft--;
      } else {
        type = 'proton';
        protonsLeft--;
      }
    } else if (protonsLeft > 0) {
      type = 'proton';
      protonsLeft--;
    } else {
      type = 'neutron';
      neutronsLeft--;
    }

    particles.push({ id: i, pos: [x, y, z], type });
  }
  return particles;
}

// --- PHOTON WAVE PACKET (WAVY TRAIL) ---
function PhotonWavePacket({ position, color }) {
  const points = Array.from({ length: 6 }).map((_, idx) => {
    const t = idx / 5;
    // Sine-wave oscillations
    const offset = Math.sin(idx * 2.2) * 0.15;
    return [t * 0.8, offset, 0];
  });

  return (
    <group position={position}>
      {points.map((pt, idx) => (
        <mesh key={idx} position={[pt[0] - 0.4, pt[1], pt[2]]}>
          <sphereGeometry args={[0.07 - idx * 0.008, 8, 8]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={Math.max(0, 1.0 - idx / 6)} 
          />
        </mesh>
      ))}
    </group>
  );
}

// --- 3D BOHR ELECTRON ---
function OrbitingElectron({ radius, speed, angleOffset, isTransitioning, color = '#22c55e' }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (isTransitioning || !meshRef.current) return;
    // Keplerian-like speed scaling
    const t = state.clock.getElapsedTime();
    const currentAngle = t * speed * (1.5 / radius) + angleOffset;
    
    meshRef.current.position.x = radius * Math.cos(currentAngle);
    meshRef.current.position.y = radius * Math.sin(currentAngle);
  });

  if (isTransitioning) return null;

  return (
    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={0.6} 
        roughness={0.2}
      />
    </mesh>
  );
}

// --- TRANSITION ANIMATION NODE ---
function TransitionAnimator({ transition, activeElement, onComplete }) {
  const photonRef = useRef();
  const electronRef = useRef();

  // Get transition colors based on wavelengths
  const getTransitionColor = (from, to) => {
    const min = Math.min(from, to);
    const max = Math.max(from, to);

    if (min === 1) return '#c084fc'; // UV (Purple/Violet)
    if (min === 2 && max === 3) return '#ef4444'; // Red (Balmer alpha)
    if (min === 2 && max === 4) return '#06b6d4'; // Cyan (Balmer beta)
    if (min === 2 && max === 5) return '#6366f1'; // Blue-Violet
    return '#f59e0b'; // Infrared/Other (Amber)
  };

  const getTransitionLabel = (from, to) => {
    const min = Math.min(from, to);
    const max = Math.max(from, to);
    if (min === 1) return 'UV Light (Lyman Series)';
    if (min === 2 && max === 3) return 'Red Light (656nm, Balmer Series)';
    if (min === 2 && max === 4) return 'Cyan Light (486nm, Balmer Series)';
    return 'Infrared (Paschen Series)';
  };

  const fromRadius = transition.fromShell * 1.0 + 0.3; // matching n=1..4 shell radii
  const toRadius = transition.toShell * 1.0 + 0.3;
  const photonColor = getTransitionColor(transition.fromShell, transition.toShell);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime() - transition.startTime;
    const progress = Math.min(1, elapsed / transition.duration);

    if (progress >= 1) {
      onComplete();
      return;
    }

    if (transition.type === 'absorption') {
      // Stage 1 (0 to 0.5): Photon travels inward to fromRadius
      if (progress <= 0.5) {
        const t = progress / 0.5;
        const radialPos = 7.0 - (7.0 - fromRadius) * t;
        if (photonRef.current) {
          photonRef.current.position.set(radialPos, 0, 0);
          photonRef.current.visible = true;
        }
        if (electronRef.current) {
          electronRef.current.position.set(fromRadius, 0, 0);
          electronRef.current.scale.set(1, 1, 1);
        }
      } 
      // Stage 2 (0.5 to 1): Electron jumps to toRadius, photon vanishes
      else {
        const t = (progress - 0.5) / 0.5;
        const currentRadius = fromRadius + (toRadius - fromRadius) * t;
        if (photonRef.current) {
          photonRef.current.visible = false;
        }
        if (electronRef.current) {
          electronRef.current.position.set(currentRadius, 0, 0);
          // Add quantum swelling vibration effect during jump
          const scale = 1.0 + Math.sin(t * Math.PI) * 0.4;
          electronRef.current.scale.set(scale, scale, scale);
        }
      }
    } else {
      // Emission
      // Stage 1 (0 to 0.5): Electron falls from fromRadius to toRadius
      if (progress <= 0.5) {
        const t = progress / 0.5;
        const currentRadius = fromRadius - (fromRadius - toRadius) * t;
        if (photonRef.current) {
          photonRef.current.visible = false;
        }
        if (electronRef.current) {
          electronRef.current.position.set(currentRadius, 0, 0);
          const scale = 1.0 - Math.sin(t * Math.PI) * 0.3;
          electronRef.current.scale.set(scale, scale, scale);
        }
      } 
      // Stage 2 (0.5 to 1): Photon travels outward, electron rests at toRadius
      else {
        const t = (progress - 0.5) / 0.5;
        const radialPos = toRadius + (7.0 - toRadius) * t;
        if (photonRef.current) {
          photonRef.current.position.set(radialPos, 0, 0);
          photonRef.current.visible = true;
        }
        if (electronRef.current) {
          electronRef.current.position.set(toRadius, 0, 0);
          electronRef.current.scale.set(1, 1, 1);
        }
      }
    }
  });

  return (
    <group rotation={[0, 0, transition.angleOffset]}>
      {/* Photon Wave Packet */}
      <group ref={photonRef}>
        <PhotonWavePacket position={[0, 0, 0]} color={photonColor} />
      </group>

      {/* Orbiting / Jump electron */}
      <mesh ref={electronRef} castShadow>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
          color="#a855f7" 
          emissive="#a855f7" 
          emissiveIntensity={1.0} 
        />
      </mesh>

      {/* Holographic Text for energy quantum delta */}
      <Html position={[0, 1.2, 0]} center distanceFactor={8}>
        <div className="rounded-lg bg-black/95 border border-purple-500/40 px-2 py-1 text-[7.5px] font-mono text-purple-200 shadow-2xl whitespace-nowrap text-center space-y-0.5 pointer-events-none">
          <div className="font-extrabold uppercase text-[6.5px] tracking-wider text-purple-400">
            {transition.type === 'absorption' ? 'Quantum Absorption' : 'Quantum Emission'}
          </div>
          <div>Shell {transition.fromShell} → {transition.toShell}</div>
          <div className="text-[7px] text-emerald-400 font-bold">ΔE = {transition.energy} eV</div>
          <div className="text-[6px] text-gray-400">{getTransitionLabel(transition.fromShell, transition.toShell)}</div>
        </div>
      </Html>
    </group>
  );
}

// --- SPACE BACKGROUND STARFIELD & ENVIRONMENT ---
function BohrEnvironment() {
  const starsRef = useRef();
  
  // Seeded random positions for background stars
  const starsPositions = [
    -5, 4, -4,    4, 6, -6,    -6, -5, -3,   5, -4, -5,   -3, 7, -2,
    3, -7, -3,   -7, 2, -5,    6, 1, -4,    -2, -6, -6,   2, 5, -7,
    -8, 0, -4,    7, -3, -6,   -1, 8, -5,    1, -8, -4,   -5, -3, -7,
    6, 5, -5,    -4, 5, -3,    3, -5, -4,   -7, -2, -5,   5, 2, -6
  ];

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-5, -8, -5]} intensity={0.4} />
      
      {/* Background Star field */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(starsPositions), 3]}
          />
        </bufferGeometry>
        <pointsMaterial color="#94a3b8" size={0.07} sizeAttenuation={true} transparent opacity={0.6} />
      </points>

      {/* Grid Helper in background */}
      <gridHelper args={[20, 16, '#1e293b', '#0f172a']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -6]} />
    </group>
  );
}

// --- MAIN BOHR SIMULATOR DASHBOARD ---
export default function BohrModelSimulator({ selectedPart, onSelectPart, hoveredPart, onHoverPart }) {
  const [activeElementKey, setActiveElementKey] = useState('lithium');
  const activeElement = ELEMENTS[activeElementKey];

  // Dynamic state representation of electrons in shells (supports excitation configurations)
  const [shellCounts, setShellCounts] = useState([2, 1, 0, 0]); // Lithium n=1, 2, 3, 4
  const [isExcited, setIsExcited] = useState(false);
  const [activeShellHighlight, setActiveShellHighlight] = useState(null);

  // Transition controller state
  const [transition, setTransition] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Atom in stable ground state.');
  
  // High freq values
  const nucleusParticles = getNucleusParticles(activeElement.Z, activeElement.N);

  // Reset/sync shells on element select
  useEffect(() => {
    const dist = [...activeElement.distribution];
    // Pad to 4 shells
    while (dist.length < 4) dist.push(0);
    setShellCounts(dist);
    setIsExcited(false);
    setTransition(null);
    setStatusMessage(`Loaded Ground State of ${activeElement.name} (Z = ${activeElement.Z})`);
  }, [activeElementKey]);

  // Handle quantum jump initiation
  const triggerQuantumLeap = (fromShell, toShell) => {
    if (transition) return; // wait for current to finish
    
    // Check if there is an electron to move in starting shell
    if (shellCounts[fromShell - 1] <= 0) {
      setStatusMessage(`Error: No electron available in shell n=${fromShell} to jump!`);
      return;
    }

    const type = fromShell < toShell ? 'absorption' : 'emission';
    const isExcitedEndState = toShell > fromShell;

    // Calculate Bohr Energy delta: E_n = -13.6 / n^2
    const eFrom = -13.6 / (fromShell * fromShell);
    const eTo = -13.6 / (toShell * toShell);
    const energyDelta = Math.abs(eTo - eFrom).toFixed(2);

    // Temporarily decrement starting shell electron count to hide it while animating
    setShellCounts(prev => {
      const copy = [...prev];
      copy[fromShell - 1] = Math.max(0, copy[fromShell - 1] - 1);
      return copy;
    });

    setTransition({
      type,
      fromShell,
      toShell,
      energy: energyDelta,
      angleOffset: Math.random() * Math.PI * 2,
      startTime: THREE.MathUtils.randFloatSpread(0.1), // simple clock offset
      duration: 2.0, // seconds
      isExcitedState: isExcitedEndState
    });

    setStatusMessage(type === 'absorption' 
      ? `Absorbing energy! Electron leaping outward: n=${fromShell} → n=${toShell}`
      : `Emitting photon! Electron dropping inward: n=${fromShell} → n=${toShell}`
    );
  };

  const handleTransitionComplete = () => {
    if (!transition) return;
    
    // Add electron to destination shell
    setShellCounts(prev => {
      const copy = [...prev];
      copy[transition.toShell - 1] = copy[transition.toShell - 1] + 1;
      return copy;
    });

    setIsExcited(transition.isExcitedState);
    setStatusMessage(transition.type === 'absorption' 
      ? `Excited State reached! Atom holds higher energy configuration (ΔE = +${transition.energy} eV).`
      : `Relaxed state! Photon discharged. Electron resting in stable shell n=${transition.toShell}.`
    );
    setTransition(null);
  };

  const resetToGroundState = () => {
    const dist = [...activeElement.distribution];
    while (dist.length < 4) dist.push(0);
    setShellCounts(dist);
    setIsExcited(false);
    setTransition(null);
    setStatusMessage(`Atom reset to Ground State.`);
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Element Selector Row */}
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-[#050914]/60 border border-white/5 backdrop-blur-xl">
        {Object.entries(ELEMENTS).map(([key, elem]) => (
          <button
            key={key}
            onClick={() => setActiveElementKey(key)}
            className={`flex-1 min-w-[70px] flex flex-col items-center justify-center py-1.5 rounded-xl border transition-all duration-200 ${
              activeElementKey === key 
                ? 'bg-gradient-to-r from-brand-cyan/20 to-brand-purple/20 border-brand-cyan/45 text-white shadow-md' 
                : 'bg-white/5 border-transparent text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="text-xs font-black tracking-wide">{elem.symbol}</span>
            <span className="text-[7.5px] uppercase tracking-wider text-gray-500 font-semibold">{elem.name}</span>
          </button>
        ))}
      </div>

      {/* 3D Atomic Canvas */}
      <div className="relative w-full rounded-2xl border border-white/10 bg-[#02050f] overflow-hidden h-[300px] shadow-xl">
        <Canvas camera={{ position: [0, 0, 7.5], fov: 50 }}>
          {/* Space Background & Lights */}
          <BohrEnvironment />

          {/* Clustered 3D Nucleus */}
          <group>
            {nucleusParticles.map(pt => (
              <mesh key={pt.id} position={pt.pos} castShadow>
                <sphereGeometry args={[0.13, 16, 16]} />
                <meshStandardMaterial 
                  color={pt.type === 'proton' ? '#06b6d4' : '#64748b'} 
                  emissive={pt.type === 'proton' ? '#06b6d4' : '#64748b'}
                  emissiveIntensity={0.2}
                  roughness={0.4} 
                  metalness={0.1}
                />
              </mesh>
            ))}
            
            {/* Core glow light */}
            <mesh>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} />
            </mesh>
          </group>

          {/* Electron shells concentric rings */}
          {Array.from({ length: 4 }).map((_, idx) => {
            const shellIndex = idx + 1;
            const radius = shellIndex * 1.0 + 0.3; // n=1: 1.3, n=2: 2.3, n=3: 3.3, n=4: 4.3
            const isHighlighted = activeShellHighlight === shellIndex || selectedPart === `electron-shells`;

            return (
              <group key={idx}>
                {/* Thin Ring represent orbit */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[radius - 0.015, radius + 0.015, 64]} />
                  <meshBasicMaterial 
                    color={isHighlighted ? '#f59e0b' : '#334155'} 
                    transparent 
                    opacity={isHighlighted ? 0.95 : 0.4} 
                  />
                </mesh>

                {/* Shell index float badge */}
                <Html position={[radius * Math.cos(Math.PI/4), radius * Math.sin(Math.PI/4), 0]} distanceFactor={8} center>
                  <div className={`px-1 py-0.5 rounded text-[6.5px] font-mono font-bold select-none ${
                    isHighlighted ? 'bg-amber-600 text-white' : 'bg-slate-900/60 text-slate-400'
                  }`}>
                    n={shellIndex}
                  </div>
                </Html>

                {/* Electrons in this shell */}
                {Array.from({ length: shellCounts[idx] || 0 }).map((_, eIdx) => {
                  const angleOffset = (eIdx / (shellCounts[idx] || 1)) * Math.PI * 2;
                  // Keplerian Speed: Outer orbits run slower!
                  const speed = 1.0 * (1.5 / radius);
                  return (
                    <OrbitingElectron
                      key={eIdx}
                      radius={radius}
                      speed={speed}
                      angleOffset={angleOffset}
                      isTransitioning={false}
                      color={selectedPart === 'electrons' ? '#fbbf24' : '#22c55e'}
                    />
                  );
                })}
              </group>
            );
          })}

          {/* Transition leap engine overlay */}
          {transition && (
            <TransitionAnimator
              transition={transition}
              activeElement={activeElement}
              onComplete={handleTransitionComplete}
            />
          )}

          {/* Camera Controls */}
          <OrbitControls 
            target={[0, 0, 0]}
            enableZoom={true}
            enablePan={false}
            maxDistance={15}
            minDistance={4}
          />
        </Canvas>

        {/* Canvas Badge overlay */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div className="rounded-lg bg-[#050914]/80 border border-white/5 px-2.5 py-1 backdrop-blur-md text-[9px] font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5 shadow">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
            3D Quantum Bohr Atom Sandbox
          </div>
        </div>

        {/* Active state tag */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-wider shadow ${
            isExcited 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            {isExcited ? 'Excited State (Unstable)' : 'Ground State (Stable)'}
          </span>
        </div>

        {/* Quantum Leap live status log */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <div className="rounded-lg bg-[#050914]/90 border border-white/10 px-3 py-1.5 backdrop-blur-md text-[9.5px] font-mono text-gray-200 shadow max-w-[280px]">
            <span className="text-[8px] font-bold uppercase tracking-wider text-brand-cyan block mb-0.5">Quantum Sandbox Log</span>
            <span className="font-semibold">{statusMessage}</span>
          </div>
        </div>
      </div>

      {/* Control sliders & Live Telemetry Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* INTERACTION AND JUMP CONTROLS */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
            <Compass className="h-4 w-4 text-brand-cyan" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Quantum Transitions Engine
            </h3>
          </div>

          <div className="space-y-3 flex-1 mb-4">
            <p className="text-[9.5px] text-gray-400 leading-normal">
              Click buttons to excite/relax the atom. This triggers quantum jumps between orbits, causing absorption or emission of colored photons.
            </p>

            {/* Quick transition trigger buttons */}
            <div className="space-y-2">
              <span className="text-[8.5px] font-bold text-gray-500 uppercase tracking-wide">Excitation jumps (Absorption)</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => triggerQuantumLeap(1, 2)}
                  disabled={!!transition}
                  className="py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25 text-purple-200 text-[9.5px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  n=1 → n=2 (10.2 eV)
                </button>
                <button
                  onClick={() => triggerQuantumLeap(2, 3)}
                  disabled={!!transition}
                  className="py-2 rounded-xl bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 text-red-200 text-[9.5px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  n=2 → n=3 (1.89 eV)
                </button>
                <button
                  onClick={() => triggerQuantumLeap(2, 4)}
                  disabled={!!transition}
                  className="py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/25 text-cyan-200 text-[9.5px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  n=2 → n=4 (2.55 eV)
                </button>
              </div>

              <span className="text-[8.5px] font-bold text-gray-500 uppercase tracking-wide block mt-3">De-excitation jumps (Emission)</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => triggerQuantumLeap(2, 1)}
                  disabled={!!transition}
                  className="py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25 text-purple-200 text-[9.5px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  n=2 → n=1 (10.2 eV)
                </button>
                <button
                  onClick={() => triggerQuantumLeap(3, 2)}
                  disabled={!!transition}
                  className="py-2 rounded-xl bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 text-red-200 text-[9.5px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  n=3 → n=2 (1.89 eV)
                </button>
                <button
                  onClick={() => triggerQuantumLeap(4, 2)}
                  disabled={!!transition}
                  className="py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/25 text-cyan-200 text-[9.5px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  n=4 → n=2 (2.55 eV)
                </button>
              </div>
            </div>
          </div>

          {/* Ground state reset button */}
          <div className="flex gap-2">
            <button
              onClick={resetToGroundState}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 text-xs font-bold transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset to Ground State
            </button>
          </div>
        </div>

        {/* LIVE TELEMETRY DATA PANEL */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
            <Activity className="h-4 w-4 text-brand-purple" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Atomic Telemetry Panel
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1 mb-3">
            <div className="bg-black/35 rounded-xl p-2.5 border border-white/5">
              <span className="text-[8.5px] font-bold text-gray-500 block uppercase">Atomic Number (Z)</span>
              <span className="text-sm font-mono font-bold text-brand-cyan">
                {activeElement.Z}
              </span>
            </div>

            <div className="bg-black/35 rounded-xl p-2.5 border border-white/5">
              <span className="text-[8.5px] font-bold text-gray-500 block uppercase">Protons / Neutrons</span>
              <span className="text-sm font-mono font-bold text-white">
                {activeElement.Z} p⁺ / {activeElement.N} n⁰
              </span>
            </div>

            <div className="bg-black/35 rounded-xl p-2.5 border border-white/5">
              <span className="text-[8.5px] font-bold text-gray-500 block uppercase">Total Electrons</span>
              <span className="text-sm font-mono font-bold text-brand-purple">
                {shellCounts.reduce((a, b) => a + b, 0)} e⁻
              </span>
            </div>

            <div className="bg-black/35 rounded-xl p-2.5 border border-white/5">
              <span className="text-[8.5px] font-bold text-gray-500 block uppercase">Spectroscopic Config</span>
              <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5 block">
                {activeElement.config}
              </span>
            </div>

            {/* Electron shell distribution count blocks */}
            <div className="bg-black/35 rounded-xl p-2.5 border border-white/5 col-span-2 space-y-1.5">
              <span className="text-[8.5px] font-bold text-gray-500 block uppercase">Shell Occupancy Distribution</span>
              <div className="flex gap-2 text-center">
                {shellCounts.map((count, idx) => (
                  <div 
                    key={idx} 
                    onMouseEnter={() => setActiveShellHighlight(idx + 1)}
                    onMouseLeave={() => setActiveShellHighlight(null)}
                    className={`flex-1 p-1.5 rounded-lg border transition-all cursor-crosshair ${
                      count > 0 
                        ? 'bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan' 
                        : 'bg-white/5 border-transparent text-gray-600'
                    }`}
                  >
                    <div className="text-[7.5px] uppercase font-black">n = {idx + 1}</div>
                    <div className="text-xs font-bold font-mono mt-0.5">{count} e⁻</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[9px] text-amber-200/90 leading-tight">
            <Zap className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Hover shell cards above to highlight specific quantized Bohr shells in the 3D atomic view.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
