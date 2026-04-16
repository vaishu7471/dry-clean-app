import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/index.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dry-clean-app.onrender.com';

const Login = () => {
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await authLogin(formData);

      if (!result.success) {
        setError(result.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Role check with fallback
      const userRole = result.user?.role || 'customer';
      if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/customer', { replace: true });
      }
    } catch (err) {
      setError('Cannot connect to server. Please ensure backend is running.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">✨</div>
            <h1 className="auth-title">Shine Dry Clean</h1>
            <p className="auth-subtitle">Fast • Reliable • Professional Dry Cleaning Service</p>
            <p className="auth-subtitle" style={{ marginTop: 'var(--space-2)' }}>Login to access your account</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-large" disabled={loading}>
              {loading ? '⏳ Logging in...' : '🔐 Login'}
            </button>
          </form>

          <div className="auth-footer-section mt-6">
            <p className="auth-footer">
              Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
