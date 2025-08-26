# 🚀 MariThon Backend Deployment Guide

This guide will walk you through deploying your MariThon backend to Render.

## 📋 Prerequisites

- ✅ GitHub repository with your code
- ✅ Render account (free tier available)
- ✅ Backend code ready for deployment

## 🎯 Quick Deployment Steps

### 1. Prepare Your Repository

Make sure your repository has these files:
```
MariThon/
├── backend/
│   ├── main.py                 # Main FastAPI app
│   ├── requirements.txt        # Python dependencies
│   ├── Procfile               # Deployment config
│   └── runtime.txt            # Python version
├── render.yaml                # Render deployment config
└── .gitignore                # Git ignore rules
```

### 2. Push to GitHub

```bash
# Add all files
git add .

# Commit changes
git commit -m "Prepare for Render deployment"

# Push to main branch
git push origin main
```

### 3. Deploy on Render

1. **Go to [Render Dashboard](https://dashboard.render.com)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `sof-document-extractor-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

5. **Click "Create Web Service"**

### 4. Wait for Deployment

- ⏳ Build time: 2-5 minutes
- 🔍 Monitor logs in Render dashboard
- ✅ Service will be available at `https://your-app-name.onrender.com`

## 🔧 Manual Configuration (Alternative)

If you prefer manual setup:

### Build Command
```bash
pip install -r backend/requirements.txt
```

### Start Command
```bash
cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Environment Variables
- `PORT`: Automatically set by Render
- `PYTHON_VERSION`: 3.11.0
- `HF_API_TOKEN`: Your Hugging Face API token (configured in render.yaml)

## 🧪 Test Your Deployment

### 1. Health Check
```bash
curl https://your-app-name.onrender.com/health
```

### 2. API Status
```bash
curl https://your-app-name.onrender.com/
```

### 3. Run Test Script
```bash
python test_deployment.py https://your-app-name.onrender.com
```

## 🔗 Connect Frontend to Backend

After the backend URL is ready, set it in the frontend JavaScript files:

```
docs/assets/js/dashboard.js           // set this.baseURL to your Render URL
docs/assets/js/extraction-results.js  // set this.baseURL to your Render URL
```

Flow:
- The dashboard sends `POST /extract` with `FormData` key `pdf`.
- On success, it saves the JSON to `localStorage.extractionResult` and redirects to `extraction-results.html`.
- The results page reads that JSON and renders vessel fields and events table.

## 🌐 Update Frontend

After successful deployment, update your frontend to use the new backend URL:

1. **Find your backend URL in Render dashboard**
2. **Update frontend JavaScript files** to use the new URL
3. **Test the complete flow**

## 📊 Monitor Your Service

### Render Dashboard Features
- ✅ **Logs**: Real-time application logs
- ✅ **Metrics**: Response times and errors
- ✅ **Deployments**: Automatic deployments on git push
- ✅ **Scaling**: Automatic scaling based on traffic

### Health Monitoring
- **Health Check Path**: `/health`
- **Auto-restart**: On failure
- **Uptime**: 99.9%+ on free tier

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check requirements.txt syntax
pip install -r backend/requirements.txt

# Verify Python version
python --version
```

#### 2. Runtime Errors
- Check Render logs for error details
- Verify all imports in `main.py`
- Test locally first: `uvicorn main:app --reload`

#### 3. Port Issues
- Render automatically sets `$PORT` environment variable
- Use `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### 4. Import Errors
- Ensure all dependencies are in `requirements.txt`
- Check for missing packages
- Verify file paths in imports

### Debug Commands

#### Local Testing
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Dependency Check
```bash
pip list
pip check
```

#### Log Analysis
```bash
# Check Render logs in dashboard
# Look for Python tracebacks
# Verify environment variables
```

## 🔄 Continuous Deployment

### Automatic Deployments
- ✅ Push to `main` branch triggers deployment
- ✅ Render automatically builds and deploys
- ✅ Zero-downtime deployments
- ✅ Rollback to previous version available

### Manual Deployments
- Use Render dashboard to trigger manual deployments
- Deploy specific commits or branches
- Preview deployments before going live

## 📈 Performance Optimization

### Free Tier Limits
- **Build Time**: 15 minutes max
- **Request Timeout**: 30 seconds
- **Memory**: 512MB
- **CPU**: Shared

### Optimization Tips
- ✅ Keep dependencies minimal
- ✅ Use async operations
- ✅ Implement proper error handling
- ✅ Monitor memory usage

## 🔒 Security Considerations

### Current Setup
- ✅ CORS enabled for web frontend
- ✅ Input validation on PDF uploads
- ✅ No sensitive data in logs
- ✅ API keys stored as environment variables (secure)

### Production Recommendations
- ✅ Environment variables are properly configured
- ✅ HF_API_TOKEN is set in render.yaml
- ✅ No hardcoded secrets in source code
- Consider implementing rate limiting if needed
- Use HTTPS (automatic on Render)

## 📞 Support

### Render Support
- **Documentation**: [docs.render.com](https://docs.render.com)
- **Community**: [community.render.com](https://community.render.com)
- **Status**: [status.render.com](https://status.render.com)

### Project Support
- **GitHub Issues**: Create issue in repository
- **API Testing**: Use `test_deployment.py` script
- **Health Check**: Monitor `/health` endpoint

## 🎉 Success Checklist

- ✅ Backend deployed on Render
- ✅ Health check passes
- ✅ API endpoints responding
- ✅ PDF extraction working
- ✅ Frontend updated with new backend URL
- ✅ Complete flow tested

---

**🚀 Your MariThon backend is now live and ready to process SOF documents!**
