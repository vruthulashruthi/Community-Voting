@echo off
REM Requirement-aligned setup script for Community Digital Voting System
setlocal
cd /d "%~dp0"

echo Setting up backend...
if not exist env (
    py -3.11 -m venv env
)
call env\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
alembic upgrade head

echo Setting up frontend...
cd frontend
call npm install
cd ..

echo Setup complete.
