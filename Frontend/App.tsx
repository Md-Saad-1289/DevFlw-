/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from '../Admin/components/AdminDashboard';
import { LandingPage } from './components/LandingPage';
import { ActivatePage } from './components/ActivatePage';

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'activate'>('landing');
  const [activationToken, setActivationToken] = useState<string | null>(null);
  const [activationEmail, setActivationEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check if there is an activation token and email in the URL on startup
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    if (token && email) {
      setActivationToken(token);
      setActivationEmail(email);
      setView('activate');
    }
  }, []);

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

  if (view === 'activate' && activationToken && activationEmail) {
    return (
      <ActivatePage
        email={activationEmail}
        token={activationToken}
        onSuccess={() => {
          // Clear URL search params after activation success so refreshing doesn't loop back
          window.history.replaceState({}, document.title, window.location.pathname);
        }}
        onGoToHome={() => {
          window.history.replaceState({}, document.title, window.location.pathname);
          setView('landing');
        }}
      />
    );
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
      initialMode={view === 'activate' ? 'login' : view} 
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
