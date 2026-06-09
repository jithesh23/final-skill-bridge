const path = require('path');
const crypto = require('crypto');

if (!globalThis.crypto) {
  globalThis.crypto = crypto.webcrypto;
}

require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const {
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
} = require('./controllers');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend connection (Vite default is port 5173)
app.use(cors({
  origin: '*', // For development, allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- Database connection check with graceful fallback ---
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.warn('⚠️ WARNING: No MONGODB_URI found in environmental configuration file (.env).');
  console.log('💡 Defaulting to persistent local JSON database fallback (backend/mock_db.json).\n');
  process.env.USE_MOCK_DB = 'true';
} else {
  console.log(`Connecting to MongoDB at: ${mongoURI}...`);
  mongoose.connect(mongoURI)
    .then(() => {
      console.log('🎉 SUCCESS: MongoDB database connected successfully!');
      process.env.USE_MOCK_DB = 'false';
    })
    .catch((err) => {
      console.warn('⚠️ MongoDB connection encountered an error:', err.message);
      console.log('💡 Falling back to persistent local JSON database (backend/mock_db.json).\n');
      process.env.USE_MOCK_DB = 'true';
    });
}

// --- API ROUTES ---

// Authentication
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', authenticateToken, getMe);

// Student Qualifications Profile
app.put('/api/profile', authenticateToken, updateProfile);

// Vacancies / Jobs Listings
app.get('/api/jobs', getJobs);
app.post('/api/jobs', authenticateToken, postJob);
app.delete('/api/jobs/:id', authenticateToken, deleteJob);

// Applications
app.post('/api/applications', authenticateToken, applyForJob);
app.get('/api/applications/student', authenticateToken, getStudentApplications);
app.get('/api/applications/company', authenticateToken, getCompanyApplications);
app.put('/api/applications/:id/status', authenticateToken, updateApplicationStatus);

// Student Notifications
app.put('/api/notifications/:id/read', authenticateToken, readNotification);

// Status route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    databaseMode: process.env.USE_MOCK_DB === 'true' ? 'mock-json' : 'mongodb',
    timestamp: new Date()
  });
});

// Start the Express Server
app.listen(PORT, () => {
  console.log(`==============================================`);
  console.log(`🚀 SkillBridge Express backend listening on Port ${PORT}`);
  console.log(`🔗 API Status: http://localhost:${PORT}/api/status`);
  console.log(`==============================================\n`);
});
