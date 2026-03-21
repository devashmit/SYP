const prisma = require('../prisma/client');

/**
 * Backend Notification Service
 * Handles idempotency windows and async queues to avoid blocking main requests.
 */
class NotificationService {
    constructor() {
        // We will receive the initialized socket.io instance here later
        this.io = null;

        // Idempotency Windows (in milliseconds)
        this.WINDOWS = {
            MESSAGE: 30 * 1000, // 30 seconds
            POST_CREATED: 5 * 60 * 1000, // 5 minutes
            POST_SHARED: 5 * 60 * 1000,
            ADMIN_APPROVAL: 5 * 60 * 1000,
            SYSTEM: 5 * 60 * 1000
        };
    }

    setIO(ioInstance) {
        this.io = ioInstance;
    }

    /**
     * Fire-and-forget wrapper to queue a notification
     */
    queue(payload) {
        setImmediate(async () => {
            try {
                await this._processNotification(payload);
            } catch (err) {
                console.error('[NotificationService] Error processing notification:', err.message);
            }
        });
    }

    /**
     * Internal processing method
     * @param {Object} payload { userId, type, message, relatedEntityId, metadata }
     */
    async _processNotification({ userId, type, message, relatedEntityId = null, metadata = null }) {
        if (!userId || !type || !message) {
            throw new Error('Missing required notification fields');
        }

        const windowMs = this.WINDOWS[type] || 0;

        // 1. Check Idempotency Condition
        if (windowMs > 0 && relatedEntityId) {
            const cutoffTime = new Date(Date.now() - windowMs);
            const recentDuplicate = await prisma.notification.findFirst({
                where: {
                    userId: userId,
                    type: type,
                    relatedEntityId: relatedEntityId,
                    updatedAt: { gte: cutoffTime }
                }
            });

            if (recentDuplicate) {
                console.log(`[NotificationService] Dropping duplicate notification [${type}] for user ${userId}`);
                return; // Silently drop
            }
        }

        // 2. Insert into DB
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                message,
                relatedEntityId,
                metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null
            }
        });

        // 3. Emit via Socket if io is set
        if (this.io) {
            this.io.to(userId).emit('notification_received', notification);
        }
    }
}

module.exports = new NotificationService();
