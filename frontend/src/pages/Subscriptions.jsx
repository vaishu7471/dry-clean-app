import React, { useState, useEffect } from 'react';
import { subscriptionAPI } from '../services/api';
import '../styles/pages.css';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSubscriptions();
    loadMySubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const response = await subscriptionAPI.getAll();
      setSubscriptions(response.data);
    } catch (error) {
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const loadMySubscriptions = async () => {
    try {
      const response = await subscriptionAPI.getMySubscriptions();
      setMySubscriptions(response.data);
    } catch (error) {
      // Ignore error - user might not have any subscriptions
    }
  };

  const handlePurchase = async (subscriptionId) => {
    setError('');
    setSuccess('');

    try {
      await subscriptionAPI.purchase({ subscription_id: subscriptionId });
      setSuccess('Subscription purchased successfully!');
      loadMySubscriptions();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to purchase subscription');
    }
  };

  if (loading) return <div className="loading">Loading subscriptions...</div>;

  return (
    <div className="subscriptions-page">
      <h1>Subscription Plans</h1>
      <p className="page-subtitle">Save more with our monthly subscription plans!</p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* My Subscriptions */}
      {mySubscriptions.length > 0 && (
        <section className="my-subscriptions">
          <h2>My Active Subscriptions</h2>
          <div className="subscriptions-grid">
            {mySubscriptions.map(sub => (
              <div key={sub.id} className={`subscription-card owned ${sub.status === 'Active' ? 'active' : ''}`}>
                <div className="subscription-header">
                  <h3>{sub.name}</h3>
                  <span className={`status-badge ${sub.status.toLowerCase()}`}>{sub.status}</span>
                </div>
                <div className="subscription-details">
                  <p>📅 Valid until: {new Date(sub.end_date).toLocaleDateString()}</p>
                  <p>👕 Clothes Used: {sub.clothes_used} / {sub.total_clothes}</p>
                  <p>💰 Price: ₹{sub.price}</p>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(sub.clothes_used / sub.total_clothes) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Available Plans */}
      <section className="available-plans">
        <h2>Available Plans</h2>
        <div className="subscriptions-grid">
          {subscriptions.map(plan => (
            <div key={plan.id} className="subscription-card">
              <div className="subscription-header">
                <h3>{plan.name}</h3>
                <span className="price-tag">₹{plan.price}</span>
              </div>
              <div className="subscription-body">
                <p className="description">{plan.description}</p>
                <ul className="features-list">
                  <li>📅 {plan.duration_days} days validity</li>
                  <li>👕 {plan.clothes_per_week} clothes per week</li>
                  <li>✨ Total {plan.total_clothes} clothes</li>
                  <li>🚚 Free pickup & delivery</li>
                </ul>
              </div>
              <button 
                className="btn btn-primary btn-block"
                onClick={() => handlePurchase(plan.id)}
              >
                Purchase Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <h2>How Subscriptions Work</h2>
        <div className="steps-grid">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Choose a Plan</h3>
            <p>Select a subscription plan that fits your needs</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Schedule Pickup</h3>
            <p>Book pickups as per your convenience</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>We Clean</h3>
            <p>Professional cleaning with care</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Get Delivery</h3>
            <p>Clean clothes delivered to your doorstep</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Subscriptions;
