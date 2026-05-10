const express = require('express');
const prisma = require('../prisma/client');
const authenticateToken = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.middleware');
const notificationService = require('../services/notification.service');

module.exports = function createAdminRouter(io) {
    const router = express.Router();

    // GET /api/admin/posts
    router.get('/posts', authenticateToken, isAdmin, async (req, res) => {
        try {
            const posts = await prisma.post.findMany({
                include: {
                    user: { select: { username: true } },
                    category: { select: { name: true } }
                },
                orderBy: { created_at: 'desc' }
            });
            res.json(posts.map(p => ({ ...p, profiles: p.user, categories: p.category })));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // GET /api/admin/profiles — never return password
    router.get('/profiles', authenticateToken, isAdmin, async (req, res) => {
        try {
            const profiles = await prisma.profile.findMany({
                select: {
                    id: true, email: true, username: true, role: true,
                    full_name: true, avatar_url: true, location: true,
                    created_at: true
                }
            });
            res.json(profiles);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // POST /api/admin/posts/:id/approve
    router.post('/posts/:id/approve', authenticateToken, isAdmin, async (req, res) => {
        try {
            const post = await prisma.post.update({
                where: { id: req.params.id },
                data: { status: 'available' },
                include: { user: { select: { username: true } }, category: { select: { name: true } } }
            });
            const finalPost = { ...post, profiles: post.user, categories: post.category };

            notificationService.queue({
                userId: post.user_id,
                type: 'ADMIN_APPROVAL',
                message: `Your post "${post.title}" has been approved and is now live!`,
                relatedEntityId: post.id
            });

            io.emit('post_created', finalPost);
            res.json(finalPost);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // POST /api/admin/posts/:id/reject
    router.post('/posts/:id/reject', authenticateToken, isAdmin, async (req, res) => {
        try {
            const { reason } = req.body;
            const post = await prisma.post.update({
                where: { id: req.params.id },
                data: { status: 'rejected' }
            });

            notificationService.queue({
                userId: post.user_id,
                type: 'SYSTEM',
                message: reason
                    ? `Your post "${post.title}" was rejected: ${reason}`
                    : `Your post "${post.title}" was rejected by an admin.`,
                relatedEntityId: post.id
            });
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // GET /api/admin/stats
    router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
        try {
            const [totalUsers, totalPosts, pendingPosts, totalMessages] = await Promise.all([
                prisma.profile.count(),
                prisma.post.count(),
                prisma.post.count({ where: { status: 'pending' } }),
                prisma.message.count()
            ]);
            res.json({ totalUsers, totalPosts, pendingPosts, totalMessages });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};
