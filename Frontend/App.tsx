/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from '../Admin/components/AdminDashboard';
import { LandingPage } from './components/LandingPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<'landing' | 'login' | 'signup'>('landing');

  if (loading) {
    return (
      <div id="app-loading" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Initializing DevFlw workspace...</p>
      </div>
    );
  }

  if (user) {
    if (user.role === 'admin') {
      return <AdminDashboard />;
    }
    return <Dashboard />;
  }

  if (view === 'landing') {
    return (
      <LandingPage 
        onNavigateToAuth={(mode) => setView(mode)} 
      />
    );
  }

  return (
    <AuthPage 
      initialMode={view} 
      onBackToLanding={() => setView('landing')} 
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
