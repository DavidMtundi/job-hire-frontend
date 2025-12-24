# 🚀 Starting Docker Services - Step by Step

## Step 1: Start Docker Desktop

Make sure Docker Desktop is running on your Mac. If it's not:
1. Open Docker Desktop application
2. Wait for it to fully start (whale icon in menu bar should be steady)

## Step 2: Stop Conflicting Containers (if any)

If you have an existing backend container running on port 8002:

```bash
# Check what's running
docker ps

# Stop the existing backend container (if needed)
docker stop must-hire-api
# or
docker stop $(docker ps -q --filter "publish=8002")
```

## Step 3: Start All Services

```bash
cd /Users/davidmtundi/projects/must-hire-frontend
docker compose -f docker-compose.dev.yml up -d
```

This will:
- ✅ Start PostgreSQL database (internal only, no external port)
- ✅ Start Backend API on http://localhost:8002
- ✅ Start Frontend on http://localhost:3000

## Step 4: Check Status

```bash
# View running containers
docker compose -f docker-compose.dev.yml ps

# View logs
docker compose -f docker-compose.dev.yml logs -f
```

## Step 5: Access Your Application

Once containers are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8002
- **API Documentation**: http://localhost:8002/docs

## Troubleshooting

### Port 8002 already in use?

```bash
# Find what's using the port
lsof -i :8002

# Stop it (replace PID with actual process ID)
kill -9 <PID>

# Or stop the Docker container
docker stop must-hire-api
```

### Port 3000 already in use?

Next.js will automatically use the next available port, or you can change it in `docker-compose.dev.yml`.

### Docker daemon not running?

1. Open Docker Desktop
2. Wait for it to start completely
3. Try the command again

### Need to rebuild?

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

### View logs for debugging?

```bash
# All services
docker compose -f docker-compose.dev.yml logs -f

# Specific service
docker compose -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.dev.yml logs -f frontend
docker compose -f docker-compose.dev.yml logs -f postgres
```

## Quick Commands

```bash
# Start
docker compose -f docker-compose.dev.yml up -d

# Stop
docker compose -f docker-compose.dev.yml down

# Restart
docker compose -f docker-compose.dev.yml restart

# View status
docker compose -f docker-compose.dev.yml ps

# View logs
docker compose -f docker-compose.dev.yml logs -f
```

## What's Running?

After starting, you should see:
- `must-hire-postgres-dev` - Database
- `must-hire-backend-dev` - Backend API
- `must-hire-frontend-dev` - Frontend app

All services are connected via Docker network and can communicate with each other!

