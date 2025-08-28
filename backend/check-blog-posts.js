const mongoose = require('mongoose');
const Blog = require('./models/Blog');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-website')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Get all blog posts
    const posts = await Blog.find({}).populate('author', 'name email');
    
    console.log('Total blog posts:', posts.length);
    console.log('================================');
    
    if (posts.length === 0) {
      console.log('No blog posts found in the database.');
    } else {
      posts.forEach((post, index) => {
        console.log(`Post ${index + 1}:`);
        console.log('Title:', post.title);
        console.log('Author:', post.author ? post.author.name : 'Unknown');
        console.log('Email:', post.author ? post.author.email : 'Unknown');
        console.log('Status:', post.status);
        console.log('Published:', post.isPublished);
        console.log('Created at:', post.createdAt);
        console.log('---');
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
