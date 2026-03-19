import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import '../styles/index.css';

const TrackBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialBooking = location.state?.booking;
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialBooking) {
      loadBookingDetails(initialBooking.id);
    } else {
      navigate('/customer');
    }
  }, []);

  const loadBookingDetails = async (bookingId) => {
    try {
      const response = await bookingAPI.getById(bookingId);
      setBooking(response.data);
    } catch (error) {
      console.error('Failed to load booking:', error);
    } finally {
      setLoading(false);
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

  const getStatusSteps = () => {
    return ['Pending', 'Accepted', 'Washing', 'Ironing', 'Ready', 'Out for delivery', 'Completed'];
  };

  const getCurrentStepIndex = () => {
    if (!booking) return 0;
    const steps = getStatusSteps();
    let index = steps.indexOf(booking.status);
    if (index === -1) index = 0;
    return index;
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingAPI.cancel(booking.id);
      alert('Booking cancelled successfully!');
      navigate('/customer');
    } catch (error) {
      alert('Failed to cancel booking');
    }
  };

  const handleApprove = async () => {
    try {
      await bookingAPI.approve(booking.id);
      alert('Thank you for confirming!');
      loadBookingDetails(booking.id);
    } catch (error) {
      alert('Failed to approve');
    }
  };

  if (loading) return <div className="loading">Loading booking details...</div>;
  if (!booking) return <div className="error-message">Booking not found</div>;

  const currentStepIndex = getCurrentStepIndex();
  const steps = getStatusSteps();
  const progressPercentage = (currentStepIndex / (steps.length - 1)) * 100;

  return (
    <div className="track-container">
      <div className="dashboard-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1>📦 Track Your Order</h1>
          <p>Real-time status of your dry cleaning booking</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/customer')}>
          ← Back
        </button>
      </div>

      {/* Booking Info Card */}
      <div className="booking-info-card">
        <div className="info-header">
          <div>
            <h2 style={{ marginBottom: 'var(--space-1)' }}>{booking.shop_name}</h2>
            <p className="table-cell-secondary">Booking #{booking.booking_number}</p>
          </div>
          <span className={`status-badge status-${getStatusColor(booking.status)}`} style={{ fontSize: '0.875rem', padding: 'var(--space-2) var(--space-4)' }}>
            {booking.status}
          </span>
        </div>

        <div className="info-grid">
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

        {booking.pickup_address && (
          <div className="info-item mt-6" style={{ gridColumn: '1 / -1' }}>
            <div className="info-item-label">Pickup Address</div>
            <div className="info-item-value">{booking.pickup_address}</div>
          </div>
        )}
      </div>

      {/* Step Progress Bar */}
      <div className="step-progress">
        <h3 className="step-progress-title">📊 Service Progress</h3>
        <div className="steps-container">
          <div 
            className="steps-progress-line" 
            style={{ width: `calc(${progressPercentage}% - 50px)` }}
          />
          {steps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div 
                key={step} 
                className={`step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              >
                <div className="step-marker">
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div className="step-label">{step}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tracking History */}
      {booking.tracking && booking.tracking.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📜 Tracking History</h3>
          </div>
          <div className="card-body">
            <div className="tracking-history">
              {booking.tracking.map((track, index) => (
                <div key={track.id} className="tracking-item" style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', marginBottom: index < booking.tracking.length - 1 ? 'var(--space-4)' : 0 }}>
                  <div className="tracking-dot" style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '50%', marginTop: 'var(--space-2)', flexShrink: 0 }}></div>
                  <div className="tracking-content" style={{ flex: 1 }}>
                    <div className="tracking-status" style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>{track.status}</div>
                    <div className="tracking-time" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{new Date(track.created_at).toLocaleString()}</div>
                    {track.notes && (
                      <div className="tracking-notes" style={{ marginTop: 'var(--space-2)', padding: 'var(--space-2)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
                        {track.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="card mt-6">
        <div className="card-body">
          <div className="flex gap-4" style={{ justifyContent: 'center' }}>
            {booking.status === 'Pending' && (
              <button className="btn btn-danger" onClick={handleCancel}>
                ❌ Cancel Booking
              </button>
            )}
            {booking.status === 'Completed' && !booking.customer_approved && (
              <button className="btn btn-success" onClick={handleApprove}>
                ✓ Service OK - Confirm Completion
              </button>
            )}
            {booking.status === 'Completed' && booking.customer_approved && (
              <div className="status-badge status-completed" style={{ padding: 'var(--space-3) var(--space-5)', fontSize: '1rem' }}>
                ✓ Service Approved by You
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackBooking;
