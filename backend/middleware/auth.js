const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      console.log('User status:', req.user);
      if (!req.user.isActive) {
        return res.status(401).json({ message: 'User account is deactivated' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }

    next();
  };
};

// Check if user is verified
const requireVerification = async (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({ 
      message: 'Please verify your email address before accessing this feature' 
    });
  }
  next();
};

// Check if user owns the resource or is admin
const checkOwnership = (modelName) => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${modelName}`);
      const resource = await Model.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      // Admin can access all resources
      if (req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

      // Check if user owns the resource
      const ownerField = modelName === 'User' ? '_id' : 
                        modelName === 'Appointment' ? 'patient' : 'author';
      
      if (resource[ownerField].toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          message: 'Not authorized to access this resource' 
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
};

// Rate limiting for specific actions
const rateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old attempts
    if (attempts.has(key)) {
      attempts.set(key, attempts.get(key).filter(timestamp => timestamp > windowStart));
    }

    const currentAttempts = attempts.get(key) || [];
    
    if (currentAttempts.length >= maxAttempts) {
      return res.status(429).json({ 
        message: 'Too many attempts, please try again later' 
      });
    }

    currentAttempts.push(now);
    attempts.set(key, currentAttempts);

    next();
  };
};

// Check if user can book appointment
const canBookAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, appointmentTime } = req.body;

    // Check if doctor exists and is active
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor' || !doctor.isActive) {
      return res.status(404).json({ message: 'Doctor not found or inactive' });
    }

    // Check if appointment time is available
    const Appointment = require('../models/Appointment');
    const isAvailable = await Appointment.isTimeSlotAvailable(
      doctorId, 
      appointmentDate, 
      appointmentTime
    );

    if (!isAvailable) {
      return res.status(400).json({ message: 'Selected time slot is not available' });
    }

    // Check if appointment is in the future
    const appointmentDateTime = new Date(appointmentDate);
    appointmentDateTime.setHours(parseInt(appointmentTime.split(':')[0]));
    appointmentDateTime.setMinutes(parseInt(appointmentTime.split(':')[1]));

    if (appointmentDateTime <= new Date()) {
      return res.status(400).json({ message: 'Cannot book appointments in the past' });
    }

    next();
  } catch (error) {
    console.error('Appointment booking validation error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  protect,
  authorize,
  requireVerification,
  checkOwnership,
  rateLimit,
  canBookAppointment
};
