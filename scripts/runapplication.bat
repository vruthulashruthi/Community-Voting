@echo off
REM ===========================================================
REM  Community Voting System - Run backend + frontend
REM ===========================================================
setlocal
cd /d "%~dp0\.."

echo Starting backend (FastAPI) on http://localhost:8000 ...
start "voting-backend" cmd /k "call venv\Scripts\activate && cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo Starting frontend (React) on http://localhost:5173 ...
start "voting-frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers launched in separate windows.
echo  Backend docs: http://localhost:8000/docs
echo  Frontend:     http://localhost:5173
pause
