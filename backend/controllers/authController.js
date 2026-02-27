const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const register = async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;

        if (!username || !email || !phone || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users (username, email, phone, password) VALUES (?, ?, ?, ?)';
        await pool.execute(query, [username, email, phone, hashedPassword]);

        res.status(201).json({ message: 'register success' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('username')) {
                return res.status(409).json({ message: 'Username already exists' });
            }
            if (error.message.includes('email')) {
                return res.status(409).json({ message: 'Email already exists' });
            }
        }
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const query = 'SELECT * FROM users WHERE username = ?';
        const [rows] = await pool.execute(query, [username]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

const logout = (req, res) => {
    res.clearCookie('authToken');
    res.status(200).json({ message: 'Logout successful' });
};

module.exports = { register, login, logout };
