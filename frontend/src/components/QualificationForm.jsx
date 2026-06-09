import React, { useState, useEffect } from 'react';
import { API_BASE } from '../App';
import { GraduationCap, Award, Calendar, BookOpen, Heart, Code2, ArrowRight } from 'lucide-react';

function QualificationForm({ token, user, onComplete, onLogout }) {
  const [degree, setDegree] = useState('');
  const [institution, setInstitution] = useState('');
  const [gradYear, setGradYear] = useState('2026');
  const [gpa, setGpa] = useState('');
  const [skillsString, setSkillsString] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill if some details exist
  useEffect(() => {
    if (user && user.qualification) {
      const q = user.qualification;
      setDegree(q.degree || '');
      setInstitution(q.institution || '');
      setGradYear(q.gradYear || '2026');
      setGpa(q.gpa || '');
      setSkillsString(q.skills ? q.skills.join(', ') : '');
      setBio(q.bio || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Split skills by commas and trim whitespace
    const skills = skillsString
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    try {
      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ degree, institution, gradYear, gpa, skills, bio })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update qualification profile');
      }

      onComplete(); // Triggers App to refresh user data and route to dashboard
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', padding: '2.5rem', position: 'relative', zIndex: 10 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <GraduationCap size={32} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Degree & Qualifications Profile</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto' }}>
            Before viewing available vacancies, please complete your profile details. Companies use this data during review pipelines.
          </p>
        </div>

        {error && (
          <div style={{ background: 'var(--accent-red-bg)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.8rem 1rem', borderRadius: '8px', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Degree & College Group */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="glass-label">Degree Qualification</label>
              <div style={{ position: 'relative' }}>
                <Award size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="glass-input" 
                  style={{ paddingLeft: '2.6rem' }} 
                  placeholder="e.g. B.S. Computer Science"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="glass-label">Institution / College</label>
              <div style={{ position: 'relative' }}>
                <BookOpen size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="glass-input" 
                  style={{ paddingLeft: '2.6rem' }} 
                  placeholder="e.g. Stanford University"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Grad Year & GPA Group */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="glass-label">Graduation Year</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <select 
                  className="glass-input" 
                  style={{ paddingLeft: '2.6rem' }}
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  required
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026 (Current)</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                </select>
              </div>
            </div>

            <div>
              <label className="glass-label">Cumulative GPA / Score</label>
              <div style={{ position: 'relative' }}>
                <Award size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="glass-input" 
                  style={{ paddingLeft: '2.6rem' }} 
                  placeholder="e.g. 3.85 / 4.00 or 9.2 CGPA"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Skills Area */}
          <div>
            <label className="glass-label">Core Skills (Comma-separated)</label>
            <div style={{ position: 'relative' }}>
              <Code2 size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="glass-input" 
                style={{ paddingLeft: '2.6rem' }} 
                placeholder="React, Node.js, Express, MongoDB, Python, TypeScript"
                value={skillsString}
                onChange={(e) => setSkillsString(e.target.value)}
                required
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.4rem' }}>
              Enter your tech stack/skills separated by a comma (e.g. Python, SQL). We will turn these into tags.
            </span>
          </div>

          {/* Short Bio */}
          <div>
            <label className="glass-label">Professional Summary / Bio</label>
            <div style={{ position: 'relative' }}>
              <Heart size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
              <textarea 
                className="glass-input" 
                style={{ paddingLeft: '2.6rem', minHeight: '100px', resize: 'vertical' }} 
                placeholder="Briefly tell companies about your background, projects, or what internships you are looking for..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              onClick={onLogout} 
              className="btn-glass-secondary" 
              style={{ flex: 1 }}
            >
              Sign Out
            </button>
            <button 
              type="submit" 
              className="btn-glass-primary" 
              style={{ flex: 2, gap: '0.5rem' }}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', animation: 'spin 1s linear infinite' }} />
              ) : (
                <>
                  <span>Save & Continue</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default QualificationForm;
