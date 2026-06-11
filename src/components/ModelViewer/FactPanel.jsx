import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Info, HelpCircle } from 'lucide-react';
import { getFactByMeshName } from '../../data/modelFacts';

export default function FactPanel({ activePart }) {
  const factData = getFactByMeshName(activePart);

  return (
    <div className="glass-panel p-6 rounded-2xl border-white/10 shadow-2xl relative overflow-hidden h-full flex flex-col justify-center min-h-[180px]">
      {/* Background glow effects */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-purple/5 blur-xl"></div>
      <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-brand-cyan/5 blur-xl"></div>

      <AnimatePresence mode="wait">
        {activePart ? (
          <motion.div
            key={activePart}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 relative z-10"
          >
            {/* Tag Header */}
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-brand-cyan">
                <Info className="h-3 w-3 shrink-0" />
                Structural Fact
              </div>
              <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-purple">
                <Sparkles className="h-3 w-3 shrink-0 animate-pulse" />
                Interactive
              </div>
            </div>

            {/* Core Info */}
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                {factData?.title}
              </h3>
              <p className="text-sm font-semibold text-brand-cyan leading-relaxed">
                {factData?.fact}
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                {factData?.description}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-6 space-y-3 relative z-10"
          >
            <HelpCircle className="h-10 w-10 text-gray-500 mx-auto animate-pulse" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-gray-300">Interactive Exploration</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Click a highlighted part of the 3D model above to inspect its anatomical features, processes, and descriptions.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
