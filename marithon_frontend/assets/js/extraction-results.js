(function(){
	const yearEl = document.getElementById('year');
	if (yearEl) yearEl.textContent = new Date().getFullYear();

	// Load extracted data from localStorage or URL params
	function loadExtractedData() {
		try {
			// Try to get data from localStorage first
			const storedData = localStorage.getItem('laytime_extraction_data');
			if (storedData) {
				const data = JSON.parse(storedData);
				populateForm(data);
				return;
			}

			// Fallback: try to get from URL params
			const urlParams = new URLSearchParams(window.location.search);
			const extractionId = urlParams.get('id');
			if (extractionId) {
				// In a real app, you'd fetch from API using this ID
				console.log('Extraction ID:', extractionId);
			}
		} catch (error) {
			console.error('Error loading extracted data:', error);
		}
	}

	// Populate form with extracted data
	function populateForm(data) {
		if (data.business_data) {
			const bd = data.business_data;
			
			// Set form values
			setFieldValue('f-vessel', bd.vessel);
			setFieldValue('f-from', bd.voyage_from);
			setFieldValue('f-to', bd.voyage_to);
			setFieldValue('f-cargo', bd.cargo);
			setFieldValue('f-port', bd.port);
			setFieldValue('f-allowed', bd.allowed_laytime);
			setFieldValue('f-demurrage', bd.demurrage);
			setFieldValue('f-dispatch', bd.dispatch);
			setFieldValue('f-rate', bd.rate);
			setFieldValue('f-qty', bd.quantity);
			
			// Set operation dropdown
			if (bd.operation) {
				const operationSelect = document.getElementById('f-operation');
				if (operationSelect) {
					operationSelect.value = bd.operation;
				}
			}
		}
	}

	// Helper function to set field values
	function setFieldValue(fieldId, value) {
		const field = document.getElementById(fieldId);
		if (field && value != null && value !== '') {
			field.value = value;
		}
	}

	// Calculate button - shows results on the right panel while keeping form on left
	const calcBtn = document.getElementById('calc-btn');
	if (calcBtn) {
		calcBtn.addEventListener('click', () => {
			// Store form data
			const formData = {
				vessel: document.getElementById('f-vessel')?.value || '',
				from: document.getElementById('f-from')?.value || '',
				to: document.getElementById('f-to')?.value || '',
				cargo: document.getElementById('f-cargo')?.value || '',
				port: document.getElementById('f-port')?.value || '',
				operation: document.getElementById('f-operation')?.value || 'discharge',
				allowed: document.getElementById('f-allowed')?.value || '',
				demurrage: document.getElementById('f-demurrage')?.value || '',
				dispatch: document.getElementById('f-dispatch')?.value || '',
				rate: document.getElementById('f-rate')?.value || '',
				qty: document.getElementById('f-qty')?.value || ''
			};
			
			// Store in localStorage for the calculate page
			try { 
				localStorage.setItem('laytime_prefill', JSON.stringify(formData)); 
			} catch (error) {
				console.error('Error saving form data:', error);
			}
			
			// Hide initial state and show results content on the right panel
			const initialState = document.getElementById('initial-state');
			const resultsContent = document.getElementById('results-content');
			
			initialState.style.display = 'none';
			resultsContent.classList.remove('hidden');
			
			// Calculate and populate results
			calculateLaytimeResults(formData);
		});
	}

	// Calculate laytime results and populate the results panel
	function calculateLaytimeResults(formData) {
		// Basic laytime calculation
		const allowedLaytime = parseFloat(formData.allowed) || 0;
		const cargoQty = parseFloat(formData.qty) || 0;
		const rate = parseFloat(formData.rate) || 0;
		
		// Calculate theoretical laytime needed
		const theoreticalLaytime = rate > 0 ? cargoQty / rate : 0;
		
		// Update laytime allowed display
		const laytimeAllowedEl = document.getElementById('laytime-allowed');
		if (laytimeAllowedEl) {
			laytimeAllowedEl.textContent = `${allowedLaytime.toFixed(2)} Days`;
		}
		
		// Sample events for demonstration - matching the screenshot style
		const sampleEvents = [
			{
				event: "VESSEL END OF SEA PASSAGE",
				day: "SUN",
				start: "24 Dec, 2023 06:00",
				end: "24 Dec, 2023 06:00",
				utilization: "00h:00m",
				percent: "0",
				consumed: "00h:00m",
				remaining: allowedLaytime.toFixed(1)
			},
			{
				event: "PILOT ON BOARD",
				day: "SUN",
				start: "24 Dec, 2023 08:00",
				end: "24 Dec, 2023 10:00",
				utilization: "02h:00m",
				percent: "0",
				consumed: "00h:00m",
				remaining: allowedLaytime.toFixed(1)
			},
			{
				event: "TWO TUGS MADE FAST",
				day: "SUN",
				start: "24 Dec, 2023 10:00",
				end: "24 Dec, 2023 10:30",
				utilization: "00h:30m",
				percent: "0",
				consumed: "00h:00m",
				remaining: allowedLaytime.toFixed(1)
			},
			{
				event: "FIRST LINE ASHORE",
				day: "SUN",
				start: "24 Dec, 2023 10:30",
				end: "24 Dec, 2023 11:00",
				utilization: "00h:30m",
				percent: "0",
				consumed: "00h:00m",
				remaining: allowedLaytime.toFixed(1)
			},
			{
				event: "ALL LINES MADE FAST SST ALONGSIDE BERTH #9 / GANGWAY LOWERED & PILOT OFF",
				day: "SUN",
				start: "24 Dec, 2023 11:00",
				end: "24 Dec, 2023 12:00",
				utilization: "01h:00m",
				percent: "0",
				consumed: "00h:00m",
				remaining: allowedLaytime.toFixed(1)
			},
			{
				event: "AGENT AND PORT HEALTH OFFICERS ON BOARD / FREE PRATIQUE GRANTED",
				day: "SUN",
				start: "24 Dec, 2023 12:00",
				end: "24 Dec, 2023 13:00",
				utilization: "01h:00m",
				percent: "0",
				consumed: "00h:00m",
				remaining: allowedLaytime.toFixed(1)
			},
			{
				event: "DISCHARGE IN STEADY PROGRESS IN HOLDS 1,2,3 AND 4",
				day: "SUN",
				start: "24 Dec, 2023 13:00",
				end: "24 Dec, 2023 15:42",
				utilization: "02h:42m",
				percent: "0",
				consumed: "00h:00m",
				remaining: allowedLaytime.toFixed(1)
			}
		];
		
		populateEventsTable(sampleEvents);
	}

	// Populate events table with sample data
	function populateEventsTable(events) {
		const tbody = document.getElementById('events-tbody');
		if (!tbody) return;
		
		tbody.innerHTML = events.map(event => `
			<tr>
				<td style="max-width: 200px; word-wrap: break-word;">${event.event}</td>
				<td>${event.day}</td>
				<td>${event.start}</td>
				<td>${event.end}</td>
				<td>${event.utilization}</td>
				<td><input type="text" class="percent-input" value="${event.percent}" placeholder="%" /></td>
				<td>${event.consumed}</td>
				<td>${event.remaining}</td>
				<td class="action-links">
					<a href="#" onclick="editEvent(this)">Edit</a>
					<a href="#" onclick="deleteEvent(this)">Delete</a>
				</td>
			</tr>
		`).join('');
	}

	// Add event functionality
	const addEventBtn = document.getElementById('add-event-btn');
	if (addEventBtn) {
		addEventBtn.addEventListener('click', () => {
			const eventInput = document.getElementById('new-event');
			const startInput = document.getElementById('start-datetime');
			const endInput = document.getElementById('end-datetime');
			
			if (!eventInput.value.trim()) {
				alert('Please enter an event description');
				return;
			}
			
			if (!startInput.value || !endInput.value) {
				alert('Please enter both start and end times');
				return;
			}
			
			// Add new event to table
			const tbody = document.getElementById('events-tbody');
			if (tbody) {
				const newRow = document.createElement('tr');
				const startDate = new Date(startInput.value);
				const endDate = new Date(endInput.value);
				const duration = Math.abs(endDate - startDate) / (1000 * 60); // minutes
				const hours = Math.floor(duration / 60);
				const minutes = duration % 60;
				const utilization = `${hours.toString().padStart(2, '0')}h:${minutes.toString().padStart(2, '0')}m`;
				
				newRow.innerHTML = `
					<td style="max-width: 200px; word-wrap: break-word;">${eventInput.value}</td>
					<td>${startDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</td>
					<td>${startDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} ${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</td>
					<td>${endDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</td>
					<td>${utilization}</td>
					<td><input type="text" class="percent-input" value="0" placeholder="%" /></td>
					<td>00h:00m</td>
					<td>4.7</td>
					<td class="action-links">
						<a href="#" onclick="editEvent(this)">Edit</a>
						<a href="#" onclick="deleteEvent(this)">Delete</a>
					</td>
				`;
				
				tbody.appendChild(newRow);
				
				// Clear inputs
				eventInput.value = '';
				startInput.value = '';
				endInput.value = '';
			}
		});
	}

	// Global functions for event actions
	window.editEvent = function(link) {
		const row = link.closest('tr');
		const eventCell = row.cells[0];
		const currentEvent = eventCell.textContent;
		
		const newEvent = prompt('Edit event:', currentEvent);
		if (newEvent && newEvent.trim()) {
			eventCell.textContent = newEvent.trim();
		}
	};

	window.deleteEvent = function(link) {
		const row = link.closest('tr');
		if (confirm('Are you sure you want to delete this event?')) {
			row.remove();
		}
	};

	// Initialize the page
	loadExtractedData();
})();
