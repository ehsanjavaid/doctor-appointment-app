const mongoose = require('mongoose');
const Blog = require('./models/Blog');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-website', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createTestBlogs = async () => {
  try {
    console.log('Connecting to MongoDB...');
    
    // Find a user to use as author
    const user = await User.findOne();
    if (!user) {
      console.error('No users found in database. Please create a user first.');
      process.exit(1);
    }

    const testBlogs = [
      {
        title: "10 Tips for Maintaining Good Mental Health",
        content: `
          <h2>Introduction</h2>
          <p>Mental health is just as important as physical health. In today's fast-paced world, it's crucial to take care of your mental well-being. Here are 10 practical tips to help you maintain good mental health:</p>
          
          <h3>1. Practice Mindfulness</h3>
          <p>Mindfulness meditation can help reduce stress and improve focus. Try to spend 10-15 minutes each day practicing mindfulness.</p>
          
          <h3>2. Stay Active</h3>
          <p>Regular exercise releases endorphins that can boost your mood and reduce anxiety.</p>
          
          <h3>3. Get Enough Sleep</h3>
          <p>Quality sleep is essential for mental health. Aim for 7-9 hours of sleep per night.</p>
          
          <h3>4. Eat a Balanced Diet</h3>
          <p>Nutrition plays a key role in mental health. Include plenty of fruits, vegetables, and omega-3 fatty acids in your diet.</p>
          
          <h3>5. Stay Connected</h3>
          <p>Maintain strong social connections with friends and family. Social support is crucial for mental well-being.</p>
          
          <h3>6. Set Realistic Goals</h3>
          <p>Break down large tasks into smaller, manageable goals to avoid feeling overwhelmed.</p>
          
          <h3>7. Practice Gratitude</h3>
          <p>Keep a gratitude journal and write down three things you're thankful for each day.</p>
          
          <h3>8. Limit Screen Time</h3>
          <p>Take regular breaks from screens and social media to reduce digital fatigue.</p>
          
          <h3>9. Seek Professional Help</h3>
          <p>Don't hesitate to seek help from mental health professionals if you're struggling.</p>
          
          <h3>10. Practice Self-Compassion</h3>
          <p>Be kind to yourself and recognize that everyone has difficult days.</p>
          
          <h2>Conclusion</h2>
          <p>Taking care of your mental health is an ongoing process. By incorporating these tips into your daily routine, you can build resilience and improve your overall well-being.</p>
        `,
        excerpt: "Discover 10 practical tips to maintain good mental health and improve your overall well-being in today's fast-paced world.",
        author: user._id,
        category: 'mental-health',
        tags: ['mental health', 'wellness', 'self-care', 'mindfulness'],
        status: 'published',
        isPublished: true,
        publishedAt: new Date(),
        featuredImage: '/images/blog/mental-health.jpg'
      },
      {
        title: "The Ultimate Guide to Healthy Eating Habits",
        content: `
          <h2>Introduction</h2>
          <p>Healthy eating is not about strict dietary limitations or depriving yourself of the foods you love. Rather, it's about feeling great, having more energy, and stabilizing your mood.</p>
          
          <h3>Understanding Macronutrients</h3>
          <p>Learn about the importance of carbohydrates, proteins, and fats in your diet and how to balance them properly.</p>
          
          <h3>Portion Control</h3>
          <p>Discover effective strategies for portion control without feeling deprived.</p>
          
          <h3>Meal Planning</h3>
          <p>Tips for successful meal planning and preparation to maintain healthy eating habits.</p>
          
          <h3>Hydration Importance</h3>
          <p>Why staying hydrated is crucial for overall health and how much water you really need.</p>
          
          <h2>Conclusion</h2>
          <p>Healthy eating is a journey, not a destination. Start with small changes and build sustainable habits over time.</p>
        `,
        excerpt: "Learn how to develop sustainable healthy eating habits that will improve your energy levels and overall well-being.",
        author: user._id,
        category: 'nutrition',
        tags: ['nutrition', 'healthy eating', 'diet', 'wellness'],
        status: 'published',
        isPublished: true,
        publishedAt: new Date(Date.now() - 86400000), // 1 day ago
        featuredImage: '/images/blog/nutrition.jpg'
      },
      {
        title: "Cardiovascular Health: Prevention and Management",
        content: `
          <h2>Understanding Heart Health</h2>
          <p>Cardiovascular diseases are the leading cause of death globally. Learn how to protect your heart health.</p>
          
          <h3>Risk Factors</h3>
          <p>Identify and manage common risk factors for heart disease.</p>
          
          <h3>Exercise for Heart Health</h3>
          <p>The best types of exercise for maintaining cardiovascular fitness.</p>
          
          <h3>Heart-Healthy Diet</h3>
          <p>Foods that support cardiovascular health and those to avoid.</p>
          
          <h2>Conclusion</h2>
          <p>Taking proactive steps today can significantly reduce your risk of heart disease in the future.</p>
        `,
        excerpt: "Comprehensive guide to understanding, preventing, and managing cardiovascular diseases for better heart health.",
        author: user._id,
        category: 'cardiology',
        tags: ['heart health', 'cardiology', 'prevention', 'exercise'],
        status: 'published',
        isPublished: true,
        publishedAt: new Date(Date.now() - 172800000), // 2 days ago
        featuredImage: '/images/blog/cardiology.jpg'
      }
    ];

    console.log('Creating test blog posts...');
    
    for (const blogData of testBlogs) {
      const blog = new Blog(blogData);
      
      // Generate slug
      await blog.generateSlug();
      
      // Calculate reading time
      blog.calculateReadingTime();
      
      await blog.save();
      console.log(`Created blog post: ${blog.title}`);
    }

    console.log('Test blog posts created successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error creating test blogs:', error);
    process.exit(1);
  }
};

createTestBlogs();
