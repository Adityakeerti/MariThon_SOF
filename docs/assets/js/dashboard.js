// Dashboard JavaScript with FastAPI Integration
class DashboardAPI {
    constructor() {
        this.baseURL = 'http://127.0.0.1:8000';
        this.currentDocumentId = null;
        this.currentFile = null;
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.updateUserProfile();
    }

    // Authentication check
    checkAuth() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
    }

    // Get auth headers
    getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            'Authorization': `Bearer ${token}`
        };
    }

    // Setup event listeners
    setupEventListeners() {
        // File input change
        const fileInput = document.getElementById('sofFileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Drag and drop
        const uploadArea = document.getElementById('sofUploadArea');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        }

        // User profile dropdown
        const userProfile = document.getElementById('userProfile');
        if (userProfile) {
            userProfile.addEventListener('click', () => this.toggleDropdown());
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#userProfile')) {
                this.hideDropdown();
            }
        });
    }

    // File handling
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.currentFile = file;
            this.displayFileInfo(file);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
    }

    handleDrop(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
    if (files.length > 0) {
            this.currentFile = files[0];
            this.displayFileInfo(files[0]);
        }
    }

    displayFileInfo(file) {
        const fileInfo = document.getElementById('sofFileInfo');
        const fileName = document.getElementById('sofFileName');
        const uploadArea = document.getElementById('sofUploadArea');
        
        if (fileInfo && fileName && uploadArea) {
            fileName.textContent = file.name;
            fileInfo.style.display = 'block';
            uploadArea.style.display = 'none';
        }
    }

    removeFile() {
        this.currentFile = null;
        this.currentDocumentId = null;
        
        const fileInfo = document.getElementById('sofFileInfo');
        const uploadArea = document.getElementById('sofUploadArea');
        const fileInput = document.getElementById('sofFileInput');
        
        if (fileInfo && uploadArea && fileInput) {
            fileInfo.style.display = 'none';
            uploadArea.style.display = 'block';
            fileInput.value = '';
        }
        
        // Hide processing sections
        // this.hideProcessingSections(); // Removed as per edit hint
        
        // Reset results
        // this.resetResults(); // Removed as per edit hint
    }

    // Document upload
    async uploadDocument() {
        if (!this.currentFile) {
            this.showMessage('Please select a file first', 'error');
        return;
    }
    
        this.showLoading('Uploading document...');
        
        try {
        const formData = new FormData();
            formData.append('file', this.currentFile);
        
            const response = await fetch(`${this.baseURL}/documents/upload`, {
            method: 'POST',
                headers: this.getAuthHeaders(),
            body: formData
        });
        
            if (response.ok) {
        const data = await response.json();
                this.currentDocumentId = data.id;
                
                this.showMessage('Document uploaded successfully!', 'success');
                
                // Redirect to extraction results page with document ID
                setTimeout(() => {
                    window.location.href = `extraction-results.html?doc_id=${this.currentDocumentId}`;
                }, 1500);
            } else {
                const error = await response.json();
                throw new Error(error.detail || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showMessage(`Upload failed: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    // UI helpers
    showLoading(text = 'Processing...') {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        
        if (loadingOverlay && loadingText) {
            loadingText.textContent = text;
            loadingOverlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    showMessage(text, type) {
        // Simple message display - you can enhance this with a proper toast system
        console.log(`${type.toUpperCase()}: ${text}`);
        
        // For now, we'll use the existing modal system
        if (type === 'success') {
            this.showModal(text);
        } else if (type === 'error') {
            alert(`Error: ${text}`);
        }
    }

    showModal(message) {
        const modal = document.getElementById('successModal');
        const modalBody = modal?.querySelector('.modal-body p');
        
        if (modal && modalBody) {
            modalBody.textContent = message;
            modal.style.display = 'block';
        }
    }

    closeModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // User profile
    updateUserProfile() {
        const username = localStorage.getItem('username');
        const avatar = document.getElementById('avatar');
        
        if (avatar && username) {
            avatar.innerHTML = `<span>${username.charAt(0).toUpperCase()}</span>`;
        }
    }

    toggleDropdown() {
        const dropdown = document.getElementById('dropdownMenu');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    hideDropdown() {
            const dropdown = document.getElementById('dropdownMenu');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }

    showAccountDetails() {
        const username = localStorage.getItem('username');
        alert(`Username: ${username}\n\nAccount details functionality can be expanded here.`);
    }

    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('username');
        window.location.href = 'login.html';
    }
}

// Utility functions
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.select();
        document.execCommand('copy');
        
        // Show feedback
        const originalText = element.placeholder;
        element.placeholder = 'Copied to clipboard!';
        setTimeout(() => {
            element.placeholder = originalText;
        }, 2000);
    }
}

// Global functions for HTML onclick handlers
function uploadDocument() {
    dashboard.uploadDocument();
}

function removeFile(type) {
    dashboard.removeFile();
}

function closeModal() {
    dashboard.closeModal();
}

// Initialize dashboard when DOM is loaded
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new DashboardAPI();
});
