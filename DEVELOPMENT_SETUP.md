# Job-Hire Development Setup Guide

This guide will help you set up and run both the frontend and backend together for local development.

## Prerequisites

- **Node.js** (v18 or higher) and npm
- **Python** (3.8 or higher) and pip
- **PostgreSQL** (for the backend database)
- **Git**

## Quick Start

### Option 1: Using the Convenience Script (Recommended)

#### macOS/Linux:
```bash
chmod +x run-dev.sh
./run-dev.sh
```

#### Windows:
```bash
run-dev.bat
```

### Option 2: Using npm Script

```bash
npm install
npm run dev:all
```

### Option 3: Manual Setup

#### Step 1: Backend Setup

1. Navigate to the backend directory:
```bash
cd ../must-hire-backend
```

2. Create a Python virtual environment:
```bash
python3 -m venv .venv
# On Windows: python -m venv .venv
```

3. Activate the virtual environment:
```bash
source .venv/bin/activate
# On Windows: .venv\Scripts\activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file (copy from `.env.example` if available):
```bash
cp .env.example .env
# Edit .env with your configuration
```

6. Set up your PostgreSQL database and update the `.env` file with:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`

7. Run the backend:
```bash
python -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8002
```

The backend will be available at: **http://localhost:8002**
API documentation: **http://localhost:8002/docs**

#### Step 2: Frontend Setup

1. Navigate to the frontend directory:
```bash
cd must-hire-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_API_URL=http://localhost:8002
AUTH_URL=http://localhost:3000
AUTH_SECRET=your-secret-key-here
```

5. Run the frontend:
```bash
npm run dev
```

The frontend will be available at: **http://localhost:3000**

## Environment Variables

### Frontend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Frontend application URL | `http://localhost:3000` |
| `NEXT_PUBLIC_BASE_API_URL` | Backend API base URL | `http://localhost:8002` |
| `AUTH_URL` | Authentication URL | `http://localhost:3000` |
| `AUTH_SECRET` | NextAuth secret key | Required |

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_PORT` | Backend server port | `8002` |
| `BASE_URL` | Backend base URL | `http://localhost:8002` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | Database user | Required |
| `DB_PASSWORD` | Database password | Required |
| `DB_NAME` | Database name | `mh_db` |
| `SECRET_KEY` | Application secret key | Required |
| `EMAIL_USER` | Email service user | Required |
| `EMAIL_PASSWORD` | Email service password | Required |
| `GOOGLE_API_KEY` | Google AI API key | Required |
| `AWS_ACCESS_KEY` | AWS access key | Required |
| `AWS_SECRET_KEY` | AWS secret key | Required |
| `S3_BUCKET_NAME` | S3 bucket name | Required |

## Available Scripts

### Frontend

- `npm run dev` - Run frontend only
- `npm run dev:all` - Run both frontend and backend
- `npm run dev:backend` - Run backend only (from frontend directory)
- `npm run dev:frontend` - Run frontend only
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Testing the Integration

1. **Backend Health Check**: Visit http://localhost:8002/docs to see the API documentation
2. **Frontend**: Visit http://localhost:3000 to access the application
3. **API Connection**: The frontend should automatically connect to the backend at `http://localhost:8002`

## Troubleshooting

### Backend won't start

1. **Check Python version**: `python --version` (should be 3.8+)
2. **Check virtual environment**: Make sure it's activated
3. **Check dependencies**: `pip install -r requirements.txt`
4. **Check database**: Ensure PostgreSQL is running and credentials are correct
5. **Check port**: Make sure port 8002 is not in use

### Frontend won't connect to backend

1. **Check environment variables**: Ensure `NEXT_PUBLIC_BASE_API_URL=http://localhost:8002`
2. **Check backend is running**: Visit http://localhost:8002/docs
3. **Check CORS**: Backend should allow `http://localhost:3000` in CORS settings
4. **Check browser console**: Look for CORS or connection errors

### Port already in use

- **Backend (8002)**: Change `APP_PORT` in backend `.env` or kill the process using the port
- **Frontend (3000)**: Next.js will automatically use the next available port, or specify with `npm run dev -- -p 3001`

## Database Setup

1. Install PostgreSQL if not already installed
2. Create a database:
```sql
CREATE DATABASE mh_db;
```
3. Update the backend `.env` file with your database credentials
4. Run migrations if available:
```bash
cd ../must-hire-backend
python -m api.db.create_tables
```

## Development Tips

- **Hot Reload**: Both frontend and backend support hot reload during development
- **API Testing**: Use the Swagger UI at http://localhost:8002/docs to test API endpoints
- **Logs**: Check terminal output for both services to debug issues
- **Environment**: Always use `.env` files for local development, never commit them

## Next Steps

1. Set up your database and run migrations
2. Configure email service for authentication
3. Set up AWS credentials for S3 file uploads
4. Configure Google AI API for AI features
5. Start developing! 🚀

## Support

If you encounter any issues, check:
- Backend logs in the terminal
- Frontend console in the browser
- Network tab in browser DevTools
- Backend API documentation at `/docs`

