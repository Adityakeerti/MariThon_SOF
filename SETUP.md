# MariThon Setup Guide

Complete guide to set up and run the MariThon Cargo Laytime & Event Tracker application locally.

## 📋 Prerequisites

- **Python 3.8+** (Recommended: Python 3.11 or 3.12)
- **Git** for version control
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **MySQL** database server
- **At least 2GB RAM** and **2GB free disk space**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd MariThon
```

### 2. Database Setup
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

### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Configure Backend
Create `backend/config/local_settings.py`:
```python
# Database settings
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = 'your_mysql_password'
DB_NAME = 'marithon_db'
DB_PORT = 3306

# JWT settings
SECRET_KEY = 'your-secret-key-here'
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 30
```

### 5. Start Backend Server
```bash
# Make sure you're in backend directory with venv activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Start Frontend
```bash
# Open new terminal, navigate to frontend directory
cd marithon_frontend

# Serve frontend files
python -m http.server 8080
```

### 7. Access Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔧 Detailed Setup

### Backend Dependencies
The backend uses these key libraries:
- **FastAPI** - Web framework
- **MySQL Connector** - Database connection
- **PyPDF2 & pdfplumber** - PDF parsing
- **bcrypt & PyJWT** - Authentication
- **PyYAML** - Configuration files

### Frontend Structure
- **HTML/CSS/JavaScript** - No build process required
- **Static files** - Can be served by any web server
- **LocalStorage** - Data persistence

### Database Schema
- **users** - User accounts and authentication
- **user_sessions** - Active login sessions

## 🧪 Testing

### 1. Test Backend
```bash
# Health check
curl http://localhost:8000/health

# Test authentication
curl http://localhost:8000/auth/signup -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test123","firstName":"Test","lastName":"User"}'
```

### 2. Test Frontend
1. Open http://localhost:8080
2. Create account or login
3. Upload a PDF file from `SOF Samples/` folder
4. Verify data extraction works

### 3. Test PDF Processing
1. Go to Dashboard
2. Upload `Samp2.pdf` or any sample file
3. Check extraction results page
4. Verify business data is extracted correctly

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Change port
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

**Database Connection Error**
- Verify MySQL is running
- Check credentials in `local_settings.py`
- Ensure database `marithon_db` exists

**PDF Parsing Issues**
- Check if `pdfplumber` is installed
- Verify PDF file is not corrupted
- Check backend console for error messages

**Frontend Not Loading**
- Verify frontend server is running on port 8080
- Check browser console for errors
- Ensure backend is accessible on port 8000

### Dependencies Issues
```bash
# If installation fails
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall

# Install specific packages
pip install pdfplumber PyPDF2 fastapi uvicorn
```

## 📁 Project Structure
```
MariThon/
├── backend/                 # Backend API
│   ├── app/                # Application code
│   ├── config/             # Configuration files
│   ├── venv/               # Virtual environment
│   └── requirements.txt    # Python dependencies
├── marithon_frontend/      # Frontend application
│   ├── assets/             # CSS, JS, images
│   ├── *.html              # HTML pages
│   └── index.html          # Main entry point
├── SOF Samples/            # Sample PDF files
├── setup.bat               # Windows setup script
├── setup.sh                # Unix setup script
└── README.md               # Project overview
```

## 🎯 Key Features

- **User Authentication** - Signup, login, session management
- **PDF Processing** - Extract business data from shipping documents
- **Data Extraction** - Parse vessel info, ports, cargo, rates
- **Laytime Calculation** - Calculate shipping laytime
- **Event Tracking** - Log maritime events and activities

## 🔄 Development Workflow

1. **Make changes** to backend or frontend code
2. **Backend auto-reloads** (uvicorn --reload)
3. **Refresh frontend** in browser
4. **Test functionality** with sample PDFs
5. **Check logs** in backend terminal

## 📚 API Documentation

- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## 🆘 Getting Help

1. **Check logs** in backend terminal
2. **Verify all prerequisites** are installed
3. **Ensure virtual environments** are activated
4. **Check port availability** (8000, 8080)
5. **Review this guide** step by step

## ✅ Success Checklist

- [ ] Python 3.8+ installed
- [ ] Git installed
- [ ] MySQL running with marithon_db database
- [ ] Repository cloned
- [ ] Backend virtual environment created and activated
- [ ] Backend dependencies installed
- [ ] Backend configuration set up
- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 8080
- [ ] Can access frontend in browser
- [ ] Can create account and login
- [ ] PDF upload and processing works
- [ ] Data extraction shows correct business information

---

**Congratulations!** 🎉 You now have MariThon running locally with full functionality.
