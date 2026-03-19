import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/index.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);
    
    if (result.success) {
      navigate(result.user.role === 'admin' ? '/admin' : '/customer');
    } else {
      setError(result.error);
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
            <div className="info-box" style={{ background: 'var(--bg-tertiary)', padding: 'var(--space-4)', borderRadius: 'var(--radius)', marginTop: 'var(--space-4)' }}>
              <p style={{ fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>📋 Demo Credentials:</p>
              <p style={{ fontSize: '0.875rem', marginBottom: 'var(--space-1)' }}>Admin: admin@shinedryclean.com / admin123</p>
              <p style={{ fontSize: '0.875rem' }}>Customer: customer@shinedryclean.com / customer123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
