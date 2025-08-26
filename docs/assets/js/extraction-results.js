(function(){
	const yearEl = document.getElementById('year');
	if (yearEl) yearEl.textContent = new Date().getFullYear();

	// User Profile Dropdown Functionality
	function setupUserProfile() {
		const userProfile = document.getElementById('userProfile');
		const dropdownMenu = document.getElementById('dropdownMenu');
		
		if (userProfile && dropdownMenu) {
			userProfile.addEventListener('click', function(e) {
				e.stopPropagation();
				dropdownMenu.classList.toggle('show');
			});
			
			// Close dropdown when clicking outside
			document.addEventListener('click', function() {
				dropdownMenu.classList.remove('show');
			});
		}
	}

	function showAccountDetails() {
		alert('Account details functionality coming soon!');
	}

	function logout() {
		// Clear any stored data
		localStorage.clear();
		// Redirect to login page
		window.location.href = 'index.html';
	}

	// Initialize user profile functionality
	document.addEventListener('DOMContentLoaded', function() {
		setupUserProfile();
	});

	// Load extracted data from localStorage or URL params
	function loadExtractedData() {
		try {
			console.log('Loading extracted data...');
			
			// Try to get data from dashboard upload first
			const extractionResults = localStorage.getItem('extraction_results');
			const uploadedFileName = localStorage.getItem('uploaded_file_name');
			
			if (extractionResults && uploadedFileName) {
				console.log('Found extraction results from dashboard:', extractionResults);
				console.log('Uploaded file name:', uploadedFileName);
				
				const data = JSON.parse(extractionResults);
				
				// Update the page title and breadcrumb to show the uploaded file
				if (uploadedFileName) {
					document.title = `Laytime Calculator • ${uploadedFileName}`;
					const breadcrumb = document.querySelector('.breadcrumb span');
					if (breadcrumb) {
						breadcrumb.textContent = uploadedFileName;
					}
				}
				
				populateForm(data);
				
				// Clear the localStorage after loading to prevent issues on refresh
				// localStorage.removeItem('extraction_results');
				// localStorage.removeItem('uploaded_file_name');
				
				return;
			}

			// Fallback: try to get data from old localStorage key
			const storedData = localStorage.getItem('laytime_extraction_data');
			if (storedData) {
				console.log('Found legacy extraction data');
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
			
			console.log('No extraction data found');
		} catch (error) {
			console.error('Error loading extracted data:', error);
		}
	}

	// Populate form with extracted data
	function populateForm(data) {
		console.log('=== POPULATE FORM CALLED ===');
		console.log('Data received:', data);
		
		if (data.business_data) {
			const bd = data.business_data;
			console.log('Business data found:', bd);
			
			// Set form values with detailed logging
			console.log('Setting vessel:', bd.vessel);
			setFieldValue('f-vessel', bd.vessel);
			
			console.log('Setting voyage_from:', bd.voyage_from);
			setFieldValue('f-from', bd.voyage_from);
			
			console.log('Setting voyage_to:', bd.voyage_to);
			setFieldValue('f-to', bd.voyage_to);
			
			console.log('Setting cargo:', bd.cargo);
			setFieldValue('f-cargo', bd.cargo);
			
			console.log('Setting port:', bd.port);
			setFieldValue('f-port', bd.port);
			
			console.log('Setting allowed_laytime:', bd.allowed_laytime);
			setFieldValue('f-allowed', bd.allowed_laytime);
			
			console.log('Setting demurrage:', bd.demurrage);
			setFieldValue('f-demurrage', bd.demurrage);
			
			console.log('Setting dispatch:', bd.dispatch);
			setFieldValue('f-dispatch', bd.dispatch);
			
			console.log('Setting rate:', bd.rate);
			setFieldValue('f-rate', bd.rate);
			
			console.log('Setting quantity:', bd.quantity);
			setFieldValue('f-qty', bd.quantity);
			
			// Set operation dropdown
			if (bd.operation) {
				console.log('Setting operation:', bd.operation);
				const operationSelect = document.getElementById('f-operation');
				if (operationSelect) {
					operationSelect.value = bd.operation;
					console.log('Operation set to:', operationSelect.value);
				} else {
					console.error('Operation select element not found');
				}
			}
			
			console.log('Form population completed');
		} else {
			console.error('No business_data found in response');
			console.log('Available data keys:', Object.keys(data));
		}
	}

	// Helper function to set field values
	function setFieldValue(fieldId, value) {
		console.log(`Setting field ${fieldId} to value: ${value}`);
		const field = document.getElementById(fieldId);
		if (field) {
			console.log(`Field ${fieldId} found, setting value`);
			if (value != null && value !== '') {
				field.value = value;
				console.log(`Field ${fieldId} value set to: ${field.value}`);
			} else {
				console.log(`Field ${fieldId} value is null/empty, skipping`);
			}
		} else {
			console.error(`Field ${fieldId} NOT FOUND in DOM`);
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
			
			// Show export buttons
			showExportButtons();
			
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

	// Export Functions
	window.exportToPDF = function() {
		generatePDF();
	};

	window.exportToExcel = function() {
		generateExcel();
	};

	window.exportToJSON = function() {
		generateJSON();
	};

	window.exportToCSV = function() {
		generateCSV();
	};

	// PDF Generation
	function generatePDF() {
		try {
			// Get current data
			const formData = getCurrentFormData();
			const eventsData = getCurrentEventsData();
			const laytimeData = getCurrentLaytimeData();
			
			// Create PDF content using jsPDF
			if (typeof jsPDF !== 'undefined') {
				createPDFReport(formData, eventsData, laytimeData);
			} else {
				// Fallback: download as HTML for PDF conversion
				downloadAsHTML(formData, eventsData, laytimeData);
			}
		} catch (error) {
			console.error('PDF generation failed:', error);
			alert('PDF generation failed. Please try again.');
		}
	}

	// Create PDF Report using jsPDF
	function createPDFReport(formData, eventsData, laytimeData) {
		const { jsPDF } = window.jspdf;
		const doc = new jsPDF();
		
		// Set document properties
		doc.setProperties({
			title: 'Laytime Calculation Report',
			subject: 'Vessel Laytime Analysis',
			author: 'MariThon Laytime Calculator',
			creator: 'MariThon System'
		});
		
		let yPos = 20;
		const pageWidth = doc.internal.pageSize.width;
		const margin = 20;
		const contentWidth = pageWidth - (2 * margin);
		
		// Title
		doc.setFontSize(20);
		doc.setFont('helvetica', 'bold');
		doc.text('Laytime Calculation Report', pageWidth / 2, yPos, { align: 'center' });
		yPos += 15;
		
		// Date
		doc.setFontSize(12);
		doc.setFont('helvetica', 'normal');
		doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
		yPos += 20;
		
		// Vessel and Cargo Details
		doc.setFontSize(16);
		doc.setFont('helvetica', 'bold');
		doc.text('Vessel and Cargo Details', margin, yPos);
		yPos += 10;
		
		doc.setFontSize(10);
		doc.setFont('helvetica', 'normal');
		
		const formFields = [
			['Vessel:', formData.vessel],
			['Voyage From:', formData.voyageFrom],
			['Voyage To:', formData.voyageTo],
			['Cargo:', formData.cargo],
			['Port:', formData.port],
			['Operation:', formData.operation]
		];
		
		formFields.forEach(([label, value]) => {
			doc.text(`${label} ${value}`, margin, yPos);
			yPos += 6;
		});
		
		yPos += 10;
		
		// Laytime Parameters
		doc.setFontSize(16);
		doc.setFont('helvetica', 'bold');
		doc.text('Laytime Parameters', margin, yPos);
		yPos += 10;
		
		doc.setFontSize(10);
		doc.setFont('helvetica', 'normal');
		
		const paramFields = [
			['Allowed Laytime:', `${formData.allowedLaytime} days`],
			['Demurrage:', `$${formData.demurrage}/day`],
			['Dispatch:', `$${formData.dispatch}/day`],
			['Rate:', `${formData.rate} MT/day`],
			['Quantity:', `${formData.quantity} MT`]
		];
		
		paramFields.forEach(([label, value]) => {
			doc.text(`${label} ${value}`, margin, yPos);
			yPos += 6;
		});
		
		yPos += 10;
		
		// Laytime Summary
		doc.setFontSize(16);
		doc.setFont('helvetica', 'bold');
		doc.text('Laytime Summary', margin, yPos);
		yPos += 10;
		
		doc.setFontSize(10);
		doc.setFont('helvetica', 'normal');
		doc.text(`Laytime Allowed: ${laytimeData.laytimeAllowed}`, margin, yPos);
		yPos += 15;
		
		// Events Timeline
		if (eventsData.length > 0) {
			doc.setFontSize(16);
			doc.setFont('helvetica', 'bold');
			doc.text('Events Timeline', margin, yPos);
			yPos += 10;
			
			// Check if we need a new page
			if (yPos > 250) {
				doc.addPage();
				yPos = 20;
			}
			
			// Create table headers
			const headers = ['Event', 'Day', 'Start', 'End', 'Utilization', '%', 'Consumed', 'Remaining'];
			const colWidths = [40, 20, 30, 30, 25, 15, 25, 25];
			let xPos = margin;
			
			// Draw table headers
			doc.setFontSize(9);
			doc.setFont('helvetica', 'bold');
			headers.forEach((header, index) => {
				doc.text(header, xPos, yPos);
				xPos += colWidths[index];
			});
			
			yPos += 8;
			
			// Draw table rows
			doc.setFontSize(8);
			doc.setFont('helvetica', 'normal');
			
			eventsData.forEach(event => {
				// Check if we need a new page
				if (yPos > 270) {
					doc.addPage();
					yPos = 20;
				}
				
				xPos = margin;
				const rowData = [
					event.event,
					event.day,
					event.startDateTime,
					event.endDateTime,
					event.timeUtilization,
					event.percentUtilization,
					event.laytimeConsumed,
					event.laytimeRemaining
				];
				
				rowData.forEach((cell, index) => {
					// Truncate long text
					const cellText = cell.length > 15 ? cell.substring(0, 12) + '...' : cell;
					doc.text(cellText, xPos, yPos);
					xPos += colWidths[index];
				});
				
				yPos += 6;
			});
		}
		
		// Save the PDF
		doc.save('laytime-calculation-report.pdf');
	}

	// Excel Generation
	function generateExcel() {
		try {
			const formData = getCurrentFormData();
			const eventsData = getCurrentEventsData();
			const laytimeData = getCurrentLaytimeData();
			
			// Create Excel file using SheetJS
			if (typeof XLSX !== 'undefined') {
				createExcelFile(formData, eventsData, laytimeData);
			} else {
				// Fallback: download as CSV
				generateCSV();
			}
		} catch (error) {
			console.error('Excel generation failed:', error);
			alert('Excel generation failed. Please try again.');
		}
	}

	// Create Excel File using SheetJS
	function createExcelFile(formData, eventsData, laytimeData) {
		// Create workbook
		const wb = XLSX.utils.book_new();
		
		// Create Summary sheet
		const summaryData = [
			['Laytime Calculation Report'],
			['Generated on:', new Date().toLocaleDateString()],
			[''],
			['Vessel and Cargo Details'],
			['Field', 'Value'],
			['Vessel', formData.vessel],
			['Voyage From', formData.voyageFrom],
			['Voyage To', formData.voyageTo],
			['Cargo', formData.cargo],
			['Port', formData.port],
			['Operation', formData.operation],
			[''],
			['Laytime Parameters'],
			['Field', 'Value'],
			['Allowed Laytime', `${formData.allowedLaytime} days`],
			['Demurrage', `$${formData.demurrage}/day`],
			['Dispatch', `$${formData.dispatch}/day`],
			['Rate', `${formData.rate} MT/day`],
			['Quantity', `${formData.quantity} MT`],
			[''],
			['Laytime Summary'],
			['Field', 'Value'],
			['Laytime Allowed', laytimeData.laytimeAllowed],
			['Calculation Date', laytimeData.calculationDate]
		];
		
		const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
		XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
		
		// Create Events sheet if there are events
		if (eventsData.length > 0) {
			const eventsHeaders = [
				'Event',
				'Day',
				'Start Date Time',
				'End Date Time',
				'Time Utilization',
				'% Utilization',
				'Laytime Consumed',
				'Laytime Remaining'
			];
			
			const eventsSheetData = [eventsHeaders];
			eventsData.forEach(event => {
				eventsSheetData.push([
					event.event,
					event.day,
					event.startDateTime,
					event.endDateTime,
					event.timeUtilization,
					event.percentUtilization,
					event.laytimeConsumed,
					event.laytimeRemaining
				]);
			});
			
			const eventsSheet = XLSX.utils.aoa_to_sheet(eventsSheetData);
			XLSX.utils.book_append_sheet(wb, eventsSheet, 'Events');
		}
		
		// Create Raw Data sheet
		const rawData = [
			['Category', 'Field', 'Value']
		];
		
		// Add form data
		Object.entries(formData).forEach(([key, value]) => {
			rawData.push(['Form Data', key, value]);
		});
		
		// Add events data
		eventsData.forEach((event, index) => {
			Object.entries(event).forEach(([key, value]) => {
				rawData.push([`Event ${index + 1}`, key, value]);
			});
		});
		
		// Add laytime data
		Object.entries(laytimeData).forEach(([key, value]) => {
			rawData.push(['Laytime', key, value]);
		});
		
		const rawDataSheet = XLSX.utils.aoa_to_sheet(rawData);
		XLSX.utils.book_append_sheet(wb, rawDataSheet, 'Raw Data');
		
		// Save the Excel file
		XLSX.writeFile(wb, 'laytime-calculation.xlsx');
	}

	// JSON Generation
	function generateJSON() {
		try {
			const exportData = {
				metadata: {
					exportDate: new Date().toISOString(),
					version: '1.0',
					source: 'MariThon Laytime Calculator'
				},
				formData: getCurrentFormData(),
				eventsData: getCurrentEventsData(),
				laytimeData: getCurrentLaytimeData()
			};
			
			const jsonString = JSON.stringify(exportData, null, 2);
			downloadFile(jsonString, 'laytime-calculation.json', 'application/json');
		} catch (error) {
			console.error('JSON generation failed:', error);
			alert('JSON generation failed. Please try again.');
		}
	}

	// CSV Generation
	function generateCSV() {
		try {
			const formData = getCurrentFormData();
			const eventsData = getCurrentEventsData();
			const laytimeData = getCurrentLaytimeData();
			
			// Create CSV content
			const csvContent = createCSVContent(formData, eventsData, laytimeData);
			downloadFile(csvContent, 'laytime-calculation.csv', 'text/csv');
		} catch (error) {
			console.error('CSV generation failed:', error);
			alert('CSV generation failed. Please try again.');
		}
	}

	// Helper Functions
	function getCurrentFormData() {
		return {
			vessel: document.getElementById('f-vessel')?.value || '',
			voyageFrom: document.getElementById('f-from')?.value || '',
			voyageTo: document.getElementById('f-to')?.value || '',
			cargo: document.getElementById('f-cargo')?.value || '',
			port: document.getElementById('f-port')?.value || '',
			operation: document.getElementById('f-operation')?.value || 'discharge',
			allowedLaytime: document.getElementById('f-allowed')?.value || '',
			demurrage: document.getElementById('f-demurrage')?.value || '',
			dispatch: document.getElementById('f-dispatch')?.value || '',
			rate: document.getElementById('f-rate')?.value || '',
			quantity: document.getElementById('f-qty')?.value || ''
		};
	}

	function getCurrentEventsData() {
		const tbody = document.getElementById('events-tbody');
		if (!tbody) return [];
		
		const events = [];
		const rows = tbody.querySelectorAll('tr');
		
		rows.forEach(row => {
			const cells = row.querySelectorAll('td');
			if (cells.length >= 8) {
				events.push({
					event: cells[0].textContent.trim(),
					day: cells[1].textContent.trim(),
					startDateTime: cells[2].textContent.trim(),
					endDateTime: cells[3].textContent.trim(),
					timeUtilization: cells[4].textContent.trim(),
					percentUtilization: cells[5].querySelector('input')?.value || '0',
					laytimeConsumed: cells[6].textContent.trim(),
					laytimeRemaining: cells[7].textContent.trim()
				});
			}
		});
		
		return events;
	}

	function getCurrentLaytimeData() {
		return {
			laytimeAllowed: document.getElementById('laytime-allowed')?.textContent || '0.00 Days',
			calculationDate: new Date().toISOString()
		};
	}

	function createCSVContent(formData, eventsData, laytimeData) {
		let csv = 'Category,Field,Value\n';
		
		// Form data
		Object.entries(formData).forEach(([key, value]) => {
			csv += `Form Data,${key},${value}\n`;
		});
		
		// Events data
		eventsData.forEach((event, index) => {
			Object.entries(event).forEach(([key, value]) => {
				csv += `Event ${index + 1},${key},${value}\n`;
			});
		});
		
		// Laytime data
		Object.entries(laytimeData).forEach(([key, value]) => {
			csv += `Laytime,${key},${value}\n`;
		});
		
		return csv;
	}

	function downloadFile(content, filename, mimeType) {
		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function downloadAsHTML(formData, eventsData, laytimeData) {
		const htmlContent = createHTMLReport(formData, eventsData, laytimeData);
		downloadFile(htmlContent, 'laytime-calculation.html', 'text/html');
	}

	function createHTMLReport(formData, eventsData, laytimeData) {
		return `
<!DOCTYPE html>
<html>
<head>
    <title>Laytime Calculation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .form-item { margin-bottom: 15px; }
        .form-item label { font-weight: bold; display: block; margin-bottom: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laytime Calculation Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="section">
        <h2>Vessel and Cargo Details</h2>
        <div class="form-grid">
            <div class="form-item">
                <label>Vessel:</label>
                <span>${formData.vessel}</span>
            </div>
            <div class="form-item">
                <label>Voyage From:</label>
                <span>${formData.voyageFrom}</span>
            </div>
            <div class="form-item">
                <label>Voyage To:</label>
                <span>${formData.voyageTo}</span>
            </div>
            <div class="form-item">
                <label>Cargo:</label>
                <span>${formData.cargo}</span>
            </div>
            <div class="form-item">
                <label>Port:</label>
                <span>${formData.port}</span>
            </div>
            <div class="form-item">
                <label>Operation:</label>
                <span>${formData.operation}</span>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>Laytime Parameters</h2>
        <div class="form-grid">
            <div class="form-item">
                <label>Allowed Laytime:</label>
                <span>${formData.allowedLaytime} days</span>
            </div>
            <div class="form-item">
                <label>Demurrage:</label>
                <span>$${formData.demurrage}/day</span>
            </div>
            <div class="form-item">
                <label>Dispatch:</label>
                <span>$${formData.dispatch}/day</span>
            </div>
            <div class="form-item">
                <label>Rate:</label>
                <span>${formData.rate} MT/day</span>
            </div>
            <div class="form-item">
                <label>Quantity:</label>
                <span>${formData.quantity} MT</span>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>Laytime Summary</h2>
        <p><strong>Laytime Allowed:</strong> ${laytimeData.laytimeAllowed}</p>
    </div>
    
    <div class="section">
        <h2>Events Timeline</h2>
        <table>
            <thead>
                <tr>
                    <th>Event</th>
                    <th>Day</th>
                    <th>Start Date Time</th>
                    <th>End Date Time</th>
                    <th>Time Utilization</th>
                    <th>% Utilization</th>
                    <th>Laytime Consumed</th>
                    <th>Laytime Remaining</th>
                </tr>
            </thead>
            <tbody>
                ${eventsData.map(event => `
                    <tr>
                        <td>${event.event}</td>
                        <td>${event.day}</td>
                        <td>${event.startDateTime}</td>
                        <td>${event.endDateTime}</td>
                        <td>${event.timeUtilization}</td>
                        <td>${event.percentUtilization}%</td>
                        <td>${event.laytimeConsumed}</td>
                        <td>${event.laytimeRemaining}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;
	}

	// Show export button when results are displayed
	function showExportButtons() {
		const exportButton = document.getElementById('export-button');
		if (exportButton) {
			exportButton.classList.remove('hidden');
		}
	}

	// Show export popup
	window.showExportPopup = function() {
		const popup = document.getElementById('export-popup-overlay');
		if (popup) {
			popup.classList.remove('hidden');
		}
	};

	// Hide export popup
	window.hideExportPopup = function() {
		const popup = document.getElementById('export-popup-overlay');
		if (popup) {
			popup.classList.add('hidden');
		}
	};

	// Close popup when clicking outside
	document.addEventListener('click', function(event) {
		const popup = document.getElementById('export-popup-overlay');
		if (popup && event.target === popup) {
			hideExportPopup();
		}
	});

	// Close popup with Escape key
	document.addEventListener('keydown', function(event) {
		if (event.key === 'Escape') {
			hideExportPopup();
		}
	});

	// Initialize the page
	loadExtractedData();
})();
