# 🚀 Start Here - Docker Setup

## Quick Start (3 Steps)

### 1. Make sure Docker is running
```bash
docker --version
docker compose version
```

### 2. Start everything
```bash
cd /Users/davidmtundi/projects/must-hire-frontend
docker compose -f docker-compose.dev.yml up --build
```

### 3. Open in browser
- **Frontend**: http://localhost:3000
- **Backend API Docs**: http://localhost:8002/docs

That's it! 🎉

## What You Get

✅ **Backend (FastAPI)** running on port 8002
✅ **Frontend (Next.js)** running on port 3000  
✅ **PostgreSQL Database** running on port 5432
✅ **Hot reload** enabled for both services
✅ **Automatic connection** - frontend connects to backend automatically

## Verify Connection

After starting, test the connection:

```bash
# Run the test script
./test-docker-connection.sh

# Or manually test
curl http://localhost:8002/docs  # Should return HTML
curl http://localhost:3000        # Should return HTML
```

## Common Commands

```bash
# Stop everything
docker compose -f docker-compose.dev.yml down

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Restart
docker compose -f docker-compose.dev.yml restart

# Check status
docker compose -f docker-compose.dev.yml ps
```

## Using Make (Optional)

If you have `make` installed:

```bash
make docker-up      # Start everything
make docker-down    # Stop everything
make docker-logs     # View logs
make help           # See all commands
```

## Troubleshooting

**Ports already in use?**
```bash
# Stop existing containers
docker compose -f docker-compose.dev.yml down

# Or check what's using the ports
lsof -i :3000
lsof -i :8002
```

**Need to rebuild?**
```bash
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up
```

**Check container logs**
```bash
docker compose -f docker-compose.dev.yml logs backend
docker compose -f docker-compose.dev.yml logs frontend
```

## Next Steps

1. ✅ Start the services (see above)
2. ✅ Open http://localhost:3000
3. ✅ Test API calls from the frontend
4. ✅ View API documentation at http://localhost:8002/docs

## More Information

- **Quick Docker Guide**: [DOCKER_QUICK_START.md](./DOCKER_QUICK_START.md)
- **Complete Docker Guide**: [DOCKER_SETUP.md](./DOCKER_SETUP.md)
- **Local Development**: [QUICK_START.md](./QUICK_START.md)

---

**Note**: The frontend is configured to connect to `http://localhost:8002` for the backend API. This works because:
- From the browser's perspective, `localhost:8002` is the backend
- Docker maps the backend container's port 8002 to your host's port 8002
- The frontend container and backend container are on the same Docker network for internal communication

