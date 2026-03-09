const express = require('express');
const prisma = require('../prisma/client');
const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/users/search
router.get('/search', authenticateToken, async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        if (!q) return res.json([]);

        const users = await prisma.profile.findMany({
            where: {
                username: { contains: q, mode: 'insensitive' },
                id: { not: req.user.id }
            },
            select: { id: true, username: true, avatar_url: true },
            take: 10
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/profiles/:id
router.get('/profiles/:id', authenticateToken, async (req, res) => {
    try {
        const profile = await prisma.profile.findUnique({
            where: { id: req.params.id },
            select: { id: true, username: true, avatar_url: true, location: true }
        });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
