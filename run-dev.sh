#!/bin/bash

# Script to run both backend and frontend together
# Usage: ./run-dev.sh

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Must-Hire Development Environment${NC}\n"

# Check if .env file exists for frontend
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Frontend .env file not found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file. Please update it with your configuration.${NC}\n"
    else
        echo -e "${YELLOW}⚠️  .env.example not found. Please create .env manually.${NC}\n"
    fi
fi

# Check if backend .env file exists
BACKEND_DIR="../must-hire-backend"
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  Backend .env file not found. Creating from .env.example...${NC}"
    if [ -f "$BACKEND_DIR/.env.example" ]; then
        cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
        echo -e "${GREEN}✅ Created backend .env file. Please update it with your configuration.${NC}\n"
    else
        echo -e "${YELLOW}⚠️  Backend .env.example not found. Please create .env manually.${NC}\n"
    fi
fi

# Check if Python virtual environment exists for backend
if [ ! -d "$BACKEND_DIR/.venv" ]; then
    echo -e "${YELLOW}⚠️  Backend virtual environment not found. Creating...${NC}"
    cd "$BACKEND_DIR"
    python3 -m venv .venv
    echo -e "${GREEN}✅ Created virtual environment.${NC}"
    echo -e "${BLUE}Installing backend dependencies...${NC}"
    source .venv/bin/activate
    pip install -r requirements.txt
    cd - > /dev/null
    echo -e "${GREEN}✅ Backend dependencies installed.${NC}\n"
fi

# Check if node_modules exists for frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend node_modules not found. Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Frontend dependencies installed.${NC}\n"
fi

echo -e "${GREEN}✅ All checks passed!${NC}\n"
echo -e "${BLUE}Starting both services...${NC}\n"
echo -e "${YELLOW}Backend will run on: http://localhost:8002${NC}"
echo -e "${YELLOW}Frontend will run on: http://localhost:3000${NC}"
echo -e "${YELLOW}Backend API docs: http://localhost:8002/docs${NC}\n"

# Run both services using npm script
npm run dev:all

