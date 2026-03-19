import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/index.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="nav-logo-icon">✨</span>
          <div className="nav-logo-text">
            <span className="nav-logo-main">Shine Dry Clean</span>
            <span className="nav-logo-sub">Fast • Reliable • Professional</span>
          </div>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>

          {isAuthenticated ? (
            <>
              {user.role === 'admin' ? (
                <>
                  <Link to="/admin" className="nav-link">Dashboard</Link>
                </>
              ) : (
                <>
                  {/* Book Services removed from nav - accessible from Home page */}
                </>
              )}

              <div className="nav-user">
                <div className="nav-avatar">{getInitials(user?.name)}</div>
                <span>{user?.name}</span>
              </div>

              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-secondary" style={{ background: 'white', color: 'var(--primary)' }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
