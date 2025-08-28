const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { protect } = require('../middleware/auth');

// GET /api/blog - Get all published blog posts
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, sortBy = 'publishedAt', sortOrder = 'desc' } = req.query;
    
    let query = { status: 'published', isPublished: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const posts = await Blog.find(query)
      .populate('author', 'name profilePicture')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title slug excerpt featuredImage views likes publishedAt readingTime category tags');
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      posts,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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

// GET /api/blog/search - Search posts
router.get('/search', async (req, res) => {
  try {
    const { query, page = 1, limit = 12 } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const result = await Blog.searchPosts(query, limit, page);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/blog/popular - Get popular posts
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const posts = await Blog.getPopularPosts(limit);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
