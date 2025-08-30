const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-website');

async function testRegistration() {
  try {
    console.log('=== TESTING REGISTRATION PROCESS ===');
    
    // Create a test user
    const testEmail = `test${Date.now()}@example.com`;
    const testUserData = {
      name: 'Test User',
      email: testEmail,
      password: 'password123',
      phone: '+1234567890',
      role: 'patient',
      isVerified: true
    };
    
    console.log(`Creating test user: ${testEmail}`);
    
    const user = await User.create(testUserData);
    console.log('User created successfully:', {
      id: user._id,
      email: user.email,
      isActive: user.isActive,
      isVerified: user.isVerified
    });
    
    // Now try to find the user and check isActive status
    const foundUser = await User.findOne({ email: testEmail });
    console.log('Found user after creation:', {
      email: foundUser.email,
      isActive: foundUser.isActive,
      isVerified: foundUser.isVerified
    });
    
    // Try to login (simulate the login check)
    console.log('\n=== SIMULATING LOGIN CHECK ===');
    if (!foundUser.isActive) {
      console.log('❌ LOGIN WOULD FAIL: Account is suspended (isActive: false)');
    } else {
      console.log('✅ LOGIN WOULD SUCCEED: Account is active (isActive: true)');
    }
    
  } catch (error) {
    console.error('Registration test error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testRegistration();
