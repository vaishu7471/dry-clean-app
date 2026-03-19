import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopAPI, bookingAPI } from '../services/api';
import '../styles/index.css';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('shops');
  const [shops, setShops] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [shopsRes, bookingsRes] = await Promise.all([
        shopAPI.getAll(),
        bookingAPI.getMyBookings()
      ]);

      setShops(shopsRes.data);
      setMyBookings(bookingsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
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

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingAPI.cancel(bookingId);
      alert('Booking cancelled successfully!');
      loadDashboardData();
    } catch (error) {
      alert('Failed to cancel booking');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="customer-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>🛍️ Browse Shops</h1>
          <p>Find the best dry cleaning services near you</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'shops' ? 'active' : ''}`} onClick={() => setActiveTab('shops')}>
          🏪 Available Shops
        </button>
        <button className={`tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
          📦 My Orders
        </button>
      </div>

      {/* Shops Tab */}
      {activeTab === 'shops' && (
        <div className="tab-content">
          <h2 style={{ marginBottom: 'var(--space-4)', fontSize: '1.25rem' }}>Sri Sai Electrical Dry Clean</h2>
          {shops.length === 0 ? (
            <div className="text-center" style={{ padding: 'var(--space-12)', color: 'var(--text-secondary)' }}>
              <p>No shops available at the moment</p>
            </div>
          ) : (
            <div className="shops-grid">
              {shops.map(shop => (
                <div key={shop.id} className="shop-card">
                  <div className="shop-card-header">
                    <div>
                      <h3 className="shop-card-title">{shop.shop_name}</h3>
                      <div className="shop-card-rating">⭐ 4.8</div>
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
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="tab-content">
          <h2 style={{ marginBottom: 'var(--space-4)', fontSize: '1.25rem' }}>My Orders</h2>
          {myBookings.length === 0 ? (
            <div className="text-center" style={{ padding: 'var(--space-12)', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '1.125rem', marginBottom: 'var(--space-2)' }}>No orders yet</p>
              <p>Browse shops and book your first dry cleaning service!</p>
              <button 
                className="btn btn-primary btn-large mt-6"
                onClick={() => setActiveTab('shops')}
              >
                Browse Shops
              </button>
            </div>
          ) : (
            <div className="bookings-list">
              {myBookings.map(booking => (
                <div key={booking.id} className="card mb-6">
                  <div className="card-body">
                    <div className="info-header" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                      <div>
                        <h3 style={{ marginBottom: 'var(--space-1)' }}>{booking.shop_name}</h3>
                        <p className="table-cell-secondary">Order #{booking.booking_number}</p>
                      </div>
                      <span className={`status-badge status-${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
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
                        <div className="info-item-label">Expected Delivery</div>
                        <div className="info-item-value">{new Date(booking.delivery_date).toLocaleDateString()}</div>
                      </div>
                      <div className="info-item">
                        <div className="info-item-label">Total Amount</div>
                        <div className="info-item-value" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>₹{booking.final_amount}</div>
                      </div>
                    </div>

                    <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                      {booking.status === 'Pending' && (
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleCancel(booking.id)}
                        >
                          Cancel Order
                        </button>
                      )}
                      {booking.status === 'Completed' && !booking.customer_approved && (
                        <button 
                          className="btn btn-success"
                          onClick={async () => {
                            await bookingAPI.approve(booking.id);
                            alert('Thank you for your feedback!');
                            loadDashboardData();
                          }}
                        >
                          ✓ Service OK
                        </button>
                      )}
                      <button 
                        className="btn btn-secondary"
                        onClick={() => navigate('/track', { state: { booking } })}
                      >
                        Track Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
