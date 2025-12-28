const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Cost = require("../models/cost");
const Project = require("../models/project"); // already added

// ------------------- EXISTING ROUTES -------------------

// GET total spent across all projects
router.get("/totalspent", async (req, res) => {
  try {
    const result = await Cost.aggregate([
      { $group: { _id: null, totalSpent: { $sum: { $toDouble: "$amount" } } } }
    ]);
    const totalSpent = result[0]?.totalSpent || 0;
    res.json({ totalSpent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch total spent" });
  }
});

// GET all costs for a project
router.get("/:projectId", async (req, res) => {
  try {
    const costs = await Cost.find({ projectId: req.params.projectId })
      .sort({ date: -1 })
      .populate("projectId");
    res.json(costs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch costs" });
  }
});

router.get("/", async (req, res) => {
  try {
    const costs = await Cost.find().populate("projectId");
    if(!costs || costs.length==0){
      return res.status(404).json({message: "No costs found"})
    }
    res.json(costs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch costs" });
  }
});

// CREATE a new cost
router.post("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { category, description, amount, status, date } = req.body;
    const newCost = new Cost({ projectId, category, description, amount, status, date });
    await newCost.save();
    res.status(201).json(newCost);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to create cost" });
  }
});

// UPDATE cost
router.put("/:id", async (req, res) => {
  try {
    const updatedCost = await Cost.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedCost) return res.status(404).json({ message: "Cost not found" });
    res.json(updatedCost);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to update cost" });
  }
});

// DELETE cost
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Cost.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Cost not found" });
    res.json({ message: "Cost deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete cost" });
  }
});

// ------------------- NEW ROUTES -------------------

// GET project budget summary (total budget, spent, remaining)
router.get("/summary/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    // Fetch project budget
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const totalBudget = parseFloat(project.budget) || 0;

    // Aggregate total spent from costs
    const result = await Cost.aggregate([
      { $match: { projectId: project._id } },
      { $group: { _id: null, totalSpent: { $sum: { $toDouble: "$amount" } } } }
    ]);

    const totalSpent = result[0]?.totalSpent || 0;
    const remaining = totalBudget - totalSpent;

    res.json({ projectId, totalBudget, totalSpent, remaining });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch project summary" });
  }
});

// NEW: GET project costs distribution by category


router.get("/distribution/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    const distribution = await Cost.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(projectId) } }, // convert to ObjectId
      { $group: { _id: "$category", value: { $sum: { $toDouble: "$amount" } } } },
      { $project: { _id: 0, category: "$_id", value: 1 } }
    ]);

    res.json(distribution);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch costs distribution" });
  }
});

module.exports = router;
