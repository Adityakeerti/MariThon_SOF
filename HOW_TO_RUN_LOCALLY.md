# How to Run MariThon Locally

This guide provides detailed step-by-step instructions to set up and run the MariThon Cargo Laytime & Event Tracker application on your local machine.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

### 1. Python Installation
- **Python 3.8 or higher** (Recommended: Python 3.11)
- **Download**: [python.org](https://www.python.org/downloads/)
- **Verify Installation**:
  ```bash
  python --version
  # or
  python3 --version
  ```

### 2. Git Installation
- **Download**: [git-scm.com](https://git-scm.com/downloads)
- **Verify Installation**:
  ```bash
  git --version
  ```

### 3. Code Editor (Optional but Recommended)
- **VS Code**: [code.visualstudio.com](https://code.visualstudio.com/)
- **PyCharm**: [jetbrains.com/pycharm](https://www.jetbrains.com/pycharm/)
- **Or any text editor of your choice**

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository

1. **Open Terminal/Command Prompt**
2. **Navigate to your desired directory**:
   ```bash
   # Windows
   cd C:\Users\YourUsername\Documents\Projects
   
   # macOS/Linux
   cd ~/Documents/Projects
   ```

3. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd MariThon
   ```

4. **Verify the project structure**:
   ```bash
   # Windows
   dir
   
   # macOS/Linux
   ls -la
   ```

   You should see:
   - `backend/` folder
   - `marithon_frontend/` folder
   - `README.md`
   - Other project files

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Create Virtual Environment
```bash
# Windows
python -m venv venv

# macOS/Linux
python3 -m venv venv
```

#### 2.3 Activate Virtual Environment
```bash
# Windows (PowerShell)
venv\Scripts\Activate.ps1

# Windows (Command Prompt)
venv\Scripts\Activate.bat

# macOS/Linux
source venv/bin/activate
```

**Important**: You should see `(venv)` at the beginning of your command prompt when activated.

#### 2.4 Install Backend Dependencies
```bash
# Upgrade pip first
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt
```

**Note**: This may take several minutes as some packages (like `sentence-transformers`) are large.

#### 2.5 Verify Backend Installation
```bash
# Check installed packages
pip list

# Verify FastAPI installation
python -c "import fastapi; print('FastAPI installed successfully')"
```

### Step 3: Main Directory Setup

#### 3.1 Return to Main Directory
```bash
cd ..
```

#### 3.2 Create Main Virtual Environment
```bash
# Windows
python -m venv .venv

# macOS/Linux
python3 -m venv .venv
```

#### 3.3 Activate Main Virtual Environment
```bash
# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Windows (Command Prompt)
.venv\Scripts\Activate.bat

# macOS/Linux
source .venv/bin/activate
```

**Important**: You should see `(.venv)` at the beginning of your command prompt when activated.

#### 3.4 Install Main Directory Dependencies
```bash
# Upgrade pip first
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt
```

## 🏃‍♂️ Running the Application

### Step 4: Start the Backend Server

#### 4.1 Open a New Terminal/Command Prompt
**Keep this terminal open** - the backend server needs to keep running.

#### 4.2 Navigate to Backend Directory
```bash
cd backend
```

#### 4.3 Activate Backend Virtual Environment
```bash
# Windows (PowerShell)
venv\Scripts\Activate.ps1

# Windows (Command Prompt)
venv\Scripts\Activate.bat

# macOS/Linux
source venv/bin/activate
```

#### 4.4 Start the FastAPI Server
```bash
uvicorn app.main:app --app-dir backend --reload --host 0.0.0.0 --port 8000
```

**Expected Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Important**: 
- Keep this terminal open
- The server will automatically reload when you make code changes
- To stop the server, press `Ctrl+C`

### Step 5: Access the Frontend

#### 5.1 Open a New Terminal/Command Prompt
This will be for serving the frontend files.

#### 5.2 Navigate to Frontend Directory
```bash
cd marithon_frontend
```

#### 5.3 Serve Frontend Files (Choose One Option)

**Option A: Python HTTP Server (Recommended)**
```bash
# Windows
python -m http.server 8080

# macOS/Linux
python3 -m http.server 8080
```

**Option B: Node.js (if you have Node.js installed)**
```bash
npx serve . -p 8080
```

**Option C: PHP (if you have PHP installed)**
```bash
php -S localhost:8080
```

**Expected Output** (for Python):
```
Serving HTTP on :: port 8080 (http://[::]:8080/) ...
```

#### 5.4 Open in Browser
Open your web browser and navigate to:
- **Frontend**: `http://localhost:8080`
- **Backend API**: `http://localhost:8000`

## 🧪 Testing the Application

### Step 6: Verify Everything is Working

#### 6.1 Test Backend Health
1. Open your browser
2. Go to: `http://localhost:8000/health`
3. You should see: `{"status": "healthy"}`

#### 6.2 Test Frontend
1. Go to: `http://localhost:8080`
2. You should see the MariThon landing page
3. Navigate through the application:
   - Click "Get Started" → Dashboard
   - Try uploading a PDF file
   - Test the laytime calculator

#### 6.3 Test PDF Upload
1. Go to Dashboard
2. Upload a PDF file (you can use the sample files in `SOF Samples/` folder)
3. Verify the extraction process works

## 🔧 Troubleshooting Common Issues

### Issue 1: Port Already in Use
**Error**: `Address already in use`

**Solution**:
```bash
# Change port number
uvicorn app.main:app --app-dir backend --reload --host 0.0.0.0 --port 8001

# Or kill the process using the port
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

### Issue 2: Virtual Environment Not Activated
**Error**: `'uvicorn' is not recognized`

**Solution**:
```bash
# Make sure you see (venv) in your prompt
# If not, activate the virtual environment:
venv\Scripts\Activate.ps1  # Windows PowerShell
# or
venv\Scripts\Activate.bat  # Windows Command Prompt
# or
source venv/bin/activate   # macOS/Linux
```

### Issue 3: Dependencies Installation Failed
**Error**: `ERROR: Could not find a version that satisfies the requirement`

**Solution**:
```bash
# Upgrade pip first
pip install --upgrade pip

# Try installing with verbose output
pip install -r requirements.txt -v

# If specific package fails, try installing individually
pip install fastapi
pip install uvicorn[standard]
```

### Issue 4: Frontend Not Loading
**Error**: `Cannot connect to localhost:8080`

**Solution**:
1. Check if the frontend server is running
2. Verify the correct port number
3. Try a different port:
   ```bash
   python -m http.server 8081
   ```

### Issue 5: Backend Connection Error
**Error**: `Failed to fetch` in browser console

**Solution**:
1. Ensure backend server is running on port 8000
2. Check if CORS is properly configured
3. Verify the API endpoint URL in frontend code

## 📱 Using the Application

### Basic Workflow
1. **Upload PDF**: Go to Dashboard → Upload SoF document
2. **Review Data**: Check extracted information on extraction-results page
3. **Calculate**: Click "Calculate" to process laytime
4. **Add Events**: Log various maritime events
5. **View Results**: See calculated laytime and timeline

### File Types Supported
- **PDF**: Primary format for SoF documents
- **DOC/DOCX**: Word documents (fallback)
- **Scanned PDFs**: OCR processing available

## 🛑 Stopping the Application

### Stop Backend Server
1. Go to the terminal running the backend
2. Press `Ctrl+C`
3. Confirm with `Y` if prompted

### Stop Frontend Server
1. Go to the terminal running the frontend
2. Press `Ctrl+C`

### Deactivate Virtual Environments
```bash
# In each terminal where virtual environment is active
deactivate
```

## 🔄 Restarting the Application

### Quick Restart
1. **Backend**: 
   ```bash
   cd backend
   venv\Scripts\Activate.ps1  # Windows
   # source venv/bin/activate  # macOS/Linux
   uvicorn app.main:app --app-dir backend --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend**:
   ```bash
   cd marithon_frontend
   python -m http.server 8080
   ```

## 📚 Additional Resources

### API Documentation
- **Interactive API Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Logs and Debugging
- Backend logs appear in the terminal running the server
- Frontend errors appear in browser console (F12 → Console)

### Configuration Files
- **Backend Config**: `backend/config/`
- **Business Rules**: `backend/config/business_data.yml`
- **Event Patterns**: `backend/config/events.yml`

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs** in your terminal
2. **Verify all prerequisites** are installed
3. **Ensure virtual environments** are activated
4. **Check port availability** (8000 for backend, 8080 for frontend)
5. **Review this guide** step by step
6. **Check the main README.md** for additional information

## ✅ Success Checklist

- [ ] Python 3.8+ installed and verified
- [ ] Git installed and verified
- [ ] Repository cloned successfully
- [ ] Backend virtual environment created and activated
- [ ] Backend dependencies installed
- [ ] Main virtual environment created and activated
- [ ] Main dependencies installed
- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 8080
- [ ] Backend health check passes (`/health` endpoint)
- [ ] Frontend loads in browser
- [ ] Can navigate through the application
- [ ] PDF upload functionality works

---

**Congratulations!** 🎉 You now have MariThon running locally on your machine. The application is ready for development, testing, and use.
