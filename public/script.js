// Handle registration form submission
const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });

        const result = await response.json();

        if (result.qrCode) {
            document.getElementById('qrCodeImage').src = result.qrCode;
            document.getElementById('qrCodeImage').style.display = 'block';
        } else {
            alert(result.message || 'Error generating QR code.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Handle login form submission
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        if (result.message) {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
