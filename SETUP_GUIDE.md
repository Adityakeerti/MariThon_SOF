# MariThon Setup Guide

## ⚠️ Important: Missing Dependencies Issue

**The project was missing critical dependencies in the requirements files.** This has been fixed, but please follow this guide carefully to ensure all dependencies are properly installed.

## 🔍 What Was Missing

The original requirements files were missing essential libraries:
- **PyTorch** (`torch`) - Required for machine learning operations
- **Transformers** (`transformers`) - Required by sentence-transformers
- **NumPy & Pandas** - Data processing libraries
- **Scikit-learn & SciPy** - Additional ML dependencies

## 🛠️ Prerequisites

- **Python 3.8+** (Recommended: Python 3.11 or 3.12)
- **Git** for version control
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **At least 4GB RAM** (PyTorch and ML models can be memory-intensive)
- **Stable internet connection** (for downloading ML models on first run)

## 📦 Step-by-Step Installation

### 1. Clone and Navigate

```bash
git clone <your-repository-url>
cd MariThon
```

### 2. Backend Setup (CRITICAL)

The backend contains the main application logic and ML models.

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Upgrade pip to latest version
python -m pip install --upgrade pip

# Install dependencies (this will take several minutes)
pip install -r requirements.txt
```

**⚠️ Important Notes:**
- The first installation may take 10-20 minutes due to PyTorch and ML models
- PyTorch installation may fail on some systems - see troubleshooting below
- Ensure you have at least 2GB free disk space

### 3. Verify Installation

After installation, verify that PyTorch is working:

```bash
# Make sure you're in the backend directory with venv activated
python -c "import torch; print(f'PyTorch version: {torch.__version__}')"
python -c "import sentence_transformers; print('Sentence transformers installed successfully')"
```

### 4. Main Directory Setup (Optional)

```bash
# Return to main directory
cd ..

# Create main virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\Activate.ps1
# On macOS/Linux:
source .venv/bin/activate

# Install basic tools
pip install --upgrade pip setuptools wheel
```

## 🚀 Running the Application

### 1. Start the Backend Server

```bash
# Navigate to backend directory
cd backend

# Activate backend virtual environment
venv\Scripts\Activate.ps1  # Windows
# source venv/bin/activate  # macOS/Linux

# Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [XXXX] using StatReload
INFO:     Started server process [XXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 2. Open the Frontend

Open your web browser and navigate to:
- **Landing Page**: `marithon_frontend/index.html`
- **Dashboard**: `marithon_frontend/dashboard.html`
- **Calculator**: `marithon_frontend/calculate.html`

Or serve the frontend using a local server:

```bash
# Navigate to frontend directory
cd marithon_frontend

# Using Python's built-in server
python -m http.server 8080
```

## 🔧 Troubleshooting

### PyTorch Installation Issues

**Windows Users:**
```bash
# If PyTorch installation fails, try:
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

**macOS Users:**
```bash
# For Apple Silicon (M1/M2):
pip install torch torchvision torchaudio

# For Intel Macs:
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

**Linux Users:**
```bash
# If installation fails, try:
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

### Memory Issues

If you encounter memory errors:
1. Close other applications
2. Restart your computer
3. Ensure you have at least 4GB RAM available
4. Consider using CPU-only PyTorch (slower but less memory-intensive)

### Port Already in Use

```bash
# Change port number
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Virtual Environment Issues

```bash
# Delete and recreate virtual environment
rm -rf venv/  # Unix/Mac
# rmdir /s venv  # Windows

python -m venv venv
# Then follow activation and installation steps again
```

## 🧪 Testing the Installation

### 1. Backend Health Check

Once the server is running, test the API:

```bash
# In a new terminal (with venv activated)
curl http://localhost:8000/health
```

**Expected Response:**
```json
{"status": "healthy", "timestamp": "2024-01-01T12:00:00"}
```

### 2. Test ML Components

```bash
# Test PyTorch
python -c "import torch; print('PyTorch working')"

# Test sentence transformers
python -c "from sentence_transformers import SentenceTransformer; print('Sentence transformers working')"

# Test the classifier
python -c "from app.services.classify import EventClassifier; print('Classifier import successful')"
```

## 📚 Next Steps

1. **Upload a PDF**: Try uploading one of the sample PDFs from `SOF Samples/`
2. **Test Extraction**: Verify that the ML models can extract business data
3. **Check Calculations**: Test the laytime calculation functionality
4. **Explore Features**: Familiarize yourself with the dashboard and tools

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs** in your terminal for error messages
2. **Verify Python version** - ensure you're using Python 3.8+
3. **Check virtual environment** - ensure it's activated
4. **Verify dependencies** - run the verification commands above
5. **Check system resources** - ensure sufficient RAM and disk space

## 📝 Common Commands Reference

```bash
# Activate backend environment
cd backend
venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate   # Unix/Mac

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Install new dependencies
pip install package_name

# Update requirements
pip freeze > requirements.txt

# Deactivate environment
deactivate
```

---

**Happy coding! 🚢⚓**
