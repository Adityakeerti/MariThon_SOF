#!/usr/bin/env python3
"""
MariThon Unified Setup Script
Works on Windows, macOS, and Linux
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def print_header():
    print("=" * 50)
    print("MariThon Project Setup Script")
    print("=" * 50)
    print()

def run_command(command, shell=False):
    """Run a command and return success status"""
    try:
        if shell:
            result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        else:
            result = subprocess.run(command, check=True, capture_output=True, text=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def check_python():
    """Check if Python is available"""
    print("Checking Python installation...")
    success, output = run_command([sys.executable, "--version"])
    if success:
        print(f"✅ Python found: {output.strip()}")
        return True
    else:
        print("❌ Python not found or not accessible")
        return False

def create_venv(venv_path, python_cmd):
    """Create virtual environment if it doesn't exist"""
    if venv_path.exists():
        print(f"✅ Virtual environment already exists: {venv_path}")
        return True
    
    print(f"Creating virtual environment: {venv_path}")
    success, output = run_command([python_cmd, "-m", "venv", str(venv_path)])
    if success:
        print(f"✅ Virtual environment created: {venv_path}")
        return True
    else:
        print(f"❌ Failed to create virtual environment: {output}")
        return False

def get_activate_script(venv_path):
    """Get the activation script path based on platform"""
    if platform.system() == "Windows":
        return venv_path / "Scripts" / "activate.bat"
    else:
        return venv_path / "bin" / "activate"

def install_dependencies(venv_path, requirements_file):
    """Install dependencies in virtual environment"""
    print(f"Installing dependencies from {requirements_file}...")
    
    # Get the pip executable from the virtual environment
    if platform.system() == "Windows":
        pip_cmd = venv_path / "Scripts" / "pip.exe"
    else:
        pip_cmd = venv_path / "bin" / "pip"
    
    if not pip_cmd.exists():
        print(f"❌ pip not found in virtual environment: {pip_cmd}")
        return False
    
    # Upgrade pip first
    print("Upgrading pip...")
    success, output = run_command([str(pip_cmd), "install", "--upgrade", "pip"])
    if not success:
        print(f"⚠️ Failed to upgrade pip: {output}")
    
    # Install requirements
    print("Installing requirements...")
    success, output = run_command([str(pip_cmd), "install", "-r", str(requirements_file)])
    if success:
        print(f"✅ Dependencies installed successfully")
        return True
    else:
        print(f"❌ Failed to install dependencies: {output}")
        return False

def setup_backend():
    """Setup backend virtual environment and dependencies"""
    print("\n🔧 Setting up Backend...")
    
    backend_path = Path("backend")
    if not backend_path.exists():
        print("❌ Backend directory not found")
        return False
    
    # Create backend virtual environment
    backend_venv = backend_path / "venv"
    if not create_venv(backend_venv, sys.executable):
        return False
    
    # Install backend dependencies
    requirements_file = backend_path / "requirements.txt"
    if not requirements_file.exists():
        print("❌ Backend requirements.txt not found")
        return False
    
    if not install_dependencies(backend_venv, requirements_file):
        return False
    
    print("✅ Backend setup complete!")
    return True

def setup_main():
    """Setup main directory virtual environment and dependencies"""
    print("\n🔧 Setting up Main Directory...")
    
    # Create main virtual environment
    main_venv = Path(".venv")
    if not create_venv(main_venv, sys.executable):
        return False
    
    # Install main dependencies
    requirements_file = Path("requirements.txt")
    if not requirements_file.exists():
        print("⚠️ Main requirements.txt not found, skipping main dependencies")
        return True
    
    if not install_dependencies(main_venv, requirements_file):
        return False
    
    print("✅ Main directory setup complete!")
    return True

def print_next_steps():
    """Print next steps for the user"""
    print("\n" + "=" * 50)
    print("🎉 Setup Complete!")
    print("=" * 50)
    print()
    
    print("📋 Next Steps:")
    print()
    
    print("1. 🚀 Start Backend Server:")
    if platform.system() == "Windows":
        print("   cd backend")
        print("   venv\\Scripts\\Activate.bat")
        print("   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    else:
        print("   cd backend")
        print("   source venv/bin/activate")
        print("   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    
    print()
    print("2. 🌐 Start Frontend:")
    print("   cd marithon_frontend")
    print("   python -m http.server 8080")
    print()
    print("3. 📱 Access Application:")
    print("   Frontend: http://localhost:8080")
    print("   Backend API: http://localhost:8000")
    print("   API Docs: http://localhost:8000/docs")
    print()
    print("4. 🗄️ Database Setup:")
    print("   Make sure MySQL is running")
    print("   Create database 'marithon_db'")
    print("   Check backend/config/local_settings.py")
    print()
    print("📚 For detailed setup instructions, see SETUP.md")

def main():
    """Main setup function"""
    print_header()
    
    # Check Python
    if not check_python():
        sys.exit(1)
    
    # Setup backend
    if not setup_backend():
        print("❌ Backend setup failed")
        sys.exit(1)
    
    # Setup main directory
    if not setup_main():
        print("⚠️ Main directory setup had issues")
    
    # Print next steps
    print_next_steps()

if __name__ == "__main__":
    main()
