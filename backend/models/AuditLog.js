const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    userEmail: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    userName: {
        type: String,
        required: true,
        trim: true
    },
    userRole: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            // User management actions
            'CREATE_USER',
            'UPDATE_USER',
            'DELETE_USER',
            'ACTIVATE_USER',
            'DEACTIVATE_USER',
            'PERMANENT_DELETE_USER',
            'CHANGE_USER_ROLE',
            'RESET_USER_PASSWORD',
            'USER_LOGIN',
            'USER_LOGOUT',
            'FAILED_LOGIN_ATTEMPT',

            // Project actions
            'CREATE_PROJECT',
            'UPDATE_PROJECT',
            'DELETE_PROJECT',
            'ASSIGN_USER_TO_PROJECT',
            'REMOVE_USER_FROM_PROJECT',
            'PROJECT_STATUS_CHANGE',

            // Task actions
            'CREATE_TASK',
            'UPDATE_TASK',
            'DELETE_TASK',
            'ASSIGN_TASK',
            'COMPLETE_TASK',
            'TASK_STATUS_CHANGE',

            // Material actions
            'CREATE_MATERIAL',
            'UPDATE_MATERIAL',
            'DELETE_MATERIAL',
            'ADD_MATERIAL_STOCK',
            'REMOVE_MATERIAL_STOCK',

            // Worker actions
            'CREATE_WORKER',
            'UPDATE_WORKER',
            'DELETE_WORKER',
            'ASSIGN_WORKER_TO_PROJECT',

            // Financial actions
            'CREATE_COST',
            'UPDATE_COST',
            'DELETE_COST',
            'CREATE_PAYMENT',
            'UPDATE_PAYMENT',
            'DELETE_PAYMENT',
            'APPROVE_PAYMENT',
            'REJECT_PAYMENT',

            // Issue actions
            'CREATE_ISSUE',
            'UPDATE_ISSUE',
            'DELETE_ISSUE',
            'RESOLVE_ISSUE',
            'ASSIGN_ISSUE',

            // System actions
            'SYSTEM_BACKUP',
            'SYSTEM_RESTORE',
            'SYSTEM_CONFIGURATION_CHANGE',
            'SYSTEM_MAINTENANCE',

            // Notification actions
            'CREATE_NOTIFICATION',
            'SEND_NOTIFICATION',
            'MARK_NOTIFICATION_READ',
            'BULK_NOTIFICATION_OPERATION',

            // Data export/import
            'EXPORT_DATA',
            'IMPORT_DATA',
            'BULK_OPERATION',

            // Security events
            'SECURITY_VIOLATION',
            'UNAUTHORIZED_ACCESS_ATTEMPT',
            'SUSPICIOUS_ACTIVITY',
            'PASSWORD_CHANGE',
            'TWO_FACTOR_AUTH_SETUP',

            // Other actions
            'VIEW_REPORT',
            'GENERATE_REPORT',
            'DOWNLOAD_FILE',
            'UPLOAD_FILE',
            'DELETE_FILE'
        ]
    },
    resource: {
        type: String,
        required: true,
        enum: [
            'User',
            'Project',
            'Task',
            'Material',
            'Worker',
            'Cost',
            'Payment',
            'Issue',
            'Notification',
            'System',
            'Report',
            'File',
            'Auth',
            'Security'
        ],
        index: true
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxLength: 1000
    },
    details: {
        // Store additional context-specific data
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        changes: [mongoose.Schema.Types.Mixed],
        metadata: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
        type: String,
        trim: true,
        index: true
    },
    userAgent: {
        type: String,
        trim: true
    },
    method: {
        type: String,
        trim: true,
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    },
    path: {
        type: String,
        trim: true
    },
    statusCode: {
        type: Number,
        index: true
    },
    duration: {
        type: Number, // in milliseconds
        min: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
        index: true
    },
    category: {
        type: String,
        enum: [
            'authentication',
            'authorization',
            'data_modification',
            'data_access',
            'system_operation',
            'security',
            'performance',
            'error',
            'audit'
        ],
        required: true,
        index: true
    },
    isError: {
        type: Boolean,
        default: false,
        index: true
    },
    errorMessage: {
        type: String,
        trim: true
    },
    sessionId: {
        type: String,
        trim: true,
        index: true
    },
    requestId: {
        type: String,
        trim: true,
        index: true
    },
    additionalContext: {
        // For storing any additional context that might be relevant
        queryParams: mongoose.Schema.Types.Mixed,
        requestBody: mongoose.Schema.Types.Mixed,
        responseData: mongoose.Schema.Types.Mixed,
        environment: String,
        version: String
    }
}, {
    timestamps: true, // This will add createdAt and updatedAt
    collection: 'audit_logs'
});

// Indexes for optimal query performance
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });
auditLogSchema.index({ category: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });
auditLogSchema.index({ isError: 1, timestamp: -1 });

// TTL index to automatically delete old logs (keep for 2 years)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 * 2 });

// Virtual for formatted timestamp
auditLogSchema.virtual('formattedTimestamp').get(function () {
    return this.timestamp.toISOString();
});

// Virtual for action category color (for UI display)
auditLogSchema.virtual('actionColor').get(function () {
    switch (this.severity) {
        case 'critical':
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
auditLogSchema.methods.markAsError = function (errorMessage) {
    this.isError = true;
    this.errorMessage = errorMessage;
    this.severity = this.severity === 'low' ? 'medium' : this.severity;
    return this.save();
};

auditLogSchema.methods.updateDuration = function (endTime) {
    if (endTime && this.timestamp) {
        this.duration = endTime - this.timestamp.getTime();
    }
    return this;
};

// Static methods
auditLogSchema.statics.createLog = async function (logData) {
    const log = new this(logData);
    await log.save();
    return log;
};

auditLogSchema.statics.logUserAction = async function (userId, userData, action, resource, details = {}) {
    return await this.createLog({
        userId,
        userEmail: userData.email,
        userName: userData.name,
        userRole: userData.role,
        action,
        resource,
        category: details.category || 'data_modification', // Default to data_modification
        description: this.generateDescription(action, resource, details),
        ...details
    });
};

auditLogSchema.statics.logSecurityEvent = async function (userId, userData, eventType, description, severity = 'medium') {
    return await this.createLog({
        userId,
        userEmail: userData?.email || 'system',
        userName: userData?.name || 'System',
        userRole: userData?.role || 'system',
        action: eventType,
        resource: 'Security',
        description,
        severity,
        category: 'security'
    });
};

auditLogSchema.statics.logSystemEvent = async function (eventType, description, severity = 'medium') {
    return await this.createLog({
        userId: null,
        userEmail: 'system',
        userName: 'System',
        userRole: 'system',
        action: eventType,
        resource: 'System',
        description,
        severity,
        category: 'system_operation'
    });
};

auditLogSchema.statics.getLogsByUser = async function (userId, options = {}) {
    const {
        page = 1,
        limit = 50,
        startDate = null,
        endDate = null,
        action = null,
        resource = null,
        severity = null,
        category = null,
        isError = null
    } = options;

    let query = { userId };

    if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (severity) query.severity = severity;
    if (category) query.category = category;
    if (isError !== null) query.isError = isError;

    const logs = await this.find(query)
        .sort({ timestamp: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

    const total = await this.countDocuments(query);

    return {
        logs,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
    };
};

auditLogSchema.statics.getSecurityLogs = async function (options = {}) {
    const {
        page = 1,
        limit = 50,
        startDate = null,
        endDate = null,
        severity = null,
        ipAddress = null
    } = options;

    let query = {
        category: 'security'
    };

    if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (severity) query.severity = severity;
    if (ipAddress) query.ipAddress = ipAddress;

    const logs = await this.find(query)
        .sort({ timestamp: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

    const total = await this.countDocuments(query);

    return {
        logs,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
    };
};

auditLogSchema.statics.getSystemStats = async function (timeRange = '24h') {
    const now = new Date();
    let startDate;

    switch (timeRange) {
        case '1h':
            startDate = new Date(now.getTime() - 60 * 60 * 1000);
            break;
        case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const stats = await Promise.all([
        this.countDocuments({ timestamp: { $gte: startDate } }),
        this.countDocuments({ timestamp: { $gte: startDate }, isError: true }),
        this.countDocuments({ timestamp: { $gte: startDate }, category: 'security' }),
        this.countDocuments({ timestamp: { $gte: startDate }, severity: 'critical' }),
        this.countDocuments({ timestamp: { $gte: startDate }, action: 'FAILED_LOGIN_ATTEMPT' }),
        this.countDocuments({ timestamp: { $gte: startDate }, action: 'USER_LOGIN' })
    ]);

    const topActions = await this.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);

    return {
        totalActions: stats[0],
        errors: stats[1],
        securityEvents: stats[2],
        criticalEvents: stats[3],
        failedLogins: stats[4],
        successfulLogins: stats[5],
        topActions
    };
};

auditLogSchema.statics.generateDescription = function (action, resource, details) {
    const actionDescriptions = {
        'CREATE_USER': `Created new ${resource.toLowerCase()}`,
        'UPDATE_USER': `Updated ${resource.toLowerCase()}`,
        'DELETE_USER': `Deleted ${resource.toLowerCase()}`,
        'PERMANENT_DELETE_USER': `Permanently deleted ${resource.toLowerCase()}`,
        'ACTIVATE_USER': `Activated user account`,
        'DEACTIVATE_USER': `Deactivated user account`,
        'REJECT_USER': `Rejected user registration`,
        'USER_LOGIN': `User logged in`,
        'USER_LOGOUT': `User logged out`,
        'FAILED_LOGIN_ATTEMPT': `Failed login attempt`,
        'CREATE_PROJECT': `Created new project`,
        'UPDATE_PROJECT': `Updated project`,
        'DELETE_PROJECT': `Deleted project`,
        'CREATE_TASK': `Created new task`,
        'UPDATE_TASK': `Updated task`,
        'DELETE_TASK': `Deleted task`,
        'COMPLETE_TASK': `Completed task`,
        'CREATE_COST': `Added new cost`,
        'UPDATE_COST': `Updated cost`,
        'DELETE_COST': `Deleted cost`,
        'CREATE_PAYMENT': `Added new payment`,
        'UPDATE_PAYMENT': `Updated payment`,
        'DELETE_PAYMENT': `Deleted payment`,
        'SECURITY_VIOLATION': `Security violation detected`,
        'UNAUTHORIZED_ACCESS_ATTEMPT': `Unauthorized access attempt`
    };

    return actionDescriptions[action] || `${action} on ${resource}`;
};

// Middleware to set default values
auditLogSchema.pre('save', function (next) {
    if (!this.timestamp) {
        this.timestamp = new Date();
    }
    next();
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
