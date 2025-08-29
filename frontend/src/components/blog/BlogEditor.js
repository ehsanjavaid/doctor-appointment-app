import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogAPI, uploadFile } from '../../utils/api';
import { Save, X, Image, Tag, Clock } from 'lucide-react';

const BlogEditor = ({ post, onSave, onCancel }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    category: post?.category || 'general-health',
    tags: post?.tags?.join(', ') || '',
    featuredImage: post?.featuredImage || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const categories = [
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
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      let featuredImageUrl = formData.featuredImage;
      
      // If a new image file is selected, upload it first
      if (imageFile) {
        try {
          const uploadResponse = await uploadFile(imageFile);
          featuredImageUrl = uploadResponse.data.filePath;
        } catch (uploadError) {
          setError('Failed to upload image. Please try again.');
          setLoading(false);
          return;
        }
      }

      const blogData = {
        status: 'published',
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        category: formData.category,
        tags: tagsArray,
        featuredImage: featuredImageUrl
      };

      let savedPost;
      if (post) {
        savedPost = await blogAPI.update(post._id, blogData);
      } else {
        savedPost = await blogAPI.create(blogData);
      }

      setSuccess(post ? 'Blog post updated successfully!' : 'Blog post created successfully!');
      onSave(savedPost.data);
      // Only navigate for new posts, not for edits
      if (!post) {
        setTimeout(() => {
          navigate('/blog', { replace: true });
        }, 500);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateReadingTime = () => {
    const wordsPerMinute = 200;
    const wordCount = formData.content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {post ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter blog post title..."
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Write your blog post content here..."
              required
            />
            <div className="mt-2 text-sm text-gray-500 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Estimated reading time: {calculateReadingTime()} minutes
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Brief summary of your blog post..."
              maxLength={300}
            />
            <div className="text-sm text-gray-500 mt-1">
              {formData.excerpt.length}/300 characters
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="health, wellness, tips..."
            />
          </div>

          {/* Featured Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Image className="w-4 h-4 inline mr-1" />
              Featured Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setImageFile(file);
                  setFormData(prev => ({
                    ...prev,
                    featuredImage: URL.createObjectURL(file) // Create a preview URL
                  }));
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {formData.featuredImage && (
              <div className="mt-2">
                <img 
                  src={formData.featuredImage} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
          {/* Removed status select as draft option is removed */}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {post ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {post ? 'Update Post' : 'Create Post'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogEditor;
