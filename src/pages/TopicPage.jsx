import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, ChevronRight, Sparkles, HelpCircle } from 'lucide-react';
import { getTopicById } from '../data/curriculum';
import LessonCard from '../components/LessonCard';

export default function TopicPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Find topic in curriculum database
  const topicInfo = getTopicById(id);

  if (!topicInfo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <HelpCircle className="h-16 w-16 text-red-500/60 animate-bounce" />
        <h2 className="text-2xl font-bold text-white">Topic Not Found</h2>
        <p className="text-gray-400 max-w-md">
          The topic you are looking for does not exist in our curriculum database.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="rounded-lg bg-gradient-to-r from-brand-purple to-brand-cyan px-4 py-2 font-semibold text-white"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Color theme mapper for subjects
  const getSubjectColorClass = (subId) => {
    switch (subId) {
      case 'biology': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
      case 'physics': return 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10';
      case 'chemistry': return 'text-violet-400 border-violet-500/20 bg-violet-500/10';
      default: return 'text-brand-purple border-brand-purple/20 bg-brand-purple/10';
    }
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
        <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/${topicInfo.subjectId}`} className="capitalize hover:text-white transition-colors">{topicInfo.subjectTitle}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-300 font-bold">{topicInfo.title}</span>
      </nav>

      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(`/${topicInfo.subjectId}`)}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {topicInfo.subjectTitle}
        </button>
      </div>

      {/* Topic Title / Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 p-4 opacity-5">
          <BookOpen className="h-32 w-32" />
        </div>
        
        <div className="relative z-10 space-y-3">
          <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getSubjectColorClass(topicInfo.subjectId)}`}>
            <Sparkles className="h-3.5 w-3.5" />
            {topicInfo.subjectTitle} Topic
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {topicInfo.title}
          </h1>
          <p className="max-w-3xl text-gray-400 text-sm sm:text-base leading-relaxed">
            {topicInfo.description}
          </p>
        </div>
      </motion.div>

      {/* Lessons List Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-brand-purple" />
          Available Lessons
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topicInfo.lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onClick={() => navigate(`/lesson/${lesson.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
