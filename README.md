# MariThon - SOF Document Extractor

A modern web application for extracting Statement of Facts (SOF) data from shipping documents using AI-powered APIs.

## 🌟 Features

- **Multi-API Support**: Azure Document Intelligence, Hugging Face, and OpenAI/OpenRouter
- **PDF Processing**: Advanced text extraction and parsing
- **Real-time Analysis**: Fast document processing with async operations
- **Modern UI**: Responsive web interface with dashboard
- **Free Tier APIs**: Optimized for cost-effective document processing

## 🚀 Live Demo

- **Frontend**: [GitHub Pages](https://yourusername.github.io/MariThon)
- **Backend API**: [Render](https://your-render-app.onrender.com)

## 🏗️ Architecture

```
MariThon/
├── backend/                 # FastAPI backend service
│   ├── main.py             # Main API server
│   ├── sof_extractor_api.py # Alternative API implementation
│   ├── requirements.txt    # Python dependencies
│   ├── Procfile           # Deployment configuration
│   └── runtime.txt        # Python version specification
├── docs/                   # Frontend web application
│   ├── index.html         # Landing page
│   ├── dashboard.html     # Main dashboard
│   ├── extraction-results.html # Results display
│   └── assets/            # CSS, JS, and images
├── render.yaml            # Render deployment config
└── .gitignore            # Git ignore rules
```

## 🔧 Backend Setup

### Prerequisites
- Python 3.11+
- pip package manager

### Local Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Production Deployment
The backend is configured for automatic deployment on Render:

1. **Connect Repository**: Link your GitHub repo to Render
2. **Auto-Deploy**: Render will automatically deploy on push to main branch
3. **Environment**: Free tier with automatic scaling

## 🌐 Frontend Setup

The frontend is hosted on GitHub Pages and automatically deploys from the `docs/` folder.

### Local Development
```bash
cd docs
# Open index.html in your browser or use a local server
python -m http.server 8000
```

### Frontend configuration
- Update API base URL in the following files to point to your Render backend URL:
  - `docs/assets/js/dashboard.js` → `this.baseURL = 'https://<your-app>.onrender.com'`
  - `docs/assets/js/extraction-results.js` → `this.baseURL = 'https://<your-app>.onrender.com'`
- Flow: Dashboard uploads the PDF to `POST /extract`, stores the result in `localStorage.extractionResult`, then redirects to the results page, which renders `vessel_info` and `events` from that result.

## 🔑 API Configuration

### Required Environment Variables
- **HF_API_TOKEN**: Your Hugging Face API token (required for PDF extraction)

### Optional Environment Variables
```bash
# Azure Document Intelligence
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=your_endpoint
AZURE_DOCUMENT_INTELLIGENCE_KEY=your_key

# OpenAI/OpenRouter (fallback)
OPENAI_API_KEY=your_key
OPENROUTER_API_KEY=your_key
```

### Local Development Setup
1. Copy `backend/env.example` to `backend/.env`
2. Fill in your actual API keys
3. Never commit `.env` files to version control

### Production Deployment
- Environment variables are configured in `render.yaml` for Render deployment
- For other platforms, set the required environment variables in your deployment dashboard

## 📡 API Endpoints

### Base URL
```
https://your-render-app.onrender.com
```

### Available Endpoints
- `GET /` - API status and version
- `GET /health` - Health check with available APIs
- `POST /extract` - Extract SOF data from PDF

### Example Usage
```bash
curl -X POST "https://your-render-app.onrender.com/extract" \
  -H "Content-Type: multipart/form-data" \
  -F "pdf=@your-document.pdf"
```

## 🚀 Deployment

### Render (Backend)
1. Push code to GitHub
2. Connect repository in Render dashboard
3. Service automatically deploys

### GitHub Pages (Frontend)
1. Push to main branch
2. Pages automatically deploy from `docs/` folder

## 📊 Supported Document Types

- **Statement of Facts (SOF)**
- **Shipping Documents**
- **Port Documents**
- **Cargo Documents**

## 🔍 Extraction Capabilities

### Vessel Information
- Vessel Name
- Master/Captain
- Agent
- Port of Loading
- Port of Discharge
- Cargo Description
- Quantity (Metric Tons)

### Event Timeline
- Date
- Start Time
- End Time
- Duration
- Event Description
- Remarks

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **PyPDF2** - PDF processing
- **aiohttp** - Async HTTP client

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling
- **JavaScript** - Interactive functionality
- **Bootstrap** - Responsive design

### APIs
- **Azure Document Intelligence** - Primary OCR service
- **Hugging Face** - AI model inference
- **OpenAI/OpenRouter** - Fallback AI processing

## 📈 Performance

- **Processing Time**: 5-15 seconds per document
- **Concurrent Requests**: Supports multiple simultaneous extractions
- **File Size Limit**: Up to 10MB PDF files
- **Rate Limits**: Based on API provider tiers

## 🔒 Security

- **CORS Enabled** - Configured for web frontend
- **Input Validation** - PDF file type verification
- **Error Handling** - Graceful failure management
- **No Sensitive Data Logging** - Secure error reporting

## 🐛 Troubleshooting

### Common Issues
1. **PDF Upload Fails**: Ensure file is PDF and under 10MB
2. **Extraction Errors**: Check API key configuration
3. **Timeout Issues**: Large documents may take longer

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
uvicorn main:app --reload --log-level debug
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Azure Document Intelligence for OCR capabilities
- Hugging Face for AI model hosting
- FastAPI community for the excellent framework
- Render for free hosting services

## 📞 Support

For issues and questions:
- Create a GitHub issue
- Check the API health endpoint
- Review deployment logs in Render dashboard

---

**Note**: This project uses hardcoded API keys as requested. For production use, consider using environment variables for better security.
