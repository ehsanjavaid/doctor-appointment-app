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

  const mockBlogPosts = {
    '10-essential-health-tips': {
      _id: '1',
      title: '10 Essential Health Tips for Busy Professionals',
      slug: '10-essential-health-tips',
      content: `
        <h2>Introduction</h2>
        <p>In today's fast-paced world, maintaining good health can be challenging for busy professionals. Between meetings, deadlines, and personal commitments, it's easy to neglect your well-being. However, prioritizing your health is crucial for long-term success and happiness.</p>
        
        <h2>1. Prioritize Sleep</h2>
        <p>Quality sleep is the foundation of good health. Aim for 7-9 hours of uninterrupted sleep each night. Create a relaxing bedtime routine and keep your bedroom dark, quiet, and cool for optimal rest.</p>
        
        <h2>2. Stay Hydrated</h2>
        <p>Dehydration can lead to fatigue, headaches, and decreased cognitive function. Keep a water bottle at your desk and aim to drink at least 8 glasses of water throughout the day.</p>
        
        <h2>3. Move Regularly</h2>
        <p>Incorporate movement into your daily routine. Take walking meetings, use a standing desk, or schedule short exercise breaks. Even 10-15 minutes of activity can boost energy and focus.</p>
        
        <h2>4. Healthy Snacking</h2>
        <p>Keep healthy snacks like nuts, fruits, and yogurt at your workspace. Avoid sugary snacks that lead to energy crashes and opt for protein-rich options that sustain energy levels.</p>
        
        <h2>5. Mindful Eating</h2>
        <p>Take time to enjoy your meals without distractions. Eating mindfully helps with digestion and prevents overeating. Chew slowly and savor each bite.</p>
        
        <h2>6. Stress Management</h2>
        <p>Practice stress-reduction techniques like deep breathing, meditation, or short walks. Chronic stress can negatively impact both physical and mental health.</p>
        
        <h2>7. Regular Check-ups</h2>
        <p>Don't skip annual health check-ups and preventive screenings. Early detection of health issues can prevent more serious problems down the line.</p>
        
        <h2>8. Digital Detox</h2>
        <p>Take regular breaks from screens to reduce eye strain and mental fatigue. The 20-20-20 rule (every 20 minutes, look at something 20 feet away for 20 seconds) can help.</p>
        
        <h2>9. Social Connections</h2>
        <p>Maintain strong social connections with colleagues, friends, and family. Social support is crucial for mental health and overall well-being.</p>
        
        <h2>10. Work-Life Balance</h2>
        <p>Set clear boundaries between work and personal time. Learn to say no when necessary and prioritize activities that bring you joy and relaxation.</p>
        
        <h2>Conclusion</h2>
        <p>Implementing these health tips doesn't require drastic changes. Start with one or two habits and gradually incorporate more into your routine. Remember, small consistent actions lead to significant long-term health benefits.</p>
      `,
      excerpt: 'Discover practical health tips that busy professionals can easily incorporate into their daily routines to maintain optimal wellness.',
      author: {
        _id: '1',
        name: 'Dr. Sarah Johnson',
        profilePicture: '',
        bio: 'Board-certified physician with over 15 years of experience in preventive medicine and wellness coaching.'
      },
      category: 'general-health',
      tags: ['health', 'wellness', 'professional', 'tips', 'lifestyle', 'productivity'],
      featuredImage: '/images/blog/health-tips.jpg',
      publishedAt: '2024-01-15T10:00:00Z',
      readingTime: 5,
      views: 1245,
      likes: 89,
      shares: 23,
      status: 'published',
      isPublished: true
    },
    'understanding-mental-health': {
      _id: '2',
      title: 'Understanding Mental Health: Breaking the Stigma',
      slug: 'understanding-mental-health',
      content: `
        <h2>Introduction</h2>
        <p>Mental health is an essential component of overall well-being, yet it remains one of the most misunderstood and stigmatized aspects of healthcare. In this article, we explore the importance of mental health awareness and how we can work together to break down barriers.</p>
        
        <h2>The Importance of Mental Health</h2>
        <p>Mental health affects how we think, feel, and act. It also helps determine how we handle stress, relate to others, and make choices. Good mental health isn't just the absence of mental health problems but also the presence of positive characteristics.</p>
        
        <h2>Common Mental Health Conditions</h2>
        <p>Mental health conditions include anxiety disorders, depression, bipolar disorder, schizophrenia, and many others. These conditions can affect anyone regardless of age, gender, or background.</p>
        
        <h2>Breaking the Stigma</h2>
        <p>Stigma surrounding mental health prevents many people from seeking help. We can combat stigma by educating ourselves and others, speaking openly about mental health, and showing compassion to those who are struggling.</p>
        
        <h2>Signs to Watch For</h2>
        <p>Common signs of mental health issues include persistent sadness, excessive fears or worries, extreme mood changes, withdrawal from friends and activities, and significant tiredness or low energy.</p>
        
        <h2>Getting Help</h2>
        <p>If you or someone you know is struggling, reach out to a mental health professional. Treatment options include therapy, medication, support groups, and lifestyle changes.</p>
        
        <h2>Conclusion</h2>
        <p>Mental health is just as important as physical health. By understanding mental health conditions and working to eliminate stigma, we can create a more supportive and compassionate society for everyone.</p>
      `,
      excerpt: 'Learn about the importance of mental health awareness and how we can work together to break the stigma surrounding mental health issues.',
      author: {
        _id: '2',
        name: 'Dr. Michael Chen',
        profilePicture: '',
        bio: 'Licensed psychologist specializing in cognitive behavioral therapy and mental health advocacy.'
      },
      category: 'mental-health',
      tags: ['mental-health', 'awareness', 'stigma', 'wellbeing', 'therapy'],
      featuredImage: '/images/blog/mental-health.jpg',
      publishedAt: '2024-01-10T14:30:00Z',
      readingTime: 8,
      views: 987,
      likes: 67,
      shares: 34,
      status: 'published',
      isPublished: true
    },
    'nutrition-guide-healthy-habits': {
      _id: '3',
      title: 'Nutrition Guide: Building Healthy Eating Habits',
      slug: 'nutrition-guide-healthy-habits',
      content: `
        <h2>Introduction</h2>
        <p>Proper nutrition is the foundation of good health and well-being. Developing healthy eating habits can seem challenging, but with the right approach, it becomes a sustainable lifestyle choice rather than a temporary diet.</p>
        
        <h2>The Basics of Balanced Nutrition</h2>
        <p>A balanced diet includes a variety of foods from all food groups: fruits, vegetables, whole grains, lean proteins, and healthy fats. Each food group provides essential nutrients that your body needs to function properly.</p>
        
        <h2>Portion Control</h2>
        <p>Understanding portion sizes is crucial for maintaining a healthy weight. Use visual cues like comparing portions to everyday objects (e.g., a serving of meat should be about the size of a deck of cards).</p>
        
        <h2>Meal Planning</h2>
        <p>Planning meals in advance helps ensure you make healthy choices and avoid last-minute unhealthy options. Set aside time each week to plan your meals and prepare ingredients.</p>
        
        <h2>Hydration Matters</h2>
        <p>Water is essential for digestion, nutrient absorption, and overall health. Aim for at least 8 glasses of water daily, and more if you're physically active.</p>
        
        <h2>Mindful Eating</h2>
        <p>Pay attention to your food while eating. Avoid distractions like TV or phones, chew slowly, and listen to your body's hunger and fullness cues.</p>
        
        <h2>Healthy Snacking</h2>
        <p>Choose nutrient-dense snacks like fruits, vegetables with hummus, nuts, or yogurt. These provide energy between meals without excessive calories.</p>
        
        <h2>Conclusion</h2>
        <p>Building healthy eating habits is a journey, not a destination. Start with small changes, be consistent, and remember that occasional indulgences are part of a balanced approach to nutrition.</p>
      `,
      excerpt: 'A comprehensive guide to developing sustainable healthy eating habits that support your overall wellbeing and energy levels.',
      author: {
        _id: '3',
        name: 'Dr. Emily Rodriguez',
        profilePicture: '',
        bio: 'Registered dietitian and nutrition specialist with expertise in preventive nutrition and lifestyle medicine.'
      },
      category: 'nutrition',
      tags: ['nutrition', 'diet', 'healthy-eating', 'habits', 'wellness'],
      featuredImage: '/images/blog/nutrition.jpg',
      publishedAt: '2024-01-05T09:15:00Z',
      readingTime: 6,
      views: 1567,
      likes: 112,
      shares: 45,
      status: 'published',
      isPublished: true
    },
    'cardiovascular-health-tips': {
      _id: '4',
      title: 'Cardiovascular Health: Exercise and Diet Tips',
      slug: 'cardiovascular-health-tips',
      content: `
        <h2>Introduction</h2>
        <p>Cardiovascular health is crucial for overall well-being and longevity. Your heart and blood vessels work tirelessly to deliver oxygen and nutrients throughout your body, making their care a top priority.</p>
        
        <h2>Understanding Cardiovascular Health</h2>
        <p>The cardiovascular system includes your heart and blood vessels. Maintaining its health helps prevent conditions like heart disease, stroke, and high blood pressure.</p>
        
        <h2>Exercise for Heart Health</h2>
        <p>Regular physical activity strengthens your heart muscle, improves circulation, and helps maintain a healthy weight. Aim for at least 150 minutes of moderate exercise or 75 minutes of vigorous exercise weekly.</p>
        
        <h2>Heart-Healthy Diet</h2>
        <p>Focus on foods rich in fiber, omega-3 fatty acids, and antioxidants. Include plenty of fruits, vegetables, whole grains, lean proteins, and healthy fats in your diet.</p>
        
        <h2>Foods to Include</h2>
        <p>Salmon, oats, berries, nuts, leafy greens, and olive oil are excellent choices for cardiovascular health. These foods provide essential nutrients that support heart function.</p>
        
        <h2>Foods to Limit</h2>
        <p>Reduce intake of saturated fats, trans fats, sodium, and added sugars. Processed foods, fried foods, and sugary beverages can negatively impact heart health.</p>
        
        <h2>Lifestyle Factors</h2>
        <p>Manage stress, get adequate sleep, avoid smoking, and limit alcohol consumption. These factors significantly impact cardiovascular health.</p>
        
        <h2>Regular Check-ups</h2>
        <p>Regular health screenings help monitor blood pressure, cholesterol levels, and other important indicators of cardiovascular health.</p>
        
        <h2>Conclusion</h2>
        <p>Taking care of your cardiovascular system through exercise, proper nutrition, and healthy lifestyle choices is one of the best investments you can make in your long-term health.</p>
      `,
      excerpt: 'Essential exercise and diet recommendations to maintain optimal cardiovascular health and reduce heart disease risk.',
      author: {
        _id: '4',
        name: 'Dr. James Wilson',
        profilePicture: '',
        bio: 'Cardiologist with expertise in preventive cardiology and heart disease management.'
      },
      category: 'cardiology',
      tags: ['cardiology', 'heart-health', 'exercise', 'diet', 'prevention'],
      featuredImage: '/images/blog/cardio-health.jpg',
      publishedAt: '2024-01-03T16:45:00Z',
      readingTime: 7,
      views: 876,
      likes: 54,
      shares: 29,
      status: 'published',
      isPublished: true
    },
    'pediatric-care-children-health': {
      _id: '5',
      title: 'Pediatric Care: Keeping Children Healthy',
      slug: 'pediatric-care-children-health',
      content: `
        <h2>Introduction</h2>
        <p>Children's health requires special attention and care as their bodies and minds are constantly growing and developing. Proper pediatric care sets the foundation for a lifetime of good health.</p>
        
        <h2>Well-Child Visits</h2>
        <p>Regular check-ups are essential for monitoring growth, development, and overall health. These visits include vaccinations, developmental screenings, and health education.</p>
        
        <h2>Nutrition for Growing Children</h2>
        <p>Children need a balanced diet rich in nutrients to support their rapid growth. Include a variety of fruits, vegetables, whole grains, proteins, and dairy in their meals.</p>
        
        <h2>Physical Activity</h2>
        <p>Children should get at least 60 minutes of physical activity daily. This helps build strong bones and muscles, maintain a healthy weight, and develop motor skills.</p>
        
        <h2>Sleep Requirements</h2>
        <p>Adequate sleep is crucial for children's growth and development. Newborns need 14-17 hours, toddlers 11-14 hours, and school-aged children 9-11 hours of sleep daily.</p>
        
        <h2>Preventive Care</h2>
        <p>Vaccinations, dental care, vision screenings, and safety education are all part of comprehensive pediatric preventive care.</p>
        
        <h2>Common Childhood Illnesses</h2>
        <p>Understanding common conditions like colds, ear infections, and allergies helps parents provide appropriate care and know when to seek medical attention.</p>
        
        <h2>Mental and Emotional Health</h2>
        <p>Children's mental health is as important as physical health. Create a supportive environment, encourage open communication, and watch for signs of stress or anxiety.</p>
        
        <h2>Conclusion</h2>
        <p>By providing consistent, comprehensive care and creating healthy habits early, we can help children grow into healthy, happy adults.</p>
      `,
      excerpt: 'Expert advice on pediatric care and maintaining children\'s health through proper nutrition, exercise, and preventive care.',
      author: {
        _id: '5',
        name: 'Dr. Lisa Thompson',
        profilePicture: '',
        bio: 'Pediatrician specializing in child development and preventive pediatric medicine.'
      },
      category: 'pediatrics',
      tags: ['pediatrics', 'children-health', 'parenting', 'care', 'development'],
      featuredImage: '/images/blog/pediatric-care.jpg',
      publishedAt: '2024-01-01T11:20:00Z',
      readingTime: 9,
      views: 1342,
      likes: 78,
      shares: 38,
      status: 'published',
      isPublished: true
    },
    'dermatology-skin-care-routine': {
      _id: '6',
      title: 'Dermatology Basics: Skin Care Routine',
      slug: 'dermatology-skin-care-routine',
      content: `
        <h2>Introduction</h2>
        <p>Your skin is your body's largest organ and serves as a protective barrier against environmental factors. A proper skincare routine is essential for maintaining healthy, radiant skin at any age.</p>
        
        <h2>Understanding Your Skin Type</h2>
        <p>Knowing your skin type (normal, dry, oily, combination, or sensitive) is the first step in creating an effective skincare routine. Each type requires different care approaches.</p>
        
        <h2>Basic Skincare Steps</h2>
        <p>A fundamental routine includes cleansing, toning, moisturizing, and sun protection. These steps form the foundation of healthy skin maintenance.</p>
        
        <h2>Cleansing</h2>
        <p>Choose a gentle cleanser appropriate for your skin type. Cleanse twice daily to remove dirt, oil, and impurities without stripping natural oils.</p>
        
        <h2>Moisturizing</h2>
        <p>Moisturizers help maintain skin hydration and protect the skin barrier. Select products based on your skin type and concerns.</p>
        
        <h2>Sun Protection</h2>
        <p>Daily sunscreen use is non-negotiable for skin health. Choose broad-spectrum SPF 30 or higher and reapply every 2 hours when outdoors.</p>
        
        <h2>Specialized Treatments</h2>
        <p>Incorporate treatments like serums, exfoliants, and masks based on specific concerns such as acne, aging, or hyperpigmentation.</p>
        
        <h2>Lifestyle Factors</h2>
        <p>Diet, hydration, sleep, and stress management all significantly impact skin health. A holistic approach yields the best results.</p>
        
        <h2>When to See a Dermatologist</h2>
        <p>Consult a dermatologist for persistent skin issues, changing moles, severe acne, or any concerns that don't improve with over-the-counter treatments.</p>
        
        <h2>Conclusion</h2>
        <p>Consistency is key in skincare. Establish a routine that works for your skin type and stick with it, making adjustments as needed based on seasonal changes or evolving skin concerns.</p>
      `,
      excerpt: 'Learn the fundamentals of an effective skin care routine and how to address common dermatological concerns.',
      author: {
        _id: '6',
        name: 'Dr. Amanda Lee',
        profilePicture: '',
        bio: 'Board-certified dermatologist specializing in medical and cosmetic dermatology.'
      },
      category: 'dermatology',
      tags: ['dermatology', 'skin-care', 'routine', 'beauty', 'health'],
      featuredImage: '/images/blog/skin-care.jpg',
      publishedAt: '2023-12-28T13:10:00Z',
      readingTime: 5,
      views: 2109,
      likes: 145,
      shares: 67,
      status: 'published',
      isPublished: true
    }
  };

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll use mock data since backend is placeholder
      // Once backend is implemented, use: const response = await blogAPI.getBySlug(slug);
      // setPost(response.data);
      
      // Get the specific blog post based on slug
      const mockPost = mockBlogPosts[slug] || mockBlogPosts['10-essential-health-tips'];
      
      if (!mockPost) {
        setError('Blog post not found.');
        setLoading(false);
        return;
      }

      setPost(mockPost);
      setLoading(false);

      // Fetch related posts
      fetchRelatedPosts(mockPost.category, mockPost._id);

    } catch (err) {
      console.error('Error fetching blog post:', err);
      setError('Failed to load blog post. Please try again later.');
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (category, excludeId) => {
    try {
      setLoadingRelated(true);
      
      // For now, we'll use mock data since backend is placeholder
      // Once backend is implemented, use: const response = await blogAPI.getByCategory(category, { limit: 3 });
      // setRelatedPosts(response.data.posts.filter(post => post._id !== excludeId));
      
      // Mock related posts
      const mockRelatedPosts = [
        {
          _id: '2',
          title: 'Understanding Mental Health: Breaking the Stigma',
          slug: 'understanding-mental-health',
          excerpt: 'Learn about the importance of mental health awareness and how we can work together to break the stigma surrounding mental health issues.',
          author: {
            _id: '2',
            name: 'Dr. Michael Chen',
            profilePicture: ''
          },
          category: 'mental-health',
          tags: ['mental-health', 'awareness', 'stigma'],
          featuredImage: '/images/blog/mental-health.jpg',
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
          author: {
            _id: '3',
            name: 'Dr. Emily Rodriguez',
            profilePicture: ''
          },
          category: 'nutrition',
          tags: ['nutrition', 'diet', 'healthy-eating'],
          featuredImage: '/images/blog/nutrition.jpg',
          publishedAt: '2024-01-05T09:15:00Z',
          readingTime: 6,
          views: 1567,
          likes: 112,
          status: 'published',
          isPublished: true
        }
      ];

      setRelatedPosts(mockRelatedPosts);
      setLoadingRelated(false);

    } catch (err) {
      console.error('Error fetching related posts:', err);
      setLoadingRelated(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchBlogPost();
    }
  }, [slug]);

  // Scroll to top when component mounts or slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={fetchBlogPost}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-gray-600 text-lg">Blog post not found.</div>
            <Link
              to="/blog"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            to="/blog"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </motion.div>

        {/* Article Header */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-soft p-8 mb-8"
        >
          {/* Category */}
          <div className="mb-4">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(post.category)}`}>
              {post.category.replace('-', ' ')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
            {/* Author */}
            {post.author && (
              <div className="flex items-center">
                {post.author.profilePicture ? (
                  <img
                    src={post.author.profilePicture}
                    alt={post.author.name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-sm font-medium mr-2">
                    {post.author.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                )}
                <span>{post.author.name}</span>
              </div>
            )}

            {/* Date */}
            {post.publishedAt && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(post.publishedAt)}
              </div>
            )}

            {/* Reading Time */}
            {post.readingTime && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {post.readingTime} min read
              </div>
            )}

            {/* Views */}
            {post.views > 0 && (
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {post.views} views
              </div>
            )}

            {/* Likes */}
            {post.likes > 0 && (
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                {post.likes} likes
              </div>
            )}
          </div>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-8">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-64 lg:h-80 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <Tag className="w-4 h-4 text-gray-400 mt-1" />
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Author Bio */}
          {post.author && post.author.bio && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Author</h3>
              <div className="flex items-start space-x-4">
                {post.author.profilePicture ? (
                  <img
                    src={post.author.profilePicture}
                    alt={post.author.name}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xl font-medium">
                    {post.author.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">{post.author.name}</h4>
                  <p className="text-gray-600 mt-1">{post.author.bio}</p>
                </div>
              </div>
            </div>
          )}
        </motion.article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost._id} post={relatedPost} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-primary-600 rounded-xl p-8 text-center text-white"
        >
          <h2 className="text-2xl font-bold mb-4">Enjoyed this article?</h2>
          <p className="text-primary-100 mb-6">
            Discover more health insights and wellness tips in our blog.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Explore More Articles
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogPost;
