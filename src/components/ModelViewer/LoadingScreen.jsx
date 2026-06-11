import React from 'react';
import { useProgress } from '@react-three/drei';
import { Loader2, Sparkles } from 'lucide-react';

export default function LoadingScreen() {
  const { progress } = useProgress();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#02050f]/80 backdrop-blur-sm z-30 rounded-2xl border border-white/5">
      <div className="text-center space-y-4 max-w-xs p-6 glass-panel rounded-2xl border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-2 text-brand-cyan/20">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>
        
        <Loader2 className="h-10 w-10 text-brand-cyan animate-spin mx-auto" />
        
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Initializing 3D Module</h3>
          <p className="text-[11px] text-gray-500">Preparing high-fidelity scientific simulation</p>
        </div>

        <div className="space-y-1">
          <div className="h-1.5 w-48 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-brand-purple to-brand-cyan transition-all duration-300"
              style={{ width: `${Math.max(5, Math.round(progress))}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 font-bold tracking-widest">{Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
}
