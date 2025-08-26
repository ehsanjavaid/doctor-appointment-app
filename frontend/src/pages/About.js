import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            About Our Healthcare Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connecting patients with trusted healthcare professionals through a seamless, 
            modern digital experience. Your health is our priority.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              We are dedicated to revolutionizing healthcare accessibility by providing a 
              comprehensive platform that connects patients with qualified doctors, 
              simplifies appointment scheduling, and enhances the overall healthcare experience.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 inline-flex mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Patient-Centric</h3>
                <p className="text-gray-600 text-sm">
                  Designed with patients' needs and convenience as our top priority
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-4 inline-flex mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Trusted Care</h3>
                <p className="text-gray-600 text-sm">
                  Verified doctors and healthcare professionals you can rely on
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-4 inline-flex mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Fast & Efficient</h3>
                <p className="text-gray-600 text-sm">
                  Quick appointments and streamlined healthcare services
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-3">Easy Appointment Booking</h3>
              <p className="text-gray-600">
                Schedule appointments with doctors in just a few clicks, 24/7 availability
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-3">Doctor Profiles</h3>
              <p className="text-gray-600">
                Detailed profiles with qualifications, experience, and patient reviews
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-3">Secure Payments</h3>
              <p className="text-gray-600">
                Multiple payment options with bank-level security and encryption
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-3">Medical Records</h3>
              <p className="text-gray-600">
                Access your medical history and appointment records securely
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-3">Real-time Updates</h3>
              <p className="text-gray-600">
                Instant notifications and reminders for your appointments
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-3">Multi-Specialty</h3>
              <p className="text-gray-600">
                Wide range of medical specialties and healthcare services
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gray-200 rounded-full w-32 h-32 mx-auto mb-4"></div>
              <h3 className="font-semibold text-gray-900">Dr. Sarah Chen</h3>
              <p className="text-blue-600 mb-2">Chief Medical Officer</p>
              <p className="text-gray-600 text-sm">15+ years in healthcare technology</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-200 rounded-full w-32 h-32 mx-auto mb-4"></div>
              <h3 className="font-semibold text-gray-900">Michael Rodriguez</h3>
              <p className="text-blue-600 mb-2">Technical Director</p>
              <p className="text-gray-600 text-sm">Software engineering expert</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-200 rounded-full w-32 h-32 mx-auto mb-4"></div>
              <h3 className="font-semibold text-gray-900">Dr. James Wilson</h3>
              <p className="text-blue-600 mb-2">Medical Advisor</p>
              <p className="text-gray-600 text-sm">Board-certified physician</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-200 rounded-full w-32 h-32 mx-auto mb-4"></div>
              <h3 className="font-semibold text-gray-900">Lisa Thompson</h3>
              <p className="text-blue-600 mb-2">Patient Experience</p>
              <p className="text-gray-600 text-sm">Healthcare service specialist</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-blue-600 rounded-lg text-white p-8 mb-16">
          <div className="grid md:grid-col-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Verified Doctors</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Happy Patients</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Support Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8">
            Join thousands of patients who have transformed their healthcare experience with our platform.
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Book Your First Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;
