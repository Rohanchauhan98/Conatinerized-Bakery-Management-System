import React, { useState, useEffect } from 'react';
import './App.css';
import ProductList from './components/ProductList';
import OrderForm from './components/orderform';
import OrderStatus from './components/OrderStatus';

function App() {
  const [view, setView] = useState('products');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch products: ${err.message}`);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (customerName, selectedProducts) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: customerName,
          product_ids: selectedProducts,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setOrderId(data.order_id);
      setView('orderStatus');
    } catch (err) {
      setError(`Failed to place order: ${err.message}`);
      console.error('Error placing order:', err);
    }
  };

  const renderView = () => {
    switch (view) {
      case 'products':
        return (
          <ProductList 
            products={products} 
            onOrderClick={() => setView('placeOrder')}
            loading={loading}
          />
        );
      case 'placeOrder':
        return (
          <OrderForm 
            products={products} 
            onSubmit={handlePlaceOrder}
            onCancel={() => setView('products')}
          />
        );
      case 'orderStatus':
        return (
          <OrderStatus 
            orderId={orderId}
            onBackToProducts={() => {
              setOrderId(null);
              setView('products');
            }}
          />
        );
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sweet Delights Bakery</h1>
        <nav>
          <button onClick={() => setView('products')}>Products</button>
          {orderId && (
            <button onClick={() => setView('orderStatus')}>View Order #{orderId}</button>
          )}
        </nav>
      </header>
      
      {error && <div className="error-message">{error}</div>}
      
      <main>
        {renderView()}
      </main>
      
      <footer>
        <p>&copy; 2025 Sweet Delights Bakery. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;