const mongoose = require('mongoose');

// Notification Schema (Nested in User)
const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'info' }, // 'info', 'offer', 'alert'
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  callLetter: {
    interviewDate: String,
    interviewTime: String,
    location: String,
    notes: String,
    position: String,
    company: String,
    salary: String
  }
});

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'company'], default: 'student' },
  qualification: {
    degree: { type: String, default: '' },
    institution: { type: String, default: '' },
    gradYear: { type: String, default: '' },
    gpa: { type: String, default: '' },
    skills: { type: [String], default: [] },
    bio: { type: String, default: '' }
  },
  notifications: [NotificationSchema],
  createdAt: { type: Date, default: Date.now }
});

// Job Schema
const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  level: { type: String, enum: ['Top Tier', 'Mid-Level', 'Startup'], required: true },
  jobType: { type: String, enum: ['Internship', 'Full-Time'], required: true },
  location: { type: String, required: true },
  salary: { type: String, required: true },
  description: { type: String, required: true },
  requirements: { type: [String], default: [] },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Application Schema
const ApplicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  personalStatement: { type: String, required: true },
  status: { type: String, enum: ['Applied', 'Reviewing', 'Offered', 'Rejected'], default: 'Applied' },
  callLetter: {
    interviewDate: String,
    interviewTime: String,
    location: String,
    notes: String
  },
  appliedAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Job: mongoose.model('Job', JobSchema),
  Application: mongoose.model('Application', ApplicationSchema)
};
