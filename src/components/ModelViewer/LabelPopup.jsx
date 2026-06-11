import React from 'react';
import { Html } from '@react-three/drei';
import { getFactByMeshName } from '../../data/modelFacts';

export default function LabelPopup({ activePart, position }) {
  if (!activePart || !position) return null;
  
  const factData = getFactByMeshName(activePart);

  // Position is expected to be a Vector3 or an object with { x, y, z }
  const posArray = Array.isArray(position) 
    ? position 
    : [position.x, position.y, position.z];

  return (
    <Html position={posArray} center distanceFactor={12} zIndexRange={[100, 200]}>
      <div 
        className="pointer-events-none select-none rounded-xl border border-white/25 bg-[#040815]/90 px-4 py-2.5 shadow-2xl backdrop-blur-md w-52 text-left relative animate-fade-in-up"
      >
        {/* Tiny triangular indicator */}
        <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#040815] border-r border-b border-white/25"></div>
        
        <h4 className="text-[11px] font-extrabold text-white uppercase tracking-wider truncate">
          {factData?.title || activePart}
        </h4>
        <p className="text-[10px] text-brand-cyan font-semibold mt-1 leading-relaxed">
          {factData?.fact}
        </p>
      </div>
    </Html>
  );
}
