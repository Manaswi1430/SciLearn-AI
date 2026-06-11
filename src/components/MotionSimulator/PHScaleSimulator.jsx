import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { 
  Play, Pause, RotateCcw, Activity, HelpCircle, 
  ChevronRight, Sparkles, Droplets, Info, Eye, EyeOff, Zap, GraduationCap 
} from 'lucide-react';

// --- SOLUTIONS DATA ---
const SOLUTIONS = {
  hcl: {
    id: 'hcl',
    name: 'Hydrochloric Acid',
    formula: 'HCl',
    pH: 1.0,
    strength: 'Strong Acid',
    type: 'acid',
    color: '#ef4444', // Red
    glowColor: 'rgba(239, 68, 68, 0.4)',
    desc: 'Hydrochloric acid dissociates completely in water, producing a high concentration of hydronium ions (H₃O⁺). Virtually zero intact HCl molecules remain.',
    equation: 'HCl(aq) + H₂O(l) → H₃O⁺(aq) + Cl⁻(aq)',
    ka: 'Very Large (~10⁷)',
    particles: { hydronium: 16, anions: 16, molecules: 0, water: 6 }
  },
  h2so4: {
    id: 'h2so4',
    name: 'Sulfuric Acid',
    formula: 'H₂SO₄',
    pH: 1.5,
    strength: 'Strong Acid',
    type: 'acid',
    color: '#f97316', // Orange-Red
    glowColor: 'rgba(249, 115, 22, 0.4)',
    desc: 'Sulfuric acid is a strong diprotic mineral acid. In its first ionization step, it dissociates completely into hydronium and hydrogen sulfate ions.',
    equation: 'H₂SO₄(aq) + H₂O(l) → H₃O⁺(aq) + HSO₄⁻(aq)',
    ka: 'Very Large (Step 1)',
    particles: { hydronium: 13, anions: 13, molecules: 0, water: 8 }
  },
  citric: {
    id: 'citric',
    name: 'Citric Acid',
    formula: 'C₆H₈O₇',
    pH: 2.2,
    strength: 'Weak Acid',
    type: 'acid',
    color: '#eab308', // Yellow-Orange
    desc: 'Citric acid is a weak organic triprotic acid found in citrus fruits. Only a tiny fraction of its molecules dissociate, leaving most molecules intact in equilibrium.',
    equation: 'H₃C₆H₅O₇(aq) + H₂O(l) ⇌ H₃O⁺(aq) + H₂C₆H₅O₇⁻(aq)',
    ka: '7.4 × 10⁻⁴',
    particles: { hydronium: 4, anions: 4, molecules: 11, water: 9 }
  },
  acetic: {
    id: 'acetic',
    name: 'Acetic Acid',
    formula: 'CH₃COOH',
    pH: 3.0,
    strength: 'Weak Acid',
    type: 'acid',
    color: '#84cc16', // Yellow-Green
    desc: 'Acetic acid (found in vinegar) is a weak carboxylic acid. Less than 1.3% of the molecules dissociate in a typical 0.1 M solution at room temperature.',
    equation: 'CH₃COOH(aq) + H₂O(l) ⇌ H₃O⁺(aq) + CH₃COO⁻(aq)',
    ka: '1.8 × 10⁻⁵',
    particles: { hydronium: 2, anions: 2, molecules: 13, water: 11 }
  },
  water: {
    id: 'water',
    name: 'Pure Water',
    formula: 'H₂O',
    pH: 7.0,
    strength: 'Neutral',
    type: 'neutral',
    color: '#22c55e', // Green
    glowColor: 'rgba(34, 197, 94, 0.2)',
    desc: 'Pure water is neutral. It undergoes a process called auto-ionization at a minute scale, creating equal but extremely low concentrations of H₃O⁺ and OH⁻ ions.',
    equation: '2 H₂O(l) ⇌ H₃O⁺(aq) + OH⁻(aq)',
    ka: 'Kw = 1.0 × 10⁻¹⁴',
    particles: { hydronium: 1, anions: 1, molecules: 0, water: 24 } // 1 H3O+ and 1 OH- representing the tiny auto-ionization
  },
  soap: {
    id: 'soap',
    name: 'Soap Solution',
    formula: 'NaC₁₈H₃₅O₂',
    pH: 9.0,
    strength: 'Weak Base',
    type: 'base',
    color: '#06b6d4', // Cyan/Light-Blue
    glowColor: 'rgba(6, 182, 212, 0.4)',
    desc: 'Soap is a salt of a weak fatty acid and strong base. The carboxylate ions hydrolyze water, taking protons and generating a low excess of hydroxide ions (OH⁻).',
    equation: 'RCOO⁻(aq) + H₂O(l) ⇌ RCOOH(aq) + OH⁻(aq)',
    ka: 'Kb ≈ 1.0 × 10⁻⁵',
    particles: { hydronium: 0, hydroxide: 3, cations: 3, molecules: 12, water: 10 } // cations represent protonated fatty acid or Na+
  },
  ammonia: {
    id: 'ammonia',
    name: 'Ammonia Solution',
    formula: 'NH₃',
    pH: 11.5,
    strength: 'Weak Base',
    type: 'base',
    color: '#3b82f6', // Blue
    glowColor: 'rgba(59, 130, 246, 0.4)',
    desc: 'Ammonia is a weak nitrogenous base. It does not contain hydroxide ions directly, but reacts partially with water to produce ammonium (NH₄⁺) and hydroxide (OH⁻) ions.',
    equation: 'NH₃(aq) + H₂O(l) ⇌ NH₄⁺(aq) + OH⁻(aq)',
    ka: 'Kb = 1.8 × 10⁻⁵',
    particles: { hydronium: 0, hydroxide: 4, cations: 4, molecules: 11, water: 9 }
  },
  naoh: {
    id: 'naoh',
    name: 'Sodium Hydroxide',
    formula: 'NaOH',
    pH: 13.0,
    strength: 'Strong Base',
    type: 'base',
    color: '#a855f7', // Purple/Violet
    glowColor: 'rgba(168, 85, 247, 0.4)',
    desc: 'Sodium hydroxide (lye) is a strong base that dissociates completely in water. It yields a very high concentration of metal cations and hydroxide ions (OH⁻).',
    equation: 'NaOH(aq) → Na⁺(aq) + OH⁻(aq)',
    ka: 'Kb = Very Large',
    particles: { hydronium: 0, hydroxide: 15, cations: 15, molecules: 0, water: 6 }
  }
};

// --- 3D BEAKER AND FLUIDS ---
function BeakerModel({ color, fillLevel, hasIndicator, indicatorFalling }) {
  // Beaker glass cylinder outline
  const beakerRef = useRef();

  return (
    <group position={[0, -0.8, 0]}>
      {/* Beaker Glass Body */}
      <mesh>
        <cylinderGeometry args={[2.0, 2.0, 3.2, 32, 1, true]} />
        <meshPhysicalMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.18} 
          roughness={0.1} 
          transmission={0.9} 
          thickness={0.1}
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* Beaker Base */}
      <mesh position={[0, -1.6, 0]}>
        <cylinderGeometry args={[2.0, 2.0, 0.05, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.3} 
          roughness={0.1} 
        />
      </mesh>

      {/* Beaker Measurement Marks */}
      {Array.from({ length: 5 }).map((_, i) => {
        const height = -1.2 + i * 0.6;
        const ml = (i + 1) * 100;
        return (
          <group key={i} position={[0, height, 0]}>
            {/* Mark line */}
            <mesh position={[1.98, 0, 0]} rotation={[0, 0, 0]}>
              <boxGeometry args={[0.03, 0.02, 0.25]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
            </mesh>
            <Html distanceFactor={6} position={[2.2, 0, 0]} center>
              <span className="text-[8px] font-mono text-gray-400 select-none">{ml}mL</span>
            </Html>
          </group>
        );
      })}

      {/* Liquid inside the Beaker */}
      <mesh position={[0, -1.6 + fillLevel / 2, 0]}>
        <cylinderGeometry args={[1.96, 1.96, fillLevel, 32]} />
        <meshPhysicalMaterial 
          color={hasIndicator ? color : '#38bdf8'} // defaults to light water blue if no indicator dye is added
          transparent 
          opacity={hasIndicator ? 0.75 : 0.2} 
          roughness={0.1} 
          transmission={hasIndicator ? 0.4 : 0.9}
        />
      </mesh>

      {/* Indicator dye drop animation */}
      {indicatorFalling && (
        <IndicatorDrop targetColor={color} />
      )}
    </group>
  );
}

// --- FALLING DYE DROP ANIMATION ---
function IndicatorDrop({ targetColor }) {
  const dropRef = useRef();
  const [active, setActive] = useState(true);

  useFrame((state) => {
    if (!dropRef.current || !active) return;

    // Drop downward
    dropRef.current.position.y -= 0.12;

    // Splash when hitting liquid surface (y=0.6)
    if (dropRef.current.position.y <= 0.6) {
      setActive(false);
    }
  });

  if (!active) return null;

  return (
    <mesh ref={dropRef} position={[0, 3.5, 0]}>
      <sphereGeometry args={[0.15, 12, 12]} />
      <meshBasicMaterial color={targetColor} />
    </mesh>
  );
}

// --- pH PROBE MODEL ---
function PHProbe({ active, isLowered, measuredPH }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Animate the probe lowering or raising
    const targetY = isLowered ? -0.2 : 2.5;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.1;
  });

  if (!active) return null;

  return (
    <group ref={groupRef} position={[0, 2.5, 0]}>
      {/* Probe Handle */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 1.5, 16]} />
        <meshStandardMaterial color="#475569" roughness={0.4} />
      </mesh>

      {/* Probe Rod */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Glass Electrode Tip */}
      <mesh position={[0, -0.3, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshPhysicalMaterial 
          color="#38bdf8" 
          transparent 
          opacity={0.8} 
          roughness={0.1} 
          emissive="#06b6d4" 
          emissiveIntensity={0.5} 
        />
      </mesh>

      {/* Probe Wire going off-screen */}
      <mesh position={[0, 2.5, 0.3]} rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>

      {/* Interactive Display overlay near beaker */}
      {isLowered && Math.abs(groupRef.current.position.y - (-0.2)) < 0.1 && (
        <Html distanceFactor={6} position={[0, 1.8, 0]} center>
          <div className="bg-slate-950/95 border border-brand-cyan/40 text-brand-cyan px-2.5 py-1 rounded-md text-[10px] font-mono shadow-[0_0_8px_rgba(6,182,212,0.3)] select-none whitespace-nowrap animate-pulse">
            Probe: <span className="font-bold text-white text-xs">{measuredPH.toFixed(2)}</span> pH
          </div>
        </Html>
      )}
    </group>
  );
}

// --- MOLECULAR PARTICLES ANIMATION ---
function MolecularParticles({ activeSolution, showWater, onHoverParticle }) {
  const [particles, setParticles] = useState([]);
  const pRefs = useRef([]);

  useEffect(() => {
    const pData = SOLUTIONS[activeSolution];
    if (!pData) return;

    const newParticles = [];
    let idCounter = 0;

    // Helper to generate particle position inside a sphere
    const getPos = () => {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      // Bound within beaker radius 1.7, height from -1.3 to 0.4
      const r = Math.pow(Math.random(), 0.8) * 1.6;
      return new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        Math.random() * 1.5 - 1.0, // height Y between -1.0 and 0.5
        r * Math.cos(phi)
      );
    };

    // Helper to generate random velocity
    const getVel = () => {
      const speed = 0.2 + Math.random() * 0.3;
      return new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize().multiplyScalar(speed);
    };

    const counts = pData.particles;

    // 1. Hydronium ions (glowing red spheres)
    for (let i = 0; i < (counts.hydronium || 0); i++) {
      newParticles.push({
        id: idCounter++,
        pos: getPos(),
        vel: getVel(),
        type: 'H3O',
        color: '#f87171',
        size: 0.12,
        name: 'Hydronium Ion (H₃O⁺)',
        desc: 'Acid carrier ion. Forms when H⁺ proton binds to a water molecule.'
      });
    }

    // 2. Hydroxide ions (glowing purple spheres)
    for (let i = 0; i < (counts.hydroxide || 0); i++) {
      newParticles.push({
        id: idCounter++,
        pos: getPos(),
        vel: getVel(),
        type: 'OH',
        color: '#c084fc',
        size: 0.12,
        name: 'Hydroxide Ion (OH⁻)',
        desc: 'Base carrier ion. Increases the pH and basicity of the solution.'
      });
    }

    // 3. Acid anions / Base cations (green or orange spheres)
    const ionName = pData.type === 'acid' ? 'Conjugate Anion' : 'Conjugate Cation';
    const ionSymbol = pData.type === 'acid'
      ? (activeSolution === 'hcl' ? 'Cl⁻' : activeSolution === 'h2so4' ? 'HSO₄⁻' : activeSolution === 'citric' ? 'Citrate⁻' : 'CH₃COO⁻')
      : (activeSolution === 'soap' ? 'Na⁺' : activeSolution === 'ammonia' ? 'NH₄⁺' : 'Na⁺');
    const ionColor = pData.type === 'acid' ? '#4ade80' : '#fb923c';

    const ionCounts = pData.type === 'acid' ? counts.anions : counts.cations;
    for (let i = 0; i < (ionCounts || 0); i++) {
      newParticles.push({
        id: idCounter++,
        pos: getPos(),
        vel: getVel(),
        type: 'ion',
        color: ionColor,
        size: 0.14,
        name: `${ionName} (${ionSymbol})`,
        desc: `Counter-ion left in solution after parent molecule dissociates/ionizes.`
      });
    }

    // 4. Intact molecules (grey cluster)
    for (let i = 0; i < (counts.molecules || 0); i++) {
      const molName = pData.formula;
      newParticles.push({
        id: idCounter++,
        pos: getPos(),
        vel: getVel(),
        type: 'molecule',
        color: '#94a3b8',
        size: 0.19,
        name: `Intact Molecule (${molName})`,
        desc: 'Undissociated acid/base molecule. Remains un-ionized in weak solutions.'
      });
    }

    // 5. Water molecules (light transparent blue)
    if (showWater) {
      const waterCount = counts.water || 12;
      for (let i = 0; i < waterCount; i++) {
        newParticles.push({
          id: idCounter++,
          pos: getPos(),
          vel: getVel(),
          type: 'water',
          color: '#38bdf8',
          size: 0.1,
          name: 'Water Molecule (H₂O)',
          desc: 'The solvent molecule. Acts as the reaction medium.'
        });
      }
    }

    setParticles(newParticles);
    pRefs.current = new Array(newParticles.length);
  }, [activeSolution, showWater]);

  // Update loop
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    pRefs.current.forEach((ref, index) => {
      if (!ref || !particles[index]) return;

      const p = particles[index];
      // Update position
      p.pos.addScaledVector(p.vel, dt * 1.2);

      // Sphere boundary collision check (radius 1.7, Y boundary between -1.4 and 0.5)
      const horizontalDist = Math.sqrt(p.pos.x * p.pos.x + p.pos.z * p.pos.z);
      if (horizontalDist > 1.75) {
        // Reflect velocity horizontally
        const normal = new THREE.Vector3(p.pos.x, 0, p.pos.z).normalize();
        p.vel.reflect(normal).multiplyScalar(0.98);
        
        // Push slightly back
        const newHorizontal = normal.multiplyScalar(1.73);
        p.pos.x = newHorizontal.x;
        p.pos.z = newHorizontal.z;
      }

      if (p.pos.y < -1.4 || p.pos.y > 0.5) {
        p.vel.y = -p.vel.y;
        p.pos.y = Math.max(-1.38, Math.min(0.48, p.pos.y));
      }

      // Apply to Three.js ref
      ref.position.copy(p.pos);
    });
  });

  return (
    <group position={[0, -0.8, 0]}>
      {particles.map((p, idx) => (
        <mesh 
          key={p.id} 
          ref={el => pRefs.current[idx] = el}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHoverParticle(p);
          }}
          onPointerOut={() => onHoverParticle(null)}
        >
          <sphereGeometry args={[p.size, 12, 12]} />
          <meshStandardMaterial 
            color={p.color} 
            emissive={p.color}
            emissiveIntensity={p.type === 'H3O' || p.type === 'OH' ? 0.5 : 0.1}
            roughness={0.1}
            transparent={p.type === 'water'}
            opacity={p.type === 'water' ? 0.25 : 0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

// --- MAIN SIMULATOR COMPONENT ---
export default function PHScaleSimulator() {
  const [activeTab, setActiveTab] = useState('lab'); // 'lab' | 'ionization'
  const [activeSolution, setActiveSolution] = useState('hcl');
  const [hasIndicator, setHasIndicator] = useState(false);
  const [indicatorFalling, setIndicatorFalling] = useState(false);
  const [hasProbe, setHasProbe] = useState(false);
  const [isProbeLowered, setIsProbeLowered] = useState(false);
  
  // Particle Options
  const [showWater, setShowWater] = useState(true);
  const [hoveredParticle, setHoveredParticle] = useState(null);

  // Auto Reset state on solution change
  useEffect(() => {
    setHasIndicator(false);
    setIndicatorFalling(false);
    setIsProbeLowered(false);
  }, [activeSolution]);

  const sol = SOLUTIONS[activeSolution];

  const handleAddIndicator = () => {
    if (hasIndicator || indicatorFalling) return;
    setIndicatorFalling(true);
    setTimeout(() => {
      setIndicatorFalling(false);
      setHasIndicator(true);
    }, 800); // match animation length
  };

  const handleToggleProbe = () => {
    if (!hasProbe) {
      setHasProbe(true);
      // Give buffer before lowering
      setTimeout(() => setIsProbeLowered(true), 300);
    } else {
      setIsProbeLowered(!isProbeLowered);
    }
  };

  // Get indicator color code
  const getIndicatorColor = (ph) => {
    // Red (0) -> Green (7) -> Violet (14)
    if (ph <= 3) return 'from-red-600 to-orange-500';
    if (ph <= 5) return 'from-orange-500 to-yellow-400';
    if (ph <= 7) return 'from-yellow-400 to-green-500';
    if (ph <= 10) return 'from-green-500 to-blue-500';
    return 'from-blue-500 to-purple-600';
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-purple/10 border border-brand-purple/20">
            <Droplets className="h-5 w-5 text-brand-purple animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-wide text-white uppercase">Virtual pH & Ionization Lab</h2>
            <p className="text-[10px] text-gray-400">Measure acidity and visualize molecular dissociation in real-time</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-white/5">
          <button 
            onClick={() => setActiveTab('lab')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'lab' 
                ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/20' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Virtual pH Beaker
          </button>
          <button 
            onClick={() => setActiveTab('ionization')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'ionization' 
                ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/20' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Ionization View
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: 3D Scene */}
        <div className="flex-1 relative bg-gradient-to-b from-slate-950 to-slate-900">
          
          <Canvas camera={{ position: [0, 1.2, 5], fov: 45 }}>
            <ambientLight intensity={1.5} />
            <pointLight position={[10, 10, 10]} intensity={1.2} />
            <pointLight position={[-10, 5, -10]} intensity={0.5} />
            <directionalLight position={[0, 5, 5]} intensity={0.8} />

            {/* Beaker and fluids */}
            <BeakerModel 
              color={sol.color} 
              fillLevel={2.2} 
              hasIndicator={hasIndicator}
              indicatorFalling={indicatorFalling}
            />

            {/* Probe element */}
            <PHProbe 
              active={hasProbe} 
              isLowered={isProbeLowered} 
              measuredPH={sol.pH} 
            />

            {/* Render particles in Ionization tab, or small preview in lab tab */}
            {(activeTab === 'ionization' || hasIndicator) && (
              <MolecularParticles 
                activeSolution={activeSolution}
                showWater={showWater}
                onHoverParticle={setHoveredParticle}
              />
            )}

            <OrbitControls 
              enableDamping 
              dampingFactor={0.05}
              minDistance={3.5}
              maxDistance={7.5}
              maxPolarAngle={Math.PI / 2 + 0.1}
            />
          </Canvas>

          {/* Particle Hover details overlay */}
          {activeTab === 'ionization' && hoveredParticle && (
            <div className="absolute top-4 left-4 p-3 bg-slate-950/90 border border-white/10 rounded-xl max-w-[200px] text-[10px] font-mono shadow-xl backdrop-blur animate-fade-in">
              <span className="font-extrabold block text-xs" style={{ color: hoveredParticle.color }}>
                {hoveredParticle.name}
              </span>
              <p className="text-gray-300 mt-1 leading-normal">{hoveredParticle.desc}</p>
            </div>
          )}

          {/* Quick instructions indicator overlay */}
          <div className="absolute bottom-4 left-4 flex gap-2.5 items-center bg-slate-900/60 backdrop-blur border border-white/5 rounded-full px-3 py-1.5 text-[9px] text-gray-400">
            <Info className="h-3 w-3 text-brand-purple" />
            <span>Drag to rotate, scroll to zoom</span>
          </div>

          {/* Floating badge for Solution */}
          <div className="absolute top-4 right-4 flex flex-col items-end">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Solution</span>
            <span className="text-base font-extrabold text-white flex items-center gap-1.5">
              {sol.name} 
              <span className="text-xs font-mono text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded border border-brand-purple/20">
                {sol.formula}
              </span>
            </span>
          </div>
        </div>

        {/* Right Side: Control Panels & Live Data */}
        <div className="w-[340px] border-l border-white/5 flex flex-col bg-slate-950 overflow-y-auto scrollbar-thin">
          
          {/* Solution Selector */}
          <div className="p-4 border-b border-white/5 bg-slate-900/20">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2.5">
              Select Solution to Test
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.keys(SOLUTIONS).map((key) => {
                const s = SOLUTIONS[key];
                const active = activeSolution === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveSolution(key)}
                    className={`px-2.5 py-1.5 rounded-lg text-left text-[11px] font-bold border transition-all ${
                      active
                        ? 'bg-brand-purple/15 text-brand-purple border-brand-purple/30 shadow-inner'
                        : 'bg-white/5 text-gray-300 border-white/5 hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    <div className="truncate">{s.name}</div>
                    <div className="text-[9px] text-gray-500 font-mono">{s.formula}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Simulator Controls */}
          {activeTab === 'lab' ? (
            <div className="p-4 border-b border-white/5 space-y-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                Lab Tools
              </span>

              {/* Add Indicator Action */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-300">pH Indicator dye</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    hasIndicator ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {hasIndicator ? 'Added' : 'Missing'}
                  </span>
                </div>
                <button
                  onClick={handleAddIndicator}
                  disabled={hasIndicator || indicatorFalling}
                  className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    hasIndicator 
                      ? 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed' 
                      : 'bg-brand-purple hover:bg-brand-purple-hover text-white'
                  }`}
                >
                  <Droplets className="h-4 w-4" />
                  {indicatorFalling ? 'Dropping dye...' : hasIndicator ? 'Dye already added' : 'Add Universal Indicator'}
                </button>
              </div>

              {/* pH Probe Action */}
              <div className="space-y-2 border-t border-white/5 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-300">pH Meter Probe</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    isProbeLowered ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                  }`}>
                    {isProbeLowered ? 'Lowered' : 'Raised'}
                  </span>
                </div>
                <button
                  onClick={handleToggleProbe}
                  className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    isProbeLowered
                      ? 'bg-slate-900 border-white/10 text-white hover:bg-slate-800'
                      : 'bg-brand-cyan/10 border-brand-cyan/25 text-brand-cyan hover:bg-brand-cyan/20'
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  {isProbeLowered ? 'Retract pH Probe' : 'Lower pH Probe'}
                </button>
              </div>
            </div>
          ) : (
            // Ionization View Controls
            <div className="p-4 border-b border-white/5 space-y-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                Particle View Settings
              </span>
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-all border border-white/5">
                <span className="text-xs font-semibold text-gray-300">Show Water Molecules (H₂O)</span>
                <button 
                  onClick={() => setShowWater(!showWater)}
                  className="text-gray-400 hover:text-white"
                >
                  {showWater ? <Eye className="h-4 w-4 text-brand-cyan" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </label>

              <div className="p-3 bg-brand-purple/5 border border-brand-purple/10 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-brand-purple uppercase tracking-wider block">
                  How to inspect
                </span>
                <p className="text-[10px] text-gray-400 leading-normal">
                  Hover over the bouncing particles in the 3D beaker to learn their chemical names and characteristics.
                </p>
              </div>
            </div>
          )}

          {/* Live Analysis Display */}
          <div className="p-4 flex-1 space-y-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
              Live Analysis & Data
            </span>

            {/* pH Meter Gauge */}
            <div className="p-3.5 bg-slate-900/60 border border-white/5 rounded-xl space-y-2 shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">pH Value</span>
                <span className="text-[9px] font-bold text-gray-500 font-mono">0 (Acid) → 14 (Base)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-black font-mono tracking-tight text-white">
                  {isProbeLowered ? sol.pH.toFixed(1) : '—'}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-2 rounded-full overflow-hidden bg-slate-950 flex relative border border-white/5">
                    {/* pH continuous indicator color bar */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-300 via-green-500 via-blue-500 to-purple-600 opacity-60"></div>
                    {isProbeLowered && (
                      <div 
                        className="absolute h-full w-1 bg-white border border-slate-950 shadow-[0_0_4px_white] transition-all duration-300"
                        style={{ left: `${(sol.pH / 14) * 100}%` }}
                      ></div>
                    )}
                  </div>
                  <div className="flex justify-between text-[8px] font-mono text-gray-500">
                    <span>Acid</span>
                    <span>7.0</span>
                    <span>Alkali</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ion Concentrations */}
            <div className="grid grid-cols-2 gap-2.5 font-mono">
              <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl space-y-0.5">
                <span className="text-[8px] text-red-400 font-bold uppercase block">
                  [H₃O⁺] Hydronium
                </span>
                <span className="text-xs font-black text-white">
                  {isProbeLowered ? `1.0 × 10⁻${sol.pH.toFixed(1)} M` : '—'}
                </span>
              </div>
              <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl space-y-0.5">
                <span className="text-[8px] text-purple-400 font-bold uppercase block">
                  [OH⁻] Hydroxide
                </span>
                <span className="text-xs font-black text-white">
                  {isProbeLowered ? `1.0 × 10⁻${(14 - sol.pH).toFixed(1)} M` : '—'}
                </span>
              </div>
            </div>

            {/* Classification Card */}
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
              <div className="flex justify-between items-center text-[10px] text-gray-400">
                <span>Classification:</span>
                <span className={`font-extrabold uppercase px-2 py-0.5 rounded text-[8px] font-mono ${
                  sol.type === 'acid' 
                    ? sol.strength === 'Strong Acid' ? 'bg-red-500/10 text-red-400 border border-red-500/25' : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                    : sol.type === 'neutral' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-blue-500/10 text-blue-400 border border-blue-500/25'
                }`}>
                  {sol.strength}
                </span>
              </div>
              <div className="text-[10px] text-gray-400 flex justify-between items-center font-mono border-t border-white/5 pt-1.5 mt-1.5">
                <span>Dissociation Ka:</span>
                <span className="text-white font-bold">{sol.ka}</span>
              </div>
            </div>

            {/* Chemical Equation */}
            <div className="p-3 bg-slate-900 border border-white/10 rounded-xl space-y-1.5">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                Chemical Dissociation Equation
              </span>
              <div className="text-xs font-mono text-brand-cyan bg-slate-950 p-2 rounded border border-white/5 text-center break-words select-all">
                {sol.equation}
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed pt-0.5">
                {sol.desc}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
