const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../server');
const Blog = require('../../models/Blog');
const User = require('../../models/User');

describe('Blog Routes', () => {
  let testUser;
  let testBlog;

  beforeEach(async () => {
    console.log('BeforeEach: Starting test setup...');
    
    // Create a test user (use patient role to avoid doctor-specific required fields)
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '+1234567890',
      role: 'patient'
    });
    await testUser.save();
    console.log('BeforeEach: Test user saved:', testUser._id);

    // Create a test blog post
    testBlog = new Blog({
      title: 'Test Blog Post',
      content: 'Test content',
      excerpt: 'Test excerpt',
      author: testUser._id,
      category: 'general-health',
      tags: ['test'],
      status: 'published',
      isPublished: true,
      publishedAt: new Date()
    });
    await testBlog.generateSlug();
    testBlog.calculateReadingTime();
    await testBlog.save();
    console.log('BeforeEach: Test blog saved:', testBlog._id, 'slug:', testBlog.slug);
    
    // Verify the blog post was saved
    const savedBlog = await Blog.findOne({ _id: testBlog._id });
    console.log('BeforeEach: Blog found in DB:', savedBlog ? savedBlog._id : 'null');
  });

  afterAll(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/blog', () => {
    it('should return all published blog posts', async () => {
      const response = await request(app)
        .get('/api/blog')
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('pages');
      expect(response.body).toHaveProperty('currentPage');
      expect(Array.isArray(response.body.posts)).toBe(true);
    });

    it('should return blog posts with pagination', async () => {
      const response = await request(app)
        .get('/api/blog?page=1&limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('currentPage', '1'); // Query params come as strings
      expect(response.body.posts.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/blog/:slug', () => {
    it('should return a single blog post by slug', async () => {
      console.log('Testing slug:', testBlog.slug);
      
      // First, check if the blog post exists in the database
      const blogFromDb = await Blog.findOne({ slug: testBlog.slug });
      console.log('Blog from DB:', blogFromDb);
      
      const response = await request(app)
        .get(`/api/blog/${testBlog.slug}`)
        .expect(200);

      expect(response.body).toHaveProperty('title', 'Test Blog Post');
      expect(response.body).toHaveProperty('slug', testBlog.slug);
    });

    it('should return 404 for non-existent blog post', async () => {
      await request(app)
        .get('/api/blog/non-existent-slug')
        .expect(404);
    });
  });

  describe('GET /api/blog/category/:category', () => {
    it('should return blog posts by category', async () => {
      const response = await request(app)
        .get('/api/blog/category/general-health')
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(Array.isArray(response.body.posts)).toBe(true);
    });
  });

  describe('GET /api/blog/search', () => {
    it('should return search results', async () => {
      const response = await request(app)
        .get('/api/blog/search?query=test')
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(Array.isArray(response.body.posts)).toBe(true);
    });

    it('should return 400 for missing query parameter', async () => {
      await request(app)
        .get('/api/blog/search')
        .expect(400);
    });
  });

  describe('GET /api/blog/popular', () => {
    it('should return popular blog posts', async () => {
      const response = await request(app)
        .get('/api/blog/popular')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
