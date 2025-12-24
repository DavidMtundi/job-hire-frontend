# Docker Setup Guide

This guide will help you run both the frontend and backend in Docker containers.

## Prerequisites

- **Docker** (v20.10 or higher)
- **Docker Compose** (v2.0 or higher)

Verify installation:
```bash
docker --version
docker compose version
```

## Quick Start

### Development Mode (Recommended for Testing)

```bash
# Start all services (backend, frontend, and database)
docker compose -f docker-compose.dev.yml up --build

# Or run in detached mode (background)
docker compose -f docker-compose.dev.yml up -d --build
```

This will:
- Build and start the backend on **http://localhost:8002**
- Build and start the frontend on **http://localhost:3000**
- Start PostgreSQL database on **localhost:5432**
- Enable hot reload for both services

### Production Mode

```bash
# Start all services in production mode
docker compose up --build

# Or run in detached mode
docker compose up -d --build
```

## Environment Variables

Create a `.env` file in the `must-hire-frontend` directory (or use environment variables):

```env
# Database Configuration
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=mh_db

# Security
SECRET_KEY=your-secret-key-here
LOCAL_SECRET_KEY=your-local-secret-key-here
AUTH_SECRET=your-auth-secret-here

# Optional: Email, AWS, Google AI (if needed)
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
GOOGLE_API_KEY=your-google-api-key
AWS_ACCESS_KEY=your-aws-access-key
AWS_SECRET_KEY=your-aws-secret-key
```

## Services

### Backend (FastAPI)
- **Container**: `must-hire-backend-dev` (dev) or `must-hire-backend` (prod)
- **Port**: 8002
- **URL**: http://localhost:8002
- **API Docs**: http://localhost:8002/docs
- **Health Check**: http://localhost:8002/docs

### Frontend (Next.js)
- **Container**: `must-hire-frontend-dev` (dev) or `must-hire-frontend` (prod)
- **Port**: 3000
- **URL**: http://localhost:3000

### Database (PostgreSQL)
- **Container**: `must-hire-postgres-dev` (dev) or `must-hire-postgres` (prod)
- **Port**: 5432
- **Database**: `mh_db` (default)
- **User**: `postgres` (default)
- **Password**: `postgres` (default)

## Useful Commands

### View Logs
```bash
# All services
docker compose -f docker-compose.dev.yml logs -f

# Specific service
docker compose -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.dev.yml logs -f frontend
docker compose -f docker-compose.dev.yml logs -f postgres
```

### Stop Services
```bash
# Stop all services
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes (⚠️ deletes database data)
docker compose -f docker-compose.dev.yml down -v
```

### Rebuild Services
```bash
# Rebuild specific service
docker compose -f docker-compose.dev.yml build backend
docker compose -f docker-compose.dev.yml build frontend

# Rebuild all services
docker compose -f docker-compose.dev.yml build --no-cache
```

### Execute Commands in Containers
```bash
# Backend shell
docker compose -f docker-compose.dev.yml exec backend sh

# Frontend shell
docker compose -f docker-compose.dev.yml exec frontend sh

# Database shell
docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d mh_db
```

### Check Service Status
```bash
# List running containers
docker compose -f docker-compose.dev.yml ps

# Check container health
docker ps
```

## Network Configuration

All services are connected via a Docker network called `must-hire-network`. Services can communicate using their service names:

- Frontend → Backend: `http://backend:8002`
- Backend → Database: `postgres:5432`

The frontend is configured to connect to the backend at `http://localhost:8002` (from the browser's perspective).

## Database Setup

### Initial Setup

The database is automatically created when the PostgreSQL container starts. To run migrations or create tables:

```bash
# Access backend container
docker compose -f docker-compose.dev.yml exec backend sh

# Run migrations (if available)
python -m api.db.create_tables
```

### Database Persistence

Database data is stored in a Docker volume (`postgres_data_dev` for dev, `postgres_data` for prod). This means data persists even when containers are stopped.

To reset the database:
```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d postgres
```

## Troubleshooting

### Port Already in Use

If you get an error about ports being in use:

```bash
# Check what's using the port
lsof -i :3000  # macOS/Linux
lsof -i :8002
lsof -i :5432

# Or on Windows
netstat -ano | findstr :3000
netstat -ano | findstr :8002
netstat -ano | findstr :5432
```

### Container Won't Start

1. **Check logs**:
   ```bash
   docker compose -f docker-compose.dev.yml logs backend
   docker compose -f docker-compose.dev.yml logs frontend
   ```

2. **Rebuild containers**:
   ```bash
   docker compose -f docker-compose.dev.yml build --no-cache
   docker compose -f docker-compose.dev.yml up
   ```

3. **Check Docker resources**:
   ```bash
   docker system df
   docker system prune  # Clean up unused resources
   ```

### Frontend Can't Connect to Backend

1. **Verify backend is running**:
   ```bash
   curl http://localhost:8002/docs
   ```

2. **Check network connectivity**:
   ```bash
   docker compose -f docker-compose.dev.yml exec frontend ping backend
   ```

3. **Verify environment variables**:
   ```bash
   docker compose -f docker-compose.dev.yml exec frontend env | grep API
   ```

### Database Connection Issues

1. **Check if database is healthy**:
   ```bash
   docker compose -f docker-compose.dev.yml ps postgres
   ```

2. **Check database logs**:
   ```bash
   docker compose -f docker-compose.dev.yml logs postgres
   ```

3. **Test connection**:
   ```bash
   docker compose -f docker-compose.dev.yml exec backend python -c "import psycopg2; psycopg2.connect(host='postgres', dbname='mh_db', user='postgres', password='postgres')"
   ```

## Development Workflow

### Hot Reload

Both services support hot reload in development mode:
- **Backend**: Changes to Python files trigger automatic reload
- **Frontend**: Changes to React/Next.js files trigger automatic refresh

### Making Changes

1. Edit files in your local directory
2. Changes are automatically synced to containers (via volumes)
3. Services automatically reload

### Adding Dependencies

**Backend:**
```bash
# Add to requirements.txt, then rebuild
docker compose -f docker-compose.dev.yml build backend
```

**Frontend:**
```bash
# Add to package.json, then rebuild
docker compose -f docker-compose.dev.yml build frontend
```

## Production Deployment

For production, use the production docker-compose file:

```bash
docker compose up -d --build
```

Make sure to:
1. Set proper environment variables
2. Use strong secrets
3. Configure proper CORS settings
4. Set up SSL/TLS
5. Configure proper database backups

## Clean Up

```bash
# Stop and remove containers
docker compose -f docker-compose.dev.yml down

# Remove containers, networks, and volumes
docker compose -f docker-compose.dev.yml down -v

# Remove all unused Docker resources
docker system prune -a
```

## Next Steps

1. **Set up your environment variables** in `.env` file
2. **Start the services**: `docker compose -f docker-compose.dev.yml up --build`
3. **Access the application**: http://localhost:3000
4. **Check API docs**: http://localhost:8002/docs
5. **Run database migrations** if needed

For more information, see the main [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md) guide.

