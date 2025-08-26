// Extraction Results JavaScript - Complete SOF Processing Workflow
class ExtractionResults {
    constructor() {
        this.baseURL = 'https://marithon-sof-backend.onrender.com';
        this.documentId = null;
        this.vesselData = {};
        this.events = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUserProfile();
        this.loadFromStoredResult();
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

    // Load result saved by dashboard after /extract
    loadFromStoredResult() {
        const raw = localStorage.getItem('extractionResult');
        if (!raw) {
            this.showError('No extraction result found. Please upload a PDF first.');
            setTimeout(() => window.location.href = 'dashboard.html', 1200);
            return;
        }
        try {
            const result = JSON.parse(raw);
            this.renderFromBackendResult(result);
        } catch (e) {
            console.warn('Failed to parse extractionResult from localStorage:', raw);
            localStorage.removeItem('extractionResult');
            this.showError('Invalid result data. Please re-upload your PDF.');
            setTimeout(() => window.location.href = 'dashboard.html', 1200);
        }
    }

    // Deprecated: no longer used in new flow
    async runOCR() { return; }

    async extractClauses() { return; }

    async generateSummary() { return; }

    // Render backend /extract result into form and events table
    renderFromBackendResult(result) {
        const vessel = (result && result.vessel_info) || {};
        const fieldMap = {
            'Vessel Name': 'vessel-name',
            'Master': 'master',
            'Agent': 'agent',
            'Port of Loading': 'port-loading',
            'Port of Discharge': 'port-discharge',
            'Cargo': 'cargo',
            'Quantity (MT)': 'quantity'
        };
        Object.keys(fieldMap).forEach((k) => {
            const el = document.getElementById(fieldMap[k]);
            if (el) el.value = vessel[k] || '';
        });

        // Calculator defaults if empty
        const allowed = document.getElementById('allowed-laytime');
        const dem = document.getElementById('demurrage');
        const disp = document.getElementById('dispatch');
        if (allowed && !allowed.value) allowed.value = '5';
        if (dem && !dem.value) dem.value = '5000';
        if (disp && !disp.value) disp.value = '2500';

        const backendEvents = Array.isArray(result && result.events) ? result.events : [];
        this.events = backendEvents.map((ev) => ({
            description: ev['Event Description'] || '-',
            date: this.normalizeDateForInput(ev['Date']),
            startTime: ev['Start Time'] && ev['Start Time'] !== '-' ? ev['Start Time'] : '',
            endTime: ev['End Time'] && ev['End Time'] !== '-' ? ev['End Time'] : '',
            duration: ev['Duration'] && ev['Duration'] !== '-' ? ev['Duration'] : '',
            remarks: ev['Remarks'] && ev['Remarks'] !== '-' ? ev['Remarks'] : ''
        }));

        this.renderEventsTable();
    }

    // Convert "08 Jun 2024" to "2024-06-08" for input/date parsing
    normalizeDateForInput(d) {
        if (!d || d === '-') return '';
        const parts = String(d).trim().split(/\s+/);
        if (parts.length !== 3) return d;
        const [dd, mon, yyyy] = parts;
        const monthMap = {Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12'};
        const mm = monthMap[mon] || monthMap[mon?.slice(0,3)] || '01';
        const day = dd.padStart(2, '0');
        return `${yyyy}-${mm}-${day}`;
    }

    // Populate form with extracted data
    populateFormWithExtractedData() { /* deprecated */ }

    // Populate events (handled in renderFromBackendResult now)
    populateEventsTable() { this.renderEventsTable(); }

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
        if (!dateString) return '–';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '–';
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
