import os
import time
import json
import logging
import psycopg2
import pika
import random

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database connection
def get_db_connection():
    conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
    conn.autocommit = True
    return conn

# Process an order
def process_order(order_id):
    logger.info(f"Processing order {order_id}")
    
    # Simulate processing time
    processing_time = random.randint(5, 15)
    logger.info(f"Order {order_id} will take {processing_time} seconds to process")
    
    # Update status to "processing"
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute(
            'UPDATE orders SET status = %s WHERE id = %s',
            ('processing', order_id)
        )
    conn.close()
    
    # Simulate work
    time.sleep(processing_time)
    
    # Update status to "completed"
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute(
            'UPDATE orders SET status = %s WHERE id = %s',
            ('completed', order_id)
        )
    conn.close()
    
    logger.info(f"Order {order_id} has been completed")

# RabbitMQ message callback
def callback(ch, method, properties, body):
    try:
        data = json.loads(body)
        order_id = data.get('order_id')
        
        if not order_id:
            logger.error("Received message without order_id")
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return
            
        process_order(order_id)
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except Exception as e:
        logger.error(f"Error processing message: {e}")
        # Requeue the message in case of error
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

def main():
    # Connect to RabbitMQ
    connection = None
    
    while connection is None:
        try:
            logger.info("Attempting to connect to RabbitMQ...")
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(host=os.environ.get('RABBITMQ_HOST', 'rabbitmq'), heartbeat=600)
            )
        except pika.exceptions.AMQPConnectionError:
            logger.info("RabbitMQ not available yet, retrying in 5 seconds...")
            time.sleep(5)
    
    channel = connection.channel()
    channel.queue_declare(queue='orders')
    
    # Set up consumer
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue='orders', on_message_callback=callback)
    
    logger.info("Worker started. Waiting for messages...")
    channel.start_consuming()

if __name__ == '__main__':
    main()