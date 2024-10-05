const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const qrcode = require('qrcode');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8000
let users = {};  // In-memory store for users
const JWT_SECRET = 'your-secret-key';

app.use(bodyParser.json());

// Serve the static files (CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the views (HTML files)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));  // First page (enter username)
});

app.get('/qr-register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'qr-register.html'));  // Second page (enter password)
});

app.get('/welcome', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'welcome.html'));  // Third page (welcome message)
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));  // Login page
});

// Registration Route - User enters the username
app.post('/register', (req, res) => {
    const { username } = req.body;

    // Check if username already exists
    if (users[username]) return res.status(400).json({ message: 'Username already exists' });

    // Generate QR code for the user with a temporary token
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '5m' });

    const qrUrl = `https://s-cervenka.dev.spsejecna.net/qr-register?token=${token}`;
    qrcode.toDataURL(qrUrl, (err, qrCode) => {
        if (err) return res.status(500).json({ message: 'Error generating QR code' });

        // Store the username temporarily
        users[username] = { password: null };

        res.json({ message: 'QR code generated', qrCode });
    });
});

// Set Password after scanning the QR code
app.post('/set-password', (req, res) => {
    const { token, password } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Store the plain password in memory
        users[decoded.username].password = password;

        res.json({ message: 'User registered successfully' });
    } catch (err) {
        return res.status(400).json({ message: 'QR Code expired or invalid' });
    }
});

// Login Route - User enters username and password
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the username exists and the password is correct
    if (users[username] && users[username].password === password) {
        res.json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
});


// Set up file upload handling using multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Middleware to verify token and set user in request
function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.username;  // Set username in request
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}


// Profile Routes
app.get('/profile', authenticate, (req, res) => {
    const user = users[req.user];
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Send user profile (excluding the password)
    res.json({
        username: req.user,
        name: user.name,
        surname: user.surname,
        photo: user.photo
    });
});

app.put('/profile', authenticate, upload.single('photo'), (req, res) => {
    const { name, surname } = req.body;
    const user = users[req.user];
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update profile fields
    user.name = name || user.name;
    user.surname = surname || user.surname;

    // If a new photo is uploaded, store the path to the photo
    if (req.file) {
        user.photo = req.file.path;
    }

    res.json({ message: 'Profile updated successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} - http://localhost:${PORT}`)
});
