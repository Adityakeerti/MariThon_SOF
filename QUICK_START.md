# MariThon - Quick Start Guide

> **⚠️ IMPORTANT**: This project requires specific setup due to missing ML dependencies. The automated setup scripts may fail without proper dependency installation. Please read [SETUP_GUIDE.md](SETUP_GUIDE.md) first.

## 🚀 One-Command Setup (Windows)

```bash
# Run the automated setup script
setup.bat
```

## 🚀 One-Command Setup (macOS/Linux)

```bash
# Make script executable and run
chmod +x setup.sh && ./setup.sh
```

## ⚡ Quick Commands

### Backend
```bash
cd backend
venv\Scripts\Activate.ps1          # Windows PowerShell
# venv\Scripts\Activate.bat       # Windows CMD
# source venv/bin/activate        # macOS/Linux

uvicorn app.main:app --app-dir backend --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd marithon_frontend
python -m http.server 8080         # Windows
# python3 -m http.server 8080     # macOS/Linux
```

## 🌐 Access URLs
- **Frontend**: `http://localhost:8080`
- **Backend**: `http://localhost:8000`
- **API Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

## 📁 Project Structure
```
MariThon/
├── backend/venv/          # Backend virtual environment
├── .venv/                 # Main virtual environment
├── marithon_frontend/     # Frontend files
├── setup.bat              # Windows setup script
├── setup.sh               # Unix setup script
├── requirements.txt       # Main dependencies
└── backend/requirements.txt # Backend dependencies
```

## 🔧 Troubleshooting
- **Port in use**: Change port numbers or kill process
- **Virtual env not active**: Look for `(venv)` or `(.venv)` in prompt
- **Dependencies fail**: Upgrade pip first, then retry
- **ML imports fail**: PyTorch and transformers may not be installed - see [SETUP_GUIDE.md](SETUP_GUIDE.md)

---
**Full guide**: See `HOW_TO_RUN_LOCALLY.md` for detailed instructions

**🚨 Critical**: If you encounter import errors for PyTorch, sentence-transformers, or other ML libraries, the automated setup failed. Please follow the [SETUP_GUIDE.md](SETUP_GUIDE.md) for manual dependency installation.
