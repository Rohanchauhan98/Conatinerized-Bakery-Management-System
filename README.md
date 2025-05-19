# Dockerized Bakery Management System

This project implements a containerized bakery management system using Docker. The system consists of multiple services working together to provide a complete solution for bakery operations.

## System Architecture Overview

The system consists of the following containerized components:

1. **PostgreSQL Database**: Stores all bakery data including products, orders, and customer information
2. **Backend API Service**: Python-based REST API that handles business logic and database operations
3. **Frontend Application**: React-based web interface for user interaction
4. **RabbitMQ Message Queue**: Handles asynchronous processing of orders
5. **Worker Service**: Processes orders from the message queue
6. **Redis Cache**: Improves performance by caching frequently accessed product data

### Architecture Diagram

```
                   +-------------+
                   |   Frontend  |
                   +------+------+
                          |
                          v
                  +-------+-------+
                  |  Backend API  |
                  +-------+-------+
                          |
          +---------------+---------------+
          |               |               |
          v               v               v
+------------------+ +----------+ +----------------+
| PostgreSQL DB    | | RabbitMQ | | Redis Cache    |
+------------------+ +-----+----+ +----------------+
                          |
                          v
                   +------+------+
                   |    Worker   |
                   +-------------+
```

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed on your machine
- Git for cloning the repository

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bakery-management-system.git
cd bakery-management-system
```

2. Start the containers:
```bash
docker-compose up -d
```

3. Initialize the database with sample data:
```bash
docker-compose exec backend python init_db.py
```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api/docs

### Environment Variables

The system uses the following environment variables that can be modified in the `.env` file:

```
# Database
POSTGRES_USER=bakery_admin
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=bakery_db

# Backend
DATABASE_URL=postgresql://bakery_admin:secure_password@db:5432/bakery_db
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
REDIS_URL=redis://redis:6379/0

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

## API Documentation

The backend API provides the following endpoints:

### Products API

#### GET /api/products
- Returns a list of all bakery products
- Parameters:
  - `category` (optional): Filter products by category
  - `page` (optional): Page number for pagination
  - `limit` (optional): Number of items per page

#### GET /api/products/{id}
- Returns details of a specific product
- Parameters:
  - `id`: Product ID

### Orders API

#### POST /api/orders
- Places a new order
- Request Body:
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 3,
      "quantity": 1
    }
  ],
  "delivery_address": "123 Baker Street"
}
```

#### GET /api/orders/{id}
- Returns the status of a specific order
- Parameters:
  - `id`: Order ID

## Container Details

### Database Container
- PostgreSQL 14
- Persistent volume for data storage
- Custom initialization scripts

### Backend Service
- Python Flask API
- SQLAlchemy ORM
- Pika for RabbitMQ integration
- Redis for caching

### Frontend Service
- React.js
- Axios for API communication
- Bootstrap for styling

### RabbitMQ Container
- Message queue for order processing
- Management plugin enabled

### Worker Service
- Python-based worker
- Processes orders from RabbitMQ
- Sends notifications

### Redis Cache
- Caches product listings
- Improves API response time

## Advanced Features

### Redis Caching
The system implements Redis caching for product listings, which:
- Reduces database load
- Improves response times
- Automatically invalidates cache when products are updated

### Order Processing Worker
The worker service:
- Consumes messages from RabbitMQ
- Processes orders asynchronously
- Updates order status
- Sends email notifications

## Development and Testing

### Local Development
To run the system in development mode with hot reloading:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Running Tests
To run the test suite:

```bash
docker-compose -f docker-compose.yml -f docker-compose.test.yml up
```

## Design Decisions

### Containerization Strategy
- Each service is containerized separately to maintain isolation
- Docker Compose is used for orchestration to simplify deployment
- Volumes are used for persistent data storage

### Database Design
- PostgreSQL was chosen for its robustness and transaction support
- Database schema is designed to handle products, orders, and customers
- Indexes are created for frequently queried fields

### API Design
- RESTful API design principles are followed
- JSON is used for data interchange
- API versioning is implemented for future compatibility

### Message Queue Implementation
- RabbitMQ is used for reliable asynchronous processing
- Direct exchange pattern is implemented for order processing
- Dead letter queues are configured for failed messages

### Caching Strategy
- Redis is used for caching frequently accessed data
- Time-based expiration is configured for cached items
- Cache invalidation is triggered on data updates

## Troubleshooting

### Common Issues

1. **Containers not starting properly**
   - Check docker-compose logs: `docker-compose logs`
   - Ensure all required ports are available

2. **Database connection issues**
   - Verify environment variables are set correctly
   - Check if the database container is running: `docker ps`

3. **API returning errors**
   - Check backend logs: `docker-compose logs backend`
   - Verify database migrations have run successfully

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Your Name

## Acknowledgments

- Docker documentation
- PostgreSQL documentation
- Flask documentation
- React documentation
