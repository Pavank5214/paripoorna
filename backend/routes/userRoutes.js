

const express = require("express");
const User = require("../models/User")
const { USER_ROLES } = require("../models/User")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const {
    protect,
    checkRole,
    checkPermission,
    checkUserManagement,
    checkRoleLevel,
    auditLog
} = require("../middleware/authMiddleware");

// Public routes
router.post("/register", async (req, res) => {
    return res.status(403).json({ message: "Public registration is disabled. Please contact an administrator." });
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "User not found" });

        if (user.status === 'pending') {
            return res.status(401).json({ message: "Account is pending approval. Please contact administrator." });
        }
        if (user.status === 'rejected') {
            return res.status(401).json({ message: "Account application was rejected." });
        }
        if (user.status === 'suspended' || !user.isActive) {
            return res.status(401).json({ message: "Account is deactivated/suspended. Please contact administrator." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Wrong password" });

        const payload = {
            user: {
                id: user._id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" }, (err, token) => {
            if (err) throw err;

            res.status(201).json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    isActive: user.isActive,
                    status: user.status,
                    permissions: user.effectivePermissions
                },
                token
            });
        })
    } catch (error) {
        console.error(error);
        res.status(500).send("server error");
    }
});

// Protected routes (require authentication)
router.get("/profile", protect, async (req, res) => {
    const user = req.user;
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        avatar: user.avatar,
        permissions: user.effectivePermissions,
        assignedProjects: user.assignedProjects,
        preferences: user.preferences,
        roleLevel: user.roleLevel
    });
});

router.put("/profile", protect, auditLog('UPDATE_PROFILE', 'User'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { name, department, phone, avatar, preferences } = req.body;

        if (name) user.name = name;
        if (department) user.department = department;
        if (phone) user.phone = phone;
        if (avatar) user.avatar = avatar;
        if (preferences) user.preferences = { ...user.preferences, ...preferences };

        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            phone: user.phone,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            avatar: user.avatar,
            permissions: user.effectivePermissions,
            assignedProjects: user.assignedProjects,
            preferences: user.preferences,
            roleLevel: user.roleLevel
        });

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Admin routes (require admin role or higher)
router.get("/admin/users",
    protect,
    checkRoleLevel(6), // Admin or Super Admin only
    async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';
            const role = req.query.role || '';
            const department = req.query.department || '';
            const status = req.query.status || '';

            let isActive = null;
            if (req.query.isActive === 'true') isActive = true;
            else if (req.query.isActive === 'false') isActive = false;

            // Build query
            let query = {};

            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            if (role) {
                query.role = role;
            }

            if (department) {
                query.department = department;
            }

            if (status) {
                query.status = status;
            } else if (isActive !== null) {
                // Fallback to isActive if status is not provided
                query.isActive = isActive;
            }

            // If checking for pending, we don't care about isActive as much, but status='pending' implies isActive=false usually.

            const users = await User.find(query)
                .select('-password')
                .populate('assignedProjects', 'name status')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);
            /* ... (existing code) ... */

            router.put("/admin/users/:userId/activate",
                protect,
                checkRoleLevel(6), // Admin or Super Admin only
                checkPermission('update'),
                checkUserManagement,
                auditLog('ACTIVATE_USER', 'User'),
                async (req, res) => {
                    try {
                        const targetUser = req.targetUser;
                        targetUser.isActive = true;
                        targetUser.status = 'active'; // Set status to active
                        await targetUser.save();

                        res.json({
                            message: "User activated successfully",
                            user: {
                                _id: targetUser._id,
                                name: targetUser.name,
                                email: targetUser.email,
                                isActive: targetUser.isActive,
                                status: targetUser.status
                            }
                        });

                    } catch (error) {
                        console.error("Error activating user:", error);
                        res.status(500).json({ message: "Server error" });
                    }
                }
            );

            router.put("/admin/users/:userId/reject",
                protect,
                checkRoleLevel(6), // Admin or Super Admin only
                checkPermission('update'),
                checkUserManagement,
                auditLog('REJECT_USER', 'User'),
                async (req, res) => {
                    try {
                        const targetUser = req.targetUser;
                        targetUser.isActive = false;
                        targetUser.status = 'rejected';
                        await targetUser.save();

                        res.json({
                            message: "User rejected successfully",
                            user: {
                                _id: targetUser._id,
                                name: targetUser.name,
                                email: targetUser.email,
                                isActive: targetUser.isActive,
                                status: targetUser.status
                            }
                        });

                    } catch (error) {
                        console.error("Error rejecting user:", error);
                        res.status(500).json({ message: "Server error" });
                    }
                }
            );

            const total = await User.countDocuments(query);

            res.json({
                users,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                totalUsers: total
            });
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.post("/admin/users",
    protect,
    checkRoleLevel(6), // Admin or Super Admin only
    checkPermission('create'),
    auditLog('CREATE_USER', 'User'),
    async (req, res) => {
        try {
            const { name, email, password, role, department, phone, isActive = true } = req.body;

            // Validate role
            if (!Object.values(USER_ROLES).includes(role)) {
                return res.status(400).json({ message: "Invalid role" });
            }

            // Check if user already exists
            let existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "User with this email already exists" });
            }

            const user = new User({
                name,
                email,
                password,
                role,
                department,
                phone,
                isActive
            });

            await user.save();

            res.status(201).json({
                message: "User created successfully",
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    isActive: user.isActive,
                    createdAt: user.createdAt
                }
            });

        } catch (error) {
            console.error("Error creating user:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.put("/admin/users/:userId",
    protect,
    checkRoleLevel(6), // Admin or Super Admin only
    checkPermission('update'),
    checkUserManagement,
    auditLog('UPDATE_USER', 'User'),
    async (req, res) => {
        try {
            const { name, email, role, department, phone, isActive, permissions } = req.body;
            const targetUser = req.targetUser;

            // Update fields
            if (name) targetUser.name = name;
            if (email) targetUser.email = email;
            if (role && Object.values(USER_ROLES).includes(role)) {
                targetUser.role = role;
            }
            if (department) targetUser.department = department;
            if (phone) targetUser.phone = phone;
            if (isActive !== undefined) targetUser.isActive = isActive;
            if (permissions && Array.isArray(permissions)) {
                targetUser.permissions = permissions;
            }

            await targetUser.save();

            res.json({
                message: "User updated successfully",
                user: {
                    _id: targetUser._id,
                    name: targetUser.name,
                    email: targetUser.email,
                    role: targetUser.role,
                    department: targetUser.department,
                    isActive: targetUser.isActive,
                    permissions: targetUser.effectivePermissions
                }
            });

        } catch (error) {
            console.error("Error updating user:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.delete("/admin/users/:userId",
    protect,
    checkRoleLevel(6), // Admin or Super Admin only
    checkPermission('delete'),
    checkUserManagement,
    auditLog('DELETE_USER', 'User'),
    async (req, res) => {
        try {
            const targetUser = req.targetUser;

            // Soft delete by deactivating user
            targetUser.isActive = false;
            await targetUser.save();

            res.json({
                message: "User deactivated successfully",
                userId: targetUser._id
            });

        } catch (error) {
            console.error("Error deactivating user:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.delete("/admin/users/:userId/permanent",
    protect,
    checkRoleLevel(6), // Admin or Super Admin only
    checkPermission('delete'),
    checkUserManagement,
    auditLog('PERMANENT_DELETE_USER', 'User'),
    async (req, res) => {
        try {
            const targetUser = req.targetUser;

            await User.deleteOne({ _id: targetUser._id });

            res.json({
                message: "User deleted permanently",
                userId: targetUser._id
            });

        } catch (error) {
            console.error("Error deleting user:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.put("/admin/users/:userId/role",
    protect,
    checkRoleLevel(6), // Admin or Super Admin only
    checkPermission('manage_roles'),
    checkUserManagement,
    auditLog('CHANGE_USER_ROLE', 'User'),
    async (req, res) => {
        try {
            const { role } = req.body;
            const targetUser = req.targetUser;

            if (!Object.values(USER_ROLES).includes(role)) {
                return res.status(400).json({ message: "Invalid role" });
            }

            targetUser.role = role;
            await targetUser.save();

            res.json({
                message: "User role updated successfully",
                user: {
                    _id: targetUser._id,
                    name: targetUser.name,
                    email: targetUser.email,
                    role: targetUser.role,
                    permissions: targetUser.effectivePermissions
                }
            });

        } catch (error) {
            console.error("Error changing user role:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.put("/admin/users/:userId/activate",
    protect,
    checkRoleLevel(6), // Admin or Super Admin only
    checkPermission('update'),
    checkUserManagement,
    auditLog('ACTIVATE_USER', 'User'),
    async (req, res) => {
        try {
            const targetUser = req.targetUser;
            targetUser.isActive = true;
            await targetUser.save();

            res.json({
                message: "User activated successfully",
                user: {
                    _id: targetUser._id,
                    name: targetUser.name,
                    email: targetUser.email,
                    isActive: targetUser.isActive
                }
            });

        } catch (error) {
            console.error("Error activating user:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.post("/admin/users/:userId/reset-password",
    protect,
    checkRoleLevel(6), // Admin or Super Admin only
    checkPermission('update'),
    checkUserManagement,
    auditLog('RESET_USER_PASSWORD', 'User'),
    async (req, res) => {
        try {
            const { newPassword } = req.body;
            const targetUser = req.targetUser;

            if (!newPassword || newPassword.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters long" });
            }

            targetUser.password = newPassword;
            await targetUser.save();

            res.json({
                message: "User password reset successfully"
            });

        } catch (error) {
            console.error("Error resetting password:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Get available roles and their permissions
router.get("/admin/roles",
    protect,
    checkRoleLevel(6), // Admin or Super Admin only
    async (req, res) => {
        try {
            const roles = {
                [USER_ROLES.SUPER_ADMIN]: {
                    name: "Super Admin",
                    description: "Full system access",
                    permissions: User.getRolePermissions(USER_ROLES.SUPER_ADMIN)
                },
                [USER_ROLES.ADMIN]: {
                    name: "Admin",
                    description: "Can manage most system features",
                    permissions: User.getRolePermissions(USER_ROLES.ADMIN)
                },
                [USER_ROLES.PROJECT_MANAGER]: {
                    name: "Project Manager",
                    description: "Manages projects and teams",
                    permissions: User.getRolePermissions(USER_ROLES.PROJECT_MANAGER)
                },
                [USER_ROLES.SITE_SUPERVISOR]: {
                    name: "Site Supervisor",
                    description: "Oversees daily operations",
                    permissions: User.getRolePermissions(USER_ROLES.SITE_SUPERVISOR)
                },
                [USER_ROLES.ACCOUNTANT]: {
                    name: "Accountant",
                    description: "Manages financial data",
                    permissions: User.getRolePermissions(USER_ROLES.ACCOUNTANT)
                },
                [USER_ROLES.WORKER]: {
                    name: "Worker",
                    description: "Basic worker access",
                    permissions: User.getRolePermissions(USER_ROLES.WORKER)
                },
                [USER_ROLES.CLIENT]: {
                    name: "Client",
                    description: "Client access to project status",
                    permissions: User.getRolePermissions(USER_ROLES.CLIENT)
                }
            };

            res.json({
                roles,
                permissions: User.getPermissions()
            });

        } catch (error) {
            console.error("Error fetching roles:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Get user statistics for admin dashboard
router.get("/admin/stats",
    protect,
    checkRoleLevel(6), // Admin or Super Admin only
    async (req, res) => {
        try {
            const stats = await Promise.all([
                User.countDocuments({}),
                User.countDocuments({ isActive: true }),
                User.countDocuments({ isActive: false }),
                User.countDocuments({ role: USER_ROLES.ADMIN }),
                User.countDocuments({ role: USER_ROLES.PROJECT_MANAGER }),
                User.countDocuments({ role: USER_ROLES.WORKER }),
                User.countDocuments({ role: USER_ROLES.CLIENT }),
                User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }), // Last 7 days
                User.countDocuments({ role: USER_ROLES.SUPER_ADMIN })
            ]);

            res.json({
                totalUsers: stats[0],
                activeUsers: stats[1],
                inactiveUsers: stats[2],
                adminUsers: stats[3],
                projectManagers: stats[4],
                workers: stats[5],
                clients: stats[6],
                recentLogins: stats[7],
                superAdminUsers: stats[8]
            });

        } catch (error) {
            console.error("Error fetching user stats:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);


// Export audit logs as CSV
router.get("/admin/audit-logs/export",
    protect,
    checkRoleLevel(6), // Admin or Super Admin only
    async (req, res) => {
        try {
            const AuditLog = require("../models/AuditLog");
            const logs = await AuditLog.find({}).sort({ timestamp: -1 }).populate('userId', 'name email role');

            // Convert to CSV
            const fields = ['Timestamp', 'User', 'Role', 'Action', 'Resource', 'Description', 'Status', 'IP Address'];
            const csvRows = [fields.join(',')];

            logs.forEach(log => {
                const row = [
                    new Date(log.timestamp).toISOString(),
                    log.userName || 'System',
                    log.userRole || 'N/A',
                    log.action,
                    log.resource,
                    `"${log.description.replace(/"/g, '""')}"`, // Escape quotes
                    log.isError ? 'Failed' : 'Success',
                    log.ipAddress || 'N/A'
                ];
                csvRows.push(row.join(','));
            });

            const csvString = csvRows.join('\n');

            res.header('Content-Type', 'text/csv');
            res.attachment('system_audit_logs.csv');
            res.send(csvString);

        } catch (error) {
            console.error("Error exporting audit logs:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Clear all audit logs
router.delete("/admin/audit-logs",
    protect,
    checkRoleLevel(7), // Super Admin only (level 7) for safety? Or 6 (Admin)? Let's stick to 6 but maybe restrict. User said "clear... not working", implying they expect it.
    checkRoleLevel(6),
    auditLog('BULK_OPERATION', 'System'), // Log this action!
    async (req, res) => {
        try {
            const AuditLog = require("../models/AuditLog");
            await AuditLog.deleteMany({});

            res.json({ message: "All audit logs have been cleared successfully." });
        } catch (error) {
            console.error("Error clearing audit logs:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Get all system audit logs (admin only)
router.get("/admin/audit-logs",
    protect,
    checkRoleLevel(6), // Admin or Super Admin only
    async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const action = req.query.action || null;
            const resource = req.query.resource || null;
            const userId = req.query.userId || null;

            const AuditLog = require("../models/AuditLog"); // Import dynamically to avoid circular deps if any

            let query = {};
            if (action) query.action = action;
            if (resource) query.resource = resource;
            if (userId) query.userId = userId;

            const logs = await AuditLog.find(query)
                .sort({ timestamp: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .populate('userId', 'name email role');

            const total = await AuditLog.countDocuments(query);

            res.json({
                logs,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                totalLogs: total
            });

        } catch (error) {
            console.error("Error fetching audit logs:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

module.exports = router;

