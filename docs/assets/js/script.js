// MariThon Landing Page JavaScript
// Handles button interactions and animations

document.addEventListener('DOMContentLoaded', function() {
    console.log('MariThon Landing Page loaded successfully');
    
    // Initialize the page
    initializePage();
});

function initializePage() {
    // Add loading states to buttons
    setupButtonInteractions();
    
    // Add smooth scroll behavior
    setupSmoothScrolling();
    
    // Add parallax effect to background
    setupParallaxEffect();
}

function setupButtonInteractions() {
    const loginBtn = document.querySelector('.btn-login');
    const signupBtn = document.querySelector('.btn-signup');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
        loginBtn.addEventListener('mouseenter', addButtonHoverEffect);
        loginBtn.addEventListener('mouseleave', removeButtonHoverEffect);
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', handleSignup);
        signupBtn.addEventListener('mouseenter', addButtonHoverEffect);
        signupBtn.addEventListener('mouseleave', removeButtonHoverEffect);
    }
}

function handleLogin() {
    console.log('Login button clicked');
    
    // Add loading state
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
        loginBtn.classList.add('loading');
        
        // Simulate loading delay (remove this in production)
        setTimeout(() => {
            loginBtn.classList.remove('loading');
            // Redirect to login page
            window.location.href = 'login.html';
        }, 1000);
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    console.log('=== LOGIN FUNCTION STARTED ===');
    console.log('Login form submitted - function called!');
    
    const form = event.target;
    const submitBtn = form.querySelector('.btn.btn-login');
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const remember = form.querySelector('input[name="remember"]').checked;
    
    console.log('Form data:', { email, password, remember });
    console.log('Submit button found:', submitBtn);
    
    // Show loading message
    showMessage('Signing in...', 'loading');
    console.log('Loading message shown');
    
    // Add loading state
    submitBtn.classList.add('loading');
    console.log('Loading state added to button');
    
    try {
        console.log('Making API call to login endpoint...');
        
        // Local JSON-only auth: accept user/user123
        const isValid = (email === 'user' && password === 'user123');
        
        console.log('Local auth check result:', isValid);
        
        if (isValid) {
            // Store authentication data (fake token)
            localStorage.setItem('auth_token', 'dummy-token-123');
            localStorage.setItem('user_data', JSON.stringify({ username: 'user' }));
            console.log('Auth data stored in localStorage');
            
            // Show success message and redirect
            showMessage('Login successful! Redirecting...', 'success');
            console.log('Success message shown, starting redirect timer...');
            
            setTimeout(() => {
                console.log('=== REDIRECTING NOW ===');
                console.log('Current location:', window.location.href);
                console.log('Redirecting to dashboard.html');
                
                // Try multiple redirect methods
                try {
                    console.log('Method 1: window.location.href');
                    window.location.href = 'dashboard.html';
                } catch (e) {
                    console.error('Method 1 failed:', e);
                    try {
                        console.log('Method 2: window.location.replace');
                        window.location.replace('dashboard.html');
                    } catch (e2) {
                        console.error('Method 2 failed:', e2);
                        try {
                            console.log('Method 3: window.location.assign');
                            window.location.assign('dashboard.html');
                        } catch (e3) {
                            console.error('Method 3 failed:', e3);
                            console.log('All redirect methods failed!');
                        }
                    }
                }
            }, 1500);
        } else {
            showMessage('Login failed: Invalid username or password', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Login failed. Please check your connection and try again.', 'error');
    } finally {
        submitBtn.classList.remove('loading');
        console.log('Loading state removed from button');
    }
}

function handleSignup() {
    console.log('Signup button clicked');
    
    // Add loading state
    const signupBtn = document.querySelector('.btn-signup');
    if (signupBtn) {
        signupBtn.classList.add('loading');
        
        // Simulate loading delay (remove this in production)
        setTimeout(() => {
            signupBtn.classList.remove('loading');
            // Redirect to signup page
            window.location.href = 'signup.html';
        }, 1000);
    }
}

async function handleSignupSubmit(event) {
    event.preventDefault();
    console.log('Signup form submitted');
    
    const form = event.target;
    const submitBtn = form.querySelector('.btn-signup');
    const firstName = form.querySelector('#firstName').value;
    const lastName = form.querySelector('#lastName').value;
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const confirmPassword = form.querySelector('#confirmPassword').value;
    const terms = form.querySelector('input[name="terms"]').checked;
    
    // Basic validation - only show error for validation failures, not missing fields
    if (password !== confirmPassword) {
        showMessage('Passwords do not match!', 'error');
        return;
    }
    
    if (!terms) {
        showMessage('Please agree to the Terms of Service and Privacy Policy', 'error');
        return;
    }
    
    // Show loading message
    showMessage('Creating account...', 'loading');
    
    // Add loading state
    submitBtn.classList.add('loading');
    
    try {
        // Local-only signup: pretend success
        const response = { ok: true, json: async () => ({ message: 'ok' }) };
        
        if (response.ok) {
            const data = await response.json();
            
            // Show success message and redirect
            showMessage('Account created successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            showMessage('Account not created: local error', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showMessage('Account not created. Please check your connection and try again.', 'error');
    } finally {
        submitBtn.classList.remove('loading');
    }
}

function addButtonHoverEffect(event) {
    const btn = event.currentTarget;
    btn.style.transform = 'translateY(-2px) scale(1.02)';
}

function removeButtonHoverEffect(event) {
    const btn = event.currentTarget;
    btn.style.transform = 'translateY(0) scale(1)';
}

function setupSmoothScrolling() {
    // Smooth scroll for any anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function setupParallaxEffect() {
    // Add subtle parallax effect to background
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const backgroundOverlay = document.querySelector('.background-overlay');
        
        if (backgroundOverlay) {
            const speed = scrolled * 0.1;
            backgroundOverlay.style.transform = `translateY(${speed}px)`;
        }
    });
}



// Add keyboard navigation support
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        const focusedElement = document.activeElement;
        if (focusedElement && focusedElement.classList.contains('btn')) {
            event.preventDefault();
            focusedElement.click();
        }
    }
});

// Add touch support for mobile devices
function setupTouchSupport() {
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', function(event) {
        touchStartY = event.touches[0].clientY;
    });
    
    document.addEventListener('touchend', function(event) {
        touchEndY = event.changedTouches[0].clientY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > swipeThreshold) {
            // Add subtle animation on swipe
            const glassContainer = document.querySelector('.glass-container');
            if (glassContainer) {
                glassContainer.style.transform = `scale(${diff > 0 ? 0.98 : 1.02})`;
                setTimeout(() => {
                    glassContainer.style.transform = 'scale(1)';
                }, 200);
            }
        }
    }
}

// Initialize touch support
setupTouchSupport();

// Add performance monitoring
function monitorPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log(`Page load time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
                }
            }, 0);
        });
    }
}

// Initialize performance monitoring
monitorPerformance();

// Message display functionality
function showMessage(text, type) {
    console.log('=== SHOW MESSAGE CALLED ===');
    console.log('Text:', text, 'Type:', type);
    
    const messageContainer = document.getElementById('message-container');
    const messageText = document.getElementById('message-text');
    
    console.log('Message container found:', messageContainer);
    console.log('Message text element found:', messageText);
    
    if (!messageContainer || !messageText) {
        console.error('Message elements not found!');
        return;
    }
    
    const spinner = messageContainer.querySelector('.spinner');
    console.log('Spinner found:', spinner);
    
    // Set message text
    messageText.textContent = text;
    
    // Remove all existing classes
    messageContainer.className = 'message-container';
    spinner.className = 'spinner';
    
    // Add appropriate classes
    messageContainer.classList.add(type);
    spinner.classList.add(type);
    
    // Show the message
    messageContainer.style.display = 'block';
    console.log('Message displayed with type:', type);
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            hideMessage();
        }, 3000);
    }
    
    // Auto-hide error messages after 5 seconds
    if (type === 'error') {
        setTimeout(() => {
            hideMessage();
        }, 5000);
    }
}

function hideMessage() {
    const messageContainer = document.getElementById('message-container');
    messageContainer.style.display = 'none';
}

// Password toggle functionality
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggleBtn = input.parentElement.querySelector('.password-toggle');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggleBtn.classList.add('show-password');
    } else {
        input.type = 'password';
        toggleBtn.classList.remove('show-password');
    }
}

// Export functions for potential external use
window.MariThonLanding = {
    handleLogin,
    handleSignup,
    handleLoginSubmit,
    handleSignupSubmit,
    initializePage,
    togglePassword,
    showMessage,
    hideMessage
};
