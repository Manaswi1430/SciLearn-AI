import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Play, 
  RotateCcw, 
  Activity, 
  FlaskConical, 
  Plus, 
  Minus,
  Sparkles,
  Info
} from 'lucide-react';

const REACTIONS = {
  water: {
    id: 'water',
    name: 'Synthesis of Water',
    equation: '2 H₂ + O₂ → 2 H₂O',
    reactantDesc: 'Hydrogen gas (H₂) and Oxygen gas (O₂)',
    productDesc: 'Water molecules (H₂O)',
    formulaRatio: '2:1:2',
    reactants: [
      { name: 'H₂', count: 2, atoms: { H: 4, O: 0 } },
      { name: 'O₂', count: 1, atoms: { H: 0, O: 2 } }
    ],
    products: [
      { name: 'H₂O', count: 2, atoms: { H: 4, O: 2 } }
    ],
    drawReactants: (progress) => {
      // Return 3D group of 2 H2 and 1 O2
      // Slide closer as progress goes 0 -> 1
      const offset = (1 - progress) * 2;
      return (
        <group>
          {/* H2 molecule 1 */}
          <group position={[-1.2 - offset, 0.4, 0]}>
            <mesh position={[-0.15, 0, 0]}><sphereGeometry args={[0.16, 16, 16]} /><meshStandardMaterial color="#f8fafc" /></mesh>
            <mesh position={[0.15, 0, 0]}><sphereGeometry args={[0.16, 16, 16]} /><meshStandardMaterial color="#f8fafc" /></mesh>
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.03, 0.03, 0.3, 8]} /><meshStandardMaterial color="#94a3b8" /></mesh>
          </group>
          {/* H2 molecule 2 */}
          <group position={[-1.2 - offset, -0.4, 0]}>
            <mesh position={[-0.15, 0, 0]}><sphereGeometry args={[0.16, 16, 16]} /><meshStandardMaterial color="#f8fafc" /></mesh>
            <mesh position={[0.15, 0, 0]}><sphereGeometry args={[0.16, 16, 16]} /><meshStandardMaterial color="#f8fafc" /></mesh>
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.03, 0.03, 0.3, 8]} /><meshStandardMaterial color="#94a3b8" /></mesh>
          </group>
          {/* O2 molecule */}
          <group position={[-0.6 - offset, 0, 0.5]}>
            <mesh position={[-0.2, 0, 0]}><sphereGeometry args={[0.26, 16, 16]} /><meshStandardMaterial color="#ef4444" /></mesh>
            <mesh position={[0.2, 0, 0]}><sphereGeometry args={[0.26, 16, 16]} /><meshStandardMaterial color="#ef4444" /></mesh>
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 0.4, 8]} /><meshStandardMaterial color="#94a3b8" /></mesh>
          </group>
        </group>
      );
    },
    drawProducts: (progress) => {
      // Show water molecules moving to the right as progress goes 0 -> 1
      const offset = progress * 1.5;
      const scale = progress;
      return (
        <group scale={[scale, scale, scale]}>
          {/* H2O molecule 1 */}
          <group position={[0.6 + offset, 0.4, 0]}>
            <mesh position={[0, 0.15, 0]}><sphereGeometry args={[0.25, 24, 24]} /><meshStandardMaterial color="#ef4444" /></mesh>
            <mesh position={[-0.22, -0.12, 0]}><sphereGeometry args={[0.16, 16, 16]} /><meshStandardMaterial color="#f8fafc" /></mesh>
            <mesh position={[0.22, -0.12, 0]}><sphereGeometry args={[0.16, 16, 16]} /><meshStandardMaterial color="#f8fafc" /></mesh>
            <mesh position={[-0.11, 0.015, 0]} rotation={[0, 0, -Math.PI / 4]}><cylinderGeometry args={[0.03, 0.03, 0.3, 8]} /><meshStandardMaterial color="#94a3b8" /></mesh>
            <mesh position={[0.11, 0.015, 0]} rotation={[0, 0, Math.PI / 4]}><cylinderGeometry args={[0.03, 0.03, 0.3, 8]} /><meshStandardMaterial color="#94a3b8" /></mesh>
          </group>
          {/* H2O molecule 2 */}
          <group position={[1.2 + offset, -0.3, -0.3]}>
            <mesh position={[0, 0.15, 0]}><sphereGeometry args={[0.25, 24, 24]} /><meshStandardMaterial color="#ef4444" /></mesh>
            <mesh position={[-0.22, -0.12, 0]}><sphereGeometry args={[0.16, 16, 16]} /><meshStandardMaterial color="#f8fafc" /></mesh>
            <mesh position={[0.22, -0.12, 0]}><sphereGeometry args={[0.16, 16, 16]} /><meshStandardMaterial color="#f8fafc" /></mesh>
            <mesh position={[-0.11, 0.015, 0]} rotation={[0, 0, -Math.PI / 4]}><cylinderGeometry args={[0.03, 0.03, 0.3, 8]} /><meshStandardMaterial color="#94a3b8" /></mesh>
            <mesh position={[0.11, 0.015, 0]} rotation={[0, 0, Math.PI / 4]}><cylinderGeometry args={[0.03, 0.03, 0.3, 8]} /><meshStandardMaterial color="#94a3b8" /></mesh>
          </group>
        </group>
      );
    }
  },
  ammonia: {
    id: 'ammonia',
    name: 'Synthesis of Ammonia (Haber Process)',
    equation: 'N₂ + 3 H₂ → 2 NH₃',
    reactantDesc: 'Nitrogen gas (N₂) and Hydrogen gas (H₂)',
    productDesc: 'Ammonia molecules (NH₃)',
    formulaRatio: '1:3:2',
    reactants: [
      { name: 'N₂', count: 1, atoms: { N: 2, H: 0 } },
      { name: 'H₂', count: 3, atoms: { N: 0, H: 6 } }
    ],
    products: [
      { name: 'NH₃', count: 2, atoms: { N: 2, H: 6 } }
    ],
    drawReactants: (progress) => {
      const offset = (1 - progress) * 2;
      return (
        <group position={[-offset, 0, 0]}>
          {/* N2 molecule */}
          <group position={[-1.2, 0, 0]}>
            <mesh position={[-0.2, 0, 0]}><sphereGeometry args={[0.26, 16, 16]} /><meshStandardMaterial color="#3b82f6" /></mesh>
            <mesh position={[0.2, 0, 0]}><sphereGeometry args={[0.26, 16, 16]} /><meshStandardMaterial color="#3b82f6" /></mesh>
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 0.4, 8]} /><meshStandardMaterial color="#94a3b8" /></mesh>
          </group>
          {/* 3 H2 molecules */}
          <group position={[-0.6, 0.6, 0.3]}>
            <mesh position={[-0.15, 0, 0]}><sphereGeometry args={[0.15, 12, 12]} /><meshStandardMaterial color="#f8fafc" /></mesh>
            <mesh position={[0.15, 0, 0]}><sphereGeometry args={[0.15, 12, 12]} /><meshStandardMaterial color="#f8fafc" /></mesh>
          </group>
          <group position={[-0.6, -0.6, 0.3]}>
            <mesh position={[-0.15, 0, 0]}><sphereGeometry args={[0.15, 12, 12]} /><meshStandardMaterial color="#f8fafc" /></mesh>
            <mesh position={[0.15, 0, 0]}><sphereGeometry args={[0.15, 12, 12]} /><meshStandardMaterial color="#f8fafc" /></mesh>
          </group>
          <group position={[-0.2, 0, -0.4]}>
            <mesh position={[-0.15, 0, 0]}><sphereGeometry args={[0.15, 12, 12]} /><meshStandardMaterial color="#f8fafc" /></mesh>
            <mesh position={[0.15, 0, 0]}><sphereGeometry args={[0.15, 12, 12]} /><meshStandardMaterial color="#f8fafc" /></mesh>
          </group>
        </group>
      );
    },
    drawProducts: (progress) => {
      const offset = progress * 1.5;
      const scale = progress;
      return (
        <group scale={[scale, scale, scale]}>
          {/* NH3 molecule 1 */}
          <group position={[0.7 + offset, 0.3, 0]}>
            <mesh position={[0, 0.1, 0]}><sphereGeometry args={[0.25, 24, 24]} /><meshStandardMaterial color="#3b82f6" /></mesh>
            <mesh position={[0.22, -0.15, 0.1]}><sphereGeometry args={[0.15, 16, 16]} /><meshStandardMaterial color="#f8fafc" /></mesh>
            <mesh position={[-0.22, -0.15, 0.1]}><sphereGeometry args={[0.15, 16, 16]} /><meshStandardMaterial color="#f8fafc" /></mesh>
            <mesh position={[0, -0.15, -0.2]}><sphereGeometry args={[0.15, 16, 16]} /><meshStandardMaterial color="#f8fafc" /></mesh>
          </group>
          {/* NH3 molecule 2 */}
          <group position={[1.3 + offset, -0.4, -0.2]}>
            <mesh position={[0, 0.1, 0]}><sphereGeometry args={[0.25, 24, 24]} /><meshStandardMaterial color="#3b82f6" /></mesh>
            <mesh position={[0.22, -0.15, 0.1]}><sphereGeometry args={[0.15, 16, 16]} /><meshStandardMaterial color="#f8fafc" /></mesh>
            <mesh position={[-0.22, -0.15, 0.1]}><sphereGeometry args={[0.15, 16, 16]} /><meshStandardMaterial color="#f8fafc" /></mesh>
            <mesh position={[0, -0.15, -0.2]}><sphereGeometry args={[0.15, 16, 16]} /><meshStandardMaterial color="#f8fafc" /></mesh>
          </group>
        </group>
      );
    }
  }
};

export default function ChemicalReactionsLab() {
  const [activeKey, setActiveKey] = useState('water');
  const [reactionProgress, setReactionProgress] = useState(0);
  const [isReacted, setIsReacted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const activeReaction = REACTIONS[activeKey];

  useEffect(() => {
    // Reset state on reaction change
    setReactionProgress(0);
    setIsReacted(false);
    setIsAnimating(false);
  }, [activeKey]);

  const handleTrigger = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    let start = null;
    const duration = 1200; // ms

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1.0);
      setReactionProgress(progress);
      
      if (progress < 1.0) {
        requestAnimationFrame(step);
      } else {
        setIsReacted(true);
        setIsAnimating(false);
      }
    };
    requestAnimationFrame(step);
  };

  const handleReset = () => {
    setReactionProgress(0);
    setIsReacted(false);
    setIsAnimating(false);
  };

  // Compute atoms count
  const hydrogenBefore = activeKey === 'water' ? 4 : 6;
  const oxygenBefore = activeKey === 'water' ? 2 : 0;
  const nitrogenBefore = activeKey === 'water' ? 0 : 2;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 3D view container */}
      <div className="relative w-full rounded-2xl border border-white/10 bg-[#02030a] overflow-hidden h-[340px] shadow-xl">
        <Canvas
          camera={{ position: [0, 0.2, 3.8], fov: 45 }}
          shadows
          className="h-full w-full"
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 5, 2]} intensity={1.5} castShadow />

          {/* Reaction Container Cage */}
          <mesh>
            <boxGeometry args={[4.4, 2.0, 1.5]} />
            <meshStandardMaterial 
              color="#3b82f6" 
              wireframe 
              transparent 
              opacity={0.15} 
            />
          </mesh>

          {/* Divider line in middle */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.02, 2.0, 1.5]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
          </mesh>

          {/* Draw Reactants */}
          {!isReacted && activeReaction.drawReactants(reactionProgress)}

          {/* Glowing reaction flash in the center */}
          {isAnimating && reactionProgress > 0.4 && reactionProgress < 0.7 && (
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.8 * (1.5 - Math.abs(reactionProgress - 0.55) * 4), 32, 32]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} toneMapped={false} />
            </mesh>
          )}

          {/* Draw Products */}
          {(isReacted || isAnimating) && activeReaction.drawProducts(reactionProgress)}

          {/* Text Labels inside 3D space */}
          <Html position={[-1.2, 1.1, 0]} center>
            <div className="bg-[#050914]/90 border border-slate-700/60 px-2 py-0.5 rounded text-[8px] font-bold text-gray-400 font-mono shadow whitespace-nowrap">
              REACTANT CHAMBER
            </div>
          </Html>
          <Html position={[1.2, 1.1, 0]} center>
            <div className="bg-[#050914]/90 border border-slate-700/60 px-2 py-0.5 rounded text-[8px] font-bold text-gray-400 font-mono shadow whitespace-nowrap">
              PRODUCT CHAMBER
            </div>
          </Html>

          <OrbitControls 
            enableZoom={true} 
            maxDistance={5}
            minDistance={2.0}
            target={[0, 0, 0]}
            makeDefault
          />
        </Canvas>

        {/* 3D Badge */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div className="rounded-lg bg-[#050914]/85 border border-white/5 px-2.5 py-1 backdrop-blur-md text-[9px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 shadow-md">
            <FlaskConical className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
            <span>Conservation of Mass Lab</span>
          </div>
        </div>

        {/* Reaction Equation overlay */}
        <div className="absolute top-3 right-3 z-10">
          <div className="rounded-lg bg-sky-950/85 border border-sky-500/30 px-3 py-1.5 backdrop-blur-md text-xs font-black text-sky-300 font-mono shadow-md">
            {activeReaction.equation}
          </div>
        </div>

        {/* Reaction Trigger Button */}
        <div className="absolute bottom-3 right-3 z-10 flex gap-2">
          {!isReacted ? (
            <button 
              onClick={handleTrigger}
              disabled={isAnimating}
              className="flex h-9 px-4 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-[10px] font-bold transition-all shadow-md"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Trigger Reaction
            </button>
          ) : (
            <button 
              onClick={handleReset}
              className="flex h-9 px-4 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#050914]/80 text-gray-300 hover:text-white backdrop-blur-md transition-all shadow-md text-[10px]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Reaction
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {Object.values(REACTIONS).map(rxn => (
          <button
            key={rxn.id}
            onClick={() => setActiveKey(rxn.id)}
            className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all shadow ${
              activeKey === rxn.id 
                ? 'bg-gradient-to-r from-sky-600 to-blue-600 border-transparent text-white'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {rxn.name}
          </button>
        ))}
      </div>

      {/* Mass Conservation / Atom Counts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* ATOM BALANCE TELEMETRY */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
              <Activity className="h-4 w-4 text-sky-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Atom Balance & Conservation
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-mono">
              <div className="bg-slate-950/60 p-2 rounded border border-white/5">
                <span className="text-gray-500 block text-[6.5px] uppercase tracking-wider">Atom Type</span>
                <span className="text-white font-black">Hydrogen (H)</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded border border-white/5">
                <span className="text-gray-500 block text-[6.5px] uppercase tracking-wider">Reactants Count</span>
                <span className="text-sky-300 font-bold">{hydrogenBefore} atoms</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded border border-white/5">
                <span className="text-gray-500 block text-[6.5px] uppercase tracking-wider">Products Count</span>
                <span className="text-emerald-400 font-bold">{hydrogenBefore} atoms</span>
              </div>

              {activeKey === 'water' ? (
                <>
                  <div className="bg-slate-950/60 p-2 rounded border border-white/5">
                    <span className="text-gray-500 block text-[6.5px] uppercase tracking-wider">Atom Type</span>
                    <span className="text-white font-black">Oxygen (O)</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-white/5">
                    <span className="text-gray-500 block text-[6.5px] uppercase tracking-wider">Reactants Count</span>
                    <span className="text-sky-300 font-bold">{oxygenBefore} atoms</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-white/5">
                    <span className="text-gray-500 block text-[6.5px] uppercase tracking-wider">Products Count</span>
                    <span className="text-emerald-400 font-bold">{oxygenBefore} atoms</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-slate-950/60 p-2 rounded border border-white/5">
                    <span className="text-gray-500 block text-[6.5px] uppercase tracking-wider">Atom Type</span>
                    <span className="text-white font-black">Nitrogen (N)</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-white/5">
                    <span className="text-gray-500 block text-[6.5px] uppercase tracking-wider">Reactants Count</span>
                    <span className="text-sky-300 font-bold">{nitrogenBefore} atoms</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-white/5">
                    <span className="text-gray-500 block text-[6.5px] uppercase tracking-wider">Products Count</span>
                    <span className="text-emerald-400 font-bold">{nitrogenBefore} atoms</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* DETAILS CARD */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col gap-2.5 shadow-lg justify-between font-sans">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Info className="h-4 w-4 text-sky-400" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Conservation of Mass Principle
            </h3>
          </div>
          <div className="text-[10px] text-gray-300 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-white/5">
            <p className="mb-1.5">● **Stoichiometric Ratio**: The mole ratio for this reaction is **{activeReaction.formulaRatio}**.</p>
            <p>● **Mass Balance**: In chemical reactions, chemical bonds are broken and formed, but no atoms are created or destroyed. The total mass remains completely identical before and after reaction.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
