const express = require('express');
const prisma = require('../prisma/client');
const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/notifications
router.get('/', authenticateToken, async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { user_id: req.user.id },
            orderBy: { created_at: 'desc' },
            take: 20
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticateToken, async (req, res) => {
    try {
        await prisma.notification.update({
            where: { id: req.params.id },
            data: { is_read: true }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticateToken, async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { user_id: req.user.id, is_read: false },
            data: { is_read: true }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
