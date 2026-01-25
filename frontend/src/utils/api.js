import axios from 'axios';

// Hardcode HTTPS for production
const API_URL = 'https://my-portfolio-v2-production-5027.up.railway.app';

console.log('API_URL being used:', API_URL);

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear it
      localStorage.removeItem('admin_token');
      window.location.href = '/admin-secret-panel';
    }
    return Promise.reject(error);
  }
);

// ============== Authentication API ==============
export const authAPI = {
  login: (password) => 
    api.post('/api/auth/login', { password }),
};

// ============== Blogs API ==============
export const blogsAPI = {
  /**
   * Get all blog posts
   * @returns {Promise} Array of blog posts
   */
  getAll: () => 
    api.get('/api/blogs'),

  /**
   * Get a single blog post by ID
   * @param {string} id - Blog post ID
   * @returns {Promise} Single blog post
   */
  getOne: (id) => 
    api.get(`/api/blogs/${id}`),

  /**
   * Create a new blog post (requires authentication)
   * @param {Object} data - Blog data
   * @param {string} data.title - Blog title
   * @param {string} data.excerpt - Short description
   * @param {string} data.content - Full content
   * @returns {Promise} Created blog post
   */
  create: (data) => 
    api.post('/api/blogs', data),

  /**
   * Update an existing blog post (requires authentication)
   * @param {string} id - Blog post ID
   * @param {Object} data - Updated blog data
   * @returns {Promise} Update response
   */
  update: (id, data) => 
    api.put(`/api/blogs/${id}`, data),

  /**
   * Delete a blog post (requires authentication)
   * @param {string} id - Blog post ID
   * @returns {Promise} Delete response
   */
  delete: (id) => 
    api.delete(`/api/blogs/${id}`),
};

// ============== Projects API ==============
export const projectsAPI = {
  /**
   * Get all projects
   * @returns {Promise} Array of projects
   */
  getAll: () => 
    api.get('/api/projects'),

  /**
   * Get a single project by ID
   * @param {string} id - Project ID
   * @returns {Promise} Single project
   */
  getOne: (id) => 
    api.get(`/api/projects/${id}`),

  /**
   * Create a new project (requires authentication)
   * @param {Object} data - Project data
   * @param {string} data.title - Project title
   * @param {string} data.description - Project description
   * @param {string} data.image_url - Project image URL
   * @param {string} data.github_link - GitHub repository link
   * @returns {Promise} Created project
   */
  create: (data) => 
    api.post('/api/projects', data),

  /**
   * Update an existing project (requires authentication)
   * @param {string} id - Project ID
   * @param {Object} data - Updated project data
   * @returns {Promise} Update response
   */
  update: (id, data) => 
    api.put(`/api/projects/${id}`, data),

  /**
   * Delete a project (requires authentication)
   * @param {string} id - Project ID
   * @returns {Promise} Delete response
   */
  delete: (id) => 
    api.delete(`/api/projects/${id}`),
};

// ============== About API ==============
export const aboutAPI = {
  /**
   * Get about section(s)
   * @returns {Promise} Array with about section data
   */
  getAll: () => 
    api.get('/api/about'),

  /**
   * Get a single about section by ID
   * @param {string} id - About section ID
   * @returns {Promise} About section data
   */
  getOne: (id) => 
    api.get(`/api/about/${id}`),

  /**
   * Create about section (requires authentication)
   * @param {Object} data - About data
   * @param {string} data.bio - Biography text
   * @param {Array<string>} data.skills - List of skills
   * @param {Array<string>} data.hobbies - List of hobbies
   * @returns {Promise} Created about section
   */
  create: (data) => 
    api.post('/api/about', data),

  /**
   * Update about section (requires authentication)
   * @param {string} id - About section ID
   * @param {Object} data - Updated about data
   * @returns {Promise} Update response
   */
  update: (id, data) => 
    api.put(`/api/about/${id}`, data),
};

// ============== Contact API ==============
export const contactAPI = {
  /**
   * Get all contact submissions (requires authentication)
   * @returns {Promise} Array of contact submissions
   */
  getAll: () => 
    api.get('/api/contact'),

  /**
   * Submit a contact form (public - no authentication required)
   * @param {Object} data - Contact form data
   * @param {string} data.name - Sender's name
   * @param {string} data.email - Sender's email
   * @param {string} data.message - Message content
   * @returns {Promise} Submission confirmation
   */
  submit: (data) => 
    api.post('/api/contact', data),

  /**
   * Delete a contact submission (requires authentication)
   * @param {string} id - Contact submission ID
   * @returns {Promise} Delete response
   */
  delete: (id) => 
    api.delete(`/api/contact/${id}`),
};

// ============== Error Handling Utility ==============
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
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
    // Request made but no response received
    return 'No response from server. Please check your connection.';
  } else {
    // Error in request setup
    return error.message || 'An error occurred.';
  }
};

export default api;