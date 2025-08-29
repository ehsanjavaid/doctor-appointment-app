const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { protect } = require('../middleware/auth');
const { body, query, validationResult } = require('express-validator');

// Validation middleware
const validateBlogQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sortBy').optional().isIn(['publishedAt', 'views', 'likes', 'title', 'readingTime']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
];

const validateBlogCreate = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('category').isIn([
    'general-health', 'mental-health', 'nutrition', 'fitness', 'pediatrics',
    'cardiology', 'dermatology', 'orthopedics', 'neurology', 'oncology', 'other'
  ]).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
];

// GET /api/blog - Get all published blog posts with advanced filtering
router.get('/', validateBlogQuery, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      sortBy = 'publishedAt', 
      sortOrder = 'desc',
      tags,
      author
    } = req.query;
    
    let query = { status: 'published', isPublished: true };
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray.map(tag => new RegExp(tag, 'i')) };
    }
    
    // Author filter
    if (author) {
      query.author = author;
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Add secondary sort for consistent ordering
    if (sortBy !== 'publishedAt') {
      sortOptions.publishedAt = -1;
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const posts = await Blog.find(query)
      .populate('author', 'name profilePicture')
      .sort(sortOptions)
      .limit(limitNum)
      .skip(skip)
      .select('title slug excerpt featuredImage views likes shares publishedAt readingTime category tags author');
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      posts,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// GET /api/blog/:slug - Get single blog post
router.get('/:slug', async (req, res) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug, status: 'published', isPublished: true })
      .populate('author', 'name profilePicture bio');
    
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    // Increment views
    await post.incrementViews();
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/blog - Create new blog post (protected)
router.post('/', protect, async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      author: req.user.id
    };
    
    const blog = new Blog({
      ...blogData,
      isPublished: blogData.status === 'published', // Set isPublished based on status
      publishedAt: blogData.status === 'published' ? new Date() : null // Set publishedAt if published
    });
    
  // Generate slug if not provided
  if (!blog.slug) {
    await blog.generateSlug();
  }
    
    // Calculate reading time
    blog.calculateReadingTime();
    
    await blog.save();
    await blog.populate('author', 'name profilePicture');
    
    res.status(201).json(blog);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Slug already exists' });
    }
    res.status(400).json({ message: 'Error creating blog post', error: error.message });
  }
});

// PUT /api/blog/:id - Update blog post (protected)
router.put('/:id', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    // Check if user owns the post or is admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Update blog fields
    Object.assign(blog, req.body);
    
    // Handle publishing status
    if (req.body.status === 'published' && blog.status !== 'published') {
      blog.isPublished = true;
      blog.publishedAt = new Date();
    } else if (req.body.status === 'draft') {
      blog.isPublished = false;
      blog.publishedAt = null;
    }
    
    // Recalculate reading time if content changed
    if (req.body.content) {
      blog.calculateReadingTime();
    }
    
    await blog.save();
    await blog.populate('author', 'name profilePicture');
    
    res.json(blog);
  } catch (error) {
    res.status(400).json({ message: 'Error updating blog post', error: error.message });
  }
});

// DELETE /api/blog/:id - Delete blog post (protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    // Check if user owns the post or is admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await Blog.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/blog/category/:category - Get posts by category
router.get('/category/:category', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const { category } = req.params;
    
    const result = await Blog.getPostsByCategory(category, limit, page);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/blog/search - Search posts with validation
router.get('/search', [
  query('query').trim().isLength({ min: 1 }).withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { query: searchQuery, page = 1, limit = 12 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    const result = await Blog.searchPosts(searchQuery, limitNum, pageNum);
    
    res.json({
      ...result,
      currentPage: pageNum,
      hasNext: pageNum < result.pages,
      hasPrev: pageNum > 1
    });
  } catch (error) {
    console.error('Search route error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// GET /api/blog/popular - Get popular posts with validation
router.get('/popular', [
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit);
    
    const posts = await Blog.getPopularPosts(limitNum);
    
    res.json(posts);
  } catch (error) {
    console.error('Popular route error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

module.exports = router;
