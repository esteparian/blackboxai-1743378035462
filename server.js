require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Passport Configuration
require('./controllers/auth')(passport);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(passport.initialize());

// Enhanced MongoDB Connection with Atlas support
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MongoDB connection string not found in .env file');
    console.log('Please add your MongoDB Atlas connection string to .env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    console.log('\nTroubleshooting Guide:');
    console.log('1. Verify your MongoDB Atlas credentials in .env');
    console.log('2. Check your internet connection');
    console.log('3. Whitelist your IP in Atlas Security settings');
    console.log('4. Ensure the database name ("reporting_app") exists');
    process.exit(1);
  }
};

// Initialize database connection
connectDB();

// Authentication Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  });

app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  });

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const reportsController = require('./controllers/reports');

// Report Submission Route
app.post('/api/reports', upload.single('file'), reportsController.submitReport);

// Admin Routes
app.get('/api/admin/reports', reportsController.getAdminReports);

// Serve Frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});