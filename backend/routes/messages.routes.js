const express = require('express');
const prisma = require('../prisma/client');
const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/conversations
router.get('/conversations', authenticateToken, async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [{ sender_id: req.user.id }, { receiver_id: req.user.id }]
            },
            include: {
                sender: { select: { id: true, username: true } },
                receiver: { select: { id: true, username: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        const conversationMap = new Map();
        messages.forEach(msg => {
            const otherUser = msg.sender_id === req.user.id ? msg.receiver : msg.sender;
            if (!conversationMap.has(otherUser.id)) {
                conversationMap.set(otherUser.id, {
                    user_id: otherUser.id,
                    username: otherUser.username,
                    last_message: msg.content,
                    last_message_time: msg.created_at,
                    unread_count: (msg.receiver_id === req.user.id && !msg.is_read) ? 1 : 0
                });
            } else if (msg.receiver_id === req.user.id && !msg.is_read) {
                conversationMap.get(otherUser.id).unread_count++;
            }
        });

        res.json(Array.from(conversationMap.values()));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/messages/:otherUserId
router.get('/:otherUserId', authenticateToken, async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { sender_id: req.user.id, receiver_id: req.params.otherUserId },
                    { sender_id: req.params.otherUserId, receiver_id: req.user.id }
                ]
            },
            orderBy: { created_at: 'asc' }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/messages
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { receiver_id, content } = req.body;
        const message = await prisma.message.create({
            data: { sender_id: req.user.id, receiver_id, content }
        });
        res.json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PATCH /api/messages/read/:otherUserId
router.patch('/read/:otherUserId', authenticateToken, async (req, res) => {
    try {
        await prisma.message.updateMany({
            where: {
                sender_id: req.params.otherUserId,
                receiver_id: req.user.id,
                is_read: false
            },
            data: { is_read: true }
        });
        res.json({ message: 'Read' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
