import axios from 'axios';

// Force HTTPS - Railway requires it
const API_URL = 'https://my-portfolio-v2-production-5027.up.railway.app';

console.log('🚀 API_URL:', API_URL);

// Create axios instance with explicit HTTPS
const apiConfig = {
  baseURL: API_URL,
  timeout: 30000,  // Increased from 10s to 30s for slower connections
  headers: {
    'Content-Type': 'application/json',
  },
};

console.log('📡 Axios Config:', apiConfig);

export const api = axios.create(apiConfig);

// Log every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('📤 Making request to:', config.baseURL + config.url);
  return config;
}, (error) => {
  console.error('❌ Request error:', error);
  return Promise.reject(error);
});

// Handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin-secret-panel';
    }
    return Promise.reject(error);
  }
);

// ============== Authentication API ==============
export const authAPI = {
  login: (password) => 
    api.post('/api/auth/login/', { password }),
};

// ============== Blogs API ==============
export const blogsAPI = {
  getAll: () => 
    api.get('/api/blogs/'),

  getOne: (id) => 
    api.get(`/api/blogs/${id}/`),

  create: (data) => 
    api.post('/api/blogs/', data),

  update: (id, data) => 
    api.put(`/api/blogs/${id}/`, data),

  delete: (id) => 
    api.delete(`/api/blogs/${id}/`),
};

// ============== Projects API ==============
export const projectsAPI = {
  getAll: () => 
    api.get('/api/projects/'),

  getOne: (id) => 
    api.get(`/api/projects/${id}/`),

  create: (data) => 
    api.post('/api/projects/', data),

  update: (id, data) => 
    api.put(`/api/projects/${id}/`, data),

  delete: (id) => 
    api.delete(`/api/projects/${id}/`),
};

// ============== About API ==============
export const aboutAPI = {
  getAll: () => 
    api.get('/api/about/'),

  getOne: (id) => 
    api.get(`/api/about/${id}/`),

  create: (data) => 
    api.post('/api/about/', data),

  update: (id, data) => 
    api.put(`/api/about/${id}/`, data),
};

// ============== Contact API ==============
export const contactAPI = {
  getAll: () => 
    api.get('/api/contact/'),

  submit: (data) => 
    api.post('/api/contact/', data),

  delete: (id) => 
    api.delete(`/api/contact/${id}/`),
};

// ============== Error Handling Utility ==============
export const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    if (status === 401) {
      return 'Authentication failed. Please log in again.';
    } else if (status === 404) {
      return 'The requested resource was not found.';
    } else if (status === 500) {
      return 'Server error. Please try again later.';
    } else if (data?.detail) {
      return data.detail;
    }
    return 'An error occurred. Please try again.';
  } else if (error.request) {
    return 'No response from server. Please check your connection.';
  } else {
    return error.message || 'An error occurred.';
  }
};

export default api;