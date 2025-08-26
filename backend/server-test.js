const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Test routes
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is running successfully!',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mock data for testing
app.get('/api/doctors', (req, res) => {
  res.json({
    doctors: [
      {
        id: 1,
        name: 'Dr. John Smith',
        specialization: 'Cardiology',
        experience: '15 years',
        fees: 150,
        city: 'New York',
        rating: 4.8
      },
      {
        id: 2,
        name: 'Dr. Sarah Johnson',
        specialization: 'Dermatology',
        experience: '12 years',
        fees: 120,
        city: 'Los Angeles',
        rating: 4.9
      }
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`👨‍⚕️ Mock doctors: http://localhost:${PORT}/api/doctors`);
});
