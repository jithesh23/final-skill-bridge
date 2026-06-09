const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { User, Job, Application } = require('./models');

const JWT_SECRET = process.env.JWT_SECRET || 'skillbridge_jwt_secret_token_key_2026_abc';
const mockFilePath = path.join(__dirname, 'mock_db.json');

// --- JSON File-Based Mock Database Helpers ---
function getMockDB() {
  if (!fs.existsSync(mockFilePath)) {
    // Initial Seed Data for Job Board (so the portal isn't empty)
    const initialSeed = {
      users: [
        {
          _id: "60c72b2f9b1d8a2c88888881",
          name: "Google Recruiter",
          email: "google@google.com",
          password: bcrypt.hashSync("google123", 10),
          role: "company",
          qualification: {},
          notifications: [],
          createdAt: new Date()
        },
        {
          _id: "60c72b2f9b1d8a2c88888882",
          name: "Amazon Recruiter",
          email: "amazon@amazon.com",
          password: bcrypt.hashSync("amazon123", 10),
          role: "company",
          qualification: {},
          notifications: [],
          createdAt: new Date()
        }
      ],
      jobs: [
        {
          _id: "60c72b2f9b1d8a2c88888883",
          title: "Software Engineer Intern",
          company: "Google",
          level: "Top Tier",
          jobType: "Internship",
          location: "Mountain View, CA",
          salary: "$8,500 / month",
          description: "Work on core Google products alongside world-class engineers. Experience in C++, Java, or Python is preferred.",
          requirements: ["Enrolled in BS/MS in Computer Science", "Proficiency in data structures and algorithms", "Familiarity with React or Node.js"],
          postedBy: "60c72b2f9b1d8a2c88888881",
          createdAt: new Date()
        },
        {
          _id: "60c72b2f9b1d8a2c88888884",
          title: "Cloud Architect Associate",
          company: "Amazon (AWS)",
          level: "Top Tier",
          jobType: "Full-Time",
          location: "Seattle, WA",
          salary: "$145,000 / year",
          description: "Design and implement scalable AWS solutions for enterprise customers. Leverage services such as EC2, S3, RDS, Lambda, and more.",
          requirements: ["BS degree in Computer Engineering or related field", "AWS Certified Solutions Architect Associate (Preferred)", "Excellent networking and system knowledge"],
          postedBy: "60c72b2f9b1d8a2c88888882",
          createdAt: new Date()
        },
        {
          _id: "60c72b2f9b1d8a2c88888885",
          title: "Frontend React Developer",
          company: "Fintech Innovators",
          level: "Mid-Level",
          jobType: "Full-Time",
          location: "New York, NY (Hybrid)",
          salary: "$105,000 / year",
          description: "Help build modern trading dashboards using React, Redux, and TailwindCSS. Join a fast-paced team pushing changes daily.",
          requirements: ["2+ years of professional React experience", "Strong CSS layouts skills", "Familiarity with Chart.js or D3.js"],
          postedBy: "60c72b2f9b1d8a2c88888881",
          createdAt: new Date()
        },
        {
          _id: "60c72b2f9b1d8a2c88888886",
          title: "Fullstack Web Developer",
          company: "EcoGrowth",
          level: "Startup",
          jobType: "Internship",
          location: "Remote",
          salary: "$2,500 / month",
          description: "We are building the future of carbon footprint offsets. Help us connect UI tools to database metrics in Node.js.",
          requirements: ["Experience with HTML, CSS, JS", "Basic knowledge of Express & MongoDB", "Self-motivated and able to work independently"],
          postedBy: "60c72b2f9b1d8a2c88888882",
          createdAt: new Date()
        }
      ],
      applications: []
    };
    fs.writeFileSync(mockFilePath, JSON.stringify(initialSeed, null, 2));
  }
  return JSON.parse(fs.readFileSync(mockFilePath, 'utf8'));
}

function saveMockDB(data) {
  fs.writeFileSync(mockFilePath, JSON.stringify(data, null, 2));
}

function getUseMock() {
  return process.env.USE_MOCK_DB === 'true';
}

// --- Helper: Send Simulated or Real Call Letter Email ---
async function sendCallLetterEmail(studentEmail, studentName, jobTitle, companyName, callLetter) {
  const emailContent = `
    Dear ${studentName},

    Congratulations! We are pleased to offer you an interview / call letter for the position of "${jobTitle}" at "${companyName}".

    Details of the Call Letter / Interview:
    --------------------------------------------------
    Position: ${jobTitle}
    Date: ${callLetter.interviewDate}
    Time: ${callLetter.interviewTime}
    Location/Platform: ${callLetter.location}
    
    Recruiter Notes:
    "${callLetter.notes || 'No special notes. We look forward to talking to you.'}"
    --------------------------------------------------

    Please be prepared on time. Our team will contact you shortly with video link details if necessary.

    Best Regards,
    Hiring Team
    ${companyName} | SkillBridge Portal
  `;

  console.log(`\n============== EMAIL DISPATCH SIMULATOR ==============`);
  console.log(`To: ${studentEmail}`);
  console.log(`Subject: Interview Offer Call Letter - ${jobTitle} at ${companyName}`);
  console.log(`Content:\n${emailContent}`);
  console.log(`======================================================\n`);

  // Try real SMTP sending if credentials are valid (not 'mock')
  if (process.env.SMTP_USER && process.env.SMTP_USER !== 'mock') {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
        port: parseInt(process.env.SMTP_PORT) || 2525,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@skillbridge.com',
        to: studentEmail,
        subject: `Interview Call Letter: ${jobTitle} at ${companyName}`,
        text: emailContent
      });
      console.log(`SMTP Success: Email sent to ${studentEmail}`);
    } catch (err) {
      console.error('SMTP sending failed (falling back to simulator only):', err.message);
    }
  }
}

// --- Middleware: Verify Auth Token ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Authentication token required' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token is invalid or expired' });
    req.user = decoded;
    next();
  });
};

// --- ROUTES IMPLEMENTATION ---

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required registration details' });
    }

    const lowerEmail = email.toLowerCase().trim();

    if (getUseMock()) {
      const db = getMockDB();
      if (db.users.find(u => u.email === lowerEmail)) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        _id: 'usr_' + Math.random().toString(36).substr(2, 9),
        name,
        email: lowerEmail,
        password: hashedPassword,
        role: role || 'student',
        qualification: { degree: '', institution: '', gradYear: '', gpa: '', skills: [], bio: '' },
        notifications: [],
        createdAt: new Date()
      };
      
      db.users.push(newUser);
      saveMockDB(db);

      const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });
      const userRes = { ...newUser };
      delete userRes.password;
      return res.status(201).json({ token, user: userRes });
    } else {
      // MongoDB
      const existingUser = await User.findOne({ email: lowerEmail });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name,
        email: lowerEmail,
        password: hashedPassword,
        role: role || 'student',
        qualification: { degree: '', institution: '', gradYear: '', gpa: '', skills: [], bio: '' }
      });

      await newUser.save();
      const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });
      const userRes = newUser.toObject();
      delete userRes.password;
      return res.status(201).json({ token, user: userRes });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const lowerEmail = email.toLowerCase().trim();

    if (getUseMock()) {
      const db = getMockDB();
      const user = db.users.find(u => u.email === lowerEmail);
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      const userRes = { ...user };
      delete userRes.password;
      return res.json({ token, user: userRes });
    } else {
      // MongoDB
      const user = await User.findOne({ email: lowerEmail });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      const userRes = user.toObject();
      delete userRes.password;
      return res.json({ token, user: userRes });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
};

// GET CURRENT USER PROFILE / DETAILS
const getMe = async (req, res) => {
  try {
    if (getUseMock()) {
      const db = getMockDB();
      const user = db.users.find(u => u._id === req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const userRes = { ...user };
      delete userRes.password;
      return res.json(userRes);
    } else {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching user details', error: err.message });
  }
};

// UPDATE DEGREE/QUALIFICATIONS
const updateProfile = async (req, res) => {
  try {
    const { degree, institution, gradYear, gpa, skills, bio } = req.body;

    if (getUseMock()) {
      const db = getMockDB();
      const userIdx = db.users.findIndex(u => u._id === req.user.id);
      if (userIdx === -1) return res.status(404).json({ message: 'User not found' });

      db.users[userIdx].qualification = {
        degree: degree || db.users[userIdx].qualification.degree || '',
        institution: institution || db.users[userIdx].qualification.institution || '',
        gradYear: gradYear || db.users[userIdx].qualification.gradYear || '',
        gpa: gpa || db.users[userIdx].qualification.gpa || '',
        skills: Array.isArray(skills) ? skills : db.users[userIdx].qualification.skills || [],
        bio: bio || db.users[userIdx].qualification.bio || ''
      };

      saveMockDB(db);
      const userRes = { ...db.users[userIdx] };
      delete userRes.password;
      return res.json({ message: 'Profile updated successfully', user: userRes });
    } else {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      user.qualification = {
        degree: degree !== undefined ? degree : user.qualification.degree,
        institution: institution !== undefined ? institution : user.qualification.institution,
        gradYear: gradYear !== undefined ? gradYear : user.qualification.gradYear,
        gpa: gpa !== undefined ? gpa : user.qualification.gpa,
        skills: Array.isArray(skills) ? skills : user.qualification.skills,
        bio: bio !== undefined ? bio : user.qualification.bio
      };

      await user.save();
      const userRes = user.toObject();
      delete userRes.password;
      return res.json({ message: 'Profile updated successfully', user: userRes });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating profile details', error: err.message });
  }
};

// GET ALL JOBS (With Filter)
const getJobs = async (req, res) => {
  try {
    if (getUseMock()) {
      const db = getMockDB();
      return res.json(db.jobs);
    } else {
      const jobs = await Job.find({}).sort({ createdAt: -1 });
      return res.json(jobs);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching jobs', error: err.message });
  }
};

// POST JOB (Company Only)
const postJob = async (req, res) => {
  try {
    if (req.user.role !== 'company') return res.status(403).json({ message: 'Only companies can post jobs' });

    const { title, company, level, jobType, location, salary, description, requirements } = req.body;

    if (!title || !company || !level || !jobType || !location || !salary || !description) {
      return res.status(400).json({ message: 'Missing required job posting parameters' });
    }

    if (getUseMock()) {
      const db = getMockDB();
      const newJob = {
        _id: 'job_' + Math.random().toString(36).substr(2, 9),
        title,
        company,
        level,
        jobType,
        location,
        salary,
        description,
        requirements: Array.isArray(requirements) ? requirements : [],
        postedBy: req.user.id,
        createdAt: new Date()
      };

      db.jobs.push(newJob);
      saveMockDB(db);
      return res.status(201).json({ message: 'Job posted successfully', job: newJob });
    } else {
      const newJob = new Job({
        title,
        company,
        level,
        jobType,
        location,
        salary,
        description,
        requirements: Array.isArray(requirements) ? requirements : [],
        postedBy: req.user.id
      });

      await newJob.save();
      return res.status(201).json({ message: 'Job posted successfully', job: newJob });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error posting job', error: err.message });
  }
};

// APPLY FOR JOB (Student Only)
const applyForJob = async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Only students can apply for vacancies' });

    const { jobId, personalStatement } = req.body;
    if (!jobId || !personalStatement) {
      return res.status(400).json({ message: 'Missing vacancy application details' });
    }

    if (getUseMock()) {
      const db = getMockDB();
      // Check if job exists
      const job = db.jobs.find(j => j._id === jobId);
      if (!job) return res.status(404).json({ message: 'Job vacancy not found' });

      // Check if already applied
      const alreadyApplied = db.applications.find(a => a.job === jobId && a.student === req.user.id);
      if (alreadyApplied) return res.status(400).json({ message: 'You have already applied for this vacancy' });

      const newApp = {
        _id: 'app_' + Math.random().toString(36).substr(2, 9),
        job: jobId,
        student: req.user.id,
        personalStatement,
        status: 'Applied',
        appliedAt: new Date()
      };

      db.applications.push(newApp);
      saveMockDB(db);
      return res.status(201).json({ message: 'Application submitted successfully', application: newApp });
    } else {
      // MongoDB
      const job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ message: 'Job vacancy not found' });

      const alreadyApplied = await Application.findOne({ job: jobId, student: req.user.id });
      if (alreadyApplied) return res.status(400).json({ message: 'You have already applied for this vacancy' });

      const newApp = new Application({
        job: jobId,
        student: req.user.id,
        personalStatement,
        status: 'Applied'
      });

      await newApp.save();
      return res.status(201).json({ message: 'Application submitted successfully', application: newApp });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error applying for job', error: err.message });
  }
};

// GET APPLICATIONS FOR STUDENT
const getStudentApplications = async (req, res) => {
  try {
    if (getUseMock()) {
      const db = getMockDB();
      const studentApps = db.applications.filter(a => a.student === req.user.id);
      
      // Populate job details
      const populated = studentApps.map(app => {
        const jobDetails = db.jobs.find(j => j._id === app.job) || {};
        return {
          ...app,
          job: jobDetails
        };
      });

      return res.json(populated);
    } else {
      const apps = await Application.find({ student: req.user.id })
        .populate('job')
        .sort({ appliedAt: -1 });
      return res.json(apps);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching applications', error: err.message });
  }
};

// GET APPLICATIONS FOR COMPANY
const getCompanyApplications = async (req, res) => {
  try {
    if (req.user.role !== 'company') return res.status(403).json({ message: 'Access denied' });

    if (getUseMock()) {
      const db = getMockDB();
      // Find jobs posted by this company
      const companyJobs = db.jobs.filter(j => j.postedBy === req.user.id).map(j => j._id);
      
      // Find applications for these jobs
      const companyApps = db.applications.filter(a => companyJobs.includes(a.job));

      // Populate job and student details
      const populated = companyApps.map(app => {
        const jobDetails = db.jobs.find(j => j._id === app.job) || {};
        const studentDetails = db.users.find(u => u._id === app.student) || {};
        const studentSafe = { ...studentDetails };
        delete studentSafe.password;

        return {
          ...app,
          job: jobDetails,
          student: studentSafe
        };
      });

      return res.json(populated);
    } else {
      // Find jobs posted by company
      const jobs = await Job.find({ postedBy: req.user.id });
      const jobIds = jobs.map(j => j._id);

      // Find applications
      const apps = await Application.find({ job: { $in: jobIds } })
        .populate('job')
        .populate('student', '-password')
        .sort({ appliedAt: -1 });

      return res.json(apps);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching applications', error: err.message });
  }
};

// UPDATE APPLICATION STATUS / OFFER CALL LETTER
const updateApplicationStatus = async (req, res) => {
  try {
    if (req.user.role !== 'company') return res.status(403).json({ message: 'Only companies can update application statuses' });

    const appId = req.params.id;
    const { status, callLetter } = req.body; // status: 'Reviewing', 'Offered', 'Rejected'

    if (!status) return res.status(400).json({ message: 'Status parameter is required' });

    if (getUseMock()) {
      const db = getMockDB();
      const appIdx = db.applications.findIndex(a => a._id === appId);
      if (appIdx === -1) return res.status(404).json({ message: 'Application not found' });

      const app = db.applications[appIdx];
      const job = db.jobs.find(j => j._id === app.job);
      
      // Verify job posted by company
      if (job.postedBy !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden. You do not own this job listing' });
      }

      app.status = status;

      let callLetterData = null;
      if (status === 'Offered' && callLetter) {
        callLetterData = {
          interviewDate: callLetter.interviewDate,
          interviewTime: callLetter.interviewTime,
          location: callLetter.location,
          notes: callLetter.notes || '',
          position: job.title,
          company: job.company,
          salary: job.salary
        };
        app.callLetter = callLetter;

        // Push notification to student
        const studentIdx = db.users.findIndex(u => u._id === app.student);
        if (studentIdx !== -1) {
          const student = db.users[studentIdx];
          const newNotif = {
            _id: 'notif_' + Math.random().toString(36).substr(2, 9),
            title: `🎉 Interview Call Letter from ${job.company}!`,
            message: `Congratulations! You have received a call letter offer for the "${job.title}" position.`,
            type: 'offer',
            date: new Date(),
            read: false,
            callLetter: callLetterData
          };
          if (!student.notifications) student.notifications = [];
          student.notifications.unshift(newNotif);

          // Dispatch simulated email
          await sendCallLetterEmail(student.email, student.name, job.title, job.company, callLetterData);
        }
      }

      saveMockDB(db);
      return res.json({ message: `Application status updated to ${status}`, application: app });
    } else {
      // MongoDB
      const app = await Application.findById(appId).populate('job');
      if (!app) return res.status(404).json({ message: 'Application not found' });

      // Verify job owner
      if (app.job.postedBy.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden. You do not own this job listing' });
      }

      app.status = status;

      if (status === 'Offered' && callLetter) {
        app.callLetter = callLetter;
        
        // Find student and update notification
        const student = await User.findById(app.student);
        if (student) {
          const callLetterData = {
            interviewDate: callLetter.interviewDate,
            interviewTime: callLetter.interviewTime,
            location: callLetter.location,
            notes: callLetter.notes || '',
            position: app.job.title,
            company: app.job.company,
            salary: app.job.salary
          };

          student.notifications.unshift({
            title: `🎉 Interview Call Letter from ${app.job.company}!`,
            message: `Congratulations! You have received a call letter offer for the "${app.job.title}" position.`,
            type: 'offer',
            callLetter: callLetterData
          });
          await student.save();

          // Dispatch simulated/real email
          await sendCallLetterEmail(student.email, student.name, app.job.title, app.job.company, callLetterData);
        }
      }

      await app.save();
      return res.json({ message: `Application status updated to ${status}`, application: app });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating application status', error: err.message });
  }
};

// MARK NOTIFICATION AS READ
const readNotification = async (req, res) => {
  try {
    const notifId = req.params.id;

    if (getUseMock()) {
      const db = getMockDB();
      const userIdx = db.users.findIndex(u => u._id === req.user.id);
      if (userIdx === -1) return res.status(404).json({ message: 'User not found' });

      const notifIdx = db.users[userIdx].notifications.findIndex(n => n._id === notifId);
      if (notifIdx !== -1) {
        db.users[userIdx].notifications[notifIdx].read = true;
        saveMockDB(db);
      }
      return res.json({ message: 'Notification marked as read' });
    } else {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const notif = user.notifications.id(notifId);
      if (notif) {
        notif.read = true;
        await user.save();
      }
      return res.json({ message: 'Notification marked as read' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error updating notification status', error: err.message });
  }
};

// DELETE JOB POSTING
const deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    if (getUseMock()) {
      const db = getMockDB();
      const jobIdx = db.jobs.findIndex(j => j._id === jobId);
      if (jobIdx === -1) return res.status(404).json({ message: 'Job not found' });

      const job = db.jobs[jobIdx];
      if (job.postedBy !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

      // Remove job and its applications
      db.jobs.splice(jobIdx, 1);
      db.applications = db.applications.filter(a => a.job !== jobId);
      saveMockDB(db);
      return res.json({ message: 'Job post deleted successfully' });
    } else {
      const job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ message: 'Job not found' });
      if (job.postedBy.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

      await Job.findByIdAndDelete(jobId);
      await Application.deleteMany({ job: jobId });
      return res.json({ message: 'Job post deleted successfully' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error deleting job post', error: err.message });
  }
};

module.exports = {
  authenticateToken,
  register,
  login,
  getMe,
  updateProfile,
  getJobs,
  postJob,
  applyForJob,
  getStudentApplications,
  getCompanyApplications,
  updateApplicationStatus,
  readNotification,
  deleteJob
};
