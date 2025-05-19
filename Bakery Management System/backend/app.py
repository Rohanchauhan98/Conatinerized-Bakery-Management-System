import os
import json
import psycopg2
import pika
import redis
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Database connection
def get_db_connection():
    conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
    conn.autocommit = True
    return conn

# Redis connection for caching
redis_client = redis.Redis(host=os.environ.get('REDIS_HOST', 'redis'), port=6379, db=0)

# RabbitMQ connection for order processing
def get_rabbitmq_connection():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=os.environ.get('RABBITMQ_HOST', 'rabbitmq'))
    )
    return connection

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    # Check database connection
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute('SELECT 1')
        conn.close()
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    # Check Redis connection
    try:
        redis_status = "healthy" if redis_client.ping() else "unhealthy"
    except Exception as e:
        redis_status = f"unhealthy: {str(e)}"
    
    # Check RabbitMQ connection
    try:
        connection = get_rabbitmq_connection()
        connection.close()
        rabbitmq_status = "healthy"
    except Exception as e:
        rabbitmq_status = f"unhealthy: {str(e)}"
    
    status = {
        "status": "healthy" if all(s == "healthy" for s in [db_status, redis_status, rabbitmq_status]) else "unhealthy",
        "database": db_status,
        "redis": redis_status,
        "rabbitmq": rabbitmq_status
    }
    
    return jsonify(status)

# API 1: List all bakery products
@app.route('/api/products', methods=['GET'])
def get_products():
    # Try to get from cache first
    cached_products = redis_client.get('products')
    if cached_products:
        app.logger.info("Products returned from cache")
        return jsonify(json.loads(cached_products))
    
    # If not in cache, get from database
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute('SELECT id, name, description, price, category FROM products')
        products = [
            {
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'price': float(row[3]),
                'category': row[4]
            }
            for row in cur.fetchall()
        ]
    conn.close()
    
    # Store in cache for 5 minutes
    redis_client.setex('products', 300, json.dumps(products))
    
    return jsonify(products)

# API 2: Place an order
@app.route('/api/orders', methods=['POST'])
def place_order():
    data = request.json
    customer_name = data.get('customer_name')
    product_ids = data.get('product_ids', [])
    
    if not customer_name or not product_ids:
        return jsonify({"error": "Invalid order data"}), 400
    
    # Save order to database
    conn = get_db_connection()
    with conn.cursor() as cur:
        # Create order
        cur.execute(
            'INSERT INTO orders (customer_name, status) VALUES (%s, %s) RETURNING id',
            (customer_name, 'pending')
        )
        order_id = cur.fetchone()[0]
        
        # Add order items
        for product_id in product_ids:
            cur.execute(
                'INSERT INTO order_items (order_id, product_id) VALUES (%s, %s)',
                (order_id, product_id)
            )
    conn.close()
    
    # Send to RabbitMQ for processing
    connection = get_rabbitmq_connection()
    channel = connection.channel()
    channel.queue_declare(queue='orders')
    channel.basic_publish(
        exchange='',
        routing_key='orders',
        body=json.dumps({'order_id': order_id})
    )
    connection.close()
    
    return jsonify({"order_id": order_id, "status": "pending"})

# API 3: Check order status
@app.route('/api/orders/<int:order_id>', methods=['GET'])
def check_order_status(order_id):
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute('SELECT id, customer_name, status, created_at FROM orders WHERE id = %s', (order_id,))
        order = cur.fetchone()
        
        if not order:
            conn.close()
            return jsonify({"error": "Order not found"}), 404
        
        order_data = {
            'id': order[0],
            'customer_name': order[1],
            'status': order[2],
            'created_at': order[3].isoformat() if order[3] else None
        }
        
        # Get order items
        cur.execute('''
            SELECT p.id, p.name, p.price
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = %s
        ''', (order_id,))
        
        order_data['items'] = [
            {
                'product_id': row[0],
                'product_name': row[1],
                'price': float(row[2])
            }
            for row in cur.fetchall()
        ]
        
        # Calculate total
        order_data['total'] = sum(item['price'] for item in order_data['items'])
    
    conn.close()
    return jsonify(order_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)