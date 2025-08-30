const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-website');

async function reactivateUsers() {
  try {
    console.log('=== CHECKING FOR INACTIVE USERS ===');
    
    // Find all inactive users
    const inactiveUsers = await User.find({ isActive: false })
      .select('email name role isActive isVerified createdAt');
    
    if (inactiveUsers.length === 0) {
      console.log('✅ No inactive users found in the database');
      return;
    }
    
    console.log(`\nFound ${inactiveUsers.length} inactive user(s):`);
    inactiveUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.name} (${user.role}) - Created: ${user.createdAt}`);
    });
    
    console.log('\n=== REACTIVATING INACTIVE USERS ===');
    
    // Reactivate all inactive users
    const result = await User.updateMany(
      { isActive: false },
      { 
        isActive: true,
        failedLoginAttempts: 0,
        accountLockedUntil: null
      }
    );
    
    console.log(`✅ Reactivated ${result.modifiedCount} user(s)`);
    
    // Verify the reactivation
    const reactivatedUsers = await User.find({ _id: { $in: inactiveUsers.map(u => u._id) } })
      .select('email isActive');
    
    console.log('\n=== VERIFICATION ===');
    reactivatedUsers.forEach(user => {
      console.log(`${user.email}: ${user.isActive ? '✅ Active' : '❌ Still inactive'}`);
    });
    
  } catch (error) {
    console.error('Reactivation error:', error);
  } finally {
    mongoose.connection.close();
  }
}

reactivateUsers();
