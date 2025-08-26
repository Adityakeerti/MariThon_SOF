document.addEventListener('DOMContentLoaded', function () {
	const yearEl = document.getElementById('year');
	if (yearEl) {
		yearEl.textContent = new Date().getFullYear();
	}

	function isValidEmail(value) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).toLowerCase());
	}

	function toggleError(inputEl, errorEl, hasError) {
		if (!inputEl || !errorEl) return;
		if (hasError) {
			inputEl.classList.add('error');
			errorEl.classList.add('show');
		} else {
			inputEl.classList.remove('error');
			errorEl.classList.remove('show');
		}
	}

	const loginForm = document.getElementById('login-form');
	if (loginForm) {
		loginForm.addEventListener('submit', function (e) {
			e.preventDefault();
			const email = document.getElementById('login-email');
			const emailError = document.getElementById('login-email-error');
			const password = document.getElementById('login-password');
			const passwordError = document.getElementById('login-password-error');

			let hasError = false;
			toggleError(email, emailError, !isValidEmail(email.value.trim()));
			hasError = hasError || !isValidEmail(email.value.trim());
			toggleError(password, passwordError, password.value.length < 6);
			hasError = hasError || password.value.length < 6;

			if (!hasError) {
				window.location.href = 'dashboard.html';
			}
		});
	}

	const signupForm = document.getElementById('signup-form');
	if (signupForm) {
		signupForm.addEventListener('submit', function (e) {
			e.preventDefault();
			const name = document.getElementById('signup-name');
			const nameError = document.getElementById('signup-name-error');
			const email = document.getElementById('signup-email');
			const emailError = document.getElementById('signup-email-error');
			const password = document.getElementById('signup-password');
			const passwordError = document.getElementById('signup-password-error');
			const confirm = document.getElementById('signup-confirm');
			const confirmError = document.getElementById('signup-confirm-error');

			let hasError = false;
			toggleError(name, nameError, name.value.trim().length === 0);
			hasError = hasError || name.value.trim().length === 0;
			toggleError(email, emailError, !isValidEmail(email.value.trim()));
			hasError = hasError || !isValidEmail(email.value.trim());
			toggleError(password, passwordError, password.value.length < 8);
			hasError = hasError || password.value.length < 8;
			toggleError(confirm, confirmError, confirm.value !== password.value || confirm.value.length === 0);
			hasError = hasError || (confirm.value !== password.value || confirm.value.length === 0);

			if (!hasError) {
				alert('Account created');
				window.location.href = 'dashboard.html';
			}
		});
	}
});
