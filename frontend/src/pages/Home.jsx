import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getShops } from '../lib/supabaseQueries';
import '../styles/index.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'customer') {
      loadShops();
    }
  }, [isAuthenticated, user]);

  const loadShops = async () => {
    try {
      const { data, error } = await getShops();
      if (error) throw error;
      setShops(data);
    } catch (error) {
      console.error('Failed to load shops:', error);
    }
  };

  const handleBookNow = (shop) => {
    navigate('/book', { state: { shop } });
  };

  const services = [
    { 
      name: 'Pant / Shirt (White)', 
      price: '₹100', 
      type: 'Wash', 
      icon: '👔',
      image: 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?w=400&h=300&fit=crop',
      description: 'Professional white clothes cleaning'
    },
    { 
      name: 'Saree', 
      price: '₹130-150', 
      type: 'Wash', 
      icon: '👘',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=300&fit=crop',
      description: 'Regular saree cleaning and pressing'
    },
    { 
      name: 'Full Designer Saree', 
      price: '₹350', 
      type: 'Special', 
      icon: '✨',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=300&fit=crop',
      description: 'Premium designer saree special care'
    },
    { 
      name: 'Rolling Saree', 
      price: '₹350', 
      type: 'Special', 
      icon: '✨',
      image: 'https://images.unsplash.com/photo-1583391726247-19b6f0b5a816?w=400&h=300&fit=crop',
      description: 'Special rolling saree treatment'
    },
    { 
      name: 'Suit / Blazer', 
      price: '₹400', 
      type: 'Dry Clean', 
      icon: '🤵',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c47e356?w=400&h=300&fit=crop',
      description: 'Professional dry cleaning for suits'
    },
    { 
      name: 'Dyeing', 
      price: '₹300', 
      type: 'Special', 
      icon: '🎨',
      image: 'https://images.unsplash.com/photo-1520423465876-1ad630a9b7f7?w=400&h=300&fit=crop',
      description: 'Professional cloth dyeing service'
    },
    { 
      name: 'Darning', 
      price: '₹450', 
      type: 'Repair', 
      icon: '🧵',
      image: 'https://images.unsplash.com/photo-1605218427306-635ba2439af2?w=400&h=300&fit=crop',
      description: 'Expert cloth repair and darning'
    },
    { 
      name: 'Steam Iron', 
      price: '₹50/piece', 
      type: 'Iron', 
      icon: '熨',
      image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=300&fit=crop',
      description: 'Professional steam ironing per cloth'
    },
    { 
      name: 'Wash and Iron', 
      price: '₹150', 
      type: 'Combo', 
      icon: '✨',
      image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb8f?w=400&h=300&fit=crop',
      description: 'Complete wash and ironing service'
    },
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero" style={{ 
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        color: 'white',
        padding: 'var(--space-12) var(--space-6)',
        borderRadius: 'var(--radius-xl)',
        textAlign: 'center',
        marginBottom: 'var(--space-8)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 'var(--space-2)', lineHeight: 1.2 }}>
          ✨ Shine Dry Clean
        </h1>
        <p style={{ fontSize: '1.125rem', marginBottom: 'var(--space-6)', opacity: 0.9, fontWeight: 500 }}>
          Fast • Reliable • Professional Dry Cleaning Service
        </p>
        <p style={{ fontSize: '1.125rem', marginBottom: 'var(--space-6)', opacity: 0.9, maxWidth: '600px', margin: '0 auto var(--space-6)' }}>
          Browse nearby shops, book services online, and track your orders in real-time!
        </p>
        <div className="flex gap-4" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <Link 
              to={user?.role === 'admin' ? '/admin' : '/customer'} 
              className="btn btn-secondary btn-large"
              style={{ background: 'white', color: 'var(--primary)' }}
            >
              {user?.role === 'admin' ? '🏪 Go to Dashboard' : '🛍️ Browse Shops'}
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-secondary btn-large" style={{ background: 'white', color: 'var(--primary)' }}>
                🚀 Get Started
              </Link>
              <Link to="/login" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid white' }}>
                🔐 Login
              </Link>
            </>
          )}
        </div>
        <div className="info-box" style={{
          background: 'rgba(255, 255, 255, 0.2)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-6)'
        }}>
          <span className="status-badge" style={{ background: '#f59e0b', color: 'white' }}>🎉 First Time Offer</span>
          <span style={{ fontWeight: 500 }}>Get 20% OFF on your first booking!</span>
        </div>
      </section>

      {/* Shop Selection for Customers */}
      {isAuthenticated && user?.role === 'customer' && shops.length > 0 && (
        <section className="mb-8">
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            🛍️ Available Shops
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', fontSize: '1.125rem' }}>
            Select a shop to book dry cleaning services
          </p>
          <div className="shops-grid">
            {shops.map(shop => (
              <div key={shop.id} className="shop-card">
                <div className="shop-card-header">
                  <div>
                    <h3 className="shop-card-title">{shop.shop_name}</h3>
                    <div className="shop-card-rating">⭐ 5.0</div>
                  </div>
                </div>
                <div className="shop-card-body">
                  <div className="shop-info">
                    <div className="shop-info-item">
                      <span className="shop-info-icon">📍</span>
                      <span>{shop.address}, {shop.city} - {shop.pincode}</span>
                    </div>
                    <div className="shop-info-item">
                      <span className="shop-info-icon">📏</span>
                      <span>{shop.service_radius_km} km service area</span>
                    </div>
                    <div className="shop-info-item">
                      <span className="shop-info-icon">📊</span>
                      <span>{shop.total_bookings || 0} bookings completed</span>
                    </div>
                  </div>

                  {shop.services && shop.services.length > 0 && (
                    <div className="shop-services">
                      <div className="shop-services-title">🧼 Services Available</div>
                      <div className="service-list">
                        {shop.services.slice(0, 5).map(service => (
                          <span key={service.id} className="service-tag">
                            {service.service_name}
                            <span className="service-tag-price">₹{service.base_price}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    className="btn btn-primary btn-block btn-large mt-6"
                    onClick={() => handleBookNow(shop)}
                  >
                    📝 Book Service
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="mb-8">
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-8)' }}>
          How Shine Dry Clean Works
        </h2>
        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
          {[
            { icon: '🔍', title: 'Browse Shops', desc: 'Find nearby dry cleaning shops' },
            { icon: '📝', title: 'Book Service', desc: 'Select service and schedule pickup' },
            { icon: '🧼', title: 'We Clean', desc: 'Professional cleaning with care' },
            { icon: '🚚', title: 'Get Delivery', desc: 'Clean clothes at your doorstep' },
          ].map((step, index) => (
            <div key={index} className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>{step.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>{step.title}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section with Images */}
      <section className="mb-8">
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
          Our Services & Pricing
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', fontSize: '1.125rem' }}>
          Professional care for all your garments
        </p>
        
        <div className="services-grid-images" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 'var(--space-6)' 
        }}>
          {services.map((service, index) => (
            <div 
              key={index} 
              className="service-card-image"
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow)',
                border: '1px solid var(--border-light)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow)';
              }}
            >
              {/* Service Image */}
              <div style={{
                height: '200px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <img 
                  src={service.image} 
                  alt={service.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                  onError={(e) => {
                    e.target.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="#e2e8f0" width="400" height="300"/><text x="200" y="150" text-anchor="middle" fill="#64748b" font-size="48">' + service.icon + '</text></svg>')}`;
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: 'var(--space-3)',
                  right: 'var(--space-3)',
                  background: 'var(--primary)',
                  color: 'white',
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {service.type}
                </div>
              </div>

              {/* Service Details */}
              <div style={{ padding: 'var(--space-5)' }}>
                <h3 style={{ 
                  fontWeight: 700, 
                  marginBottom: 'var(--space-2)', 
                  fontSize: '1.125rem',
                  color: 'var(--text-primary)'
                }}>
                  {service.name}
                </h3>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.875rem', 
                  marginBottom: 'var(--space-3)',
                  lineHeight: '1.5'
                }}>
                  {service.description}
                </p>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingTop: 'var(--space-3)',
                  borderTop: '1px solid var(--border-light)'
                }}>
                  <span style={{ 
                    color: 'var(--primary)', 
                    fontWeight: 800, 
                    fontSize: '1.5rem' 
                  }}>
                    {service.price}
                  </span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--text-muted)' 
                  }}>
                    per {service.price_per_unit || 'piece'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-8">
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-8)' }}>
          Why Choose Shine Dry Clean?
        </h2>
        <div className="stats-grid">
          {[
            { icon: '🏪', title: 'Multiple Shops', desc: 'Compare and choose from registered shops' },
            { icon: '📱', title: 'Easy Booking', desc: 'Book services online in minutes' },
            { icon: '📊', title: 'Real-time Tracking', desc: 'Track your order status at every step' },
            { icon: '💰', title: 'Transparent Pricing', desc: 'No hidden charges, clear price list' },
            { icon: '🎁', title: 'First-time Discount', desc: '20% off on your first booking' },
            { icon: '🔒', title: 'Secure Payments', desc: 'Safe and secure transaction process' },
          ].map((feature, index) => (
            <div key={index} className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-icon" style={{ margin: '0 auto var(--space-4)', fontSize: '2rem' }}>{feature.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)', fontSize: '1rem' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="card" style={{ 
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        textAlign: 'center',
        padding: 'var(--space-10) var(--space-6)',
        marginBottom: 'var(--space-8)'
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
          Ready to Experience Hassle-Free Dry Cleaning?
        </h2>
        <p style={{ fontSize: '1.125rem', marginBottom: 'var(--space-6)', opacity: 0.9 }}>
          Join hundreds of satisfied customers today!
        </p>
        {!isAuthenticated && (
          <div className="flex gap-4" style={{ justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-secondary btn-large" style={{ background: 'white', color: '#059669' }}>
              Create Account
            </Link>
            <Link to="/login" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid white' }}>
              Sign In
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
