import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getShopById, createBooking, getUserBookings } from '../lib/supabaseQueries';
import '../styles/index.css';

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const shop = location.state?.shop;

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
  
  // Prevent duplicate submissions
  const isSubmitting = useRef(false);

  useEffect(() => {
    if (!shop) {
      console.log('No shop data, redirecting to home');
      navigate('/');
      return;
    }
    console.log('Shop data received:', shop);
    loadServices();
    loadMyBookings();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData(prev => ({ ...prev, pickup_date: tomorrow.toISOString().split('T')[0] }));
  }, [shop, navigate]);

  const loadServices = async () => {
    try {
      console.log('Loading services for shop:', shop.id);
      const { data, error } = await getShopById(shop.id);
      
      if (error) throw error;
      
      console.log('Shop data:', data);
      const servicesList = data.services || [];
      setServices(servicesList);
      if (servicesList.length > 0) {
        setSelectedService(servicesList[0].id.toString());
      }
    } catch (error) {
      console.error('Failed to load services:', error);
      setError('Failed to load services. Please try again.');
    }
  };

  const loadMyBookings = async () => {
    try {
      console.log('Loading my bookings...');
      const { data, error } = await getUserBookings(user.id);
      
      if (error) throw error;
      
      console.log('Bookings loaded:', data);
      setMyBookings(data || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  };

  useEffect(() => {
    if (selectedService && services.length > 0) {
      calculateSummary();
    }
  }, [selectedService, formData.quantity, services, selectedService]);

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
    // Prevent default form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Prevent duplicate submissions
    if (loading || isSubmitting.current) {
      console.log('⚠️ Already submitting, ignoring duplicate request');
      return;
    }

    setError('');
    setSuccess('');
    isSubmitting.current = true;
    setLoading(true);

    console.log('📝 Form submitted');

    try {
      // Validation
      if (!formData.cloth_type) {
        setError('Please select a cloth type');
        isSubmitting.current = false;
        setLoading(false);
        return;
      }
      if (!formData.pickup_address) {
        setError('Please enter pickup address');
        isSubmitting.current = false;
        setLoading(false);
        return;
      }
      if (!shop?.id) {
        setError('Shop information missing. Please go back and select a shop.');
        isSubmitting.current = false;
        setLoading(false);
        return;
      }
      if (!selectedService) {
        setError('Please select a service');
        isSubmitting.current = false;
        setLoading(false);
        return;
      }

      const bookingData = {
        shop_id: shop.id,
        service_id: parseInt(selectedService),
        cloth_type: formData.cloth_type,
        quantity: parseInt(formData.quantity),
        pickup_date: formData.pickup_date,
        pickup_address: formData.pickup_address,
        special_instructions: formData.special_instructions,
        promo_code: formData.promo_code
      };

      console.log('📝 Submitting booking:', bookingData);

      const response = await bookingAPI.create(bookingData);

      console.log('✅ Booking response:', response.data);

      // Create new booking object for immediate UI update
      const newBooking = {
        id: response.data.booking.id,
        booking_number: response.data.booking.booking_number,
        shop_name: shop.shop_name,
        service_name: services.find(s => s.id === parseInt(selectedService))?.service_name || 'Unknown',
        cloth_type: formData.cloth_type,
        quantity: formData.quantity,
        final_amount: response.data.booking.final_amount,
        pickup_date: formData.pickup_date,
        delivery_date: response.data.booking.delivery_date,
        status: 'Pending',
        customer_approved: 0
      };

      // Update bookings list immediately
      setMyBookings(prev => [newBooking, ...prev]);

      setSuccess(`✅ Booking confirmed! Booking #${response.data.booking.booking_number}`);

      // Reset form
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
      console.error('❌ Booking error:', error);
      let errorMsg = 'Failed to create booking';

      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Status:', error.response.status);
        errorMsg = error.response.data?.error || `Server error (${error.response.status})`;
      } else if (error.request) {
        console.error('No response received:', error.request);
        errorMsg = 'Cannot connect to server. Please check if backend is running.';
      } else {
        console.error('Error message:', error.message);
        errorMsg = error.message;
      }

      setError(errorMsg);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
      isSubmitting.current = false;
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

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingAPI.cancel(bookingId);
      alert('Booking cancelled successfully!');
      loadMyBookings();
    } catch (error) {
      alert('Failed to cancel booking');
    }
  };

  return (
    <div className="booking-container">
      <div className="dashboard-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1>📝 Book Dry Cleaning Service</h1>
          <p>Fill in the details to book your service</p>
        </div>
      </div>

      {shop && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="card-title">🏪 Selected Shop</h3>
          </div>
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
      )}

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="booking-form">
        {/* Service Selection */}
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

        {/* Cloth Details */}
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

        {/* Pickup Details */}
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

        {/* Order Summary */}
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

        {/* Form Actions */}
        <div className="flex gap-4" style={{ justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/book')}
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

      {/* My Orders Section */}
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
                            loadMyBookings();
                          }}
                        >
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
