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

	// Chart.js pie chart instance
	let laytimeChart = null;

	// Initialize pie chart
	function initializeChart() {
		const ctx = document.getElementById('laytimeChart');
		if (ctx) {
			laytimeChart = new Chart(ctx, {
				type: 'pie',
				data: {
					labels: ['Required Time', 'Time Saved'],
					datasets: [{
						data: [0, 0],
						backgroundColor: [
							'#ef4444', // Red for required time
							'#10b981'  // Green for time saved
						],
						borderWidth: 2,
						borderColor: '#ffffff'
					}]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							position: 'bottom',
							labels: {
								padding: 20,
								usePointStyle: true,
								font: {
									size: 12
								}
							}
						},
						tooltip: {
							callbacks: {
								label: function(context) {
									const label = context.label || '';
									const value = context.parsed || 0;
									return `${label}: ${value.toFixed(2)} days`;
								}
							}
						}
					}
				}
			});
		}
	}

	// Update pie chart with new data
	function updateChart(required, allowed) {
		if (laytimeChart) {
			const delta = Math.max(0, allowed - required);
			const used = Math.min(required, allowed);
			
			laytimeChart.data.datasets[0].data = [used, delta];
			laytimeChart.update();
		}
	}

	// Initialize chart when page loads
	document.addEventListener('DOMContentLoaded', function() {
		initializeChart();
	});

	// Prefill from localStorage if present
	try {
		const raw = localStorage.getItem('laytime_prefill');
		if (raw){
			const p = JSON.parse(raw);
			function setVal(id, val){ const el = document.getElementById(id); if (el && val && !el.value) el.value = val; }
			setVal('c-vessel', p.vessel);
			setVal('c-from', p.from);
			setVal('c-to', p.to);
			setVal('c-cargo', p.cargo);
			setVal('c-port', p.port);
			if (p.operation){ const sel = document.getElementById('c-operation'); if (sel && !sel.value) sel.value = p.operation; }
			setVal('c-allowed', p.allowed);
			setVal('c-demurrage', p.demurrage);
			setVal('c-dispatch', p.dispatch);
			setVal('c-rate', p.rate);
			setVal('c-qty', p.qty);
		}
	} catch {}

	function num(id){ return Number(document.getElementById(id).value || 0); }
	function text(id){ return String(document.getElementById(id).value || '').trim(); }
	function fmt(n){ return n.toLocaleString(undefined, { maximumFractionDigits: 2 }); }

	document.getElementById('c-calc').addEventListener('click', function(){
		const qty = num('c-qty');
		const rate = Math.max(num('c-rate'), 1);
		const allowed = Math.max(num('c-allowed'), 0);
		const demurrage = num('c-demurrage');
		const dispatch = num('c-dispatch');

		const daysRequired = qty / rate;
		const diff = +(daysRequired - allowed).toFixed(2);
		const isDemurrage = diff > 0;
		const days = Math.abs(diff);
		const amountPerDay = isDemurrage ? demurrage : dispatch;
		const amount = +(days * amountPerDay).toFixed(2);

		// Update pie chart
		updateChart(daysRequired, allowed);

		const output = document.getElementById('c-output');
		output.innerHTML = `
			<div class="vessel-info">
				<div class="vessel-name">${text('c-vessel')} — ${text('c-port')}</div>
				<div class="vessel-route">${text('c-from')} → ${text('c-to')} • ${text('c-operation')}</div>
			</div>
			
			<div class="calculation-type">
				<div class="type-badge ${isDemurrage ? 'demurrage' : 'dispatch'}">
					${isDemurrage ? 'DEMURRAGE' : 'DISPATCH'}
				</div>
			</div>
			
			<div class="features">
				<div class="feature">
					<h3>Required</h3>
					<p>${fmt(daysRequired)} days</p>
				</div>
				<div class="feature">
					<h3>Allowed</h3>
					<p>${fmt(allowed)} days</p>
				</div>
				<div class="feature">
					<h3>Delta</h3>
					<p>${fmt(days)} days ${isDemurrage ? 'over' : 'saved'}</p>
				</div>
			</div>
			
			<div class="total-amount">
				<h3>Total ${isDemurrage ? 'Demurrage' : 'Dispatch'}</h3>
				<p class="amount-value">$${fmt(amount)}</p>
			</div>
		`;
	});
})();
