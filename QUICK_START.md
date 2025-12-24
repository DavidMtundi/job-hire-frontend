# Quick Start Guide - Running Both Projects

## 🚀 Fastest Way to Get Started

### Step 1: Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd ../must-hire-backend
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ../must-hire-frontend
```

### Step 2: Set Up Environment Variables

**Frontend:** Create `.env` file in `must-hire-frontend/`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_API_URL=http://localhost:8002
AUTH_URL=http://localhost:3000
AUTH_SECRET=your-secret-key-change-this
```

**Backend:** Create `.env` file in `must-hire-backend/`:
```env
APP_PORT=8002
BASE_URL=http://localhost:8002
FRONTEND_URL=http://localhost:3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=mh_db
SECRET_KEY=your-secret-key-change-this
LOCAL=true
ENV=dev
```

### Step 3: Run Both Projects

**Option A: Using npm (Recommended)**
```bash
npm run dev:all
```

**Option B: Using the shell script (macOS/Linux)**
```bash
chmod +x run-dev.sh
./run-dev.sh
```

**Option C: Using the batch file (Windows)**
```bash
run-dev.bat
```

## 📍 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8002
- **API Docs**: http://localhost:8002/docs

## ✅ Verify It's Working

1. Check backend: Open http://localhost:8002/docs - you should see Swagger UI
2. Check frontend: Open http://localhost:3000 - you should see the app
3. Test connection: Try logging in or making an API call from the frontend

## 🐛 Troubleshooting

**Backend not starting?**
- Make sure Python virtual environment is activated
- Check if port 8002 is available: `lsof -i :8002` (macOS/Linux) or `netstat -ano | findstr :8002` (Windows)
- Verify database is running and credentials are correct

**Frontend can't connect to backend?**
- Verify `NEXT_PUBLIC_BASE_API_URL=http://localhost:8002` in frontend `.env`
- Check browser console for CORS errors
- Make sure backend is running first

**Port conflicts?**
- Backend: Change `APP_PORT` in backend `.env`
- Frontend: Next.js will auto-use next available port, or use `npm run dev -- -p 3001`

For more details, see [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)

