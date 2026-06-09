import React, { useState } from 'react';
import { API_BASE } from '../App';
import { KeyRound, Mail, User, ShieldAlert, ArrowLeft, ArrowRight, UserCheck } from 'lucide-react';

function AuthPage({ setToken, onBack }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student' or 'company'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin 
      ? { email, password }
      : { name, email, password, role };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Save token (which triggers App.jsx useEffect to fetch user details)
      setToken(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem', position: 'relative', zIndex: 10 }}>
        
        {/* Back Link */}
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '1.5rem' }} className="hover-bright">
          <ArrowLeft size={14} />
          <span>Back to Landing</span>
        </button>

        {/* Heading */}
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          {isLogin 
            ? 'Sign in to access your SkillBridge profile & opportunities' 
            : 'Fill in the credentials to set up your full-stack portal profile'}
        </p>

        {/* Error Callout */}
        {error && (
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--accent-red-bg)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.8rem 1rem', borderRadius: '8px', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {/* Registration Name Field */}
          {!isLogin && (
            <div>
              <label className="glass-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="glass-input" 
                  style={{ paddingLeft: '2.6rem' }} 
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="glass-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="glass-input" 
                style={{ paddingLeft: '2.6rem' }} 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="glass-label">Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="glass-input" 
                style={{ paddingLeft: '2.6rem' }} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Role selector (Registration Only) */}
          {!isLogin && (
            <div>
              <label className="glass-label">Choose Profile Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  style={{
                    padding: '0.8rem',
                    background: role === 'student' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${role === 'student' ? 'var(--primary)' : 'var(--panel-border)'}`,
                    borderRadius: '8px',
                    color: role === 'student' ? 'white' : 'var(--text-secondary)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <UserCheck size={16} />
                  <span>Student Applicant</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('company')}
                  style={{
                    padding: '0.8rem',
                    background: role === 'company' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${role === 'company' ? 'var(--primary)' : 'var(--panel-border)'}`,
                    borderRadius: '8px',
                    color: role === 'company' ? 'white' : 'var(--text-secondary)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <KeyRound size={16} />
                  <span>Company Recruiter</span>
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-glass-primary" 
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '0.5rem', gap: '0.5rem' }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <span>{isLogin ? 'Sign In to Portal' : 'Register Profile'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Switch Switcher */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {isLogin ? "Don't have a profile yet? " : "Already have a profile? "}
            <span 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
              className="hover-underline"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}

export default AuthPage;
