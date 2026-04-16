import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (data) => api.post('/register', data),
  getMe: () => api.get('/users'),
};

// Shop APIs
export const shopAPI = {
  getAll: () => api.get('/shops'),
  getById: (id) => api.get(`/shops/${id}`),
  getServices: (shopId) => api.get(`/shops/${shopId}`),
};

// Booking APIs
export const bookingAPI = {
  create: (data) => api.post('/book', data),
  getMyBookings: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.delete(`/booking/${id}`),
  approve: (id) => api.put(`/booking/${id}/approve`),
  getAll: () => api.get('/admin/bookings'),
  updateStatus: (id, status) => api.put(`/booking/${id}/status`, { status }),
};

export default api;
