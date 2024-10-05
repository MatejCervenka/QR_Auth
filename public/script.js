document.getElementById('username-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;

    fetch('/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username})
    })
        .then(response => response.json())
        .then(data => {
            if (data.qrCode) {
                document.getElementById('qr-code-container').innerHTML = `<img src="${data.qrCode}" alt="QR Code">`;
            } else {
                alert(data.message);
            }
        });
});

document.getElementById('profile-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('surname', document.getElementById('surname').value);
    formData.append('photo', document.getElementById('photo').files[0]);

    fetch('/profile', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Profile updated successfully') {
                alert('Profile updated successfully');
            } else {
                alert('Error updating profile');
            }
        });
});

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Login successful') {
                window.location.href = '/welcome';  // Redirect to welcome page
            } else {
                alert(data.message);
            }
        });
});

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

document.getElementById('password-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;

    fetch('/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'User registered successfully') {
                window.location.href = '/welcome';
            } else {
                alert(data.message);
            }
        });
});