const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Default credentials as requested
    if (username === 'admin' && password === 'admin123') {
        const token = jwt.sign({ username: 'admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.json({ token, message: 'Logged in successfully' });
    } else {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
});

module.exports = router;
