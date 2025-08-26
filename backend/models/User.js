const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number']
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
  profilePicture: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Doctor specific fields
  specialization: {
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  experience: {
    type: Number,
    min: 0,
    required: function() { return this.role === 'doctor'; }
  },
  education: {
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  hospital: {
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  city: {
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  consultationFee: {
    type: Number,
    min: 0,
    required: function() { return this.role === 'doctor'; }
  },
  availability: {
    type: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      slots: [{
        startTime: String,
        endTime: String,
        isAvailable: { type: Boolean, default: true }
      }]
    }],
    default: []
  },
  onlineConsultation: {
    type: Boolean,
    default: false
  },
  offlineConsultation: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  // Patient specific fields
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  // Common fields
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  // OAuth fields
  googleId: String,
  twitterId: String,
  oauthProvider: {
    type: String,
    enum: ['local', 'google', 'twitter']
  },
  oauthAccessToken: String,
  oauthRefreshToken: String,
  // Security fields for rate limiting and account locking
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountLockedUntil: {
    type: Date,
    default: null
  },
  lastFailedLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Handle failed login attempt
userSchema.methods.handleFailedLogin = function() {
  console.log('Handling failed login for user:', this.email);
  this.failedLoginAttempts += 1; // Increment failed attempts
  console.log('Failed login attempts:', this.failedLoginAttempts);
  this.lastFailedLogin = new Date();
  
  // Lock account after 5 failed attempts within 15 minutes
  if (this.failedLoginAttempts >= 5) {
    this.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
  }
  
  return this.save();
};

// Reset failed login attempts on successful login
userSchema.methods.resetFailedLoginAttempts = function() {
  console.log('Resetting failed login attempts for user:', this.email);
  this.failedLoginAttempts = 0; // Reset failed attempts
  console.log('Failed login attempts reset to:', this.failedLoginAttempts);
  this.accountLockedUntil = null;
  this.lastFailedLogin = null;
  return this.save();
};

// Check if account is currently locked
userSchema.methods.isAccountLocked = function() {
  if (this.accountLockedUntil && this.accountLockedUntil > new Date()) {
    return true;
  }
  
  // Auto-unlock if lock time has expired
  if (this.accountLockedUntil && this.accountLockedUntil <= new Date()) {
    this.accountLockedUntil = null;
    this.failedLoginAttempts = 0;
    this.save();
  }
  
  return false;
};

// Get remaining lock time in minutes
userSchema.methods.getRemainingLockTime = function() {
  if (!this.accountLockedUntil || this.accountLockedUntil <= new Date()) {
    return 0;
  }
  
  return Math.ceil((this.accountLockedUntil - new Date()) / (60 * 1000));
};

module.exports = mongoose.model('User', userSchema);
