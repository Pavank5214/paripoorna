const express = require("express");
const Task = require("../models/task");
const Project = require("../models/project"); // Require Project model
const router = express.Router();

// Helper to update project progress
const updateProjectProgress = async (projectId) => {
    try {
        const tasks = await Task.find({ projectId });
        if (tasks.length === 0) {
            await Project.findByIdAndUpdate(projectId, { progress: 0 });
            return;
        }

        // Calculate progress based on 'Completed' status
        // Case insensitive check just in case
        const completedTasks = tasks.filter(t => t.status && t.status.toLowerCase() === 'completed').length;
        const progress = Math.round((completedTasks / tasks.length) * 100);

        await Project.findByIdAndUpdate(projectId, { progress });
    } catch (err) {
        console.error("Error updating project progress:", err);
    }
};

// CREATE Task
router.post("/:projectId", async (req, res) => {
    try {
        const { projectId } = req.params;
        const { taskName, status, description, priority, dueDate, assignedTo } = req.body;

        if (!taskName) {
            return res.status(400).json({ message: "Task name is required" });
        }

        const task = new Task({
            projectId,
            taskName,
            status: status || 'Pending',
            description,
            priority: priority || 'Medium',
            dueDate,
            assignedTo: assignedTo || undefined
        });

        const addedTask = await task.save();

        // Populate assignedTo for the response
        await addedTask.populate('assignedTo', 'name role');

        // Update Project Progress
        await updateProjectProgress(projectId);

        res.status(201).json(addedTask);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
});

// GET ALL Tasks (for Main Tasks Page)
router.get("/", async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate("projectId", "name")
            .populate("assignedTo", "name role");
        res.json(tasks);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
});

// GET Tasks by Project ID
router.get("/:projectId", async (req, res) => {
    try {
        const tasks = await Task.find({ projectId: req.params.projectId })
            .populate("projectId", "name")
            .populate("assignedTo", "name role");
        res.json(tasks);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
});

// GET Single Task
router.get("/task/:id", async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate("assignedTo", "name role");
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json(task);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
});

// UPDATE Task
router.put("/:id", async (req, res) => {
    try {
        const { taskName, status, description, priority, dueDate, assignedTo } = req.body;

        // Find and update
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            {
                taskName,
                status,
                description,
                priority,
                dueDate,
                assignedTo: assignedTo || null // Allow clearing assignment
            },
            { new: true } // Return updated doc
        ).populate("assignedTo", "name role");

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Update Project Progress
        if (updatedTask.projectId) {
            await updateProjectProgress(updatedTask.projectId);
        }

        res.json(updatedTask);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
});


// DELETE Task
router.delete("/:id", async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const projectId = task.projectId;
        await Task.findByIdAndDelete(req.params.id);

        // Update Project Progress
        if (projectId) {
            await updateProjectProgress(projectId);
        }

        res.json({ message: "Task Deleted" })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
})

module.exports = router;