const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-website');

async function verifyTestUser() {
  try {
    const user = await User.findOne({ email: 'test@example.com' });
    if (user) {
      user.isVerified = true; // Set account to verified
      await user.save();
      console.log('Test user account verified successfully:', {
        email: user.email,
        isVerified: user.isVerified,
        role: user.role
      });
    } else {
      console.log('Test user not found.');
    }
  } catch (error) {
    console.error('Error verifying test user:', error);
  } finally {
    mongoose.connection.close();
  }
}

verifyTestUser();
