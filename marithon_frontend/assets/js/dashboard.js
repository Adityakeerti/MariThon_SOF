(function(){
	const yearEl = document.getElementById('year');
	if (yearEl) yearEl.textContent = new Date().getFullYear();

	// Tabs
	const tabs = Array.from(document.querySelectorAll('.tab'));
	const panels = {
		automated: document.getElementById('panel-automated'),
		manual: document.getElementById('panel-manual'),
		saved: document.getElementById('panel-saved')
	};
	tabs.forEach(tab => {
		tab.addEventListener('click', () => {
			tabs.forEach(t => t.classList.remove('active'));
			tab.classList.add('active');
			Object.values(panels).forEach(p => p.classList.add('hidden'));
			panels[tab.dataset.tab].classList.remove('hidden');
		});
	});

	// Dropzones
	let sofFile = null;
	let cpFile = null;
	const zones = Array.from(document.querySelectorAll('.dropzone'));
	zones.forEach((zone, idx) => {
		const input = zone.querySelector('input[type="file"]');
		const fileName = zone.querySelector('.file-name');

		function setName(name){ fileName.textContent = name || 'No file chosen'; }

		zone.addEventListener('click', () => input.click());
		zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
		zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
		zone.addEventListener('drop', (e) => {
			e.preventDefault(); zone.classList.remove('dragover');
			const file = e.dataTransfer.files && e.dataTransfer.files[0];
			if (file && file.type === 'application/pdf') {
				setName(file.name);
				if (idx === 0) sofFile = file; else cpFile = file;
			} else if (file) {
				alert('Please upload a PDF file.');
			}
		});
		input.addEventListener('change', () => {
			const f = input.files[0];
			setName(f ? f.name : '');
			if (f && f.type === 'application/pdf') { if (idx === 0) sofFile = f; else cpFile = f; }
		});
	});

	// Extraction + Redirect to Results Page
	const API_BASE = (window.API_BASE || 'http://localhost:8000').replace(/\/$/, '');
	const autoSubmit = document.getElementById('submit-automated');
	
	if (autoSubmit) {
		autoSubmit.addEventListener('click', async () => {
			if (!sofFile) { alert('Please upload the SoF PDF first.'); return; }
			try {
				autoSubmit.disabled = true;
				autoSubmit.textContent = 'Processing...';
				
				const fd = new FormData();
				fd.append('file', sofFile);
				
				console.log('Uploading file:', sofFile.name, 'to:', `${API_BASE}/extract`);
				console.log('File size:', sofFile.size, 'bytes');
				
				let res = await fetch(`${API_BASE}/extract?debug=true`, { method: 'POST', body: fd });
				console.log('Response status:', res.status, res.statusText);
				
				if (!res.ok) {
					const errorText = await res.text();
					console.error('Error response body:', errorText);
					throw new Error(`Server error ${res.status}: ${errorText}`);
				}
				
				let data = await res.json();
				console.log('Parsed data:', data);
				
				// If parsing looks bad (image-based PDF), retry with OCR
				const looksEmpty = !data.business_data || (
					Object.values(data.business_data).filter(v => v != null && v !== '').length <= 1
				);
				if ((data.meta && Number(data.meta.num_lines || 0) <= 5) || looksEmpty) {
					autoSubmit.textContent = 'Retrying with OCR...';
					const fd2 = new FormData();
					fd2.append('file', sofFile);
					res = await fetch(`${API_BASE}/extract?debug=true&force_ocr=true`, { method: 'POST', body: fd2 });
					if (res.ok) { data = await res.json(); }
				}
				
				// Store extraction data in localStorage
				try {
					localStorage.setItem('laytime_extraction_data', JSON.stringify(data));
				} catch (error) {
					console.error('Error storing extraction data:', error);
				}
				
				// Redirect to extraction results page
				window.location.href = 'extraction-results.html';
				
			} catch (err){
				console.error('Detailed error:', err);
				console.error('Error response:', err.response);
				console.error('Error message:', err.message);
				
				let errorMessage = 'Parsing failed. ';
				if (err.message.includes('Failed to fetch')) {
					errorMessage += 'Cannot connect to the backend server. Please ensure the backend is running on http://localhost:8000';
				} else if (err.message.includes('Server error')) {
					errorMessage += 'Server error occurred. Please check the backend logs.';
				} else {
					errorMessage += 'Please check the file and try again.';
				}
				
				alert(errorMessage);
			} finally {
				autoSubmit.disabled = false;
				autoSubmit.textContent = 'Submit';
			}
		});
	}

	// Saved mock
	const savedList = document.getElementById('saved-list');
	if (savedList) {
		const data = [
			{ id: 'LT-24001', port: 'Mundra', vessel: 'MV Ocean Star', date: '2025-02-10' },
			{ id: 'LT-23988', port: 'Singapore', vessel: 'MV Meridian', date: '2025-02-08' }
		];
		savedList.innerHTML = data.map(item => `
			<div class="saved-item">
				<div>
					<strong>${item.id}</strong> — ${item.vessel} @ ${item.port}
					<div class="meta">Saved on ${item.date}</div>
				</div>
				<div>
					<button class="btn btn-ghost">Open</button>
					<button class="btn btn-accent">Export</button>
				</div>
			</div>`).join('');
	}
})();
