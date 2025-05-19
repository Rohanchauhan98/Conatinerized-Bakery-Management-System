import React from 'react';
import './ProductList.css';

const ProductList = ({ products, onOrderClick, loading }) => {
  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="product-list">
      <h2>Our Products</h2>
      
      <div className="category-filters">
        <button className="filter-btn active">All</button>
        <button className="filter-btn">Bread</button>
        <button className="filter-btn">Pastry</button>
        <button className="filter-btn">Cake</button>
        <button className="filter-btn">Cookie</button>
      </div>
      
      <div className="products-grid">
        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {/* Placeholder for product image */}
                <div className="image-placeholder"></div>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                  <span className="product-price">${product.price.toFixed(2)}</span>
                  <span className="product-category">{product.category}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="action-buttons">
        <button className="primary-btn" onClick={onOrderClick}>Place an Order</button>
      </div>
    </div>
  );
};

export default ProductList;