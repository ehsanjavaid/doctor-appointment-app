const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkAccountStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-booking');
    console.log('Connected to MongoDB');

    // Check your account status
    const yourEmail = 'ehsanjavaid321@gmail.com';
    const yourUser = await User.findOne({ email: yourEmail });
    
    if (yourUser) {
      console.log('\n=== YOUR ACCOUNT STATUS ===');
      console.log(`Email: ${yourUser.email}`);
      console.log(`Name: ${yourUser.name}`);
      console.log(`Role: ${yourUser.role}`);
      console.log(`Active: ${yourUser.isActive}`);
      console.log(`Verified: ${yourUser.isVerified}`);
      console.log(`Failed Login Attempts: ${yourUser.failedLoginAttempts}`);
      console.log(`Account Locked Until: ${yourUser.accountLockedUntil}`);
      
      if (!yourUser.isActive) {
        console.log('\n⚠️  Your account is SUSPENDED (isActive: false)');
        console.log('Activating your account now...');
        yourUser.isActive = true;
        yourUser.failedLoginAttempts = 0;
        yourUser.accountLockedUntil = null;
        await yourUser.save();
        console.log('✅ Account activated successfully!');
      } else if (yourUser.isAccountLocked()) {
        console.log('\n⚠️  Your account is TEMPORARILY LOCKED');
        const remainingTime = yourUser.getRemainingLockTime();
        console.log(`Locked for ${remainingTime} more minutes`);
        console.log('Unlocking your account now...');
        yourUser.failedLoginAttempts = 0;
        yourUser.accountLockedUntil = null;
        await yourUser.save();
        console.log('✅ Account unlocked successfully!');
      } else {
        console.log('\n✅ Your account is ACTIVE and should work normally');
      }
    } else {
      console.log(`\n❌ No user found with email: ${yourEmail}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the check
checkAccountStatus();
