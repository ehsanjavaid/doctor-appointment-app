import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  Award,
  Calendar,
  ChevronDown,
  X
} from 'lucide-react';

const DoctorSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);

  // Mock data for doctors
  const mockDoctors = [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      specialty: 'Cardiology',
      image: '/images/doctor-1.jpg',
      rating: 4.9,
      reviews: 127,
      experience: '15 years',
      location: 'Main Hospital, Downtown',
      availability: 'Tomorrow',
      languages: ['English', 'Mandarin'],
      education: 'Harvard Medical School',
      fee: '$150',
      nextAvailable: '2024-02-20'
    },
    {
      id: 2,
      name: 'Dr. Michael Rodriguez',
      specialty: 'Dermatology',
      image: '/images/doctor-2.jpg',
      rating: 4.8,
      reviews: 89,
      experience: '12 years',
      location: 'Skin Care Center, Westside',
      availability: 'Today',
      languages: ['English', 'Spanish'],
      education: 'Johns Hopkins University',
      fee: '$120',
      nextAvailable: '2024-02-19'
    },
    {
      id: 3,
      name: 'Dr. James Wilson',
      specialty: 'Orthopedics',
      image: '/images/doctor-3.jpg',
      rating: 4.7,
      reviews: 156,
      experience: '18 years',
      location: 'Sports Medicine Center',
      availability: 'This week',
      languages: ['English'],
      education: 'Stanford University',
      fee: '$180',
      nextAvailable: '2024-02-22'
    },
    {
      id: 4,
      name: 'Dr. Emily Park',
      specialty: 'Pediatrics',
      image: '/images/doctor-4.jpg',
      rating: 4.9,
      reviews: 203,
      experience: '10 years',
      location: 'Children\'s Hospital, Northside',
      availability: 'Tomorrow',
      languages: ['English', 'Korean'],
      education: 'UCLA Medical School',
      fee: '$100',
      nextAvailable: '2024-02-20'
    },
    {
      id: 5,
      name: 'Dr. Robert Kim',
      specialty: 'Neurology',
      image: '/images/doctor-5.jpg',
      rating: 4.6,
      reviews: 78,
      experience: '14 years',
      location: 'Neuro Center, Downtown',
      availability: 'Next week',
      languages: ['English', 'Korean'],
      education: 'Mayo Clinic',
      fee: '$200',
      nextAvailable: '2024-02-25'
    },
    {
      id: 6,
      name: 'Dr. Lisa Thompson',
      specialty: 'Gynecology',
      image: '/images/doctor-6.jpg',
      rating: 4.8,
      reviews: 142,
      experience: '11 years',
      location: 'Women\'s Health Center',
      availability: 'Today',
      languages: ['English', 'French'],
      education: 'Yale Medical School',
      fee: '$130',
      nextAvailable: '2024-02-19'
    }
  ];

  const specialties = [
    'Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics',
    'Neurology', 'Gynecology', 'Psychiatry', 'Oncology',
    'Endocrinology', 'Gastroenterology', 'Urology', 'Ophthalmology'
  ];

  const locations = [
    'Downtown', 'Westside', 'Northside', 'Eastside',
    'Main Hospital', 'Medical Center', 'Community Clinic'
  ];

  const availabilityOptions = [
    'Today', 'Tomorrow', 'This week', 'Next week'
  ];

  useEffect(() => {
    // Simulate loading doctors
    setIsLoading(true);
    const timer = setTimeout(() => {
      setDoctors(mockDoctors);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || doctor.specialty === selectedSpecialty;
    const matchesLocation = !selectedLocation || doctor.location.includes(selectedLocation);
    const matchesAvailability = !selectedAvailability || doctor.availability === selectedAvailability;

    return matchesSearch && matchesSpecialty && matchesLocation && matchesAvailability;
  });

  const clearFilters = () => {
    setSelectedSpecialty('');
    setSelectedLocation('');
    setSelectedAvailability('');
    setSearchTerm('');
  };

  const hasActiveFilters = selectedSpecialty || selectedLocation || selectedAvailability || searchTerm;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Doctor</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with qualified healthcare professionals who match your needs and preferences.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search doctors by name, specialty, or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Specialty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialty
                  </label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Specialties</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Locations</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* Availability Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    value={selectedAvailability}
                    onChange={(e) => setSelectedAvailability(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Any Time</option>
                    {availabilityOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="mt-4 text-center">
                  <button
                    onClick={clearFilters}
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredDoctors.length} Doctors Found
            </h2>
            {hasActiveFilters && (
              <p className="text-gray-600 mt-1">
                Filtered by: {selectedSpecialty && `Specialty: ${selectedSpecialty}`} 
                {selectedLocation && `, Location: ${selectedLocation}`}
                {selectedAvailability && `, Availability: ${selectedAvailability}`}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>Relevance</option>
              <option>Rating</option>
              <option>Availability</option>
              <option>Experience</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredDoctors.map((doctor, index) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-primary-600 font-medium">{doctor.specialty}</p>
                    </div>
                  </div>

                  {/* Rating and Reviews */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium text-gray-900">{doctor.rating}</span>
                    </div>
                    <span className="text-sm text-gray-600">({doctor.reviews} reviews)</span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Award className="w-4 h-4 mr-2" />
                      <span>{doctor.experience} experience</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{doctor.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Next available: {doctor.nextAvailable}</span>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="mb-4">
                    <span className="text-xs text-gray-500">Languages: </span>
                    <span className="text-xs text-gray-700">{doctor.languages.join(', ')}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">{doctor.fee}</span>
                    <Link
                      to={`/book-appointment/${doctor.id}`}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center"
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Book Now
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* No Results */}
        {!isLoading && filteredDoctors.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or filters to find more results.
            </p>
            <button
              onClick={clearFilters}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}

        {/* Load More */}
        {filteredDoctors.length > 0 && (
          <div className="text-center mt-12">
            <button className="border border-primary-600 text-primary-600 px-8 py-3 rounded-lg hover:bg-primary-600 hover:text-white transition-colors">
              Load More Doctors
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSearch;
