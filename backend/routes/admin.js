const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

// GET /api/admin/users - Get all users (admin only)
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive, search } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// GET /api/admin/users/:id - Get user details (admin only)
router.get('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Admin get user error:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

// PUT /api/admin/users/:id/suspend - Suspend user account (admin only)
router.put('/users/:id/suspend', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cannot suspend admin accounts
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot suspend admin accounts' });
    }

    // Check if already suspended
    if (!user.isActive) {
      return res.status(400).json({ message: 'User account is already suspended' });
    }

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User account suspended successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Admin suspend user error:', error);
    res.status(500).json({ message: 'Server error while suspending user' });
  }
});

// PUT /api/admin/users/:id/reactivate - Reactivate user account (admin only)
router.put('/users/:id/reactivate', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already active
    if (user.isActive) {
      return res.status(400).json({ message: 'User account is already active' });
    }

    user.isActive = true;
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;
    await user.save();

    res.json({
      success: true,
      message: 'User account reactivated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Admin reactivate user error:', error);
    res.status(500).json({ message: 'Server error while reactivating user' });
  }
});

// GET /api/admin/stats - Get admin dashboard statistics (admin only)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const suspendedUsers = await User.countDocuments({ isActive: false });
    const doctors = await User.countDocuments({ role: 'doctor', isActive: true });
    const patients = await User.countDocuments({ role: 'patient', isActive: true });

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        doctors,
        patients,
        suspensionRate: totalUsers > 0 ? (suspendedUsers / totalUsers * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

module.exports = router;
