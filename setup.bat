@echo off
echo ========================================
echo MariThon Project Setup Script
echo ========================================
echo.

echo Setting up Backend Virtual Environment...
cd backend
if not exist "venv" (
    echo Creating backend virtual environment...
    python -m venv venv
) else (
    echo Backend virtual environment already exists.
)

echo Activating backend virtual environment...
call venv\Scripts\Activate.bat

echo Installing backend dependencies...
pip install -r requirements.txt

echo.
echo Backend setup complete!
echo.

echo Setting up Main Directory Virtual Environment...
cd ..
if not exist ".venv" (
    echo Creating main virtual environment...
    python -m venv .venv
) else (
    echo Main virtual environment already exists.
)

echo Activating main virtual environment...
call .venv\Scripts\Activate.bat

echo Installing main directory dependencies...
pip install -r requirements.txt

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the backend server:
echo 1. cd backend
echo 2. venv\Scripts\Activate.bat
echo 3. uvicorn app.main:app --app-dir backend --reload --host 0.0.0.0 --port 8000
echo.
echo To open the frontend:
echo Open marithon_frontend/index.html in your browser
echo.
pause
