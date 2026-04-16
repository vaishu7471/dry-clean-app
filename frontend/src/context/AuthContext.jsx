import React, { createContext, useState, useContext, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'API_BASE_URL';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize from localStorage immediately to prevent flicker
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error('Error parsing stored user:', e);
      localStorage.removeItem('user');
      return null;
    }
  });
  const [loading, setLoading] = useState(false); // Set to false since we load synchronously

  // Login function
  const login = async (credentials) => {
    try {
      const response = await fetch('API_BASE_URL/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Login failed',
        };
      }

      if (data.success) {
        // Store user in state and localStorage
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return {
          success: true,
          user: data.user,
        };
      }

      return {
        success: false,
        error: data.error || 'Login failed',
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Cannot connect to server. Please ensure backend is running.',
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await fetch('API_BASE_URL/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Registration failed',
        };
      }

      if (data.success) {
        // Store user in state and localStorage
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return {
          success: true,
          user: data.user,
        };
      }

      return {
        success: false,
        error: data.error || 'Registration failed',
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Cannot connect to server. Please ensure backend is running.',
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isCustomer: user?.role === 'customer',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
