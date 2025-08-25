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

		const output = document.getElementById('c-output');
		output.innerHTML = `
			<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
				<div>
					<div style="font-weight:800;font-size:18px;color:var(--color-primary)">${text('c-vessel')} — ${text('c-port')}</div>
					<div style="color:#6b7280">${text('c-from')} → ${text('c-to')} • ${text('c-operation')}</div>
				</div>
				<div class="btn ${isDemurrage ? 'btn-primary' : 'btn-accent'}" style="pointer-events:none">${isDemurrage ? 'DEMURRAGE' : 'DISPATCH'}</div>
			</div>
			<div style="height:12px"></div>
			<div class="features" style="grid-template-columns: repeat(3, 1fr);">
				<div class="feature"><h3>Required</h3><p>${fmt(daysRequired)} days</p></div>
				<div class="feature"><h3>Allowed</h3><p>${fmt(allowed)} days</p></div>
				<div class="feature"><h3>Delta</h3><p>${fmt(days)} days ${isDemurrage ? 'over' : 'saved'}</p></div>
			</div>
			<div style="height:12px"></div>
			<div class="feature"><h3>Total ${isDemurrage ? 'Demurrage' : 'Dispatch'}</h3><p style="font-size:20px;font-weight:800;color:var(--color-primary)">$${fmt(amount)}</p></div>
		`;
	});
})();
