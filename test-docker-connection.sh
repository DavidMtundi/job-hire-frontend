#!/bin/bash

# Script to test Docker container connectivity
# Usage: ./test-docker-connection.sh

set -e

echo "🧪 Testing Docker Container Connectivity"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test Backend
echo "1️⃣  Testing Backend (http://localhost:8002)..."
if curl -s -f http://localhost:8002/docs > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running!${NC}"
    echo "   📚 API Docs: http://localhost:8002/docs"
else
    echo -e "${RED}❌ Backend is not accessible${NC}"
    echo "   Make sure backend container is running:"
    echo "   docker compose -f docker-compose.dev.yml ps backend"
fi
echo ""

# Test Frontend
echo "2️⃣  Testing Frontend (http://localhost:3000)..."
if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running!${NC}"
    echo "   🌐 App: http://localhost:3000"
else
    echo -e "${RED}❌ Frontend is not accessible${NC}"
    echo "   Make sure frontend container is running:"
    echo "   docker compose -f docker-compose.dev.yml ps frontend"
fi
echo ""

# Test Database
echo "3️⃣  Testing Database connection..."
if docker compose -f docker-compose.dev.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database is running!${NC}"
else
    echo -e "${RED}❌ Database is not accessible${NC}"
    echo "   Make sure database container is running:"
    echo "   docker compose -f docker-compose.dev.yml ps postgres"
fi
echo ""

# Test Backend API endpoint
echo "4️⃣  Testing Backend API endpoint..."
if curl -s -f http://localhost:8002/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API is responding!${NC}"
else
    echo -e "${YELLOW}⚠️  Backend API root endpoint not accessible (this might be normal)${NC}"
fi
echo ""

# Test container-to-container connectivity
echo "5️⃣  Testing container-to-container connectivity..."
if docker compose -f docker-compose.dev.yml exec -T frontend ping -c 1 backend > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend can reach backend container!${NC}"
else
    echo -e "${YELLOW}⚠️  Container connectivity test failed (containers might not be running)${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo "📊 Summary"
echo "=========================================="
echo ""
echo "If all tests passed, you can:"
echo "  • Open http://localhost:3000 in your browser"
echo "  • View API docs at http://localhost:8002/docs"
echo "  • Test API calls from the frontend"
echo ""
echo "To view logs:"
echo "  docker compose -f docker-compose.dev.yml logs -f"
echo ""

