const express = require('express');
const prisma = require('../prisma/client');
const authenticateToken = require('../middleware/auth.middleware');

module.exports = function createNotificationsRouter(io) {
    const router = express.Router();

    // 1. GET /notifications — returns paginated notifications for the user
    router.get('/', authenticateToken, async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            const notifications = await prisma.notification.findMany({
                where: { userId: req.user.id },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: skip
            });

            // Also return total unread count for the badge
            const unreadCount = await prisma.notification.count({
                where: { userId: req.user.id, isRead: false }
            });

            res.json({ notifications, unreadCount, page, limit });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // 2. PATCH /notifications/mark-all-read — marks all as read
    router.patch('/mark-all-read', authenticateToken, async (req, res) => {
        try {
            await prisma.notification.updateMany({
                where: { userId: req.user.id, isRead: false },
                data: { isRead: true }
            });

            // Sync across devices
            io.to(req.user.id).emit('notification_read', { all: true });

            res.json({ success: true, message: 'All notifications marked as read' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // 3. PATCH /notifications/:id/read — marks a single notification as read
    router.patch('/:id/read', authenticateToken, async (req, res) => {
        try {
            const notification = await prisma.notification.updateMany({
                where: { id: req.params.id, userId: req.user.id },
                data: { isRead: true }
            });

            if (notification.count > 0) {
                // Sync across devices
                io.to(req.user.id).emit('notification_read', { id: req.params.id, all: false });
            }

            res.json({ success: true, message: 'Notification marked as read' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};
