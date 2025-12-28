
const express = require("express");
const router = express.Router();
const Project = require("../models/project");
const {
  protect,
  checkPermission,
  checkResourceAccess,
  auditLog
} = require("../middleware/authMiddleware");

// GET all projects
router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

// GET TOTAL PLanned BUDGET
router.get("/totalbudget", protect, async (req, res) => {
  try {
    const result = await Project.aggregate([
      {
        $match: { plannedBudget: { $regex: /^[0-9]+(\.[0-9]+)?$/ } } // only numeric strings
      },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: { $toDouble: "$plannedBudget" } }
        }
      }
    ]);

    const total = result[0]?.totalBudget || 0;
    res.json({ totalBudget: total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});




// GET total number of projects
router.get("/totalprojects", protect, async (req, res) => {
  try {
    const count = await Project.countDocuments();
    res.json({ totalProjects: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET completed projects (progress == 100)
router.get("/completed", protect, async (req, res) => {
  try {
    const count = await Project.countDocuments({ progress: 100 });
    res.json({ completedProjects: count });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch completed projects" });
  }
});

// GET ongoing projects (progress < 100)
router.get("/ongoing", protect, async (req, res) => {
  try {
    const count = await Project.countDocuments({ progress: { $lt: 100 } });
    res.json({ ongoingProjects: count });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch ongoing projects" });
  }
});


// GET single project
router.get("/:id",
  protect,
  checkResourceAccess('project'),
  async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      res.json(project);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  }
);

// POST new project
router.post("/",
  protect,
  checkPermission('create'),
  auditLog('CREATE_PROJECT', 'Project'),
  async (req, res) => {
    try {
      const newProject = new Project(req.body);
      const savedProject = await newProject.save();
      res.status(201).json(savedProject);
    } catch (err) {
      res.status(500).json({ message: "Failed to create project" });
    }
  }
);

// PUT update project
router.put("/:id",
  protect,
  checkPermission('update'),
  checkResourceAccess('project'),
  auditLog('UPDATE_PROJECT', 'Project'),
  async (req, res) => {
    try {
      const updatedProject = await Project.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.json(updatedProject);
    } catch (err) {
      res.status(500).json({ message: "Failed to update project" });
    }
  }
);

// DELETE project
router.delete("/:id",
  protect,
  checkPermission('delete'),
  auditLog('DELETE_PROJECT', 'Project'),
  async (req, res) => {
    try {
      await Project.findByIdAndDelete(req.params.id);
      res.json({ message: "Project deleted" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  }
);


module.exports = router;
