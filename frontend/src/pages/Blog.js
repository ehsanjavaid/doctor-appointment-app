import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, TrendingUp, Clock } from 'lucide-react';
import { blogAPI } from '../utils/api';
import BlogCard from '../components/blog/BlogCard';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general-health', label: 'General Health' },
    { value: 'mental-health', label: 'Mental Health' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'oncology', label: 'Oncology' },
    { value: 'other', label: 'Other' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: Calendar },
    { value: 'popular', label: 'Most Popular', icon: TrendingUp },
    { value: 'reading-time', label: 'Reading Time', icon: Clock }
  ];

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: 12
      };

      let response;
      
      if (searchQuery) {
        response = await blogAPI.search(searchQuery, params);
      } else if (selectedCategory !== 'all') {
        response = await blogAPI.getByCategory(selectedCategory, params);
      } else {
        response = await blogAPI.getAll(params);
      }

      // For now, we'll use mock data since backend is placeholder
      // Once backend is implemented, use: setPosts(response.data.posts);
      // setTotalPages(response.data.pages);
      
      // Mock data for demonstration
      const mockPosts = [
        {
          _id: '1',
          title: '10 Essential Health Tips for Busy Professionals',
          slug: '10-essential-health-tips',
          excerpt: 'Discover practical health tips that busy professionals can easily incorporate into their daily routines to maintain optimal wellness.',
          content: 'Full content here...',
          author: {
            _id: '1',
            name: 'Dr. Sarah Johnson',
            profilePicture: ''
          },
          category: 'general-health',
          tags: ['health', 'wellness', 'professional', 'tips'],
          featuredImage: '/blockimages/img1.jpg',
          publishedAt: '2024-01-15T10:00:00Z',
          readingTime: 5,
          views: 1245,
          likes: 89,
          status: 'published',
          isPublished: true
        },
        {
          _id: '2',
          title: 'Understanding Mental Health: Breaking the Stigma',
          slug: 'understanding-mental-health',
          excerpt: 'Learn about the importance of mental health awareness and how we can work together to break the stigma surrounding mental health issues.',
          content: 'Full content here...',
          author: {
            _id: '2',
            name: 'Dr. Michael Chen',
            profilePicture: ''
          },
          category: 'mental-health',
          tags: ['mental-health', 'awareness', 'stigma', 'wellbeing'],
          featuredImage: '/blockimages/img2.jpg',
          publishedAt: '2024-01-10T14:30:00Z',
          readingTime: 8,
          views: 987,
          likes: 67,
          status: 'published',
          isPublished: true
        },
        {
          _id: '3',
          title: 'Nutrition Guide: Building Healthy Eating Habits',
          slug: 'nutrition-guide-healthy-habits',
          excerpt: 'A comprehensive guide to developing sustainable healthy eating habits that support your overall wellbeing and energy levels.',
          content: 'Full content here...',
          author: {
            _id: '3',
            name: 'Dr. Emily Rodriguez',
            profilePicture: ''
          },
          category: 'nutrition',
          tags: ['nutrition', 'diet', 'healthy-eating', 'habits'],
          featuredImage: '/blockimages/img3.jpg',
          publishedAt: '2024-01-05T09:15:00Z',
          readingTime: 6,
          views: 1567,
          likes: 112,
          status: 'published',
          isPublished: true
        },
        {
          _id: '4',
          title: 'Cardiovascular Health: Exercise and Diet Tips',
          slug: 'cardiovascular-health-tips',
          excerpt: 'Essential exercise and diet recommendations to maintain optimal cardiovascular health and reduce heart disease risk.',
          content: 'Full content here...',
          author: {
            _id: '4',
            name: 'Dr. James Wilson',
            profilePicture: ''
          },
          category: 'cardiology',
          tags: ['cardiology', 'heart-health', 'exercise', 'diet'],
          featuredImage: '/images/blog/cardio-health.jpg',
          publishedAt: '2024-01-03T16:45:00Z',
          readingTime: 7,
          views: 876,
          likes: 54,
          status: 'published',
          isPublished: true
        },
        {
          _id: '5',
          title: 'Pediatric Care: Keeping Children Healthy',
          slug: 'pediatric-care-children-health',
          excerpt: 'Expert advice on pediatric care and maintaining children\'s health through proper nutrition, exercise, and preventive care.',
          content: 'Full content here...',
          author: {
            _id: '5',
            name: 'Dr. Lisa Thompson',
            profilePicture: ''
          },
          category: 'pediatrics',
          tags: ['pediatrics', 'children-health', 'parenting', 'care'],
          featuredImage: '/images/blog/pediatric-care.jpg',
          publishedAt: '2024-01-01T11:20:00Z',
          readingTime: 9,
          views: 1342,
          likes: 78,
          status: 'published',
          isPublished: true
        },
        {
          _id: '6',
          title: 'Dermatology Basics: Skin Care Routine',
          slug: 'dermatology-skin-care-routine',
          excerpt: 'Learn the fundamentals of an effective skin care routine and how to address common dermatological concerns.',
          content: 'Full content here...',
          author: {
            _id: '6',
            name: 'Dr. Amanda Lee',
            profilePicture: ''
          },
          category: 'dermatology',
          tags: ['dermatology', 'skin-care', 'routine', 'beauty'],
          featuredImage: '/images/blog/skin-care.jpg',
          publishedAt: '2023-12-28T13:10:00Z',
          readingTime: 5,
          views: 2109,
          likes: 145,
          status: 'published',
          isPublished: true
        }
      ];

      setPosts(mockPosts);
      setTotalPages(1);
      setLoading(false);

    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('Failed to load blog posts. Please try again later.');
      setLoading(false);
      
      // Fallback to mock data on error for demonstration
      const mockPosts = [
        {
          _id: '1',
          title: 'Sample Blog Post: Health and Wellness',
          slug: 'sample-blog-post',
          excerpt: 'This is a sample blog post demonstrating the blog functionality. Real data will be loaded when the backend API is implemented.',
          content: 'Full content here...',
          author: {
            _id: '1',
            name: 'Demo Author',
            profilePicture: ''
          },
          category: 'general-health',
          tags: ['sample', 'demo', 'health'],
          featuredImage: '',
          publishedAt: new Date().toISOString(),
          readingTime: 3,
          views: 0,
          likes: 0,
          status: 'published',
          isPublished: true
        }
      ];
      setPosts(mockPosts);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, [searchQuery, selectedCategory, sortBy, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBlogPosts();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={fetchBlogPosts}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Health Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the latest health insights, medical advice, and wellness tips from our expert doctors and healthcare professionals.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-soft mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Articles
              </label>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="search"
                  placeholder="Search blog posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </form>
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort */}
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Blog Posts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {posts.map((post, index) => (
            <BlogCard key={post._id} post={post} />
          ))}
        </motion.div>

        {/* Empty State */}
        {posts.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <div className="text-gray-500 text-lg mb-4">
              No blog posts found{searchQuery ? ` for "${searchQuery}"` : ''}{selectedCategory !== 'all' ? ` in ${categories.find(c => c.value === selectedCategory)?.label}` : ''}.
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSortBy('newest');
              }}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center items-center space-x-2"
          >
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Blog;
