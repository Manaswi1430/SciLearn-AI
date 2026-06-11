import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Atom, 
  Activity, 
  Layers, 
  Sliders,
  Sparkles,
  Info,
  ChevronRight,
  Eye
} from 'lucide-react';

const ORGANICS = {
  methane: {
    id: 'methane',
    name: 'Methane (Alkane)',
    formula: 'CH₄',
    structural: 'CH₄',
    group: 'Alkane (Saturated Hydrocarbon)',
    description: 'The simplest alkane. Carbon forms four single tetrahedral covalent bonds with hydrogen atoms.',
    highlightDesc: 'No special functional group; contains only C-H single sigma bonds.',
    atoms: [
      { name: 'C', color: '#4b5563', pos: [0, 0, 0], radius: 0.38, highlight: false },
      { name: 'H', color: '#f8fafc', pos: [0, 0.9, 0], radius: 0.23, highlight: false },
      { name: 'H', color: '#f8fafc', pos: [0.85, -0.3, 0.3], radius: 0.23, highlight: false },
      { name: 'H', color: '#f8fafc', pos: [-0.42, -0.3, 0.73], radius: 0.23, highlight: false },
      { name: 'H', color: '#f8fafc', pos: [-0.42, -0.3, -0.73], radius: 0.23, highlight: false }
    ],
    bonds: [
      { from: [0, 0, 0], to: [0, 0.9, 0] },
      { from: [0, 0, 0], to: [0.85, -0.3, 0.3] },
      { from: [0, 0, 0], to: [-0.42, -0.3, 0.73] },
      { from: [0, 0, 0], to: [-0.42, -0.3, -0.73] }
    ]
  },
  ethane: {
    id: 'ethane',
    name: 'Ethane (Alkane)',
    formula: 'C₂H₆',
    structural: 'CH₃ - CH₃',
    group: 'Alkane (Saturated)',
    description: 'A two-carbon alkane. Rotation around the central carbon-carbon single bond is highly free.',
    highlightDesc: 'Single covalent C-C sigma bond in the center.',
    atoms: [
      { name: 'C', color: '#4b5563', pos: [-0.6, 0, 0], radius: 0.38, highlight: false },
      { name: 'C', color: '#4b5563', pos: [0.6, 0, 0], radius: 0.38, highlight: false },
      { name: 'H', color: '#f8fafc', pos: [-1.1, 0.8, 0], radius: 0.23, highlight: false },
      { name: 'H', color: '#f8fafc', pos: [-1.1, -0.4, 0.7], radius: 0.23, highlight: false },
      { name: 'H', color: '#f8fafc', pos: [-1.1, -0.4, -0.7], radius: 0.23, highlight: false },
      { name: 'H', color: '#f8fafc', pos: [1.1, -0.8, 0], radius: 0.23, highlight: false },
      { name: 'H', color: '#f8fafc', pos: [1.1, 0.4, -0.7], radius: 0.23, highlight: false },
      { name: 'H', color: '#f8fafc', pos: [1.1, 0.4, 0.7], radius: 0.23, highlight: false }
    ],
    bonds: [
      { from: [-0.6, 0, 0], to: [0.6, 0, 0] },
      { from: [-0.6, 0, 0], to: [-1.1, 0.8, 0] },
      { from: [-0.6, 0, 0], to: [-1.1, -0.4, 0.7] },
      { from: [-0.6, 0, 0], to: [-1.1, -0.4, -0.7] },
      { from: [0.6, 0, 0], to: [1.1, -0.8, 0] },
      { from: [0.6, 0, 0], to: [1.1, 0.4, -0.7] },
      { from: [0.6, 0, 0], to: [1.1, 0.4, 0.7] }
    ]
  },
  ethene: {
    id: 'ethene',
    name: 'Ethene (Alkene)',
    formula: 'C₂H₄',
    structural: 'CH₂ = CH₂',
    group: 'Alkene (Unsaturated)',
    description: 'An unsaturated hydrocarbon containing a carbon-carbon double bond (one sigma and one pi bond). Planar geometry.',
    highlightDesc: 'C=C double bond restricts rotation and forms a flat planar shape.',
    atoms: [
      { name: 'C', color: '#4b5563', pos: [-0.6, 0, 0], radius: 0.38, highlight: true },
      { name: 'C', color: '#4b5563', pos: [0.6, 0, 0], radius: 0.38, highlight: true },
      { name: 'H', color: '#f8fafc', pos: [-1.15, 0.7, 0], radius: 0.23, highlight: false },
      { name: 'H', color: '#f8fafc', pos: [-1.15, -0.7, 0], radius: 0.23, highlight: false },
      { name: 'H', color: '#f8fafc', pos: [1.15, 0.7, 0], radius: 0.23, highlight: false },
      { name: 'H', color: '#f8fafc', pos: [1.15, -0.7, 0], radius: 0.23, highlight: false }
    ],
    bonds: [
      { from: [-0.6, 0.05, 0], to: [0.6, 0.05, 0] },
      { from: [-0.6, -0.05, 0], to: [0.6, -0.05, 0] },
      { from: [-0.6, 0, 0], to: [-1.15, 0.7, 0] },
      { from: [-0.6, 0, 0], to: [-1.15, -0.7, 0] },
      { from: [0.6, 0, 0], to: [1.15, 0.7, 0] },
      { from: [0.6, 0, 0], to: [1.15, -0.7, 0] }
    ]
  },
  ethyne: {
    id: 'ethyne',
    name: 'Ethyne (Alkyne)',
    formula: 'C₂H₂',
    structural: 'CH ≡ CH',
    group: 'Alkyne (Triple Bond)',
    description: 'Contains a triple bond (one sigma and two pi bonds) between the carbon atoms. Linear geometry.',
    highlightDesc: 'Carbon-Carbon triple bond (alkyne functional group).',
    atoms: [
      { name: 'C', color: '#4b5563', pos: [-0.55, 0, 0], radius: 0.38, highlight: true },
      { name: 'C', color: '#4b5563', pos: [0.55, 0, 0], radius: 0.38, highlight: true },
      { name: 'H', color: '#f8fafc', pos: [-1.35, 0, 0], radius: 0.23, highlight: false },
      { name: 'H', color: '#f8fafc', pos: [1.35, 0, 0], radius: 0.23, highlight: false }
    ],
    bonds: [
      { from: [-0.55, 0.08, 0], to: [0.55, 0.08, 0] },
      { from: [-0.55, 0, 0], to: [0.55, 0, 0] },
      { from: [-0.55, -0.08, 0], to: [0.55, -0.08, 0] },
      { from: [-0.55, 0, 0], to: [-1.35, 0, 0] },
      { from: [0.55, 0, 0], to: [1.35, 0, 0] }
    ]
  }
};

function OrganicModel({ molecule, showHighlight }) {
  return (
    <group>
      {/* Draw Bonds */}
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
            <cylinderGeometry args={[0.045, 0.045, distance, 8]} />
            <meshStandardMaterial 
              color="#64748b" 
              metalness={0.7} 
              roughness={0.2} 
            />
          </mesh>
        );
      })}

      {/* Draw Atoms */}
      {molecule.atoms.map((atom, idx) => {
        const isHighlighted = showHighlight && atom.highlight;

        return (
          <group key={idx} position={atom.pos}>
            <mesh castShadow>
              <sphereGeometry args={[atom.radius, 32, 32]} />
              <meshStandardMaterial 
                color={atom.color} 
                roughness={0.2} 
                metalness={0.1}
              />
            </mesh>

            {/* Glowing bubble overlay around highlighted functional group */}
            {isHighlighted && (
              <mesh>
                <sphereGeometry args={[atom.radius * 1.55, 16, 16]} />
                <meshStandardMaterial 
                  color="#22c55e" 
                  transparent 
                  opacity={0.35} 
                  emissive="#22c55e"
                  emissiveIntensity={0.8}
                  wireframe
                />
              </mesh>
            )}

            {/* Small dynamic tags */}
            <Html distanceFactor={4} position={[0, atom.radius + 0.15, 0]} center>
              <span className="bg-slate-950/80 px-1 py-0.2 rounded text-[7px] text-gray-400 font-mono select-none">
                {atom.name}
              </span>
            </Html>
          </group>
        );
      })}

    </group>
  );
}

export default function OrganicChemistryLab() {
  const [activeKey, setActiveKey] = useState('methane');
  const [showHighlight, setShowHighlight] = useState(true);

  const activeMolecule = ORGANICS[activeKey];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 3D view container */}
      <div className="relative w-full rounded-2xl border border-white/10 bg-[#02030a] overflow-hidden h-[340px] shadow-xl">
        <Canvas
          camera={{ position: [0, 0.5, 3.8], fov: 45 }}
          shadows
          className="h-full w-full"
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 5, 2]} intensity={1.5} castShadow />
          
          <OrganicModel molecule={activeMolecule} showHighlight={showHighlight} />

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
          <div className="rounded-lg bg-[#050914]/85 border border-white/5 px-2.5 py-1 backdrop-blur-md text-[9px] font-bold text-fuchsia-400 uppercase tracking-wider flex items-center gap-1.5 shadow-md">
            <Atom className="h-3.5 w-3.5 text-fuchsia-400 animate-pulse" />
            <span>Organic Molecule Viewer</span>
          </div>
        </div>

        {/* Highlight functional group toggle */}
        <div className="absolute bottom-3 right-3 z-10">
          <button 
            onClick={() => setShowHighlight(!showHighlight)}
            className={`flex h-8 px-3 items-center justify-center gap-1.5 rounded-xl border border-white/10 text-[10px] font-bold backdrop-blur-md transition-all shadow-md ${
              showHighlight ? 'bg-emerald-950/80 text-emerald-300' : 'bg-slate-950/80 text-gray-300'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            {showHighlight ? 'Highlighting ON' : 'Highlighting OFF'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.values(ORGANICS).map(org => (
          <button
            key={org.id}
            onClick={() => setActiveKey(org.id)}
            className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all shadow ${
              activeKey === org.id 
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 border-transparent text-white'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {org.name}
          </button>
        ))}
      </div>

      {/* Telemetry Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* PROPERTIES PANEL */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
              <Activity className="h-4 w-4 text-fuchsia-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Molecular Formulae
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[10px] font-mono mb-2">
              <div className="bg-slate-950/60 p-2.5 rounded border border-white/5">
                <span className="text-gray-500 block text-[7px] uppercase tracking-wider">Molecular Formula</span>
                <span className="text-fuchsia-400 font-black">{activeMolecule.formula}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-white/5">
                <span className="text-gray-500 block text-[7px] uppercase tracking-wider">Structural Formula</span>
                <span className="text-emerald-400 font-bold">{activeMolecule.structural}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-white/5 col-span-2">
                <span className="text-gray-500 block text-[7px] uppercase tracking-wider">Functional Group Class</span>
                <span className="text-white font-bold">{activeMolecule.group}</span>
              </div>
            </div>
          </div>
        </div>

        {/* FUNCTIONAL HIGHLIGHT INSIGHTS */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col gap-2.5 shadow-lg justify-between font-sans">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Info className="h-4 w-4 text-fuchsia-400" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Organic Insights
            </h3>
          </div>
          <div className="text-[10px] text-gray-300 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-white/5 space-y-1.5">
            <p>● **Core Description**: {activeMolecule.description}</p>
            <p>● **Functional Group Highlight**: {activeMolecule.highlightDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
