import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/index.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [shops, setShops] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, pending: 0, washing: 0, ironing: 0, ready: 0, completed: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  // ✅ DEBUG: If this does NOT print, routing problem
  console.log('Admin Page Loaded');
  console.log('Current user:', user);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [shopsRes, bookingsRes] = await Promise.all([
        fetch('http://localhost:5000/admin/shops', {
          headers: {
            'Authorization': `Bearer ${user.id}`
          }
        }),
        fetch('http://localhost:5000/admin/bookings', {
          headers: {
            'Authorization': `Bearer ${user.id}`
          }
        })
      ]);

      const shopsData = await shopsRes.json();
      const bookingsData = await bookingsRes.json();

      if (shopsRes.ok && shopsData.shops) {
        setShops(shopsData.shops);
      }

      if (bookingsRes.ok && bookingsData.bookings) {
        const data = bookingsData.bookings;
        setBookings(data);

        // Calculate stats
        setStats({
          totalBookings: data.length,
          pending: data.filter(b => b.status === 'Pending').length,
          washing: data.filter(b => b.status === 'Washing').length,
          ironing: data.filter(b => b.status === 'Ironing').length,
          ready: data.filter(b => b.status === 'Ready').length,
          completed: data.filter(b => b.status === 'Completed' || b.status === 'Delivered').length,
          revenue: data.reduce((sum, b) => sum + parseFloat(b.final_amount || 0), 0)
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/booking/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        loadDashboardData();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      alert('Failed to update status');
    }
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

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <h1>🏪 Admin Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Total Orders</div>
              <div className="stat-value">{stats.totalBookings}</div>
            </div>
            <div className="stat-icon">📦</div>
          </div>
          <div className="stat-change positive">All time bookings</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-header">
            <div>
              <div className="stat-label">Pending Orders</div>
              <div className="stat-value">{stats.pending}</div>
            </div>
            <div className="stat-icon">⏳</div>
          </div>
          <div className="stat-change">Needs attention</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Washing</div>
              <div className="stat-value">{stats.washing}</div>
            </div>
            <div className="stat-icon">💧</div>
          </div>
          <div className="stat-change">In progress</div>
        </div>

        <div className="stat-card ironing">
          <div className="stat-header">
            <div>
              <div className="stat-label">Ironing</div>
              <div className="stat-value">{stats.ironing}</div>
            </div>
            <div className="stat-icon">👔</div>
          </div>
          <div className="stat-change">Almost ready</div>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <div>
              <div className="stat-label">Completed</div>
              <div className="stat-value">{stats.completed}</div>
            </div>
            <div className="stat-icon">✅</div>
          </div>
          <div className="stat-change positive">Delivered orders</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">₹{stats.revenue.toFixed(2)}</div>
            </div>
            <div className="stat-icon">💰</div>
          </div>
          <div className="stat-change positive">All earnings</div>
        </div>
      </div>

      {/* Shop Overview */}
      {shops.length > 0 && (
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="card-title">🏪 Your Shop</h2>
          </div>
          <div className="card-body">
            <div className="shop-card admin">
              <div className="shop-card-header">
                <h3 className="shop-card-title">{shops[0].shop_name}</h3>
                <div className="shop-card-rating">⭐ {shops[0].rating}</div>
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
                  <div className="shop-info-item">
                    <span className="shop-info-icon">📊</span>
                    <span>{shops[0].total_bookings || 0} total bookings</span>
                  </div>
                </div>

                <div className="shop-services">
                  <div className="shop-services-title">🧼 Services Available</div>
                  <div className="service-list">
                    {shops[0].services.map(service => (
                      <span key={service.id} className="service-tag">
                        {service.service_name}
                        <span className="service-tag-price">₹{service.base_price}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Bookings Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📋 All Bookings</h2>
        </div>
        <div className="card-body">
          {bookings.length === 0 ? (
            <div className="text-center" style={{ padding: 'var(--space-12)', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '1.125rem' }}>No bookings yet</p>
              <p>Bookings will appear here once customers start ordering</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Booking #</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Cloth Type</th>
                    <th>Qty</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id}>
                      <td className="table-cell-primary">#{booking.booking_number}</td>
                      <td>
                        <div className="table-cell-primary">{booking.customer_name}</div>
                        <div className="table-cell-secondary">{booking.customer_phone}</div>
                      </td>
                      <td className="table-cell-primary">{booking.service_name}</td>
                      <td className="table-cell-secondary">{booking.cloth_type}</td>
                      <td className="table-cell-secondary">{booking.quantity}</td>
                      <td className="table-cell-primary">₹{booking.final_amount}</td>
                      <td>
                        <span className={`status-badge status-${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <select
                          value={booking.status}
                          onChange={(e) => handleUpdateStatus(booking.id, e.target.value)}
                          className="form-select"
                          style={{ padding: 'var(--space-2)', fontSize: '0.875rem' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Washing">Washing</option>
                          <option value="Ironing">Ironing</option>
                          <option value="Ready">Ready</option>
                          <option value="Out for delivery">Out for delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
