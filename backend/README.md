# MariThon Backend - Maritime Operations API

A robust FastAPI backend for the MariThon Cargo Laytime & Event Tracker application. This backend provides comprehensive maritime document processing, business data extraction, and laytime calculation services.

> **📖 Note**: This is the backend-specific documentation. For complete project setup and frontend instructions, see the main [README.md](../README.md) in the project root.

## 🏗️ Architecture Overview

The backend is built with a modular, service-oriented architecture:

```
backend/
├── app/
│   ├── __init__.py              # Application initialization
│   ├── main.py                  # FastAPI app entry point & routes
│   ├── auth.py                  # Authentication middleware & utilities
│   ├── models.py                # Database models & schemas
│   ├── pipeline.py              # Main document processing pipeline
│   ├── pipeline_simple.py       # Simplified processing pipeline
│   ├── simple_pdf_parser.py     # PDF parsing fallback
│   └── services/                # Business logic services
│       ├── __init__.py
│       ├── auth_service.py      # User authentication & JWT
│       ├── business_extractor.py # Business data extraction
│       ├── classify.py          # Document classification
│       ├── parser.py            # Document parsing
│       └── timeparse.py         # Time parsing utilities
├── config/                      # Configuration files
│   ├── business_data.yml        # Business rules & patterns
│   ├── database.py              # Database configuration
│   ├── events.yml               # Event patterns & ontology
│   └── settings.py              # Application settings
├── tests/                       # Test suite
├── requirements.txt             # Python dependencies
└── venv/                       # Virtual environment
```

## 🚀 Features

### Core Functionality
- **Document Processing**: PDF/DOCX parsing with multiple fallback strategies
- **Business Data Extraction**: Automatic extraction of vessel info, ports, cargo, rates
- **Event Classification**: ML-powered event detection using sentence-BERT similarity
- **Time Parsing**: Robust maritime time format handling (0730, 07.30, 23:50-00:10 rollover)
- **Laytime Calculation**: Automated laytime computation with event pairing

### Technical Features
- **FastAPI Framework**: Modern, fast web framework with automatic API documentation
- **Modular Services**: Clean separation of concerns with service-oriented architecture
- **Configuration-Driven**: YAML-based configuration for business rules and patterns
- **Explainable AI**: Source references and confidence scores for all extractions
- **Robust Error Handling**: Graceful fallbacks and comprehensive error reporting

## 🛠️ Prerequisites

- **Python 3.8+** (Recommended: Python 3.11)
- **MySQL** database server
- **Git** for version control
- **Virtual environment** support

## 📦 Installation

### 1. Create Virtual Environment
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
venv\Scripts\Activate.ps1
# Windows (Command Prompt):
venv\Scripts\Activate.bat
# macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
# Upgrade pip first
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt
```

**Note**: Some packages (like `sentence-transformers`) are large and may take several minutes to install.

### 3. Verify Installation
```bash
# Check installed packages
pip list

# Verify FastAPI installation
python -c "import fastapi; print('FastAPI installed successfully')"
```

## ⚙️ Configuration

### Database Configuration
Create `config/local_settings.py`:
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

### Business Rules Configuration
The backend uses YAML configuration files for business logic:

- **`config/business_data.yml`**: Business rules, patterns, and extraction rules
- **`config/events.yml`**: Event patterns and classification ontology
- **`config/settings.py`**: Application-level settings and constants

## 🚀 Running the Server

### Development Mode (with auto-reload)
```bash
# Make sure you're in backend directory with venv activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Custom Port
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

## 📚 API Endpoints

### Authentication
- **POST** `/auth/signup` - User registration
- **POST** `/auth/login` - User authentication
- **POST** `/auth/logout` - User logout
- **GET** `/auth/me` - Get current user info

### Document Processing
- **POST** `/extract` - Extract business data from documents
- **POST** `/upload` - Upload and process documents
- **GET** `/documents` - List processed documents

### Business Operations
- **GET** `/vessels` - List vessels
- **GET** `/ports` - List ports
- **POST** `/calculate` - Calculate laytime
- **GET** `/events` - List maritime events

### Health & Status
- **GET** `/health` - Health check endpoint
- **GET** `/docs` - Interactive API documentation
- **GET** `/redoc` - ReDoc API documentation

## 🔧 API Usage Examples

### Document Extraction
```bash
# Extract business data from PDF
curl -F "file=@sof_document.pdf" http://localhost:8000/extract

# With authentication
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "file=@sof_document.pdf" \
     http://localhost:8000/extract
```

### User Authentication
```bash
# User signup
curl -X POST http://localhost:8000/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password123","firstName":"John","lastName":"Doe"}'

# User login
curl -X POST http://localhost:8000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password123"}'
```

### Health Check
```bash
curl http://localhost:8000/health
```

## 🧪 Testing

### Run All Tests
```bash
# Run with pytest
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_classifier.py

# Run with coverage
pytest --cov=app tests/
```

### Test Categories
- **Unit Tests**: Individual service and utility functions
- **Integration Tests**: API endpoint testing
- **Document Processing Tests**: PDF parsing and extraction validation

## 🔍 Services Deep Dive

### Authentication Service (`auth_service.py`)
- JWT token generation and validation
- Password hashing with bcrypt
- Session management
- Role-based access control

### Business Extractor (`business_extractor.py`)
- Vessel information extraction
- Port and cargo data parsing
- Rate and laytime calculation
- Business rule application

### Document Parser (`parser.py`)
- PDF text extraction
- Document structure analysis
- Line-by-line processing
- Format detection and handling

### Time Parser (`timeparse.py`)
- Maritime time format recognition
- Time rollover handling (23:50-00:10)
- Multiple format support (0730, 07.30, 23:50)
- Timezone considerations

### Classifier (`classify.py`)
- ML-powered event classification
- Sentence-BERT similarity matching
- Configurable ontology matching
- Confidence scoring

## 📊 Database Models

### Users Table
```sql
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
```

### User Sessions Table
```sql
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Change port
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# Or kill the process using the port
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

**Database Connection Error**
- Verify MySQL is running
- Check credentials in `config/local_settings.py`
- Ensure database `marithon_db` exists
- Verify network connectivity

**Dependencies Installation Failed**
```bash
# Upgrade pip first
pip install --upgrade pip

# Try installing with verbose output
pip install -r requirements.txt -v

# Install specific packages individually
pip install fastapi uvicorn[standard] mysql-connector-python
```

**ML Model Import Errors**
- Ensure PyTorch is properly installed
- Check sentence-transformers installation
- Verify model download permissions

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --log-level debug
```

## 🔄 Development Workflow

### Code Changes
1. **Make changes** to backend code
2. **Server auto-reloads** (uvicorn --reload)
3. **Test endpoints** with API documentation
4. **Run tests** to ensure functionality
5. **Check logs** for any errors

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

## 📈 Performance & Scaling

### Optimization Tips
- **Caching**: Implement Redis for session and data caching
- **Database**: Use connection pooling and query optimization
- **Async Processing**: Implement background tasks for heavy operations
- **Load Balancing**: Use multiple worker processes

### Monitoring
- **Health Checks**: Regular endpoint monitoring
- **Logging**: Structured logging with different levels
- **Metrics**: Performance metrics collection
- **Error Tracking**: Comprehensive error logging

## 🔒 Security Considerations

### Authentication
- JWT tokens with configurable expiration
- Secure password hashing
- Session management
- Role-based access control

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- File upload security
- CORS configuration

### API Security
- Rate limiting
- Request size limits
- Secure headers
- HTTPS enforcement (production)

## 📚 Additional Resources

### Documentation
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Uvicorn Documentation**: https://www.uvicorn.org/
- **PyTorch Documentation**: https://pytorch.org/docs/

### Configuration Files
- **Business Rules**: `config/business_data.yml`
- **Event Patterns**: `config/events.yml`
- **Database Config**: `config/database.py`
- **App Settings**: `config/settings.py`

### Logs and Debugging
- Backend logs appear in the terminal running the server
- Set `LOG_LEVEL=DEBUG` for verbose logging
- Check `uvicorn` output for request/response details

## ✅ Success Checklist

- [ ] Python 3.8+ installed and verified
- [ ] Virtual environment created and activated
- [ ] Dependencies installed successfully
- [ ] Database configured and accessible
- [ ] Configuration files set up
- [ ] Server starts without errors
- [ ] Health check endpoint responds
- [ ] API documentation accessible
- [ ] Tests pass successfully
- [ ] Sample document processing works

---

**🎉 Your MariThon backend is ready for maritime operations!**

For frontend setup and full application usage, see the main [README.md](../README.md) in the project root.
