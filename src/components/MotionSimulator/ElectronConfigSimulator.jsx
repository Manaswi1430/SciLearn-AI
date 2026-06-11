import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { 
  Play, Pause, RotateCcw, Activity, HelpCircle, 
  ChevronRight, Compass, ShieldAlert, Sparkles, Zap, Lightbulb
} from 'lucide-react';

// --- DATA DEFINITION FOR ELEMENTS ---
const ELEMENTS = {
  hydrogen: {
    name: 'Hydrogen',
    symbol: 'H',
    Z: 1,
    valence: 1,
    config: '1s¹',
    valenceConfig: '1s¹',
    isException: false,
    subshells: [
      { name: '1s', type: 's', shell: 1, electrons: ['up'] }
    ]
  },
  carbon: {
    name: 'Carbon',
    symbol: 'C',
    Z: 6,
    valence: 4,
    config: '1s² 2s² 2p²',
    isException: false,
    valenceConfig: '2s² 2p²',
    subshells: [
      { name: '1s', type: 's', shell: 1, electrons: ['up', 'down'] },
      { name: '2s', type: 's', shell: 2, electrons: ['up', 'down'] },
      { name: '2p', type: 'p', shell: 2, electrons: ['up', 'up', ''] }
    ]
  },
  nitrogen: {
    name: 'Nitrogen',
    symbol: 'N',
    Z: 7,
    valence: 5,
    config: '1s² 2s² 2p³',
    isException: false,
    valenceConfig: '2s² 2p³',
    subshells: [
      { name: '1s', type: 's', shell: 1, electrons: ['up', 'down'] },
      { name: '2s', type: 's', shell: 2, electrons: ['up', 'down'] },
      { name: '2p', type: 'p', shell: 2, electrons: ['up', 'up', 'up'] }
    ]
  },
  oxygen: {
    name: 'Oxygen',
    symbol: 'O',
    Z: 8,
    valence: 6,
    config: '1s² 2s² 2p⁴',
    isException: false,
    valenceConfig: '2s² 2p⁴',
    subshells: [
      { name: '1s', type: 's', shell: 1, electrons: ['up', 'down'] },
      { name: '2s', type: 's', shell: 2, electrons: ['up', 'down'] },
      { name: '2p', type: 'p', shell: 2, electrons: ['up/down', 'up', 'up'] }
    ]
  },
  neon: {
    name: 'Neon',
    symbol: 'Ne',
    Z: 10,
    valence: 8,
    config: '1s² 2s² 2p⁶',
    isException: false,
    valenceConfig: '2s² 2p⁶',
    subshells: [
      { name: '1s', type: 's', shell: 1, electrons: ['up', 'down'] },
      { name: '2s', type: 's', shell: 2, electrons: ['up', 'down'] },
      { name: '2p', type: 'p', shell: 2, electrons: ['up/down', 'up/down', 'up/down'] }
    ]
  },
  sodium: {
    name: 'Sodium',
    symbol: 'Na',
    Z: 11,
    valence: 1,
    config: '1s² 2s² 2p⁶ 3s¹',
    isException: false,
    valenceConfig: '3s¹',
    subshells: [
      { name: '1s', type: 's', shell: 1, electrons: ['up', 'down'] },
      { name: '2s', type: 's', shell: 2, electrons: ['up', 'down'] },
      { name: '2p', type: 'p', shell: 2, electrons: ['up/down', 'up/down', 'up/down'] },
      { name: '3s', type: 's', shell: 3, electrons: ['up'] }
    ]
  },
  iron: {
    name: 'Iron',
    symbol: 'Fe',
    Z: 26,
    valence: 2,
    config: '1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁶ 4s²',
    isException: false,
    valenceConfig: '3d⁶ 4s²',
    subshells: [
      { name: '1s', type: 's', shell: 1, electrons: ['up', 'down'] },
      { name: '2s', type: 's', shell: 2, electrons: ['up', 'down'] },
      { name: '2p', type: 'p', shell: 2, electrons: ['up/down', 'up/down', 'up/down'] },
      { name: '3s', type: 's', shell: 3, electrons: ['up', 'down'] },
      { name: '3p', type: 'p', shell: 3, electrons: ['up/down', 'up/down', 'up/down'] },
      { name: '3d', type: 'd', shell: 3, electrons: ['up/down', 'up', 'up', 'up', 'up'] },
      { name: '4s', type: 's', shell: 4, electrons: ['up', 'down'] }
    ]
  },
  copper: {
    name: 'Copper',
    symbol: 'Cu',
    Z: 29,
    valence: 1,
    config: '1s² 2s² 2p⁶ 3s² 3p⁶ 3d¹⁰ 4s¹',
    isException: true,
    valenceConfig: '3d¹⁰ 4s¹',
    subshells: [
      { name: '1s', type: 's', shell: 1, electrons: ['up', 'down'] },
      { name: '2s', type: 's', shell: 2, electrons: ['up', 'down'] },
      { name: '2p', type: 'p', shell: 2, electrons: ['up/down', 'up/down', 'up/down'] },
      { name: '3s', type: 's', shell: 3, electrons: ['up', 'down'] },
      { name: '3p', type: 'p', shell: 3, electrons: ['up/down', 'up/down', 'up/down'] },
      { name: '3d', type: 'd', shell: 3, electrons: ['up/down', 'up/down', 'up/down', 'up/down', 'up/down'] },
      { name: '4s', type: 's', shell: 4, electrons: ['up'] }
    ]
  },
  silver: {
    name: 'Silver',
    symbol: 'Ag',
    Z: 47,
    valence: 1,
    config: '[Kr] 4d¹⁰ 5s¹',
    isException: true,
    valenceConfig: '4d¹⁰ 5s¹',
    subshells: [
      { name: '1s', type: 's', shell: 1, electrons: ['up', 'down'] },
      { name: '2s', type: 's', shell: 2, electrons: ['up', 'down'] },
      { name: '2p', type: 'p', shell: 2, electrons: ['up/down', 'up/down', 'up/down'] },
      { name: '3s', type: 's', shell: 3, electrons: ['up', 'down'] },
      { name: '3p', type: 'p', shell: 3, electrons: ['up/down', 'up/down', 'up/down'] },
      { name: '3d', type: 'd', shell: 3, electrons: ['up/down', 'up/down', 'up/down', 'up/down', 'up/down'] },
      { name: '4s', type: 's', shell: 4, electrons: ['up', 'down'] },
      { name: '4p', type: 'p', shell: 4, electrons: ['up/down', 'up/down', 'up/down'] },
      { name: '4d', type: 'd', shell: 4, electrons: ['up/down', 'up/down', 'up/down', 'up/down', 'up/down'] },
      { name: '5s', type: 's', shell: 5, electrons: ['up'] }
    ]
  },
  gold: {
    name: 'Gold',
    symbol: 'Au',
    Z: 79,
    valence: 1,
    config: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹',
    isException: true,
    valenceConfig: '4f¹⁴ 5d¹⁰ 6s¹',
    subshells: [
      { name: '1s', type: 's', shell: 1, electrons: ['up', 'down'] },
      { name: '2s', type: 's', shell: 2, electrons: ['up', 'down'] },
      { name: '2p', type: 'p', shell: 2, electrons: ['up/down', 'up/down', 'up/down'] },
      { name: '3s', type: 's', shell: 3, electrons: ['up', 'down'] },
      { name: '3p', type: 'p', shell: 3, electrons: ['up/down', 'up/down', 'up/down'] },
      { name: '3d', type: 'd', shell: 3, electrons: ['up/down', 'up/down', 'up/down', 'up/down', 'up/down'] },
      { name: '4s', type: 's', shell: 4, electrons: ['up', 'down'] },
      { name: '4p', type: 'p', shell: 4, electrons: ['up/down', 'up/down', 'up/down'] },
      { name: '4d', type: 'd', shell: 4, electrons: ['up/down', 'up/down', 'up/down', 'up/down', 'up/down'] },
      { name: '5s', type: 's', shell: 5, electrons: ['up', 'down'] },
      { name: '5p', type: 'p', shell: 5, electrons: ['up/down', 'up/down', 'up/down'] },
      { name: '4f', type: 'f', shell: 4, electrons: ['up/down', 'up/down', 'up/down', 'up/down', 'up/down', 'up/down', 'up/down'] },
      { name: '5d', type: 'd', shell: 5, electrons: ['up/down', 'up/down', 'up/down', 'up/down', 'up/down'] },
      { name: '6s', type: 's', shell: 6, electrons: ['up'] }
    ]
  }
};

// --- ORBITAL EXPLORER SANDBOX DATA ---
const SANDBOX_ORBITALS = {
  s: {
    name: 's Orbital',
    desc: 'Spherical probability cloud with no angular nodes (l = 0). It expands radially as the principal quantum number (n) increases.',
    capacity: 2,
    nodes: 'n - 1 radial nodes, 0 angular nodes.',
    shapeName: 'Sphere',
    math: 'Y₀⁰(θ, φ) = 1 / √(4π)  (Spherically symmetric)'
  },
  p: {
    name: 'p Orbitals (px, py, pz)',
    desc: 'Dumbbell-shaped lobes with one angular node passing through the nucleus (l = 1). The three degenerate orbitals lie perpendicular along the x, y, and z axes.',
    capacity: 6,
    nodes: 'n - 2 radial nodes, 1 angular plane node.',
    shapeName: 'Dumbbells (3 orientations)',
    math: 'px ∝ sinθ cosφ | py ∝ sinθ sinφ | pz ∝ cosθ'
  },
  d: {
    name: 'd Orbitals',
    desc: 'Four cloverleaf-shaped orbitals (dxy, dyz, dxz, dx²-y²) and one doughnut-collar shape (dz²) centered along the z-axis (l = 2).',
    capacity: 10,
    nodes: 'n - 3 radial nodes, 2 angular nodes.',
    shapeName: 'Cloverleaf & Toroidal Collar',
    math: 'dz² ∝ 3cos²θ - 1 | dx²-y² ∝ sin²θ cos2φ'
  },
  f: {
    name: 'f Orbitals',
    desc: 'Highly complex multi-lobed structures (l = 3). Includes 8-lobed octant configurations and dual-collar dumbbells.',
    capacity: 14,
    nodes: 'n - 4 radial nodes, 3 angular nodes.',
    shapeName: 'Hexadecapolar (8-lobes/toruses)',
    math: 'fxyz ∝ sin³θ sin2φ cosθ  (complex lobes)'
  }
};

// --- 3D PARTICLE NUCLEUS ---
function SeededNucleus({ Z, N }) {
  const particles = [];
  const total = Z + N;
  
  let seed = 42;
  function random() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  let protonsLeft = Z;
  let neutronsLeft = N;

  for (let i = 0; i < total; i++) {
    const r = 0.38 * Math.pow(random(), 0.35); 
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    let type = 'proton';
    if (protonsLeft > 0 && neutronsLeft > 0) {
      type = random() > 0.48 ? 'neutron' : 'proton';
      if (type === 'neutron') neutronsLeft--;
      else protonsLeft--;
    } else if (protonsLeft > 0) {
      type = 'proton';
      protonsLeft--;
    } else {
      type = 'neutron';
      neutronsLeft--;
    }

    particles.push({ id: i, pos: [x, y, z], type });
  }

  return (
    <group>
      {/* Central nuclear glow */}
      <mesh>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.12} />
      </mesh>
      {particles.map((p) => (
        <mesh key={p.id} position={p.pos}>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshStandardMaterial 
            color={p.type === 'proton' ? '#ef4444' : '#94a3b8'} 
            roughness={0.2}
            metalness={0.1}
            emissive={p.type === 'proton' ? '#ef4444' : '#475569'}
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}

// --- ORBITING ELECTRON COMPONENT ---
function OrbitingElectron({ type, subshellName, index, active, isPaused }) {
  const meshRef = useRef();
  const t = useRef(Math.random() * 100);

  const n = parseInt(subshellName.slice(0, 1)) || 1;
  const radius = n * 1.35;

  useFrame((state, delta) => {
    if (isPaused || !meshRef.current) return;
    t.current += delta * 1.8;

    const time = t.current;

    if (type === 's') {
      const angle = time * 0.8;
      const angle2 = time * 0.3;
      const x = radius * Math.sin(angle) * Math.cos(angle2);
      const y = radius * Math.sin(angle) * Math.sin(angle2);
      const z = radius * Math.cos(angle);
      meshRef.current.position.set(x, y, z);
    } else if (type === 'p') {
      const subIdx = index % 3;
      const dist = radius * Math.sin(time);
      const side = Math.cos(time * 0.5) * 0.3;

      if (subIdx === 0) {
        meshRef.current.position.set(dist, side, 0);
      } else if (subIdx === 1) {
        meshRef.current.position.set(side, dist, 0);
      } else {
        meshRef.current.position.set(0, side, dist);
      }
    } else if (type === 'd') {
      const subIdx = index % 5;
      const dist = radius * Math.sin(time);

      if (subIdx === 4) {
        if (Math.sin(time * 0.6) > 0) {
          meshRef.current.position.set(0, 0, dist);
        } else {
          const ringRad = radius * 0.7;
          meshRef.current.position.set(ringRad * Math.cos(time), ringRad * Math.sin(time), 0);
        }
      } else {
        const angle = (subIdx * Math.PI) / 2 + Math.PI / 4;
        const xVal = dist * Math.cos(angle);
        const yVal = dist * Math.sin(angle);
        meshRef.current.position.set(xVal, yVal, 0);
      }
    } else {
      const subIdx = index % 7;
      const octantSignX = subIdx % 2 === 0 ? 1 : -1;
      const octantSignY = (subIdx >> 1) % 2 === 0 ? 1 : -1;
      const octantSignZ = (subIdx >> 2) % 2 === 0 ? 1 : -1;

      const scaleDist = radius * (0.5 + 0.5 * Math.sin(time));
      meshRef.current.position.set(
        scaleDist * octantSignX,
        scaleDist * octantSignY,
        scaleDist * octantSignZ
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[active ? 0.14 : 0.09, 12, 12]} />
      <meshBasicMaterial 
        color={active ? '#22c55e' : '#10b981'} 
        transparent
        opacity={active ? 1.0 : 0.65}
      />
      {active && (
        <pointLight color="#22c55e" intensity={0.5} distance={1.5} />
      )}
    </mesh>
  );
}

// --- Orbital Boundary Visualizer (s, p, d, f mathematical envelopes) ---
function OrbitalLobe({ type, subshellName, active, focusBoxIdx = null }) {
  const n = parseInt(subshellName.slice(0, 1)) || 1;
  const radius = n * 1.35;

  const posColor = '#f43f5e';
  const negColor = '#3b82f6';
  const opac = active ? 0.22 : 0.04;
  const wireOpac = active ? 0.15 : 0.02;

  if (type === 's') {
    return (
      <group>
        <mesh>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial 
            color="#a855f7" 
            transparent 
            opacity={opac} 
            depthWrite={false}
            roughness={0.1}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[radius, 16, 16]} />
          <meshBasicMaterial 
            color="#a855f7" 
            transparent 
            opacity={wireOpac} 
            wireframe 
          />
        </mesh>
        
        {n > 1 && (
          <mesh>
            <sphereGeometry args={[radius * 0.45, 16, 16]} />
            <meshBasicMaterial 
              color={posColor} 
              transparent 
              opacity={opac * 1.2} 
              wireframe 
            />
          </mesh>
        )}
      </group>
    );
  }

  if (type === 'p') {
    const lobeRadius = radius * 0.55;
    const lobeHeight = radius * 0.95;

    const renderDumbbell = (axisIdx, rot) => {
      if (focusBoxIdx !== null && focusBoxIdx !== axisIdx) return null;

      return (
        <group rotation={rot} key={axisIdx}>
          <mesh position={[0, 0, lobeHeight / 2]}>
            <sphereGeometry args={[lobeRadius, 16, 16]} />
            <meshStandardMaterial 
              color={posColor} 
              transparent 
              opacity={opac} 
              depthWrite={false}
              scale={[1, 1, 1.6]} 
            />
          </mesh>
          <mesh position={[0, 0, lobeHeight / 2]}>
            <sphereGeometry args={[lobeRadius, 10, 10]} />
            <meshBasicMaterial 
              color={posColor} 
              transparent 
              opacity={wireOpac} 
              wireframe 
              scale={[1, 1, 1.6]} 
            />
          </mesh>

          <mesh position={[0, 0, -lobeHeight / 2]}>
            <sphereGeometry args={[lobeRadius, 16, 16]} />
            <meshStandardMaterial 
              color={negColor} 
              transparent 
              opacity={opac} 
              depthWrite={false}
              scale={[1, 1, 1.6]} 
            />
          </mesh>
          <mesh position={[0, 0, -lobeHeight / 2]}>
            <sphereGeometry args={[lobeRadius, 10, 10]} />
            <meshBasicMaterial 
              color={negColor} 
              transparent 
              opacity={wireOpac} 
              wireframe 
              scale={[1, 1, 1.6]} 
            />
          </mesh>
        </group>
      );
    };

    return (
      <group>
        {renderDumbbell(0, [0, Math.PI / 2, 0])} 
        {renderDumbbell(1, [Math.PI / 2, 0, 0])} 
        {renderDumbbell(2, [0, 0, 0])}           
      </group>
    );
  }

  if (type === 'd') {
    const lobeRad = radius * 0.45;
    const offset = radius * 0.65;

    const renderClover = (axisIdx, angles) => {
      if (focusBoxIdx !== null && focusBoxIdx !== axisIdx) return null;
      return (
        <group rotation={angles} key={axisIdx}>
          <mesh position={[offset, offset, 0]}>
            <sphereGeometry args={[lobeRad, 12, 12]} />
            <meshStandardMaterial color={posColor} transparent opacity={opac} depthWrite={false} scale={[1, 1.3, 1]} />
          </mesh>
          <mesh position={[-offset, -offset, 0]}>
            <sphereGeometry args={[lobeRad, 12, 12]} />
            <meshStandardMaterial color={posColor} transparent opacity={opac} depthWrite={false} scale={[1, 1.3, 1]} />
          </mesh>

          <mesh position={[-offset, offset, 0]}>
            <sphereGeometry args={[lobeRad, 12, 12]} />
            <meshStandardMaterial color={negColor} transparent opacity={opac} depthWrite={false} scale={[1, 1.3, 1]} />
          </mesh>
          <mesh position={[offset, -offset, 0]}>
            <sphereGeometry args={[lobeRad, 12, 12]} />
            <meshStandardMaterial color={negColor} transparent opacity={opac} depthWrite={false} scale={[1, 1.3, 1]} />
          </mesh>
        </group>
      );
    };

    return (
      <group>
        {renderClover(0, [0, 0, 0])}                
        {renderClover(1, [Math.PI / 2, 0, 0])}      
        {renderClover(2, [0, Math.PI / 2, 0])}      
        {renderClover(3, [0, 0, Math.PI / 4])}      
        
        {(focusBoxIdx === null || focusBoxIdx === 4) && (
          <group key={4}>
            <mesh position={[0, 0, radius * 0.7]}>
              <sphereGeometry args={[radius * 0.42, 12, 12]} />
              <meshStandardMaterial color={posColor} transparent opacity={opac} depthWrite={false} scale={[1, 1, 1.5]} />
            </mesh>
            <mesh position={[0, 0, -radius * 0.7]}>
              <sphereGeometry args={[radius * 0.42, 12, 12]} />
              <meshStandardMaterial color={posColor} transparent opacity={opac} depthWrite={false} scale={[1, 1, 1.5]} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[radius * 0.55, radius * 0.22, 8, 24]} />
              <meshStandardMaterial color={negColor} transparent opacity={opac * 1.3} depthWrite={false} />
            </mesh>
          </group>
        )}
      </group>
    );
  }

  if (type === 'f') {
    const lobeRad = radius * 0.38;
    const d = radius * 0.52;

    const renderOctants = (axisIdx) => {
      if (focusBoxIdx !== null && focusBoxIdx !== axisIdx) return null;

      const coordinates = [
        { pos: [d, d, d], color: posColor },
        { pos: [-d, -d, d], color: posColor },
        { pos: [-d, d, -d], color: posColor },
        { pos: [d, -d, -d], color: posColor },
        
        { pos: [-d, -d, -d], color: negColor },
        { pos: [d, d, -d], color: negColor },
        { pos: [d, -d, d], color: negColor },
        { pos: [-d, d, d], color: negColor }
      ];

      return (
        <group key={axisIdx}>
          {coordinates.map((pt, i) => (
            <mesh position={pt.pos} key={i}>
              <sphereGeometry args={[lobeRad, 10, 10]} />
              <meshStandardMaterial 
                color={pt.color} 
                transparent 
                opacity={opac} 
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      );
    };

    return (
      <group>
        {Array.from({ length: 7 }).map((_, idx) => renderOctants(idx))}
      </group>
    );
  }

  return null;
}

export default function ElectronConfigSimulator({
  selectedPart,
  onSelectPart,
  hoveredPart,
  onHoverPart
}) {
  const [activeElementKey, setActiveElementKey] = useState('carbon');
  const [selectedSubshell, setSelectedSubshell] = useState('2p');
  const [highlightMode, setHighlightMode] = useState('valence'); 
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(null); 
  const [playSequence, setPlaySequence] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(999); 
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState('element'); 
  const [explorerOrbitalKey, setExplorerOrbitalKey] = useState('p');

  const activeElement = ELEMENTS[activeElementKey];
  const maxElectrons = activeElement.Z;

  useEffect(() => {
    let interval = null;
    if (playSequence && !isPaused) {
      interval = setInterval(() => {
        setSequenceIndex((prev) => {
          if (prev >= maxElectrons) {
            setPlaySequence(false);
            return maxElectrons;
          }
          return prev + 1;
        });
      }, 1000); 
    }
    return () => clearInterval(interval);
  }, [playSequence, isPaused, maxElectrons]);

  useEffect(() => {
    if (selectedPart) {
      const partId = selectedPart.toLowerCase();
      if (partId.includes('s-orbital')) {
        setSelectedSubshell('2s');
        setSelectedBoxIndex(null);
      } else if (partId.includes('p-orbital')) {
        setSelectedSubshell('2p');
        setSelectedBoxIndex(null);
      } else if (partId.includes('d-orbital')) {
        setSelectedSubshell('3d');
        setSelectedBoxIndex(null);
      } else if (partId.includes('f-orbital')) {
        setSelectedSubshell('4f');
        setSelectedBoxIndex(null);
      }
      setHighlightMode('selected');
    }
  }, [selectedPart]);

  const startAnimation = () => {
    setSequenceIndex(0);
    setPlaySequence(true);
    setIsPaused(false);
  };

  const handleReset = () => {
    setSequenceIndex(maxElectrons);
    setPlaySequence(false);
    setIsPaused(false);
  };

  const getSubshellElectronCount = (subshell, totalAllowed) => {
    let currentTotal = 0;

    const subIdx = activeElement.subshells.findIndex((s) => s.name === subshell.name);

    for (let i = 0; i < subIdx; i++) {
      const s = activeElement.subshells[i];
      const cap = s.type === 's' ? 2 : s.type === 'p' ? 6 : s.type === 'd' ? 10 : 14;
      currentTotal += cap;
    }

    const remaining = Math.max(0, totalAllowed - currentTotal);
    const subshellCap = subshell.type === 's' ? 2 : subshell.type === 'p' ? 6 : subshell.type === 'd' ? 10 : 14;
    const actualFilled = Math.min(subshellCap, remaining);

    const boxes = subshell.type === 's' ? 1 : subshell.type === 'p' ? 3 : subshell.type === 'd' ? 5 : 7;
    const filledArrows = Array(boxes).fill(null).map(() => []);

    if (actualFilled > 0) {
      if (subshell.type === 's') {
        if (actualFilled >= 1) filledArrows[0].push('up');
        if (actualFilled >= 2) filledArrows[0].push('down');
      } else {
        for (let i = 0; i < Math.min(boxes, actualFilled); i++) {
          filledArrows[i].push('up');
        }
        if (actualFilled > boxes) {
          const pairsNeeded = actualFilled - boxes;
          for (let i = 0; i < pairsNeeded; i++) {
            filledArrows[i].push('down');
          }
        }
      }
    }
    return filledArrows;
  };

  return (
    <div className="flex flex-col h-[580px] w-full rounded-[24px] border border-white/10 bg-[#02050c]/60 overflow-hidden relative select-none">
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 pointer-events-auto">
        {activeTab === 'element' ? (
          <>
            <div className="flex items-center gap-3">
              <span className="text-xl font-black text-brand-cyan tracking-wider">
                {activeElement.name}
              </span>
              <span className="rounded-md bg-brand-cyan/20 border border-brand-cyan/45 px-2 py-0.5 text-[10px] font-bold text-brand-cyan uppercase">
                Z = {activeElement.Z}
              </span>
              {activeElement.isException && (
                <span className="rounded-md bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[9px] font-bold text-amber-400 flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3 animate-pulse" /> Aufbau Exception
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono mt-1">
              <span>Configuration:</span>
              <span className="text-white font-bold">{activeElement.config}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
              <span>Valence Shell:</span>
              <span className="text-brand-purple font-bold">{activeElement.valenceConfig}</span>
              <span className="text-gray-500">({activeElement.valence} valence e⁻)</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-white uppercase tracking-wider">
                Orbital Explorer Sandbox
              </span>
              <span className="rounded-full bg-brand-purple/20 border border-brand-purple/35 px-2.5 py-0.5 text-[9px] font-bold text-brand-purple">
                {SANDBOX_ORBITALS[explorerOrbitalKey].shapeName}
              </span>
            </div>
            <span className="text-[10px] text-gray-500 max-w-[280px] leading-relaxed mt-1 block">
              Click orbital types to view quantum shapes, rules, and equations.
            </span>
          </>
        )}
      </div>

      <div className="flex-1 w-full bg-[#030611] relative">
        <Canvas camera={{ position: [0, 4, 7], fof: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 10, 5]} intensity={1.5} />
          <pointLight position={[-5, -5, -5]} intensity={0.8} />

          {activeTab === 'element' ? (
            <group>
              <SeededNucleus Z={Math.min(activeElement.Z, 12)} N={Math.min(activeElement.Z, 14)} />

              {activeElement.subshells.map((sub, sIdx) => {
                const subFilledState = getSubshellElectronCount(sub, sequenceIndex);
                const isSelected = selectedSubshell === sub.name;
                const isValence = activeElement.valenceConfig.includes(sub.name);

                let visible = true;
                if (highlightMode === 'valence') visible = isValence;
                else if (highlightMode === 'selected') visible = isSelected;

                const hasElectrons = subFilledState.some((box) => box.length > 0);

                return (
                  <group key={sub.name}>
                    {visible && (
                      <OrbitalLobe 
                        type={sub.type} 
                        subshellName={sub.name} 
                        active={isSelected}
                        focusBoxIdx={isSelected ? selectedBoxIndex : null}
                      />
                    )}

                    {hasElectrons && subFilledState.map((boxArrows, bIdx) => 
                      boxArrows.map((arrow, aIdx) => {
                        return (
                          <OrbitingElectron
                            key={`${sub.name}-${bIdx}-${arrow}-${aIdx}`}
                            type={sub.type}
                            subshellName={sub.name}
                            index={bIdx}
                            active={isSelected}
                            isPaused={playSequence && !isPaused}
                          />
                        );
                      })
                    )}
                  </group>
                );
              })}
            </group>
          ) : (
            <group>
              <SeededNucleus Z={3} N={3} />
              <OrbitalLobe 
                type={explorerOrbitalKey} 
                subshellName="2p" 
                active={true}
                focusBoxIdx={null}
              />
              <OrbitingElectron 
                type={explorerOrbitalKey} 
                subshellName="2p" 
                index={0} 
                active={true} 
                isPaused={false} 
              />
              <OrbitingElectron 
                type={explorerOrbitalKey} 
                subshellName="2p" 
                index={1} 
                active={true} 
                isPaused={false} 
              />
            </group>
          )}

          <OrbitControls 
            enableDamping 
            dampingFactor={0.05} 
            maxDistance={15} 
            minDistance={2} 
          />
        </Canvas>

        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 pointer-events-auto">
          {activeTab === 'element' && (
            <>
              {playSequence ? (
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white transition-all flex items-center gap-1.5 text-xs font-bold"
                >
                  {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
              ) : (
                <button
                  onClick={startAnimation}
                  className="p-2.5 rounded-xl bg-brand-cyan/20 hover:bg-brand-cyan/25 border border-brand-cyan/35 text-brand-cyan transition-all flex items-center gap-1.5 text-xs font-bold"
                >
                  <Play className="h-3.5 w-3.5 fill-brand-cyan/20" />
                  <span>Aufbau Fill</span>
                </button>
              )}
              <button
                onClick={handleReset}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 transition-all"
                title="Reset Electron Configuration"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <div className="h-4 w-[1px] bg-white/10 mx-1" />

              <div className="flex p-0.5 rounded-xl bg-slate-950/70 border border-white/5 text-[10px] font-bold">
                {[
                  { id: 'all', label: 'Show All' },
                  { id: 'valence', label: 'Valence Only' },
                  { id: 'selected', label: 'Focus active' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setHighlightMode(f.id)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      highlightMode === f.id
                        ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="absolute top-4 right-4 z-20 flex p-0.5 rounded-xl bg-slate-950/80 border border-white/10 text-[10px] font-bold">
          <button
            onClick={() => setActiveTab('element')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'element'
                ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Atom Builder
          </button>
          <button
            onClick={() => setActiveTab('explorer')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'explorer'
                ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Orbital Explorer
          </button>
        </div>
      </div>

      <div className="h-[210px] w-full border-t border-white/10 bg-slate-950/90 backdrop-blur-md flex flex-col relative z-25">
        {activeTab === 'element' ? (
          <div className="flex h-full">
            <div className="w-[130px] border-r border-white/5 flex flex-col p-2.5 gap-1.5 overflow-y-auto scrollbar-thin">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider pl-1 mb-0.5">
                Select Element
              </span>
              {Object.keys(ELEMENTS).map((key) => {
                const el = ELEMENTS[key];
                const active = activeElementKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveElementKey(key);
                      setSequenceIndex(ELEMENTS[key].Z);
                      setPlaySequence(false);
                      setSelectedSubshell(ELEMENTS[key].subshells[ELEMENTS[key].subshells.length - 1].name);
                      setSelectedBoxIndex(null);
                    }}
                    className={`flex items-center justify-between text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      active
                        ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/25'
                        : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span>{el.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{el.symbol}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex-1 p-3.5 flex flex-col gap-3 overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-brand-cyan animate-pulse" />
                  Quantum Orbital filling diagram
                </span>
                <span className="text-[9px] text-gray-500 italic">
                  *Click boxes/tags to focus subshells in 3D space
                </span>
              </div>

              <div className="flex flex-wrap gap-3.5 items-end">
                {activeElement.subshells.map((sub) => {
                  const isSelected = selectedSubshell === sub.name;
                  const orbitalStates = getSubshellElectronCount(sub, sequenceIndex);

                  return (
                    <div 
                      key={sub.name} 
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                        isSelected 
                          ? 'bg-brand-cyan/10 border border-brand-cyan/25' 
                          : 'bg-white/5 border border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex gap-1.5">
                        {orbitalStates.map((arrows, bIdx) => {
                          const isBoxFocused = isSelected && selectedBoxIndex === bIdx;
                          return (
                            <button
                              key={bIdx}
                              onClick={() => {
                                setSelectedSubshell(sub.name);
                                setSelectedBoxIndex(bIdx);
                                setHighlightMode('selected');
                              }}
                              className={`w-7 h-7 rounded-md border flex items-center justify-center gap-0.5 text-xs font-bold transition-all relative ${
                                isBoxFocused
                                  ? 'border-brand-purple bg-brand-purple/20 text-brand-purple'
                                  : 'border-white/15 bg-slate-900 text-white hover:border-brand-cyan/50'
                              }`}
                              title={`${sub.name} sub-orbital #${bIdx + 1}`}
                            >
                              {arrows.includes('up') && (
                                <span className="text-[14px] leading-none text-emerald-400 font-black">↑</span>
                              )}
                              {arrows.includes('down') && (
                                <span className="text-[14px] leading-none text-rose-400 font-black">↓</span>
                              )}
                              {arrows.includes('up/down') && (
                                <span className="text-[13px] leading-none font-black flex items-center">
                                  <span className="text-emerald-400">↑</span>
                                  <span className="text-rose-400">↓</span>
                                </span>
                              )}
                              {arrows.length === 0 && (
                                <span className="text-slate-700 text-[10px]">-</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedSubshell(sub.name);
                          setSelectedBoxIndex(null);
                          setHighlightMode('selected');
                        }}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase transition-all ${
                          isSelected
                            ? 'bg-brand-cyan/25 text-brand-cyan'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {sub.name}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full">
            <div className="w-[130px] border-r border-white/5 flex flex-col p-2.5 gap-1.5">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider pl-1 mb-0.5">
                Orbital Types
              </span>
              {Object.keys(SANDBOX_ORBITALS).map((key) => {
                const orb = SANDBOX_ORBITALS[key];
                const active = explorerOrbitalKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setExplorerOrbitalKey(key)}
                    className={`flex items-center justify-between text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      active
                        ? 'bg-brand-purple/15 text-brand-purple border border-brand-purple/25'
                        : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span>{orb.name}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-mono">{key}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto scrollbar-thin">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-white">
                    {SANDBOX_ORBITALS[explorerOrbitalKey].name} Shape Details
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-brand-cyan">
                    Capacity: {SANDBOX_ORBITALS[explorerOrbitalKey].capacity} electrons
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  {SANDBOX_ORBITALS[explorerOrbitalKey].desc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-2 font-mono text-[9px]">
                <div className="space-y-0.5">
                  <span className="text-gray-500 block">Nodes Structure:</span>
                  <span className="text-white font-bold">{SANDBOX_ORBITALS[explorerOrbitalKey].nodes}</span>
                </div>
                <div className="space-y-0.5 text-right">
                  <span className="text-gray-500 block">Spherical Harmonics Math:</span>
                  <span className="text-brand-purple font-bold">{SANDBOX_ORBITALS[explorerOrbitalKey].math}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
