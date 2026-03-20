import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/index.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);

  useEffect(() => {
    loadShops();
  }, [isAuthenticated, user]);

  const loadShops = async () => {
    try {
      const response = await fetch('http://localhost:5000/shops');
      const data = await response.json();

      if (response.ok && data.shops) {
        setShops(data.shops);
      }
    } catch (error) {
      console.error('Failed to load shops:', error);
    }
  };

  const handleBookNow = (shop) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'customer') {
      navigate('/login');
      return;
    }
    navigate('/book', { state: { shop } });
  };

  const services = [
    {
      name: 'Shirt/Pant',
      price: '₹100',
      type: 'Wash',
      icon: '👔',
      description: 'Professional washing and folding'
    },
    {
      name: 'Saree',
      price: '₹150',
      type: 'Wash',
      icon: '👘',
      description: 'Gentle care for your sarees'
    },
    {
      name: 'Suit/Blazer',
      price: '₹400',
      type: 'Dry Clean',
      icon: '🤵',
      description: 'Premium dry cleaning service'
    },
    {
      name: 'Steam Iron',
      price: '₹50',
      type: 'Iron',
      icon: '熨',
      description: 'Wrinkle-free steam ironing'
    },
    {
      name: 'Bed Sheet',
      price: '₹80',
      type: 'Wash',
      icon: '🛏️',
      description: 'Clean and fresh bed linens'
    },
    {
      name: 'Curtain',
      price: '₹200',
      type: 'Wash',
      icon: '🪟',
      description: 'Deep cleaning for curtains'
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
          ✨ Sri Sai Electrical Dry Clean
        </h1>
        <p style={{ fontSize: '1.125rem', marginBottom: 'var(--space-6)', opacity: 0.9, fontWeight: 500 }}>
          Fast • Reliable • Professional Dry Cleaning Service
        </p>
        <p style={{ fontSize: '1.125rem', marginBottom: 'var(--space-6)', opacity: 0.9, maxWidth: '600px', margin: '0 auto var(--space-6)' }}>
          Quality dry cleaning at your doorstep in Manikonda, Hyderabad
        </p>
        <div className="flex gap-4" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          {isAuthenticated && user?.role === 'customer' ? (
            <button
              onClick={() => navigate('/book')}
              className="btn btn-secondary btn-large"
              style={{ background: 'white', color: 'var(--primary)' }}
            >
              📝 Book Now
            </button>
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
      </section>

      {/* Shop Card */}
      {shops.length > 0 && (
        <section className="mb-8">
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            🏪 Our Shop
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', fontSize: '1.125rem' }}>
            Quality dry cleaning services you can trust
          </p>
          
          <div className="shop-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="shop-card-header">
              <div>
                <h3 className="shop-card-title">{shops[0].shop_name}</h3>
                <div className="shop-card-rating">⭐ {shops[0].rating} Rating</div>
              </div>
            </div>
            <div className="shop-card-body">
              <div className="shop-info">
                <div className="shop-info-item">
                  <span className="shop-info-icon">📍</span>
                  <span>{shops[0].address}</span>
                </div>
                <div className="shop-info-item">
                  <span className="shop-info-icon">📞</span>
                  <span>{shops[0].phone}</span>
                </div>
                <div className="shop-info-item">
                  <span className="shop-info-icon">📏</span>
                  <span>{shops[0].service_radius_km} km service area</span>
                </div>
              </div>

              <div className="shop-services">
                <div className="shop-services-title">🧼 Our Services</div>
                <div className="service-list">
                  {shops[0].services.map(service => (
                    <span key={service.id} className="service-tag">
                      {service.service_name}
                      <span className="service-tag-price">₹{service.base_price}</span>
                    </span>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-primary btn-block btn-large mt-6"
                onClick={() => handleBookNow(shops[0])}
              >
                📝 Book Service
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="mb-8">
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
          Our Services & Pricing
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', fontSize: '1.125rem' }}>
          Affordable prices for quality service
        </p>

        <div className="services-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--space-6)'
        }}>
          {services.map((service, index) => (
            <div
              key={index}
              className="card"
              style={{
                textAlign: 'center',
                padding: 'var(--space-6)',
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>{service.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>{service.name}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>{service.description}</p>
              <div style={{
                display: 'inline-block',
                background: 'var(--bg-secondary)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius)',
                fontWeight: 700,
                color: 'var(--primary)',
                fontSize: '1.25rem'
              }}>
                {service.price}
              </div>
              <div style={{
                display: 'inline-block',
                marginLeft: 'var(--space-2)',
                background: 'var(--primary)',
                color: 'white',
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius)',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                {service.type}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-8">
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-8)' }}>
          How It Works
        </h2>
        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
          {[
            { icon: '📝', title: 'Book Service', desc: 'Select your service and schedule pickup' },
            { icon: '🚚', title: 'We Pickup', desc: 'Free pickup from your doorstep' },
            { icon: '🧼', title: 'We Clean', desc: 'Professional cleaning with care' },
            { icon: '📦', title: 'Get Delivery', desc: 'Clean clothes delivered back' },
          ].map((step, index) => (
            <div key={index} className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>{step.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>{step.title}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-8">
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-8)' }}>
          Why Choose Us?
        </h2>
        <div className="stats-grid">
          {[
            { icon: '⚡', title: 'Fast Service', desc: '3-day delivery guarantee' },
            { icon: '💎', title: 'Quality Care', desc: 'Professional cleaning process' },
            { icon: '💰', title: 'Best Prices', desc: 'Affordable and transparent' },
            { icon: '🔒', title: 'Secure', desc: 'Safe handling of your clothes' },
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
          Ready to Try Our Service?
        </h2>
        <p style={{ fontSize: '1.125rem', marginBottom: 'var(--space-6)', opacity: 0.9 }}>
          Book your first dry cleaning service today!
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
