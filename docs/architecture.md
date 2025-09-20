# System Architecture

Chelal HMS is a full-stack hospital management system with multiple frontend implementations and a Django backend. The architecture is modular and supports microservices principles.

## Components
- **Frontend**: Vue.js (primary), React/Next.js (alternative)
- **Backend**: Django REST API
- **Database**: PostgreSQL
- **Cache/Queue**: Redis (Celery tasks)
- **Real-time**: WebSockets (Channels)
- **Containerization**: Docker Compose

## Data Flow
- Frontend communicates with backend via REST API and WebSockets.
- Backend handles authentication, business logic, and database operations.
- Celery and Redis manage background tasks and notifications.
