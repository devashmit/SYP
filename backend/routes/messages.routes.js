const express = require('express');
const prisma = require('../prisma/client');
const authenticateToken = require('../middleware/auth.middleware');
const notificationService = require('../services/notification.service');

module.exports = function createMessagesRouter(io) {
    const router = express.Router();

    // 1. POST /messages — saves message to DB, immediately emits receive_message to BOTH
    router.post('/', authenticateToken, async (req, res) => {
        try {
            const { receiver_id, content } = req.body;

            if (receiver_id === req.user.id) {
                return res.status(400).json({ error: 'You cannot message yourself' });
            }
            
            const message = await prisma.message.create({
                data: {
                    sender_id: req.user.id,
                    receiver_id: receiver_id,
                    content: content
                },
                include: {
                    sender: { select: { id: true, username: true, avatar_url: true } },
                    receiver: { select: { id: true, username: true, avatar_url: true } }
                }
            });

            // Emit receive_message to BOTH receiver and sender
            io.to(receiver_id).emit('receive_message', message);
            io.to(req.user.id).emit('receive_message', message);

            // Also create a notification for the receiver
            notificationService.queue({
                userId: receiver_id,
                type: 'MESSAGE',
                message: `New message from ${message.sender.username}: ${content.substring(0, 30)}${content.length > 30 ? '...' : ''}`,
                relatedEntityId: req.user.id
            });

            res.json(message);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // 2. GET /conversations — returns list of all users logged-in user has exchanged messages with
    router.get('/conversations', authenticateToken, async (req, res) => {
        try {
            // Find ALL messages where I am sender or receiver
            const messages = await prisma.message.findMany({
                where: {
                    OR: [
                        { sender_id: req.user.id },
                        { receiver_id: req.user.id }
                    ]
                },
                orderBy: { created_at: 'desc' }, // Desc to get latest message first
                include: {
                    sender: { select: { id: true, username: true, avatar_url: true } },
                    receiver: { select: { id: true, username: true, avatar_url: true } }
                }
            });

            const conversationMap = new Map();

            messages.forEach(msg => {
                // Determine who the *other* user is in this message
                const otherUser = msg.sender_id === req.user.id ? msg.receiver : msg.sender;
                
                // If we haven't seen this user yet, add them to the map (since we query desc, this is the latest message)
                if (!conversationMap.has(otherUser.id)) {
                    conversationMap.set(otherUser.id, {
                        user_id: otherUser.id,
                        username: otherUser.username,
                        avatar_url: otherUser.avatar_url,
                        last_message: msg.content,
                        last_message_time: msg.created_at,
                        unread_count: (msg.receiver_id === req.user.id && !msg.is_read) ? 1 : 0
                    });
                } else {
                    // Just accumulate unread count for older messages
                    const existing = conversationMap.get(otherUser.id);
                    if (msg.receiver_id === req.user.id && !msg.is_read) {
                        existing.unread_count += 1;
                    }
                }
            });

            res.json(Array.from(conversationMap.values()));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // 3. GET /messages/:userId — returns full message thread
    router.get('/:userId', authenticateToken, async (req, res) => {
        try {
            const messages = await prisma.message.findMany({
                where: {
                    OR: [
                        { sender_id: req.user.id, receiver_id: req.params.userId },
                        { sender_id: req.params.userId, receiver_id: req.user.id }
                    ]
                },
                orderBy: { created_at: 'asc' },
                include: {
                    sender: { select: { id: true, username: true, avatar_url: true } },
                    receiver: { select: { id: true, username: true, avatar_url: true } }
                }
            });
            res.json(messages);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // 4. PATCH /read/:userId — marks all messages from this user as read
    router.patch('/read/:userId', authenticateToken, async (req, res) => {
        try {
            await prisma.message.updateMany({
                where: {
                    sender_id: req.params.userId,
                    receiver_id: req.user.id,
                    is_read: false
                },
                data: { is_read: true }
            });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};
