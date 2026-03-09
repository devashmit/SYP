const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const authenticateToken = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.middleware');

const JWT_SECRET = process.env.JWT_SECRET || 'sahayogi_secret_key_2024';

module.exports = function createPostsRouter(io) {
    const router = express.Router();

    // GET /api/categories
    router.get('/categories', async (req, res) => {
        const categories = await prisma.category.findMany();
        res.json(categories);
    });

    // GET /api/posts
    router.get('/', async (req, res) => {
        try {
            const { category, type } = req.query;
            let where = { status: 'available' };

            if (type && type !== 'all') {
                where.post_type = type;
            } else if (!type) {
                where.post_type = 'user_post';
            }

            if (category && category !== 'all') {
                where.category = { name: category };
            }

            const posts = await prisma.post.findMany({
                where,
                include: {
                    user: { select: { username: true } },
                    category: { select: { name: true } }
                },
                orderBy: { created_at: 'desc' }
            });

            res.json(posts.map(p => ({
                ...p,
                profiles: p.user,
                categories: p.category
            })));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // POST /api/posts
    router.post('/', authenticateToken, async (req, res) => {
        try {
            const { title, description, help_type, location, images, is_anonymous, category_id } = req.body;
            const post = await prisma.post.create({
                data: {
                    title, description, help_type, location, images, is_anonymous,
                    status: 'pending',
                    user_id: req.user.id,
                    category_id: parseInt(category_id)
                }
            });

            const postWithIncludes = await prisma.post.findUnique({
                where: { id: post.id },
                include: {
                    user: { select: { username: true } },
                    category: { select: { name: true } }
                }
            });

            const finalPost = { ...postWithIncludes, profiles: postWithIncludes.user, categories: postWithIncludes.category };

            // Notify admins of pending post
            const admins = await prisma.profile.findMany({ where: { role: 'admin' }, select: { id: true } });
            const adminNotifications = admins.map(a => ({
                user_id: a.id, type: 'pending_post',
                message: `New post pending approval: "${post.title}"`, post_id: post.id
            }));
            if (adminNotifications.length > 0) {
                await prisma.notification.createMany({ data: adminNotifications });
                admins.forEach(a => io.to(a.id).emit('notification_received'));
            }

            res.json(finalPost);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // GET /api/posts/:id
    router.get('/:id', async (req, res) => {
        try {
            const post = await prisma.post.findUnique({
                where: { id: req.params.id },
                include: {
                    user: { select: { username: true } },
                    category: { select: { name: true } }
                }
            });
            if (!post) return res.status(410).json({ error: 'Post not found' });
            res.json({ ...post, profiles: post.user, categories: post.category });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // PUT /api/posts/:id
    router.put('/:id', authenticateToken, async (req, res) => {
        try {
            const { title, description, help_type, location, images, is_anonymous, category_id, status } = req.body;
            const existingPost = await prisma.post.findUnique({ where: { id: req.params.id } });
            if (!existingPost) return res.status(404).json({ error: 'Post not found' });
            if (existingPost.user_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized' });
            }

            const updateData = { title, description, help_type, location, images, is_anonymous };
            if (category_id) updateData.category_id = parseInt(category_id);
            if (status) updateData.status = status;

            const updatedPost = await prisma.post.update({
                where: { id: req.params.id }, data: updateData,
                include: { user: { select: { username: true } }, category: { select: { name: true } } }
            });

            const finalPost = { ...updatedPost, profiles: updatedPost.user, categories: updatedPost.category };
            io.emit('post_updated', finalPost);

            if (req.user.id !== updatedPost.user_id) {
                await prisma.notification.create({
                    data: {
                        user_id: updatedPost.user_id, type: 'post_updated',
                        message: `Your post "${updatedPost.title}" was updated by an admin.`, post_id: updatedPost.id
                    }
                });
                io.to(updatedPost.user_id).emit('notification_received');
            }

            res.json(finalPost);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // DELETE /api/posts/:id
    router.delete('/:id', authenticateToken, async (req, res) => {
        try {
            const post = await prisma.post.findUnique({ where: { id: req.params.id } });
            if (!post) return res.status(404).json({ error: 'Post not found' });
            if (post.user_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized' });
            }
            await prisma.post.delete({ where: { id: req.params.id } });
            io.emit('post_deleted', req.params.id);
            res.json({ message: 'Post deleted' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // GET /api/posts/:id/comments
    router.get('/:id/comments', async (req, res) => {
        try {
            const comments = await prisma.comment.findMany({
                where: { post_id: req.params.id },
                include: { user: { select: { username: true } } },
                orderBy: { created_at: 'desc' }
            });
            res.json(comments.map(c => ({ ...c, profiles: c.user })));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // POST /api/posts/:id/comments
    router.post('/:id/comments', authenticateToken, async (req, res) => {
        try {
            const { content } = req.body;
            const comment = await prisma.comment.create({
                data: { content, post_id: req.params.id, user_id: req.user.id }
            });
            res.json(comment);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // GET /api/posts/:id/reactions
    router.get('/:id/reactions', async (req, res) => {
        try {
            const postId = req.params.id;
            const counts = await prisma.reaction.groupBy({
                by: ['type'], where: { post_id: postId }, _count: true
            });
            const summary = { heart: 0, care: 0, sad: 0 };
            counts.forEach(c => { summary[c.type] = c._count; });

            let userReaction = null;
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    const existing = await prisma.reaction.findUnique({
                        where: { post_id_user_id: { post_id: postId, user_id: decoded.id } }
                    });
                    if (existing) userReaction = existing.type;
                } catch { /* ignore */ }
            }

            res.json({ counts: summary, total: summary.heart + summary.care + summary.sad, userReaction });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // POST /api/posts/:id/reactions
    router.post('/:id/reactions', authenticateToken, async (req, res) => {
        try {
            const postId = req.params.id;
            const { type } = req.body;
            if (!['heart', 'care', 'sad'].includes(type)) {
                return res.status(400).json({ error: 'Invalid reaction type' });
            }

            const existing = await prisma.reaction.findUnique({
                where: { post_id_user_id: { post_id: postId, user_id: req.user.id } }
            });

            if (existing && existing.type === type) {
                await prisma.reaction.delete({ where: { id: existing.id } });
            } else if (existing) {
                await prisma.reaction.update({ where: { id: existing.id }, data: { type } });
            } else {
                await prisma.reaction.create({ data: { type, post_id: postId, user_id: req.user.id } });
            }

            const counts = await prisma.reaction.groupBy({
                by: ['type'], where: { post_id: postId }, _count: true
            });
            const summary = { heart: 0, care: 0, sad: 0 };
            counts.forEach(c => { summary[c.type] = c._count; });

            const userReaction = await prisma.reaction.findUnique({
                where: { post_id_user_id: { post_id: postId, user_id: req.user.id } }
            });

            res.json({ counts: summary, total: summary.heart + summary.care + summary.sad, userReaction: userReaction?.type || null });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // POST /api/posts/:id/share
    router.post('/:id/share', authenticateToken, async (req, res) => {
        try {
            const { user_id } = req.body;
            const postId = req.params.id;
            const post = await prisma.post.findUnique({ where: { id: postId }, select: { title: true } });
            if (!post) return res.status(404).json({ error: 'Post not found' });

            await prisma.message.create({
                data: {
                    sender_id: req.user.id, receiver_id: user_id,
                    content: `📌 Shared a post with you: "${post.title}" — /post/${postId}`
                }
            });
            await prisma.notification.create({
                data: {
                    user_id: user_id, type: 'post_shared',
                    message: `Someone shared "${post.title}" with you`, post_id: postId
                }
            });
            io.to(user_id).emit('notification_received');
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // GET /api/my-posts (mounted at /api level in index.js)
    router.get('/my-posts', authenticateToken, async (req, res) => {
        try {
            const posts = await prisma.post.findMany({
                where: { user_id: req.user.id },
                include: { user: { select: { username: true } }, category: { select: { name: true } } },
                orderBy: { created_at: 'desc' }
            });
            res.json(posts.map(p => ({ ...p, profiles: p.user, categories: p.category })));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // POST /api/community-needs
    router.post('/community-needs', authenticateToken, async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Admin access required to create community needs' });
            }
            const { title, description, help_type, location, images, is_anonymous, category_id } = req.body;
            const post = await prisma.post.create({
                data: {
                    title, description, help_type: help_type || 'request',
                    post_type: 'community_need', location, images: images || [],
                    is_anonymous: is_anonymous || false, status: 'available',
                    user_id: req.user.id, category_id: parseInt(category_id)
                }
            });

            const postWithIncludes = await prisma.post.findUnique({
                where: { id: post.id },
                include: { user: { select: { username: true } }, category: { select: { name: true } } }
            });
            const finalPost = { ...postWithIncludes, profiles: postWithIncludes.user, categories: postWithIncludes.category };
            io.emit('post_created', finalPost);

            const allUsers = await prisma.profile.findMany({ where: { id: { not: req.user.id } }, select: { id: true } });
            const notificationData = allUsers.map(u => ({
                user_id: u.id, type: 'new_post',
                message: `New Community Need: "${post.title}"`, post_id: post.id
            }));
            if (notificationData.length > 0) {
                await prisma.notification.createMany({ data: notificationData });
                allUsers.forEach(u => io.to(u.id).emit('notification_received'));
            }

            res.json(finalPost);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    return router;
};
