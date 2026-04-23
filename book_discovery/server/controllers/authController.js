const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = (req, res) => {
    const { email, password } = req.body;

    if (!emailRegex.test(String(email || '').trim())) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (!password || password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const normalizedEmail = email.trim().toLowerCase();

        const query = 'INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING id';
        db.query(query, [normalizedEmail, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error registering user:', err);
                return res.status(500).json({ error: 'Failed to register user' });
            }
            res.status(201).json({
                message: 'User registered successfully.',
                userId: result.insertId,
            });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [String(email || '').trim().toLowerCase()], async (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Failed to login' });
        }

        if (!results || results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = results[0];

        if(!user.password_hash) {
            console.error('User has no password hash:', user);
            return res.status(500).json({ error: 'Server error' });
        }

        try {
            const passwordMatch = await bcrypt.compare(password, user.password_hash);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '1h' });
            res.json({ token, userId: user.id });
        } catch (error) {
            console.error('Bcrypt error:', error);
            res.status(500).json({ error: 'Failed to login' });
        }
    });
};
