import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Eye, Heart, Share2, ArrowLeft, Tag } from 'lucide-react';
import { blogAPI } from '../utils/api';
import BlogCard from '../components/blog/BlogCard';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await blogAPI.getBySlug(slug);
        setPost(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const getCategoryColor = (cat) => {
    const colors = {
      'general-health': 'bg-blue-100 text-blue-800',
      'mental-health': 'bg-purple-100 text-purple-800',
      'nutrition': 'bg-green-100 text-green-800',
      'fitness': 'bg-orange-100 text-orange-800',
      'pediatrics': 'bg-pink-100 text-pink-800',
      'cardiology': 'bg-red-100 text-red-800',
      'dermatology': 'bg-indigo-100 text-indigo-800',
      'orthopedics': 'bg-gray-100 text-gray-800',
      'neurology': 'bg-teal-100 text-teal-800',
      'oncology': 'bg-yellow-100 text-yellow-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[cat] || colors['other'];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <Link to="/blog" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h2>
          <p className="text-gray-600">The blog post you're looking for doesn't exist.</p>
          <Link to="/blog" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to="/blog" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>

        {/* Blog Post Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-8"
        >
          {/* Category Badge */}
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${getCategoryColor(post.category)}`}>
            {post.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

          {/* Meta Information */}
          <div className="flex items-center text-gray-600 text-sm mb-6 space-x-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(post.publishedAt)}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {post.readingTime} min read
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {post.views} views
            </div>
          </div>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-8">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Author Info */}
          <div className="flex items-center mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
              {post.author.profilePicture ? (
                <img
                  src={post.author.profilePicture}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-semibold">
                  {post.author.name.split(' ').map(n => n[0]).join('')}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
              <p className="text-sm text-gray-600">{post.author.bio}</p>
            </div>
          </div>

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-2">
                <Tag className="w-4 h-4 mr-2 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Engagement Stats */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <div className="flex items-center space-x-4">
              <button className="flex items-center text-gray-600 hover:text-red-600 transition-colors">
                <Heart className="w-5 h-5 mr-1" />
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <Share2 className="w-5 h-5 mr-1" />
                <span>{post.shares}</span>
              </button>
            </div>
          </div>
        </motion.article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map(relatedPost => (
                <BlogCard key={relatedPost._id} post={relatedPost} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPost;
