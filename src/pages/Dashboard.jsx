import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { subjects } from '../data/curriculum';
import { useAuth } from '../contexts/AuthContext';

// Dynamic Icon Renderer
const SubjectIcon = ({ name, className }) => {
  const IconComponent = Icons[name];
  if (!IconComponent) return <Icons.BookOpen className={className} />;
  return <IconComponent className={className} />;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  console.log('[Dashboard] Rendered. userProfile:', userProfile);

  // Simple animation container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8"
      >
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-brand-purple/10 blur-3xl"></div>
        <div className="absolute left-0 bottom-0 -ml-16 -mb-16 h-48 w-48 rounded-full bg-brand-cyan/10 blur-3xl"></div>

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/10 px-3 py-1 text-xs font-semibold text-brand-cyan">
            <Icons.Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Learning Dashboard Initialized
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-purple">{userProfile?.username || 'Explorer'}</span>
          </h1>
          <p className="max-w-2xl text-gray-400 text-sm sm:text-base">
            Embark on your scientific journey today. Select a subject below to resume your immersive learning simulations.
          </p>
        </div>
      </motion.div>

      {/* Overview Stats (Sleek visuals, linked to real database profile) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Current Level', val: `Level ${userProfile?.level || 1}`, icon: 'Award', color: 'text-brand-cyan' },
          { label: 'Experience Points', val: `${userProfile?.xp || 0} XP`, icon: 'Zap', color: 'text-yellow-400' },
          { label: 'Daily Streak', val: `${userProfile?.streak || 0} Days`, icon: 'Flame', color: 'text-orange-400' },
          { label: 'Lessons Completed', val: `${userProfile?.completedLessons?.length || 0} Lessons`, icon: 'CheckCircle', color: 'text-emerald-400' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="glass-panel p-4 rounded-xl flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-1">{stat.val}</h3>
            </div>
            <div className={`rounded-lg bg-white/5 p-2 ${stat.color}`}>
              <SubjectIcon name={stat.icon} className="h-5 w-5" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Subjects Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Icons.BookOpen className="h-5 w-5 text-brand-cyan" />
          Choose a Scientific Discipline
        </h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {Object.values(subjects).map((subject) => {
            // Calculate progress dynamically from profile completedLessons
            const totalLessons = subject.topics.reduce((acc, t) => acc + t.lessons.length, 0);
            const completedLessonsInSubject = userProfile?.completedLessons
              ? userProfile.completedLessons.filter(id => {
                  return subject.topics.some(t => t.lessons.some(l => l.id === id));
                }).length
              : 0;
            const progress = userProfile?.subjectProgress?.[subject.id] ?? 
              (totalLessons > 0 ? Math.round((completedLessonsInSubject / totalLessons) * 100) : 0);

            return (
              <motion.div
                key={subject.id}
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => navigate(`/${subject.id}`)}
                className="group cursor-pointer glass-panel rounded-2xl p-6 flex flex-col justify-between glow-card h-[360px]"
                style={{
                  boxShadow: `0 8px 32px 0 rgba(0,0,0,0.2), 0 0 1px 1px ${subject.glowColor}`
                }}
              >
                <div>
                  {/* Subject Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`rounded-xl bg-gradient-to-tr ${subject.color} p-3 text-white shadow-lg shadow-white/5 group-hover:scale-110 transition-transform duration-300`}>
                      <SubjectIcon name={subject.icon} className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-gray-400 tracking-wider">
                      {subject.topicsCount} Topics Available
                    </span>
                  </div>

                  {/* Subject Info */}
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-brand-cyan transition-all duration-300">
                    {subject.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                    {subject.description}
                  </p>

                  {/* Progress Section */}
                  <div className="mt-5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Progress</span>
                      <span className="font-semibold text-white">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${subject.color}`}
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium">
                      {completedLessonsInSubject} of {totalLessons} lessons completed
                    </p>
                  </div>
                </div>

                {/* Action Area */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-brand-cyan font-semibold flex items-center gap-1">
                    <Icons.TrendingUp className="h-3.5 w-3.5" />
                    Beginner to Advanced
                  </span>
                  <motion.button
                    whileHover={{ x: 3 }}
                    className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3.5 py-1.5 text-xs font-bold text-white border border-white/10 group-hover:bg-gradient-to-r group-hover:from-brand-purple group-hover:to-brand-cyan group-hover:border-transparent transition-all duration-300"
                  >
                    Continue Learning
                    <Icons.ArrowRight className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
