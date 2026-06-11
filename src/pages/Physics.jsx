import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Layers, Play, Sparkles } from 'lucide-react';
import { subjects } from '../data/curriculum';

export default function Physics() {
  const navigate = useNavigate();
  const data = subjects.physics;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="space-y-8">
      {/* Back navigation & Page title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
          <Sparkles className="h-3.5 w-3.5" />
          Physical Sciences Discipline
        </div>
      </div>

      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/45 to-blue-950/45 border border-cyan-500/20 p-6 sm:p-8"
      >
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"></div>
        <div className="relative z-10 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{data.title}</span>
          </h1>
          <p className="max-w-3xl text-gray-300 text-sm sm:text-base leading-relaxed">
            {data.description}
          </p>
        </div>
      </motion.div>

      {/* Topics Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="h-5 w-5 text-cyan-400" />
          Select a Topic to Study
        </h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {data.topics.map((topic) => (
            <motion.div
              key={topic.id}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => navigate(`/topic/${topic.id}`)}
              className="group cursor-pointer glass-panel rounded-xl p-6 flex flex-col justify-between hover:border-cyan-500/30 transition-colors"
            >
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors duration-200">
                  {topic.title}
                </h3>
                <p className="text-gray-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                  {topic.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-cyan-500/70" />
                  {topic.lessons.length} Lessons
                </span>
                <span className="flex items-center gap-1 font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">
                  Open Topic
                  <Play className="h-3 w-3 fill-current" />
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
