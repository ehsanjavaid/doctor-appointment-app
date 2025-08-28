const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-website');

async function activateTestUser() {
  try {
    const user = await User.findOne({ email: 'test@example.com' });
    if (user) {
      user.isActive = true; // Set account to active
      user.isVerified = true; // Ensure verified status
      await user.save();
      console.log('Test user account activated successfully:', {
        email: user.email,
        isActive: user.isActive,
        isVerified: user.isVerified,
        role: user.role
      });
    } else {
      console.log('Test user not found.');
    }
  } catch (error) {
    console.error('Error activating test user:', error);
  } finally {
    mongoose.connection.close();
  }
}

activateTestUser();
