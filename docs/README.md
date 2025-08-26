# SOF Frontend - FastAPI Integration

This frontend provides a complete user interface for the Statement of Facts (SOF) processing system, integrated with the FastAPI backend.

## Features

- **User Authentication**: Register and login with JWT tokens
- **Document Upload**: Drag & drop PDF files
- **OCR Processing**: Extract text from uploaded documents
- **Clause Extraction**: Automatically identify key clauses (Arrival, Berthing, Loading, Departure)
- **Document Summarization**: Generate concise summaries using Hugging Face API
- **Responsive Design**: Works on desktop and mobile devices

## Setup

### Prerequisites
- FastAPI backend running on `http://127.0.0.1:8000`
- Modern web browser with JavaScript enabled

### Quick Start
1. **Start the backend** (from the backend directory):
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload
   ```

2. **Open the frontend** in your browser:
   - Navigate to `frontend/` directory
   - Open `index.html` or `login.html`

## User Flow

### 1. Authentication
- **Register**: Create a new account with username and password
- **Login**: Sign in with your credentials
- JWT token is automatically stored in localStorage

### 2. Document Processing
1. **Upload**: Drag & drop or select a PDF file
2. **OCR**: Click "Run OCR" to extract text (10-60 seconds)
3. **Clauses**: Click "Extract Clauses" to identify key events (1-2 seconds)
4. **Summary**: Click "Generate Summary" for document overview (3-8 seconds)

### 3. Results
- **OCR Text**: Full extracted text in a scrollable textarea
- **Clauses**: Organized list of identified events with types
- **Summary**: Concise document summary
- All results can be copied to clipboard

## File Structure

```
frontend/
├── index.html              # Landing page
├── login.html              # Login form
├── signup.html             # Registration form
├── dashboard.html          # Main dashboard with upload and processing
├── assets/
│   ├── css/
│   │   ├── style.css       # Login/signup styles
│   │   ├── dashboard.css   # Dashboard styles
│   │   └── theme.css       # Common theme styles
│   ├── js/
│   │   ├── dashboard.js    # Main dashboard logic
│   │   └── auth.js         # Authentication utilities
│   └── images/
└── README.md
```

## API Integration

### Authentication
The demo uses a simple local JSON check on the frontend only. Sample user:

- username: `user`
- password: `user123`

No database or backend auth endpoints are used for login/signup in this demo.
- `POST /clauses/{document_id}` - Extract clauses
- `POST /summaries/{document_id}` - Generate summary

### Authentication
- JWT tokens stored in localStorage
- Automatic token inclusion in API requests
- Automatic redirect to login if token expires

## UI Components

### Dashboard
- **File Upload Area**: Drag & drop interface with visual feedback
- **Processing Buttons**: Sequential workflow (OCR → Clauses → Summary)
- **Results Display**: Organized cards for each processing step
- **Loading States**: Visual feedback during API calls

### Responsive Design
- Mobile-friendly interface
- Touch-friendly buttons and interactions
- Adaptive layouts for different screen sizes

## Error Handling

- **Network Errors**: User-friendly error messages
- **Validation Errors**: Form validation with helpful feedback
- **API Errors**: Backend error messages displayed to user
- **Loading States**: Disabled buttons and spinners during processing

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Development

### Adding New Features
1. Update HTML structure in respective `.html` files
2. Add JavaScript logic in `dashboard.js`
3. Style new elements in `dashboard.css`

### Testing
- Test with different PDF sizes and types
- Verify error handling with network issues
- Test responsive design on mobile devices

## Troubleshooting

### Common Issues
1. **"CORS Error"**: Ensure backend is running and CORS is configured
2. **"Token not found"**: Clear localStorage and re-login
3. **"Upload failed"**: Check file size and format (PDF recommended)
4. **"Processing stuck"**: Check backend logs for errors

### Debug Mode
- Open browser developer tools
- Check Console for detailed error messages
- Monitor Network tab for API request/response details

## Production Deployment

### Frontend
- Serve static files from a web server (nginx, Apache)
- Enable HTTPS for security
- Set up proper caching headers

### Backend
- Use production WSGI server (Gunicorn)
- Set environment variables for production
- Configure proper database connections

## Support

For issues or questions:
1. Check browser console for errors
2. Verify backend is running and accessible
3. Check network connectivity
4. Review this README for common solutions
