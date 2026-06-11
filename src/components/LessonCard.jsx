import React from 'react';
import { motion } from 'framer-motion';
import { Clock, BarChart, Play, ChevronRight } from 'lucide-react';

export default function LessonCard({ lesson, onClick }) {
  // Color code difficulty levels
  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Beginner':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Intermediate':
        return 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20';
      case 'Advanced':
        return 'text-brand-purple bg-brand-purple/10 border-brand-purple/20';
      default:
        return 'text-gray-400 bg-white/5 border-white/10';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="group cursor-pointer glass-panel rounded-xl p-5 flex items-center justify-between border-white/10 hover:border-brand-purple/30 transition-all duration-300 shadow-lg"
    >
      <div className="space-y-3 flex-1 pr-4">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getDifficultyColor(lesson.difficulty)}`}>
            <BarChart className="h-3 w-3" />
            {lesson.difficulty}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/5 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-gray-400">
            <Clock className="h-3 w-3" />
            {lesson.duration}
          </span>
        </div>

        {/* Lesson Title */}
        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-brand-cyan transition-colors duration-200">
          {lesson.title}
        </h3>
      </div>

      {/* Launch Action */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-gray-400 border border-white/10 group-hover:bg-gradient-to-tr group-hover:from-brand-purple group-hover:to-brand-cyan group-hover:text-white group-hover:border-transparent transition-all duration-300">
        <Play className="h-4 w-4 fill-current ml-0.5" />
      </div>
    </motion.div>
  );
}
