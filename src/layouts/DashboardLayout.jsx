import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#040815] text-gray-200">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
