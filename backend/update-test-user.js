const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-website');

async function updateTestUser() {
  try {
    const user = await User.findOne({ email: 'test@example.com' });
    if (user) {
      user.isActive = true; // Set account to active
      user.failedLoginAttempts = 0; // Reset failed attempts
      user.accountLockedUntil = null; // Clear lock
      await user.save();
      console.log('Test user account updated successfully:', {
        email: user.email,
        isActive: user.isActive,
        role: user.role
      });
    } else {
      console.log('Test user not found.');
    }
  } catch (error) {
    console.error('Error updating test user:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateTestUser();
