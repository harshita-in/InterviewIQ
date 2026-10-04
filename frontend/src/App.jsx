import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';
import SetupInterview from './pages/SetupInterview';
import LiveInterview from './pages/LiveInterview';
import ReportDetails from './pages/ReportDetails';
import CandidateDashboard from './pages/CandidateDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { api } from './utils/api';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const u = await api.getCurrentUser();
        setUser(u);
      } catch (err) {
        setUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    }
    loadUser();
  }, []);

  const handleStartPractice = () => {
    setCurrentView('setup');
  };

  const handleOpenDashboard = () => {
    setCurrentView('candidate_dashboard');
  };

  const handleOpenAdmin = () => {
    setCurrentView('admin');
  };

  const handleInterviewStarted = (sessionData) => {
    setActiveSession(sessionData);
    setCurrentView('live');
  };

  const handleInterviewFinished = (reportData) => {
    setSelectedReport(reportData);
    setCurrentView('report');
  };

  const handleOpenReportById = async (sessionId) => {
    try {
      const rep = await api.getReport(sessionId);
      setSelectedReport(rep);
      setCurrentView('report');
    } catch (err) {
      alert("Error fetching report: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('interviewsense_token');
    setUser(null);
    setActiveSession(null);
    setSelectedReport(null);
    setCurrentView('home');
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setCurrentView('home');
  };

  // 1. Initial Auth Check Spinner
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <p className="text-xs font-medium">Verifying Session...</p>
      </div>
    );
  }

  // 2. Strict Authentication Gate:
  // If user is logged out, ONLY the AuthPage is rendered!
  // No features, navbar, or dashboards are accessible without signing in!
  if (!user) {
    return (
      <AuthPage
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  // 3. Authenticated Application: All features visible only after login
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-900">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <Home
            onStartPractice={handleStartPractice}
            onOpenAdmin={handleOpenAdmin}
            onOpenDashboard={handleOpenDashboard}
          />
        )}

        {currentView === 'setup' && (
          <SetupInterview onInterviewStarted={handleInterviewStarted} />
        )}

        {currentView === 'live' && activeSession && (
          <LiveInterview
            sessionData={activeSession}
            onInterviewFinished={handleInterviewFinished}
          />
        )}

        {currentView === 'report' && (
          <ReportDetails
            reportData={selectedReport}
            onBackToDashboard={() => setCurrentView('candidate_dashboard')}
            onNewInterview={() => setCurrentView('setup')}
          />
        )}

        {currentView === 'candidate_dashboard' && (
          <CandidateDashboard
            onOpenReport={handleOpenReportById}
            onNewInterview={() => setCurrentView('setup')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard onOpenReport={handleOpenReportById} />
        )}
      </main>

      <Footer />
    </div>
  );
}
