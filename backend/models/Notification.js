const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxLength: 1000
    },
    type: {
        type: String,
        required: true,
        enum: [
            'project_milestone',    // Project milestone reached
            'budget_warning',       // Budget threshold warning
            'task_assigned',        // Task assigned to user
            'task_overdue',         // Task is overdue
            'task_completed',       // Task completed
            'issue_assigned',       // Issue assigned to user
            'issue_resolved',       // Issue resolved
            'deadline_approaching', // Deadline approaching
            'user_role_changed',    // User role changed
            'system_maintenance',   // System maintenance alert
            'security_alert',       // Security notification
            'approval_request',     // Approval needed
            'mention',              // User mentioned
            'comment_added',        // Comment added to project/task
            'document_uploaded',    // Document uploaded
            'payment_received',     // Payment received
            'invoice_generated',    // Invoice generated
            'cost_exceeded',        // Cost exceeded budget
            'material_low_stock',   // Material stock low
            'meeting_scheduled',    // Meeting scheduled
            'general'               // General notification
        ]
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    category: {
        type: String,
        enum: ['project', 'task', 'financial', 'system', 'user', 'document', 'communication'],
        required: true
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    isArchived: {
        type: Boolean,
        default: false,
        index: true
    },
    actionRequired: {
        type: Boolean,
        default: false
    },
    actionUrl: {
        type: String,
        trim: true
    },
    relatedResource: {
        resourceType: {
            type: String,
            enum: ['project', 'task', 'issue', 'cost', 'payment', 'material', 'worker', 'document']
        },
        resourceId: {
            type: mongoose.Schema.Types.ObjectId
        }
    },
    sender: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: {
            type: String,
            trim: true
        },
        role: {
            type: String,
            trim: true
        }
    },
    metadata: {
        // Additional data specific to notification type
        projectName: String,
        projectId: mongoose.Schema.Types.ObjectId,
        taskTitle: String,
        taskId: mongoose.Schema.Types.ObjectId,
        budgetAmount: Number,
        currentAmount: Number,
        deadline: Date,
        amount: Number,
        description: String,
        // Add any other relevant metadata
    },
    expiresAt: {
        type: Date,
        default: function() {
            // Default expiration: 30 days from creation
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
    },
    deliveryMethods: {
        inApp: {
            type: Boolean,
            default: true
        },
        email: {
            type: Boolean,
            default: false
        },
        sms: {
            type: Boolean,
            default: false
        },
        push: {
            type: Boolean,
            default: false
        }
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    smsSent: {
        type: Boolean,
        default: false
    },
    pushSent: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    clickedAt: {
        type: Date
    },
    archivedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for performance
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, category: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired notifications
notificationSchema.index({ actionRequired: 1, isRead: 1 });

// Virtual for time since creation
notificationSchema.virtual('timeAgo').get(function() {
    const now = new Date();
    const diff = now - this.createdAt;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
});

// Virtual for priority color
notificationSchema.virtual('priorityColor').get(function() {
    switch (this.priority) {
        case 'urgent':
            return '#dc2626'; // red-600
        case 'high':
            return '#ea580c'; // orange-600
        case 'medium':
            return '#2563eb'; // blue-600
        case 'low':
            return '#16a34a'; // green-600
        default:
            return '#6b7280'; // gray-500
    }
});

// Instance methods
notificationSchema.methods.markAsRead = function() {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

notificationSchema.methods.markAsUnread = function() {
    this.isRead = false;
    this.readAt = undefined;
    return this.save();
};

notificationSchema.methods.archive = function() {
    this.isArchived = true;
    this.archivedAt = new Date();
    return this.save();
};

notificationSchema.methods.markClicked = function() {
    this.clickedAt = new Date();
    return this.save();
};

notificationSchema.methods.isExpired = function() {
    return new Date() > this.expiresAt;
};

// Static methods
notificationSchema.statics.createNotification = async function(notificationData) {
    const notification = new this(notificationData);
    await notification.save();
    return notification;
};

notificationSchema.statics.getUnreadCount = async function(userId) {
    return await this.countDocuments({
        userId: userId,
        isRead: false,
        isArchived: false,
        expiresAt: { $gt: new Date() }
    });
};

notificationSchema.statics.getNotificationsByUser = async function(userId, options = {}) {
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
    } = options;

    let query = {
        userId: userId,
        isArchived: false,
        expiresAt: { $gt: new Date() }
    };

    if (type) query.type = type;
    if (category) query.category = category;
    if (isRead !== null) query.isRead = isRead;
    if (priority) query.priority = priority;
    if (actionRequired !== null) query.actionRequired = actionRequired;

    const notifications = await this.find(query)
        .sort({ [sortBy]: sortOrder })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

    const total = await this.countDocuments(query);

    return {
        notifications,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total: total
    };
};

notificationSchema.statics.markAllAsRead = async function(userId) {
    const result = await this.updateMany(
        {
            userId: userId,
            isRead: false,
            isArchived: false,
            expiresAt: { $gt: new Date() }
        },
        {
            isRead: true,
            readAt: new Date()
        }
    );
    return result.modifiedCount;
};

notificationSchema.statics.cleanupExpired = async function() {
    return await this.deleteMany({
        expiresAt: { $lt: new Date() }
    });
};

// Pre-save middleware
notificationSchema.pre('save', function(next) {
    // Set expiration for different notification types
    if (this.isNew && !this.expiresAt) {
        const now = new Date();
        let expirationDays = 30; // Default 30 days

        switch (this.type) {
            case 'system_maintenance':
                expirationDays = 7; // 1 week
                break;
            case 'security_alert':
                expirationDays = 90; // 3 months
                break;
            case 'task_overdue':
                expirationDays = 60; // 2 months
                break;
            case 'project_milestone':
                expirationDays = 90; // 3 months
                break;
            default:
                expirationDays = 30;
        }

        this.expiresAt = new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000);
    }
    next();
});

module.exports = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
