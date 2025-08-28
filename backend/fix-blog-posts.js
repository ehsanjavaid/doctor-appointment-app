const mongoose = require('mongoose');
const Blog = require('./models/Blog');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-website')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Find all posts with status 'published' but isPublished: false
    const postsToFix = await Blog.find({
      status: 'published',
      isPublished: false
    });
    
    console.log(`Found ${postsToFix.length} posts to fix`);
    
    if (postsToFix.length === 0) {
      console.log('No posts need fixing.');
      process.exit(0);
    }
    
    // Update each post to set isPublished: true
    for (const post of postsToFix) {
      post.isPublished = true;
      if (!post.publishedAt) {
        post.publishedAt = post.createdAt || new Date();
      }
      await post.save();
      console.log(`Fixed post: "${post.title}"`);
    }
    
    console.log(`Successfully fixed ${postsToFix.length} posts`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
