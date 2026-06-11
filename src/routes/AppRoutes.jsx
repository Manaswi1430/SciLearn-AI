import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

// Lazy load pages
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Biology = lazy(() => import('../pages/Biology'));
const Physics = lazy(() => import('../pages/Physics'));
const Chemistry = lazy(() => import('../pages/Chemistry'));
const TopicPage = lazy(() => import('../pages/TopicPage'));
const LessonPage = lazy(() => import('../pages/LessonPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));

// Glassmorphic loading spinner while routes load
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] text-white">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-brand-purple/30 border-t-brand-cyan rounded-full animate-spin" />
      <span className="text-xs font-mono text-gray-400">Loading SciLearn Space...</span>
    </div>
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected/Dashboard Routes wrapped in DashboardLayout and ProtectedRoute */}
        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/biology" element={<Biology />} />
          <Route path="/physics" element={<Physics />} />
          <Route path="/chemistry" element={<Chemistry />} />
          <Route path="/topic/:id" element={<TopicPage />} />
          <Route path="/lesson/:id" element={<LessonPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
