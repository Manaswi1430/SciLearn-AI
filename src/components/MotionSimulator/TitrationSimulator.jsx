import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { 
  Play, Pause, RotateCcw, Droplets, Info, Activity, 
  Check, RefreshCw, HelpCircle, BarChart2, Award, Zap, AlertCircle 
} from 'lucide-react';

// --- CHEMICALS CONFIGURATION ---
const ACIDS = {
  hcl: { id: 'hcl', name: 'Hydrochloric Acid', formula: 'HCl', type: 'strong', ka: 1e7, desc: 'A strong monoprotic mineral acid that dissociates completely.' },
  acetic: { id: 'acetic', name: 'Acetic Acid', formula: 'CH₃COOH', type: 'weak', ka: 1.8e-5, desc: 'A weak organic acid that dissociates partially in water.' },
  citric: { id: 'citric', name: 'Citric Acid', formula: 'C₆H₈O₇', type: 'weak', ka: 7.4e-4, desc: 'A weak organic acid that dissociates partially (simulated monoprotic).' }
};

const BASES = {
  naoh: { id: 'naoh', name: 'Sodium Hydroxide', formula: 'NaOH', type: 'strong', kb: 1e7, desc: 'A strong monobasic alkali that dissociates completely.' }
};

const INDICATORS = {
  phenolphthalein: {
    id: 'phenolphthalein',
    name: 'Phenolphthalein',
    transitionRange: [8.2, 10.0],
    getColor: (ph) => {
      if (ph < 8.2) return { hex: '#f8fafc', opacity: 0.15 }; // colorless/clear
      if (ph > 10.0) return { hex: '#db2777', opacity: 0.8 }; // fuchsia pink
      // Interpolate
      const pct = (ph - 8.2) / (10.0 - 8.2);
      const color = new THREE.Color('#f8fafc').lerp(new THREE.Color('#db2777'), pct);
      return { hex: color.getStyle(), opacity: 0.15 + pct * 0.65 };
    }
  },
  methylOrange: {
    id: 'methylOrange',
    name: 'Methyl Orange',
    transitionRange: [3.1, 4.4],
    getColor: (ph) => {
      if (ph < 3.1) return { hex: '#ef4444', opacity: 0.75 }; // red
      if (ph > 4.4) return { hex: '#eab308', opacity: 0.75 }; // yellow
      // Interpolate
      const pct = (ph - 3.1) / (4.4 - 3.1);
      const color = new THREE.Color('#ef4444').lerp(new THREE.Color('#eab308'), pct);
      return { hex: color.getStyle(), opacity: 0.75 };
    }
  },
  bromothymolBlue: {
    id: 'bromothymolBlue',
    name: 'Bromothymol Blue',
    transitionRange: [6.0, 7.6],
    getColor: (ph) => {
      if (ph < 6.0) return { hex: '#eab308', opacity: 0.75 }; // yellow
      if (ph > 7.6) return { hex: '#2563eb', opacity: 0.75 }; // blue
      // Interpolate
      const pct = (ph - 6.0) / (7.6 - 6.0);
      const color = new THREE.Color('#eab308').lerp(new THREE.Color('#2563eb'), pct);
      return { hex: color.getStyle(), opacity: 0.75 };
    }
  }
};

// --- MATHEMATICAL pH MODEL ---
const calculatePH = (acidId, acidConc, baseConc, acidVol, baseVol) => {
  const Va = acidVol / 1000; // L
  const Vb = baseVol / 1000; // L
  const Ca = acidConc;
  const Cb = baseConc;
  
  const molesA_initial = Ca * Va;
  const molesB_added = Cb * Vb;
  const totalVol = Va + Vb;

  const acid = ACIDS[acidId];
  const Ka = acid.ka;
  const Kw = 1e-14;

  if (acid.type === 'strong') {
    // HCl + NaOH
    if (molesA_initial > molesB_added) {
      const excessH = (molesA_initial - molesB_added) / totalVol;
      return Math.max(1.0, -Math.log10(excessH));
    } else if (Math.abs(molesA_initial - molesB_added) < 1e-9) {
      return 7.0;
    } else {
      const excessOH = (molesB_added - molesA_initial) / totalVol;
      const pOH = -Math.log10(excessOH);
      return Math.min(13.0, 14.0 - pOH);
    }
  } else {
    // Weak Acid (HA) + Strong Base (NaOH)
    // Reaction: HA + OH- -> A- + H2O
    if (baseVol === 0) {
      // Pure weak acid
      const H = Math.sqrt(Ka * Ca);
      return -Math.log10(H);
    }

    if (molesA_initial > molesB_added) {
      // Buffer region
      const molesHA = molesA_initial - molesB_added;
      const molesA_minus = molesB_added;
      const pH = -Math.log10(Ka) + Math.log10(molesA_minus / molesHA);
      return Math.max(1.0, pH);
    } else if (Math.abs(molesA_initial - molesB_added) < 1e-9) {
      // Equivalence point: only conjugate base A- present
      const concConjugateBase = molesA_initial / totalVol;
      const Kb = Kw / Ka;
      const OH = Math.sqrt(Kb * concConjugateBase);
      const pOH = -Math.log10(OH);
      return 14.0 - pOH;
    } else {
      // Post equivalence: excess strong base OH- determines pH
      const excessOH = (molesB_added - molesA_initial) / totalVol;
      const pOH = -Math.log10(excessOH);
      return Math.min(13.0, 14.0 - pOH);
    }
  }
};

// --- 3D LAB APPARATUS ---
function LabApparatus({ volumeAdded, flowRate, indicatorColor, indicatorAdded }) {
  const buretteLiquidHeight = Math.max(0, (50 - volumeAdded) / 50 * 2.8);
  const flaskLiquidHeight = 0.3 + (volumeAdded / 50) * 0.7; // grows from 0.3 to 1.0

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Burette stand & clamp */}
      <group position={[-0.8, -0.2, -0.5]}>
        {/* Metal base */}
        <mesh position={[0.8, -1.8, 0.2]}>
          <boxGeometry args={[1.8, 0.08, 1.2]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Stand vertical rod */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 4.4, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Burette Clamp arms */}
        <mesh position={[0.4, 1.2, 0.5]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        <mesh position={[0.4, -0.2, 0.5]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
      </group>

      {/* 2. Burette Glass Tube */}
      <group position={[0, 1.3, 0]}>
        {/* Burette Body */}
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 3.2, 16, 1, true]} />
          <meshPhysicalMaterial 
            color="#ffffff" transparent opacity={0.25} roughness={0.05} 
            transmission={0.9} thickness={0.02} side={THREE.DoubleSide} 
          />
        </mesh>
        
        {/* Burette Base Tip */}
        <mesh position={[0, -1.8, 0]}>
          <cylinderGeometry args={[0.08, 0.02, 0.4, 16]} />
          <meshPhysicalMaterial 
            color="#ffffff" transparent opacity={0.25} roughness={0.05} 
            transmission={0.9} thickness={0.02}
          />
        </mesh>

        {/* Stopcock valve knob */}
        <mesh position={[0, -1.6, 0.08]} rotation={[0, flowRate > 0 ? Math.PI / 2 : 0, 0]}>
          <boxGeometry args={[0.06, 0.12, 0.15]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} />
        </mesh>

        {/* Liquid Column inside Burette (Base titrant) */}
        {buretteLiquidHeight > 0 && (
          <mesh position={[0, -1.6 + buretteLiquidHeight / 2, 0]}>
            <cylinderGeometry args={[0.076, 0.076, buretteLiquidHeight, 16]} />
            <meshPhysicalMaterial 
              color="#38bdf8" transparent opacity={0.45} roughness={0.1} 
              transmission={0.8} 
            />
          </mesh>
        )}

        {/* Graduated markings */}
        {Array.from({ length: 6 }).map((_, i) => {
          const height = -1.2 + i * 0.5;
          const markVol = i * 10;
          return (
            <group key={i} position={[0, height, 0]}>
              <mesh position={[0.082, 0, 0]}>
                <boxGeometry args={[0.02, 0.008, 0.03]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
              </mesh>
              <Html distanceFactor={6} position={[0.18, 0, 0]} center>
                <span className="text-[7px] font-mono text-gray-400 select-none">{markVol}</span>
              </Html>
            </group>
          );
        })}
      </group>

      {/* 3. Erlenmeyer Flask */}
      <group position={[0, -1.3, 0]}>
        {/* Flask Glass body */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.22, 0.9, 1.2, 32, 1, true]} />
          <meshPhysicalMaterial 
            color="#ffffff" transparent opacity={0.2} roughness={0.05} 
            transmission={0.95} thickness={0.03} side={THREE.DoubleSide} 
          />
        </mesh>
        {/* Flask neck */}
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.4, 32, 1, true]} />
          <meshPhysicalMaterial 
            color="#ffffff" transparent opacity={0.2} roughness={0.05} 
            transmission={0.95} thickness={0.03} side={THREE.DoubleSide} 
          />
        </mesh>
        {/* Flask rim */}
        <mesh position={[0, 1.1, 0]}>
          <torusGeometry args={[0.22, 0.02, 8, 32]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.3} roughness={0.1} />
        </mesh>
        {/* Flask base */}
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.03, 32]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.25} roughness={0.1} />
        </mesh>

        {/* Liquid inside the Flask */}
        <mesh position={[0, -0.4 + flaskLiquidHeight / 2, 0]}>
          <cylinderGeometry args={[0.22 + (1.0 - flaskLiquidHeight) * 0.15, 0.88, flaskLiquidHeight, 32]} />
          <meshPhysicalMaterial 
            color={indicatorAdded ? indicatorColor.hex : '#ffffff'} 
            transparent 
            opacity={indicatorAdded ? indicatorColor.opacity : 0.15} 
            roughness={0.15} 
            transmission={indicatorAdded ? 0.5 : 0.95}
          />
        </mesh>
      </group>

      {/* 4. Falling drop animation */}
      {flowRate > 0 && (
        <DropFlow flowRate={flowRate} />
      )}
    </group>
  );
}

// --- DROP EMITTER ANIMATION ---
function DropFlow({ flowRate }) {
  const dropsRef = useRef([]);
  const [drops, setDrops] = useState([]);

  useEffect(() => {
    // Reset drops
    setDrops([]);
    dropsRef.current = [];
  }, [flowRate]);

  useFrame((state) => {
    // Spawn drops based on flow rate
    let spawnChance = 0.03;
    if (flowRate === 2) spawnChance = 0.15;
    if (flowRate === 3) spawnChance = 0.5;

    if (Math.random() < spawnChance && drops.length < 8) {
      setDrops(prev => [
        ...prev,
        { id: Math.random(), y: -0.3, speed: 0.08 + Math.random() * 0.04 }
      ]);
    }

    // Animate falling
    setDrops(prev => 
      prev
        .map(d => ({ ...d, y: d.y - d.speed }))
        .filter(d => d.y > -0.6) // hits flask surface
    );
  });

  return (
    <group>
      {drops.map(d => (
        <mesh key={d.id} position={[0, d.y, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      ))}
    </group>
  );
}

// --- MOLECULAR DISSOCIATION / NEUTRALIZATION PARTICLES ---
function TitrationParticles({ activeSolution, volumeAdded, pH, indicatorAdded }) {
  const [particles, setParticles] = useState([]);
  const pRefs = useRef([]);

  useEffect(() => {
    const newParticles = [];
    let idCounter = 0;

    const getPos = () => {
      const r = Math.pow(Math.random(), 0.7) * 0.7;
      const theta = Math.random() * Math.PI * 2;
      // Flask liquid layer lies around y = -1.6 to -0.9
      return new THREE.Vector3(
        r * Math.cos(theta),
        -1.6 + Math.random() * 0.6,
        r * Math.sin(theta)
      );
    };

    // Base initial species:
    // For Acid: H+ (Hydronium) and conjugate anions (Cl- or acetate)
    const acidCount = 10;
    const isHCl = activeSolution === 'hcl';

    // 1. Acid protons H+ (red)
    // Reduce H+ count as titration proceeds (neutralization!)
    // Equivalence point volume is usually around 25mL if concentrations are matched.
    const neutralizationProgress = Math.min(1.0, volumeAdded / 25.0);
    const activeHCount = Math.max(0, Math.round(acidCount * (1.0 - neutralizationProgress)));

    for (let i = 0; i < activeHCount; i++) {
      newParticles.push({
        id: idCounter++,
        pos: getPos(),
        vel: new THREE.Vector3((Math.random() - 0.5)*0.2, (Math.random() - 0.5)*0.1, (Math.random() - 0.5)*0.2),
        type: 'H',
        color: '#ef4444',
        size: 0.05,
        name: 'H⁺ Ion (Hydronium)'
      });
    }

    // 2. Anions (Cl- or CH3COO-) - stable count throughout
    const anionSymbol = isHCl ? 'Cl⁻' : 'CH₃COO⁻';
    const anionColor = isHCl ? '#10b981' : '#f59e0b';
    for (let i = 0; i < acidCount; i++) {
      newParticles.push({
        id: idCounter++,
        pos: getPos(),
        vel: new THREE.Vector3((Math.random() - 0.5)*0.15, (Math.random() - 0.5)*0.1, (Math.random() - 0.5)*0.15),
        type: 'anion',
        color: anionColor,
        size: 0.065,
        name: anionSymbol
      });
    }

    // 3. Added Base cations (Na+) - increases as we drop NaOH
    const baseCationsCount = Math.round(acidCount * neutralizationProgress);
    for (let i = 0; i < baseCationsCount; i++) {
      newParticles.push({
        id: idCounter++,
        pos: getPos(),
        vel: new THREE.Vector3((Math.random() - 0.5)*0.15, (Math.random() - 0.5)*0.1, (Math.random() - 0.5)*0.15),
        type: 'Na',
        color: '#fb923c',
        size: 0.065,
        name: 'Na⁺ Cation'
      });
    }

    // 4. Excess Base anions (OH-) - only appear AFTER equivalence point
    if (volumeAdded > 25.0) {
      const excessOHCount = Math.round((volumeAdded - 25.0) / 25.0 * acidCount * 1.5);
      for (let i = 0; i < Math.min(12, excessOHCount); i++) {
        newParticles.push({
          id: idCounter++,
          pos: getPos(),
          vel: new THREE.Vector3((Math.random() - 0.5)*0.2, (Math.random() - 0.5)*0.1, (Math.random() - 0.5)*0.2),
          type: 'OH',
          color: '#a855f7',
          size: 0.05,
          name: 'OH⁻ Ion (Hydroxide)'
        });
      }
    }

    // 5. Water molecules (H2O) formed by neutralization - count grows
    const waterFormedCount = Math.round(acidCount * neutralizationProgress);
    for (let i = 0; i < waterFormedCount; i++) {
      newParticles.push({
        id: idCounter++,
        pos: getPos(),
        vel: new THREE.Vector3((Math.random() - 0.5)*0.1, (Math.random() - 0.5)*0.08, (Math.random() - 0.5)*0.1),
        type: 'H2O',
        color: '#06b6d4',
        size: 0.045,
        name: 'H₂O (Water Molecule)'
      });
    }

    setParticles(newParticles);
    pRefs.current = new Array(newParticles.length);
  }, [activeSolution, volumeAdded, pH]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    pRefs.current.forEach((ref, index) => {
      if (!ref || !particles[index]) return;
      const p = particles[index];

      // Update position
      p.pos.addScaledVector(p.vel, dt * 1.5);

      // Boundary bounds inside flask base cylinder (radius 0.7, y in -1.6 to -1.0)
      const dist = Math.sqrt(p.pos.x * p.pos.x + p.pos.z * p.pos.z);
      if (dist > 0.75) {
        const normal = new THREE.Vector3(p.pos.x, 0, p.pos.z).normalize();
        p.vel.reflect(normal);
        p.pos.x = normal.x * 0.73;
        p.pos.z = normal.z * 0.73;
      }

      if (p.pos.y < -1.65 || p.pos.y > -0.85) {
        p.vel.y = -p.vel.y;
        p.pos.y = Math.max(-1.64, Math.min(-0.86, p.pos.y));
      }

      ref.position.copy(p.pos);
    });
  });

  return (
    <group>
      {particles.map((p, idx) => (
        <mesh key={p.id} ref={el => pRefs.current[idx] = el}>
          <sphereGeometry args={[p.size, 10, 10]} />
          <meshBasicMaterial color={p.color} transparent={p.type === 'H2O'} opacity={p.type === 'H2O' ? 0.35 : 0.9} />
        </mesh>
      ))}
    </group>
  );
}

// --- MAIN TITRATION SIMULATOR ---
export default function TitrationSimulator() {
  const [activeAcid, setActiveAcid] = useState('hcl');
  const [activeBase] = useState('naoh');
  const [acidConcentration, setAcidConcentration] = useState(0.1); // M
  const [baseConcentration, setBaseConcentration] = useState(0.1); // M
  const [acidVolume] = useState(25.0); // mL in flask
  
  const [volumeAdded, setVolumeAdded] = useState(0.0); // mL base added
  const [flowRate, setFlowRate] = useState(0); // 0=off, 1=drop (0.1 mL/s), 2=slow (0.5 mL/s), 3=fast (2.5 mL/s)
  const [indicatorAdded, setIndicatorAdded] = useState(false);
  const [activeIndicator, setActiveIndicator] = useState('phenolphthalein');
  const [pH, setPH] = useState(1.0);
  const [titrationCurve, setTitrationCurve] = useState([{ volume: 0, pH: 1.0 }]);
  const [isTitrating, setIsTitrating] = useState(false);
  
  // Interactive tasks system
  const [currentTask, setCurrentTask] = useState('find-equivalence'); // 'find-equivalence' | 'find-concentration' | 'find-volume'
  const [taskState, setTaskState] = useState({
    targetConcentration: 0.125, // randomized for Task 2
    targetVolume: 31.25,
    userAnswer: '',
    checked: false,
    correct: null,
    attempts: 0
  });

  // Calculate live pH
  useEffect(() => {
    const computedPH = calculatePH(activeAcid, acidConcentration, baseConcentration, acidVolume, volumeAdded);
    setPH(computedPH);
  }, [activeAcid, acidConcentration, baseConcentration, acidVolume, volumeAdded]);

  // Update Titration Curve plot points
  useEffect(() => {
    // Regenerate whole curve up to current volumeAdded for accuracy
    const points = [];
    for (let v = 0; v <= volumeAdded; v += 0.5) {
      points.push({
        volume: v,
        pH: calculatePH(activeAcid, acidConcentration, baseConcentration, acidVolume, v)
      });
    }
    // Add exact final point
    if (points[points.length - 1]?.volume !== volumeAdded) {
      points.push({ volume: volumeAdded, pH: pH });
    }
    setTitrationCurve(points);
  }, [volumeAdded, pH, activeAcid, acidConcentration, baseConcentration, acidVolume]);

  // Titration flow ticker
  useEffect(() => {
    let timer;
    if (flowRate > 0) {
      setIsTitrating(true);
      timer = setInterval(() => {
        setVolumeAdded(prev => {
          let increments = [0, 0.05, 0.25, 1.25]; // matching flowRates
          let val = prev + increments[flowRate];
          if (val >= 50.0) {
            val = 50.0;
            setFlowRate(0); // auto shut off at 50 mL
          }
          return parseFloat(val.toFixed(2));
        });
      }, 250);
    } else {
      setIsTitrating(false);
    }

    return () => clearInterval(timer);
  }, [flowRate]);

  // Generate a randomized task when task changes
  useEffect(() => {
    handleReset();
    const randConc = parseFloat((0.08 + Math.random() * 0.12).toFixed(3)); // 0.080 to 0.200 M
    // V_base required = (M_acid * V_acid) / M_base
    const reqVol = parseFloat(((randConc * acidVolume) / baseConcentration).toFixed(2));
    setTaskState({
      targetConcentration: randConc,
      targetVolume: reqVol,
      userAnswer: '',
      checked: false,
      correct: null,
      attempts: 0
    });
  }, [currentTask]);

  const handleReset = () => {
    setVolumeAdded(0.0);
    setFlowRate(0);
    setIndicatorAdded(false);
    setPH(calculatePH(activeAcid, acidConcentration, baseConcentration, acidVolume, 0));
    setTitrationCurve([{ volume: 0, pH: calculatePH(activeAcid, acidConcentration, baseConcentration, acidVolume, 0) }]);
  };

  const checkAnswer = () => {
    const val = parseFloat(taskState.userAnswer);
    if (isNaN(val)) return;

    let isCorrect = false;
    let feedback = '';

    if (currentTask === 'find-equivalence') {
      // Equivalence volume for current setup = (M_acid * V_acid) / M_base
      const trueEquiv = (acidConcentration * acidVolume) / baseConcentration;
      isCorrect = Math.abs(val - trueEquiv) <= 0.3; // 0.3 mL tolerance
    } else if (currentTask === 'find-concentration') {
      // Find unknown concentration
      isCorrect = Math.abs(val - taskState.targetConcentration) <= 0.008; // small M tolerance
    } else if (currentTask === 'find-volume') {
      isCorrect = Math.abs(val - taskState.targetVolume) <= 0.4; // 0.4 mL tolerance
    }

    setTaskState(prev => ({
      ...prev,
      checked: true,
      correct: isCorrect,
      attempts: prev.attempts + 1
    }));
  };

  const getIndicatorColor = INDICATORS[activeIndicator].getColor(pH);

  // SVG Titration Curve coordinates calculator
  const getGraphPath = () => {
    if (titrationCurve.length === 0) return '';
    const width = 280;
    const height = 130;
    const margin = 20;

    // Map x: 0 -> 50 mL to 20 -> 260
    // Map y: 0 -> 14 pH to 110 -> 10 (flipped)
    const mapX = (vol) => margin + (vol / 50) * (width - margin * 2);
    const mapY = (val) => (height - margin) - (val / 14) * (height - margin * 2);

    return titrationCurve.map((pt, i) => {
      const x = mapX(pt.volume);
      const y = mapY(pt.pH);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // Equivalence volume
  const trueEquivalenceVol = currentTask === 'find-concentration' 
    ? taskState.targetVolume
    : (acidConcentration * acidVolume) / baseConcentration;

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-3.5 border-b border-white/5 bg-slate-900/40 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-purple/10 border border-brand-purple/20">
            <Activity className="h-5 w-5 text-brand-purple animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-wide text-white uppercase">Titration & Neutralization Lab</h2>
            <p className="text-[10px] text-gray-400">Titrate acids with NaOH, trace equivalence curves, and solve concentration tasks</p>
          </div>
        </div>

        {/* Task Selection Mode */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-white/5 self-stretch sm:self-auto">
          <button 
            onClick={() => setCurrentTask('find-equivalence')}
            className={`flex-1 sm:flex-initial px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
              currentTask === 'find-equivalence' 
                ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/20' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Find Equiv. Pt
          </button>
          <button 
            onClick={() => setCurrentTask('find-concentration')}
            className={`flex-1 sm:flex-initial px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
              currentTask === 'find-concentration' 
                ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/20' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Solve Unknown Conc.
          </button>
          <button 
            onClick={() => setCurrentTask('find-volume')}
            className={`flex-1 sm:flex-initial px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
              currentTask === 'find-volume' 
                ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/20' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Find Req. Vol.
          </button>
        </div>
      </div>

      {/* Main split display */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        
        {/* LEFT COLUMN: 3D laboratory canvas */}
        <div className="flex-1 min-h-[300px] lg:min-h-0 relative bg-gradient-to-b from-slate-950 to-slate-900">
          <Canvas camera={{ position: [0, 0, 3.8], fof: 45 }}>
            <ambientLight intensity={1.5} />
            <pointLight position={[10, 10, 10]} intensity={1.2} />
            <pointLight position={[-10, 5, -10]} intensity={0.5} />
            
            <LabApparatus 
              volumeAdded={volumeAdded} 
              flowRate={flowRate} 
              indicatorColor={getIndicatorColor}
              indicatorAdded={indicatorAdded}
            />

            <TitrationParticles 
              activeSolution={activeAcid} 
              volumeAdded={volumeAdded} 
              pH={pH}
              indicatorAdded={indicatorAdded}
            />

            <OrbitControls 
              enableDamping 
              minDistance={2.5} 
              maxDistance={6.0} 
              maxPolarAngle={Math.PI/2 + 0.15} 
            />
          </Canvas>

          {/* Quick chemistry overlay indicator */}
          <div className="absolute top-4 left-4 p-3 bg-slate-950/80 backdrop-blur-md border border-white/5 rounded-xl text-[10px] font-mono shadow-lg space-y-1">
            <span className="font-extrabold text-brand-purple block uppercase">Titration Species</span>
            <div className="text-gray-300">Burette (Titrant): <span className="text-brand-cyan font-bold">0.1M NaOH</span></div>
            <div className="text-gray-300">Flask (Analyte): <span className="text-pink-400 font-bold">
              {currentTask === 'find-concentration' 
                ? 'Unknown concentration' 
                : `${acidConcentration.toFixed(2)}M`} {ACIDS[activeAcid].formula}
            </span></div>
          </div>

          <div className="absolute bottom-4 left-4 flex gap-2.5 items-center bg-slate-900/60 backdrop-blur border border-white/5 rounded-full px-3 py-1 text-[9px] text-gray-400">
            <Info className="h-3 w-3 text-brand-purple" />
            <span>Drag to rotate, scroll to zoom apparatus</span>
          </div>

          {/* Liquid mixing / Swirling visual alert */}
          {flowRate > 0 && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-brand-cyan/15 border border-brand-cyan/20 rounded-full text-[9px] text-brand-cyan font-bold tracking-wide animate-pulse">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Mixing solution...</span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Controls, titration curves, tasks */}
        <div className="w-full lg:w-[360px] border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col bg-slate-950 overflow-y-auto scrollbar-thin">
          
          {/* Solution Parameters & Selection */}
          <div className="p-4 border-b border-white/5 space-y-3.5">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
              titration setup
            </span>

            {/* Acid Select */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold">Acid Solution (Flask)</label>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.keys(ACIDS).map(key => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveAcid(key);
                      handleReset();
                    }}
                    disabled={currentTask === 'find-concentration'}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      activeAcid === key
                        ? 'bg-brand-purple/15 text-brand-purple border-brand-purple/40 shadow-inner'
                        : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white disabled:opacity-30'
                    }`}
                  >
                    <div>{ACIDS[key].name.split(' ')[0]}</div>
                    <div className="text-[8px] opacity-60 font-mono">{ACIDS[key].formula}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Indicator Select */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold">pH Indicator Dye</label>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.keys(INDICATORS).map(key => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveIndicator(key);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      activeIndicator === key
                        ? 'bg-brand-purple/15 text-brand-purple border-brand-purple/40 shadow-inner'
                        : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {INDICATORS[key].name}
                  </button>
                ))}
              </div>
            </div>

            {/* Acid Concentration Slider (Hidden in task 2 since it's unknown!) */}
            {currentTask !== 'find-concentration' && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400 font-bold">Acid Concentration</span>
                  <span className="text-white font-bold font-mono">{acidConcentration.toFixed(2)} M</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.50"
                  step="0.01"
                  value={acidConcentration}
                  onChange={(e) => {
                    setAcidConcentration(parseFloat(e.target.value));
                    handleReset();
                  }}
                  className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-brand-purple"
                />
              </div>
            )}
          </div>

          {/* Flow Controls */}
          <div className="p-4 border-b border-white/5 space-y-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
              titration controls
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setIndicatorAdded(true)}
                disabled={indicatorAdded}
                className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold border flex items-center justify-center gap-1 transition-all ${
                  indicatorAdded
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 cursor-not-allowed'
                    : 'bg-brand-purple hover:bg-brand-purple/80 text-white border-transparent'
                }`}
              >
                <Droplets className="h-3 w-3" />
                {indicatorAdded ? 'Indicator Added' : 'Add Indicator'}
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl text-[10px] font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Flow rates toggle */}
            <div className="space-y-1">
              <label className="text-[9px] text-gray-400 uppercase tracking-wider block">Burette Valve Flow Rate</label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { val: 0, label: 'Stop' },
                  { val: 1, label: 'Drop' },
                  { val: 2, label: 'Slow' },
                  { val: 3, label: 'Fast' }
                ].map(r => (
                  <button
                    key={r.val}
                    onClick={() => {
                      if (!indicatorAdded && r.val > 0) {
                        alert("Please add the pH indicator dye first to observe the endpoint color change!");
                        return;
                      }
                      setFlowRate(r.val);
                    }}
                    className={`py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      flowRate === r.val
                        ? 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40 shadow-md font-extrabold'
                        : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Graph & Live Data */}
          <div className="p-4 border-b border-white/5 space-y-3.5">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
              live titration curve
            </span>

            {/* Real-time SVG graph */}
            <div className="bg-slate-950/80 border border-white/5 rounded-xl p-2 relative h-[150px] flex items-center justify-center">
              <svg width="280" height="135" className="overflow-visible">
                {/* Gridlines */}
                <line x1="20" y1="10" x2="20" y2="110" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="20" y1="110" x2="260" y2="110" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="20" y1="60" x2="260" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="2,2" />
                
                {/* Labels */}
                <text x="5" y="15" fill="#64748b" fontSize="8" fontFamily="monospace">14</text>
                <text x="5" y="63" fill="#64748b" fontSize="8" fontFamily="monospace">7</text>
                <text x="5" y="113" fill="#64748b" fontSize="8" fontFamily="monospace">0</text>
                
                <text x="20" y="125" fill="#64748b" fontSize="8" fontFamily="monospace">0</text>
                <text x="140" y="125" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">25 mL</text>
                <text x="260" y="125" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">50 mL</text>

                {/* Y-axis Label */}
                <text x="-65" y="10" fill="#64748b" fontSize="7" transform="rotate(-90)" textAnchor="middle">pH</text>
                {/* X-axis Label */}
                <text x="140" y="134" fill="#64748b" fontSize="7" textAnchor="middle">NaOH Volume Added (mL)</text>

                {/* Equivalence Point vertical helper line */}
                {volumeAdded > 0 && (
                  <line 
                    x1={20 + (trueEquivalenceVol / 50) * 240} 
                    y1="10" 
                    x2={20 + (trueEquivalenceVol / 50) * 240} 
                    y2="110" 
                    stroke="rgba(219,39,119,0.3)" 
                    strokeWidth="1.5" 
                    strokeDasharray="3,3" 
                  />
                )}

                {/* Titration Curve Path */}
                {titrationCurve.length > 1 && (
                  <path d={getGraphPath()} fill="none" stroke="#a855f7" strokeWidth="2.5" />
                )}

                {/* Current Value Dot */}
                {volumeAdded > 0 && (
                  <circle 
                    cx={20 + (volumeAdded / 50) * 240} 
                    cy={110 - (pH / 14) * 100} 
                    r="4" 
                    fill="#38bdf8" 
                    stroke="#ffffff" 
                    strokeWidth="1" 
                  />
                )}
              </svg>

              {/* Equivalence point tag */}
              {volumeAdded >= trueEquivalenceVol && (
                <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded bg-pink-500/10 border border-pink-500/30 text-pink-400 font-mono text-[7px] uppercase tracking-wider animate-fadeIn">
                  Eq. Pt Crossed
                </div>
              )}
            </div>

            {/* Live Data Grid */}
            <div className="grid grid-cols-2 gap-2.5 font-mono text-[11px]">
              <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl space-y-0.5">
                <div className="text-[8px] text-gray-500 uppercase">Volume Added</div>
                <div className="text-sm font-black text-brand-cyan">{volumeAdded.toFixed(2)} mL</div>
              </div>
              <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl space-y-0.5">
                <div className="text-[8px] text-gray-500 uppercase">pH Level</div>
                <div className="text-sm font-black text-brand-purple">{pH.toFixed(2)}</div>
              </div>
              <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl space-y-0.5">
                <div className="text-[8px] text-gray-500 uppercase">Moles Base (Added)</div>
                <div className="text-[10px] font-black text-white">
                  {(baseConcentration * volumeAdded / 1000).toFixed(5)} mmol
                </div>
              </div>
              <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl space-y-0.5">
                <div className="text-[8px] text-gray-500 uppercase">Equivalence Vol.</div>
                <div className="text-[10px] font-black text-emerald-400">
                  {currentTask === 'find-concentration' 
                    ? '??'
                    : `${trueEquivalenceVol.toFixed(2)} mL`}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Learning Tasks Card */}
          <div className="p-4 flex-1 space-y-3 bg-[#0d0d21]/30">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block flex items-center gap-1 text-brand-purple">
              <Award className="h-3.5 w-3.5" />
              Active Interactive Challenge
            </span>

            {currentTask === 'find-equivalence' && (
              <div className="space-y-2.5">
                <p className="text-[10px] text-gray-400 leading-normal">
                  Perform the titration using the controls. Note the volume at which the pH curve jumps vertically or the indicator color shifts. Enter that volume (mL) below.
                </p>
                <div className="text-[9px] font-mono text-gray-500">
                  Formula: Equivalence occurs when <span className="text-white">moles H⁺ = moles OH⁻</span>.
                </div>
              </div>
            )}

            {currentTask === 'find-concentration' && (
              <div className="space-y-2.5">
                <div className="p-2 bg-brand-purple/10 border border-brand-purple/20 rounded-lg text-[10px] text-gray-300">
                  <span className="font-extrabold text-brand-purple block uppercase mb-0.5">Task Description</span>
                  We have filled the flask with <span className="font-bold text-white">25.0 mL</span> of an unknown <span className="font-bold text-white">{ACIDS[activeAcid].name}</span> solution. Titrate to find the exact equivalence point volume, then solve for the acid concentration (M).
                </div>
                <div className="text-[9px] font-mono text-gray-500">
                  Equation: <span className="text-white">M_acid = (0.10 M * V_base) / 25.0 mL</span>.
                </div>
              </div>
            )}

            {currentTask === 'find-volume' && (
              <div className="space-y-2.5">
                <div className="p-2 bg-brand-purple/10 border border-brand-purple/20 rounded-lg text-[10px] text-gray-300">
                  <span className="font-extrabold text-brand-purple block uppercase mb-0.5">Task Description</span>
                  Calculate how many milliliters (mL) of <span className="font-bold text-white">0.10 M NaOH</span> are required to fully neutralize <span className="font-bold text-white">25.0 mL</span> of <span className="font-bold text-white">{taskState.targetConcentration.toFixed(3)} M {ACIDS[activeAcid].name}</span>.
                </div>
                <div className="text-[9px] font-mono text-gray-500">
                  Equation: <span className="text-white">V_base = (M_acid * 25.0 mL) / 0.10 M</span>.
                </div>
              </div>
            )}

            {/* User Input & Answer Checking */}
            <div className="space-y-2 pt-1.5 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={taskState.userAnswer}
                  onChange={(e) => setTaskState(prev => ({ ...prev, userAnswer: e.target.value }))}
                  placeholder={
                    currentTask === 'find-equivalence' ? 'Equiv volume (mL)...' :
                    currentTask === 'find-concentration' ? 'Concentration (M)...' :
                    'Required Volume (mL)...'
                  }
                  disabled={taskState.checked && taskState.correct}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-brand-purple text-xs font-mono"
                />
                {!taskState.correct ? (
                  <button
                    onClick={checkAnswer}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-xs font-bold text-white transition-all shadow hover:brightness-115"
                  >
                    Check
                  </button>
                ) : (
                  <div className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1 select-none animate-bounce">
                    <Check className="h-4 w-4" /> Correct!
                  </div>
                )}
              </div>

              {/* Feedbacks */}
              {taskState.checked && (
                <div className={`p-3 rounded-xl border text-[10px] leading-relaxed transition-all duration-300 animate-fadeIn ${
                  taskState.correct 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400 font-medium'
                }`}>
                  <span className="font-extrabold block mb-0.5 uppercase tracking-wider">
                    {taskState.correct ? 'Brilliant!' : 'Incorrect'}
                  </span>
                  {taskState.correct 
                    ? `Congratulations! You successfully solved this interactive challenge and earned 150 XP! You've mastered neutralization relations.`
                    : `That's not quite right (Attempt #${taskState.attempts}). Retake your measurements or recalculate, then try again!`
                  }
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
