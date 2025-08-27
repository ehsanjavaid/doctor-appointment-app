const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../server');
const User = require('../../models/User');

beforeAll(async () => {
  // Close any existing connections first
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  
  // Connect to a test database
  const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/testdb';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  } catch (error) {
    console.log('Error during cleanup:', error.message);
  }
}, 10000); // Increase timeout to 10 seconds

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth Routes', () => {

  describe('POST /api/auth/register', () => {
    it('should register a patient successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: `john${Date.now()}@example.com`,
        password: 'password123',
        phone: '+1234567890',
        role: 'patient'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(userData.email);
      expect(res.body.user.role).toBe('patient');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should return 400 for duplicate email', async () => {
      const email = `duplicate${Date.now()}@example.com`;
      await request(app).post('/api/auth/register').send({
        name: 'John Doe',
        email,
        password: 'password123',
        phone: '+1234567890',
        role: 'patient'
      });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Jane Doe',
        email,
        password: 'password123',
        phone: '+1234567890',
        role: 'patient'
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('User already exists with this email');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'patient'
      });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should return 401 for incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should return 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      const registerRes = await request(app).post('/api/auth/register').send({
        name: 'Me User',
        email: 'me@example.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'patient'
      });
      token = registerRes.body.token;
    });

    it('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('me@example.com');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
