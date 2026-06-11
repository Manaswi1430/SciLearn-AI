import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, Mail, Lock, ArrowRight, Sparkles, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading, register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect to dashboard if session resolves or user is already authenticated
  useEffect(() => {
    console.log('[Register] Session check. currentUser:', currentUser ? currentUser.email : 'null', 'authLoading:', authLoading);
    if (currentUser && !authLoading) {
      console.log('[Register] User authenticated. Executing auto-redirect to /dashboard');
      navigate('/dashboard');
    }
  }, [currentUser, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    console.log('[Register] Form submitted. Attempting registration for:', email, 'with username:', username);
    try {
      await register(email, password, username.trim());
      console.log('[Register] Firebase registration and Firestore profile creation resolved successfully. Navigating to /dashboard');
      navigate('/dashboard');
    } catch (err) {
      console.error('[Register] Submission failed:', err);
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  // Generate random shapes for floating background
  const shapes = Array.from({ length: 12 });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#02050f] px-4 py-12">
      {/* Animated Floating Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {shapes.map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-tr from-brand-purple/10 to-brand-cyan/10 blur-xl"
            style={{
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 80 - 40, 0],
              y: [0, Math.random() * 80 - 40, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 w-full max-w-md"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-cyan p-[1.5px] shadow-2xl mb-4"
          >
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#040815]">
              <Cpu className="h-8 w-8 text-brand-cyan" />
            </div>
            {/* Pulsing light glow behind logo */}
            <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-cyan opacity-50 blur-lg animate-pulse-slow"></div>
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            SciLearn <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-purple">AI</span>
          </h1>
          <p className="mt-2 text-sm text-gray-400 text-center">
            Create your account to unlock interactive 3D learning
          </p>
        </div>

        {/* Card Form Container */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl relative border-white/10 overflow-hidden">
          <div className="absolute top-0 right-0 p-2 text-brand-cyan/20">
            <Sparkles className="h-6 w-6" />
          </div>

          {/* Error Message Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400 mb-6"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <User className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="explorer_john"
                  className="w-full rounded-xl border border-white/10 bg-[#090d1a]/50 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 transition-all focus:border-brand-purple focus:bg-[#090d1a] focus:outline-none focus:ring-1 focus:ring-brand-purple"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full rounded-xl border border-white/10 bg-[#090d1a]/50 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 transition-all focus:border-brand-purple focus:bg-[#090d1a] focus:outline-none focus:ring-1 focus:ring-brand-purple"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-[#090d1a]/50 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 transition-all focus:border-brand-purple focus:bg-[#090d1a] focus:outline-none focus:ring-1 focus:ring-brand-purple"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-[#090d1a]/50 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 transition-all focus:border-brand-purple focus:bg-[#090d1a] focus:outline-none focus:ring-1 focus:ring-brand-purple"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-purple/20 transition-all hover:shadow-brand-purple/45 focus:outline-none disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  Register
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>
              Already have an account?{' '}
              <Link
                to="/"
                className="font-semibold text-brand-cyan hover:underline focus:outline-none"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
