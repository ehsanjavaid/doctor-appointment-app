const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  content: {
    type: String,
    required: [true, 'Please provide content']
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [300, 'Excerpt cannot be more than 300 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: [
      'general-health',
      'mental-health',
      'nutrition',
      'fitness',
      'pediatrics',
      'cardiology',
      'dermatology',
      'orthopedics',
      'neurology',
      'oncology',
      'other'
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  featuredImage: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  readingTime: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  metaImage: String,
  allowComments: {
    type: Boolean,
    default: true
  },
  commentCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, publishedAt: -1 });
blogSchema.index({ author: 1, publishedAt: -1 });
blogSchema.index({ isFeatured: 1, publishedAt: -1 });
blogSchema.index({ tags: 1, publishedAt: -1 });

// Virtual for reading time calculation
blogSchema.virtual('readingTimeText').get(function() {
  if (this.readingTime < 1) return 'Less than 1 min read';
  if (this.readingTime === 1) return '1 min read';
  return `${this.readingTime} min read`;
});

// Virtual for formatted published date
blogSchema.virtual('formattedPublishedDate').get(function() {
  if (!this.publishedAt) return '';
  return new Date(this.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Method to calculate reading time
blogSchema.methods.calculateReadingTime = function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  return this.readingTime;
};

// Method to generate slug from title with duplicate handling
blogSchema.methods.generateSlug = async function() {
  let baseSlug = this.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  
  // Check if slug already exists and add counter if it does
  while (true) {
    const existingPost = await this.constructor.findOne({ slug });
    // For new documents (this._id is undefined), check if slug exists
    // For existing documents, check if slug exists for a different document
    if (!existingPost || (this._id && existingPost._id.equals(this._id))) {
      break;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  this.slug = slug;
  return this.slug;
};

// Method to increment views
blogSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment likes
blogSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save();
};

// Method to increment shares
blogSchema.methods.incrementShares = function() {
  this.shares += 1;
  return this.save();
};

// Static method to get popular posts
blogSchema.statics.getPopularPosts = async function(limit = 10) {
  return this.find({ 
    status: 'published', 
    isPublished: true 
  })
  .sort({ views: -1, likes: -1 })
  .limit(limit)
  .populate('author', 'name profilePicture')
  .select('title slug excerpt featuredImage views likes publishedAt');
};

// Static method to get posts by category
blogSchema.statics.getPostsByCategory = async function(category, limit = 20, page = 1) {
  const skip = (page - 1) * limit;
  
  const posts = await this.find({ 
    category, 
    status: 'published', 
    isPublished: true 
  })
  .sort({ publishedAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('author', 'name profilePicture')
  .select('title slug excerpt featuredImage views likes publishedAt');
  
  const total = await this.countDocuments({ 
    category, 
    status: 'published', 
    isPublished: true 
  });
  
  return {
    posts,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page
  };
};

// Static method to search posts
blogSchema.statics.searchPosts = async function(query, limit = 20, page = 1) {
  const skip = (page - 1) * limit;
  
  const searchQuery = {
    status: 'published',
    isPublished: true,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  };
  
  const posts = await this.find(searchQuery)
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name profilePicture')
    .select('title slug excerpt featuredImage views likes publishedAt');
  
  const total = await this.countDocuments(searchQuery);
  
  return {
    posts,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page
  };
};

module.exports = mongoose.model('Blog', blogSchema);
