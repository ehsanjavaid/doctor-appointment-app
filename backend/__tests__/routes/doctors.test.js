const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../server');
const User = require('../../models/User');
const { createTestHeaders, createTestDoctor } = require('../testUtils');

describe('Doctors Routes', () => {
  beforeEach(async () => {
    // Clear users collection before each test
    await User.deleteMany({});
  });

  describe('GET /api/doctors', () => {
    test('should return empty array when no doctors exist', async () => {
      const response = await request(app).get('/api/doctors');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination).toHaveProperty('total', 0);
    });

    test('should return list of doctors', async () => {
      // Create test doctors directly with isVerified: true
      await User.create({
        name: 'Dr. John Smith',
        email: 'john@example.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'doctor',
        specialization: 'Cardiology',
        experience: 10,
        education: 'MD in Cardiology',
        hospital: 'General Hospital',
        city: 'New York',
        consultationFee: 200,
        isVerified: true
      });

      await User.create({
        name: 'Dr. Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        phone: '+1234567891',
        role: 'doctor',
        specialization: 'Dermatology',
        experience: 8,
        education: 'MD in Dermatology',
        hospital: 'City Hospital',
        city: 'Los Angeles',
        consultationFee: 180,
        isVerified: true
      });

      const response = await request(app).get('/api/doctors');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toHaveProperty('total', 2);
      
      // Check that passwords are not returned
      response.body.data.forEach(doctor => {
        expect(doctor).not.toHaveProperty('password');
      });
    });

    test('should filter doctors by specialization', async () => {
      // Create doctors with different specializations
      await User.create({
        name: 'Dr. Cardiologist',
        email: 'cardio@example.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'doctor',
        specialization: 'Cardiology',
        experience: 10,
        education: 'MD in Cardiology',
        hospital: 'Heart Hospital',
        city: 'New York',
        consultationFee: 250,
        isVerified: true
      });

      await User.create({
        name: 'Dr. Dermatologist',
        email: 'derma@example.com',
        password: 'password123',
        phone: '+1234567891',
        role: 'doctor',
        specialization: 'Dermatology',
        experience: 8,
        education: 'MD in Dermatology',
        hospital: 'Skin Clinic',
        city: 'Los Angeles',
        consultationFee: 180,
        isVerified: true
      });

      const response = await request(app)
        .get('/api/doctors')
        .query({ specialization: 'Cardiology' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].specialization).toBe('Cardiology');
    });

    test('should search doctors by name', async () => {
      await User.create({
        name: 'Dr. Michael Brown',
        email: 'michael@example.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'doctor',
        specialization: 'Neurology',
        experience: 12,
        education: 'MD in Neurology',
        hospital: 'Neuro Center',
        city: 'Chicago',
        consultationFee: 300,
        isVerified: true
      });

      const response = await request(app)
        .get('/api/doctors')
        .query({ search: 'Michael' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toContain('Michael');
    });

    test('should paginate results', async () => {
      // Create multiple doctors
      const doctors = [];
      for (let i = 1; i <= 15; i++) {
        doctors.push({
          name: `Dr. Doctor ${i}`,
          email: `doctor${i}@example.com`,
          password: 'password123',
          phone: '+1234567890',
          role: 'doctor',
          specialization: 'General',
          experience: 5,
          education: 'MD in General Medicine',
          hospital: 'Test Hospital',
          city: 'Test City',
          consultationFee: 100,
          isVerified: true
        });
      }
      await User.insertMany(doctors);

      const response = await request(app)
        .get('/api/doctors')
        .query({ page: 2, limit: 5 });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(5);
      expect(response.body.pagination).toHaveProperty('total', 15);
      expect(response.body.pagination).toHaveProperty('currentPage', 2);
      expect(response.body.pagination).toHaveProperty('totalPages', 3);
    });
  });

  describe('GET /api/doctors/:id', () => {
    test('should return doctor details by ID', async () => {
      const doctor = await User.create({
        name: 'Dr. Sarah Wilson',
        email: 'sarah@example.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'doctor',
        specialization: 'Pediatrics',
        experience: 7,
        education: 'MD in Pediatrics',
        hospital: 'Children Hospital',
        city: 'Boston',
        consultationFee: 150
      });

      const response = await request(app)
        .get(`/api/doctors/${doctor._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data._id).toBe(doctor._id.toString());
      expect(response.body.data.name).toBe('Dr. Sarah Wilson');
      expect(response.body.data).not.toHaveProperty('password');
    });

    test('should return 404 for non-existent doctor ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/doctors/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Doctor not found');
    });

    test('should return 404 for non-doctor user ID', async () => {
      const patient = await User.create({
        name: 'Patient User',
        email: 'patient@example.com',
        password: 'password123',
        role: 'patient',
        phone: '+1234567890'
      });

      const response = await request(app)
        .get(`/api/doctors/${patient._id}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Doctor not found');
    });
  });

  describe('PUT /api/doctors/:id', () => {
    test('should update doctor profile with valid data', async () => {
      // Register a doctor through the API
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Dr. Original Name',
          email: 'original@example.com',
          password: 'password123',
          phone: '+1234567890',
          role: 'doctor',
          specialization: 'Original Spec',
          experience: 5,
          education: 'MD in Original Spec',
          hospital: 'Original Hospital',
          city: 'Original City',
          consultationFee: 100
        });

      const doctorId = registerResponse.body.user.id;

      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'original@example.com',
          password: 'password123'
        });

      const token = loginResponse.body.token;

      const updateData = {
        name: 'Dr. Updated Name',
        specialization: 'Updated Specialization',
        experience: 8,
        hospital: 'Updated Hospital',
        city: 'Updated City',
        consultationFee: 150
      };

      const response = await request(app)
        .put(`/api/doctors/${doctorId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe('Dr. Updated Name');
      expect(response.body.data.specialization).toBe('Updated Specialization');
    });

    test('should return 403 when non-owner tries to update', async () => {
      const doctor = await User.create({
        name: 'Dr. Target Doctor',
        email: 'target@example.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'doctor',
        specialization: 'Target Spec',
        experience: 5,
        education: 'MD in Target Spec',
        hospital: 'Target Hospital',
        city: 'Target City',
        consultationFee: 100
      });

      // Create another doctor and get their token
      const otherDoctor = await User.create({
        name: 'Dr. Other Doctor',
        email: 'other@example.com',
        password: 'password123',
        phone: '+1234567891',
        role: 'doctor',
        specialization: 'Other Spec',
        experience: 3,
        education: 'MD in Other Spec',
        hospital: 'Other Hospital',
        city: 'Other City',
        consultationFee: 120
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other@example.com',
          password: 'password123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .put(`/api/doctors/${doctor._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Unauthorized Update' });

      expect(response.status).toBe(403);
    });
  });
});
