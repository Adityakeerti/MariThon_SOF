#!/bin/bash

echo "========================================"
echo "MariThon Project Setup Script"
echo "========================================"
echo

echo "Setting up Backend Virtual Environment..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating backend virtual environment..."
    python3 -m venv venv
else
    echo "Backend virtual environment already exists."
fi

echo "Activating backend virtual environment..."
source venv/bin/activate

echo "Installing backend dependencies..."
pip install -r requirements.txt

echo
echo "Backend setup complete!"
echo

echo "Setting up Main Directory Virtual Environment..."
cd ..
if [ ! -d ".venv" ]; then
    echo "Creating main virtual environment..."
    python3 -m venv .venv
else
    echo "Main virtual environment already exists."
fi

echo "Activating main virtual environment..."
source .venv/bin/activate

echo "Installing main directory dependencies..."
pip install -r requirements.txt

echo
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo
echo "To start the backend server:"
echo "1. cd backend"
echo "2. source venv/bin/activate"
echo "3. uvicorn app.main:app --app-dir backend --reload --host 0.0.0.0 --port 8000"
echo
echo "To open the frontend:"
echo "Open marithon_frontend/index.html in your browser"
echo
echo "Or serve with Python:"
echo "cd marithon_frontend && python3 -m http.server 8080"
echo
