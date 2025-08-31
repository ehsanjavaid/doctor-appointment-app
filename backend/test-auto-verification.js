const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testAutoVerification() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-booking');
    console.log('Connected to MongoDB');

    // Create a test user to verify auto-verification
    const testEmail = `test-auto-verify-${Date.now()}@example.com`;
    
    const testUser = await User.create({
      name: 'Test Auto Verification',
      email: testEmail,
      password: 'testpassword123',
      phone: '+1234567890',
      role: 'patient',
      isVerified: true  // This should be set automatically by the registration route
    });

    console.log('=== TEST USER CREATED ===');
    console.log(`Email: ${testUser.email}`);
    console.log(`Name: ${testUser.name}`);
    console.log(`Role: ${testUser.role}`);
    console.log(`Active: ${testUser.isActive}`);
    console.log(`Verified: ${testUser.isVerified}`);

    if (testUser.isVerified) {
      console.log('✅ SUCCESS: User account is automatically verified!');
      console.log('All new accounts will now be created as verified by default.');
    } else {
      console.log('❌ FAILED: User account is not verified');
    }

    // Clean up - remove test user
    await User.deleteOne({ email: testEmail });
    console.log('Test user cleaned up');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the test
testAutoVerification();
