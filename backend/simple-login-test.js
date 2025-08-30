const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-website');

async function testLoginProcess() {
  try {
    console.log('=== TESTING LOGIN PROCESS WITHOUT SERVER ===');
    
    // Create a test user first
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'password123';
    
    const User = require('./models/User');
    const testUserData = {
      name: 'Test User',
      email: testEmail,
      password: testPassword,
      phone: '+1234567890',
      role: 'patient',
      isVerified: true
    };
    
    console.log(`Creating test user: ${testEmail}`);
    const user = await User.create(testUserData);
    console.log('User created successfully');
    
    // Now test login by simulating the auth.js login logic
    console.log('\n=== SIMULATING LOGIN PROCESS ===');
    
    // Step 1: Find user by email
    const foundUser = await User.findOne({ email: testEmail }).select('+password');
    if (!foundUser) {
      console.log('❌ User not found after creation');
      return;
    }
    
    console.log('User found:', {
      email: foundUser.email,
      isActive: foundUser.isActive,
      isVerified: foundUser.isVerified
    });
    
    // Step 2: Check if account is locked
    if (foundUser.isAccountLocked()) {
      console.log('❌ Account is locked');
      return;
    }
    
    // Step 3: Check if user is active (this is where the issue might be)
    if (!foundUser.isActive) {
      console.log('❌ LOGIN FAILED: Account is suspended (isActive: false)');
      console.log('This is the issue! The account was created as active but is now inactive.');
      return;
    } else {
      console.log('✅ Account is active');
    }
    
    // Step 4: Check password
    const isMatch = await foundUser.matchPassword(testPassword);
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return;
    }
    
    console.log('✅ Password matches');
    console.log('✅ LOGIN WOULD SUCCEED');
    
    // Clean up - delete the test user
    await User.findByIdAndDelete(user._id);
    console.log('Test user cleaned up');
    
  } catch (error) {
    console.error('Login process test error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testLoginProcess();
