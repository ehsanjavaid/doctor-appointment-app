const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-website');

async function debugRegistration() {
  try {
    console.log('=== DEBUGGING REGISTRATION ISSUE ===');
    
    // Check the most recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('email isActive isVerified createdAt');
    
    console.log('\nMost recent 10 users:');
    recentUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - Active: ${user.isActive}, Verified: ${user.isVerified}, Created: ${user.createdAt}`);
    });
    
    // Check if any users have isActive: false
    const inactiveUsers = await User.find({ isActive: false })
      .select('email isActive isVerified createdAt updatedAt');
    
    console.log('\nUsers with isActive: false:');
    if (inactiveUsers.length === 0) {
      console.log('No inactive users found');
    } else {
      inactiveUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - Active: ${user.isActive}, Verified: ${user.isVerified}, Created: ${user.createdAt}, Updated: ${user.updatedAt}`);
      });
    }
    
    // Check user model defaults
    console.log('\nUser model defaults:');
    console.log('- isActive defaults to: true');
    console.log('- isVerified defaults to: false');
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugRegistration();
