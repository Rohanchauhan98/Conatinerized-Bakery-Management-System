-- Create tables
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample products
INSERT INTO products (name, description, price, category) VALUES
('Sourdough Bread', 'Traditional sourdough bread made with our special starter', 5.99, 'Bread'),
('Chocolate Croissant', 'Buttery croissant filled with rich chocolate', 3.99, 'Pastry'),
('Blueberry Muffin', 'Moist muffin loaded with fresh blueberries', 2.99, 'Muffin'),
('Baguette', 'Authentic French baguette with crispy crust', 4.50, 'Bread'),
('Cinnamon Roll', 'Sweet roll with cinnamon, topped with cream cheese frosting', 3.50, 'Pastry'),
('Apple Pie', 'Traditional apple pie with flaky crust', 15.99, 'Pie'),
('Chocolate Chip Cookie', 'Classic cookie with semi-sweet chocolate chips', 1.99, 'Cookie'),
('Red Velvet Cake', 'Smooth red velvet cake with cream cheese frosting', 24.99, 'Cake'),
('Carrot Cake', 'Spiced carrot cake with walnuts and cream cheese frosting', 22.99, 'Cake'),
('Cheesecake', 'Creamy New York style cheesecake', 18.99, 'Cake');

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating timestamps
CREATE TRIGGER update_orders_modtime
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();