# MariThon - Cargo Laytime & Event Tracker

A comprehensive maritime operations application for laytime calculations, event tracking, and document processing. Built with FastAPI backend and modern HTML/CSS/JavaScript frontend.

## 📑 Table of Contents

- [🚀 Features](#-features)
- [🏗️ Project Structure](#️-project-structure)
- [🛠️ Prerequisites](#️-prerequisites)
- [📦 Installation & Setup](#-installation--setup)
- [🔧 Detailed Setup](#-detailed-setup)
- [🚀 Running the Application](#-running-the-application)
- [🧪 Testing](#-testing)
- [🔧 Key Technologies](#-key-technologies)
- [📚 API Documentation](#-api-documentation)
- [🚨 Troubleshooting](#-troubleshooting)
- [📱 Using the Application](#-using-the-application)
- [🛑 Stopping the Application](#-stopping-the-application)
- [🔄 Restarting the Application](#-restarting-the-application)
- [🔄 Development Workflow](#-development-workflow)
- [📚 Additional Resources](#-additional-resources)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🆘 Support](#-support)
- [📋 Quick Reference](#-quick-reference)

## 🚀 Features

- **PDF Document Processing**: Upload and parse Statement of Facts (SoF) documents
- **Business Data Extraction**: Automatically extract vessel info, ports, cargo, rates, and laytime
- **User Authentication**: Secure signup, login, and session management
- **Professional UI**: Clean, responsive interface with drag-and-drop file uploads
- **Data Export**: Generate professional Statements of Facts and export results

## 🏗️ Project Structure

```
MariThon/
├── backend/                 # FastAPI backend server
│   ├── app/                # Application code
│   │   ├── main.py        # FastAPI app entry point
│   │   ├── pipeline_simple.py  # Document processing pipeline
│   │   ├── simple_pdf_parser.py # PDF parsing fallback
│   │   └── services/      # Business logic services
│   ├── config/            # Configuration files
│   ├── tests/             # Test files
│   ├── requirements.txt   # Python dependencies
│   ├── setup_db.py        # Database setup script
│   ├── create_tables.sql  # SQL schema file
│   └── backend_venv/      # Backend virtual environment
├── marithon_frontend/     # Frontend application
│   ├── assets/           # CSS, JavaScript, and other assets
│   ├── index.html        # Landing page
│   ├── login.html        # Authentication
│   ├── signup.html       # User registration
│   ├── dashboard.html    # Main dashboard
│   ├── extraction-results.html  # Results page
│   └── calculate.html    # Laytime calculator
├── SOF Samples/          # Sample PDF files for testing
├── setup.py              # Unified setup script (Windows/Mac/Linux)
├── main_venv/            # Main project virtual environment
└── README.md             # This file
```

## 🛠️ Prerequisites

- **Python 3.8+** (Recommended: Python 3.11)
- **Git** for version control
- **MySQL** database server
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 📦 Installation & Setup

### Quick Start Solutions

#### Solution 1: One-Command Setup (All Platforms)
```bash
# Clone the repository
git clone <your-repository-url>
cd MariThon

# Run the unified setup script
python setup.py
```

#### Solution 2: Manual Setup (Recommended for First-Time Users)
Follow the detailed step-by-step instructions in the [Detailed Setup](#-detailed-setup) section below.

#### Solution 3: Database-First Setup (For Advanced Users)
If you prefer to set up the database first:

```sql
-- Create database and user
CREATE DATABASE marithon_db;
USE marithon_db;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role ENUM('admin', 'user', 'manager') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create user_sessions table
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role) 
VALUES ('admin', 'admin@marithon.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vHhHhqG', 'Admin', 'User', 'admin');
```

---

## 🔧 Detailed Setup

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

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Create Virtual Environment
```bash
# Windows
python -m venv backend_venv

# macOS/Linux
python3 -m venv backend_venv
```

#### 2.3 Activate Virtual Environment
```bash
# Windows (PowerShell)
backend_venv\Scripts\Activate.ps1

# Windows (Command Prompt)
backend_venv\Scripts\Activate.bat

# macOS/Linux
source backend_venv/bin/activate
```

**Important**: You should see `(backend_venv)` at the beginning of your command prompt when activated.

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

### Step 3: Database Setup

#### 3.1 Run Database Setup Script (Recommended)
```bash
# Make sure you're in the backend directory with virtual environment activated
python setup_db.py
```

This script will:
- Create the `marithon_db` database
- Create all necessary tables
- Insert default admin and demo users
- Set up proper database structure

#### 3.2 Alternative: Manual SQL Setup
If you prefer to run SQL manually:
```bash
# Connect to MySQL and run:
mysql -u root -p < create_tables.sql
```

#### 3.3 Verify Database Setup
After setup, you'll have these default users:
- **Admin**: `admin@marithon.com` / `admin123`
- **Demo**: `demo@marithon.com` / `demo123`

### Step 4: Main Directory Setup

#### 4.1 Return to Main Directory
```bash
cd ..
```

#### 4.2 Create Main Virtual Environment
```bash
# Windows
python -m venv main_venv

# macOS/Linux
python3 -m venv main_venv
```

#### 4.3 Activate Main Virtual Environment
```bash
# Windows (PowerShell)
main_venv\Scripts\Activate.ps1

# Windows (Command Prompt)
main_venv\Scripts\Activate.bat

# macOS/Linux
source main_venv/bin/activate
```

**Important**: You should see `(main_venv)` at the beginning of your command prompt when activated.

#### 4.4 Install Main Directory Dependencies
```bash
# Upgrade pip first
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt
```

### Step 5: Configure Backend

Create `backend/config/local_settings.py`:
```python
# Database settings
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = 'your_mysql_password'
DB_NAME = 'marithon_db'
DB_PORT = 3306

# JWT settings
SECRET_KEY = 'your-super-secret-key-change-this-in-production'
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 30
```

---

## 🚀 Running the Application

### 1. Start the Backend Server

```bash
# Navigate to backend directory
cd backend

# Activate backend virtual environment
backend_venv\Scripts\Activate.ps1  # Windows
# source backend_venv/bin/activate  # macOS/Linux

# Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: `http://localhost:8000`

**API Endpoints Available**:
- `POST /auth/signup` - User registration
- `POST /auth/login` - User authentication
- `POST /extract` - File processing
- `GET /health` - Health check
- `GET /` - Root endpoint

### 2. Start the Frontend

```bash
# Open new terminal, navigate to frontend directory
cd marithon_frontend

# Serve frontend files
python -m http.server 8080
```

The frontend will be available at: `http://localhost:8080`

### 3. Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🧪 Testing

### Test PDF Processing

1. **Start both servers** (backend on 8000, frontend on 8080)
2. **Open frontend** in browser
3. **Login with default credentials**:
   - Email: `admin@marithon.com`
   - Password: `admin123`
4. **Upload PDF** from `SOF Samples/` folder
5. **Verify extraction** shows correct business data

### Sample Files

Use the PDF files in the `SOF Samples/` folder to test the application:
- `Samp1.pdf`, `Samp2.pdf`, `Samp3.pdf`
- `SOF_ORION_TRADER.pdf`

## 🔧 Key Technologies

### Backend
- **FastAPI** - Modern web framework
- **MySQL** - Database storage
- **PyPDF2 & pdfplumber** - PDF parsing
- **bcrypt & PyJWT** - Authentication
- **PyYAML** - Configuration

### Frontend
- **HTML5/CSS3** - Modern markup and styling
- **JavaScript (ES6+)** - Interactive functionality
- **LocalStorage** - Client-side data persistence
- **Responsive Design** - Works on all devices

## 📚 API Documentation

- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Change port
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

**Database Connection Error**
- Verify MySQL is running
- Check credentials in `backend/config/local_settings.py`
- Ensure database `marithon_db` exists
- Run `python setup_db.py` to recreate database if needed

**PDF Parsing Issues**
- Check if `pdfplumber` is installed
- Verify PDF file is not corrupted
- Check backend console for error messages

**Frontend Not Loading**
- Verify frontend server is running on port 8080
- Check browser console for errors
- Ensure backend is accessible on port 8000

**Dependencies Installation Failed**
```bash
# Upgrade pip first
pip install --upgrade pip

# Try installing with verbose output
pip install -r requirements.txt -v

# If specific package fails, try installing individually
pip install fastapi uvicorn[standard] mysql-connector-python
```

**ML Model Import Errors**
- Ensure PyTorch is properly installed
- Check sentence-transformers installation
- Verify model download permissions

**Virtual Environment Not Activated**
```bash
# Make sure you see (backend_venv) in your prompt
# If not, activate the virtual environment:
backend_venv\Scripts\Activate.ps1  # Windows PowerShell
# or
backend_venv\Scripts\Activate.bat  # Windows Command Prompt
# or
source backend_venv/bin/activate   # macOS/Linux
```

**Git Conflicts Resolved**
The backend has been cleaned up and all Git merge conflicts have been resolved:
- ✅ Fixed `pipeline_simple.py` PDF parsing logic
- ✅ Kept working mysql.connector database approach
- ✅ Kept working Pydantic schemas
- ✅ Created proper database setup scripts

### Getting Help

1. **Check logs** in backend terminal
2. **Verify all prerequisites** are installed
3. **Ensure virtual environments** are activated
4. **Check port availability** (8000, 8080)
5. **Review this guide** step by step

---

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

---

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

---

## 🔄 Restarting the Application

### Quick Restart
1. **Backend**: 
   ```bash
   cd backend
   backend_venv\Scripts\Activate.ps1  # Windows
   # source backend_venv/bin/activate  # macOS/Linux
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend**:
   ```bash
   cd marithon_frontend
   python -m http.server 8080
   ```

---

## 🔄 Development Workflow

### Code Changes
1. **Make changes** to backend or frontend code
2. **Backend auto-reloads** (uvicorn --reload)
3. **Refresh frontend** in browser
4. **Test functionality** with sample PDFs
5. **Check logs** in backend terminal

### Adding New Services
1. Create service file in `app/services/`
2. Implement service logic
3. Add to `app/services/__init__.py`
4. Import and use in main application
5. Add corresponding tests

### Configuration Updates
1. Modify YAML files in `config/`
2. Restart server to apply changes
3. Test with sample documents
4. Update documentation if needed

---

## 📚 Additional Resources

### Logs and Debugging
- Backend logs appear in the terminal running the server
- Frontend errors appear in browser console (F12 → Console)

### Configuration Files
- **Backend Config**: `backend/config/`
- **Business Rules**: `backend/config/business_data.yml`
- **Event Patterns**: `backend/config/events.yml`

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter issues:

1. **Check the logs** in your terminal
2. **Verify all prerequisites** are installed
3. **Ensure virtual environments** are activated
4. **Check port availability** (8000 for backend, 8080 for frontend)
5. **Review this guide** step by step

---

**🎉 MariThon is ready to streamline your maritime operations!**

**🚨 Critical Note**: If you encounter import errors for PyTorch, sentence-transformers, or other ML libraries, the automated setup failed. Please follow the detailed setup instructions above for manual dependency installation.

---

## 📋 Quick Reference

### Default Credentials
- **Admin**: `admin@marithon.com` / `admin123`
- **Demo**: `demo@marithon.com` / `demo123`

### Ports
- **Backend API**: 8000
- **Frontend**: 8080

### Key Commands
```bash
# Start Backend
cd backend && backend_venv\Scripts\Activate.ps1 && uvicorn app.main:app --reload

# Start Frontend  
cd marithon_frontend && python -m http.server 8080

# Database Setup
cd backend && python setup_db.py
```
