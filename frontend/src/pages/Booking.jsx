import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceAPI, orderAPI } from '../services/api';
import '../styles/pages.css';

const Booking = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [formData, setFormData] = useState({
    quantity: 1,
    is_quick_service: false,
    pickup_date: '',
    delivery_address: '',
    special_instructions: '',
    promo_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderSummary, setOrderSummary] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadServices();
    // Set minimum pickup date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData(prev => ({ ...prev, pickup_date: tomorrow.toISOString().split('T')[0] }));
  }, []);

  const loadServices = async () => {
    try {
      const response = await serviceAPI.getAll();
      setServices(response.data);
      if (response.data.length > 0) {
        setSelectedService(response.data[0].id);
      }
    } catch (error) {
      setError('Failed to load services');
    }
  };

  const calculateSummary = () => {
    const service = services.find(s => s.id === parseInt(selectedService));
    if (!service) return;

    let totalAmount = service.base_price * formData.quantity;
    
    if (formData.is_quick_service && service.quick_price) {
      totalAmount = service.quick_price * formData.quantity;
    }

    // First-time discount (simplified - actual logic on backend)
    const isFirstTime = localStorage.getItem('is_first_time') === 'true';
    let discount = isFirstTime ? totalAmount * 0.20 : 0;

    const deliveryCharge = 50;
    const finalAmount = totalAmount - discount + deliveryCharge;

    setOrderSummary({
      serviceName: service.name,
      totalAmount,
      discount,
      deliveryCharge,
      finalAmount,
      deliveryDays: formData.is_quick_service ? 1 : service.delivery_time_days
    });
  };

  useEffect(() => {
    if (selectedService) {
      calculateSummary();
    }
  }, [selectedService, formData.quantity, formData.is_quick_service]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await orderAPI.create({
        service_id: parseInt(selectedService),
        quantity: formData.quantity,
        is_quick_service: formData.is_quick_service,
        pickup_date: formData.pickup_date,
        delivery_address: formData.delivery_address,
        special_instructions: formData.special_instructions,
        promo_code: formData.promo_code
      });

      setSuccess(`Order booked successfully! Order #${response.data.order.order_number}`);
      
      setTimeout(() => {
        navigate('/tracking');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-container">
        <h1>Book Dry Cleaning Service</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-section">
            <h3>Select Service</h3>
            <div className="service-select-grid">
              {services.map(service => (
                <label 
                  key={service.id} 
                  className={`service-option ${selectedService === service.id.toString() ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="service"
                    value={service.id}
                    checked={selectedService === service.id.toString()}
                    onChange={(e) => setSelectedService(e.target.value)}
                  />
                  <div className="service-option-card">
                    <h4>{service.name}</h4>
                    <p className="price">₹{service.base_price}</p>
                    <p className="time">⏱️ {service.delivery_time_days} days</p>
                    {service.is_quick_available && (
                      <span className="quick-badge">⚡ Quick Available</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Order Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Pickup Date</label>
                <input
                  type="date"
                  value={formData.pickup_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_quick_service}
                  onChange={(e) => setFormData({ ...formData, is_quick_service: e.target.checked })}
                />
                <span>⚡ Quick Service (1-day delivery) - Extra charges apply</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3>Delivery Information</h3>
            <div className="form-group">
              <label>Pickup & Delivery Address</label>
              <textarea
                value={formData.delivery_address}
                onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                placeholder="Enter complete address with landmark"
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label>Special Instructions (Optional)</label>
              <textarea
                value={formData.special_instructions}
                onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                placeholder="Any specific requirements?"
                rows="2"
              />
            </div>

            <div className="form-group">
              <label>Promo Code (Optional)</label>
              <input
                type="text"
                value={formData.promo_code}
                onChange={(e) => setFormData({ ...formData, promo_code: e.target.value.toUpperCase() })}
                placeholder="Enter promo code"
              />
            </div>
          </div>

          {orderSummary && (
            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Service:</span>
                <span>{orderSummary.serviceName}</span>
              </div>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{orderSummary.totalAmount.toFixed(2)}</span>
              </div>
              {orderSummary.discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount:</span>
                  <span>-₹{orderSummary.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Delivery Charge:</span>
                <span>₹{orderSummary.deliveryCharge.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{orderSummary.finalAmount.toFixed(2)}</span>
              </div>
              <p className="delivery-info">
                📅 Expected Delivery: {orderSummary.deliveryDays} day(s) after pickup
              </p>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block btn-large" disabled={loading}>
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Booking;
