import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Atom, 
  Zap, 
  Info,
  Layers,
  HelpCircle
} from 'lucide-react';

// Molecle data for Chemical Bonding Lab
const MOLECULES = {
  nacl: {
    id: 'nacl',
    name: 'Sodium Chloride (NaCl)',
    type: 'Ionic',
    strength: '787 kJ/mol (Very High)',
    geometry: 'Linear Diatomic (Lattice Unit)',
    electrons: 'Na transfers 1 valence e- to Cl',
    description: 'An ionic bond formed by the electrostatic attraction between oppositely charged sodium (Na⁺) and chloride (Cl⁻) ions after complete electron transfer.',
    atoms: [
      { name: 'Na', symbol: 'Na+', color: '#94a3b8', pos: [-1.2, 0, 0], radius: 0.35, isIon: true },
      { name: 'Cl', symbol: 'Cl-', color: '#22c55e', pos: [1.2, 0, 0], radius: 0.55, isIon: true }
    ],
    bonds: []
  },
  h2o: {
    id: 'h2o',
    name: 'Water (H₂O)',
    type: 'Polar Covalent',
    strength: '463 kJ/mol (High)',
    geometry: 'Bent (approx. 104.5°)',
    electrons: 'Oxygen shares 2 pairs of e- with Hydrogens',
    description: 'Polar covalent bonds where the highly electronegative oxygen atom shares electrons unequally with two hydrogen atoms, creating a dipole moment.',
    atoms: [
      { name: 'O', symbol: 'O', color: '#ef4444', pos: [0, 0.3, 0], radius: 0.45 },
      { name: 'H1', symbol: 'H', color: '#f8fafc', pos: [-0.9, -0.5, 0], radius: 0.25 },
      { name: 'H2', symbol: 'H', color: '#f8fafc', pos: [0.9, -0.5, 0], radius: 0.25 }
    ],
    bonds: [
      { from: [0, 0.3, 0], to: [-0.9, -0.5, 0] },
      { from: [0, 0.3, 0], to: [0.9, -0.5, 0] }
    ]
  },
  co2: {
    id: 'co2',
    name: 'Carbon Dioxide (CO₂)',
    type: 'Covalent (Double Bonds)',
    strength: '799 kJ/mol (Very High)',
    geometry: 'Linear (180°)',
    electrons: 'Carbon shares 4 pairs of e- (2 double bonds)',
    description: 'Nonpolar molecule containing two polar covalent double bonds. The linear geometry causes the dipole moments to cancel out.',
    atoms: [
      { name: 'C', symbol: 'C', color: '#4b5563', pos: [0, 0, 0], radius: 0.4 },
      { name: 'O1', symbol: 'O', color: '#ef4444', pos: [-1.3, 0, 0], radius: 0.45 },
      { name: 'O2', symbol: 'O', color: '#ef4444', pos: [1.3, 0, 0], radius: 0.45 }
    ],
    bonds: [
      { from: [0, 0.05, 0], to: [-1.3, 0.05, 0] },
      { from: [0, -0.05, 0], to: [-1.3, -0.05, 0] },
      { from: [0, 0.05, 0], to: [1.3, 0.05, 0] },
      { from: [0, -0.05, 0], to: [1.3, -0.05, 0] }
    ]
  },
  ch4: {
    id: 'ch4',
    name: 'Methane (CH₄)',
    type: 'Nonpolar Covalent',
    strength: '413 kJ/mol (Medium)',
    geometry: 'Tetrahedral (109.5°)',
    electrons: 'Carbon shares 4 pairs of e- with Hydrogens',
    description: 'Four single covalent bonds arranged symmetrically in three dimensions, resulting in a perfectly nonpolar tetrahedral structure.',
    atoms: [
      { name: 'C', symbol: 'C', color: '#4b5563', pos: [0, 0, 0], radius: 0.4 },
      { name: 'H1', symbol: 'H', color: '#f8fafc', pos: [0, 1.0, 0], radius: 0.25 },
      { name: 'H2', symbol: 'H', color: '#f8fafc', pos: [0.94, -0.33, 0.33], radius: 0.25 },
      { name: 'H3', symbol: 'H', color: '#f8fafc', pos: [-0.47, -0.33, 0.81], radius: 0.25 },
      { name: 'H4', symbol: 'H', color: '#f8fafc', pos: [-0.47, -0.33, -0.81], radius: 0.25 }
    ],
    bonds: [
      { from: [0, 0, 0], to: [0, 1.0, 0] },
      { from: [0, 0, 0], to: [0.94, -0.33, 0.33] },
      { from: [0, 0, 0], to: [-0.47, -0.33, 0.81] },
      { from: [0, 0, 0], to: [-0.47, -0.33, -0.81] }
    ]
  },
  nh3: {
    id: 'nh3',
    name: 'Ammonia (NH₃)',
    type: 'Polar Covalent',
    strength: '391 kJ/mol (Medium)',
    geometry: 'Trigonal Pyramidal (approx. 107.8°)',
    electrons: 'Nitrogen shares 3 pairs of e-, has 1 lone pair',
    description: 'A trigonal pyramidal molecule. The lone pair on the nitrogen atom exerts strong repulsion, pushing the N-H bonds closer together.',
    atoms: [
      { name: 'N', symbol: 'N', color: '#3b82f6', pos: [0, 0.2, 0], radius: 0.42 },
      { name: 'H1', symbol: 'H', color: '#f8fafc', pos: [0.85, -0.4, 0.25], radius: 0.25 },
      { name: 'H2', symbol: 'H', color: '#f8fafc', pos: [-0.42, -0.4, 0.77], radius: 0.25 },
      { name: 'H3', symbol: 'H', color: '#f8fafc', pos: [-0.42, -0.4, -0.77], radius: 0.25 }
    ],
    bonds: [
      { from: [0, 0.2, 0], to: [0.85, -0.4, 0.25] },
      { from: [0, 0.2, 0], to: [-0.42, -0.4, 0.77] },
      { from: [0, 0.2, 0], to: [-0.42, -0.4, -0.77] }
    ]
  }
};

// 3D Bonding Scene components
function MoleculeRenderer({ molecule, animateProgress, activeMkey }) {
  const electronRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Animate electrons for Covalent bonds (orbiting in overlap region)
    if (electronRef.current) {
      if (activeMkey === 'nacl') {
        // Ionic transfer animation
        const startX = -1.2;
        const endX = 1.2;
        const currentX = startX + (endX - startX) * animateProgress;
        electronRef.current.position.set(currentX, 0, 0);
      } else {
        // Covalent orbit
        electronRef.current.position.x = Math.sin(time * 3) * 0.4;
        electronRef.current.position.z = Math.cos(time * 3) * 0.4;
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Render Bonds (Cylinders) */}
      {molecule.bonds.map((bond, idx) => {
        const from = new THREE.Vector3(...bond.from);
        const to = new THREE.Vector3(...bond.to);
        const distance = from.distanceTo(to);
        const direction = new THREE.Vector3().subVectors(to, from).normalize();
        
        // Compute rotation quaternion
        const alignAxis = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(alignAxis, direction);
        const midpoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);

        return (
          <mesh 
            key={idx} 
            position={[midpoint.x, midpoint.y, midpoint.z]} 
            quaternion={quaternion}
          >
            <cylinderGeometry args={[0.05, 0.05, distance, 8]} />
            <meshStandardMaterial 
              color="#64748b" 
              metalness={0.7} 
              roughness={0.2} 
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      })}

      {/* Render Atoms */}
      {molecule.atoms.map((atom, idx) => (
        <group key={idx} position={atom.pos}>
          <mesh castShadow>
            <sphereGeometry args={[atom.radius, 32, 32]} />
            <meshStandardMaterial 
              color={atom.color} 
              roughness={0.2} 
              metalness={0.1}
            />
          </mesh>
          {/* Symbol Tag overlay */}
          <Html distanceFactor={4} position={[0, atom.radius + 0.15, 0]} center>
            <div className="bg-slate-950/90 border border-slate-700/50 text-[10px] px-1.5 py-0.5 rounded font-black text-white font-mono shadow-md select-none pointer-events-none">
              {atom.symbol}
            </div>
          </Html>
        </group>
      ))}

      {/* Electron animation helper */}
      {activeMkey === 'nacl' && (
        <mesh ref={electronRef} position={[-1.2, 0, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" toneMapped={false} />
        </mesh>
      )}

      {/* Render shared electrons for covalent */}
      {activeMkey !== 'nacl' && molecule.atoms.length > 1 && (
        <group>
          {molecule.bonds.map((bond, index) => {
            const from = new THREE.Vector3(...bond.from);
            const to = new THREE.Vector3(...bond.to);
            const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
            return (
              <group key={index} position={[mid.x, mid.y, mid.z]}>
                {/* Two small blue electrons orbiting the midpoint */}
                <mesh position={[Math.sin(index * 2) * 0.15, Math.cos(index * 2) * 0.15, 0]}>
                  <sphereGeometry args={[0.05, 12, 12]} />
                  <meshBasicMaterial color="#38bdf8" toneMapped={false} />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* Draw lone pair for Ammonia (NH3) */}
      {activeMkey === 'nh3' && (
        <group position={[0, 0.7, 0]}>
          <mesh>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial 
              color="#e0f2fe" 
              transparent 
              opacity={0.35} 
              roughness={0.1}
            />
          </mesh>
          <mesh position={[-0.07, 0, 0]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[0.07, 0, 0]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <Html distanceFactor={4} position={[0, 0.25, 0]} center>
            <span className="text-[7px] font-black text-sky-300 tracking-widest uppercase font-mono bg-sky-950/80 px-1 rounded">Lone Pair</span>
          </Html>
        </group>
      )}
    </group>
  );
}

export default function ChemicalBondingLab() {
  const [activeKey, setActiveKey] = useState('nacl');
  const [isRunning, setIsRunning] = useState(true);
  const [animateProgress, setAnimateProgress] = useState(0);

  const activeMolecule = MOLECULES[activeKey];

  useEffect(() => {
    setAnimateProgress(0);
  }, [activeKey]);

  useEffect(() => {
    let frameId;
    if (isRunning && activeKey === 'nacl') {
      const update = () => {
        setAnimateProgress(prev => {
          const next = prev + 0.015;
          return next > 1.0 ? 0 : next;
        });
        frameId = requestAnimationFrame(update);
      };
      frameId = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(frameId);
  }, [isRunning, activeKey]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 3D Viewport container */}
      <div className="relative w-full rounded-2xl border border-white/10 bg-[#02030a] overflow-hidden h-[340px] shadow-xl">
        <Canvas
          camera={{ position: [0, 0.5, 3.8], fov: 45 }}
          shadows
          className="h-full w-full"
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 5, 2]} intensity={1.5} castShadow />
          
          <MoleculeRenderer 
            molecule={activeMolecule}
            animateProgress={animateProgress}
            activeMkey={activeKey}
          />

          <OrbitControls 
            enableZoom={true} 
            maxDistance={6}
            minDistance={2.0}
            target={[0, 0, 0]}
            makeDefault
          />
        </Canvas>

        {/* 3D Badge */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div className="rounded-lg bg-[#050914]/85 border border-white/5 px-2.5 py-1 backdrop-blur-md text-[9px] font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5 shadow-md">
            <Atom className="h-3.5 w-3.5 text-violet-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Interactive 3D Bonding Space</span>
          </div>
        </div>

        {/* Play/Pause controls for Ionic animation */}
        {activeKey === 'nacl' && (
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
                  Pause Ionization
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  Animate e- Transfer
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Selection Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.values(MOLECULES).map(mol => (
          <button
            key={mol.id}
            onClick={() => setActiveKey(mol.id)}
            className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all shadow ${
              activeKey === mol.id 
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 border-transparent text-white'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {mol.name}
          </button>
        ))}
      </div>

      {/* Telemetry Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* BOND INFORMATION */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
              <Activity className="h-4 w-4 text-violet-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Bond Telemetry
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[10px] font-mono mb-2">
              <div className="bg-slate-950/60 p-2.5 rounded border border-white/5">
                <span className="text-gray-500 block text-[7px] uppercase tracking-wider">Bonding Category</span>
                <span className="text-violet-400 font-black">{activeMolecule.type}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-white/5">
                <span className="text-gray-500 block text-[7px] uppercase tracking-wider">Bond Dissociation Energy</span>
                <span className="text-emerald-400 font-bold">{activeMolecule.strength}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-white/5">
                <span className="text-gray-500 block text-[7px] uppercase tracking-wider">Molecular Geometry</span>
                <span className="text-white font-bold">{activeMolecule.geometry}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-white/5">
                <span className="text-gray-500 block text-[7px] uppercase tracking-wider">Electron System</span>
                <span className="text-sky-300 font-bold">{activeMolecule.electrons}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONCEPT EXPLANATION */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col gap-2.5 shadow-lg justify-between">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Info className="h-4 w-4 text-violet-400" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Molecular Insights
            </h3>
          </div>
          <p className="text-[10px] text-gray-300 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-white/5">
            {activeMolecule.description}
          </p>
        </div>
      </div>
    </div>
  );
}
