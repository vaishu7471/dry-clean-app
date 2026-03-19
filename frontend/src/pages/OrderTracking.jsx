import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import '../styles/pages.css';

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      setOrders(response.data);
      if (response.data.length > 0) {
        setSelectedOrder(response.data[0]);
      }
    } catch (error) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId) => {
    try {
      await orderAPI.approve(orderId);
      alert('Order approved! Thank you for your feedback.');
      loadOrders();
    } catch (error) {
      alert('Failed to approve order');
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await orderAPI.cancel(orderId);
      alert('Order cancelled successfully');
      loadOrders();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#f59e0b',
      'Washing': '#3b82f6',
      'Ironing': '#8b5cf6',
      'Ready': '#10b981',
      'Out for Delivery': '#06b6d4',
      'Delivered': '#059669',
      'Cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusSteps = () => {
    return ['Pending', 'Washing', 'Ironing', 'Ready', 'Out for Delivery', 'Delivered'];
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="tracking-page">
      <h1>Track Your Orders</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="tracking-container">
        <div className="orders-list">
          <h2>Your Orders</h2>
          {orders.length === 0 ? (
            <p className="no-orders">No orders found. Book your first service!</p>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className={`order-item ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="order-item-header">
                  <span className="order-number">#{order.order_number}</span>
                  <span 
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="order-item-details">
                  <span>{order.service_name}</span>
                  <span>₹{order.final_amount}</span>
                </div>
                <div className="order-item-date">
                  📅 {new Date(order.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>

        {selectedOrder && (
          <div className="order-details">
            <h2>Order Details</h2>
            
            <div className="order-info-card">
              <div className="info-row">
                <span className="label">Order Number:</span>
                <span className="value">#{selectedOrder.order_number}</span>
              </div>
              <div className="info-row">
                <span className="label">Service:</span>
                <span className="value">{selectedOrder.service_name}</span>
              </div>
              <div className="info-row">
                <span className="label">Status:</span>
                <span 
                  className="value status-badge"
                  style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                >
                  {selectedOrder.status}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Quantity:</span>
                <span className="value">{selectedOrder.quantity}</span>
              </div>
              <div className="info-row">
                <span className="label">Pickup Date:</span>
                <span className="value">{new Date(selectedOrder.pickup_date).toLocaleDateString()}</span>
              </div>
              <div className="info-row">
                <span className="label">Expected Delivery:</span>
                <span className="value">{new Date(selectedOrder.delivery_date).toLocaleDateString()}</span>
              </div>
              <div className="info-row">
                <span className="label">Delivery Address:</span>
                <span className="value">{selectedOrder.delivery_address}</span>
              </div>
              {selectedOrder.special_instructions && (
                <div className="info-row">
                  <span className="label">Special Instructions:</span>
                  <span className="value">{selectedOrder.special_instructions}</span>
                </div>
              )}
            </div>

            {/* Order Status Timeline */}
            <div className="order-timeline">
              <h3>Order Progress</h3>
              <div className="timeline">
                {getStatusSteps().map((step, index) => {
                  const stepIndex = getStatusSteps().indexOf(selectedOrder.status);
                  const isCompleted = index <= stepIndex;
                  const isCurrent = index === stepIndex;

                  return (
                    <div key={step} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                      <div className="step-marker">
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <div className="step-label">{step}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Billing Details */}
            <div className="billing-details">
              <h3>Billing Details</h3>
              <div className="bill-row">
                <span>Subtotal:</span>
                <span>₹{selectedOrder.total_amount}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="bill-row discount">
                  <span>Discount:</span>
                  <span>-₹{selectedOrder.discount}</span>
                </div>
              )}
              <div className="bill-row">
                <span>Delivery Charge:</span>
                <span>₹{selectedOrder.delivery_charge}</span>
              </div>
              <div className="bill-row total">
                <span>Total Paid:</span>
                <span>₹{selectedOrder.final_amount}</span>
              </div>
              <div className="payment-status">
                Payment: <span className={selectedOrder.payment_status === 'Paid' ? 'paid' : 'pending'}>
                  {selectedOrder.payment_status}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="order-actions">
              {selectedOrder.status === 'Delivered' && !selectedOrder.customer_approved && (
                <button 
                  className="btn btn-success"
                  onClick={() => handleApprove(selectedOrder.id)}
                >
                  ✓ Service OK - Confirm Completion
                </button>
              )}
              {selectedOrder.status === 'Pending' && (
                <button 
                  className="btn btn-danger"
                  onClick={() => handleCancel(selectedOrder.id)}
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
