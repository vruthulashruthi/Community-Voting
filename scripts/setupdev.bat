@echo off
REM ===========================================================
REM  Community Voting System - Development Environment Setup
REM ===========================================================
setlocal
cd /d "%~dp0\.."

echo.
echo [1/4] Creating Python virtual environment...
if not exist venv (
    python -m venv venv
)

echo.
echo [2/4] Installing backend Python dependencies...
call venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt

echo.
echo [3/4] Running Alembic migrations...
alembic upgrade head

echo.
echo [4/4] Installing frontend dependencies (npm)...
cd frontend
call npm install
cd ..

echo.
echo =========================================
echo  Setup complete.
echo  Run scripts\runapplication.bat to start.
echo =========================================
pause
