const express = require('express');
const prisma = require('../prisma/client');
const authenticateToken = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.middleware');

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

            await prisma.notification.create({
                data: {
                    user_id: post.user_id, type: 'post_approved',
                    message: `Your post "${post.title}" has been approved and is now live!`, post_id: post.id
                }
            });
            io.to(post.user_id).emit('notification_received');

            const allOtherUsers = await prisma.profile.findMany({
                where: { id: { not: post.user_id }, role: { not: 'admin' } },
                select: { id: true }
            });
            if (allOtherUsers.length > 0) {
                await prisma.notification.createMany({
                    data: allOtherUsers.map(u => ({
                        user_id: u.id, type: 'new_post',
                        message: `A new cause "${post.title}" was just posted.`, post_id: post.id
                    }))
                });
                allOtherUsers.forEach(u => io.to(u.id).emit('notification_received'));
            }

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

            await prisma.notification.create({
                data: {
                    user_id: post.user_id, type: 'post_rejected',
                    message: reason
                        ? `Your post "${post.title}" was rejected: ${reason}`
                        : `Your post "${post.title}" was rejected by an admin.`,
                    post_id: post.id
                }
            });
            io.to(post.user_id).emit('notification_received');
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
