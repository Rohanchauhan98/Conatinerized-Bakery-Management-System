import React, { useState } from 'react';
import './OrderForm.css';

const OrderForm = ({ products, onSubmit, onCancel }) => {
  const [customerName, setCustomerName] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [error, setError] = useState('');

  const handleProductSelection = (productId) => {
    // Toggle product selection
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Form validation
    if (!customerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (selectedProducts.length === 0) {
      setError('Please select at least one product');
      return;
    }
    
    // Submit the order
    onSubmit(customerName, selectedProducts);
  };

  const calculateTotal = () => {
    return products
      .filter(product => selectedProducts.includes(product.id))
      .reduce((total, product) => total + product.price, 0)
      .toFixed(2);
  };

  return (
    <div className="order-form">
      <h2>Place Your Order</h2>
      
      {error && <div className="form-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="customerName">Your Name:</label>
          <input
            type="text"
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Select Products:</label>
          <div className="product-selection">
            {products.map(product => (
              <div key={product.id} className="product-item">
                <input
                  type="checkbox"
                  id={`product-${product.id}`}
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleProductSelection(product.id)}
                />
                <label htmlFor={`product-${product.id}`}>
                  {product.name} - ${product.price.toFixed(2)}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="selected-products">
            {selectedProducts.length === 0 ? (
              <p>No products selected</p>
            ) : (
              <ul>
                {products
                  .filter(product => selectedProducts.includes(product.id))
                  .map(product => (
                    <li key={product.id}>
                      {product.name} - ${product.price.toFixed(2)}
                    </li>
                  ))
                }
              </ul>
            )}
          </div>
          <div className="order-total">
            <strong>Total: ${calculateTotal()}</strong>
          </div>
        </div>
        
        <div className="action-buttons">
          <button type="button" className="secondary-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="primary-btn">
            Submit Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;