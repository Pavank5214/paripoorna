const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.user.id).select("-password");

            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            if (!user.isActive) {
                return res.status(401).json({ message: "Account is deactivated" });
            }

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            req.user = user;
            next();
        } catch (error) {
            console.error("Token verification failed", error);
            return res.status(401).json({ message: "Not authorized - token verification failed" })
        }
    } else {
        return res.status(401).json({ message: "Not authorized - no token provided" });
    }
};

// Check if user has required role
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied - insufficient role privileges",
                requiredRoles: allowedRoles,
                userRole: req.user.role
            });
        }

        next();
    };
};

// Check if user has required permission
const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        if (!req.user.hasPermission(permission)) {
            return res.status(403).json({
                message: "Access denied - insufficient permissions",
                requiredPermission: permission,
                userPermissions: req.user.effectivePermissions
            });
        }

        next();
    };
};

// Check if user has required role hierarchy level
const checkRoleLevel = (requiredLevel) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        if (!req.user.hasRoleLevel(requiredLevel)) {
            return res.status(403).json({
                message: "Access denied - insufficient role hierarchy level",
                requiredLevel: requiredLevel,
                userRoleLevel: req.user.roleLevel,
                userRole: req.user.role
            });
        }

        next();
    };
};

// Check if user can manage another user
const checkUserManagement = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const targetUserId = req.params.userId || req.body.userId || req.query.userId;

    if (!targetUserId) {
        return res.status(400).json({ message: "Target user ID is required" });
    }

    User.findById(targetUserId).then(targetUser => {
        if (!targetUser) {
            return res.status(404).json({ message: "Target user not found" });
        }

        if (!req.user.canManageUser(targetUser)) {
            return res.status(403).json({
                message: "Access denied - you cannot manage this user",
                userRole: req.user.role,
                targetUserRole: targetUser.role
            });
        }

        req.targetUser = targetUser;
        next();
    }).catch(error => {
        console.error("User management check error:", error);
        res.status(500).json({ message: "Server error during user management check" });
    });
};

// Check if user can access specific resource (project-based access control)
const checkResourceAccess = (resourceType, resourceIdParam = 'id') => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        // Super admin and admin can access all resources
        if (['super_admin', 'admin'].includes(req.user.role)) {
            return next();
        }

        const resourceId = req.params[resourceIdParam] || req.body[resourceIdParam];

        if (!resourceId) {
            return res.status(400).json({ message: "Resource ID is required" });
        }

        try {
            // Check if user is assigned to the resource
            if (resourceType === 'project') {
                const Project = require('../models/Project');
                const project = await Project.findById(resourceId);

                if (!project) {
                    return res.status(404).json({ message: "Project not found" });
                }

                // Check if user is assigned to this project or is the project manager
                const isAssigned = req.user.assignedProjects.some(
                    projId => projId.toString() === resourceId
                ) || project.manager && project.manager.toString() === req.user._id.toString();

                if (!isAssigned) {
                    return res.status(403).json({
                        message: "Access denied - you are not assigned to this project"
                    });
                }
            }

            next();
        } catch (error) {
            console.error("Resource access check error:", error);
            res.status(500).json({ message: "Server error during resource access check" });
        }
    };
};

// Audit middleware to log user actions
const auditLog = (action, resource) => {
    return (req, res, next) => {
        const startTime = Date.now();

        // Hook into response finish to log the result
        res.on('finish', async () => {
            try {
                // Skip logging for GET requests unless explicitly configured?
                // For now log all audited actions specified in routes

                if (req.user) {
                    await AuditLog.logUserAction(
                        req.user._id,
                        req.user,
                        action,
                        resource,
                        {
                            method: req.method,
                            path: req.originalUrl,
                            statusCode: res.statusCode,
                            ipAddress: req.ip,
                            userAgent: req.get('User-Agent'),
                            isError: res.statusCode >= 400
                        }
                    );
                }
            } catch (error) {
                console.error("Audit logging failed:", error);
                // Don't crash the request if logging fails
            }
        });

        next();
    };
};

module.exports = {
    protect,
    checkRole,
    checkPermission,
    checkRoleLevel,
    checkUserManagement,
    checkResourceAccess,
    auditLog
};
