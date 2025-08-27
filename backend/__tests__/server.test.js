const request = require('supertest');
const mongoose = require('mongoose');
const { app, io } = require('../server');
const { createTestHeaders, createTestUser } = require('./testUtils');

describe('Server Health and Basic Routes', () => {
  afterAll(async () => {
    // Close server if it's running
    if (app && app.close) {
      await new Promise(resolve => app.close(resolve));
    }
  });

  test('GET /api/health should return server status', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
    expect(response.body.status).toBe('Server is running');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /api/test should return test message', async () => {
    const response = await request(app).get('/api/test');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Test endpoint working');
  });

  test('GET non-existent route should return 404', async () => {
    const response = await request(app).get('/api/non-existent-route');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Route not found');
  });

  test('Server should handle CORS headers', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.headers['access-control-allow-origin']).toBeDefined();
    expect(response.headers['access-control-allow-headers']).toBeDefined();
  });
});

describe('Authentication Middleware', () => {
  test('Protected route without token should return 401', async () => {
    const response = await request(app).get('/api/users/profile');
    
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Not authorized, no token');
  });

  test('Protected route with invalid token should return 401', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer invalid-token');
    
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Not authorized, token failed');
  });
});
