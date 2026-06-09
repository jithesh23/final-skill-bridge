import React, { useState, useEffect } from 'react';
import WelcomePage from './components/WelcomePage';
import AuthPage from './components/AuthPage';
import QualificationForm from './components/QualificationForm';
import StudentDashboard from './components/StudentDashboard';
import CompanyDashboard from './components/CompanyDashboard';
import { User, LogOut, Award } from 'lucide-react';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://final-skill-bridge.onrender.com/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('sb_token') || '');
  const [user, setUser] = useState(null);
  const [view, setView] = useState('welcome'); // 'welcome', 'auth', 'student-dashboard', 'company-dashboard', 'qualification-form'
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Fetch current user on token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('sb_token', token);
      fetchUserData();
    } else {
      localStorage.removeItem('sb_token');
      setUser(null);
      setView('welcome');
    }
  }, [token]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        // Route according to role & qualification status
        if (data.role === 'student') {
          if (!data.qualification || !data.qualification.degree) {
            setView('qualification-form');
          } else {
            setView('student-dashboard');
          }
        } else if (data.role === 'company') {
          setView('company-dashboard');
        }
      } else {
        // Token might be expired
        handleLogout();
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setView('welcome');
  };

  // Navigational router
  const renderView = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '80vh', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Syncing profile parameters...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }

    switch (view) {
      case 'welcome':
        return <WelcomePage onGetStarted={() => setView(token ? (user?.role === 'company' ? 'company-dashboard' : 'student-dashboard') : 'auth')} token={token} user={user} />;
      case 'auth':
        return <AuthPage setToken={setToken} onBack={() => setView('welcome')} />;
      case 'qualification-form':
        return <QualificationForm token={token} user={user} onComplete={fetchUserData} onLogout={handleLogout} />;
      case 'student-dashboard':
        return <StudentDashboard token={token} user={user} onLogout={handleLogout} fetchUserData={fetchUserData} onEditProfile={() => setView('qualification-form')} />;
      case 'company-dashboard':
        return <CompanyDashboard token={token} user={user} onLogout={handleLogout} />;
      default:
        return <WelcomePage onGetStarted={() => setView('auth')} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header / Navbar */}
      <header className="header-glass">
        <div className="container header-container">
          <div className="logo-text" style={{ cursor: 'pointer' }} onClick={() => setView('welcome')}>
            <Award size={28} style={{ color: '#a855f7' }} />
            <span>SkillBridge</span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span 
              onClick={() => setView(token ? (user?.role === 'company' ? 'company-dashboard' : 'student-dashboard') : 'welcome')} 
              style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '0.95rem' }}
              className="hover-bright"
            >
              Portal Home
            </span>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <User size={16} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                    {user.name} <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>({user.role})</span>
                  </span>
                </div>
                <button onClick={handleLogout} className="btn-glass-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button onClick={() => setView('auth')} className="btn-glass-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>
                Sign In
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Page Area */}
      <main style={{ flex: 1, position: 'relative' }}>
        <div className="glow-blur" style={{ top: '20%', left: '10%' }}></div>
        <div className="glow-blur" style={{ bottom: '20%', right: '10%', background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)' }}></div>
        
        {renderView()}
      </main>

      {/* Footer */}
      <footer style={{ background: '#08090f', borderTop: '1px solid rgba(255,255,255,0.03)', padding: '1.5rem 0', textAlign: 'center', marginTop: '4rem', zIndex: 10 }}>
        <div className="container">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            &copy; 2026 SkillBridge Inc. Connecting students with their career milestones.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
