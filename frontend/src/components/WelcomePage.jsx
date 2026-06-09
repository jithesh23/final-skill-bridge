import React from 'react';
import { ArrowRight, Briefcase, GraduationCap, Building2, MailOpen, TrendingUp, Compass } from 'lucide-react';

function WelcomePage({ onGetStarted, token, user }) {
  return (
    <div style={{ padding: '4rem 0', position: 'relative', zIndex: 5 }}>
      {/* Hero Section */}
      <section className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', marginBottom: '6rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', padding: '0.4rem 1rem', borderRadius: '99px', width: 'fit-content', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
            <Compass size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', color: '#a5b4fc', letterSpacing: '0.05em' }}>Navigate Your Next Career Move</span>
          </div>
          
          <h1 style={{ fontSize: '3.6rem', lineHeight: '1.1', fontWeight: 800 }}>
            Bridge the Gap Between <span className="gradient-text">Skills</span> & <span className="gradient-text">Opportunities</span>.
          </h1>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: '1.6', maxWidth: '520px' }}>
            SkillBridge is the premium full-stack ecosystem designed to connect university degree graduates with internship openings and career vacancies. Apply with one-click, track live reviews, and receive official call letters instantly.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={onGetStarted} className="btn-glass-primary float-animate" style={{ padding: '1rem 2.2rem', fontSize: '1.05rem', gap: '0.75rem' }}>
              <span>{token ? 'Enter Dashboard' : 'Get Started'}</span>
              <ArrowRight size={18} />
            </button>
            <a href="#explore-features" className="btn-glass-secondary" style={{ padding: '1rem 2rem', fontSize: '1.05rem' }}>
              Learn More
            </a>
          </div>
        </div>

        {/* Visual Graphic Showcase */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          {/* Main Backdrop Art */}
          <div style={{ width: '100%', height: '400px', background: 'linear-gradient(225deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.05) 100%)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Embedded Floating Cards */}
            <div className="glass-panel pulse-glow-animate" style={{ position: 'absolute', top: '15%', left: '-5%', padding: '1.2rem', width: '220px', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-blue">Internship</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>1 hr ago</span>
              </div>
              <h4 style={{ fontSize: '0.95rem' }}>UI Engineer Intern</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Google Corporation</p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 600 }}>$8,500/mo</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mountain View</span>
              </div>
            </div>

            <div className="glass-panel" style={{ position: 'absolute', bottom: '15%', right: '-5%', padding: '1.2rem', width: '240px', display: 'flex', flexDirection: 'column', gap: '0.6rem', borderLeft: '3px solid var(--accent-green)', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }}></div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-green)' }}>Interview Call Letter</span>
              </div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Amazon (AWS) AWS</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Interview scheduled for June 15, 2026 at 10:00 AM</p>
              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', color: '#818cf8', fontSize: '0.75rem', fontWeight: 500 }}>
                <MailOpen size={12} />
                <span>Letter generated & sent</span>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', width: '260px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.8rem', transform: 'rotate(-3deg)' }}>
              <div style={{ background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContents: 'center', alignSelf: 'center', margin: '0 auto' }}>
                <GraduationCap size={24} style={{ color: '#fff', margin: 'auto' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem' }}>Profile Synced</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Degree and Skills Verified</p>
              </div>
              <span className="badge badge-green" style={{ width: 'fit-content', margin: '0 auto' }}>B.S. Computer Science</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Board */}
      <section className="container" style={{ marginBottom: '6rem' }}>
        <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', padding: '2rem', gap: '2rem', textAlign: 'center' }}>
          <div>
            <span style={{ color: 'var(--primary)', fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-title)' }}>12,000+</span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500, marginTop: '0.5rem' }}>Active Vacancies</p>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: 'var(--secondary)', fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-title)' }}>450+</span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500, marginTop: '0.5rem' }}>Partner Companies</p>
          </div>
          <div>
            <span style={{ color: 'var(--accent-cyan)', fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-title)' }}>98.6%</span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500, marginTop: '0.5rem' }}>Hiring Success Rate</p>
          </div>
        </div>
      </section>

      {/* Information Columns */}
      <section id="explore-features" className="container" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>Integrated Recruitment Ecosystem</h2>
          <p style={{ color: 'var(--text-secondary)' }}>SkillBridge manages all aspects of the bridge between university graduation and professional employment.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          <div className="glass-card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={22} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>Search Vacancies</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Browse through vetted internship and full-time postings by tier categories: Top Tier Multi-nationals, Mid-level Enterprises, or high-growth Startups.
            </p>
          </div>

          <div className="glass-card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={22} style={{ color: 'var(--secondary)' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>Degree Profile Validation</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Lock in your verified degree qualifications, institution info, skills matrix, and personal bio details. Recruiters see your qualified profile immediately.
            </p>
          </div>

          <div className="glass-card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MailOpen size={22} style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>Automated Call Letters</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              When selected, recruiters issue a custom Call Letter scheduling the interview session, pushing it directly to your account inbox and dispatching via email.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default WelcomePage;
