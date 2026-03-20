import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await fetch('http://localhost:5000/login', {
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
      const response = await fetch('http://localhost:5000/register', {
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
