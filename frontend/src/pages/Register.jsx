import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/index.css';

const Register = () => {
  const [accountType, setAccountType] = useState('customer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    pincode: '',
    shop_name: 'Sri Sai Electrical Dry Cleaning Shop',
    shop_phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const registerData = {
      name: formData.name,
      email: formData.email,
      phone: accountType === 'admin' ? formData.shop_phone : formData.phone,
      password: formData.password,
      address: formData.address,
      city: formData.city,
      pincode: formData.pincode,
    };

    if (accountType === 'admin') {
      registerData.shop_name = formData.shop_name;
      registerData.shop_phone = formData.shop_phone;
    }

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Registered successfully');
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => {
          navigate(accountType === 'admin' ? '/admin' : '/customer');
        }, 1500);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Cannot connect to server. Please ensure backend is running.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card auth-card-large">
          <div className="auth-header">
            <div className="auth-logo">🧼</div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join us for the best dry cleaning experience</p>
          </div>

          {/* Account Type Toggle */}
          <div className="account-type-toggle">
            <button
              className={accountType === 'customer' ? 'active' : ''}
              onClick={() => setAccountType('customer')}
              type="button"
            >
              👤 Customer
            </button>
            <button
              className={accountType === 'admin' ? 'active' : ''}
              onClick={() => setAccountType('admin')}
              type="button"
            >
              🏪 Shop Owner
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-section-title">👤 Personal Information</div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10-digit phone number"
                  pattern="[0-9]{10}"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="6-digit pincode"
                  pattern="[0-9]{6}"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address *</label>
              <textarea
                className="form-textarea"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your address"
                rows="2"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter your city"
              />
            </div>

            <div className="form-section-title">🔒 Security</div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 characters"
                  required
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>

            {/* Shop Details (for Admin) */}
            {accountType === 'admin' && (
              <>
                <div className="form-section-title">🏪 Shop Details</div>

                <div className="form-group">
                  <label className="form-label">Shop Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.shop_name}
                    onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                    required={accountType === 'admin'}
                  />
                  <span className="form-hint">Default: Sri Sai Electrical Dry Cleaning Shop</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Shop Phone *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.shop_phone}
                    onChange={(e) => setFormData({ ...formData, shop_phone: e.target.value })}
                    placeholder="10-digit shop phone number"
                    pattern="[0-9]{10}"
                    required={accountType === 'admin'}
                  />
                </div>

                <div className="info-box" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', padding: 'var(--space-4)', borderRadius: 'var(--radius)', border: '1px solid var(--primary)' }}>
                  <p style={{ fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--primary)' }}>📋 As a shop owner, you will:</p>
                  <ul style={{ paddingLeft: 'var(--space-5)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <li>Manage your dry cleaning shop</li>
                    <li>View and update customer bookings</li>
                    <li>Set service prices</li>
                    <li>Track order status</li>
                  </ul>
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-block btn-large" disabled={loading}>
              {loading ? '⏳ Creating account...' : `🚀 Create ${accountType === 'admin' ? 'Shop' : 'Account'}`}
            </button>
          </form>

          <p className="auth-footer mt-6 text-center">
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
