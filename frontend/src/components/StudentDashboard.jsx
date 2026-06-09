import React, { useState, useEffect } from 'react';
import { API_BASE } from '../App';
import { 
  Briefcase, Search, FileText, Bell, MapPin, DollarSign, Building, 
  Send, Sparkles, ChevronRight, CheckCircle2, Clock, XCircle, Printer, MailOpen, User, Edit
} from 'lucide-react';
import confetti from 'canvas-confetti';

function StudentDashboard({ token, user, onLogout, fetchUserData, onEditProfile }) {
  const [activeTab, setActiveTab] = useState('explore'); // 'explore', 'applications', 'notifications', 'resume'
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  
  // Applications states
  const [applications, setApplications] = useState([]);
  const [applyModalJob, setApplyModalJob] = useState(null);
  const [personalStatement, setPersonalStatement] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch Jobs & Applications
  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/jobs`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_BASE}/applications/student`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ jobId: applyModalJob._id, personalStatement })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit application');

      // Trigger Confetti Effect
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#a855f7', '#10b981']
      });

      setApplyModalJob(null);
      setPersonalStatement('');
      fetchApplications();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationRead = async (notifId) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUserData(); // Refresh user state to update notification badge
      }
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const handlePrint = (divId) => {
    const printContents = document.getElementById(divId).innerHTML;
    const originalContents = document.body.innerHTML;
    
    // Open a simple window to print cleanly
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>SkillBridge Call Letter</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 40px; color: #333; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px double #333; padding-bottom: 20px; margin-bottom: 30px; }
            .letter-body { background: white; padding: 20px; }
            .btn-print { display: none; }
          </style>
        </head>
        <body onload="window.print();window.close();">
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Filter Jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'All' || job.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  // Count unread notifications
  const unreadCount = user?.notifications?.filter(n => !n.read).length || 0;

  // Kanban status separator helper
  const getKanbanColumn = (status) => {
    return applications.filter(app => app.status === status);
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="dashboard-grid">
        
        {/* SIDEBAR NAVIGATION */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Welcome User Profile Card */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={20} style={{ color: '#fff' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{user?.name}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Student Account</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Degree Status:</span>
                <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Verified</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.qualification?.degree}
              </p>
              
              <button 
                onClick={onEditProfile} 
                className="btn-glass-secondary" 
                style={{ width: '100%', padding: '0.4rem', fontSize: '0.75rem', marginTop: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
              >
                <Edit size={12} />
                <span>Update Credentials</span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div className={`sidebar-link ${activeTab === 'explore' ? 'active' : ''}`} onClick={() => setActiveTab('explore')}>
              <Briefcase size={18} />
              <span>Explore Vacancies</span>
            </div>
            
            <div className={`sidebar-link ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>
              <FileText size={18} />
              <span>My Applications</span>
              {applications.length > 0 && (
                <span className="badge badge-blue" style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>{applications.length}</span>
              )}
            </div>

            <div className={`sidebar-link ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
              <Bell size={18} />
              <span>Call Letters / Inbox</span>
              {unreadCount > 0 && (
                <span className="badge badge-red" style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>{unreadCount}</span>
              )}
            </div>

            <div className={`sidebar-link ${activeTab === 'resume' ? 'active' : ''}`} onClick={() => setActiveTab('resume')}>
              <FileText size={18} />
              <span>Resume Builder</span>
            </div>
          </div>
        </aside>

        {/* WORKSPACE CONTENT AREA */}
        <section>
          
          {/* TAB 1: EXPLORE JOB VACANCIES */}
          {activeTab === 'explore' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Header / Search filters */}
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContents: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="glass-input" 
                    style={{ paddingLeft: '2.6rem' }} 
                    placeholder="Search by role, company, skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Level toggler */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['All', 'Top Tier', 'Mid-Level', 'Startup'].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        background: selectedLevel === lvl ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)',
                        color: selectedLevel === lvl ? 'white' : 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vacancy Card Grid */}
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={20} style={{ color: 'var(--secondary)' }} />
                  <span>Vetted Open Positions ({filteredJobs.length})</span>
                </h2>

                {filteredJobs.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Briefcase size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No job postings match your filters or search terms.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {filteredJobs.map(job => {
                      const hasApplied = applications.some(a => a.job._id === job._id || a.job === job._id);
                      
                      return (
                        <div key={job._id} className="glass-card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <span className={`badge ${
                                job.level === 'Top Tier' ? 'badge-purple' : job.level === 'Mid-Level' ? 'badge-blue' : 'badge-orange'
                              }`} style={{ marginRight: '0.5rem' }}>
                                {job.level}
                              </span>
                              <span className="badge badge-green">{job.jobType}</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.2rem' }}>{job.title}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                              <Building size={14} />
                              <span>{job.company}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <MapPin size={12} />
                              <span>{job.location}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <DollarSign size={12} />
                              <span>{job.salary}</span>
                            </div>
                          </div>

                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', flex: 1 }}>
                            {job.description}
                          </p>

                          {job.requirements && job.requirements.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                              {job.requirements.slice(0, 3).map((req, i) => (
                                <span key={i} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                  {req}
                                </span>
                              ))}
                            </div>
                          )}

                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                            {hasApplied ? (
                              <button disabled style={{ width: '100%', padding: '0.6rem', border: '1px dashed var(--accent-green)', color: 'var(--accent-green)', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                <CheckCircle2 size={14} />
                                <span>Applied Successfully</span>
                              </button>
                            ) : (
                              <button 
                                onClick={() => setApplyModalJob(job)} 
                                className="btn-glass-primary" 
                                style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
                              >
                                Apply to Vacancy
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: MY APPLICATIONS - KANBAN BOARD */}
          {activeTab === 'applications' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Application Pipeline</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Visual representation of your active recruitment applications.</p>
              </div>

              {applications.length === 0 ? (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '1.2rem', opacity: 0.5 }} />
                  <h3>No applications submitted</h3>
                  <p style={{ marginTop: '0.5rem' }}>Click Explore Vacancies to discover and apply for internships.</p>
                </div>
              ) : (
                <div className="kanban-board">
                  
                  {/* Applied Column */}
                  <div className="kanban-col">
                    <div className="kanban-col-header">
                      <span>Applied</span>
                      <span className="badge badge-blue">{getKanbanColumn('Applied').length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
                      {getKanbanColumn('Applied').map(app => (
                        <div key={app._id} className="glass-panel" style={{ padding: '1rem', fontSize: '0.85rem', borderLeft: '3px solid var(--primary)' }}>
                          <h4 style={{ fontWeight: 700 }}>{app.job?.title || 'Unknown Position'}</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{app.job?.company}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.8rem' }}>
                            <Clock size={12} />
                            <span>Submitted: {new Date(app.appliedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviewing Column */}
                  <div className="kanban-col">
                    <div className="kanban-col-header">
                      <span>Reviewing</span>
                      <span className="badge badge-orange">{getKanbanColumn('Reviewing').length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
                      {getKanbanColumn('Reviewing').map(app => (
                        <div key={app._id} className="glass-panel" style={{ padding: '1rem', fontSize: '0.85rem', borderLeft: '3px solid var(--accent-orange)' }}>
                          <h4 style={{ fontWeight: 700 }}>{app.job?.title}</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{app.job?.company}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.8rem' }}>
                            <Clock size={12} />
                            <span>Under Review</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Offered Column */}
                  <div className="kanban-col" style={{ background: 'rgba(16, 185, 129, 0.03)' }}>
                    <div className="kanban-col-header" style={{ color: 'var(--accent-green)' }}>
                      <span>Interview Offered</span>
                      <span className="badge badge-green">{getKanbanColumn('Offered').length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
                      {getKanbanColumn('Offered').map(app => (
                        <div key={app._id} className="glass-panel" style={{ padding: '1rem', fontSize: '0.85rem', border: '1px solid rgba(16, 185, 129, 0.3)', borderLeft: '4px solid var(--accent-green)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.1)' }}>
                          <h4 style={{ fontWeight: 700 }}>{app.job?.title}</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{app.job?.company}</p>
                          
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '0.8rem', paddingTop: '0.5rem' }}>
                            <button 
                              onClick={() => { setActiveTab('notifications'); }}
                              className="btn-glass-primary btn-glass-accent" 
                              style={{ width: '100%', padding: '0.3rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                            >
                              <MailOpen size={12} />
                              <span>Open Call Letter</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rejected Column */}
                  <div className="kanban-col">
                    <div className="kanban-col-header">
                      <span>Declined</span>
                      <span className="badge badge-red">{getKanbanColumn('Rejected').length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
                      {getKanbanColumn('Rejected').map(app => (
                        <div key={app._id} className="glass-panel" style={{ padding: '1rem', fontSize: '0.85rem', borderLeft: '3px solid var(--accent-red)', opacity: 0.7 }}>
                          <h4 style={{ fontWeight: 700 }}>{app.job?.title}</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{app.job?.company}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-red)', fontSize: '0.7rem', marginTop: '0.8rem' }}>
                            <XCircle size={12} />
                            <span>Declined</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB 3: INBOX / CALL LETTERS */}
          {activeTab === 'notifications' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Inbox & Offer Letters</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Official communications and interview call letters from recruiters.</p>
              </div>

              {!user?.notifications || user.notifications.length === 0 ? (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Bell size={48} style={{ color: 'var(--text-muted)', marginBottom: '1.2rem', opacity: 0.5 }} />
                  <h3>Inbox is empty</h3>
                  <p style={{ marginTop: '0.5rem' }}>Your interview invitations and offers will appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {user.notifications.map(notif => {
                    const isOffer = notif.type === 'offer' && notif.callLetter;
                    
                    return (
                      <div 
                        key={notif._id} 
                        className={`glass-panel ${isOffer ? 'envelope-card' : ''}`} 
                        style={{ padding: '1.5rem', borderLeft: !isOffer ? '4px solid var(--primary)' : '' }}
                        onClick={() => { if (!notif.read) markNotificationRead(notif._id); }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            {!notif.read && (
                              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                            )}
                            <h3 style={{ fontSize: '1.1rem', color: isOffer ? '#c7d2fe' : 'white' }}>{notif.title}</h3>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(notif.date).toLocaleString()}
                          </span>
                        </div>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
                          {notif.message}
                        </p>

                        {/* Expandable Call Letter Letterhead (Aesthetically Stunning!) */}
                        {isOffer && (
                          <div id={`letter-${notif._id}`} className="call-letter-letter" style={{ marginTop: '1rem', position: 'relative' }}>
                            
                            {/* Watermark/Stamp */}
                            <div style={{ position: 'absolute', right: '30px', top: '30px', border: '3px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', color: 'rgba(16, 185, 129, 0.5)', padding: '0.5rem 1rem', transform: 'rotate(15deg)', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', pointerEvents: 'none' }}>
                              SELECTED / OFFERED
                            </div>

                            <div style={{ textAlign: 'center', borderBottom: '2px double #475569', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                              <h3 style={{ fontSize: '1.4rem', margin: 0, textTransform: 'uppercase', letterSpacing: '2px', color: '#1e293b' }}>
                                OFFICIAL CALL LETTER
                              </h3>
                              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.3rem 0 0' }}>
                                ISSUED VIA SKILLBRIDGE ECOSYSTEM | {notif.callLetter.company.toUpperCase()} HIRING COMMITTEE
                              </p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                              <div>
                                <strong>Date:</strong> {new Date(notif.date).toLocaleDateString()}<br />
                                <strong>Ref No:</strong> SB-{notif._id?.substring(notif._id.length - 8).toUpperCase() || 'OFFER-REF'}
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <strong>Candidate:</strong> {user.name}<br />
                                <strong>Degree:</strong> {user.qualification?.degree}
                              </div>
                            </div>

                            <div style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: '#334155' }}>
                              <p>Dear {user.name},</p>
                              <br />
                              <p>
                                Following a review of your credentials, degree profile, and application pitch, the hiring board at <strong>{notif.callLetter.company}</strong> is pleased to invite you for an interview sequence for the position of <strong>{notif.callLetter.position}</strong>.
                              </p>
                              <br />
                              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', marginBottom: '1rem' }}>
                                <tbody>
                                  <tr>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', width: '140px', fontWeight: 'bold' }}>Interview Date:</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{notif.callLetter.interviewDate}</td>
                                  </tr>
                                  <tr>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>Interview Time:</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{notif.callLetter.interviewTime}</td>
                                  </tr>
                                  <tr>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>Platform/Link:</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', color: '#2563eb' }}>{notif.callLetter.location}</td>
                                  </tr>
                                  <tr>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>Compensation:</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{notif.callLetter.salary}</td>
                                  </tr>
                                </tbody>
                              </table>
                              <br />
                              <p><strong>Recruiter Directions & Context Notes:</strong></p>
                              <p style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', fontStyle: 'italic', borderLeft: '3px solid #64748b' }}>
                                "{notif.callLetter.notes || 'Our team looks forward to evaluating your core competencies. Please join the link on time.'}"
                              </p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem', borderTop: '1px solid #cbd5e1', paddingTop: '1rem' }}>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                Generated on behalf of {notif.callLetter.company} Recruiter Dashboard
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handlePrint(`letter-${notif._id}`); }}
                                className="btn-glass-secondary btn-print" 
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#cbd5e1', color: '#1e293b', border: '1px solid #94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                <Printer size={14} />
                                <span>Print Call Letter</span>
                              </button>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RESUME PREVIEW */}
          {activeTab === 'resume' && (
            <div>
              <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Verified Resume</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>A dynamically compiled resume based on your verified credentials profile.</p>
                </div>
                <button 
                  onClick={() => handlePrint('verified-resume-document')}
                  className="btn-glass-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Printer size={16} />
                  <span>Download / Print PDF</span>
                </button>
              </div>

              {/* Resume Card wrapper */}
              <div id="verified-resume-document" className="glass-panel" style={{ padding: '3rem', background: '#ffffff', color: '#1e293b', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto', border: '1px solid #cbd5e1', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                
                {/* Header info */}
                <div style={{ borderBottom: '2px solid #6366f1', paddingBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <h1 style={{ fontSize: '2rem', color: '#1e1b4b', margin: 0 }}>{user?.name}</h1>
                    <p style={{ color: '#6366f1', fontWeight: 600, fontSize: '1.1rem', margin: '0.3rem 0 0' }}>{user?.qualification?.degree}</p>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#475569' }}>
                    <p>Email: {user?.email}</p>
                    <p>Verified Candidate | SkillBridge ID: #{user?._id?.substring(0,8)}</p>
                  </div>
                </div>

                {/* Professional summary */}
                <div>
                  <h3 style={{ textTransform: 'uppercase', fontSize: '0.95rem', color: '#6366f1', letterSpacing: '1px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem', marginBottom: '0.8rem' }}>
                    Professional Summary
                  </h3>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#334155' }}>
                    {user?.qualification?.bio || 'Highly motivated graduate seeking career-launching internship opportunities in their field of degree study.'}
                  </p>
                </div>

                {/* Education */}
                <div>
                  <h3 style={{ textTransform: 'uppercase', fontSize: '0.95rem', color: '#6366f1', letterSpacing: '1px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem', marginBottom: '0.8rem' }}>
                    Education Details
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '0.3rem', fontWeight: 'bold', color: '#1e293b' }}>
                    <span>{user?.qualification?.institution}</span>
                    <span>Graduation: {user?.qualification?.gradYear}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#475569' }}>
                    <span>{user?.qualification?.degree}</span>
                    <span>Cumulative GPA: {user?.qualification?.gpa}</span>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 style={{ textTransform: 'uppercase', fontSize: '0.95rem', color: '#6366f1', letterSpacing: '1px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem', marginBottom: '0.8rem' }}>
                    Verified Skillset Matrix
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {user?.qualification?.skills && user.qualification.skills.map((skill, index) => (
                      <span key={index} style={{ padding: '4px 10px', background: '#f1f5f9', color: '#334155', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid #cbd5e1', fontWeight: 500 }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certifications (Visual Mock) */}
                <div>
                  <h3 style={{ textTransform: 'uppercase', fontSize: '0.95rem', color: '#6366f1', letterSpacing: '1px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem', marginBottom: '0.8rem' }}>
                    Affiliated Credentials
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic' }}>
                    This candidate profile has been cryptographically locked and verified through the SkillBridge University Database Connector.
                  </p>
                </div>

              </div>
            </div>
          )}

        </section>
      </div>

      {/* VACANCY APPLICATION DIALOG MODAL */}
      {applyModalJob && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '560px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Vacancy Application Form</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Applying for <strong>{applyModalJob.title}</strong> at <strong>{applyModalJob.company}</strong>
            </p>

            {submitError && (
              <div style={{ background: 'var(--accent-red-bg)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.8rem 1rem', borderRadius: '8px', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
                {submitError}
              </div>
            )}

            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              {/* Autofilled profile metadata */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Verified Candidate profile attached:</span>
                <div>
                  <strong>Degree:</strong> {user?.qualification?.degree}
                </div>
                <div>
                  <strong>Institution:</strong> {user?.qualification?.institution} (Grad: {user?.qualification?.gradYear})
                </div>
                <div>
                  <strong>GPA:</strong> {user?.qualification?.gpa}
                </div>
              </div>

              {/* Personal statement input */}
              <div>
                <label className="glass-label">Cover Note / Candidate Pitch</label>
                <textarea 
                  className="glass-input" 
                  style={{ minHeight: '120px', resize: 'vertical' }} 
                  placeholder="Explain why you are an ideal fit for this vacancy. Mention key projects, skills, or prior learnings..."
                  value={personalStatement}
                  onChange={(e) => setPersonalStatement(e.target.value)}
                  required
                />
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => { setApplyModalJob(null); setPersonalStatement(''); setSubmitError(''); }} 
                  className="btn-glass-secondary" 
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-glass-primary" 
                  style={{ flex: 2, gap: '0.4rem' }}
                  disabled={loading}
                >
                  {loading ? (
                    <span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default StudentDashboard;
