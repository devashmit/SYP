const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const authenticateToken = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.middleware');
const notificationService = require('../services/notification.service');

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
            const { title, description, help_type, intent, location, images, is_anonymous, category_id } = req.body;

            const postIntent = intent || (help_type === 'offering' ? 'OFFER_HELP' : 'ASK_HELP');
            if (!postIntent || !['OFFER_HELP', 'ASK_HELP'].includes(postIntent)) {
                return res.status(400).json({ error: 'intent is required and must be either OFFER_HELP or ASK_HELP' });
            }

            const post = await prisma.post.create({
                data: {
                    title, description, help_type, intent: postIntent, location, images, is_anonymous,
                    status: req.user.role === 'admin' ? 'available' : 'pending',
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

            // Emit to admins if pending
            if (post.status === 'pending') {
                io.to('admin_room').emit('post_pending', finalPost);
            }

            // Notify admins of pending post
            const admins = await prisma.profile.findMany({ where: { role: 'admin' }, select: { id: true } });
            admins.forEach(a => {
                notificationService.queue({
                    userId: a.id,
                    type: 'POST_CREATED',
                    message: `New post created: "${post.title}"`,
                    relatedEntityId: post.id
                });
            });

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
                notificationService.queue({
                    userId: updatedPost.user_id,
                    type: 'SYSTEM',
                    message: `Your post "${updatedPost.title}" was updated by an admin.`,
                    relatedEntityId: updatedPost.id
                });
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
                data: { content, post_id: req.params.id, user_id: req.user.id },
                include: { user: { select: { username: true } }, post: { select: { user_id: true, title: true } } }
            });
            const finalComment = { ...comment, profiles: comment.user };
            io.emit('comment_created', { postId: req.params.id, comment: finalComment });
            
            // Notify post owner if it's someone else commenting
            if (comment.post.user_id !== req.user.id) {
                notificationService.queue({
                    userId: comment.post.user_id,
                    type: 'SYSTEM',
                    message: `${comment.user.username} commented on "${comment.post.title}"`,
                    relatedEntityId: req.params.id
                });
            }
            
            res.json(finalComment);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // GET /api/posts/:id/reactions
    router.get('/:id/reactions', async (req, res) => {
        try {
            const postId = req.params.id;
            const reactions = await prisma.reaction.findMany({
                where: { post_id: postId },
                include: { user: { select: { username: true } } }
            });

            const summary = { heart: 0, care: 0, sad: 0 };
            const users = { heart: [], care: [], sad: [] };

            reactions.forEach(r => {
                const type = r.type;
                if (summary[type] !== undefined) {
                    summary[type]++;
                    if (r.user && r.user.username) {
                        users[type].push(r.user.username);
                    }
                }
            });

            let userReaction = null;
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    const existing = reactions.find(r => r.user_id === decoded.id);
                    if (existing) userReaction = existing.type;
                } catch { /* ignore */ }
            }

            const commentCount = await prisma.comment.count({
                where: { post_id: postId }
            });

            res.json({ counts: summary, users, total: reactions.length, userReaction, commentCount });
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

            const reactions = await prisma.reaction.findMany({
                where: { post_id: postId },
                include: { user: { select: { username: true } } }
            });

            const summary = { heart: 0, care: 0, sad: 0 };
            const users = { heart: [], care: [], sad: [] };

            reactions.forEach(r => {
                const t = r.type;
                if (summary[t] !== undefined) {
                    summary[t]++;
                    if (r.user && r.user.username) {
                        users[t].push(r.user.username);
                    }
                }
            });

            // Notify post owner if it's a new reaction from someone else
            if (!existing) {
                const post = await prisma.post.findUnique({ where: { id: postId }, select: { user_id: true, title: true } });
                const reactor = await prisma.profile.findUnique({ where: { id: req.user.id }, select: { username: true } });
                if (post && post.user_id !== req.user.id) {
                    notificationService.queue({
                        userId: post.user_id,
                        type: 'SYSTEM',
                        message: `${reactor.username} reacted to "${post.title}"`,
                        relatedEntityId: postId
                    });
                }
            }

            const userReaction = reactions.find(r => r.user_id === req.user.id);
            const responseData = { counts: summary, users, total: reactions.length, userReaction: userReaction?.type || null };

            io.emit('reaction_updated', { postId, ...responseData });

            res.json(responseData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // POST /api/posts/:id/share
    router.post('/:id/share', authenticateToken, async (req, res) => {
        try {
            const { user_id } = req.body;
            const postId = req.params.id;
            const post = await prisma.post.findUnique({ where: { id: postId }, select: { title: true, user_id: true } });
            if (!post) return res.status(404).json({ error: 'Post not found' });

            const sharedMessage = await prisma.message.create({
                data: {
                    sender_id: req.user.id, receiver_id: user_id,
                    content: `📌 Shared a post with you: "${post.title}" — /post/${postId}`
                }
            });
            io.to(user_id).emit('receive_message', sharedMessage);
            io.to(req.user.id).emit('receive_message', sharedMessage);
            
            // Notify the owner of the post that someone shared their post
            if (post.user_id !== req.user.id) {
                notificationService.queue({
                    userId: post.user_id,
                    type: 'POST_SHARED',
                    message: `Someone shared your post "${post.title}"`,
                    relatedEntityId: postId
                });
            }
            
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
                    intent: 'ASK_HELP', // community needs are requests by default
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
            allUsers.forEach(u => {
                notificationService.queue({
                    userId: u.id,
                    type: 'POST_CREATED',
                    message: `New Community Need: "${post.title}"`,
                    relatedEntityId: post.id
                });
            });

            res.json(finalPost);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    return router;
};
