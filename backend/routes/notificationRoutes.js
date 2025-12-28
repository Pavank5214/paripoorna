

const express = require("express");
const router = express.Router();
const { protect, checkRole, checkPermission, auditLog } = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { USER_ROLES } = require("../models/User");

// Get user notifications
router.get("/", protect, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            type = '',
            category = '',
            isRead = null,
            priority = '',
            actionRequired = null,
            sortBy = 'createdAt',
            sortOrder = -1
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            type,
            category,
            isRead: isRead === 'true' ? true : isRead === 'false' ? false : null,
            priority,
            actionRequired: actionRequired === 'true' ? true : actionRequired === 'false' ? false : null,
            sortBy,
            sortOrder: parseInt(sortOrder)
        };

        const result = await Notification.getNotificationsByUser(req.user._id, options);

        res.json(result);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get unread notification count
router.get("/unread-count", protect, async (req, res) => {
    try {
        const count = await Notification.getUnreadCount(req.user._id);
        res.json({ unreadCount: count });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Mark notification as read
router.put("/:notificationId/read", protect, async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        const notification = await Notification.findOne({
            _id: notificationId,
            userId: req.user._id
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        await notification.markAsRead();

        res.json({
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Mark notification as unread
router.put("/:notificationId/unread", protect, async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        const notification = await Notification.findOne({
            _id: notificationId,
            userId: req.user._id
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        await notification.markAsUnread();

        res.json({
            message: "Notification marked as unread",
            notification
        });
    } catch (error) {
        console.error("Error marking notification as unread:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Archive notification
router.put("/:notificationId/archive", protect, async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        const notification = await Notification.findOne({
            _id: notificationId,
            userId: req.user._id
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        await notification.archive();

        res.json({
            message: "Notification archived",
            notification
        });
    } catch (error) {
        console.error("Error archiving notification:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Mark all notifications as read
router.put("/mark-all-read", protect, async (req, res) => {
    try {
        const count = await Notification.markAllAsRead(req.user._id);

        res.json({
            message: `${count} notifications marked as read`,
            count
        });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete notification
router.delete("/:notificationId", protect, async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        const notification = await Notification.findOne({
            _id: notificationId,
            userId: req.user._id
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        await Notification.findByIdAndDelete(notificationId);

        res.json({
            message: "Notification deleted"
        });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get notification preferences
router.get("/preferences", protect, async (req, res) => {
    try {
        const preferences = req.user.preferences?.notifications || {
            email: true,
            push: true,
            sms: false
        };

        res.json({ preferences });
    } catch (error) {
        console.error("Error fetching notification preferences:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update notification preferences
router.put("/preferences", protect, async (req, res) => {
    try {
        const { email, push, sms } = req.body;

        req.user.preferences = req.user.preferences || {};
        req.user.preferences.notifications = {
            email: email !== undefined ? email : req.user.preferences.notifications?.email || true,
            push: push !== undefined ? push : req.user.preferences.notifications?.push || true,
            sms: sms !== undefined ? sms : req.user.preferences.notifications?.sms || false
        };

        await req.user.save();

        res.json({
            message: "Notification preferences updated",
            preferences: req.user.preferences.notifications
        });
    } catch (error) {
        console.error("Error updating notification preferences:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ADMIN ROUTES

// Create notification (Admin only)
router.post("/admin/create", 
    protect,
    checkRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    checkPermission('create'),
    auditLog('CREATE_NOTIFICATION', 'Notification'),
    async (req, res) => {
        try {
            const {
                userIds,
                title,
                message,
                type,
                priority = 'medium',
                category,
                actionRequired = false,
                actionUrl,
                relatedResource,
                metadata = {},
                deliveryMethods = { inApp: true, email: false, sms: false, push: false }
            } = req.body;

            // Validate required fields
            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({ message: "User IDs array is required" });
            }

            if (!title || !message || !type || !category) {
                return res.status(400).json({ message: "Title, message, type, and category are required" });
            }

            // Validate user IDs exist
            const users = await User.find({ _id: { $in: userIds }, isActive: true });
            if (users.length !== userIds.length) {
                return res.status(400).json({ message: "Some user IDs are invalid or users are inactive" });
            }

            // Create notifications for all users
            const notifications = await Promise.all(
                userIds.map(userId => 
                    Notification.createNotification({
                        userId,
                        title,
                        message,
                        type,
                        priority,
                        category,
                        actionRequired,
                        actionUrl,
                        relatedResource,
                        metadata,
                        deliveryMethods,
                        sender: {
                            userId: req.user._id,
                            name: req.user.name,
                            role: req.user.role
                        }
                    })
                )
            );

            res.status(201).json({
                message: `Created ${notifications.length} notifications successfully`,
                notifications: notifications.map(n => ({
                    _id: n._id,
                    userId: n.userId,
                    title: n.title,
                    type: n.type,
                    createdAt: n.createdAt
                }))
            });

        } catch (error) {
            console.error("Error creating notification:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Get all notifications (Admin only)
router.get("/admin/all",
    protect,
    checkRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    async (req, res) => {
        try {
            const {
                page = 1,
                limit = 50,
                type = '',
                category = '',
                isRead = null,
                priority = '',
                userId = '',
                startDate = '',
                endDate = '',
                sortBy = 'createdAt',
                sortOrder = -1
            } = req.query;

            let query = {};

            if (type) query.type = type;
            if (category) query.category = category;
            if (isRead === 'true') query.isRead = true;
            if (isRead === 'false') query.isRead = false;
            if (priority) query.priority = priority;
            if (userId) query.userId = userId;

            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            const notifications = await Notification.find(query)
                .populate('userId', 'name email role department')
                .sort({ [sortBy]: sortOrder })
                .limit(parseInt(limit) * 1)
                .skip((parseInt(page) - 1) * parseInt(limit))
                .lean();

            const total = await Notification.countDocuments(query);

            res.json({
                notifications,
                totalPages: Math.ceil(total / parseInt(limit)),
                currentPage: parseInt(page),
                total
            });
        } catch (error) {
            console.error("Error fetching all notifications:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Get notification statistics (Admin only)
router.get("/admin/stats",
    protect,
    checkRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    async (req, res) => {
        try {
            const stats = await Promise.all([
                Notification.countDocuments({}),
                Notification.countDocuments({ isRead: false }),
                Notification.countDocuments({ isRead: true }),
                Notification.countDocuments({ actionRequired: true, isRead: false }),
                Notification.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }), // Last 24 hours
                Notification.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }), // Last 7 days
                Notification.countDocuments({ priority: 'urgent' }),
                Notification.countDocuments({ priority: 'high' })
            ]);

            const typeStats = await Notification.aggregate([
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                }
            ]);

            res.json({
                total: stats[0],
                unread: stats[1],
                read: stats[2],
                actionRequired: stats[3],
                last24Hours: stats[4],
                last7Days: stats[5],
                urgent: stats[6],
                high: stats[7],
                typeBreakdown: typeStats
            });
        } catch (error) {
            console.error("Error fetching notification stats:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Cleanup expired notifications (Admin only)
router.delete("/admin/cleanup-expired",
    protect,
    checkRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    checkPermission('delete'),
    auditLog('CLEANUP_EXPIRED_NOTIFICATIONS', 'Notification'),
    async (req, res) => {
        try {
            const result = await Notification.cleanupExpired();

            res.json({
                message: `Cleaned up ${result.deletedCount} expired notifications`,
                deletedCount: result.deletedCount
            });
        } catch (error) {
            console.error("Error cleaning up expired notifications:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Bulk operations (Admin only)
router.put("/admin/bulk-read",
    protect,
    checkRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    checkPermission('update'),
    async (req, res) => {
        try {
            const { notificationIds, action = 'read' } = req.body;

            if (!notificationIds || !Array.isArray(notificationIds)) {
                return res.status(400).json({ message: "Notification IDs array is required" });
            }

            let updateData = {};
            if (action === 'read') {
                updateData = { isRead: true, readAt: new Date() };
            } else if (action === 'unread') {
                updateData = { isRead: false, readAt: null };
            } else if (action === 'archive') {
                updateData = { isArchived: true, archivedAt: new Date() };
            } else {
                return res.status(400).json({ message: "Invalid action. Use 'read', 'unread', or 'archive'" });
            }

            const result = await Notification.updateMany(
                {
                    _id: { $in: notificationIds }
                },
                updateData
            );

            res.json({
                message: `${result.modifiedCount} notifications ${action === 'read' ? 'marked as read' : action === 'unread' ? 'marked as unread' : 'archived'}`,
                modifiedCount: result.modifiedCount
            });
        } catch (error) {
            console.error("Error performing bulk operation:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

module.exports = router;
