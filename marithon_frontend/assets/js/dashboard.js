// Cargo LayTime Dashboard JavaScript
// Handles file uploads, drag & drop, and user interactions

document.addEventListener('DOMContentLoaded', function() {
    console.log('Cargo LayTime Dashboard loaded successfully');
    
    // Initialize the dashboard
    initializeDashboard();
});

// Test backend connectivity
async function testBackendConnectivity() {
    console.log('Testing backend connectivity...');
    
    try {
        const startTime = Date.now();
        const response = await fetch('http://localhost:8000/docs', { 
            method: 'GET',
            mode: 'cors'
        });
        const endTime = Date.now();
        
        console.log(`Backend response time: ${endTime - startTime}ms`);
        console.log('Backend status:', response.status);
        console.log('Backend accessible:', response.ok);
        
        if (response.ok) {
            showError('✅ Backend is accessible and responding quickly');
        } else {
            showError('⚠️ Backend responded but with error status');
        }
        
    } catch (error) {
        console.error('Backend connectivity test failed:', error);
        showError('❌ Backend connectivity test failed: ' + error.message);
    }
}

// Test function to verify basic functionality
function testBasicFunctionality() {
    console.log('Testing basic dashboard functionality...');
    
    // Test if progress elements exist
    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    console.log('Progress elements found:', {
        progressSection: !!progressSection,
        progressFill: !!progressFill,
        progressText: !!progressText
    });
    
    // Test if submit button exists
    const submitBtn = document.getElementById('submitBtn');
    console.log('Submit button found:', !!submitBtn);
    
    // Test if file inputs exist
    const sofInput = document.getElementById('sofFileInput');
    const cpInput = document.getElementById('cpFileInput');
    console.log('File inputs found:', {
        sofInput: !!sofInput,
        cpInput: !!cpInput
    });
}

// Initialize the dashboard
function initializeDashboard() {
    console.log('Initializing dashboard...');
    
    // Test basic functionality first
    testBasicFunctionality();
    
    // Setup file input listeners
    setupFileInputs();
    
    // Setup drag and drop functionality
    setupDragAndDrop();
    
    // Setup user profile dropdown
    setupUserProfile();
    
    // Add smooth animations
    addAnimations();
    
    console.log('Dashboard initialization complete');
}

// File Input Setup
function setupFileInputs() {
    const sofInput = document.getElementById('sofFileInput');
    const cpInput = document.getElementById('cpFileInput');
    
    sofInput.addEventListener('change', (e) => handleFileSelect(e, 'sof'));
    cpInput.addEventListener('change', (e) => handleFileSelect(e, 'cp'));
}

// Handle File Selection
function handleFileSelect(event, fileType) {
    const file = event.target.files[0];
    if (file) {
        displayFileInfo(file, fileType);
        updateSubmitButton();
    }
}

// Display File Information
function displayFileInfo(file, fileType) {
    const fileInfo = document.getElementById(`${fileType}FileInfo`);
    const fileName = document.getElementById(`${fileType}FileName`);
    const uploadArea = document.getElementById(`${fileType}UploadArea`);
    
    // Update file name
    fileName.textContent = file.name;
    
    // Show file info, hide upload area
    fileInfo.style.display = 'block';
    uploadArea.style.display = 'none';
    
    // Add success animation
    fileInfo.style.animation = 'fileSlideIn 0.3s ease';
}

// Remove File
function removeFile(fileType) {
    const fileInfo = document.getElementById(`${fileType}FileInfo`);
    const uploadArea = document.getElementById(`${fileType}UploadArea`);
    const fileInput = document.getElementById(`${fileType}FileInput`);
    
    // Reset file input
    fileInput.value = '';
    
    // Hide file info, show upload area
    fileInfo.style.display = 'none';
    uploadArea.style.display = 'block';
    
    // Update submit button
    updateSubmitButton();
}

// Drag and Drop Setup
function setupDragAndDrop() {
    const uploadAreas = document.querySelectorAll('.upload-area');
    
    uploadAreas.forEach(area => {
        area.addEventListener('dragover', handleDragOver);
        area.addEventListener('dragleave', handleDragLeave);
        area.addEventListener('drop', handleDrop);
        area.addEventListener('click', handleAreaClick);
    });
}

// Handle Drag Over
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

// Handle Drag Leave
function handleDragLeave(e) {
    e.currentTarget.classList.remove('dragover');
}

// Handle Drop
function handleDrop(e) {
    e.preventDefault();
    const area = e.currentTarget;
    area.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        const fileType = area.id.replace('UploadArea', '');
        
        // Validate file type
        if (validateFileType(file)) {
            // Update the corresponding file input
            const fileInput = document.getElementById(`${fileType}FileInput`);
            fileInput.files = files;
            
            // Display file info
            displayFileInfo(file, fileType);
            updateSubmitButton();
        } else {
            showError('Please select a valid PDF or DOCX file.');
        }
    }
}

// Handle Area Click
function handleAreaClick(e) {
    if (e.target.classList.contains('upload-area') || e.target.closest('.upload-content')) {
        const fileType = e.currentTarget.id.replace('UploadArea', '');
        document.getElementById(`${fileType}FileInput`).click();
    }
}

// Validate File Type
function validateFileType(file) {
    const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const validExtensions = ['.pdf', '.docx'];
    
    return validTypes.includes(file.type) || 
           validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
}

// Update Submit Button State
function updateSubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    const sofFile = document.getElementById('sofFileInput').files[0];
    
    if (sofFile) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
    } else {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
        submitBtn.style.cursor = 'not-allowed';
    }
}

// Submit Files
async function submitFiles() {
    const sofFile = document.getElementById('sofFileInput').files[0];
    const cpFile = document.getElementById('cpFileInput').files[0];
    
    if (!sofFile) {
        showError('Please upload an SOF file to continue. The SOF file is required for laytime calculations.');
        return;
    }
    
    // Clear any old extraction data first
    localStorage.removeItem('extraction_results');
    localStorage.removeItem('laytime_extraction_data');
    localStorage.removeItem('uploaded_file_name');
    
    // Show progress section
    const progressSection = document.getElementById('progressSection');
    const progressText = document.getElementById('progressText');
    const submitBtn = document.getElementById('submitBtn');
    
    progressSection.style.display = 'block';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    try {
        console.log('Starting file upload and extraction process...');
        console.log('Uploading file:', sofFile.name, 'size:', sofFile.size, 'bytes');
        
        updateProgress(20, 'Uploading SOF file...');
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', sofFile);
        
        // Single API call - backend is working fine
        console.log('Extracting document...');
        const response = await fetch('http://localhost:8000/extract?debug=true', {
            method: 'POST',
            body: formData
        });
        
        console.log('Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response body:', errorText);
            throw new Error(`Server error ${response.status}: ${errorText}`);
        }
        
        updateProgress(80, 'Processing document...');
        
        const data = await response.json();
        console.log('Parsed data:', data);
        
        updateProgress(90, 'Storing results...');
        
        // Store extraction data in localStorage
        try {
            localStorage.setItem('extraction_results', JSON.stringify(data));
            localStorage.setItem('uploaded_file_name', sofFile.name);
        } catch (error) {
            console.error('Error storing extraction data:', error);
        }
        
        updateProgress(100, 'Extraction complete!');
        
        // Show success message
        progressText.textContent = `✅ ${sofFile.name} processed successfully!`;
        progressText.style.color = '#4CAF50';
        
        // Wait a moment to show completion, then redirect
        setTimeout(() => {
            console.log('Redirecting to extraction results page...');
            window.location.href = 'extraction-results.html';
        }, 2000);
        
    } catch (error) {
        console.error('File upload/extraction error:', error);
        
        let errorMessage = 'Parsing failed. ';
        if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Cannot connect to the backend server. Please ensure the backend is running on http://localhost:8000';
        } else if (error.message.includes('Server error')) {
            errorMessage += 'Server error occurred. Please check the backend logs.';
        } else {
            errorMessage += 'Please check the file and try again.';
        }
        
        showError(errorMessage);
    } finally {
        progressSection.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Files';
    }
}

// Update Progress Bar
function updateProgress(percentage, text) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill && progressText) {
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = text;
        console.log(`Progress: ${percentage}% - ${text}`);
    } else {
        console.warn('Progress elements not found:', { progressFill, progressText });
    }
}

// Show Error Message
function showError(message) {
    console.error('Error:', message);
    
    // Create a temporary error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
        z-index: 9999;
        max-width: 300px;
        font-family: 'Inter', sans-serif;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// Show Success Message (for other operations)
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        closeModal();
    }, 5000);
}

// Close Modal
function closeModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
}

// User Profile Setup
function setupUserProfile() {
    const userProfile = document.getElementById('userProfile');
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userProfile.contains(e.target)) {
            const dropdown = document.getElementById('dropdownMenu');
            dropdown.style.opacity = '0';
            dropdown.style.visibility = 'hidden';
            dropdown.style.transform = 'translateY(-10px)';
        }
    });
}

// Show Account Details
function showAccountDetails() {
    // This would typically redirect to an account page
    console.log('Show account details');
    alert('Account details functionality would be implemented here.');
}

// Logout Function
function logout() {
    // This would typically clear session and redirect to login
    console.log('Logout initiated');
    if (confirm('Are you sure you want to logout?')) {
        // Clear any stored data
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
}

// Add Animations
function addAnimations() {
    // Add entrance animations to cards
    const cards = document.querySelectorAll('.upload-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // Add animation to welcome section
    const welcomeSection = document.querySelector('.welcome-section');
    welcomeSection.style.opacity = '0';
    welcomeSection.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        welcomeSection.style.transition = 'all 0.8s ease';
        welcomeSection.style.opacity = '1';
        welcomeSection.style.transform = 'translateY(0)';
    }, 100);
}

// Show Error Message
function showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fed7d7;
        color: #c53030;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        border: 1px solid #feb2b2;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fileSlideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .error-notification .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .error-notification button {
        background: none;
        border: none;
        color: #c53030;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        transition: background 0.3s ease;
    }
    
    .error-notification button:hover {
        background: rgba(197, 48, 48, 0.1);
    }
`;
document.head.appendChild(style);

// Export functions for potential external use
window.CargoLayTimeDashboard = {
    submitFiles,
    removeFile,
    showAccountDetails,
    logout,
    closeModal
};
