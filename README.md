# Job-Hire Frontend

Next.js frontend application for the Job-Hire platform.

## 🚀 Quick Start

### Using Docker (Recommended)

1. Start all services (backend, frontend, database):
   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8002
   - API Docs: http://localhost:8002/docs

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

   Or run both frontend and backend:
   ```bash
   npm run dev:all
   ```

## 📚 Documentation

- [DOCKER_QUICK_START.md](./DOCKER_QUICK_START.md) - Quick Docker setup
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Complete Docker guide
- [QUICK_START.md](./QUICK_START.md) - Local development quick start
- [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md) - Detailed development guide

## 🛠️ Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- NextAuth.js
- TanStack Query

## 📝 License

Private project - All rights reserved
# job-hire-frontend
