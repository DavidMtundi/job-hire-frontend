@echo off
REM Script to run both backend and frontend together (Windows)
REM Usage: run-dev.bat

echo 🚀 Starting Must-Hire Development Environment
echo.

REM Check if .env file exists for frontend
if not exist .env (
    echo ⚠️  Frontend .env file not found. Creating from .env.example...
    if exist .env.example (
        copy .env.example .env
        echo ✅ Created .env file. Please update it with your configuration.
    ) else (
        echo ⚠️  .env.example not found. Please create .env manually.
    )
    echo.
)

REM Check if backend .env file exists
set BACKEND_DIR=..\must-hire-backend
if not exist "%BACKEND_DIR%\.env" (
    echo ⚠️  Backend .env file not found. Creating from .env.example...
    if exist "%BACKEND_DIR%\.env.example" (
        copy "%BACKEND_DIR%\.env.example" "%BACKEND_DIR%\.env"
        echo ✅ Created backend .env file. Please update it with your configuration.
    ) else (
        echo ⚠️  Backend .env.example not found. Please create .env manually.
    )
    echo.
)

REM Check if Python virtual environment exists for backend
if not exist "%BACKEND_DIR%\.venv" (
    echo ⚠️  Backend virtual environment not found. Creating...
    cd %BACKEND_DIR%
    python -m venv .venv
    echo ✅ Created virtual environment.
    echo Installing backend dependencies...
    call .venv\Scripts\activate.bat
    pip install -r requirements.txt
    cd ..
    echo ✅ Backend dependencies installed.
    echo.
)

REM Check if node_modules exists for frontend
if not exist "node_modules" (
    echo ⚠️  Frontend node_modules not found. Installing dependencies...
    call npm install
    echo ✅ Frontend dependencies installed.
    echo.
)

echo ✅ All checks passed!
echo.
echo Starting both services...
echo.
echo Backend will run on: http://localhost:8002
echo Frontend will run on: http://localhost:3000
echo Backend API docs: http://localhost:8002/docs
echo.

REM Run both services using npm script
call npm run dev:all

