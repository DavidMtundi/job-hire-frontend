# Docker Quick Start 🐳

## Start Everything in One Command

```bash
# Development mode (with hot reload)
docker compose -f docker-compose.dev.yml up --build

# Or use Make (if available)
make docker-up
```

That's it! 🎉

## What Gets Started

- ✅ **Backend API**: http://localhost:8002
- ✅ **API Docs**: http://localhost:8002/docs
- ✅ **Frontend**: http://localhost:3000
- ✅ **Database**: PostgreSQL on localhost:5432

## Verify It's Working

1. **Backend**: Open http://localhost:8002/docs - you should see Swagger UI
2. **Frontend**: Open http://localhost:3000 - you should see the app
3. **Connection**: The frontend automatically connects to the backend!

## Common Commands

```bash
# Stop everything
docker compose -f docker-compose.dev.yml down

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Restart
docker compose -f docker-compose.dev.yml restart
```

## Environment Variables

Create a `.env` file (optional - defaults work for testing):

```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=mh_db
SECRET_KEY=dev-secret-key
AUTH_SECRET=dev-auth-secret
```

## Troubleshooting

**Ports in use?**
```bash
# Stop existing containers
docker compose -f docker-compose.dev.yml down

# Or change ports in docker-compose.dev.yml
```

**Need to rebuild?**
```bash
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up
```

**Check what's running:**
```bash
docker compose -f docker-compose.dev.yml ps
```

For more details, see [DOCKER_SETUP.md](./DOCKER_SETUP.md)

