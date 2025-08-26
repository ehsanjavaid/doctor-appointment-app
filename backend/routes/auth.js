const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize, rateLimit } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Configure Passport Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ 
      $or: [
        { googleId: profile.id },
        { email: profile.emails[0].value }
      ]
    });

    if (user) {
      // Update existing user with Google info
      user.googleId = profile.id;
      user.oauthProvider = 'google';
      user.oauthAccessToken = accessToken;
      user.oauthRefreshToken = refreshToken;
      user.isVerified = true;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        oauthProvider: 'google',
        oauthAccessToken: accessToken,
        oauthRefreshToken: refreshToken,
        isVerified: true,
        role: 'patient',
        phone: '000-000-0000' // Default phone number
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Configure Passport Twitter Strategy
passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY || 'your-twitter-consumer-key',
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET || 'your-twitter-consumer-secret',
  callbackURL: process.env.TWITTER_CALLBACK_URL || '/api/auth/twitter/callback',
  includeEmail: true
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ 
      $or: [
        { twitterId: profile.id },
        { email: profile.emails && profile.emails[0] ? profile.emails[0].value : null }
      ]
    });

    if (user) {
      // Update existing user with Twitter info
      user.twitterId = profile.id;
      user.oauthProvider = 'twitter';
      user.oauthAccessToken = accessToken;
      user.oauthRefreshToken = refreshToken;
      user.isVerified = true;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name: profile.displayName,
        email: profile.emails && profile.emails[0] ? profile.emails[0].value : `twitter-${profile.id}@example.com`,
        twitterId: profile.id,
        oauthProvider: 'twitter',
        oauthAccessToken: accessToken,
        oauthRefreshToken: refreshToken,
        isVerified: true,
        role: 'patient',
        phone: '000-000-0000' // Default phone number
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Helper function to handle OAuth success
const handleOAuthSuccess = async (req, res) => {
  try {
    const user = req.user;
    const token = generateToken(user._id);

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/oauth-success?token=${token}&userId=${user._id}`);
  } catch (error) {
    console.error('OAuth success error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
};

// Helper function to handle OAuth failure
const handleOAuthFailure = (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendUrl}/login?error=oauth_failed`);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please provide a valid phone number'),
  body('role').isIn(['patient', 'doctor']).withMessage('Role must be either patient or doctor'),
  body('specialization').if(body('role').equals('doctor')).notEmpty().withMessage('Specialization is required for doctors'),
  body('experience').if(body('role').equals('doctor')).isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('hospital').if(body('role').equals('doctor')).notEmpty().withMessage('Hospital is required for doctors'),
  body('city').if(body('role').equals('doctor')).notEmpty().withMessage('City is required for doctors'),
  body('consultationFee').if(body('role').equals('doctor')).isFloat({ min: 0 }).withMessage('Consultation fee must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, password, phone, role, specialization, experience, hospital, city, consultationFee } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const userData = {
      name,
      email,
      password,
      phone,
      role
    };

    // Add doctor-specific fields
    if (role === 'doctor') {
      userData.specialization = specialization;
      userData.experience = experience;
      userData.hospital = hospital;
      userData.city = city;
      userData.consultationFee = consultationFee;
    }

    const user = await User.create(userData);

    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, verificationToken);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      const remainingLockTime = user.getRemainingLockTime();
      return res.status(403).json({ 
        message: `Account is temporarily locked due to too many failed login attempts. Please try again in ${remainingLockTime} minutes.` 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Your account is suspended. Please contact support for assistance.' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Password mismatch - handling failed login attempt');
      // Handle failed login attempt
      await user.handleFailedLogin(); // Ensure this is awaited
      await user.save(); // Ensure the user document is saved after failed login
      
      // Check if account got locked after this attempt

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
router.post('/verify-email', [
  body('token').notEmpty().withMessage('Verification token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { token } = req.body;

    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with this token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Update user
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], rateLimit(3, 60 * 60 * 1000), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    res.json({
      success: true,
      message: 'Password reset email sent'
    });

    // TODO: Send reset email
    // await sendPasswordResetEmail(user.email, resetToken);

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { token, password } = req.body;

    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with this token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', [
  protect,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// @desc    Google OAuth login
// @route   GET /api/auth/google
// @access  Public
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/auth/google/failure' }),
  handleOAuthSuccess
);

// @desc    Google OAuth failure
// @route   GET /api/auth/google/failure
// @access  Public
router.get('/google/failure', handleOAuthFailure);

// @desc    Twitter OAuth login
// @route   GET /api/auth/twitter
// @access  Public
router.get('/twitter', passport.authenticate('twitter'));

// @desc    Twitter OAuth callback
// @route   GET /api/auth/twitter/callback
// @access  Public
router.get('/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/api/auth/twitter/failure' }),
  handleOAuthSuccess
);

// @desc    Twitter OAuth failure
// @route   GET /api/auth/twitter/failure
// @access  Public
router.get('/twitter/failure', handleOAuthFailure);

module.exports = router;
