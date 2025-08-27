// Test utilities for backend testing
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

/**
 * Generate a test JWT token for a user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateTestToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id || new mongoose.Types.ObjectId(), 
      email: user.email || 'test@example.com',
      role: user.role || 'patient'
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

/**
 * Create test headers with authorization token
 * @param {Object} user - User object
 * @returns {Object} Headers object
 */
const createTestHeaders = (user = {}) => {
  const token = generateTestToken(user);
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Create a test user object
 * @param {Object} overrides - Override default values
 * @returns {Object} Test user object
 */
const createTestUser = (overrides = {}) => {
  return {
    _id: new mongoose.Types.ObjectId(),
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'patient',
    ...overrides
  };
};

/**
 * Create a test doctor object
 * @param {Object} overrides - Override default values
 * @returns {Object} Test doctor object
 */
const createTestDoctor = (overrides = {}) => {
  return {
    _id: new mongoose.Types.ObjectId(),
    name: 'Dr. Test Doctor',
    email: 'doctor@example.com',
    password: 'password123',
    role: 'doctor',
    specialization: 'General Medicine',
    experience: 5,
    education: 'MD in General Medicine',
    hospital: 'Test Hospital',
    city: 'Test City',
    consultationFee: 100,
    ...overrides
  };
};

module.exports = {
  generateTestToken,
  createTestHeaders,
  createTestUser,
  createTestDoctor
};
