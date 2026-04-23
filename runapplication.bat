@echo off
REM Requirement-aligned run script for Community Digital Voting System
setlocal
cd /d "%~dp0"

echo Starting backend...
start "voting-backend" cmd /k "call env\Scripts\activate && cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo Starting frontend...
start "voting-frontend" cmd /k "cd frontend && npm run dev -- --host 0.0.0.0 --port 5173"

echo Application started.
echo Backend docs: http://localhost:8000/docs
echo Frontend:     http://localhost:5173
