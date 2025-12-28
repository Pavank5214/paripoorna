
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define user roles hierarchy
const USER_ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    PROJECT_MANAGER: 'project_manager',
    SITE_SUPERVISOR: 'site_supervisor',
    ACCOUNTANT: 'accountant',
    WORKER: 'worker',
    CLIENT: 'client',
    DEVELOPER: 'developer'
};

// Define permissions for each resource
const PERMISSIONS = {
    // Project permissions
    PROJECTS: ['create', 'read', 'update', 'delete', 'assign'],
    // User permissions
    USERS: ['create', 'read', 'update', 'delete', 'manage_roles'],
    // Financial permissions
    FINANCIAL: ['view', 'edit', 'approve', 'report'],
    // Task permissions
    TASKS: ['create', 'assign', 'update_status', 'complete'],
    // Material permissions
    MATERIALS: ['create', 'read', 'update', 'delete', 'manage_inventory'],
    // Worker permissions
    WORKERS: ['create', 'read', 'update', 'delete', 'assign'],
    // Reports permissions
    REPORTS: ['view', 'generate', 'export'],
    // System permissions
    SYSTEM: ['configure', 'audit', 'backup']
};

// Role hierarchy mapping
const ROLE_HIERARCHY = {
    [USER_ROLES.DEVELOPER]: 8,
    [USER_ROLES.SUPER_ADMIN]: 7,
    [USER_ROLES.ADMIN]: 6,
    [USER_ROLES.PROJECT_MANAGER]: 5,
    [USER_ROLES.SITE_SUPERVISOR]: 4,
    [USER_ROLES.ACCOUNTANT]: 3,
    [USER_ROLES.WORKER]: 2,
    [USER_ROLES.CLIENT]: 1
};

// Default permissions for each role
const ROLE_PERMISSIONS = {
    [USER_ROLES.DEVELOPER]: Object.values(PERMISSIONS).flat(),
    [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS).flat(),
    [USER_ROLES.ADMIN]: [
        ...PERMISSIONS.PROJECTS, ...PERMISSIONS.USERS, ...PERMISSIONS.FINANCIAL,
        ...PERMISSIONS.TASKS, ...PERMISSIONS.MATERIALS, ...PERMISSIONS.WORKERS,
        ...PERMISSIONS.REPORTS
    ],
    [USER_ROLES.PROJECT_MANAGER]: [
        ...PERMISSIONS.PROJECTS, ...PERMISSIONS.TASKS, ...PERMISSIONS.WORKERS,
        ...PERMISSIONS.REPORTS
    ],
    [USER_ROLES.SITE_SUPERVISOR]: [
        ...PERMISSIONS.TASKS, ...PERMISSIONS.MATERIALS, ...PERMISSIONS.REPORTS
    ],
    [USER_ROLES.ACCOUNTANT]: [
        ...PERMISSIONS.FINANCIAL, ...PERMISSIONS.REPORTS
    ],
    [USER_ROLES.WORKER]: [
        ...PERMISSIONS.TASKS
    ],
    [USER_ROLES.CLIENT]: [
        'read'
    ]
};

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/.+\@.+\..+/, "Please fill a valid email address"]
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    role: {
        type: String,
        required: true,
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.WORKER
    },
    department: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'rejected', 'suspended'],
        default: 'active'
    },
    lastLogin: {
        type: Date
    },
    avatar: {
        type: String
    },
    permissions: [{
        type: String
    }],
    assignedProjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    preferences: {
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            sms: { type: Boolean, default: false }
        },
        theme: { type: String, default: 'light' },
        language: { type: String, default: 'en' }
    }
},
    { timestamps: true });

// Virtual for role hierarchy level
userSchema.virtual('roleLevel').get(function () {
    return ROLE_HIERARCHY[this.role] || 0;
});

// Virtual for effective permissions
userSchema.virtual('effectivePermissions').get(function () {
    const rolePermissions = ROLE_PERMISSIONS[this.role] || [];
    return [...new Set([...rolePermissions, ...this.permissions])];
});

// Instance method to check if user has permission
userSchema.methods.hasPermission = function (permission) {
    return this.effectivePermissions.includes(permission);
};

// Instance method to check if user has role hierarchy level
userSchema.methods.hasRoleLevel = function (requiredLevel) {
    return this.roleLevel >= requiredLevel;
};

// Instance method to check if user can manage another user
userSchema.methods.canManageUser = function (targetUser) {
    if (this.role === USER_ROLES.SUPER_ADMIN) return true;
    if (this.role === USER_ROLES.ADMIN && targetUser.role !== USER_ROLES.SUPER_ADMIN) return true;
    return this._id.toString() === targetUser._id.toString();
};

// Pre-save middleware to set default permissions
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);

    // Set default permissions based on role if not explicitly set
    if (!this.permissions || this.permissions.length === 0) {
        this.permissions = ROLE_PERMISSIONS[this.role] || [];
    }

    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// Static methods
userSchema.statics.getRoles = function () {
    return USER_ROLES;
};

userSchema.statics.getPermissions = function () {
    return PERMISSIONS;
};

userSchema.statics.getRolePermissions = function (role) {
    return ROLE_PERMISSIONS[role] || [];
};


// Create the User model
const User = mongoose.models.User || mongoose.model("User", userSchema);

// Export the model and constants
module.exports = User;
module.exports.USER_ROLES = USER_ROLES;
module.exports.PERMISSIONS = PERMISSIONS;
module.exports.ROLE_HIERARCHY = ROLE_HIERARCHY;
module.exports.ROLE_PERMISSIONS = ROLE_PERMISSIONS;
