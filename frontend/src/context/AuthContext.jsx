import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { signIn, signOut, signUp, getCurrentUser, getUserProfile } from '../lib/supabaseAuth';

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

  useEffect(() => {
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { user } = await getCurrentUser();
      if (user) {
        await loadUserProfile(user.id);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Check user error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      const { data: profile } = await getUserProfile(userId);
      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          role: profile.role,
          address: profile.address,
          city: profile.city,
          pincode: profile.pincode
        });
      }
    } catch (error) {
      console.error('Load profile error:', error);
    }
  };

  const login = async (credentials) => {
    try {
      const { data, error } = await signIn(credentials.email, credentials.password);
      
      if (error) throw error;

      // Load user profile
      await loadUserProfile(data.user.id);

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  const register = async (data, isAdmin = false) => {
    try {
      const { data: authData, error } = await signUp(
        data.email,
        data.password,
        data.name,
        data.phone,
        isAdmin ? 'admin' : 'customer'
      );

      if (error) throw error;

      // Load user profile
      if (authData.user) {
        await loadUserProfile(authData.user.id);
      }

      return { success: true, user };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
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
