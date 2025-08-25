#!/usr/bin/env python3
"""
MariThon One-Click Setup Script
Complete automation for local development setup
Works on Windows, macOS, and Linux
"""

import os
import sys
import subprocess
import platform
import time
import json
import sqlite3
from pathlib import Path
import urllib.request
import urllib.error

class MariThonSetup:
    def __init__(self):
        self.project_root = Path.cwd()
        self.backend_path = self.project_root / "backend"
        self.frontend_path = self.project_root / "marithon_frontend"
        self.is_windows = platform.system() == "Windows"
        self.python_cmd = sys.executable
        
    def print_header(self):
        print("=" * 60)
        print("🚀 MariThon One-Click Setup")
        print("=" * 60)
        print("This script will automatically set up your entire MariThon project")
        print("including backend, frontend, database, and configuration files.")
        print("=" * 60)
        print()
        
    def print_step(self, step_num, title):
        print(f"\n🔧 Step {step_num}: {title}")
        print("-" * 40)
        
    def run_command(self, command, shell=False, cwd=None, check=True):
        """Run a command and return success status"""
        try:
            if shell:
                result = subprocess.run(command, shell=True, check=check, capture_output=True, text=True, cwd=cwd)
            else:
                result = subprocess.run(command, check=check, capture_output=True, text=True, cwd=cwd)
            return True, result.stdout
        except subprocess.CalledProcessError as e:
            return False, e.stderr
            
    def check_prerequisites(self):
        """Check if all prerequisites are met"""
        self.print_step(1, "Checking Prerequisites")
        
        # Check Python
        print("🐍 Checking Python installation...")
        success, output = self.run_command([self.python_cmd, "--version"])
        if success:
            print(f"✅ Python found: {output.strip()}")
        else:
            print("❌ Python not found or not accessible")
            return False
            
        # Check Git
        print("📦 Checking Git installation...")
        success, output = self.run_command(["git", "--version"])
        if success:
            print(f"✅ Git found: {output.strip()}")
        else:
            print("❌ Git not found. Please install Git first.")
            return False
            
        # Check if we're in the right directory
        if not self.backend_path.exists():
            print("❌ Backend directory not found. Please run this script from the MariThon project root.")
            return False
            
        if not self.frontend_path.exists():
            print("❌ Frontend directory not found. Please run this script from the MariThon project root.")
            return False
            
        print("✅ All prerequisites met!")
        return True
        
    def setup_backend(self):
        """Setup backend virtual environment and dependencies"""
        self.print_step(2, "Setting up Backend")
        
        # Create backend virtual environment
        backend_venv = self.backend_path / "backend_venv"
        print(f"🏗️ Creating backend virtual environment: {backend_venv}")
        
        if backend_venv.exists():
            print("✅ Backend virtual environment already exists")
        else:
            success, output = self.run_command([self.python_cmd, "-m", "venv", str(backend_venv)])
            if not success:
                print(f"❌ Failed to create backend virtual environment: {output}")
                return False
            print("✅ Backend virtual environment created")
            
        # Install backend dependencies
        print("📦 Installing backend dependencies...")
        requirements_file = self.backend_path / "requirements.txt"
        
        if self.is_windows:
            pip_cmd = backend_venv / "Scripts" / "pip.exe"
        else:
            pip_cmd = backend_venv / "bin" / "pip"
            
        if not pip_cmd.exists():
            print(f"❌ pip not found in virtual environment: {pip_cmd}")
            return False
            
        # Upgrade pip first
        print("⬆️ Upgrading pip...")
        success, output = self.run_command([str(pip_cmd), "install", "--upgrade", "pip"], cwd=self.backend_path)
        if not success:
            print(f"⚠️ Failed to upgrade pip: {output}")
            
        # Install requirements
        print("📥 Installing requirements...")
        success, output = self.run_command([str(pip_cmd), "install", "-r", str(requirements_file)], cwd=self.backend_path)
        if success:
            print("✅ Backend dependencies installed successfully")
        else:
            print(f"❌ Failed to install backend dependencies: {output}")
            return False
            
        print("✅ Backend setup complete!")
        return True
        
    def setup_main(self):
        """Setup main directory virtual environment and dependencies"""
        self.print_step(3, "Setting up Main Directory")
        
        # Create main virtual environment
        main_venv = self.project_root / "main_venv"
        print(f"🏗️ Creating main virtual environment: {main_venv}")
        
        if main_venv.exists():
            print("✅ Main virtual environment already exists")
        else:
            success, output = self.run_command([self.python_cmd, "-m", "venv", str(main_venv)])
            if not success:
                print(f"❌ Failed to create main virtual environment: {output}")
                return False
            print("✅ Main virtual environment created")
            
        # Install main dependencies
        requirements_file = self.project_root / "requirements.txt"
        if requirements_file.exists():
            print("📦 Installing main dependencies...")
            
            if self.is_windows:
                pip_cmd = main_venv / "Scripts" / "pip.exe"
            else:
                pip_cmd = main_venv / "bin" / "pip"
                
            if pip_cmd.exists():
                # Upgrade pip first
                print("⬆️ Upgrading pip...")
                success, output = self.run_command([str(pip_cmd), "install", "--upgrade", "pip"])
                if not success:
                    print(f"⚠️ Failed to upgrade pip: {output}")
                    
                # Install requirements
                success, output = self.run_command([str(pip_cmd), "install", "-r", str(requirements_file)])
                if success:
                    print("✅ Main dependencies installed successfully")
                else:
                    print(f"❌ Failed to install main dependencies: {output}")
                    return False
            else:
                print("⚠️ pip not found in main virtual environment")
        else:
            print("⚠️ Main requirements.txt not found, skipping main dependencies")
            
        print("✅ Main directory setup complete!")
        return True
        
    def setup_database(self):
        """Setup database configuration and create local settings"""
        self.print_step(4, "Setting up Database Configuration")
        
        # Create config directory if it doesn't exist
        config_dir = self.backend_path / "config"
        config_dir.mkdir(exist_ok=True)
        
        # Create local_settings.py
        local_settings_file = config_dir / "local_settings.py"
        if local_settings_file.exists():
            print("✅ Local settings file already exists")
        else:
            print("📝 Creating local settings file...")
            
            settings_content = '''# MariThon Local Settings
# Database Configuration
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = 'your_mysql_password'  # Change this to your actual MySQL password
DB_NAME = 'marithon_db'
DB_PORT = 3306

# JWT Configuration
SECRET_KEY = 'your-super-secret-key-change-this-in-production'
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# CORS Settings
ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
'''
            
            try:
                with open(local_settings_file, 'w') as f:
                    f.write(settings_content)
                print("✅ Local settings file created")
                print("⚠️ Please update the MySQL password in backend/config/local_settings.py")
            except Exception as e:
                print(f"❌ Failed to create local settings file: {e}")
                return False
                
        print("✅ Database configuration setup complete!")
        return True
        
    def create_startup_scripts(self):
        """Create startup scripts for easy server management"""
        self.print_step(5, "Creating Startup Scripts")
        
        # Create startup scripts directory
        scripts_dir = self.project_root / "scripts"
        scripts_dir.mkdir(exist_ok=True)
        
        # Windows batch files
        if self.is_windows:
            # Start Backend script
            backend_start = scripts_dir / "start_backend.bat"
            backend_content = f'''@echo off
echo Starting MariThon Backend Server...
cd /d "{self.backend_path}"
call backend_venv\\Scripts\\Activate.bat
echo Backend virtual environment activated
echo Starting FastAPI server on http://localhost:8000
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause
'''
            
            # Start Frontend script
            frontend_start = scripts_dir / "start_frontend.bat"
            frontend_content = f'''@echo off
echo Starting MariThon Frontend Server...
cd /d "{self.frontend_path}"
echo Starting HTTP server on http://localhost:8080
python -m http.server 8080
pause
'''
            
            # Start Both script
            start_both = scripts_dir / "start_both.bat"
            start_both_content = f'''@echo off
echo Starting MariThon Application...
echo.
echo Starting Backend Server...
start "MariThon Backend" cmd /k "cd /d "{self.backend_path}" && backend_venv\\Scripts\\Activate.bat && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend Server...
start "MariThon Frontend" cmd /k "cd /d "{self.frontend_path}" && python -m http.server 8080"
timeout /t 2 /nobreak >nul
echo.
echo 🎉 MariThon is starting up!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:8080
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to open the frontend in your browser...
pause >nul
start http://localhost:8080
'''
            
            try:
                with open(backend_start, 'w') as f:
                    f.write(backend_content)
                with open(frontend_start, 'w') as f:
                    f.write(frontend_content)
                with open(start_both, 'w') as f:
                    f.write(start_both_content)
                print("✅ Windows startup scripts created in scripts/ folder")
            except Exception as e:
                print(f"❌ Failed to create Windows startup scripts: {e}")
                
        # Unix shell scripts
        else:
            # Start Backend script
            backend_start = scripts_dir / "start_backend.sh"
            backend_content = f'''#!/bin/bash
echo "Starting MariThon Backend Server..."
cd "{self.backend_path}"
source backend_venv/bin/activate
echo "Backend virtual environment activated"
echo "Starting FastAPI server on http://localhost:8000"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
'''
            
            # Start Frontend script
            frontend_start = scripts_dir / "start_frontend.sh"
            frontend_content = f'''#!/bin/bash
echo "Starting MariThon Frontend Server..."
cd "{self.frontend_path}"
echo "Starting HTTP server on http://localhost:8080"
python -m http.server 8080
'''
            
            # Start Both script
            start_both = scripts_dir / "start_both.sh"
            start_both_content = f'''#!/bin/bash
echo "Starting MariThon Application..."
echo
echo "Starting Backend Server..."
gnome-terminal -- bash -c 'cd "{self.backend_path}" && source backend_venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000; exec bash' &
sleep 3
echo
echo "Starting Frontend Server..."
gnome-terminal -- bash -c 'cd "{self.frontend_path}" && python -m http.server 8080; exec bash' &
sleep 2
echo
echo "🎉 MariThon is starting up!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:8080"
echo "API Docs: http://localhost:8000/docs"
echo
echo "Opening frontend in browser..."
sleep 2
xdg-open http://localhost:8080
'''
            
            try:
                with open(backend_start, 'w') as f:
                    f.write(backend_content)
                with open(frontend_start, 'w') as f:
                    f.write(frontend_content)
                with open(start_both, 'w') as f:
                    f.write(start_both_content)
                    
                # Make scripts executable
                os.chmod(backend_start, 0o755)
                os.chmod(frontend_start, 0o755)
                os.chmod(start_both, 0o755)
                print("✅ Unix startup scripts created in scripts/ folder")
            except Exception as e:
                print(f"❌ Failed to create Unix startup scripts: {e}")
                
        print("✅ Startup scripts creation complete!")
        return True
        
    def create_quick_start_guide(self):
        """Create a quick start guide for users"""
        self.print_step(6, "Creating Quick Start Guide")
        
        guide_file = self.project_root / "QUICK_START.md"
        guide_content = f'''# MariThon Quick Start Guide

## 🚀 One-Click Startup

### Windows Users
1. **Double-click** `scripts/start_both.bat` to start both servers
2. **Or** run individual scripts:
   - `scripts/start_backend.bat` - Backend only
   - `scripts/start_frontend.bat` - Frontend only

### macOS/Linux Users
1. **Run** `./scripts/start_both.sh` to start both servers
2. **Or** run individual scripts:
   - `./scripts/start_backend.sh` - Backend only
   - `./scripts/start_frontend.sh` - Frontend only

## 🌐 Access Your Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔑 Default Login Credentials

- **Admin**: `admin@marithon.com` / `admin123`
- **Demo**: `demo@marithon.com` / `demo123`

## 🗄️ Database Setup

Before starting the application, make sure to:

1. **Install MySQL** if not already installed
2. **Start MySQL service**
3. **Update password** in `backend/config/local_settings.py`
4. **Run database setup**:
   ```bash
   cd backend
   backend_venv\\Scripts\\Activate.bat  # Windows
   # source backend_venv/bin/activate   # macOS/Linux
   python setup_db.py
   ```

## 🆘 Need Help?

- Check the main README.md for detailed setup instructions
- Review backend console logs for error messages
- Ensure all ports (8000, 8080) are available
- Verify MySQL is running and accessible

## 🎯 Next Steps

1. **Start the application** using the scripts above
2. **Login** with default credentials
3. **Upload a PDF** from the SOF Samples folder
4. **Test the extraction** functionality
5. **Explore the API** at http://localhost:8000/docs

---

**🎉 Welcome to MariThon!** Your maritime operations application is ready to use.
'''
        
        try:
            with open(guide_file, 'w') as f:
                f.write(guide_content)
            print("✅ Quick start guide created: QUICK_START.md")
        except Exception as e:
            print(f"❌ Failed to create quick start guide: {e}")
            
        return True
        
    def print_success_message(self):
        """Print success message and next steps"""
        print("\n" + "=" * 60)
        print("🎉 MariThon Setup Complete!")
        print("=" * 60)
        print()
        
        print("📋 What was set up:")
        print("✅ Backend virtual environment and dependencies")
        print("✅ Main directory virtual environment")
        print("✅ Database configuration files")
        print("✅ Startup scripts for easy server management")
        print("✅ Quick start guide")
        print()
        
        print("🚀 Next Steps:")
        print()
        
        if self.is_windows:
            print("1. **One-Click Start**: Double-click `scripts\\start_both.bat`")
            print("2. **Or Manual Start**:")
            print("   - Backend: `scripts\\start_backend.bat`")
            print("   - Frontend: `scripts\\start_frontend.bat`")
        else:
            print("1. **One-Click Start**: Run `./scripts/start_both.sh`")
            print("2. **Or Manual Start**:")
            print("   - Backend: `./scripts/start_backend.sh`")
            print("   - Frontend: `./scripts/start_frontend.sh`")
            
        print()
        print("3. **Database Setup** (Required before first run):")
        print("   - Install and start MySQL")
        print("   - Update password in backend/config/local_settings.py")
        print("   - Run: cd backend && backend_venv\\Scripts\\Activate.bat && python setup_db.py")
        print()
        print("4. **Access Application**:")
        print("   - Frontend: http://localhost:8080")
        print("   - Backend API: http://localhost:8000")
        print("   - API Docs: http://localhost:8000/docs")
        print()
        print("📚 **Quick Start Guide**: See QUICK_START.md for detailed instructions")
        print()
        print("🎯 **Default Login**: admin@marithon.com / admin123")
        print()
        print("=" * 60)
        print("🎉 Your MariThon project is ready to run!")
        print("=" * 60)
        
    def run(self):
        """Run the complete setup process"""
        try:
            self.print_header()
            
            # Check prerequisites
            if not self.check_prerequisites():
                print("\n❌ Prerequisites check failed. Please fix the issues above and try again.")
                return False
                
            # Setup backend
            if not self.setup_backend():
                print("\n❌ Backend setup failed.")
                return False
                
            # Setup main directory
            if not self.setup_main():
                print("\n⚠️ Main directory setup had issues, but continuing...")
                
            # Setup database configuration
            if not self.setup_database():
                print("\n❌ Database configuration setup failed.")
                return False
                
            # Create startup scripts
            if not self.create_startup_scripts():
                print("\n⚠️ Startup scripts creation had issues, but continuing...")
                
            # Create quick start guide
            if not self.create_quick_start_guide():
                print("\n⚠️ Quick start guide creation had issues, but continuing...")
                
            # Print success message
            self.print_success_message()
            
            return True
            
        except Exception as e:
            print(f"\n❌ Setup failed with error: {e}")
            return False

def main():
    """Main function"""
    setup = MariThonSetup()
    success = setup.run()
    
    if success:
        print("\n🎉 Setup completed successfully!")
        print("Check QUICK_START.md for next steps.")
    else:
        print("\n❌ Setup failed. Please check the error messages above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
