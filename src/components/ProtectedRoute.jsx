import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Cpu } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  console.log('[ProtectedRoute] Rendered. currentUser:', currentUser ? currentUser.email : 'null', 'loading:', loading);

  if (loading) {
    console.log('[ProtectedRoute] Loading state active. Rendering spinner...');
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#02050f] text-gray-200">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-cyan p-[1.5px] shadow-2xl mb-4 animate-pulse">
          <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#040815]">
            <Cpu className="h-8 w-8 text-brand-cyan animate-spin-slow" />
          </div>
        </div>
        <p className="text-sm font-semibold tracking-wider text-gray-400 uppercase animate-pulse">
          Initializing SciLearn Environment...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    console.log('[ProtectedRoute] Access denied: No user logged in. Redirecting to "/"');
    return <Navigate to="/" replace />;
  }

  console.log('[ProtectedRoute] Access granted: User authenticated. Rendering children.');
  return children;
}
