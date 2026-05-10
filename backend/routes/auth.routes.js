const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const authenticateToken = require('../middleware/auth.middleware');
const notificationService = require('../services/notification.service');

const JWT_SECRET = process.env.JWT_SECRET || 'sahayogi_secret_key_2024';
const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!name || name.trim().length < 2) {
            return res.status(400).json({ error: 'Name must be at least 2 characters long' });
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Please provide a valid email address' });
        }
        if (!password || password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        const existingUser = await prisma.profile.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'An account with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate a unique username from the name
        const baseUsername = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'user';
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const username = `${baseUsername}${randomSuffix}`;

        const user = await prisma.profile.create({
            data: {
                email,
                password: hashedPassword,
                username,
                full_name: name,
                role: email === 'devvv0264@gmail.com' ? 'admin' : 'donor'
            }
        });

        // Notify admins
        const admins = await prisma.profile.findMany({ where: { role: 'admin' }, select: { id: true } });
        admins.forEach(a => {
            notificationService.queue({
                userId: a.id,
                type: 'SYSTEM',
                message: `New user registration: ${user.username}`,
                relatedEntityId: user.id
            });
        });

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
        // Never return password
        const { password: _, ...safeUser } = user;
        res.json({ user: safeUser, token });
    } catch (error) {
        console.error('[Signup Error]', error.message);
        res.status(500).json({ error: 'Registration failed. Please try again later.' });
    }
});

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.profile.findUnique({ where: { email } });

        if (!user || user.deletedAt) {
            return res.status(401).json({ error: 'No account found with this email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Wrong password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
        const { password: _, ...safeUser } = user;
        res.json({ user: safeUser, token });
    } catch (error) {
        console.error('[Signin Error]', error.message);
        res.status(500).json({ error: 'Login failed. Please try again later.' });
    }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
    const user = await prisma.profile.findUnique({
        where: { id: req.user.id, deletedAt: null },
        select: {
            id: true, email: true, username: true, role: true,
            full_name: true, avatar_url: true, location: true, created_at: true
        }
    });
    res.json({ user });
});

module.exports = router;
