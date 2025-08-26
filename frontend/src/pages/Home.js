import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Calendar, 
  MessageCircle, 
  Shield, 
  Star, 
  Users,
  Clock,
  MapPin
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Stethoscope className="w-8 h-8" />,
      title: "Expert Doctors",
      description: "Connect with qualified healthcare professionals across all specialties"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Easy Booking",
      description: "Book appointments in seconds with our intuitive scheduling system"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Online Consultations",
      description: "Get medical advice from the comfort of your home via video calls"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description: "Your health information is protected with bank-level security"
    }
  ];

  const stats = [
    { number: "1000+", label: "Expert Doctors" },
    { number: "50,000+", label: "Happy Patients" },
    { number: "100+", label: "Specialties" },
    { number: "24/7", label: "Support" }
  ];

  const specializations = [
    "Cardiology", "Dermatology", "Orthopedics", "Neurology",
    "Pediatrics", "Gynecology", "Psychiatry", "Oncology",
    "Endocrinology", "Gastroenterology", "Urology", "Ophthalmology"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Your Health, Our Priority
              </h1>
              <p className="text-xl lg:text-2xl text-primary-100 mb-8 leading-relaxed">
                Connect with the best doctors, book appointments instantly, and get expert medical care when you need it most.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/doctors"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Find a Doctor
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <img
                  src="/images/hero-doctor.jpg"
                  alt="Doctor consultation"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-secondary-400 rounded-full opacity-20"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-accent-400 rounded-full opacity-20"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built a comprehensive healthcare platform that puts patients first and makes quality care accessible to everyone.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-soft hover:shadow-medium transition-shadow"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-primary-100">
              Join our growing community of patients and healthcare providers
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-100 text-lg">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Specializations Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Medical Specialties
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find experts in every medical field, from primary care to specialized treatments
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {specializations.map((specialty, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-4 rounded-lg text-center hover:bg-primary-50 hover:text-primary-700 transition-colors cursor-pointer"
              >
                <span className="font-medium">{specialty}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-secondary-100 mb-8 leading-relaxed">
              Join thousands of patients who trust our platform for their healthcare needs. 
              Book your first appointment today and experience the difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-secondary-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Sign Up Now
              </Link>
              <Link
                to="/doctors"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-secondary-700 transition-colors"
              >
                Browse Doctors
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Patients Say
            </h2>
            <p className="text-xl text-gray-600">
              Real experiences from real patients
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Patient",
                content: "The platform made it so easy to find and book an appointment with a specialist. The online consultation was seamless!",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Patient",
                content: "I've been using this service for over a year now. The doctors are professional and the booking system is incredibly convenient.",
                rating: 5
              },
              {
                name: "Emily Rodriguez",
                role: "Patient",
                content: "Finally, a healthcare platform that puts patients first. The quality of care and ease of use exceeded my expectations.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-soft"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
