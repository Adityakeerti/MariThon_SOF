// Authentication service
class AuthService {
    constructor() {
        this.baseURL = 'http://localhost:8000';
        this.tokenKey = 'auth_token';
        this.userKey = 'user_data';
    }

    // Store authentication data
    setAuth(token, user) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    // Get stored token
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // Get stored user data
    getUser() {
        const userData = localStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.getToken() !== null;
    }

    // Clear authentication data
    clearAuth() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    // Login user
    async login(username, password) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Login failed');
            }

            const data = await response.json();
            this.setAuth(data.access_token, data.user);
            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Signup user
    async signup(username, email, password, first_name, last_name) {
        try {
            const response = await fetch(`${this.baseURL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    first_name,
                    last_name
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Signup failed');
            }

            const data = await response.json();
            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Logout user
    async logout() {
        try {
            const token = this.getToken();
            if (token) {
                await fetch(`${this.baseURL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuth();
            window.location.href = 'login.html';
        }
    }

    // Get current user info
    async getCurrentUser() {
        try {
            const token = this.getToken();
            if (!token) {
                return null;
            }

            const response = await fetch(`${this.baseURL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                this.clearAuth();
                return null;
            }

            const user = await response.json();
            localStorage.setItem(this.userKey, JSON.stringify(user));
            return user;
        } catch (error) {
            console.error('Get user error:', error);
            this.clearAuth();
            return null;
        }
    }
}

// Initialize auth service
const auth = new AuthService();

// Login form handling
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        
        // Clear previous errors
        clearErrors();
        
        // Validate inputs
        if (!username) {
            showError('login-username-error', 'Please enter your username');
            return;
        }
        
        if (!password) {
            showError('login-password-error', 'Please enter your password');
            return;
        }
        
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        try {
            const result = await auth.login(username, password);
            
            if (result.success) {
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                showError('login-password-error', result.error);
            }
        } catch (error) {
            showError('login-password-error', 'An error occurred. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Signup form handling
if (document.getElementById('signup-form')) {
    document.getElementById('signup-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('signup-username').value.trim();
        const first_name = document.getElementById('signup-firstname').value.trim();
        const last_name = document.getElementById('signup-lastname').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        
        // Clear previous errors
        clearErrors();
        
        // Validate inputs
        if (username.length < 3) {
            showError('signup-username-error', 'Username must be at least 3 characters');
            return;
        }
        
        if (!first_name) {
            showError('signup-firstname-error', 'Please enter your first name');
            return;
        }
        
        if (!last_name) {
            showError('signup-lastname-error', 'Please enter your last name');
            return;
        }
        
        if (!email || !isValidEmail(email)) {
            showError('signup-email-error', 'Please enter a valid email address');
            return;
        }
        
        if (password.length < 6) {
            showError('signup-password-error', 'Password must be at least 6 characters');
            return;
        }
        
        if (password !== confirm) {
            showError('signup-confirm-error', 'Passwords do not match');
            return;
        }
        
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;
        
        try {
            const result = await auth.signup(username, email, password, first_name, last_name);
            
            if (result.success) {
                alert('Account created successfully! Please log in.');
                window.location.href = 'login.html';
            } else {
                showError('signup-username-error', result.error);
            }
        } catch (error) {
            showError('signup-username-error', 'An error occurred. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Utility functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-text');
    errorElements.forEach(element => {
        element.style.display = 'none';
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', async () => {
    // If user is already authenticated and on login/signup page, redirect to dashboard
    if (auth.isAuthenticated() && (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html'))) {
        window.location.href = 'dashboard.html';
    }
    
    // If user is not authenticated and on protected page, redirect to login
    if (!auth.isAuthenticated() && window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'login.html';
    }
});
