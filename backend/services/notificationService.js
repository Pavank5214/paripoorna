const Notification = require("../models/Notification");
const User = require("../models/User");

class NotificationService {
    
    /**
     * Create a notification for a specific user
     */
    static async createNotification(userId, notificationData) {
        try {
            const notification = await Notification.createNotification({
                userId,
                ...notificationData
            });
            return notification;
        } catch (error) {
            console.error("Error creating notification:", error);
            throw error;
        }
    }

    /**
     * Create notifications for multiple users
     */
    static async createBulkNotifications(userIds, notificationData) {
        try {
            const notifications = await Promise.all(
                userIds.map(userId => 
                    this.createNotification(userId, notificationData)
                )
            );
            return notifications;
        } catch (error) {
            console.error("Error creating bulk notifications:", error);
            throw error;
        }
    }

    /**
     * Send notification to all project team members
     */
    static async notifyProjectTeam(projectId, notificationData, excludeUserId = null) {
        try {
            const Project = require("../models/Project");
            const project = await Project.findById(projectId).populate('team');
            
            if (!project) {
                throw new Error("Project not found");
            }

            // Get all team member IDs
            const teamMemberIds = project.team.map(member => member._id);
            
            // Filter out excluded user if provided
            const targetUserIds = excludeUserId 
                ? teamMemberIds.filter(id => id.toString() !== excludeUserId.toString())
                : teamMemberIds;

            if (targetUserIds.length === 0) {
                return [];
            }

            return await this.createBulkNotifications(targetUserIds, {
                ...notificationData,
                relatedResource: {
                    resourceType: 'project',
                    resourceId: projectId
                },
                metadata: {
                    projectName: project.name,
                    projectId: projectId,
                    ...notificationData.metadata
                }
            });
        } catch (error) {
            console.error("Error notifying project team:", error);
            throw error;
        }
    }

    /**
     * Notify project manager about project events
     */
    static async notifyProjectManager(projectId, notificationData) {
        try {
            const Project = require("../models/Project");
            const project = await Project.findById(projectId);
            
            if (!project || !project.manager) {
                return null;
            }

            return await this.createNotification(project.manager, {
                ...notificationData,
                relatedResource: {
                    resourceType: 'project',
                    resourceId: projectId
                },
                metadata: {
                    projectName: project.name,
                    projectId: projectId,
                    ...notificationData.metadata
                }
            });
        } catch (error) {
            console.error("Error notifying project manager:", error);
            throw error;
        }
    }

    // NOTIFICATION TEMPLATES

    /**
     * Notify when a project milestone is reached
     */
    static async notifyProjectMilestone(projectId, milestoneName, completedBy) {
        return await this.notifyProjectTeam(projectId, {
            title: "Project Milestone Completed",
            message: `The milestone "${milestoneName}" has been completed in your project.`,
            type: "project_milestone",
            category: "project",
            priority: "medium",
            actionUrl: `/projects/${projectId}`
        }, completedBy);
    }

    /**
     * Notify when task is assigned
     */
    static async notifyTaskAssigned(taskId, assignedTo, assignedBy, taskTitle, projectName) {
        return await this.createNotification(assignedTo, {
            title: "New Task Assigned",
            message: `You have been assigned a new task: "${taskTitle}" in project "${projectName}".`,
            type: "task_assigned",
            category: "task",
            priority: "medium",
            actionUrl: `/tasks/${taskId}`,
            metadata: {
                taskTitle,
                taskId,
                projectName
            },
            sender: {
                userId: assignedBy._id,
                name: assignedBy.name,
                role: assignedBy.role
            }
        });
    }

    /**
     * Notify when task is overdue
     */
    static async notifyTaskOverdue(taskId, assignedTo, taskTitle, projectName, dueDate) {
        return await this.createNotification(assignedTo, {
            title: "Task Overdue",
            message: `The task "${taskTitle}" in project "${projectName}" is overdue. Due date was ${dueDate.toDateString()}.`,
            type: "task_overdue",
            category: "task",
            priority: "high",
            actionUrl: `/tasks/${taskId}`,
            actionRequired: true,
            metadata: {
                taskTitle,
                taskId,
                projectName,
                dueDate
            }
        });
    }

    /**
     * Notify when task deadline is approaching
     */
    static async notifyTaskDeadlineApproaching(taskId, assignedTo, taskTitle, projectName, dueDate, hoursRemaining) {
        return await this.createNotification(assignedTo, {
            title: "Task Deadline Approaching",
            message: `The task "${taskTitle}" in project "${projectName}" is due in ${hoursRemaining} hours.`,
            type: "deadline_approaching",
            category: "task",
            priority: "medium",
            actionUrl: `/tasks/${taskId}`,
            metadata: {
                taskTitle,
                taskId,
                projectName,
                dueDate,
                hoursRemaining
            }
        });
    }

    /**
     * Notify when budget threshold is exceeded
     */
    static async notifyBudgetExceeded(projectId, budgetAmount, currentAmount, exceededBy, notifiedBy) {
        return await this.notifyProjectManager(projectId, {
            title: "Budget Exceeded",
            message: `Project budget has been exceeded by ₹${exceededBy.toLocaleString()}. Budget: ₹${budgetAmount.toLocaleString()}, Current: ₹${currentAmount.toLocaleString()}.`,
            type: "budget_warning",
            category: "financial",
            priority: "high",
            actionRequired: true,
            actionUrl: `/projects/${projectId}/costs`,
            metadata: {
                budgetAmount,
                currentAmount,
                exceededBy
            }
        });
    }

    /**
     * Notify when cost exceeds certain percentage of budget
     */
    static async notifyBudgetThreshold(projectId, budgetAmount, currentAmount, thresholdPercentage, notifiedBy) {
        return await this.notifyProjectTeam(projectId, {
            title: "Budget Threshold Warning",
            message: `Project costs have reached ${thresholdPercentage}% of the budget. Current spending: ₹${currentAmount.toLocaleString()} out of ₹${budgetAmount.toLocaleString()}.`,
            type: "budget_warning",
            category: "financial",
            priority: "medium",
            actionUrl: `/projects/${projectId}/costs`,
            metadata: {
                budgetAmount,
                currentAmount,
                thresholdPercentage
            }
        }, notifiedBy);
    }

    /**
     * Notify when user role is changed
     */
    static async notifyRoleChange(userId, oldRole, newRole, changedBy) {
        return await this.createNotification(userId, {
            title: "Role Changed",
            message: `Your role has been changed from "${oldRole}" to "${newRole}" by ${changedBy.name}.`,
            type: "user_role_changed",
            category: "user",
            priority: "medium",
            metadata: {
                oldRole,
                newRole
            },
            sender: {
                userId: changedBy._id,
                name: changedBy.name,
                role: changedBy.role
            }
        });
    }

    /**
     * Notify when issue is assigned
     */
    static async notifyIssueAssigned(issueId, assignedTo, assignedBy, issueTitle, projectName) {
        return await this.createNotification(assignedTo, {
            title: "Issue Assigned",
            message: `You have been assigned to resolve the issue: "${issueTitle}" in project "${projectName}".`,
            type: "issue_assigned",
            category: "project",
            priority: "medium",
            actionUrl: `/issues/${issueId}`,
            metadata: {
                issueTitle,
                issueId,
                projectName
            },
            sender: {
                userId: assignedBy._id,
                name: assignedBy.name,
                role: assignedBy.role
            }
        });
    }

    /**
     * Notify when material stock is low
     */
    static async notifyLowMaterialStock(projectId, materialName, currentStock, minimumStock, projectManagerId) {
        return await this.createNotification(projectManagerId, {
            title: "Low Material Stock",
            message: `Material "${materialName}" stock is running low. Current: ${currentStock}, Minimum required: ${minimumStock}.`,
            type: "material_low_stock",
            category: "project",
            priority: "medium",
            actionUrl: `/projects/${projectId}/materials`,
            metadata: {
                materialName,
                currentStock,
                minimumStock
            }
        });
    }

    /**
     * Notify when payment is received
     */
    static async notifyPaymentReceived(projectId, amount, paymentMethod, receivedBy) {
        return await this.notifyProjectManager(projectId, {
            title: "Payment Received",
            message: `Payment of ₹${amount.toLocaleString()} has been received via ${paymentMethod}.`,
            type: "payment_received",
            category: "financial",
            priority: "low",
            actionUrl: `/projects/${projectId}/payments`,
            metadata: {
                amount,
                paymentMethod
            },
            sender: {
                userId: receivedBy._id,
                name: receivedBy.name,
                role: receivedBy.role
            }
        });
    }

    /**
     * Notify system maintenance
     */
    static async notifySystemMaintenance(maintenanceDate, duration, description) {
        // Get all active users
        const activeUsers = await User.find({ isActive: true }).select('_id');
        const userIds = activeUsers.map(user => user._id);

        return await this.createBulkNotifications(userIds, {
            title: "Scheduled System Maintenance",
            message: `System maintenance is scheduled for ${maintenanceDate.toDateString()} from ${maintenanceDate.toLocaleTimeString()} for approximately ${duration} hours. ${description}`,
            type: "system_maintenance",
            category: "system",
            priority: "medium",
            deliveryMethods: {
                inApp: true,
                email: true,
                push: true,
                sms: false
            }
        });
    }

    /**
     * Notify security alert
     */
    static async notifySecurityAlert(userId, alertType, description, severity = 'medium') {
        return await this.createNotification(userId, {
            title: "Security Alert",
            message: description,
            type: "security_alert",
            category: "system",
            priority: severity,
            actionRequired: true,
            deliveryMethods: {
                inApp: true,
                email: true,
                push: severity === 'high' || severity === 'urgent',
                sms: severity === 'urgent'
            },
            metadata: {
                alertType,
                description,
                severity
            }
        });
    }

    /**
     * Utility method to check if user should receive notifications of certain type
     */
    static async shouldNotifyUser(userId, notificationType) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.isActive) {
                return false;
            }

            const preferences = user.preferences?.notifications || {};
            
            switch (notificationType) {
                case 'email':
                    return preferences.email !== false;
                case 'sms':
                    return preferences.sms === true;
                case 'push':
                    return preferences.push !== false;
                case 'inApp':
                default:
                    return true;
            }
        } catch (error) {
            console.error("Error checking user notification preferences:", error);
            return true; // Default to sending notification
        }
    }

    /**
     * Schedule notification for future delivery
     */
    static async scheduleNotification(userId, notificationData, scheduleTime) {
        // This would integrate with a job queue system like Bull or Agenda
        // For now, we'll use setTimeout for simple scheduling
        const delay = scheduleTime.getTime() - Date.now();
        
        if (delay > 0) {
            setTimeout(async () => {
                try {
                    await this.createNotification(userId, notificationData);
                } catch (error) {
                    console.error("Error sending scheduled notification:", error);
                }
            }, delay);
        }
    }
}

module.exports = NotificationService;
