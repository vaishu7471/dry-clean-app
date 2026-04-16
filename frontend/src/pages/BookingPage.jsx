import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/index.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'API_BASE_URL';

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const shop = location.state?.shop;
  const { user } = useAuth();

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [formData, setFormData] = useState({
    cloth_type: '',
    quantity: 1,
    pickup_date: '',
    pickup_address: '',
    special_instructions: '',
    promo_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderSummary, setOrderSummary] = useState(null);
  const [myBookings, setMyBookings] = useState([]);

  const isSubmitting = useRef(false);

  useEffect(() => {
    if (!shop) {
      navigate('/');
      return;
    }
    loadServices();
    loadMyBookings();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData(prev => ({ ...prev, pickup_date: tomorrow.toISOString().split('T')[0] }));
  }, [shop, navigate]);

  const loadServices = async () => {
    try {
      const response = await fetch(`API_BASE_URL/shops/${shop.id}`);
      const data = await response.json();

      if (response.ok && data.shop) {
        const servicesList = data.shop.services || [];
        setServices(servicesList);
        if (servicesList.length > 0) {
          setSelectedService(servicesList[0].id.toString());
        }
      } else {
        setError('Failed to load services');
      }
    } catch (error) {
      setError('Failed to load services');
    }
  };

  const loadMyBookings = async () => {
    try {
      const response = await fetch('API_BASE_URL/bookings', {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      const data = await response.json();

      if (response.ok && data.bookings) {
        setMyBookings(data.bookings);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  };

  useEffect(() => {
    if (selectedService && services.length > 0) {
      calculateSummary();
    }
  }, [selectedService, formData.quantity, services]);

  const calculateSummary = () => {
    const service = services.find(s => s.id === parseInt(selectedService));
    if (!service) return;

    const totalAmount = service.base_price * formData.quantity;
    setOrderSummary({
      serviceName: service.service_name,
      totalAmount,
      finalAmount: totalAmount
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading || isSubmitting.current) {
      return;
    }

    setError('');
    setSuccess('');
    isSubmitting.current = true;
    setLoading(true);

    try {
      if (!formData.cloth_type) {
        setError('Please select a cloth type');
        setLoading(false);
        isSubmitting.current = false;
        return;
      }
      if (!formData.pickup_address) {
        setError('Please enter pickup address');
        setLoading(false);
        isSubmitting.current = false;
        return;
      }

      const bookingNumber = 'BK' + Date.now();
      const pickupDate = new Date(formData.pickup_date);
      pickupDate.setDate(pickupDate.getDate() + 3);
      const deliveryDate = pickupDate.toISOString().split('T')[0];

      const bookingData = {
        booking_number: bookingNumber,
        customer_id: user.id,
        shop_id: shop.id,
        service_id: parseInt(selectedService),
        cloth_type: formData.cloth_type,
        quantity: parseInt(formData.quantity),
        total_amount: orderSummary.totalAmount,
        discount: 0,
        final_amount: orderSummary.finalAmount,
        pickup_date: formData.pickup_date,
        delivery_date: deliveryDate,
        pickup_address: formData.pickup_address,
        special_instructions: formData.special_instructions || '',
        status: 'Pending'
      };

      const response = await fetch('API_BASE_URL/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      const newBooking = {
        id: data.booking.id,
        booking_number: data.booking.booking_number,
        shop_name: shop.shop_name,
        service_name: services.find(s => s.id === parseInt(selectedService))?.service_name,
        cloth_type: formData.cloth_type,
        quantity: formData.quantity,
        final_amount: data.booking.final_amount,
        pickup_date: formData.pickup_date,
        delivery_date: data.booking.delivery_date,
        status: 'Pending',
        customer_approved: false
      };

      setMyBookings(prev => [newBooking, ...prev]);
      setSuccess(`✅ Booking confirmed! #${data.booking.booking_number}`);

      setFormData({
        cloth_type: '',
        quantity: 1,
        pickup_date: '',
        pickup_address: '',
        special_instructions: '',
        promo_code: ''
      });
      setOrderSummary(null);

    } catch (error) {
      setError(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'pending', 'Washing': 'washing', 'Ironing': 'ironing',
      'Ready': 'ready', 'Delivered': 'delivered', 'Completed': 'completed',
      'Cancelled': 'cancelled'
    };
    return colors[status] || 'pending';
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      const response = await fetch(`API_BASE_URL/booking/${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadMyBookings();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cancel');
      }
    } catch (error) {
      alert('Failed to cancel');
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      const response = await fetch(`API_BASE_URL/booking/${bookingId}/approve`, {
        method: 'PUT',
      });

      if (response.ok) {
        loadMyBookings();
        alert('Thank you for your feedback!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to approve');
      }
    } catch (error) {
      alert('Failed to approve');
    }
  };

  if (!shop) return <div className="loading">Loading...</div>;

  return (
    <div className="booking-container">
      <div className="dashboard-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1>📝 Book Dry Cleaning Service</h1>
          <p>Fill in the details to book your service</p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-body">
          <div className="shop-info">
            <div className="shop-info-item">
              <span className="shop-info-icon">🏪</span>
              <span style={{ fontWeight: 600 }}>{shop.shop_name}</span>
            </div>
            <div className="shop-info-item">
              <span className="shop-info-icon">📍</span>
              <span>{shop.address}</span>
            </div>
            <div className="shop-info-item">
              <span className="shop-info-icon">📞</span>
              <span>{shop.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-section">
          <h3 className="form-section-title">🧼 Select Service</h3>
          <div className="service-options-grid">
            {services.map(service => (
              <label key={service.id} className="service-option">
                <input
                  type="radio"
                  name="service"
                  value={service.id}
                  checked={selectedService === service.id.toString()}
                  onChange={(e) => setSelectedService(e.target.value)}
                />
                <div className="service-option-card">
                  <div className="service-option-name">{service.service_name}</div>
                  <div className="service-option-type">{service.service_type}</div>
                  <div className="service-option-price">₹{service.base_price}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">👔 Cloth Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Cloth Type *</label>
              <select
                className="form-select"
                value={formData.cloth_type}
                onChange={(e) => setFormData({...formData, cloth_type: e.target.value})}
                required
              >
                <option value="">Select cloth type</option>
                <option value="Shirt">Shirt</option>
                <option value="Pant">Pant</option>
                <option value="Saree">Saree</option>
                <option value="Suit">Suit</option>
                <option value="Blazer">Blazer</option>
                <option value="Kurta">Kurta</option>
                <option value="Dress">Dress</option>
                <option value="Bed Sheet">Bed Sheet</option>
                <option value="Curtain">Curtain</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="50"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">📍 Pickup Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Pickup Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.pickup_date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({...formData, pickup_date: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Promo Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.promo_code}
                onChange={(e) => setFormData({...formData, promo_code: e.target.value.toUpperCase()})}
                placeholder="WELCOME20"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Pickup Address *</label>
            <textarea
              className="form-textarea"
              value={formData.pickup_address}
              onChange={(e) => setFormData({...formData, pickup_address: e.target.value})}
              placeholder="Enter complete address with landmark"
              rows="3"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Special Instructions</label>
            <textarea
              className="form-textarea"
              value={formData.special_instructions}
              onChange={(e) => setFormData({...formData, special_instructions: e.target.value})}
              placeholder="Any specific requirements?"
              rows="2"
            />
          </div>
        </div>

        {orderSummary && (
          <div className="card mb-6" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid var(--primary)' }}>
            <div className="card-body">
              <h3 style={{ marginBottom: 'var(--space-4)', fontSize: '1.125rem' }}>📊 Order Summary</h3>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-item-label">Service</div>
                  <div className="info-item-value">{orderSummary.serviceName}</div>
                </div>
                <div className="info-item">
                  <div className="info-item-label">Quantity</div>
                  <div className="info-item-value">{formData.quantity} piece(s)</div>
                </div>
                <div className="info-item">
                  <div className="info-item-label">Subtotal</div>
                  <div className="info-item-value">₹{orderSummary.totalAmount.toFixed(2)}</div>
                </div>
                <div className="info-item" style={{ background: 'white', borderColor: 'var(--primary)' }}>
                  <div className="info-item-label">Estimated Total</div>
                  <div className="info-item-value" style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>₹{orderSummary.finalAmount.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4" style={{ justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? '⏳ Booking...' : '✅ Confirm Booking'}
          </button>
        </div>
      </form>

      <div className="card mt-8" style={{ marginTop: 'var(--space-8)' }}>
        <div className="card-header">
          <h2 className="card-title">📦 My Orders</h2>
        </div>
        <div className="card-body">
          {myBookings.length === 0 ? (
            <div className="text-center" style={{ padding: 'var(--space-12)', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '1.125rem', marginBottom: 'var(--space-2)' }}>No orders yet</p>
              <p>Book your first dry cleaning service above!</p>
            </div>
          ) : (
            <div className="bookings-list">
              {myBookings.map(booking => (
                <div key={booking.id} className="card mb-6" style={{ background: 'var(--bg-secondary)' }}>
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
                        <div className="info-item-label">Total Amount</div>
                        <div className="info-item-value" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>₹{booking.final_amount}</div>
                      </div>
                    </div>

                    <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                      {booking.status === 'Pending' && (
                        <button className="btn btn-danger" onClick={() => handleCancel(booking.id)}>
                          Cancel Order
                        </button>
                      )}
                      {booking.status === 'Completed' && !booking.customer_approved && (
                        <button className="btn btn-success" onClick={() => handleApprove(booking.id)}>
                          ✓ Service OK
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
