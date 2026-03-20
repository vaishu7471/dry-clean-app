import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import BookingPage from './pages/BookingPage';
import './styles/index.css';

// Helper to get user from localStorage
const getUser = () => JSON.parse(localStorage.getItem('user'));

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/login" />;
  }

  return children;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes - Direct localStorage check */}
            <Route
              path="/admin"
              element={
                getUser()?.role === 'admin' ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Customer Routes */}
            <Route path="/customer" element={
              <ProtectedRoute role="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            } />

            <Route path="/book" element={
              <ProtectedRoute role="customer">
                <BookingPage />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <footer className="footer">
          <p>&copy; 2026 DryClean. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
