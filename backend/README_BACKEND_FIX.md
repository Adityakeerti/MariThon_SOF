# MariThon Backend - Fixed and Ready to Run

## ✅ **Git Conflicts Resolved**

I've fixed all the Git merge conflicts that were preventing your backend from starting:

1. **`pipeline_simple.py`** - Fixed conflict in PDF parsing logic
2. **`database.py`** - Kept mysql.connector approach (used by auth service)
3. **`models.py`** - Kept Pydantic schemas (used by current auth system)

## 🗄️ **Database Setup**

### Option 1: Use the Python Script (Recommended)
```bash
cd backend
python setup_db.py
```

### Option 2: Use the SQL File
```bash
# Connect to MySQL and run:
mysql -u root -p < create_tables.sql
```

## 🔧 **Configuration**

Make sure your database settings are correct in `config/settings.py` or create `config/local_settings.py`:

```python
# Database Configuration
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = 'your_password'
DB_NAME = 'marithon_db'
DB_PORT = 3306

# JWT Configuration
SECRET_KEY = 'your-super-secret-key-change-this-in-production'
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 30
```

## 🚀 **Start the Backend**

```bash
cd backend
# Activate virtual environment
& f:/CODING/MariThon/backend/venv/Scripts/Activate.ps1

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 👥 **Sample Users Created**

After running the setup script, you'll have:

- **Admin**: `admin@marithon.com` / `admin123`
- **Demo**: `demo@marithon.com` / `demo123`

## 🔍 **What Was Fixed**

- ✅ Removed all Git conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
- ✅ Kept the working mysql.connector database approach
- ✅ Kept the working Pydantic schemas
- ✅ Fixed pipeline_simple.py PDF parsing logic
- ✅ Created proper database setup scripts

## 🌐 **API Endpoints**

Once running, your backend will have:

- `POST /auth/signup` - User registration
- `POST /auth/login` - User authentication
- `POST /extract` - File processing
- `GET /health` - Health check
- `GET /` - Root endpoint

## 🎯 **Next Steps**

1. **Run the database setup**: `python setup_db.py`
2. **Start the backend**: `uvicorn app.main:app --reload`
3. **Test the frontend**: Open `marithon_frontend_new/index.html`

Your backend should now start without any Git conflicts! 🚀
