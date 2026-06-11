import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Zap, 
  Award, 
  BookOpen, 
  Layers, 
  Edit3, 
  Check, 
  X, 
  Save, 
  Flame, 
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../firebase/firestore';
import { getLessonById, getTopicById } from '../data/curriculum';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, userProfile, refreshProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(userProfile?.username || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!userProfile) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      setError('Username cannot be empty.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateUserProfile(currentUser.uid, {
        username: newUsername.trim()
      });
      await refreshProfile();
      setSuccess('Profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    return (userProfile.username || currentUser.email || 'US')
      .slice(0, 2)
      .toUpperCase();
  };

  // Calculate XP details
  const currentXp = userProfile.xp || 0;
  const currentLevel = userProfile.level || 1;
  const xpInCurrentLevel = currentXp % 100;
  const xpNeededForNextLevel = 100 - xpInCurrentLevel;

  // Map completed lessons to actual lesson objects
  const completedLessonsList = (userProfile.completedLessons || [])
    .map(id => getLessonById(id))
    .filter(Boolean);

  // Map completed topics to actual topic objects
  const completedTopicsList = (userProfile.completedTopics || [])
    .map(id => getTopicById(id))
    .filter(Boolean);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back to Dashboard Link */}
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden border-white/10"
      >
        <div className="absolute right-0 top-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-brand-purple/10 blur-3xl"></div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          {/* Profile Picture Placeholder */}
          <div className="relative group">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-cyan text-white text-3xl font-extrabold shadow-2xl">
              {getInitials()}
            </div>
            <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-cyan opacity-40 blur-md"></div>
          </div>

          {/* Profile Info Details */}
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              {isEditing ? (
                <form onSubmit={handleSave} className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="rounded-lg border border-white/20 bg-black/40 px-3 py-1.5 text-sm text-white focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    required
                  />
                  <div className="flex gap-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 p-2 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                      title="Save Changes"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsEditing(false); setNewUsername(userProfile.username); }}
                      className="rounded-lg bg-red-500/20 border border-red-500/30 p-2 text-red-400 hover:bg-red-500/30 transition-colors"
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {userProfile.username}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-brand-purple hover:bg-brand-purple/10 text-gray-400 hover:text-white transition-all"
                    title="Edit Username"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4 text-brand-cyan" />
                {currentUser?.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-brand-purple" />
                Joined {new Date(userProfile.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Alerts */}
        {error && (
          <div className="mt-4 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
            {success}
          </div>
        )}
      </motion.div>

      {/* Gamification Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Level & XP Card */}
        <div className="glass-panel p-6 rounded-2xl border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Level Status</h3>
            <Award className="h-5 w-5 text-brand-cyan" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-white">Level {currentLevel}</h2>
            <p className="text-xs text-gray-400">{currentXp} total Experience Points</p>
          </div>
          {/* Progress bar to next level */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Progress to Level {currentLevel + 1}</span>
              <span className="font-semibold text-brand-cyan">{xpInCurrentLevel}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-brand-purple to-brand-cyan"
                style={{ width: `${xpInCurrentLevel}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 font-medium">{xpNeededForNextLevel} XP needed for next level</p>
          </div>
        </div>

        {/* Streak Card */}
        <div className="glass-panel p-6 rounded-2xl border-white/10 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Daily Streak</h3>
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-white">{userProfile.streak || 0} Days</h2>
            <p className="text-xs text-gray-400">Keep studying daily to maintain your streak!</p>
          </div>
          <div className="pt-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-400">
              <Sparkles className="h-3 w-3 animate-pulse" />
              Streak Active
            </div>
          </div>
        </div>

        {/* Academic Overview Card */}
        <div className="glass-panel p-6 rounded-2xl border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Academic Overview</h3>
            <BookOpen className="h-5 w-5 text-brand-purple" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-sm text-gray-400">Lessons Completed</span>
              <span className="font-bold text-white text-lg">{completedLessonsList.length}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-sm text-gray-400">Topics Completed</span>
              <span className="font-bold text-white text-lg">{completedTopicsList.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Unlocked Achievements</span>
              <span className="font-bold text-white text-lg">{(userProfile.achievements || []).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons and Topics Completion Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Completed Lessons Section */}
        <div className="glass-panel p-6 rounded-2xl border-white/10 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            Completed Lessons ({completedLessonsList.length})
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {completedLessonsList.length > 0 ? (
              completedLessonsList.map((lesson, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl p-3.5"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white">{lesson.title}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {lesson.subjectTitle} • {lesson.topicTitle}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                    +50 XP
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                No lessons completed yet.
              </p>
            )}
          </div>
        </div>

        {/* Completed Topics Section */}
        <div className="glass-panel p-6 rounded-2xl border-white/10 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-brand-purple" />
            Completed Topics ({completedTopicsList.length})
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {completedTopicsList.length > 0 ? (
              completedTopicsList.map((topic, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl p-3.5"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white">{topic.title}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {topic.subjectTitle}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded border border-brand-purple/20 shrink-0">
                    +100 XP
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                No topics completed yet.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
