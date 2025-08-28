const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-website');

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists:', {
        email: existingUser.email,
        isActive: existingUser.isActive,
        role: existingUser.role
      });
      
      // If account is suspended, activate it
      if (!existingUser.isActive) {
        existingUser.isActive = true;
        existingUser.failedLoginAttempts = 0;
        existingUser.accountLockedUntil = null;
        await existingUser.save();
        console.log('Test user account activated successfully');
      }
      
      return;
    }

    // Create new test user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      phone: '+1234567890',
      role: 'doctor',
      specialization: 'General Medicine',
      experience: 5,
      education: 'MD, Medical University',
      hospital: 'General Hospital',
      city: 'Test City',
      consultationFee: 100,
      isVerified: true,
      isActive: true
    });

    await testUser.save();
    console.log('Test user created successfully:', {
      email: testUser.email,
      password: 'password123',
      role: testUser.role,
      isActive: testUser.isActive
    });

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestUser();
