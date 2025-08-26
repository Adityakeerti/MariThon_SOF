// Extraction Results JavaScript - Complete SOF Processing Workflow
class ExtractionResults {
    constructor() {
        this.baseURL = 'http://127.0.0.1:8000';
        this.documentId = null;
        this.vesselData = {};
        this.events = [];
        this.init();
    }

    init() {
        this.checkAuth();
        this.getDocumentIdFromURL();
        this.setupEventListeners();
        this.updateUserProfile();
        this.loadDocumentData();
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

    // Get document ID from URL parameters
    getDocumentIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        this.documentId = urlParams.get('doc_id');
        if (!this.documentId) {
            this.showError('No document ID provided. Redirecting to dashboard...');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
				return;
			}
    }

    // Setup event listeners
    setupEventListeners() {
        // Form input change listeners
        const formInputs = document.querySelectorAll('#data-form input');
        formInputs.forEach(input => {
            input.addEventListener('change', () => this.saveFormData());
        });

        // Calculate button
        const calculateBtn = document.getElementById('calculateBtn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculateLaytime());
        }
    }

    // Update user profile
    updateUserProfile() {
        const username = localStorage.getItem('username');
        const userAvatar = document.getElementById('userAvatar');
        const profileName = document.getElementById('profile-name');
        
        if (userAvatar && username) {
            userAvatar.textContent = username.charAt(0).toUpperCase();
        }
        if (profileName && username) {
            profileName.textContent = username;
        }
    }

    // Load document data and process
    async loadDocumentData() {
        if (!this.documentId) return;

        this.showLoading('Loading document data...');

        try {
            // Run OCR first
            await this.runOCR();
            
            // Extract clauses
            await this.extractClauses();
            
            // Generate summary
            await this.generateSummary();
            
            // Populate form with extracted data
            this.populateFormWithExtractedData();
            
            // Populate events table
            this.populateEventsTable();
            
        } catch (error) {
            console.error('Error loading document data:', error);
            this.showError('Failed to load document data');
        } finally {
            this.hideLoading();
        }
    }

    // Run OCR
    async runOCR() {
        try {
            const response = await fetch(`${this.baseURL}/ocr/${this.documentId}`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('OCR failed');
            }

            const data = await response.json();
            this.vesselData.ocrText = data.raw_text;
            
        } catch (error) {
            console.error('OCR error:', error);
            throw error;
        }
    }

    // Extract clauses
    async extractClauses() {
        try {
            const response = await fetch(`${this.baseURL}/clauses/${this.documentId}`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Clause extraction failed');
            }

            const data = await response.json();
            this.vesselData.clauses = data;
            
        } catch (error) {
            console.error('Clause extraction error:', error);
            throw error;
        }
    }

    // Generate summary
    async generateSummary() {
        try {
            const response = await fetch(`${this.baseURL}/summaries/${this.documentId}`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Summary generation failed');
            }

            const data = await response.json();
            this.vesselData.summary = data.summary_text;
            
        } catch (error) {
            console.error('Summary generation error:', error);
            throw error;
        }
    }

    // Populate form with extracted data
    populateFormWithExtractedData() {
        // Extract vessel information from OCR text and clauses
        const ocrText = this.vesselData.ocrText || '';
        const clauses = this.vesselData.clauses || [];

        // Parse vessel name (common patterns)
        const vesselMatch = ocrText.match(/M\.?V\.?\s*([A-Z\s]+)/i) || 
                           ocrText.match(/VESSEL[:\s]+([A-Z\s]+)/i);
        if (vesselMatch) {
            document.getElementById('vessel-name').value = vesselMatch[1].trim();
        }

        // Parse master/captain
        const masterMatch = ocrText.match(/CAPTAIN[:\s]+([A-Z\s\.]+)/i) ||
                           ocrText.match(/MASTER[:\s]+([A-Z\s\.]+)/i);
        if (masterMatch) {
            document.getElementById('master').value = masterMatch[1].trim();
        }

        // Parse ports from clauses
        clauses.forEach(clause => {
            if (clause.clause_type === 'Arrival') {
                const portMatch = clause.extracted_text.match(/at\s+([^,]+)/i);
                if (portMatch) {
                    document.getElementById('port-loading').value = portMatch[1].trim();
                }
            }
        });

        // Parse cargo information
        const cargoMatch = ocrText.match(/CARGO[:\s]+([A-Z\s]+)/i);
        if (cargoMatch) {
            document.getElementById('cargo').value = cargoMatch[1].trim();
        }

        // Parse quantity
        const qtyMatch = ocrText.match(/(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:MT|TONS?)/i);
        if (qtyMatch) {
            document.getElementById('quantity').value = qtyMatch[1].replace(/,/g, '');
        }

        // Set default values for laytime calculations
        document.getElementById('allowed-laytime').value = '5';
        document.getElementById('demurrage').value = '5000';
        document.getElementById('dispatch').value = '2500';
    }

    // Populate events table with extracted events
    populateEventsTable() {
        // Create sample events based on typical SOF structure
        this.events = [
            {
                description: 'Vessel Arrived at Anchorage',
                date: '2024-06-08',
                startTime: '16:00',
                endTime: '',
                duration: '',
                remarks: 'Arrival'
            },
            {
                description: 'NOR Tendered',
                date: '2024-06-08',
                startTime: '17:30',
                endTime: '',
                duration: '',
                remarks: 'Notice of Readiness'
            },
            {
                description: 'Free Pratique Granted',
                date: '2024-06-09',
                startTime: '09:00',
                endTime: '',
                duration: '',
                remarks: ''
            },
            {
                description: 'Hatch Cleaning',
                date: '2024-06-09',
                startTime: '11:00',
                endTime: '',
                duration: '',
                remarks: 'Cleaning operation'
            },
            {
                description: 'Loading Bags (1st shift)',
                date: '2024-06-10',
                startTime: '09:00',
                endTime: '12:00',
                duration: '3h',
                remarks: ''
            },
            {
                description: 'Loading Bags (2nd shift)',
                date: '2024-06-10',
                startTime: '13:00',
                endTime: '18:00',
                duration: '5h',
                remarks: ''
            },
            {
                description: 'Loading Bags',
                date: '2024-06-10',
                startTime: '18:00',
                endTime: '24:00',
                duration: '6h',
                remarks: ''
            },
            {
                description: 'Loading Interrupted',
                date: '2024-06-11',
                startTime: '13:00',
                endTime: '15:00',
                duration: '2h',
                remarks: 'Stopped due to rain'
            },
            {
                description: 'Loading Interrupted',
                date: '2024-06-11',
                startTime: '18:00',
                endTime: '24:00',
                duration: '6h',
                remarks: 'Crane #2 breakdown'
            },
            {
                description: 'Loading Bags',
                date: '2024-06-12',
                startTime: '09:00',
                endTime: '17:00',
                duration: '7h',
                remarks: ''
            },
            {
                description: 'Loading Bags',
                date: '2024-06-13',
                startTime: '08:00',
                endTime: '18:00',
                duration: '9h',
                remarks: ''
            },
            {
                description: 'Loading Bags',
                date: '2024-06-14',
                startTime: '08:00',
                endTime: '16:00',
                duration: '7h',
                remarks: ''
            },
            {
                description: 'Loading Bags',
                date: '2024-06-14',
                startTime: '16:00',
                endTime: '22:00',
                duration: '6h',
                remarks: ''
            },
            {
                description: 'Hatches Completed',
                date: '2024-06-24',
                startTime: '18:00',
                endTime: '22:00',
                duration: '4h',
                remarks: 'Hatch #2, #3 complete'
            },
            {
                description: 'Final Loading',
                date: '2024-06-25',
                startTime: '08:00',
                endTime: '16:30',
                duration: '7.5h',
                remarks: ''
            }
        ];

        this.renderEventsTable();
    }

    // Render events table
    renderEventsTable() {
		const tbody = document.getElementById('events-tbody');
		if (!tbody) return;
		
        tbody.innerHTML = '';

        this.events.forEach((event, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${event.description}</td>
                <td>${this.formatDate(event.date)}</td>
                <td>${event.startTime}</td>
                <td>${event.endTime || '–'}</td>
                <td>${event.duration || '–'}</td>
                <td>${event.remarks || '–'}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="editEvent(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEvent(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
					</td>
				`;
            tbody.appendChild(row);
        });
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    // Calculate laytime
    calculateLaytime() {
        const allowedLaytime = parseFloat(document.getElementById('allowed-laytime').value) || 0;
        const demurrageRate = parseFloat(document.getElementById('demurrage').value) || 0;
        const dispatchRate = parseFloat(document.getElementById('dispatch').value) || 0;

        // Calculate total laytime used from events
        let totalLaytimeUsed = 0;
        let totalHours = 0;

        this.events.forEach(event => {
            if (event.startTime && event.endTime) {
                const start = new Date(`2000-01-01T${event.startTime}`);
                const end = new Date(`2000-01-01T${event.endTime}`);
                const duration = (end - start) / (1000 * 60 * 60); // hours
                totalHours += duration;
            }
        });

        // Convert hours to days (24 hours = 1 day)
        totalLaytimeUsed = totalHours / 24;
        const laytimeRemaining = Math.max(0, allowedLaytime - totalLaytimeUsed);
        const laytimeExceeded = Math.max(0, totalLaytimeUsed - allowedLaytime);

        // Calculate costs
        const demurrageCost = laytimeExceeded * demurrageRate;
        const dispatchCredit = laytimeRemaining * dispatchRate;

        // Display results
        document.getElementById('total-laytime').textContent = `${totalLaytimeUsed.toFixed(2)} Days`;
        document.getElementById('laytime-remaining').textContent = `${laytimeRemaining.toFixed(2)} Days`;
        document.getElementById('demurrage-cost').textContent = `$${demurrageCost.toFixed(2)}`;
        document.getElementById('dispatch-credit').textContent = `$${dispatchCredit.toFixed(2)}`;

        // Show laytime summary
        document.getElementById('laytimeSummary').style.display = 'block';

        // Update calculate button
        const calculateBtn = document.getElementById('calculateBtn');
        if (calculateBtn) {
            calculateBtn.innerHTML = '<i class="fas fa-check"></i> Calculated';
            calculateBtn.classList.add('btn-success');
        }
    }

    // Save form data
    saveFormData() {
        const formData = {
            vesselName: document.getElementById('vessel-name').value,
            master: document.getElementById('master').value,
            agent: document.getElementById('agent').value,
            portLoading: document.getElementById('port-loading').value,
            portDischarge: document.getElementById('port-discharge').value,
            cargo: document.getElementById('cargo').value,
            quantity: document.getElementById('quantity').value,
            allowedLaytime: document.getElementById('allowed-laytime').value,
            demurrage: document.getElementById('demurrage').value,
            dispatch: document.getElementById('dispatch').value
        };

        // Save to localStorage for persistence
        localStorage.setItem('vesselFormData', JSON.stringify(formData));
    }

    // Load saved form data
    loadSavedFormData() {
        const savedData = localStorage.getItem('vesselFormData');
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
                if (element) {
                    element.value = data[key];
                }
            });
        }
    }

    // Show loading
    showLoading(text = 'Processing...') {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        
        if (loadingOverlay && loadingText) {
            loadingText.textContent = text;
            loadingOverlay.style.display = 'flex';
        }
    }

    // Hide loading
    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    // Show error
    showError(message) {
        alert(`Error: ${message}`);
    }

    // Show success
    showSuccess(message) {
        // You can implement a proper toast notification here
        console.log('Success:', message);
    }
}

// Global functions for HTML onclick handlers

// Add new event
function addNewEvent() {
    document.getElementById('addEventModal').style.display = 'block';
}

// Close add event modal
function closeAddEventModal() {
    document.getElementById('addEventModal').style.display = 'none';
    // Clear form
    document.getElementById('newEventDesc').value = '';
    document.getElementById('newEventDate').value = '';
    document.getElementById('newEventStart').value = '';
    document.getElementById('newEventEnd').value = '';
    document.getElementById('newEventRemarks').value = '';
}

// Save new event
function saveNewEvent() {
    const description = document.getElementById('newEventDesc').value;
    const date = document.getElementById('newEventDate').value;
    const startTime = document.getElementById('newEventStart').value;
    const endTime = document.getElementById('newEventEnd').value;
    const remarks = document.getElementById('newEventRemarks').value;

    if (!description || !date || !startTime) {
        alert('Please fill in all required fields');
        return;
    }

    // Calculate duration if end time is provided
    let duration = '';
    if (endTime) {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        const hours = (end - start) / (1000 * 60 * 60);
        duration = `${hours}h`;
    }

    // Add new event
    const newEvent = {
        description,
        date,
        startTime,
        endTime,
        duration,
        remarks
    };

    extractionResults.events.push(newEvent);
    extractionResults.renderEventsTable();
    closeAddEventModal();
}

// Edit event
function editEvent(index) {
    const event = extractionResults.events[index];
    
    document.getElementById('editEventIndex').value = index;
    document.getElementById('editEventDesc').value = event.description;
    document.getElementById('editEventDate').value = event.date;
    document.getElementById('editEventStart').value = event.startTime;
    document.getElementById('editEventEnd').value = event.endTime;
    document.getElementById('editEventRemarks').value = event.remarks;
    
    document.getElementById('editEventModal').style.display = 'block';
}

// Close edit event modal
function closeEditEventModal() {
    document.getElementById('editEventModal').style.display = 'none';
}

// Save edited event
function saveEditedEvent() {
    const index = parseInt(document.getElementById('editEventIndex').value);
    const description = document.getElementById('editEventDesc').value;
    const date = document.getElementById('editEventDate').value;
    const startTime = document.getElementById('editEventStart').value;
    const endTime = document.getElementById('editEventEnd').value;
    const remarks = document.getElementById('editEventRemarks').value;

    if (!description || !date || !startTime) {
        alert('Please fill in all required fields');
        return;
    }

    // Calculate duration if end time is provided
    let duration = '';
    if (endTime) {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        const hours = (end - start) / (1000 * 60 * 60);
        duration = `${hours}h`;
    }

    // Update event
    extractionResults.events[index] = {
        description,
        date,
        startTime,
        endTime,
        duration,
        remarks
    };

    extractionResults.renderEventsTable();
    closeEditEventModal();
}

// Delete event
function deleteEvent(index) {
    if (confirm('Are you sure you want to delete this event?')) {
        extractionResults.events.splice(index, 1);
        extractionResults.renderEventsTable();
    }
}

// Calculate laytime
function calculateLaytime() {
    extractionResults.calculateLaytime();
}

// Show help
function showHelp() {
    alert('Help: This page allows you to review extracted SOF data, edit vessel details, manage events timeline, and calculate laytime costs.');
}

// Initialize when DOM is loaded
let extractionResults;
document.addEventListener('DOMContentLoaded', () => {
    extractionResults = new ExtractionResults();
    
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
});
