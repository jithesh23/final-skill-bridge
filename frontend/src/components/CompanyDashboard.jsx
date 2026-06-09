import React, { useState, useEffect } from 'react';
import { API_BASE } from '../App';
import { 
  Building, Briefcase, FileText, PlusCircle, CheckCircle, Mail, MapPin, 
  DollarSign, Clock, CheckCircle2, ShieldAlert, Users, Trash2, Send, Calendar, Star, Bookmark
} from 'lucide-react';
import confetti from 'canvas-confetti';

function CompanyDashboard({ token, user, onLogout }) {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'post', 'listings', 'applications'
  
  // Job Postings & Applications states
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  
  // Job Poster form states
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState(user?.name || '');
  const [jobLevel, setJobLevel] = useState('Mid-Level');
  const [jobType, setJobType] = useState('Full-Time');
  const [jobLocation, setJobLocation] = useState('');
  const [jobSalary, setJobSalary] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobReqs, setJobReqs] = useState('');
  
  // Call letter schedule form states
  const [offeringApp, setOfferingApp] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewLoc, setInterviewLoc] = useState('Google Meet / Zoom Virtual Link');
  const [recruiterNotes, setRecruiterNotes] = useState('');

  const [error, setError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/jobs`);
      if (res.ok) {
        const data = await res.json();
        // Filter jobs posted by this company
        const myJobs = data.filter(j => j.postedBy === user?._id || j.postedBy?._id === user?._id);
        setJobs(myJobs);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_BASE}/applications/company`, {
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

  const handlePostJob = async (e) => {
    e.preventDefault();
    setError('');
    setFormSuccess('');
    setLoading(true);

    const requirements = jobReqs
      .split(',')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: jobTitle,
          company: companyName,
          level: jobLevel,
          jobType,
          location: jobLocation,
          salary: jobSalary,
          description: jobDesc,
          requirements
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to post vacancy');

      setFormSuccess('Job vacancy posted successfully!');
      
      // Reset form fields
      setJobTitle('');
      setJobLocation('');
      setJobSalary('');
      setJobDesc('');
      setJobReqs('');
      
      fetchJobs();
      setTimeout(() => setFormSuccess(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? All related applications will be deleted.')) return;
    
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchJobs();
        fetchApplications();
      }
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchApplications();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleOfferCallLetter = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/applications/${offeringApp._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'Offered',
          callLetter: {
            interviewDate,
            interviewTime,
            location: interviewLoc,
            notes: recruiterNotes
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to dispatch call letter');

      // Trigger Confetti Effect for recruiting success!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#6366f1']
      });

      setOfferingApp(null);
      setInterviewDate('');
      setInterviewTime('');
      setRecruiterNotes('');
      fetchApplications();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Counting metrics for Analytics
  const countPending = applications.filter(a => a.status === 'Applied').length;
  const countReviewing = applications.filter(a => a.status === 'Reviewing').length;
  const countOffered = applications.filter(a => a.status === 'Offered').length;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="dashboard-grid">
        
        {/* SIDEBAR NAVIGATION */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Recruiter Details Card */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building size={20} style={{ color: '#fff' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{user?.name}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Company Recruiter</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <strong>Admin ID:</strong> #{user?._id?.substring(0,8)}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div className={`sidebar-link ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
              <Users size={18} />
              <span>Recruiter Panel</span>
            </div>

            <div className={`sidebar-link ${activeTab === 'post' ? 'active' : ''}`} onClick={() => setActiveTab('post')}>
              <PlusCircle size={18} />
              <span>Post a Vacancy</span>
            </div>
            
            <div className={`sidebar-link ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => setActiveTab('listings')}>
              <Briefcase size={18} />
              <span>Manage Listings</span>
              {jobs.length > 0 && (
                <span className="badge badge-purple" style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>{jobs.length}</span>
              )}
            </div>

            <div className={`sidebar-link ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>
              <FileText size={18} />
              <span>Applicants List</span>
              {(countPending + countReviewing) > 0 && (
                <span className="badge badge-red" style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                  {countPending + countReviewing}
                </span>
              )}
            </div>
          </div>
        </aside>

        {/* WORKSPACE CONTENT AREA */}
        <section>
          
          {/* TAB 1: RECRUITER ANALYTICS */}
          {activeTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Analytics Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>JOBS ACTIVE</span>
                    <div className="stat-val">{jobs.length}</div>
                  </div>
                  <Briefcase size={36} style={{ color: 'var(--primary)', opacity: 0.4 }} />
                </div>

                <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--accent-orange)' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>APPLICATIONS RECEIVED</span>
                    <div className="stat-val">{applications.length}</div>
                  </div>
                  <Users size={36} style={{ color: 'var(--accent-orange)', opacity: 0.4 }} />
                </div>

                <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--accent-green)' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>CALL LETTERS DISPATCHED</span>
                    <div className="stat-val">{countOffered}</div>
                  </div>
                  <Mail size={36} style={{ color: 'var(--accent-green)', opacity: 0.4 }} />
                </div>
              </div>

              {/* Overview panel */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={20} style={{ color: 'var(--secondary)' }} />
                  <span>Interactive Walkthrough Quick Start</span>
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  <p>
                    Welcome to the <strong>Recruiter Command Center</strong>. Follow these simple steps to test the full-stack loop:
                  </p>
                  <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>Navigate to <strong>Post a Vacancy</strong> and add a new internship or job listing.</li>
                    <li>Log out, sign up/login as a <strong>Student Candidate</strong>, fill in the qualification profile, and apply to your vacancy.</li>
                    <li>Log back into this recruiter profile, open <strong>Applicants List</strong>, review the candidate, and click <strong>Offer Call Letter</strong>.</li>
                    <li>Draft the date, time, and coordinates. This triggers a simulated email print in the console logs and delivers the visual Call Letter inside the student's dashboard inbox!</li>
                  </ol>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: POST A JOB VACANCY */}
          {activeTab === 'post' && (
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Post Job / Internship Vacancy</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>Fill in the details to publish a new role on the student job board.</p>

              {formSuccess && (
                <div style={{ background: 'var(--accent-green-bg)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.8rem 1rem', borderRadius: '8px', color: '#6ee7b7', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  {formSuccess}
                </div>
              )}

              {error && (
                <div style={{ background: 'var(--accent-red-bg)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.8rem 1rem', borderRadius: '8px', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handlePostJob} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                
                {/* Title & Company */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="glass-label">Job/Internship Title</label>
                    <input 
                      type="text" 
                      className="glass-input" 
                      placeholder="e.g. Software Engineer Intern"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="glass-label">Company Name</label>
                    <input 
                      type="text" 
                      className="glass-input" 
                      placeholder="e.g. Google Corporation"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Level & Type */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="glass-label">Company Level / Tier</label>
                    <select 
                      className="glass-input"
                      value={jobLevel}
                      onChange={(e) => setJobLevel(e.target.value)}
                      required
                    >
                      <option value="Top Tier">Top Tier (Multi-national / Fortune 500)</option>
                      <option value="Mid-Level">Mid-Level (Established Business)</option>
                      <option value="Startup">Startup (High growth / Early stage)</option>
                    </select>
                  </div>
                  <div>
                    <label className="glass-label">Job Type</label>
                    <select 
                      className="glass-input"
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      required
                    >
                      <option value="Internship">Internship (Co-op / Student Placement)</option>
                      <option value="Full-Time">Full-Time Career</option>
                    </select>
                  </div>
                </div>

                {/* Location & Salary */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="glass-label">Location</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        className="glass-input" 
                        style={{ paddingLeft: '2.6rem' }} 
                        placeholder="e.g. Mountain View, CA or Remote"
                        value={jobLocation}
                        onChange={(e) => setJobLocation(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="glass-label">Salary / Compensation Description</label>
                    <div style={{ position: 'relative' }}>
                      <DollarSign size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        className="glass-input" 
                        style={{ paddingLeft: '2.6rem' }} 
                        placeholder="e.g. $8,500 / month or $120,000 / year"
                        value={jobSalary}
                        onChange={(e) => setJobSalary(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Core description */}
                <div>
                  <label className="glass-label">Role Description</label>
                  <textarea 
                    className="glass-input"
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    placeholder="Provide a description of the project scopes, technical requirements, and expectations..."
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    required
                  />
                </div>

                {/* Requirements (Comma separated) */}
                <div>
                  <label className="glass-label">Requirements / Pre-requisites (Comma separated)</label>
                  <input 
                    type="text" 
                    className="glass-input" 
                    placeholder="Enrolled in Computer Science, React experience, 3.5+ GPA"
                    value={jobReqs}
                    onChange={(e) => setJobReqs(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.4rem' }}>
                    Provide qualifications or requirements separated by a comma. We will format them as checklist points.
                  </span>
                </div>

                {/* Submit button */}
                <button 
                  type="submit" 
                  className="btn-glass-primary"
                  style={{ padding: '0.9rem', width: 'fit-content', alignSelf: 'flex-start', marginTop: '1rem', gap: '0.5rem' }}
                  disabled={loading}
                >
                  {loading ? (
                    <span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <>
                      <PlusCircle size={18} />
                      <span>Post Job Vacancy</span>
                    </>
                  )}
                </button>

              </form>
            </div>
          )}

          {/* TAB 3: MANAGE JOB POSTINGS */}
          {activeTab === 'listings' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Active Job Postings</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Edit or delete active listings published by your recruiter account.</p>
              </div>

              {jobs.length === 0 ? (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Briefcase size={48} style={{ color: 'var(--text-muted)', marginBottom: '1.2rem', opacity: 0.5 }} />
                  <h3>No active postings</h3>
                  <p style={{ marginTop: '0.5rem' }}>Use the Post a Vacancy form to create your first listing.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {jobs.map(job => (
                    <div key={job._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h3 style={{ fontSize: '1.15rem' }}>{job.title}</h3>
                          <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{job.jobType}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><MapPin size={12} /> {job.location}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><DollarSign size={12} /> {job.salary}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteJob(job._id)} 
                        className="btn-glass-secondary" 
                        style={{ borderColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Trash2 size={14} />
                        <span>Delete Listing</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CANDIDATE APPLICATIONS MANAGER */}
          {activeTab === 'applications' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Applicants Management Pipeline</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Review student degree details, qualifications profile, and draft call letters.</p>
              </div>

              {applications.length === 0 ? (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '1.2rem', opacity: 0.5 }} />
                  <h3>No candidates have applied yet</h3>
                  <p style={{ marginTop: '0.5rem' }}>Active applicants for your job vacancies will appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {applications.map(app => (
                    <div key={app._id} className="glass-panel" style={{ padding: '1.8rem', borderLeft: `4px solid ${
                      app.status === 'Offered' ? 'var(--accent-green)' : app.status === 'Reviewing' ? 'var(--accent-orange)' : 'var(--primary)'
                    }` }}>
                      
                      {/* Top metadata */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Position:</span>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{app.job?.title}</h4>
                          <span className="badge badge-purple" style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>{app.job?.level}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
                          <div>
                            <span className={`badge ${
                              app.status === 'Offered' ? 'badge-green' : app.status === 'Reviewing' ? 'badge-orange' : app.status === 'Rejected' ? 'badge-red' : 'badge-blue'
                            }`} style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>
                              {app.status === 'Offered' ? 'Interview Offered' : app.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Candidate profile details */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', fontSize: '0.9rem' }}>
                        
                        {/* Left: Statement & Bio */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Candidate Name:</span>
                            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'white', marginTop: '0.2rem' }}>{app.student?.name}</div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{app.student?.email}</span>
                          </div>

                          <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Application Cover Note:</span>
                            <p style={{ background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                              "{app.personalStatement}"
                            </p>
                          </div>
                        </div>

                        {/* Right: Verified Degree Profile */}
                        <div style={{ background: 'rgba(99,102,241,0.02)', border: '1px solid rgba(99,102,241,0.08)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem', color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <Star size={14} />
                            <span>Verified Credentials</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Degree Study:</span>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{app.student?.qualification?.degree}</div>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Institution / GPA:</span>
                            <div style={{ fontSize: '0.85rem' }}>{app.student?.qualification?.institution} ({app.student?.qualification?.gpa})</div>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block', marginBottom: '0.2rem' }}>Verified Skillset Matrix:</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                              {app.student?.qualification?.skills && app.student.qualification.skills.map((skill, index) => (
                                <span key={index} style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', borderRadius: '4px', fontSize: '0.7rem' }}>
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Recruiter Action Buttons */}
                      <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '1.2rem', paddingTop: '1rem', justifyContents: 'flex-end' }}>
                        {app.status === 'Applied' && (
                          <button 
                            onClick={() => handleUpdateStatus(app._id, 'Reviewing')}
                            className="btn-glass-secondary" 
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                          >
                            Move to Reviewing
                          </button>
                        )}

                        {app.status !== 'Offered' && app.status !== 'Rejected' && (
                          <>
                            <button 
                              onClick={() => setOfferingApp(app)}
                              className="btn-glass-primary btn-glass-accent" 
                              style={{ padding: '0.5rem 1.2rem', fontSize: '0.8rem', gap: '0.3rem' }}
                            >
                              <Mail size={14} />
                              <span>Offer Call Letter</span>
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(app._id, 'Rejected')}
                              className="btn-glass-secondary" 
                              style={{ borderColor: 'rgba(239,68,68,0.15)', color: '#fca5a5', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                            >
                              Decline Candidate
                            </button>
                          </>
                        )}

                        {app.status === 'Offered' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-green)', fontSize: '0.85rem', fontWeight: 600 }}>
                            <CheckCircle2 size={16} />
                            <span>Official Call Letter Issued (Simulated Dispatch Logged)</span>
                          </div>
                        )}
                        
                        {app.status === 'Rejected' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-red)', fontSize: '0.85rem', fontWeight: 600 }}>
                            <XCircle size={16} />
                            <span>Candidate Declined</span>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </section>
      </div>

      {/* DRAFT CALL LETTER OFFER MODAL */}
      {offeringApp && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContents: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={22} style={{ color: 'var(--accent-green)' }} />
              <span>Draft Interview Call Letter</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Drafting invitation for candidate <strong>{offeringApp.student?.name}</strong> regarding the vacancy <strong>{offeringApp.job?.title}</strong>.
            </p>

            <form onSubmit={handleOfferCallLetter} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              {/* Date & Time fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="glass-label">Interview Date</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      className="glass-input" 
                      style={{ paddingLeft: '2.6rem' }} 
                      placeholder="e.g. June 15, 2026"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="glass-label">Interview Time slot</label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      className="glass-input" 
                      style={{ paddingLeft: '2.6rem' }} 
                      placeholder="e.g. 10:00 AM - 10:45 AM (EST)"
                      value={interviewTime}
                      onChange={(e) => setInterviewTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location Coordinates / Link coordinates */}
              <div>
                <label className="glass-label">Coordinates Location / Link</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="glass-input" 
                    style={{ paddingLeft: '2.6rem' }} 
                    placeholder="e.g. Stanford Campus Hall or Google Meet Link"
                    value={interviewLoc}
                    onChange={(e) => setInterviewLoc(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Context notes */}
              <div>
                <label className="glass-label">Special Recruiter Directions / Notes</label>
                <textarea 
                  className="glass-input" 
                  style={{ minHeight: '80px', resize: 'vertical' }} 
                  placeholder="Tell the candidate what to prepare, who they will meet, or if they need to bring any materials..."
                  value={recruiterNotes}
                  onChange={(e) => setRecruiterNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.05)', padding: '0.8rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.15)', fontSize: '0.75rem', color: '#6ee7b7' }}>
                💡 Submitting this form updates the applicant's state, logs the full Call Letter email dispatch on the backend console, and publishes an interactive envelope card in the student's dashboard inbox.
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setOfferingApp(null)} 
                  className="btn-glass-secondary" 
                  style={{ flex: 1 }}
                >
                  Discard Draft
                </button>
                <button 
                  type="submit" 
                  className="btn-glass-primary btn-glass-accent" 
                  style={{ flex: 2, gap: '0.4rem' }}
                  disabled={loading}
                >
                  {loading ? (
                    <span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Issue Call Letter</span>
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

export default CompanyDashboard;
