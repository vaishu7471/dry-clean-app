import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/index.css';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShops();
    loadBookings();
  }, []);

  const loadShops = async () => {
    try {
      const response = await fetch('http://localhost:5000/shops');
      const data = await response.json();

      if (response.ok && data.shops) {
        setShops(data.shops);
      }
    } catch (error) {
      console.error('Failed to load shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const response = await fetch('http://localhost:5000/bookings', {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });

      const data = await response.json();

      if (response.ok && data.bookings) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  };

  const handleBookNow = (shop) => {
    navigate('/book', { state: { shop } });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'pending',
      'Accepted': 'accepted',
      'Washing': 'washing',
      'Ironing': 'ironing',
      'Ready': 'ready',
      'Out for delivery': 'out-for-delivery',
      'Delivered': 'delivered',
      'Completed': 'completed',
      'Cancelled': 'cancelled'
    };
    return colors[status] || 'pending';
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="customer-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <h1>👤 Customer Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>
      </div>

      {/* Available Shops */}
      <section className="mb-8">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
          🏪 Available Shops
        </h2>
        
        {shops.length > 0 ? (
          <div className="shops-grid">
            {shops.map(shop => (
              <div key={shop.id} className="shop-card">
                <div className="shop-card-header">
                  <div>
                    <h3 className="shop-card-title">{shop.shop_name}</h3>
                    <div className="shop-card-rating">⭐ {shop.rating} Rating</div>
                  </div>
                </div>
                <div className="shop-card-body">
                  <div className="shop-info">
                    <div className="shop-info-item">
                      <span className="shop-info-icon">📍</span>
                      <span>{shop.address}</span>
                    </div>
                    <div className="shop-info-item">
                      <span className="shop-info-icon">📞</span>
                      <span>{shop.phone}</span>
                    </div>
                    <div className="shop-info-item">
                      <span className="shop-info-icon">📏</span>
                      <span>{shop.service_radius_km} km service area</span>
                    </div>
                  </div>

                  <div className="shop-services">
                    <div className="shop-services-title">🧼 Services Available</div>
                    <div className="service-list">
                      {shop.services.slice(0, 4).map(service => (
                        <span key={service.id} className="service-tag">
                          {service.service_name}
                          <span className="service-tag-price">₹{service.base_price}</span>
                        </span>
                      ))}
                    </div>
                  </div>

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
        ) : (
          <div className="text-center" style={{ padding: 'var(--space-12)', color: 'var(--text-secondary)' }}>
            <p>No shops available</p>
          </div>
        )}
      </section>

      {/* My Bookings */}
      <section className="mb-8">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
          📦 My Bookings
        </h2>

        <div className="card">
          <div className="card-body">
            {bookings.length === 0 ? (
              <div className="text-center" style={{ padding: 'var(--space-12)', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: '1.125rem' }}>No bookings yet</p>
                <p>Book your first dry cleaning service above!</p>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map(booking => (
                  <div key={booking.id} className="card mb-6" style={{ background: 'var(--bg-secondary)', marginBottom: 'var(--space-4)' }}>
                    <div className="card-body">
                      <div className="info-header" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h3 style={{ marginBottom: 'var(--space-1)' }}>{booking.shop_name}</h3>
                            <p className="table-cell-secondary">Order #{booking.booking_number}</p>
                          </div>
                          <span className={`status-badge status-${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>

                      <div className="info-grid mb-6">
                        <div className="info-item">
                          <div className="info-item-label">Service</div>
                          <div className="info-item-value">{booking.service_name}</div>
                        </div>
                        <div className="info-item">
                          <div className="info-item-label">Cloth Type</div>
                          <div className="info-item-value">{booking.cloth_type}</div>
                        </div>
                        <div className="info-item">
                          <div className="info-item-label">Quantity</div>
                          <div className="info-item-value">{booking.quantity} piece(s)</div>
                        </div>
                        <div className="info-item">
                          <div className="info-item-label">Pickup Date</div>
                          <div className="info-item-value">{new Date(booking.pickup_date).toLocaleDateString()}</div>
                        </div>
                        <div className="info-item">
                          <div className="info-item-label">Total Amount</div>
                          <div className="info-item-value" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>₹{booking.final_amount}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomerDashboard;
