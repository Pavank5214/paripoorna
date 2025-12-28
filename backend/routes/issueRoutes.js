const express = require("express");
const Issue = require("../models/issue");
const router = express.Router();

// Create a new issue
router.post("/:projectId", async (req, res) => {
  try {
    const {projectId} = req.params;
    const { issue, status } = req.body;

    if (!issue || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newIssue = new Issue({projectId, issue, status });
    const createdIssue = await newIssue.save();
    res.status(201).json(createdIssue);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all issues
router.get("/:projectId", async (req, res) => {
  try {
    const issues = await Issue.find({projectId:req.params.projectId}).populate("projectId");
    res.json(issues);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Update an issue
router.put("/:id", async (req, res) => {
  try {
    const { issue, status } = req.body;
    const existingIssue = await Issue.findById(req.params.id);

    if (!existingIssue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    existingIssue.issue = issue || existingIssue.issue;
    existingIssue.status = status || existingIssue.status;

    const updatedIssue = await existingIssue.save();
    res.json(updatedIssue);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete an issue
router.delete("/:id", async (req, res) => {
  try {
    const existingIssue = await Issue.findById(req.params.id);
    if (!existingIssue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    await existingIssue.deleteOne();
    res.json({ message: "Issue deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
