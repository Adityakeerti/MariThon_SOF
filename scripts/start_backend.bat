@echo off
echo Starting MariThon Backend Server...
cd /d "F:\CODING\MariThon\backend"
call backend_venv\Scripts\Activate.bat
echo Backend virtual environment activated
echo Starting FastAPI server on http://localhost:8000
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause
