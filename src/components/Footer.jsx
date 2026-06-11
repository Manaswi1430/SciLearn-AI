import React from 'react';
import { Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-[#030712] py-8 text-center text-sm text-gray-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-brand-cyan" />
            <span className="font-semibold text-gray-400">SciLearn AI</span>
            <span className="text-xs text-gray-600">|</span>
            <span className="text-xs text-gray-500">Phase 1 Foundation</span>
          </div>
          <p className="text-xs">
            &copy; {new Date().getFullYear()} SciLearn AI. Built for premium immersive science education.
          </p>
        </div>
      </div>
    </footer>
  );
}
