import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Eye, Heart, Share2 } from 'lucide-react';

const BlogCard = ({ post }) => {
  const {
    title,
    slug,
    excerpt,
    featuredImage,
    author,
    category,
    publishedAt,
    readingTime,
    views,
    likes,
    tags = []
  } = post;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  return (
    <article className="bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden group">
      {/* Featured Image */}
      {featuredImage && (
        <div className="relative overflow-hidden">
          <img
            src={featuredImage}
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(category)}`}>
              {category.replace('-', ' ')}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
          <Link to={`/blog/${slug}`} className="hover:no-underline">
            {title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
          {excerpt}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            {/* Author */}
            {author && (
              <div className="flex items-center">
                {author.profilePicture ? (
                  <img
                    src={author.profilePicture}
                    alt={author.name}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                ) : (
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-medium mr-2">
                    {author.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                )}
                <span>{author.name}</span>
              </div>
            )}

            {/* Date */}
            {publishedAt && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(publishedAt)}
              </div>
            )}

            {/* Reading Time */}
            {readingTime && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {readingTime} min read
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4">
            {/* Views */}
            {views > 0 && (
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {views}
              </div>
            )}

            {/* Likes */}
            {likes > 0 && (
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                {likes}
              </div>
            )}
          </div>
        </div>

        {/* Read More Button */}
        <div className="mt-4">
          <Link
            to={`/blog/${slug}`}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium group-hover:underline"
          >
            Read More
            <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
