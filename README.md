# MariThon - Cargo Laytime & Event Tracker

A comprehensive maritime operations application for laytime calculations, event tracking, and document processing. Built with FastAPI backend and modern HTML/CSS/JavaScript frontend.

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
│   └── venv/             # Backend virtual environment
├── marithon_frontend/     # Frontend application
│   ├── assets/           # CSS, JavaScript, and other assets
│   ├── index.html        # Landing page
│   ├── login.html        # Authentication
│   ├── signup.html       # User registration
│   ├── dashboard.html    # Main dashboard
│   └── extraction-results.html  # Results page
├── SOF Samples/          # Sample PDF files for testing
├── setup.py              # Unified setup script (Windows/Mac/Linux)
├── SETUP.md              # Complete setup guide
└── README.md             # This file
```

## 🛠️ Prerequisites

- **Python 3.8+** (Recommended: Python 3.11)
- **Git** for version control
- **MySQL** database server
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 📦 Installation

### Quick Start

```bash
# Clone the repository
git clone <your-repository-url>
cd MariThon

# Run the unified setup script
python setup.py
```

### Manual Setup

For detailed step-by-step instructions, see [SETUP.md](SETUP.md).

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

The backend will be available at: `http://localhost:8000`

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
3. **Create account** or login
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

**PDF Parsing Issues**
- Check if `pdfplumber` is installed
- Verify PDF file is not corrupted
- Check backend console for error messages

### Getting Help

1. **Check logs** in backend terminal
2. **Verify all prerequisites** are installed
3. **Ensure virtual environments** are activated
4. **Check port availability** (8000, 8080)
5. **Review SETUP.md** for detailed instructions

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
1. Check the [SETUP.md](SETUP.md) guide
2. Review the troubleshooting section
3. Check backend console logs
4. Open an issue on GitHub

---

**🎉 MariThon is ready to streamline your maritime operations!**
