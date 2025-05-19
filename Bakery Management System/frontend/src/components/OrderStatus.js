import React, { useState, useEffect } from 'react';
import './OrderStatus.css';

const OrderStatus = ({ orderId, onBackToProducts }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderStatus();
    }
  }, [orderId]);

  const fetchOrderStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setOrderDetails(data);
      setError(null);
      
      // If order is still processing, check again in 5 seconds
      if (data.status === 'pending' || data.status === 'processing') {
        setTimeout(fetchOrderStatus, 5000);
      }
    } catch (err) {
      setError(`Failed to fetch order status: ${err.message}`);
      console.error('Error fetching order status:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (error) {
    return (
      <div className="order-status">
        <div className="error-message">{error}</div>
        <button className="primary-btn" onClick={onBackToProducts}>
          Back to Products
        </button>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="order-status">
        <div className="error-message">Order not found</div>
        <button className="primary-btn" onClick={onBackToProducts}>
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="order-status">
      <h2>Order #{orderId}</h2>
      
      <div className="status-banner">
        <span className={`status-indicator ${getStatusColor(orderDetails.status)}`}>
          {orderDetails.status}
        </span>
      </div>
      
      <div className="order-details">
        <div className="order-info">
          <p><strong>Customer:</strong> {orderDetails.customer_name}</p>
          <p><strong>Order Date:</strong> {new Date(orderDetails.created_at).toLocaleString()}</p>
        </div>
        
        <div className="order-items">
          <h3>Items:</h3>
          <ul>
            {orderDetails.items.map((item, index) => (
              <li key={index}>
                {item.product_name} - ${item.price.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="order-total">
          <strong>Total: ${orderDetails.total.toFixed(2)}</strong>
        </div>
      </div>
      
      {(orderDetails.status === 'pending' || orderDetails.status === 'processing') && (
        <div className="status-message">
          <p>Your order is being processed. Please check back later for updates.</p>
          <div className="loading-spinner"></div>
        </div>
      )}
      
      {orderDetails.status === 'completed' && (
        <div className="status-message success">
          <p>Your order has been completed! Thank you for shopping with us.</p>
        </div>
      )}
      
      <div className="action-buttons">
        <button className="primary-btn" onClick={onBackToProducts}>
          Back to Products
        </button>
      </div>
    </div>
  );
};

export default OrderStatus;