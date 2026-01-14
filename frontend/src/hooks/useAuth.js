// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if token exists on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    console.log('useAuth: Checking for existing token...', token ? 'Found' : 'Not found');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const login = useCallback(async (password) => {
    setError(null);
    try {
      console.log('useAuth: Attempting login...');
      const response = await authAPI.login(password);
      console.log('useAuth: Login response:', response.data);
      
      const token = response.data.access_token;
      if (token) {
        console.log('useAuth: Token received, storing in localStorage...');
        localStorage.setItem('admin_token', token);
        setIsAuthenticated(true);
        return true;
      } else {
        console.error('useAuth: No token in response');
        setError('No token received');
        return false;
      }
    } catch (err) {
      console.error('useAuth: Login error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Login failed';
      setError(errorMessage);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    console.log('useAuth: Logging out...');
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setError(null);
  }, []);

  return { 
    isAuthenticated, 
    loading, 
    error,
    login, 
    logout 
  };
};