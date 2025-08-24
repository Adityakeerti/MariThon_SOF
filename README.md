# MariThon - Cargo Laytime & Event Tracker

A comprehensive maritime operations application for laytime calculations, event tracking, and document processing. Built with FastAPI backend and modern HTML/CSS/JavaScript frontend.

> **⚠️ Setup Notice**: This project uses machine learning models and requires proper dependency installation. The original requirements files were missing critical libraries like PyTorch. Please follow the [SETUP_GUIDE.md](SETUP_GUIDE.md) for complete installation instructions.

## 🚀 Features

- **PDF Document Processing**: Upload and parse Statement of Facts (SoF) documents
- **Laytime Calculations**: Automated time counting with exclusions for weather, weekends, and NOR status
- **Event Timeline**: Log arrivals, berthing, hatch, cargo ops, stoppages, and departures in real-time
- **Professional UI**: Clean, responsive interface with side-by-side form and results layout
- **Data Export**: Generate professional Statements of Facts and export PDF/Excel

## 🏗️ Project Structure

```
MariThon/
├── backend/                 # FastAPI backend server
│   ├── app/                # Application code
│   │   ├── main.py        # FastAPI app entry point
│   │   ├── pipeline.py    # Document processing pipeline
│   │   └── services/      # Business logic services
│   ├── config/            # Configuration files
│   ├── tests/             # Test files
│   ├── requirements.txt   # Python dependencies
│   └── venv/             # Backend virtual environment
├── marithon_frontend/     # Frontend application
│   ├── assets/           # CSS, JavaScript, and other assets
│   ├── index.html        # Landing page
│   ├── login.html        # Authentication
│   ├── dashboard.html    # Main dashboard
│   ├── calculate.html    # Laytime calculator
│   └── extraction-results.html  # Results page
├── .venv/                # Main directory virtual environment
└── README.md            # This file
```

## 🛠️ Prerequisites

- **Python 3.8+** (Recommended: Python 3.11)
- **Git** for version control
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 📦 Installation

**⚠️ IMPORTANT: This project requires specific setup due to ML dependencies. Please follow the detailed [SETUP_GUIDE.md](SETUP_GUIDE.md) for complete installation instructions.**

### Quick Start

```bash
# Clone the repository
git clone <your-repository-url>
cd MariThon

# Follow the detailed setup guide
# The backend requires PyTorch and other ML libraries
```

### What You'll Need

- **Python 3.8+** (Recommended: Python 3.11 or 3.12)
- **At least 4GB RAM** (PyTorch and ML models are memory-intensive)
- **Stable internet connection** (for downloading ML models on first run)
- **Patience** (first installation may take 10-20 minutes)

### Why the Detailed Setup?

The project uses machine learning models that require:
- **PyTorch** for neural network operations
- **Transformers** for natural language processing
- **Sentence-transformers** for text similarity
- **Additional ML libraries** for data processing

**🚨 Without proper setup, the application will fail to run due to missing dependencies.**

**📖 [Read the complete SETUP_GUIDE.md](SETUP_GUIDE.md) for step-by-step instructions.**

## 🚀 Running the Application

### 1. Start the Backend Server

```bash
# Navigate to backend directory
cd backend

# Activate backend virtual environment
venv\Scripts\Activate.ps1  # Windows
# source venv/bin/activate  # macOS/Linux

# Start the FastAPI server
uvicorn app.main:app --app-dir backend --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: `http://localhost:8000`

### 2. Open the Frontend

Open the frontend files in your web browser:

- **Landing Page**: `marithon_frontend/index.html`
- **Dashboard**: `marithon_frontend/dashboard.html`
- **Calculator**: `marithon_frontend/calculate.html`

Or serve them using a local HTTP server:

```bash
# Navigate to frontend directory
cd marithon_frontend

# Using Python's built-in server
python -m http.server 8080

# Or using Node.js (if installed)
npx serve .

# Or using PHP (if installed)
php -S localhost:8080
```

The frontend will be available at: `http://localhost:8080`

## 🔧 Configuration

### Backend Configuration

The backend uses configuration files in the `backend/config/` directory:

- `business_data.yml` - Business data extraction patterns
- `events.yml` - Event classification patterns

### API Endpoints

- `GET /health` - Health check endpoint
- `POST /extract` - PDF document processing endpoint

## 📚 Usage

### 1. Upload PDF Documents

1. Navigate to the Dashboard
2. Upload a Statement of Facts (SoF) PDF file
3. The system will automatically extract business data

### 2. Verify and Calculate

1. Review the extracted data in the left panel
2. Make any necessary corrections
3. Click "Calculate" to proceed

### 3. View Results

1. See laytime calculations in the right panel
2. Add events and track timeline
3. Export results as needed

## 🧪 Testing

### Backend Tests

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
venv\Scripts\Activate.ps1  # Windows
# source venv/bin/activate  # macOS/Linux

# Run tests
pytest -q
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Change port number
   uvicorn app.main:app --app-dir backend --reload --host 0.0.0.0 --port 8001
   ```

2. **Virtual Environment Issues**
   ```bash
   # Delete and recreate virtual environment
   rmdir /s venv  # Windows
   # rm -rf venv  # macOS/Linux
   python -m venv venv
   ```

3. **Dependencies Installation Issues**
   ```bash
   # Upgrade pip first
   pip install --upgrade pip
   
   # Install with verbose output
   pip install -r requirements.txt -v
   ```

### Backend Dependencies Issues

If you encounter issues with specific packages:

- **docling**: If installation fails, the system will fall back to pdfminer.six
- **sentence-transformers**: Large package, may take time to download
- **OCR dependencies**: Optional packages for scanned document processing

## 📋 Requirements Summary

### Backend Requirements (`backend/requirements.txt`)
- **FastAPI**: Web framework
- **Uvicorn**: ASGI server
- **Document Processing**: docling, pdfminer.six, python-docx
- **NLP**: sentence-transformers
- **Utilities**: PyYAML, dateparser, python-multipart

### Main Directory Requirements
- **Python 3.8+**: Core runtime
- **Virtual Environment**: For dependency isolation

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set production database URLs and API keys
2. **Static Files**: Serve frontend through a web server (nginx, Apache)
3. **Process Management**: Use systemd, supervisor, or Docker
4. **Security**: Enable HTTPS, CORS restrictions, authentication

### Docker (Optional)

```dockerfile
# Example Dockerfile for backend
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Add your license information here]

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above

---

**Note**: This project uses two separate virtual environments to ensure dependency isolation between the backend server and any main directory tools. Always activate the appropriate virtual environment before running commands.
