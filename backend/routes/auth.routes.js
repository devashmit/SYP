const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const authenticateToken = require('../middleware/auth.middleware');

const JWT_SECRET = process.env.JWT_SECRET || 'sahayogi_secret_key_2024';
const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password, username, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.profile.create({
            data: {
                email,
                password: hashedPassword,
                username,
                role: email === 'devvv0264@gmail.com' ? 'admin' : (role || 'donor')
            }
        });

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
        // Never return password
        const { password: _, ...safeUser } = user;
        res.json({ user: safeUser, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.profile.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
        const { password: _, ...safeUser } = user;
        res.json({ user: safeUser, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
    const user = await prisma.profile.findUnique({
        where: { id: req.user.id },
        select: {
            id: true, email: true, username: true, role: true,
            full_name: true, avatar_url: true, location: true, created_at: true
        }
    });
    res.json({ user });
});

module.exports = router;
