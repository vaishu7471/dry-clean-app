import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/index.css';

const Login = () => {
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
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // ✅ SAVE USER PROPERLY
      localStorage.setItem('user', JSON.stringify(data.user));

      // ✅ DEBUG
      console.log('Logged in user:', data.user);

      // ✅ ROLE CHECK
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/customer');
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
            <div className="info-box" style={{ background: 'var(--bg-tertiary)', padding: 'var(--space-4)', borderRadius: 'var(--radius)', marginTop: 'var(--space-4)' }}>
              <p style={{ fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>📋 Demo Credentials:</p>
              <p style={{ fontSize: '0.875rem', marginBottom: 'var(--space-1)' }}>Admin: admin@gmail.com / admin123</p>
              <p style={{ fontSize: '0.875rem' }}>Customer: user@gmail.com / user123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
