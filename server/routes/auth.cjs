
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db.cjs');
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require('../middleware/auth.cjs');

// LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
        const { rows } = await db.query('SELECT * FROM dashboard_users WHERE email = $1', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = rows[0];
        if (!user.is_active) return res.status(403).json({ error: 'Account disabled' });

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

        // Generate Tokens
        const accessToken = jwt.sign({ id: user.id, role: user.role, name: user.name }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        // Store hash of refresh token
        const refreshHash = await bcrypt.hash(refreshToken, 10);
        await db.query('UPDATE dashboard_users SET refresh_token_hash = $1 WHERE id = $2', [refreshHash, user.id]);

        res.json({ accessToken, refreshToken, user: { id: user.id, name: user.name, role: user.role } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// REFRESH
router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.sendStatus(401);

    try {
        const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        const { rows } = await db.query('SELECT * FROM dashboard_users WHERE id = $1', [payload.id]);

        if (rows.length === 0) return res.sendStatus(403);
        const user = rows[0];

        // Validate stored hash
        if (!user.refresh_token_hash) return res.sendStatus(403);
        const match = await bcrypt.compare(refreshToken, user.refresh_token_hash);
        if (!match) return res.sendStatus(403);

        // Rotation
        const newAccessToken = jwt.sign({ id: user.id, role: user.role, name: user.name }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const newRefreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        const newHash = await bcrypt.hash(newRefreshToken, 10);
        await db.query('UPDATE dashboard_users SET refresh_token_hash = $1 WHERE id = $2', [newHash, user.id]);

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });

    } catch (err) {
        console.error(err);
        return res.sendStatus(403);
    }
});

module.exports = router;
