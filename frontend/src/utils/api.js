import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', data.message);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', data.message);
          break;
        case 422:
          // Validation error
          console.error('Validation error:', data.message);
          break;
        case 429:
          // Rate limited
          console.error('Rate limited:', data.message);
          break;
        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;
        default:
          console.error('API error:', data.message);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error: No response received');
    } else {
      // Something else happened
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getMe: () => api.get('/api/auth/me'),
  changePassword: (passwords) => api.put('/api/auth/change-password', passwords),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/api/auth/reset-password', { token, password }),
  logout: () => api.post('/api/auth/logout'),
};

export const userAPI = {
  updateProfile: (userId, userData) => api.put(`/api/users/${userId}`, userData),
  uploadProfilePicture: (userId, formData) => api.put(`/api/users/${userId}/profile-picture`, formData),
  getProfile: (userId) => api.get(`/api/users/${userId}`),
};

export const doctorAPI = {
  getAll: (params) => api.get('/api/doctors', { params }),
  getById: (id) => api.get(`/api/doctors/${id}`),
  updateProfile: (id, data) => api.put(`/api/doctors/${id}`, data),
  getAppointments: (id, params) => api.get(`/api/doctors/${id}/appointments`, { params }),
  getAvailability: (id, params) => api.get(`/api/doctors/${id}/availability`, { params }),
  updateAvailability: (id, availability) => api.put(`/api/doctors/${id}/availability`, { availability }),
  getStats: (id) => api.get(`/api/doctors/${id}/stats`),
};

export const appointmentAPI = {
  create: (appointmentData) => api.post('/api/appointments', appointmentData),
  getPatientAppointments: (params) => api.get('/api/appointments/patient', { params }),
  getById: (id) => api.get(`/api/appointments/${id}`),
  updateStatus: (id, statusData) => api.put(`/api/appointments/${id}/status`, statusData),
  cancel: (id, reason) => api.put(`/api/appointments/${id}/cancel`, { cancellationReason: reason }),
  reschedule: (id, rescheduleData) => api.put(`/api/appointments/${id}/reschedule`, rescheduleData),
  getCalendar: (doctorId, params) => api.get(`/api/appointments/calendar/${doctorId}`, { params }),
};

export const paymentAPI = {
  createPaymentIntent: (appointmentId) => api.post(`/api/payments/${appointmentId}/create-intent`),
  confirmPayment: (appointmentId, paymentData) => api.post(`/api/payments/${appointmentId}/confirm`, paymentData),
  getPaymentHistory: (params) => api.get('/api/payments/history', { params }),
  getPaymentById: (id) => api.get(`/api/payments/${id}`),
  requestRefund: (id, reason) => api.post(`/api/payments/${id}/refund`, { reason }),
};

export const reviewAPI = {
  create: (reviewData) => api.post('/api/reviews', reviewData),
  getByDoctor: (doctorId, params) => api.get(`/api/reviews/doctor/${doctorId}`, { params }),
  update: (id, reviewData) => api.put(`/api/reviews/${id}`, reviewData),
  delete: (id) => api.delete(`/api/reviews/${id}`),
  getMyReviews: (params) => api.get('/api/reviews/my-reviews', { params }),
};

export const blogAPI = {
  getAll: (params) => api.get('/api/blog', { params }),
  getBySlug: (slug) => api.get(`/api/blog/${slug}`),
  getByCategory: (category, params) => api.get(`/api/blog/category/${category}`, { params }),
  search: (query, params) => api.get('/api/blog/search', { params: { query, ...params } }),
  getPopular: () => api.get('/api/blog/popular'),
  create: (blogData) => api.post('/api/blog', blogData),
  update: (id, blogData) => api.put(`/api/blog/${id}`, blogData),
  delete: (id) => api.delete(`/api/blog/${id}`),
};

export const adminAPI = {
  getDashboardStats: () => api.get('/api/admin/dashboard'),
  getAllUsers: (params) => api.get('/api/admin/users', { params }),
  updateUserStatus: (userId, status) => api.put(`/api/admin/users/${userId}/status`, { status }),
  getAllAppointments: (params) => api.get('/api/admin/appointments', { params }),
  getAllPayments: (params) => api.get('/api/admin/payments', { params }),
  getRevenueStats: (params) => api.get('/api/admin/revenue', { params }),
};

// File upload helper
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

// Export the main api instance
export default api;
